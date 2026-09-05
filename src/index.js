function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}

function cors(response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function money(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) throw new Error("Ungültiger Betrag.");
  return n.toFixed(2);
}

async function mollie(request, env, body) {
  if (!env.MOLLIE_API_KEY) {
    return json({
      ok: false,
      error: "MOLLIE_API_KEY fehlt in Cloudflare Variables & Secrets."
    }, 500);
  }

  const amount = money(body.amount);
  const origin = new URL(request.url).origin;

  const response = await fetch("https://api.mollie.com/v2/payments", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.MOLLIE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: {
        currency: "EUR",
        value: amount
      },
      description: "X-AYAYI Bestellung",
      redirectUrl: `${origin}/order-success.html`,
      webhookUrl: `${origin}/api/mollie-webhook`,
      locale: "de_DE",
      metadata: {
        source: "x-ayayi"
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return json({
      ok: false,
      error: data?.detail || data?.title || "Mollie Fehler",
      provider: "mollie"
    }, response.status);
  }

  return json({
    ok: true,
    provider: "mollie",
    checkout_url: data?._links?.checkout?.href || null,
    payment_id: data?.id || null
  });
}

async function paypalToken(env) {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal Secrets fehlen in Cloudflare.");
  }

  const base =
    env.PAYPAL_MODE === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

  const auth = btoa(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
  );

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error_description || "PayPal Auth Fehler");
  }

  return { token: data.access_token, base };
}

async function paypal(request, env, body) {
  const { token, base } = await paypalToken(env);
  const amount = money(body.amount);
  const origin = new URL(request.url).origin;

  const response = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "EUR",
          value: amount
        }
      }],
      application_context: {
        return_url: `${origin}/order-success.html`,
        cancel_url: `${origin}/checkout.html`
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return json({
      ok: false,
      error: data?.message || "PayPal Fehler",
      provider: "paypal"
    }, response.status);
  }

  const approval = data?.links?.find(
    x => x.rel === "approve"
  )?.href;

  return json({
    ok: true,
    provider: "paypal",
    approval_url: approval || null,
    order_id: data?.id || null
  });
}

async function revolut(request, env, body) {
  if (!env.REVOLUT_SECRET_KEY) {
    return json({
      ok: false,
      error: "REVOLUT_SECRET_KEY fehlt in Cloudflare Variables & Secrets."
    }, 500);
  }

  const amount = Math.round(Number(money(body.amount)) * 100);

  const response = await fetch(
    "https://merchant.revolut.com/api/orders",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.REVOLUT_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount,
        currency: "EUR",
        description: "X-AYAYI Bestellung"
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return json({
      ok: false,
      error: data?.message || "Revolut Fehler",
      provider: "revolut"
    }, response.status);
  }

  return json({
    ok: true,
    provider: "revolut",
    checkout_url: data?.checkout_url || null,
    order_id: data?.id || null
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }

    if (
      request.method === "POST" &&
      url.pathname === "/api/checkout"
    ) {
      try {
        const body = await request.json();
        const provider = String(body.provider || "").toLowerCase();

        if (!["mollie", "bank", "paypal", "revolut"].includes(provider)) {
          return json({
            ok: false,
            error: "Zahlungsanbieter nicht unterstützt."
          }, 400);
        }

        if (provider === "mollie" || provider === "bank") {
          return cors(await mollie(request, env, body));
        }

        if (provider === "paypal") {
          return cors(await paypal(request, env, body));
        }

        if (provider === "revolut") {
          return cors(await revolut(request, env, body));
        }
      } catch (error) {
        return json({
          ok: false,
          error: error?.message || "Checkout Server Fehler"
        }, 500);
      }
    }

    if (
      request.method === "POST" &&
      url.pathname === "/api/mollie-webhook"
    ) {
      return new Response("OK", { status: 200 });
    }

    if (request.method === "POST" && url.pathname === "/api/ai") {
      try {
        if (!env.AI) {
          return json({
            ok: false,
            error: "XAYAYI AI ist noch nicht aktiviert."
          }, 503);
        }

        const body = await request.json();
        const message = String(body?.message || "").trim();

        if (!message) {
          return json({
            ok: false,
            error: "Keine Nachricht übermittelt."
          }, 400);
        }

        const response = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct-fast",
          {
            messages: [
              {
                role: "system",
                content:
                  "Du bist XAYAYI AI, der professionelle KI-Assistent von X-AYAYI und AYAYICAPTAIN. Antworte auf Deutsch, freundlich, klar und professionell. Hilf bei Marketplace, Produkten, Technik, Website, Marketing, Sicherheit und allgemeinen Fragen. Bei Finanz- oder Krypto-Themen gib keine gefährlichen oder garantierten Anlageversprechen. Behaupte niemals, eine echte Person zu sein. Wenn Informationen fehlen, sage das ehrlich."
              },
              {
                role: "user",
                content: message
              }
            ]
          }
        );

        return json({
          ok: true,
          assistant: response?.response || response?.text || "XAYAYI AI konnte gerade keine Antwort erzeugen."
        });

      } catch (error) {
        return json({
          ok: false,
          error: error?.message || "XAYAYI AI Server Fehler"
        }, 500);
      }
    }

    if (url.pathname === "/api/health") {
      return json({
        ok: true,
        service: "X-AYAYI",
        checkout: true,
        providers: ["mollie", "bank", "paypal", "revolut"]
      });
    }

    return env.ASSETS.fetch(request);
  }
};
