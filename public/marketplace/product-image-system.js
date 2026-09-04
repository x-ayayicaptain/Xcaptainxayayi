(() => {
  "use strict";

  /*
   X-AYAYI PRODUCT IMAGE SYSTEM

   Regel:
   Jedes Produkt besitzt ausschließlich seine eigenen Bilder.

   Erwartete Struktur:

   marketplace/product-images/
     iphone-15-plus/
       01.webp
       02.webp
       03.webp
       04.webp
       05.webp

     x-beat-portable/
       01.webp
       02.webp
       03.webp
       04.webp
       05.webp

     hose/
       01.webp
       02.webp
       03.webp
       04.webp
       05.webp

   KEINE Bilder zwischen Produkten teilen.
  */

  const MAX_IMAGES = 5;

  const IMAGE_MAP = {
    "iphone 15 plus": "iphone-15-plus",
    "apple iphone 15 plus": "iphone-15-plus",
    "x-beat portable": "x-beat-portable",
    "jbl": "jbl",
    "hose": "hose",
    "jeans": "jeans",
    "sneaker": "sneaker",
    "playstation": "playstation",
    "ps5": "ps5",
    "laptop": "laptop",
    "computer": "computer"
  };

  const normalize = value =>
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  function productName(card) {
    return normalize(
      card.dataset.productName ||
      card.dataset.product ||
      card.querySelector("h2,h3,h4,.product-title,.title")?.textContent ||
      card.innerText
    );
  }

  function findFolder(name) {
    const n = normalize(name);

    for (const [key, folder] of Object.entries(IMAGE_MAP)) {
      if (n.includes(normalize(key))) {
        return folder;
      }
    }

    return null;
  }

  function validImage(src) {
    if (!src) return false;

    const s = String(src).trim().toLowerCase();

    if (!s) return false;
    if (s.startsWith("data:")) return false;
    if (s.includes("bild 2")) return false;
    if (s.includes("placeholder")) return false;
    if (s.includes("undefined")) return false;
    if (s.includes("null")) return false;

    return /\.(jpg|jpeg|png|webp|avif)$/i.test(s);
  }

  function setProductImages(card) {
    const name = productName(card);
    const folder = findFolder(name);

    /*
      Wenn kein eindeutiger Ordner existiert,
      verwenden wir NICHT fremde Bilder.
    */

    if (!folder) return;

    const images = [];

    for (let i = 1; i <= MAX_IMAGES; i++) {
      const src =
        `marketplace/product-images/${folder}/` +
        String(i).padStart(2, "0") +
        ".webp";

      if (!images.includes(src)) {
        images.push(src);
      }
    }

    const productImages = card.querySelectorAll("img");

    productImages.forEach((img, index) => {
      if (!images[index]) {
        img.removeAttribute("src");
        img.style.display = "none";
        return;
      }

      img.src = images[index];
      img.dataset.productImage = "true";
      img.loading = "lazy";
      img.decoding = "async";
      img.style.objectFit = "contain";
      img.style.objectPosition = "center";
    });

    card.dataset.xayayiImageFolder = folder;
    card.dataset.xayayiImageCount = String(images.length);
  }

  function cleanGallery() {
    document
      .querySelectorAll("[data-gallery], .gallery, .product-gallery")
      .forEach(gallery => {

        const seen = new Set();

        gallery.querySelectorAll("img").forEach(img => {
          const src =
            img.currentSrc ||
            img.src ||
            img.dataset.img ||
            "";

          if (!validImage(src)) {
            img.remove();
            return;
          }

          if (seen.has(src)) {
            img.remove();
            return;
          }

          seen.add(src);

          img.loading = "lazy";
          img.decoding = "async";
          img.style.objectFit = "contain";
          img.style.objectPosition = "center";
        });
      });
  }

  function run() {
    document
      .querySelectorAll(
        "#products > *, .product-card, article[data-product], [data-product-id]"
      )
      .forEach(card => {
        setProductImages(card);
      });

    cleanGallery();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  window.XAYAYI_PRODUCT_IMAGE_SYSTEM = {
    run,
    maxImages: MAX_IMAGES
  };
})();
