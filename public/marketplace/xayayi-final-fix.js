(() => {
  "use strict";

  /* =========================================================
     X-AYAYI FINAL FRONTEND FIX
     Navigation + Categories + Search + Gallery + Checkout
     ========================================================= */

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- BACK / NAVIGATION ---------- */

  window.xayayiBack = function () {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  document.addEventListener("click", e => {
    const b = e.target.closest(
      "[data-back], .back-button, .btn-back, [data-action='back']"
    );

    if (!b) return;

    e.preventDefault();
    e.stopPropagation();
    window.xayayiBack();
  }, true);

  /* ---------- CATEGORY FILTER ---------- */

  const categories = {
    elektronik: [
      "elektronik","smartphone","iphone","ipad","samsung",
      "tablet","kamera","audio","kopfhörer","headset"
    ],
    computer: [
      "computer","pc","laptop","notebook","monitor",
      "tastatur","maus","drucker","ssd","usb"
    ],
    gaming: [
      "gaming","playstation","ps5","xbox","nintendo",
      "switch","controller","gaming pc","gaming zubehör"
    ],
    mode: [
      "mode","hose","jeans","shirt","t-shirt","tshirt",
      "jacke","pullover","kleid","kleidung","hoodie"
    ],
    schuhe: [
      "schuhe","sneaker","boots","stiefel","sandalen"
    ],
    beauty: [
      "beauty","kosmetik","parfum","makeup","pflege"
    ],
    haus: [
      "haus","wohnen","küche","haushalt","möbel"
    ],
    sport: [
      "sport","fitness","gym","training"
    ],
    auto: [
      "auto","fahrzeug","autozubehör"
    ]
  };

  const normalize = value =>
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  function getProductCards() {
    const root = $("#products");
    if (!root) return [];
    return [...root.children].filter(el =>
      el.nodeType === 1 &&
      !el.classList.contains("xm-category-empty")
    );
  }

  function productText(card) {
    return normalize(
      card.innerText + " " +
      card.getAttribute("data-category") + " " +
      card.getAttribute("data-product") + " " +
      card.className
    );
  }

  function filterCategory(category) {
    const cards = getProductCards();
    const key = normalize(category);

    let shown = 0;

    cards.forEach(card => {
      let visible = true;

      if (key !== "alle" && key !== "alle kategorien") {
        const words = categories[key] || [key];
        const text = productText(card);

        visible = words.some(word =>
          text.includes(normalize(word))
        );
      }

      card.style.display = visible ? "" : "none";

      if (visible) shown++;
    });

    let empty = $("#xmCategoryEmpty");

    if (!shown && key !== "alle") {
      if (!empty) {
        empty = document.createElement("div");
        empty.id = "xmCategoryEmpty";
        empty.className = "xm-category-empty";
        empty.innerHTML = `
          <div>🔎</div>
          <strong>Keine Produkte in dieser Kategorie</strong>
          <span>Weitere Produkte werden bald hinzugefügt.</span>
        `;
        $("#products")?.appendChild(empty);
      }

      empty.style.display = "grid";
    } else if (empty) {
      empty.style.display = "none";
    }

    document.querySelectorAll(
      "[data-xm-search], [data-category], .category-card, .category"
    ).forEach(el => {
      el.classList.remove("xm-active-category");
    });

    document.querySelectorAll(
      "[data-xm-search], [data-category], .category-card, .category"
    ).forEach(el => {
      const t = normalize(el.innerText || el.dataset.category || "");
      if (
        (key === "alle" && t.includes("alle")) ||
        (key !== "alle" && t.includes(key))
      ) {
        el.classList.add("xm-active-category");
      }
    });

    const root = $("#products");

    if (root) {
      setTimeout(() => {
        root.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 50);
    }
  }

  window.XAYAYI_FILTER_CATEGORY = filterCategory;

  document.addEventListener("click", e => {
    const target = e.target.closest(
      "[data-xm-search], [data-category], .category-card, .category"
    );

    if (!target) return;

    const raw = normalize(
      target.dataset.xmSearch ||
      target.dataset.category ||
      target.innerText ||
      ""
    );

    let category = null;

    if (raw.includes("alle kategorien") || raw === "alle") {
      category = "alle";
    } else {
      for (const key of Object.keys(categories)) {
        if (raw.includes(key)) {
          category = key;
          break;
        }
      }
    }

    if (!category) return;

    e.preventDefault();
    e.stopPropagation();

    filterCategory(category);
  }, true);

  /* ---------- SEARCH ---------- */

  function search(value) {
    const q = normalize(value).trim();
    const cards = getProductCards();

    cards.forEach(card => {
      card.style.display =
        !q || productText(card).includes(q)
          ? ""
          : "none";
    });

    const empty = $("#xmCategoryEmpty");
    if (empty) empty.style.display = "none";
  }

  window.xmSearch = search;

  document.addEventListener("input", e => {
    if (!e.target.matches("#xmSearch, input[type='search']")) return;
    search(e.target.value);
  });

  /* ---------- IMAGE SAFETY ---------- */

  function fixImages() {
    $$("img").forEach(img => {
      img.loading = "lazy";
      img.decoding = "async";

      img.style.objectFit = "contain";
      img.style.objectPosition = "center center";

      img.addEventListener("error", () => {
        img.classList.add("xm-image-error");
      });
    });
  }

  fixImages();

  /* ---------- PRODUCT GALLERY ---------- */

  function buildGallery(card) {
    if (!card) return;

    const images = [];

    $$("img", card).forEach(img => {
      const src =
        img.currentSrc ||
        img.dataset.src ||
        img.dataset.img ||
        img.getAttribute("src");

      if (
        src &&
        !src.startsWith("data:") &&
        !images.includes(src)
      ) {
        images.push(src);
      }
    });

    $$("[data-img]", card).forEach(el => {
      const src = el.dataset.img;

      if (src && !images.includes(src)) {
        images.push(src);
      }
    });

    const main = $("#galleryMainImg");

    if (!main || !images.length) return;

    main.src = images[0];
    main.style.objectFit = "contain";

    const thumbs =
      $("#galleryThumbs") ||
      $(".gallery-thumbs");

    if (!thumbs) return;

    thumbs.innerHTML = "";

    images.slice(0, 5).forEach((src, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "xm-gallery-thumb" +
        (index === 0 ? " active" : "");

      const img = document.createElement("img");
      img.src = src;
      img.alt = "Produktbild " + (index + 1);
      img.loading = "lazy";

      button.appendChild(img);

      button.addEventListener("click", () => {
        main.src = src;

        thumbs
          .querySelectorAll(".xm-gallery-thumb")
          .forEach(x => x.classList.remove("active"));

        button.classList.add("active");
      });

      thumbs.appendChild(button);
    });
  }

  document.addEventListener("click", e => {
    const trigger = e.target.closest(
      "[data-buy], [data-modal-cart], [data-product], .product-card"
    );

    if (!trigger) return;

    const card =
      trigger.closest("[data-product]") ||
      trigger.closest(".product-card") ||
      trigger.closest("article");

    if (card) {
      setTimeout(() => buildGallery(card), 100);
    }
  });

  /* ---------- CHECKOUT ---------- */

  async function finalCheckout(provider) {
    const cart =
      window.cart ||
      window.xayayiCart ||
      JSON.parse(localStorage.getItem("cart") || "[]");

    const items = Array.isArray(cart) ? cart : [];

    let total = 0;

    items.forEach(item => {
      const price = Number(
        item.price ??
        item.salePrice ??
        item.amount ??
        0
      );

      const qty = Number(item.quantity ?? item.qty ?? 1);

      total += price * qty;
    });

    if (!total) {
      const totalEl =
        $("#cartTotal") ||
        document.querySelector("[data-cart-total]");

      total = Number(
        String(totalEl?.textContent || "")
          .replace(",", ".")
          .replace(/[^\d.]/g, "")
      );
    }

    if (!total || total <= 0) {
      alert("Der Warenkorb ist leer.");
      return;
    }

    const payload = {
      provider: provider,
      amount: Number(total.toFixed(2)),
      currency: "EUR",
      items: items.map(item => ({
        id: item.id || item.productId || "",
        name: item.name || item.title || "X-AYAYI Produkt",
        quantity: Number(item.quantity ?? item.qty ?? 1),
        price: Number(
          item.price ??
          item.salePrice ??
          0
        )
      })),
      returnUrl: location.origin + "/order-success.html",
      cancelUrl: location.href
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const text = await response.text();

      let data = {};

      try {
        data = JSON.parse(text || "{}");
      } catch (_) {}

      if (!response.ok) {
        throw new Error(
          `Checkout HTTP ${response.status}` +
          (data.error ? `: ${data.error}` : "")
        );
      }

      const url =
        data.checkoutUrl ||
        data.checkout_url ||
        data.approvalUrl ||
        data.approval_url ||
        data.url;

      if (!url) {
        throw new Error("Kein Checkout-Link vom Server erhalten.");
      }

      location.href = url;

    } catch (error) {
      console.error("X-AYAYI CHECKOUT:", error);

      const status =
        document.querySelector("#checkoutStatus") ||
        document.querySelector("#apiError");

      if (status) {
        status.textContent =
          "Checkout momentan nicht erreichbar. Bitte später erneut versuchen.";
      }

      alert(
        "Checkout-Fehler: " +
        error.message
      );
    }
  }

  window.xayayiFinalCheckout = finalCheckout;

  document.addEventListener("click", e => {
    const button = e.target.closest("[data-provider]");
    if (!button) return;

    const provider = normalize(
      button.dataset.provider
    );

    if (![
      "mollie",
      "bank",
      "paypal",
      "revolut"
    ].includes(provider)) return;

    e.preventDefault();
    e.stopPropagation();

    finalCheckout(provider);
  }, true);

})();
