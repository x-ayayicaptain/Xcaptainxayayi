(function(){
  'use strict';
  var KEY='xayayi_consent_v1';
  function loadAds(){
    if(window.__xayayiAdsLoaded) return;
    window.__xayayiAdsLoaded=true;
    var s=document.createElement('script');
    s.async=true;
    s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6793113722437404';
    s.crossOrigin='anonymous';
    document.head.appendChild(s);
  }
  function save(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){} apply(v);}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}}
  function apply(v){if(v&&v.ads===true) loadAds();}
  function open(){
    var old=document.getElementById('xayayi-consent'); if(old) old.remove();
    var el=document.createElement('div'); el.id='xayayi-consent';
    el.innerHTML='<div class="xc-card"><div class="xc-eyebrow">DATENSCHUTZ & COOKIES</div><h2>Deine Privatsphäre zählt.</h2><p>Wir verwenden notwendige Speicherfunktionen für den Shop. Mit deiner Zustimmung können zusätzlich Google-Werbung und damit verbundene Mess- und Personalisierungsfunktionen geladen werden. Mehr Infos findest du in unserer <a href="datenschutz.html">Datenschutzerklärung</a>.</p><div class="xc-actions"><button data-xc="necessary">Nur notwendig</button><button class="primary" data-xc="all">Werbung & Messung erlauben</button></div><button class="xc-settings" data-xc="settings">Einstellungen</button></div>';
    document.body.appendChild(el);
    el.addEventListener('click',function(e){
      var b=e.target.closest('[data-xc]'); if(!b) return;
      var a=b.getAttribute('data-xc');
      if(a==='necessary') save({necessary:true,ads:false,ts:Date.now()});
      if(a==='all') save({necessary:true,ads:true,ts:Date.now()});
      if(a==='settings') showSettings(el);
      if(a!=='settings') el.remove();
    });
  }
  function showSettings(el){
    el.querySelector('.xc-card').innerHTML='<div class="xc-eyebrow">EINSTELLUNGEN</div><h2>Cookie-Auswahl</h2><p><b>Notwendig</b><br>Shop-Funktionen und deine lokale Warenkorb-Auswahl.</p><p><b>Werbung & Messung</b><br>Google AdSense kann Werbeanzeigen und Messfunktionen laden. Du kannst diese Kategorie jederzeit ändern.</p><div class="xc-actions"><button data-xc="necessary">Nur notwendig</button><button class="primary" data-xc="all">Werbung erlauben</button></div>';
  }
  window.XAYAYIConsent={open:open,save:save,read:read};
  var v=read(); if(v) apply(v); else if(location.protocol==='http:'||location.protocol==='https:') setTimeout(open,500);
  document.addEventListener('click',function(e){if(e.target.closest('[data-open-consent]')){e.preventDefault();open();}});
})();
