(function (global) {
  'use strict';

  const DB_URL = 'https://dataluminary-default-rtdb.europe-west1.firebasedatabase.app';
  const STORAGE_KEY = 'luminary-full-exam-session-v1';
  const state = {
    mock: null,
    screen: 'closed',
    sectionIndex: 0,
    moduleId: '',
    partIndex: 0,
    questionIndex: 0,
    responses: {},
    marked: {},
    completedModules: [],
    routes: {},
    secondsRemaining: 0,
    deadline: 0,
    timerHidden: false,
    timer: null,
    audioProgress: {},
    audioStarted: {},
    audioCompleted: {},
    result: null
  };

  const $ = (id) => document.getElementById(id);
  const escapeHtml = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const safeUrl = (value, audio = false) => {
    const source = String(value || '').trim();
    if (/^https?:\/\//i.test(source)) return source;
    if (audio && /^data:audio\/(mpeg|mp3|wav|ogg|webm);base64,/i.test(source)) return source;
    if (!audio && /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(source)) return source;
    return '';
  };

  function currentSection() { return state.mock?.sections[state.sectionIndex] || null; }
  function currentModule() { return currentSection()?.modules.find((module) => module.id === state.moduleId) || null; }
  function currentParts() { return currentModule()?.parts || []; }
  function currentQuestions() { return currentParts().flatMap((part) => part.questions.map((question) => ({ ...question, _partId: part.id }))); }
  function currentQuestion() { return currentQuestions()[state.questionIndex] || null; }
  function questionPart(question) { return currentParts().find((part) => part.id === question?._partId) || currentParts()[0] || null; }
  function responseKey(question) { return `${state.moduleId}:${question.id}`; }
  function currentResponse(question = currentQuestion()) { return question ? state.responses[responseKey(question)] : undefined; }
  function sectionDeliveredItems(section) {
    if (section.id === 'writing') return section.modules.flatMap((module) => global.FullExamSchema.allQuestions(module)).length;
    if (state.mock?.exam !== 'sat' || state.mock?.deliveryMode === 'linear') return section.modules.reduce((total, module) => total + global.FullExamSchema.modulePoints(module), 0);
    const routing = section.modules.find((module) => module.stage === 'routing');
    const branches = section.modules.filter((module) => ['lower', 'higher'].includes(module.stage));
    return global.FullExamSchema.modulePoints(routing) + Math.max(0, ...branches.map((module) => global.FullExamSchema.modulePoints(module)));
  }
  function sectionDeliveredMinutes(section) {
    if (state.mock?.exam !== 'sat' || state.mock?.deliveryMode === 'linear') return section.modules.reduce((total, module) => total + module.durationMinutes, 0);
    const routing = section.modules.find((module) => module.stage === 'routing');
    const branches = section.modules.filter((module) => ['lower', 'higher'].includes(module.stage));
    return Number(routing?.durationMinutes || 0) + Math.max(0, ...branches.map((module) => module.durationMinutes));
  }

  async function fetchJson(path) {
    const response = await fetch(`${DB_URL}/${path}.json`);
    if (!response.ok) throw new Error('Mocks could not be loaded.');
    return response.json();
  }

  async function list(exam) {
    const path = exam === 'ielts' || exam === 'ielts-academic' ? 'ielts-academic' : 'sat';
    const [bundledResult, remoteResult] = await Promise.allSettled([
      fetch(`data/full-mocks/${path}.json?v=1`, { cache: 'no-store' }).then((response) => {
        if (!response.ok) throw new Error('Bundled mocks could not be loaded.');
        return response.json();
      }),
      fetchJson(`full-mocks/${path}`)
    ]);
    if (bundledResult.status === 'rejected' && remoteResult.status === 'rejected') throw new Error('Mocks could not be loaded.');
    const merged = new Map();
    const bundled = bundledResult.status === 'fulfilled' && Array.isArray(bundledResult.value) ? bundledResult.value : [];
    bundled.forEach((raw) => {
      const validation = global.FullExamSchema.validate(raw, { strictCounts: true });
      if (validation.valid && validation.mock.published) merged.set(validation.mock.id, { source: 'bundled', ...validation.mock });
    });
    const remote = remoteResult.status === 'fulfilled' ? remoteResult.value : {};
    Object.entries(remote || {}).forEach(([firebaseId, raw]) => {
      const validation = global.FullExamSchema.validate(raw, { strictCounts: true });
      if (validation.valid && validation.mock.published) merged.set(validation.mock.id, { source: 'admin', firebaseId, ...validation.mock });
      else if (validation.mock?.id) merged.delete(validation.mock.id);
    });
    return [...merged.values()].sort((left, right) => (left.order || 999) - (right.order || 999) || left.title.localeCompare(right.title));
  }

  function ensureShell() {
    if ($('full-exam-engine')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <section class="full-exam-engine" id="full-exam-engine" hidden aria-label="Full mock exam">
        <header class="full-exam-topbar">
          <button class="full-exam-link" id="full-exam-exit" type="button" aria-label="Return to home">Home</button>
          <div class="full-exam-clock" id="full-exam-clock"><strong id="full-exam-timer">00:00</strong><button id="full-exam-hide-timer" type="button">Hide</button></div>
        </header>
        <div class="full-exam-context" id="full-exam-context"></div>
        <div class="full-exam-audio-dock" id="full-exam-audio-dock" hidden></div>
        <main class="full-exam-stage" id="full-exam-stage"></main>
        <footer class="full-exam-footer" id="full-exam-footer"></footer>
        <section class="full-exam-modal" id="full-exam-modal" hidden><div class="full-exam-dialog" id="full-exam-dialog"></div></section>
      </section>`);
    $('full-exam-exit').addEventListener('click', requestExit);
    $('full-exam-hide-timer').addEventListener('click', () => { state.timerHidden = !state.timerHidden; renderTimer(); persistSession(); });
    $('full-exam-audio-dock').addEventListener('click', handleAudioClick);
    $('full-exam-stage').addEventListener('click', handleStageClick);
    $('full-exam-stage').addEventListener('input', handleStageInput);
    $('full-exam-footer').addEventListener('click', handleFooterClick);
    $('full-exam-modal').addEventListener('click', handleModalClick);
  }

  function start(rawMock, options = {}) {
    ensureShell();
    const validation = global.FullExamSchema.validate(rawMock, { strictCounts: options.allowIncomplete !== true });
    if (!validation.valid) throw new Error(validation.errors.join('\n'));
    resetState(validation.mock);
    showIntro();
  }

  function resetState(mock) {
    clearInterval(state.timer);
    state.mock = mock;
    state.screen = 'intro';
    state.sectionIndex = 0;
    state.moduleId = '';
    state.partIndex = 0;
    state.questionIndex = 0;
    state.responses = {};
    state.marked = {};
    state.completedModules = [];
    state.routes = {};
    state.secondsRemaining = 0;
    state.deadline = 0;
    state.timerHidden = false;
    state.audioProgress = {};
    state.audioStarted = {};
    state.audioCompleted = {};
    state.result = null;
    $('full-exam-engine').hidden = false;
    document.body.classList.add('is-full-exam-open');
  }

  function showIntro() {
    $('full-exam-engine').dataset.exam = state.mock.exam;
    state.screen = 'intro';
    const sat = state.mock.exam === 'sat';
    $('full-exam-context').innerHTML = '';
    hideAudioDock();
    $('full-exam-stage').innerHTML = `<article class="full-exam-intro"><p class="kicker">${sat ? 'Digital SAT' : 'IELTS Academic'}</p><h1>${escapeHtml(state.mock.title)}</h1><p>${escapeHtml(state.mock.description || (sat ? 'A complete timed SAT simulation.' : 'A complete Listening, Reading and Writing simulation.'))}</p><div class="full-exam-overview">${state.mock.sections.map((section) => `<article><span>${escapeHtml(section.title)}</span><strong>${sectionDeliveredItems(section)} ${section.id === 'writing' ? 'tasks' : 'questions'}</strong><small>${sectionDeliveredMinutes(section)} minutes</small></article>`).join('')}</div><aside><strong>Before you begin</strong><p>Your progress is saved on this device. Once a timed module is submitted, you cannot return to it.${!sat && state.mock.sections.some((section) => section.id === 'listening' && section.modules.some((module) => module.parts.some((part) => !part.audioUrl))) ? ' Listening audio is pending and can be added later in Admin.' : ''}</p></aside><button class="button button-primary" data-full-begin type="button">Start exam</button></article>`;
    $('full-exam-footer').innerHTML = '';
    renderTimer();
    persistSession();
  }

  function firstModuleForSection(section) {
    if (state.mock.exam === 'sat') return section.modules.find((module) => module.stage === 'routing') || section.modules[0];
    return section.modules[0];
  }

  function showTransition(sectionIndex, moduleId, message = '') {
    stopTimer();
    state.screen = 'transition';
    state.sectionIndex = sectionIndex;
    const section = currentSection();
    const module = section.modules.find((candidate) => candidate.id === moduleId) || firstModuleForSection(section);
    state.moduleId = module.id;
    state.questionIndex = 0;
    state.secondsRemaining = module.durationMinutes * 60;
    $('full-exam-context').innerHTML = '';
    hideAudioDock();
    const moduleItems = section.id === 'writing' ? global.FullExamSchema.allQuestions(module).length : global.FullExamSchema.modulePoints(module);
    $('full-exam-stage').innerHTML = `<article class="full-exam-intro full-exam-transition"><p class="kicker">${escapeHtml(section.title)}</p><h1>${escapeHtml(module.title)}</h1>${message ? `<p class="full-exam-transition-message">${escapeHtml(message)}</p>` : ''}<p>${escapeHtml(module.instructions || section.instructions || defaultDirections(section.id))}</p><div class="full-exam-overview"><article><span>Time</span><strong>${module.durationMinutes} minutes</strong></article><article><span>${section.id === 'writing' ? 'Tasks' : 'Questions'}</span><strong>${moduleItems}</strong></article></div><button class="button button-primary" data-full-start-module type="button">Begin ${escapeHtml(module.title)}</button></article>`;
    $('full-exam-footer').innerHTML = '';
    renderTimer();
    persistSession();
  }

  function defaultDirections(sectionId) {
    if (sectionId === 'listening') return 'You will hear each recording once. Answer all questions as you listen.';
    if (sectionId === 'reading') return 'Read each passage and answer all questions. The timer includes answer transfer time.';
    if (sectionId === 'writing') return 'Complete both tasks. Task 2 contributes twice as much as Task 1.';
    return 'Answer every question. You may move freely within this module until you submit it or time expires.';
  }

  function beginModule() {
    state.screen = 'question';
    state.secondsRemaining = currentModule().durationMinutes * 60;
    state.deadline = Date.now() + state.secondsRemaining * 1000;
    startTimer();
    renderQuestion();
    persistSession();
  }

  function startTimer() {
    clearInterval(state.timer);
    updateRemainingTime();
    state.timer = setInterval(() => {
      updateRemainingTime();
      if (state.secondsRemaining <= 0) finishModule(true);
    }, 1000);
  }

  function updateRemainingTime() {
    if (state.deadline) state.secondsRemaining = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
    renderTimer();
  }

  function stopTimer() { clearInterval(state.timer); state.timer = null; state.deadline = 0; }

  function renderTimer() {
    if (!$('full-exam-timer')) return;
    const minutes = String(Math.floor(state.secondsRemaining / 60)).padStart(2, '0');
    const seconds = String(state.secondsRemaining % 60).padStart(2, '0');
    $('full-exam-timer').textContent = state.timerHidden ? 'Hidden' : `${minutes}:${seconds}`;
    $('full-exam-hide-timer').textContent = state.timerHidden ? 'Show' : 'Hide';
    $('full-exam-clock').classList.toggle('is-urgent', state.secondsRemaining > 0 && state.secondsRemaining <= 300);
  }

  function renderQuestion() {
    $('full-exam-engine').dataset.exam = state.mock.exam;
    const module = currentModule();
    const questions = currentQuestions();
    const question = questions[state.questionIndex];
    if (!question) return;
    const part = questionPart(question);
    const response = currentResponse(question);
    const marked = Boolean(state.marked[responseKey(question)]);
    const answeredCount = questions.filter((item) => hasResponse(item)).length;
    $('full-exam-context').innerHTML = `<div><span>${escapeHtml(currentSection().title)}</span><strong>${escapeHtml(module.title)}</strong></div><div class="full-exam-progress"><i style="width:${Math.round(answeredCount / Math.max(1, questions.length) * 100)}%"></i></div><span>${answeredCount}/${questions.length} answered</span>`;
    const sharedPassage = question.passage || part.passage;
    const sharedImage = safeUrl(question.image || part.image);
    const audio = safeUrl(part.audioUrl, true);
    const partChanged = state.partIndex !== currentParts().findIndex((candidate) => candidate.id === part.id);
    state.partIndex = currentParts().findIndex((candidate) => candidate.id === part.id);
    $('full-exam-stage').innerHTML = `<div class="full-exam-question-shell ${sharedPassage || sharedImage ? 'has-reference' : ''}">
      ${(sharedPassage || sharedImage) ? `<aside class="full-exam-reference">${part.title ? `<p class="kicker">${escapeHtml(part.title)}</p>` : ''}${sharedImage ? `<img src="${escapeHtml(sharedImage)}" alt="Question reference">` : ''}${sharedPassage ? `<div class="full-exam-passage">${escapeHtml(sharedPassage).replace(/\n/g, '<br>')}</div>` : ''}</aside>` : ''}
      <article class="full-exam-question"><header><span>${state.questionIndex + 1}</span><button class="full-exam-mark ${marked ? 'is-marked' : ''}" data-full-mark type="button">${marked ? 'Marked for review' : 'Mark for review'}</button></header>${part.instructions || question.instructions ? `<p class="full-exam-instructions">${escapeHtml(question.instructions || part.instructions)}</p>` : ''}<h2>${escapeHtml(question.prompt)}</h2>${renderResponseControl(question, response)}</article>
    </div>`;
    renderPartAudio(part, audio);
    $('full-exam-footer').innerHTML = `<button class="full-exam-counter" data-full-review type="button">Question ${state.questionIndex + 1} of ${questions.length}</button><div><button class="button button-quiet" data-full-previous type="button" ${state.questionIndex === 0 ? 'disabled' : ''}>Previous</button><button class="button button-primary" data-full-next type="button">${state.questionIndex === questions.length - 1 ? 'Review module' : 'Next'}</button></div>`;
    if (state.mock.exam === 'ielts-academic') {
      $('full-exam-footer').insertAdjacentHTML('afterbegin', `<nav class="full-exam-number-strip" aria-label="Questions">${questions.map((item, index) => `<button type="button" data-full-question="${index}" aria-label="Question ${index + 1}" ${index === state.questionIndex ? 'aria-current="step"' : ''} class="${hasResponse(item) ? 'is-answered' : ''}">${index + 1}</button>`).join('')}</nav>`);
    }
    if (partChanged) $('full-exam-stage').scrollTop = 0;
  }

  function renderResponseControl(question, response) {
    if (question.type === 'single_choice') return `<div class="full-exam-choices">${question.options.map((option, index) => `<button class="full-exam-choice ${response === index ? 'is-selected' : ''}" data-full-choice="${index}" type="button"><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(option)}</button>`).join('')}</div>`;
    if (question.type === 'multiple_choice') {
      const selected = Array.isArray(response) ? response : [];
      return `<div class="full-exam-choices">${question.options.map((option, index) => `<button class="full-exam-choice ${selected.includes(index) ? 'is-selected' : ''}" data-full-multiple="${index}" type="button"><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(option)}</button>`).join('')}</div>`;
    }
    if (question.type === 'matching') {
      const values = response && typeof response === 'object' ? response : {};
      return `<div class="full-exam-matching">${question.prompts.map((prompt) => `<label><span>${escapeHtml(prompt.text)}</span><select data-full-match="${escapeHtml(prompt.id)}"><option value="">Select…</option>${question.options.map((option) => `<option value="${escapeHtml(option)}" ${values[prompt.id] === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select></label>`).join('')}</div>`;
    }
    if (question.type === 'writing') {
      const value = typeof response === 'string' ? response : '';
      return `<label class="full-exam-writing"><textarea data-full-writing placeholder="Write your response here…">${escapeHtml(value)}</textarea><span><b data-full-word-count>${wordCount(value)}</b> words${question.minWords ? ` · minimum ${question.minWords}` : ''}</span></label>`;
    }
    const value = typeof response === 'string' || typeof response === 'number' ? response : '';
    const hint = question.wordLimit ? `No more than ${question.wordLimit} words` : question.type === 'numeric' ? 'Enter your answer' : 'Type your answer';
    return `<label class="full-exam-text-answer"><span>${escapeHtml(hint)}</span><input data-full-text type="text" inputmode="${question.type === 'numeric' ? 'decimal' : 'text'}" value="${escapeHtml(value)}" autocomplete="off"></label>`;
  }

  function hasResponse(question) {
    const response = state.responses[responseKey(question)];
    if (Array.isArray(response)) return response.length > 0;
    if (response && typeof response === 'object') return Object.values(response).some(Boolean);
    return String(response == null ? '' : response).trim().length > 0;
  }

  function handleStageClick(event) {
    if (event.target.closest('[data-full-begin]')) { showTransition(0, firstModuleForSection(state.mock.sections[0]).id); return; }
    if (event.target.closest('[data-full-start-module]')) { beginModule(); return; }
    const choice = event.target.closest('[data-full-choice]');
    if (choice) { setResponse(Number(choice.dataset.fullChoice)); return; }
    const multiple = event.target.closest('[data-full-multiple]');
    if (multiple) {
      const question = currentQuestion();
      const index = Number(multiple.dataset.fullMultiple);
      const selected = new Set(Array.isArray(currentResponse()) ? currentResponse() : []);
      selected.has(index) ? selected.delete(index) : selected.add(index);
      if (question.maxSelections && selected.size > question.maxSelections) selected.delete([...selected][0]);
      setResponse([...selected].sort((a, b) => a - b));
      return;
    }
    if (event.target.closest('[data-full-mark]')) {
      const key = responseKey(currentQuestion());
      state.marked[key] = !state.marked[key];
      renderQuestion(); persistSession();
    }
  }

  function handleStageInput(event) {
    const question = currentQuestion();
    if (!question) return;
    if (event.target.matches('[data-full-text], [data-full-writing]')) {
      state.responses[responseKey(question)] = event.target.value;
      const counter = document.querySelector('[data-full-word-count]');
      if (counter) counter.textContent = wordCount(event.target.value);
      updateProgressDisplay();
      persistSession();
    }
    if (event.target.matches('[data-full-match]')) {
      const current = currentResponse() && typeof currentResponse() === 'object' ? { ...currentResponse() } : {};
      current[event.target.dataset.fullMatch] = event.target.value;
      state.responses[responseKey(question)] = current;
      updateProgressDisplay();
      persistSession();
    }
  }

  function setResponse(value) {
    state.responses[responseKey(currentQuestion())] = value;
    renderQuestion();
    persistSession();
  }

  function updateProgressDisplay() {
    const questions = currentQuestions();
    const answered = questions.filter((question) => hasResponse(question)).length;
    const label = $('full-exam-context')?.lastElementChild;
    const bar = $('full-exam-context')?.querySelector('.full-exam-progress i');
    if (label) label.textContent = `${answered}/${questions.length} answered`;
    if (bar) bar.style.width = `${Math.round(answered / Math.max(1, questions.length) * 100)}%`;
  }

  function hideAudioDock() {
    const dock = $('full-exam-audio-dock');
    if (!dock) return;
    dock.hidden = true;
    dock.dataset.partId = '';
    dock.innerHTML = '';
  }

  function renderPartAudio(part, audioUrl) {
    const dock = $('full-exam-audio-dock');
    if (!dock) return;
    if (!audioUrl) {
      if (currentSection()?.id === 'listening') {
        dock.dataset.partId = part.id;
        dock.hidden = false;
        dock.innerHTML = `<div><span>${escapeHtml(part.title || 'Listening recording')}</span><strong>Audio will be added later</strong></div>`;
      } else hideAudioDock();
      return;
    }
    if (dock.dataset.partId === part.id && dock.querySelector('audio')) { dock.hidden = false; return; }
    const completed = Boolean(state.audioCompleted[part.id]);
    const started = Boolean(state.audioStarted[part.id]);
    dock.dataset.partId = part.id;
    dock.hidden = false;
    dock.innerHTML = `<div><span>${escapeHtml(part.title || 'Listening recording')}</span><strong>${completed ? 'Recording complete' : started ? 'Recording paused' : 'Play once when ready'}</strong></div><button class="button button-primary" data-full-play-audio type="button" ${completed ? 'disabled' : ''}>${started ? 'Resume recording' : 'Play recording'}</button><audio id="full-exam-audio" preload="metadata" src="${escapeHtml(audioUrl)}"></audio>`;
    const audio = $('full-exam-audio');
    audio.addEventListener('loadedmetadata', () => { if (state.audioProgress[part.id]) audio.currentTime = Math.min(state.audioProgress[part.id], Math.max(0, audio.duration - .25)); });
    audio.addEventListener('timeupdate', () => { state.audioProgress[part.id] = audio.currentTime; persistSession(); });
    audio.addEventListener('ended', () => {
      state.audioCompleted[part.id] = true;
      state.audioProgress[part.id] = audio.duration || state.audioProgress[part.id];
      const label = dock.querySelector('strong'), button = dock.querySelector('[data-full-play-audio]');
      if (label) label.textContent = 'Recording complete';
      if (button) { button.disabled = true; button.textContent = 'Recording complete'; }
      persistSession();
    });
  }

  async function handleAudioClick(event) {
    const button = event.target.closest('[data-full-play-audio]');
    if (!button) return;
    const partId = $('full-exam-audio-dock').dataset.partId;
    const audio = $('full-exam-audio');
    if (!audio || state.audioCompleted[partId]) return;
    state.audioStarted[partId] = true;
    button.disabled = true;
    button.textContent = 'Recording playing';
    try { await audio.play(); }
    catch { button.disabled = false; button.textContent = 'Try recording again'; }
    persistSession();
  }

  function handleFooterClick(event) {
    const target = event.target.closest('[data-full-question]');
    if (target) { state.questionIndex = Number(target.dataset.fullQuestion); renderQuestion(); persistSession(); return; }
    if (event.target.closest('[data-full-previous]')) move(-1);
    if (event.target.closest('[data-full-next]')) move(1);
    if (event.target.closest('[data-full-review]')) showReview();
  }

  function move(delta) {
    const next = state.questionIndex + delta;
    if (next < 0) return;
    if (next >= currentQuestions().length) { showReview(); return; }
    state.questionIndex = next;
    renderQuestion();
    persistSession();
  }

  function showReview() {
    const questions = currentQuestions();
    const unanswered = questions.filter((question) => !hasResponse(question)).length;
    $('full-exam-modal').classList.add('is-review-page');
    $('full-exam-modal').hidden = false;
    $('full-exam-dialog').innerHTML = `<div class="full-review-content"><h1>Check Your Work</h1><p>You can return to any question in this module to check your answers.</p><p>For this practice, click Next when you are ready to move on.</p><section class="full-review-card" aria-label="Module review"><header><h2>Section ${state.sectionIndex + 1}: ${escapeHtml(currentSection().title)} Questions</h2><div class="full-review-legend"><span><i class="review-unanswered"></i> Unanswered</span><span><i class="review-flag"></i> For Review</span></div></header><div class="full-exam-review-grid">${questions.map((question, index) => `<button data-full-jump="${index}" aria-label="Question ${index + 1}, ${hasResponse(question) ? 'answered' : 'unanswered'}${state.marked[responseKey(question)] ? ', marked for review' : ''}" class="${hasResponse(question) ? 'is-answered' : ''} ${state.marked[responseKey(question)] ? 'is-marked' : ''}" type="button">${index + 1}</button>`).join('')}</div><p class="full-review-status">${unanswered ? `${unanswered} unanswered` : 'All questions answered'} · ${escapeHtml(currentModule().title)}</p></section></div><footer class="full-review-footer"><strong>Luminary</strong><div><button data-full-close-modal type="button">Back</button><button data-full-submit-module type="button">Next</button></div></footer>`;
  }

  function handleModalClick(event) {
    if (event.target.closest('[data-full-close-modal]')) closeModal();
    const jump = event.target.closest('[data-full-jump]');
    if (jump) { state.questionIndex = Number(jump.dataset.fullJump); closeModal(); renderQuestion(); }
    if (event.target.closest('[data-full-submit-module]')) { closeModal(); finishModule(false); }
    if (event.target.closest('[data-full-confirm-exit]')) { exit(); document.dispatchEvent(new CustomEvent('luminaryFullExamHome')); }
    if (event.target.closest('[data-full-cancel-exit]')) closeModal();
  }

  function closeModal() { $('full-exam-modal').hidden = true; $('full-exam-modal').classList.remove('is-review-page'); }

  function requestExit() {
    $('full-exam-modal').classList.remove('is-review-page');
    $('full-exam-modal').hidden = false;
    $('full-exam-dialog').innerHTML = `<header><h2>Return to Home?</h2></header><p>Leave this test and return to the home page?</p><div class="full-exam-dialog-actions"><button class="button button-quiet" data-full-cancel-exit type="button">Keep working</button><button class="button button-primary" data-full-confirm-exit type="button">Go to Home</button></div>`;
  }

  function questionScore(question, response) {
    if (question.type === 'matching') return question.prompts.reduce((total, prompt) => total + (normalizedText(response?.[prompt.id]) === normalizedText(question.matches[prompt.id]) ? 1 : 0), 0);
    if (question.type === 'multiple_choice') return Array.isArray(response) ? question.correct.reduce((total, answer) => total + (response.includes(answer) ? 1 : 0), 0) : 0;
    return isCorrect(question, response) ? global.FullExamSchema.questionPoints(question) : 0;
  }

  function moduleScore(module) {
    const questions = global.FullExamSchema.allQuestions(module).filter((question) => question.type !== 'writing');
    let correct = 0;
    questions.forEach((question) => { correct += questionScore(question, state.responses[`${module.id}:${question.id}`]); });
    const total = questions.reduce((sum, question) => sum + global.FullExamSchema.questionPoints(question), 0);
    return { correct, total, ratio: total ? correct / total : 0 };
  }

  function normalizedText(value, caseSensitive) {
    const compact = String(value == null ? '' : value).trim().replace(/\s+/g, ' ');
    return caseSensitive ? compact : compact.toLowerCase();
  }

  function isCorrect(question, response) {
    if (question.type === 'single_choice') return response === question.correct;
    if (question.type === 'multiple_choice') return Array.isArray(response) && response.length === question.correct.length && [...response].sort().every((value, index) => value === [...question.correct].sort()[index]);
    if (['text', 'numeric'].includes(question.type)) return question.acceptedAnswers.some((answer) => normalizedText(answer, question.caseSensitive) === normalizedText(response, question.caseSensitive));
    if (question.type === 'matching') return question.prompts.every((prompt) => normalizedText(response?.[prompt.id]) === normalizedText(question.matches[prompt.id]));
    return false;
  }

  function finishModule(timedOut) {
    if (state.screen !== 'question') return;
    closeModal();
    stopTimer();
    const section = currentSection();
    const module = currentModule();
    state.completedModules.push(module.id);
    if (state.mock.exam === 'sat') {
      if (state.mock.deliveryMode === 'linear') {
        const nextModule = section.modules[section.modules.findIndex((candidate) => candidate.id === module.id) + 1];
        if (nextModule) {
          showTransition(state.sectionIndex, nextModule.id, timedOut ? 'Time expired. Your answers were submitted.' : 'The next module is ready.');
          return;
        }
        if (state.sectionIndex + 1 < state.mock.sections.length) {
          const nextIndex = state.sectionIndex + 1;
          const nextSection = state.mock.sections[nextIndex];
          showTransition(nextIndex, firstModuleForSection(nextSection).id, section.breakMinutes ? `${section.breakMinutes}-minute break before the next section.` : 'The next section is ready.');
          return;
        }
        finishExam();
        return;
      }
      if (module.stage === 'routing') {
        const score = moduleScore(module);
        const route = score.ratio >= (section.route?.threshold ?? 0.6) ? 'higher' : 'lower';
        state.routes[section.id] = route;
        const next = section.modules.find((candidate) => candidate.id === (route === 'higher' ? section.route?.higherModuleId : section.route?.lowerModuleId)) || section.modules.find((candidate) => candidate.stage === route);
        showTransition(state.sectionIndex, next.id, timedOut ? 'Time expired. Your answers were submitted.' : 'The next module is ready.');
        return;
      }
      if (state.sectionIndex + 1 < state.mock.sections.length) {
        const nextIndex = state.sectionIndex + 1;
        const nextSection = state.mock.sections[nextIndex];
        showTransition(nextIndex, firstModuleForSection(nextSection).id, section.breakMinutes ? `${section.breakMinutes}-minute break before the next section.` : 'The next section is ready.');
        return;
      }
      finishExam();
      return;
    }
    const nextModule = section.modules[section.modules.findIndex((candidate) => candidate.id === module.id) + 1];
    if (nextModule) { showTransition(state.sectionIndex, nextModule.id, timedOut ? 'Time expired. Your answers were submitted.' : 'The next part is ready.'); return; }
    if (state.sectionIndex + 1 < state.mock.sections.length) {
      const nextIndex = state.sectionIndex + 1;
      const nextSection = state.mock.sections[nextIndex];
      showTransition(nextIndex, firstModuleForSection(nextSection).id, timedOut ? 'Time expired. Your answers were submitted.' : 'The next section is ready.');
      return;
    }
    finishExam();
  }

  function completedModules() {
    return state.mock.sections.flatMap((section) => section.modules.filter((module) => state.completedModules.includes(module.id)).map((module) => ({ section, module })));
  }

  function ieltsBand(raw, total, sectionId) {
    const scaledRaw = total && total !== 40 ? Math.round(raw / total * 40) : raw;
    const tables = sectionId === 'listening'
      ? [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [11, 4]]
      : [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4]];
    return (tables.find(([minimum]) => scaledRaw >= minimum) || [0, 0])[1];
  }

  function finishExam() {
    stopTimer();
    state.secondsRemaining = 0;
    hideAudioDock();
    state.screen = 'results';
    const modules = completedModules();
    const sections = state.mock.sections.map((section) => {
      const objectiveModules = modules.filter((entry) => entry.section.id === section.id).map((entry) => entry.module);
      const scores = objectiveModules.map(moduleScore);
      const correct = scores.reduce((sum, score) => sum + score.correct, 0);
      const total = scores.reduce((sum, score) => sum + score.total, 0);
      const writingTasks = objectiveModules.flatMap((module) => global.FullExamSchema.allQuestions(module)).filter((question) => question.type === 'writing');
      return { id: section.id, title: section.title, correct, total, writingTasks, band: state.mock.exam === 'ielts-academic' && ['listening', 'reading'].includes(section.id) ? ieltsBand(correct, total, section.id) : null };
    });
    state.result = { mockId: state.mock.id, title: state.mock.title, exam: state.mock.exam, completedAt: Date.now(), routes: state.routes, sections, responses: state.responses };
    const history = JSON.parse(localStorage.getItem('luminary-full-exam-results-v1') || '[]');
    history.push(state.result);
    localStorage.setItem('luminary-full-exam-results-v1', JSON.stringify(history.slice(-30)));
    document.dispatchEvent(new CustomEvent('luminaryFullExamComplete', { detail: state.result }));
    sessionStorage.removeItem(STORAGE_KEY);
    renderResults();
  }

  function renderResults() {
    $('full-exam-context').innerHTML = '';
    const scoreNote = state.mock.exam === 'sat' ? `Official SAT scoring requires calibrated item parameters, so Luminary reports raw section performance${state.mock.deliveryMode === 'adaptive' ? ' and the adaptive route' : ''}.` : 'Listening and Reading bands are practice estimates. Writing requires examiner or rubric-based assessment.';
    $('full-exam-stage').innerHTML = `<article class="full-exam-results"><p class="kicker">Exam complete</p><h1>${escapeHtml(state.mock.title)}</h1><p>Your responses have been saved. ${scoreNote}</p><div class="full-exam-result-grid">${state.result.sections.map((section) => `<article><span>${escapeHtml(section.title)}</span>${section.total ? `<strong>${section.correct}/${section.total}</strong><small>${Math.round(section.correct / section.total * 100)}% correct${section.band !== null ? ` · estimated band ${section.band}` : ''}</small>` : `<strong>${section.writingTasks.length} tasks</strong><small>${section.writingTasks.map((task) => `${wordCount(state.responses[Object.keys(state.responses).find((key) => key.endsWith(`:${task.id}`))] || '')} words`).join(' · ')}</small>`}</article>`).join('')}</div>${state.mock.exam === 'sat' && Object.keys(state.routes).length ? `<p class="full-exam-route-result">Adaptive routes: ${Object.entries(state.routes).map(([section, route]) => `${section.toUpperCase()} ${route}`).join(' · ')}</p>` : ''}<button class="button button-primary" data-full-finish type="button">Return to Luminary</button></article>`;
    $('full-exam-footer').innerHTML = '';
    $('full-exam-stage').querySelector('[data-full-finish]').addEventListener('click', exit);
    renderTimer();
  }

  function wordCount(value) { return String(value || '').trim() ? String(value).trim().split(/\s+/).length : 0; }

  function persistSession() {
    if (!state.mock || state.screen === 'results') return;
    const snapshot = { mock: state.mock, screen: state.screen, sectionIndex: state.sectionIndex, moduleId: state.moduleId, partIndex: state.partIndex, questionIndex: state.questionIndex, responses: state.responses, marked: state.marked, completedModules: state.completedModules, routes: state.routes, secondsRemaining: state.secondsRemaining, deadline: state.deadline, timerHidden: state.timerHidden, audioProgress: state.audioProgress, audioStarted: state.audioStarted, audioCompleted: state.audioCompleted };
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); } catch { /* Large image data may exceed storage. */ }
  }

  function restore() {
    ensureShell();
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved?.mock) return false;
      const validation = global.FullExamSchema.validate(saved.mock, { strictCounts: true });
      if (!validation.valid) throw new Error('Invalid saved exam.');
      Object.assign(state, saved, { mock: validation.mock, timer: null });
      $('full-exam-engine').hidden = false;
      document.body.classList.add('is-full-exam-open');
      if (state.screen === 'question') { startTimer(); renderQuestion(); }
      else if (state.screen === 'transition') showTransition(state.sectionIndex, state.moduleId);
      else showIntro();
      return true;
    } catch { sessionStorage.removeItem(STORAGE_KEY); return false; }
  }

  function exit() {
    clearInterval(state.timer);
    if (state.screen === 'results' || state.screen === 'intro') sessionStorage.removeItem(STORAGE_KEY);
    $('full-exam-engine').hidden = true;
    document.body.classList.remove('is-full-exam-open');
    closeModal();
  }

  global.FullExamEngine = { list, start, restore, validate: (mock, options) => global.FullExamSchema.validate(mock, options) };
  document.addEventListener('DOMContentLoaded', ensureShell);
})(window);
