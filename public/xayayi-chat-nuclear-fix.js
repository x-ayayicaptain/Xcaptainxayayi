(function () {
  function fixChat() {
    const selectors = [
      '#captain-ai',
      '#captain-ai-panel',
      '#captain-ai-window',
      '#captainAI',
      '.chat-window',
      '.support-chat',
      '.ai-chat',
      '.chat-container',
      '.chat-modal',
      '.chat-box',
      '[class*="chat"]',
      '[id*="chat"]'
    ];

    document.querySelectorAll(selectors.join(',')).forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width < 150 || r.height < 100) return;

      el.style.setProperty('background', '#ffffff', 'important');
      el.style.setProperty('color', '#111111', 'important');
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('filter', 'none', 'important');

      el.querySelectorAll('*').forEach(child => {
        child.style.setProperty('color', '#111111', 'important');
        child.style.setProperty('text-shadow', 'none', 'important');
        child.style.setProperty('opacity', '1', 'important');
      });
    });

    document.querySelectorAll(
      '#messages, #chatMessages, #captain-ai-messages, .messages, .chat-messages'
    ).forEach(el => {
      el.style.setProperty('background', '#ffffff', 'important');
      el.style.setProperty('color', '#111111', 'important');
    });
  }

  fixChat();
  new MutationObserver(fixChat).observe(document.body, {
    childList: true,
    subtree: true
  });

  setInterval(fixChat, 1000);
})();
