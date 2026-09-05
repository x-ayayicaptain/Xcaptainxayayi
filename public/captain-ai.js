(function () {
  "use strict";

  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  const MAX_VIDEO_SECONDS = 60;

  const EMOJIS = [
    "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇",
    "🙂","🙃","😉","😎","🤓","🤩","🥳","😏","😭","😡",
    "🤔","🫡","🫶","❤️","🧡","💛","💚","💙","💜","🖤",
    "🤍","🤎","👍","👎","👌","✌️","🤞","🤝","🙏","💪",
    "👏","🙌","🔥","⚡","🚀","💎","⭐","🌟","💡","🧠",
    "🤖","🔐","🔑","🛡️","🔒","🔓","🛒","🛍️","💳","💰",
    "📦","🎁","📱","💻","₿","🪙","📈","📉","💵","💶"
  ];

  function addStyles() {
    if (document.querySelector("[data-captain-ai-css]")) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/captain-ai.css?v=ultimate2";
    link.dataset.captainAiCss = "1";
    document.head.appendChild(link);
  }

  function build() {
    if (document.getElementById("captainAI")) return;

    const root = document.createElement("div");
    root.id = "captainAI";

    root.innerHTML = `
      <button id="captainAIButton" type="button" aria-label="Captain AI öffnen">🤖</button>

      <section id="captainAIWindow" aria-label="X-AYAYI Captain AI">

        <header id="captainAIHeader">
          <div id="captainAITitle">⚡ X-AYAYI CAPTAIN AI</div>
          <div id="captainAIStatus">● Online · Smart Support</div>
        </header>

        <div class="captain-quick">

          <button type="button" data-q="Was ist X-AYAYI?">
            🛍️ X-AYAYI
          </button>

          <button type="button" data-q="Hilf mir beim Einkauf">
            🛒 Einkauf
          </button>

          <button type="button" data-q="Erkläre mir Krypto sicher">
            ₿ Krypto
          </button>

          <button type="button" data-q="Wie kann ich sicher bezahlen?">
            💳 Zahlung
          </button>

          <button type="button" data-q="Gib mir einen Sicherheitstipp">
            🛡️ Sicherheit
          </button>

        </div>

        <div id="captainAIMessages"></div>

        <div id="captainEmojiPanel" class="captain-emoji-panel"></div>

        <div class="captain-media-bar">

          <button
            type="button"
            class="captain-media-btn"
            id="captainEmojiBtn"
            aria-label="Emoji">
            😀
          </button>

          <button
            type="button"
            class="captain-media-btn"
            id="captainImageBtn"
            aria-label="Bild aus Galerie">
            🖼️
          </button>

          <button
            type="button"
            class="captain-media-btn"
            id="captainVideoBtn"
            aria-label="Video aus Galerie">
            🎥
          </button>

          <input
            id="captainImageInput"
            type="file"
            accept="image/*"
            hidden>

          <input
            id="captainVideoInput"
            type="file"
            accept="video/*"
            hidden>

        </div>

        <div id="captainAIFormAttachment"></div>

        <form id="captainAIForm">

          <input
            id="captainAIInput"
            type="text"
            autocomplete="off"
            maxlength="4000"
            placeholder="Frag Captain AI etwas...">

          <button id="captainAISend" type="submit">➤</button>

        </form>

      </section>
    `;

    document.body.appendChild(root);

    const win = document.getElementById("captainAIWindow");
    const messages = document.getElementById("captainAIMessages");
    const input = document.getElementById("captainAIInput");
    const emojiPanel = document.getElementById("captainEmojiPanel");
    const imageInput = document.getElementById("captainImageInput");
    const videoInput = document.getElementById("captainVideoInput");
    const attachment = document.getElementById("captainAIFormAttachment");

    let selectedFile = null;
    let objectUrl = null;

    document.getElementById("captainAIButton").onclick = function () {
      win.classList.toggle("open");

      if (win.classList.contains("open")) {
        setTimeout(function () {
          input.focus();
        }, 100);
      }
    };

    EMOJIS.forEach(function (emoji) {

      const button = document.createElement("button");

      button.type = "button";
      button.className = "captain-emoji";
      button.textContent = emoji;

      button.onclick = function () {

        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;

        input.value =
          input.value.slice(0, start) +
          emoji +
          input.value.slice(end);

        input.focus();

        const position = start + emoji.length;

        input.setSelectionRange(position, position);
      };

      emojiPanel.appendChild(button);
    });

    document.getElementById("captainEmojiBtn").onclick = function () {
      emojiPanel.classList.toggle("open");
    };

    function addMessage(text, user) {

      const el = document.createElement("div");

      el.className =
        "captain-msg " +
        (user ? "captain-user-msg" : "captain-ai-msg");

      el.textContent = text;

      messages.appendChild(el);

      messages.scrollTop = messages.scrollHeight;
    }

    function systemMessage(text) {

      const el = document.createElement("div");

      el.className = "captain-system-msg";
      el.textContent = text;

      messages.appendChild(el);

      messages.scrollTop = messages.scrollHeight;
    }

    function clearAttachment() {

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }

      selectedFile = null;
      attachment.innerHTML = "";

      imageInput.value = "";
      videoInput.value = "";
    }

    function showAttachment(file) {

      attachment.innerHTML = "";

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }

      objectUrl = URL.createObjectURL(file);

      const box = document.createElement("div");

      box.className = "captain-attachment";

      if (file.type.startsWith("image/")) {

        const img = document.createElement("img");

        img.src = objectUrl;
        img.alt = "Bildanhang";

        box.appendChild(img);
      }

      if (file.type.startsWith("video/")) {

        const video = document.createElement("video");

        video.src = objectUrl;
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";

        box.appendChild(video);
      }

      const info = document.createElement("div");

      info.className = "captain-file-info";

      info.textContent =
        file.name +
        " · " +
        (file.size / 1024 / 1024).toFixed(1) +
        " MB";

      const remove = document.createElement("button");

      remove.type = "button";
      remove.className = "captain-remove-file";
      remove.textContent = "✕ Entfernen";
      remove.onclick = clearAttachment;

      box.appendChild(info);
      box.appendChild(remove);

      attachment.appendChild(box);
    }

    function validateImage(file) {

      if (!file) return;

      if (!file.type.startsWith("image/")) {

        systemMessage("❌ Keine gültige Bilddatei.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {

        systemMessage("❌ Bild zu groß. Maximum: 50 MB.");
        imageInput.value = "";
        return;
      }

      selectedFile = file;

      showAttachment(file);

      systemMessage("✅ Bild bereit zum Senden.");
    }

    function validateVideo(file) {

      if (!file) return;

      if (!file.type.startsWith("video/")) {

        systemMessage("❌ Keine gültige Videodatei.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {

        systemMessage("❌ Video zu groß. Maximum: 50 MB.");
        videoInput.value = "";
        return;
      }

      const checkUrl = URL.createObjectURL(file);
      const video = document.createElement("video");

      video.preload = "metadata";

      video.onloadedmetadata = function () {

        const duration = Number(video.duration);

        URL.revokeObjectURL(checkUrl);

        if (!Number.isFinite(duration)) {

          systemMessage("❌ Videolänge konnte nicht geprüft werden.");
          return;
        }

        if (duration > MAX_VIDEO_SECONDS) {

          systemMessage(
            "❌ Video zu lang. Maximum: 60 Sekunden."
          );

          videoInput.value = "";
          return;
        }

        selectedFile = file;

        showAttachment(file);

        systemMessage(
          "✅ Video akzeptiert · maximal 60 Sekunden · maximal 50 MB."
        );
      };

      video.onerror = function () {

        URL.revokeObjectURL(checkUrl);

        systemMessage(
          "❌ Video konnte nicht geprüft werden."
        );
      };

      video.src = checkUrl;
    }

    imageInput.addEventListener("change", function () {
      validateImage(imageInput.files[0]);
    });

    videoInput.addEventListener("change", function () {
      validateVideo(videoInput.files[0]);
    });

    document.getElementById("captainImageBtn").onclick = function () {
      imageInput.click();
    };

    document.getElementById("captainVideoBtn").onclick = function () {
      videoInput.click();
    };

    function answer(question) {

      const q =
        String(question || "")
          .toLowerCase()
          .trim();

      if (
        q.includes("krypto") ||
        q.includes("bitcoin") ||
        q.includes("ethereum") ||
        q.includes("blockchain") ||
        q.includes("wallet")
      ) {

        return (
          "⚡ CAPTAIN AI\n\n" +
          "Ich kann Krypto-Themen strukturiert erklären: " +
          "Blockchain, Wallets, Transaktionen, Hashing, " +
          "digitale Signaturen, Verschlüsselung und " +
          "Sicherheitsmodelle.\n\n" +
          "🛡️ Wichtig: Niemals Seed-Phrases, Private Keys " +
          "oder API-Secrets teilen."
        );
      }

      if (
        q.includes("zahlung") ||
        q.includes("paypal") ||
        q.includes("klarna") ||
        q.includes("apple pay") ||
        q.includes("google pay")
      ) {

        return (
          "💳 CAPTAIN AI\n\n" +
          "Beim X-AYAYI-Checkout können verfügbare " +
          "Zahlungsmethoden über die angebundenen Anbieter " +
          "bereitgestellt werden.\n\n" +
          "🔐 Sicherheitsprüfungen wie 3-D Secure werden " +
          "vom Zahlungsanbieter gesteuert."
        );
      }

      if (
        q.includes("einkauf") ||
        q.includes("produkt") ||
        q.includes("bestellen") ||
        q.includes("warenkorb")
      ) {

        return (
          "🛒 CAPTAIN AI\n\n" +
          "Klar. Nenne mir Produkt, Budget und gewünschte " +
          "Eigenschaften. Ich helfe dir bei der Auswahl, " +
          "beim Warenkorb und beim Checkout."
        );
      }

      if (
        q.includes("sicherheit") ||
        q.includes("security") ||
        q.includes("verschlüssel") ||
        q.includes("passwort")
      ) {

        return (
          "🛡️ CAPTAIN AI\n\n" +
          "Sicherheit zuerst:\n\n" +
          "• Keine Passwörter teilen.\n" +
          "• Keine API-Tokens veröffentlichen.\n" +
          "• Keine Seed-Phrases oder Private Keys teilen.\n" +
          "• Secrets serverseitig speichern.\n" +
          "• Sicherheitsprüfungen niemals umgehen."
        );
      }

      if (
        q.includes("x-ayayi") ||
        q.includes("website") ||
        q.includes("marketplace")
      ) {

        return (
          "⚡ X-AYAYI CAPTAIN AI\n\n" +
          "Ich unterstütze Besucher bei Produkten, " +
          "Navigation, Einkauf, Warenkorb, Checkout, " +
          "Technik und allgemeinen Supportfragen."
        );
      }

      return (
        "⚡ CAPTAIN AI\n\n" +
        "Gute Frage. Ich unterstütze dich bei X-AYAYI, " +
        "Einkauf, Technik, Sicherheit, Krypto-Grundlagen, " +
        "Zahlungen und allgemeinen Themen.\n\n" +
        "💡 Beschreibe dein Ziel möglichst konkret. " +
        "Dann bekommst du eine strukturierte Antwort " +
        "mit praktischen nächsten Schritten."
      );
    }

    document.getElementById("captainAIForm").onsubmit =
      function (event) {

        event.preventDefault();

        const text = input.value.trim();

        if (!text && !selectedFile) return;

        if (selectedFile) {

          const icon =
            selectedFile.type.startsWith("video/")
              ? "🎥"
              : "🖼️";

          addMessage(
            icon +
            " " +
            selectedFile.name +
            (text ? "\n" + text : ""),
            true
          );

        } else {

          addMessage(text, true);
        }

        const fileWasSelected = !!selectedFile;

        input.value = "";

        clearAttachment();

        setTimeout(function () {

          addMessage(
            answer(
              text ||
              (fileWasSelected
                ? "Medienanhang"
                : "")
            ),
            false
          );

        }, 350);
      };

    document
      .querySelectorAll(".captain-quick button")
      .forEach(function (button) {

        button.onclick = function () {

          const q = button.dataset.q || "";

          addMessage(q, true);

          setTimeout(function () {
            askXayayiAI(q);
          }, 250);
        };
      });

    addMessage(
      "⚡ Willkommen bei X-AYAYI CAPTAIN AI!\n\n" +
      "Dein Smart-Support-Assistent ist bereit.\n\n" +
      "😀 Emojis\n" +
      "🖼️ Bilder aus der Galerie\n" +
      "🎥 Videos bis maximal 60 Sekunden\n" +
      "📦 Maximale Dateigröße: 50 MB\n\n" +
      "Frag mich zu X-AYAYI, Einkauf, Technik, " +
      "Sicherheit, Krypto-Grundlagen oder Zahlungen.",
      false
    );
  }

  function start() {
    addStyles();

    if (document.body) {
      build();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

})();


/* XAYAYI AI — REAL ML BACKEND */
async function askXayayiAI(message) {
  const text = String(message || "").trim();
  if (!text) return;

  try {
    addMessage("🤖 XAYAYI AI denkt nach ...", false);

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        message: text
      })
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data?.error || "XAYAYI AI Server Fehler");
    }

    const reply =
      data.assistant ||
      data.response ||
      data.text ||
      "XAYAYI AI konnte gerade keine Antwort erzeugen.";

    const messages = document.getElementById("captainAIMessages");
    if (messages && messages.lastElementChild) {
      const last = messages.lastElementChild;
      if (last.textContent.includes("XAYAYI AI denkt nach")) {
        last.remove();
      }
    }

    addMessage(reply, false);

  } catch (error) {
    console.error("XAYAYI AI:", error);

    addMessage(
      "⚠️ XAYAYI AI ist momentan nicht erreichbar. Bitte versuche es gleich erneut.",
      false
    );
  }
}
