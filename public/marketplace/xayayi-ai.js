(function(){
"use strict";

function boot(){
  if(document.getElementById("xayayiAI")) return;

  const panel=document.createElement("div");
  panel.id="xayayiAI";
  panel.className="xayayi-ai-panel";
  panel.innerHTML=`
    <div class="xayayi-ai-head">
      <span>🤖 X-AYAYI AI</span>
      <button id="xaiClose">×</button>
    </div>
    <div id="xaiBody" class="xayayi-ai-body">
      <div class="xayayi-ai-msg">
        👋 Hallo! Ich bin dein X-AYAYI Support-Assistent.<br><br>
        Ich helfe dir bei Produkten, Warenkorb, Checkout,
        Bestellungen und allgemeinen Fragen.
      </div>
    </div>
    <div class="xayayi-ai-input">
      <input id="xaiInput" placeholder="Wie kann ich helfen?">
      <button id="xaiSend">Senden</button>
    </div>`;
  document.body.appendChild(panel);

  const btn=document.createElement("button");
  btn.className="xayayi-ai";
  btn.id="xaiOpen";
  btn.innerHTML="🤖";
  btn.title="X-AYAYI AI Support";
  document.body.appendChild(btn);

  const body=document.getElementById("xaiBody");
  const input=document.getElementById("xaiInput");

  function answer(q){
    q=q.toLowerCase();

    if(q.includes("zahlung")||q.includes("checkout")||q.includes("bezahlen"))
      return "💳 Beim Checkout stehen Mollie, PayPal, Revolut und Bank/SEPA zur Verfügung.";

    if(q.includes("warenkorb")||q.includes("cart"))
      return "🛒 Öffne deinen Warenkorb oben. Dort kannst du Mengen ändern und den Checkout starten.";

    if(q.includes("produkt")||q.includes("suche"))
      return "🔎 Nutze die Suchleiste oben. Du kannst nach Produktnamen und Beschreibungen suchen.";

    if(q.includes("bestellung")||q.includes("order"))
      return "📦 Für Bestellfragen brauche ich später deine Bestellnummer. Bitte niemals Passwörter oder Zahlungsdaten senden.";

    if(q.includes("zurück")||q.includes("retoure"))
      return "↩️ Bei Rückgabe- oder Widerrufsfragen findest du die entsprechenden Informationen im Bereich Widerruf.";

    return "🤝 Ich helfe dir gerne. Frag mich zum Beispiel nach Produkten, Warenkorb, Zahlung, Bestellung oder Rückgabe.";
  }

  function send(){
    const q=input.value.trim();
    if(!q)return;

    body.insertAdjacentHTML("beforeend",
      '<div class="xayayi-ai-msg user">'+
      q.replace(/[<>&]/g,m=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[m]))+
      '</div>'
    );

    setTimeout(()=>{
      body.insertAdjacentHTML("beforeend",
        '<div class="xayayi-ai-msg">'+answer(q)+'</div>'
      );
      body.scrollTop=body.scrollHeight;
    },180);

    input.value="";
  }

  btn.onclick=()=>panel.classList.toggle("open");
  document.getElementById("xaiClose").onclick=()=>panel.classList.remove("open");
  document.getElementById("xaiSend").onclick=send;
  input.addEventListener("keydown",e=>{if(e.key==="Enter")send()});
}

document.addEventListener("DOMContentLoaded",boot);
})();
