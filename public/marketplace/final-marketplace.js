(() => {
  "use strict";

  const productsRoot = document.querySelector("#products");
  if (!productsRoot) return;

  const cards = [...productsRoot.children];

  const normalize = s => (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const categoryMap = {
    "elektronik": ["elektronik", "smartphone", "iphone", "samsung", "tablet", "audio", "kopfhörer", "kamera"],
    "computer": ["computer", "laptop", "pc", "notebook", "monitor", "tastatur", "maus", "drucker"],
    "gaming": ["gaming", "game", "playstation", "xbox", "nintendo", "controller", "gaming pc", "gaming zubehör"],
    "mode": ["mode", "hose", "shirt", "tshirt", "jacke", "schuhe", "kleidung", "kleid"],
    "schuhe": ["schuhe", "sneaker", "stiefel", "sandalen"],
    "beauty": ["beauty", "kosmetik", "pflege", "parfum", "makeup"],
    "haus": ["haus", "küche", "wohnen", "haushalt", "möbel"],
    "sport": ["sport", "fitness", "training", "gym"],
    "auto": ["auto", "fahrzeug", "autozubehör"]
  };

  function cardText(card) {
    return normalize(card.innerText + " " + card.outerHTML);
  }

  function matchesCategory(card, category) {
    if (category === "alle") return true;

    const text = cardText(card);
    const words = categoryMap[category] || [category];

    return words.some(word => text.includes(normalize(word)));
  }

  function showCategory(category) {
    let visible = 0;

    cards.forEach(card => {
      const show = matchesCategory(card, category);
      card.style.display = show ? "" : "none";
      if (show) visible++;
    });

    let empty = productsRoot.querySelector(".xm-category-empty");

    if (!visible) {
      if (!empty) {
        empty = document.createElement("div");
        empty.className = "xm-category-empty";
        empty.innerHTML = `
          <strong>Keine Produkte gefunden</strong>
          <span>Für diese Kategorie sind aktuell keine Produkte verfügbar.</span>
        `;
        productsRoot.appendChild(empty);
      }
      empty.style.display = "grid";
    } else if (empty) {
      empty.style.display = "none";
    }

    window.scrollTo({
      top: productsRoot.getBoundingClientRect().top + window.scrollY - 90,
      behavior: "smooth"
    });
  }

  document.addEventListener("click", e => {
    const target = e.target.closest("[data-xm-search], [data-category], .category-card, .category");

    if (!target) return;

    const raw =
      target.dataset.xmSearch ||
      target.dataset.category ||
      target.getAttribute("data-category") ||
      target.innerText ||
      "";

    const value = normalize(raw);

    if (value.includes("alle kategorien") || value === "alle") {
      e.preventDefault();
      showCategory("alle");
      return;
    }

    for (const category of Object.keys(categoryMap)) {
      if (value.includes(category)) {
        e.preventDefault();
        showCategory(category);
        return;
      }
    }
  });

  // Product images: never crop the actual product.
  document.querySelectorAll("img").forEach(img => {
    img.loading = "lazy";
    img.decoding = "async";
    img.style.objectFit = "contain";
    img.style.objectPosition = "center";
  });

  // Build a 3–5 image gallery from existing product gallery data.
  document.addEventListener("click", e => {
    const button = e.target.closest("[data-modal-cart], [data-buy], [data-img]");
    if (!button) return;

    const card = button.closest("[data-product], article, .product-card, .card");
    if (!card) return;

    const images = [];

    card.querySelectorAll("img").forEach(img => {
      const src = img.currentSrc || img.src || img.dataset.img;
      if (src && !images.includes(src)) images.push(src);
    });

    card.querySelectorAll("[data-img]").forEach(el => {
      const src = el.dataset.img;
      if (src && !images.includes(src)) images.push(src);
    });

    if (images.length < 2) return;

    const gallery = document.querySelector("#galleryMainImg");
    if (!gallery) return;

    gallery.src = images[0];
    gallery.style.objectFit = "contain";

    const thumbs = document.querySelector("#galleryThumbs");
    if (thumbs) {
      thumbs.innerHTML = "";

      images.slice(0, 5).forEach((src, i) => {
        const img = document.createElement("img");
        img.src = src;
        img.loading = "lazy";
        img.style.objectFit = "contain";
        img.dataset.img = src;

        if (i === 0) img.classList.add("active");

        img.addEventListener("click", () => {
          gallery.src = src;
          thumbs.querySelectorAll("img").forEach(x => x.classList.remove("active"));
          img.classList.add("active");
        });

        thumbs.appendChild(img);
      });
    }
  });

  window.XAYAYI_FILTER_CATEGORY = showCategory;
})();
