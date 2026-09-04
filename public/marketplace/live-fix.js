(() => {
  "use strict";

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  /* =========================
     X-AYAYI LIVE SEARCH
     ========================= */

  function searchProducts(value) {
    const q = String(value || "").trim().toLowerCase();
    const root = $("#products");
    if (!root) return;

    const items = [...root.children];

    let visible = 0;

    items.forEach(item => {
      const text = (item.textContent || "").toLowerCase();
      const match = !q || text.includes(q);

      item.style.display = match ? "" : "none";

      if (match) visible++;
    });

    let empty = $("#xmSearchEmpty");

    if (!visible && q) {
      if (!empty) {
        empty = document.createElement("div");
        empty.id = "xmSearchEmpty";
        empty.className = "xm-empty";
        empty.textContent = `Keine Produkte für „${value}“ gefunden.`;
        root.parentElement.appendChild(empty);
      }
    } else if (empty) {
      empty.remove();
    }
  }

  window.xmSearch = function () {
    const input = $("#xmSearch");
    searchProducts(input ? input.value : "");
    $("#products")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  document.addEventListener("input", e => {
    if (e.target?.id === "xmSearch") {
      searchProducts(e.target.value);
    }
  });

  /* =========================
     CATEGORY FILTERS
     ========================= */

  document.addEventListener("click", e => {
    const link = e.target.closest("[data-xm-search]");

    if (!link) return;

    e.preventDefault();

    const value = link.dataset.xmSearch || "";

    const input = $("#xmSearch");

    if (input) input.value = value;

    searchProducts(value);

    $("#products")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  /* =========================
     IMAGE OPTIMIZATION
     ========================= */

  function fixImages() {
    $$("img").forEach(img => {
      img.loading = "lazy";
      img.decoding = "async";

      img.style.maxWidth = "100%";
      img.style.height = "auto";

      if (
        img.closest(".thumb") ||
        img.closest(".product") ||
        img.closest("[data-img]") ||
        img.closest("#products")
      ) {
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";
        img.style.objectPosition = "center";
        img.style.display = "block";
      }

      img.addEventListener("error", () => {
        img.style.objectFit = "contain";
      });
    });
  }

  fixImages();

  new MutationObserver(() => {
    fixImages();
  }).observe(document.body, {
    childList: true,
    subtree: true
  });

  /* =========================
     PAYMENT UI
     ========================= */

  function patchPaymentButtons() {
    $$('[data-provider=]').forEach(el => el.remove());

    const modal =
      $("#directCheckoutModal") ||
      $(".directCheckoutBox");

    if (!modal) return;

    const methods =
      modal.querySelector(".directMethods") ||
      modal.querySelector(".paymentMethods") ||
      modal;

    if (!methods) return;

    const wanted = [
      ["revolut", "🟣 Revolut"],
      ["bank", "🏦 Bank / SEPA"],
      ["mollie", "🟠 Mollie"],
      ["paypal", "🔵 PayPal"]
    ];

    wanted.forEach(([provider, label]) => {
      if (methods.querySelector(`[data-provider="${provider}"]`)) return;

      const button = document.createElement("button");

      button.type = "button";
      button.dataset.provider = provider;
      button.className = "xm-payment-button";
      button.textContent = label;

      methods.appendChild(button);
    });
  }

  patchPaymentButtons();

  new MutationObserver(() => {
    patchPaymentButtons();
  }).observe(document.body, {
    childList: true,
    subtree: true
  });

  /* =========================
     LIVE PAYMENT REQUEST
     ========================= */

  async function livePayment(provider) {
    const cartItems = [];

    $$("#cartItems [data-id], #cartItems .cartItem, #cartItems > *")
      .forEach(item => {
        cartItems.push({
          id: item.dataset?.id || null,
          name: item.dataset?.name || item.textContent?.trim() || "X-AYAYI Produkt"
        });
      });

    const totalElement =
      $("#cartTotal") ||
      $(".cartTotal");

    const totalText =
      totalElement?.textContent || "0";

    const total =
      Number(
        totalText
          .replace(/[^\d,.-]/g, "")
          .replace(/\./g, "")
          .replace(",", ".")
      ) || 0;

    if (total <= 0) {
      alert("Dein Warenkorb ist leer.");
      return;
    }

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        provider,
        amount: total.toFixed(2),
        currency: "EUR",
        items: cartItems,
        returnUrl: location.origin + "/order-success.html",
        cancelUrl: location.href
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error || `Checkout Fehler ${response.status}`
      );
    }

    if (data.checkout_url) {
      location.href = data.checkout_url;
      return;
    }

    if (data.approval_url) {
      location.href = data.approval_url;
      return;
    }

    throw new Error("Kein Checkout-Link vom Zahlungsanbieter erhalten.");
  }

  /* =========================
     PAYMENT CLICK INTERCEPT
     ========================= */

  document.addEventListener("click", async e => {
    const button = e.target.closest("[data-provider]");

    if (!button) return;

    const provider = button.dataset.provider;

    if (
      ![
        "revolut",
        "bank",
        "mollie",
        "paypal"
      ].includes(provider)
    ) {
      return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();

    button.disabled = true;

    const oldText = button.textContent;

    button.textContent = "Checkout wird erstellt …";

    try {
      await livePayment(provider);
    } catch (err) {
      console.error(err);

      alert(
        "Checkout konnte nicht gestartet werden:\n\n" +
        err.message
      );

      button.disabled = false;
      button.textContent = oldText;
    }
  }, true);

})();
