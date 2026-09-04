(() => {
  "use strict";
  let cart = JSON.parse(localStorage.getItem("xayayi_cart") || "[]");
  const euro = n => new Intl.NumberFormat("de-DE", {style:"currency", currency:"EUR"}).format(Number(n || 0));
  const byId = id => document.getElementById(id);
  const product = id => PRODUCTS_DATA.find(p => p.id === id);
  const save = () => { localStorage.setItem("xayayi_cart", JSON.stringify(cart)); renderCart(); };

  function add(id, qty=1) {
    const p = product(id); if (!p) return;
    const item = cart.find(x => x.id === id);
    if (item) item.qty += qty; else cart.push({id, qty});
    save(); openCart();
  }
  function remove(id) { cart = cart.filter(x => x.id !== id); save(); }
  function changeQty(id, delta) {
    const i = cart.find(x => x.id === id); if (!i) return;
    i.qty += delta; if (i.qty <= 0) cart = cart.filter(x => x.id !== id); save();
  }
  function renderCart() {
    let total=0,count=0;
    const html = cart.map(i => {
      const p=product(i.id); if(!p) return "";
      total += p.price*i.qty; count += i.qty;
      return `<div class="item"><div class="itemMain"><img src="${p.gallery?.[0] || p.img}" alt=""><div><b>${p.name}</b><br><span class="muted">${euro(p.price)} je Stück</span></div></div><div class="qty"><button type="button" data-qty="${p.id}" data-d="-1">−</button><b>${i.qty}</b><button type="button" data-qty="${p.id}" data-d="1">+</button><button type="button" class="remove" data-remove="${p.id}">Entfernen</button></div></div>`;
    }).join("") || '<p class="muted">Dein Warenkorb ist leer.</p>';
    byId("cartItems").innerHTML=html; byId("cartTotal").textContent=euro(total); byId("cartCount").textContent=count; byId("statCart").textContent=count;
  }
  function openCart(){ byId("cart").classList.add("open"); renderCart(); }
  function closeCart(){ byId("cart").classList.remove("open"); }

  function renderProducts(){
    byId("products").innerHTML = PRODUCTS_DATA.map(p => `<article class="card" data-product="${p.id}" tabindex="0" role="button" aria-label="Details zu ${p.name}">
      <div class="pic" style="background-image:url('${p.gallery?.[0] || p.img}')"><span class="zoom">DETAILS + GALERIE</span></div>
      <div class="cardBody"><span class="tag">${p.tag}</span><h3>${p.name}</h3><p class="desc">${p.desc}</p>
      <div class="priceRow"><span class="old">${euro(p.original)}</span><span class="price">${euro(p.price)}</span><span class="offer">−25%</span></div>
      <button class="add" type="button" data-add="${p.id}">In den Warenkorb →</button>
      <button class="buyNow" type="button" data-buy="${p.id}">⚡ Sofort kaufen</button></div></article>`).join("");
    byId("statProducts").textContent=PRODUCTS_DATA.length;
  }

  function openProduct(id){
    const p=product(id); if(!p) return;
    const imgs=(p.gallery && p.gallery.length ? p.gallery : [p.img,p.img,p.img,p.img]).slice(0,5);
    byId("productModal").innerHTML=`<div class="productModalBox"><button class="close" type="button" data-close-product>×</button><div class="gallery"><div class="galleryMain"><img id="galleryMainImg" src="${imgs[0]}" alt="${p.name}"></div><div class="thumbs">${imgs.map((u,i)=>`<button type="button" class="thumb ${i===0?'active':''}" data-img="${u}"><img src="${u}" alt="Bild ${i+1}"></button>`).join("")}</div></div><div class="productInfo"><span class="tag">${p.tag}</span><h2>${p.name}</h2><p>${p.desc}</p><div class="priceBig"><span class="old">${euro(p.original)}</span><b>${euro(p.price)}</b><span>−25%</span></div><div class="detailMeta"><span>✓ 4 Produktbilder</span><span>✓ Sichere Zahlung</span><span>✓ Sofortiger Checkout</span></div><button class="directBuy" type="button" data-modal-buy="${p.id}">⚡ JETZT KAUFEN & BEZAHLEN</button><button class="secondary" type="button" data-modal-cart="${p.id}">＋ In den Warenkorb</button></div></div>`;
    byId("productModal").classList.add("open");
  }
  function closeProduct(){ byId("productModal").classList.remove("open"); }
  function openDirectCheckout(id){
    const p=product(id); if(!p) return;
    cart=[{id,qty:1}]; save();
    byId("directCheckoutModal").innerHTML=`<div class="directCheckoutBox"><button class="close" type="button" data-close-checkout>×</button><span class="eyebrow">SECURE CHECKOUT</span><h2>Bezahlen</h2><div class="orderPreview"><img src="${p.gallery?.[0]||p.img}" alt=""><div><b>${p.name}</b><span>${euro(p.price)} · 1 Stück</span></div></div><p class="checkoutIntro">Wähle deine Zahlungsart. Danach öffnet sich der sichere Checkout des Zahlungsanbieters.</p><div class="directMethods"><button type="button" data-provider="card">💳 Kreditkarte</button><button type="button" data-provider="bank">🏦 Bank / Pay by Bank</button><button type="button" data-provider="sepa">🏦 SEPA / Banküberweisung</button><button type="button" data-provider="paypal">🅿️ PayPal</button><button type="button" data-provider="revolut">🔴 Revolut</button></div><div id="directCheckoutError" class="error"></div><small class="legalNote">Die Zahlung wird serverseitig erstellt. Kartendaten werden nicht auf X-AYAYI gespeichert.</small></div>`;
    byId("directCheckoutModal").classList.add("open");
  }
  function closeDirectCheckout(){ byId("directCheckoutModal").classList.remove("open"); }

  async function checkout(provider){
    const err=byId("apiError");
    if(!cart.length){ err.textContent="Warenkorb ist leer."; openCart(); return; }
    err.textContent="Checkout wird geöffnet …";
    const payload={provider,items:cart.map(i=>({id:i.id,qty:i.qty})),return_url:location.origin+location.pathname+"?payment=return"};
    try{
      const r=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload)});
      const raw=await r.text(); let d=null; try{d=JSON.parse(raw)}catch(e){}
      if(r.ok && d && d.checkout_url){ location.href=d.checkout_url; return; }
      err.textContent = `Checkout HTTP ${r.status}: ${(d&&d.error)||raw.slice(0,500)||"Serverantwort leer"}.\n\nWenn IONOS noch „No input file specified“/404 zeigt, muss der PHP-Dokument-Root bzw. die API-Route korrigiert werden.`;
    }catch(e){ err.textContent="Checkout nicht erreichbar. Bitte IONOS-PHP/API prüfen. Der Warenkorb bleibt erhalten."; }
  }

  function addMsg(t,user){ const d=document.createElement("div"); d.className=user?"user":"bot"; d.textContent=t; byId("messages").appendChild(d); const m=byId("messages"); m.scrollTop=m.scrollHeight; }
  function localSupport(v){
    const s=v.toLowerCase();
    if(s.includes("zahlung")||s.includes("paypal")||s.includes("mollie")||s.includes("revolut")||s.includes()) return "Für die Zahlung: Produkt öffnen → „JETZT KAUFEN & BEZAHLEN“ oder Warenkorb öffnen und Zahlungsart wählen. Der echte Zahlungsanbieter öffnet danach seinen sicheren Checkout.";
    if(s.includes("bild")||s.includes("galerie")) return "Tippe auf ein Produkt. Dort findest du eine Galerie mit 4 Bildern und den direkten Kauf-Button.";
    if(s.includes("iphone")) return "Das iPhone 15 Plus findest du im Shop. Produkt öffnen für Galerie, Details und direkten Checkout.";
    if(s.includes("mac")) return "Das MacBook Pro findest du im Shop. Produkt öffnen für Galerie, Details und direkten Checkout.";
    return "Ich helfe dir mit Produkten, Galerie, Warenkorb, Checkout und X-AYAYI Support. Du kannst ein Produkt direkt öffnen und anschließend „JETZT KAUFEN & BEZAHLEN“ wählen.";
  }
  async function sendChat(e){
    if(e) e.preventDefault();
    const input=byId("chatInput"),btn=byId("sendBtn"),status=byId("chatStatus"),v=input.value.trim(); if(!v) return;
    addMsg(v,true); input.value=""; btn.disabled=true; status.textContent="Antwort wird gesendet …";
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),9000);
    // Always provide a working answer immediately; the server AI can replace it when available.
    const localReply=localSupport(v);
    addMsg(localReply,false);
    status.textContent="X-AYAYI Support aktiv …";
    try{
      const r=await fetch("/api/chat.php",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({message:v}),signal:controller.signal});
      const raw=await r.text(); let d={}; try{d=JSON.parse(raw)}catch(e){}
      if(r.ok && d.reply){
        const bots=byId("messages").querySelectorAll(".bot");
        if(bots.length) bots[bots.length-1].textContent=d.reply;
        status.textContent="Server-Support verbunden.";
      } else { status.textContent="Lokaler X-AYAYI Support aktiv."; }
    }catch(e){ status.textContent="Lokaler X-AYAYI Support aktiv · Server-AI optional."; }
    finally{ clearTimeout(timer); btn.disabled=false; input.focus(); }
  }
  async function apiHealth(){
    try{const r=await fetch("/health.php?ts="+Date.now(),{cache:"no-store"}); const d=await r.json(); byId("statApi").textContent=d.ok?"ONLINE":"CHECK";}catch(e){byId("statApi").textContent="OFFLINE";}
  }

  document.addEventListener("click", e => {
    const addBtn=e.target.closest("[data-add]"); if(addBtn){e.stopPropagation();add(addBtn.dataset.add);return;}
    const buy=e.target.closest("[data-buy]"); if(buy){e.stopPropagation();add(buy.dataset.buy);return;}
    const card=e.target.closest(".card[data-product]"); if(card){openProduct(card.dataset.product);return;}
    const qty=e.target.closest("[data-qty]"); if(qty){changeQty(qty.dataset.qty,Number(qty.dataset.d));return;}
    const rem=e.target.closest("[data-remove]"); if(rem){remove(rem.dataset.remove);return;}
    const thumb=e.target.closest("[data-img]"); if(thumb){byId("galleryMainImg").src=thumb.dataset.img;document.querySelectorAll(".thumb").forEach(x=>x.classList.remove("active"));thumb.classList.add("active");return;}
    const mp=e.target.closest("[data-modal-buy]"); if(mp){closeProduct();openDirectCheckout(mp.dataset.modalBuy);return;}
    const mc=e.target.closest("[data-modal-cart]"); if(mc){closeProduct();add(mc.dataset.modalCart);return;}
    const provider=e.target.closest("[data-provider]"); if(provider){checkout(provider.dataset.provider);return;}
    if(e.target.closest("[data-close-product]") || e.target.id==="productModal") closeProduct();
    if(e.target.closest("[data-close-checkout]") || e.target.id==="directCheckoutModal") closeDirectCheckout();
  });
  byId("sendBtn").addEventListener("click",sendChat);
  byId("chatForm").addEventListener("submit",sendChat);
  byId("cart").addEventListener("click",e=>{if(e.target.id==="cart")closeCart();});
  window.openDirectCheckout=openDirectCheckout; window.closeDirectCheckout=closeDirectCheckout;
  window.add=add; window.openCart=openCart; window.closeCart=closeCart; window.checkout=checkout; window.sendChat=sendChat;
  renderProducts(); renderCart(); apiHealth();
})();
