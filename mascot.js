(() => {
  const quoteButton = document.getElementById('quote-read');
  const questionButton = document.getElementById('onboarding-read');
  let current = null;
  let readQuestions = false;

  function stop() {
    if (!current) return;
    const previous = current;
    current = null;
    previous.button.setAttribute('aria-pressed', 'false');
    previous.button.textContent = previous.label;
    previous.container.classList.remove('is-reading');
    window.speechSynthesis.cancel();
  }

  function read(text, button, container) {
    stop();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    utterance.voice = window.speechSynthesis.getVoices().find(voice => /^en[-_]/i.test(voice.lang)) || null;
    const entry = { button, container, utterance, label: button.textContent };
    current = entry;
    button.textContent = 'Stop reading';
    button.setAttribute('aria-pressed', 'true');
    container.classList.add('is-reading');
    const finish = () => {
      if (current !== entry) return;
      current = null;
      button.textContent = entry.label;
      button.setAttribute('aria-pressed', 'false');
      container.classList.remove('is-reading');
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
  }

  if (!('speechSynthesis' in window)) {
    quoteButton.hidden = true;
    questionButton.hidden = true;
    return;
  }
  quoteButton.addEventListener('click', () => {
    if (current?.button === quoteButton) { stop(); return; }
    read(document.getElementById('daily-quote').textContent, quoteButton, quoteButton.closest('.hero-quote'));
  });
  function readQuestion() {
    read(`${document.getElementById('onboarding-title').textContent} ${document.getElementById('onboarding-copy').textContent}`,
      questionButton, document.getElementById('onboarding-form'));
  }
  questionButton.addEventListener('click', () => {
    if (current?.button === questionButton) { readQuestions = false; stop(); return; }
    readQuestions = true;
    readQuestion();
  });
  new MutationObserver(() => {
    if (readQuestions && !document.getElementById('onboarding-view').hidden) readQuestion();
  }).observe(document.getElementById('onboarding-title'), { childList: true });
  new MutationObserver(() => {
    if (document.getElementById('onboarding-view').hidden) { readQuestions = false; stop(); }
  }).observe(document.getElementById('onboarding-view'), { attributes: true, attributeFilter: ['hidden'] });
  new MutationObserver(() => {
    if (!document.getElementById('home-page').classList.contains('is-active')) stop();
  }).observe(document.getElementById('home-page'), { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(stop).observe(document.getElementById('daily-quote'), { childList: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
})();
