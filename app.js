'use strict';

window.luminaryAppLoaded = true;

const THEMES = {
  coffee: { name: 'Beige & White', bg: '#f4efe7', surface: '#fffdf9', surfaceRaised: '#ffffff', sidebar: '#31251d', sidebarSurface: '#4a382b', text: '#30251c', textSoft: '#786958', textMuted: '#958677', line: '#dfd1bd', accent: '#ca983e', accentHover: '#ae7e30', accentSoft: '#f1dfbb', onAccent: '#2d2118', sideText: '#fffaf2', sideMuted: '#cbbba8', success: '#2d7a58', danger: '#af4c43' },
  dark: { name: 'Dark', bg: '#171717', surface: '#222222', surfaceRaised: '#2b2b2b', sidebar: '#101010', sidebarSurface: '#303030', text: '#f7f3ed', textSoft: '#c2bbb1', textMuted: '#938b82', line: '#42403d', accent: '#d3a75a', accentHover: '#e2bb73', accentSoft: '#40331e', onAccent: '#241b10', sideText: '#faf7f1', sideMuted: '#bdb6ad', success: '#69bb8c', danger: '#ed8279' },
  navy: { name: 'Dark Blue', bg: '#111827', surface: '#182235', surfaceRaised: '#202c42', sidebar: '#0b1220', sidebarSurface: '#1c2b43', text: '#f3f7ff', textSoft: '#b7c4d9', textMuted: '#8594ab', line: '#34445c', accent: '#71b5ee', accentHover: '#9bcdf3', accentSoft: '#183b5d', onAccent: '#09253d', sideText: '#f5f9ff', sideMuted: '#b5c2d7', success: '#65c5a1', danger: '#ef8c92' },
  purple: { name: 'Dark Purple', bg: '#1b1422', surface: '#251b30', surfaceRaised: '#30223d', sidebar: '#120d18', sidebarSurface: '#372744', text: '#faf4ff', textSoft: '#d2c1dc', textMuted: '#a791b2', line: '#4b395b', accent: '#c69ce6', accentHover: '#dcbaeF', accentSoft: '#442c58', onAccent: '#281537', sideText: '#fff8ff', sideMuted: '#d0bfd9', success: '#75bd9b', danger: '#ef92a0' },
  forest: { name: 'Forest', bg: '#15211c', surface: '#1d2d25', surfaceRaised: '#283b30', sidebar: '#0e1813', sidebarSurface: '#2a4535', text: '#f4fbf5', textSoft: '#c1d2c4', textMuted: '#91a896', line: '#3c5445', accent: '#88c99e', accentHover: '#aadab9', accentSoft: '#224d37', onAccent: '#0d2d1c', sideText: '#f6fff7', sideMuted: '#bdd2c1', success: '#8ad0a0', danger: '#f2948b' },
  sunset: { name: 'Sunset', bg: '#2a1b18', surface: '#38231e', surfaceRaised: '#482c24', sidebar: '#1d110f', sidebarSurface: '#4f2f25', text: '#fff6ed', textSoft: '#dec7b5', textMuted: '#b59680', line: '#624237', accent: '#ec8c57', accentHover: '#f2a06f', accentSoft: '#603222', onAccent: '#3a170d', sideText: '#fff7f0', sideMuted: '#dbc3b1', success: '#92c48d', danger: '#f08077' }
};

const DEFAULT_STATE = { profile: { name: '', exam: 'sat', target: '', date: '', theme: 'coffee' }, progress: { sessions: 0, streak: 0, answers: {} } };
const SAT_DATES = ['2026-08-22', '2026-09-12', '2026-10-03', '2026-11-07', '2026-12-05', '2027-03-06', '2027-05-01', '2027-06-05', '2027-08-28', '2027-09-18', '2027-10-02', '2027-11-06', '2027-12-04', '2028-03-04', '2028-05-06', '2028-06-03'];
const QUESTIONS = {
  math: [
    { id: 'm1', domain: 'Advanced Math', prompt: 'If 3x + 8 = 35, what is the value of x?', answers: ['7', '9', '11', '13'], correct: 1 },
    { id: 'm2', domain: 'Algebra', prompt: 'A line has a slope of 4 and passes through (2, 3). Which equation represents the line?', answers: ['y = 4x - 5', 'y = 4x + 3', 'y = 2x - 5', 'y = 3x + 4'], correct: 0 },
    { id: 'm3', domain: 'Problem Solving', prompt: 'A jacket costs $80 after a 20% discount. What was the original price?', answers: ['$64', '$96', '$100', '$120'], correct: 2 },
    { id: 'm4', domain: 'Geometry', prompt: 'A square has a perimeter of 36. What is its area?', answers: ['18', '36', '72', '81'], correct: 3 },
    { id: 'm5', domain: 'Data Analysis', prompt: 'The mean of 4, 8, 10, and n is 9. What is n?', answers: ['12', '14', '16', '18'], correct: 1 },
    { id: 'm6', domain: 'Advanced Math', prompt: 'What is the positive solution to x² = 49?', answers: ['5', '6', '7', '8'], correct: 2 }
  ],
  rw: [
    { id: 'r1', domain: 'Standard English Conventions', prompt: 'Which choice completes the sentence so that it conforms to Standard English conventions? “The students studied carefully, _____ they felt prepared.”', answers: ['and', 'but', 'because', 'although'], correct: 0 },
    { id: 'r2', domain: 'Words in Context', prompt: 'In this context, “concise” most nearly means:', answers: ['brief', 'uncertain', 'complex', 'traditional'], correct: 0 },
    { id: 'r3', domain: 'Expression of Ideas', prompt: 'Which transition best emphasizes a contrast?', answers: ['For example,', 'However,', 'Similarly,', 'Therefore,'], correct: 1 },
    { id: 'r4', domain: 'Information and Ideas', prompt: 'Which claim is best supported by the evidence in the passage?', answers: ['The author rejects all new methods.', 'The method improved accuracy.', 'The study was never completed.', 'The result was unexpected.'], correct: 1 },
    { id: 'r5', domain: 'Craft and Structure', prompt: 'The author’s primary purpose is to:', answers: ['describe a process', 'challenge a belief', 'celebrate an achievement', 'summarize a debate'], correct: 0 },
    { id: 'r6', domain: 'Standard English Conventions', prompt: 'Choose the punctuation that correctly joins the two independent clauses.', answers: ['a comma', 'a semicolon', 'no punctuation', 'a colon after because'], correct: 1 }
  ]
};

let state = structuredClone(DEFAULT_STATE);
let currentPage = 'home';
let currentSkill = '';
let currentSet = 'math';
let currentQuestion = 0;
let practiceMode = 'flash';
let toastTimer;

const $ = (id) => document.getElementById(id);
const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

async function api(path, options = {}) {
  if (window.location.protocol === 'file:') throw new Error('Local API requires the Luminary server.');
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!response.ok) throw new Error('Request failed');
  return response.json();
}

function mergeState(next) {
  state = { profile: { ...DEFAULT_STATE.profile, ...(next.profile || {}) }, progress: { ...DEFAULT_STATE.progress, ...(next.progress || {}), answers: { ...DEFAULT_STATE.progress.answers, ...(next.progress?.answers || {}) } } };
  if (!THEMES[state.profile.theme]) state.profile.theme = 'coffee';
  if (!['sat', 'ielts'].includes(state.profile.exam)) state.profile.exam = 'sat';
}

async function persist() {
  try { await api('/api/state', { method: 'PUT', body: JSON.stringify(state) }); }
  catch { localStorage.setItem('luminary-state', JSON.stringify(state)); showToast('Saved in this browser while the local server is unavailable.'); }
}

function applyTheme(themeId) {
  const id = THEMES[themeId] ? themeId : 'coffee';
  state.profile.theme = id;
  const palette = THEMES[id];
  const root = document.documentElement;
  Object.entries(palette).forEach(([key, value]) => {
    if (key === 'name') return;
    root.style.setProperty(`--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, value);
  });
  document.querySelector('meta[name="theme-color"]').content = palette.bg;
  renderThemes();
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('is-shown');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-shown'), 2800);
}

function setExam(exam, returnHome = true) {
  state.profile.exam = exam;
  document.querySelectorAll('[data-exam]').forEach((button) => button.classList.toggle('is-active', button.dataset.exam === exam));
  document.querySelectorAll('.sat-only').forEach((item) => { item.hidden = exam !== 'sat'; });
  document.querySelectorAll('.ielts-only').forEach((item) => { item.hidden = exam !== 'ielts'; });
  $('profile-exam').value = exam;
  renderProfileControls();
  $('question-bank-copy').textContent = exam === 'ielts' ? 'Choose a skill, then start a focused set.' : 'Pick a section, then start a focused set.';
  renderHome();
  renderLearn();
  renderVocab();
  renderMocks();
  if (returnHome) openPage('home');
}

function renderHome() {
  const isIelts = state.profile.exam === 'ielts';
  const { target, date } = state.profile;
  $('home-kicker').textContent = isIelts ? 'IELTS plan' : 'SAT plan';
  $('home-copy').textContent = isIelts ? 'Build all four skills with a clear next step.' : 'Choose one focused task and keep moving.';
  $('goal-score').textContent = target || '--';
  $('goal-date').textContent = date ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T12:00:00`)) : 'Not selected';
  if (date) {
    const days = Math.ceil((new Date(`${date}T12:00:00`) - new Date()) / 86400000);
    $('goal-countdown').textContent = days > 0 ? plural(days, 'day') : days === 0 ? 'Today' : 'Date passed';
  } else $('goal-countdown').textContent = 'Set your date';
  $('daily-title').textContent = isIelts ? 'IELTS daily skill set' : 'SAT warm-up';
  $('daily-copy').textContent = isIelts ? 'One short activity for each skill.' : 'Ten focused questions. One honest baseline.';
  $('stat-focus').textContent = isIelts ? 'IELTS' : 'SAT';
  $('stat-sessions').textContent = state.progress.sessions || 0;
  $('stat-streak').textContent = state.progress.streak || 0;
  $('sidebar-name').textContent = state.profile.name || 'Learner';
}

function cards(items, target) {
  $(target).innerHTML = items.map((item) => `<button class="resource-card" type="button" data-open-practice="${item.set || 'math'}"><span>${item.label}</span><strong>${item.title}</strong><small>${item.copy}</small></button>`).join('');
}

function renderLearn() {
  const ielts = state.profile.exam === 'ielts';
  const skill = currentSkill || 'Listening';
  $('learn-kicker').textContent = ielts ? 'IELTS learn' : 'SAT learn';
  $('learn-title').textContent = ielts ? skill : 'Rules';
  $('learn-copy').textContent = ielts ? `Practice ${skill.toLowerCase()} with a focused path.` : 'Clear notes, examples, and short practice sets.';
  cards(ielts ? [
    { label: 'Understand', title: `${skill} foundations`, copy: 'Build the essential patterns first.', set: 'rw' },
    { label: 'Practice', title: `${skill} drills`, copy: 'Use short questions to build consistency.', set: 'rw' }
  ] : [
    { label: 'Grammar', title: 'Punctuation rules', copy: 'The rules that show up most often.', set: 'rw' },
    { label: 'Writing', title: 'Sentence boundaries', copy: 'Keep complete thoughts clear.', set: 'rw' },
    { label: 'Strategy', title: 'Transitions', copy: 'Find the logical relationship first.', set: 'rw' },
    { label: 'Review', title: 'Quick rule set', copy: 'A compact review before practice.', set: 'rw' }
  ], 'learn-grid');
}

function renderVocab() {
  const ielts = state.profile.exam === 'ielts';
  const skill = currentSkill || 'Listening';
  $('vocab-kicker').textContent = ielts ? `IELTS vocabulary / ${skill}` : 'SAT vocabulary';
  $('vocab-title').textContent = ielts ? `${skill} vocabulary` : 'Vocabulary';
  $('vocab-copy').textContent = ielts ? `Vocabulary in context for ${skill.toLowerCase()}.` : 'Small, repeatable review sessions.';
  cards(ielts ? [
    { label: 'Core', title: `${skill} essentials`, copy: 'High-frequency words in context.', set: 'rw' },
    { label: 'Review', title: 'Active recall', copy: 'Build a durable review habit.', set: 'rw' }
  ] : [
    { label: 'Core list', title: 'Must-know vocabulary', copy: 'Build your base of test-day words.', set: 'rw' },
    { label: 'Context', title: 'Words in context', copy: 'Understand how words shift meaning.', set: 'rw' },
    { label: 'Review', title: 'Daily review', copy: 'A small set that stays manageable.', set: 'rw' },
    { label: 'Practice', title: 'Vocabulary quiz', copy: 'Check what has actually stuck.', set: 'rw' }
  ], 'vocab-grid');
}

function renderProblems() {
  cards([
    { label: 'Math', title: 'Hardest math patterns', copy: 'A clean path through multi-step questions.', set: 'math' },
    { label: 'Strategy', title: 'When to use Desmos', copy: 'Use the tool only when it creates clarity.', set: 'math' },
    { label: 'Reading & Writing', title: 'Common traps', copy: 'Notice why each tempting answer fails.', set: 'rw' },
    { label: 'Review', title: 'Error log', copy: 'Turn every mistake into a repeatable lesson.', set: 'rw' }
  ], 'problems-grid');
}

function renderMocks() {
  const ielts = state.profile.exam === 'ielts';
  $('mocks-kicker').textContent = ielts ? 'IELTS practice' : 'SAT practice';
  $('mocks-title').textContent = ielts ? 'IELTS Mocks' : 'SAT Mocks';
  $('mock-one').textContent = ielts ? 'Full IELTS mock' : 'Full SAT';
  $('mock-two').textContent = ielts ? 'Listening module' : 'Math module';
}

function renderThemes() {
  $('theme-grid').innerHTML = Object.entries(THEMES).map(([id, theme]) => `<button class="theme-card ${id === state.profile.theme ? 'is-selected' : ''}" type="button" data-theme="${id}"><span class="theme-preview" style="--preview-bg:${theme.bg};--preview-surface:${theme.surface};--preview-accent:${theme.accent}"><i></i><b></b><em></em></span><span><strong>${theme.name}</strong><small>Background, surface, accent</small></span><span class="selected-label">Selected</span></button>`).join('');
}

function renderQuestion() {
  const question = QUESTIONS[currentSet][currentQuestion];
  const answer = state.progress.answers[question.id];
  const section = currentSet === 'math' ? 'Math' : 'Reading & Writing';
  $('flash-section').textContent = section;
  $('flash-number').textContent = String(currentQuestion + 1).padStart(2, '0');
  $('question-counter').textContent = `Question ${currentQuestion + 1} of ${QUESTIONS[currentSet].length}`;
  $('question-domain').textContent = question.domain;
  $('question-prompt').textContent = question.prompt;
  $('bluebook-module').textContent = `${section} / Module 1`;
  $('bluebook-prompt').textContent = question.prompt;
  const answers = question.answers.map((text, index) => `<button class="answer-option ${answer === index ? 'is-selected' : ''}" data-answer="${index}" type="button"><span class="answer-letter">${'ABCD'[index]}</span><span>${text}</span></button>`).join('');
  $('answer-list').innerHTML = answers;
  $('bluebook-answers').innerHTML = answers;
  const dots = QUESTIONS[currentSet].map((item, index) => `<button type="button" data-jump="${index}" class="${index === currentQuestion ? 'is-current' : ''} ${state.progress.answers[item.id] !== undefined ? 'is-done' : ''}" aria-label="Question ${index + 1}"></button>`).join('');
  $('question-dots').innerHTML = dots;
  $('bluebook-numbers').innerHTML = QUESTIONS[currentSet].map((item, index) => `<button type="button" data-jump="${index}" class="${index === currentQuestion ? 'is-current' : ''}">${index + 1}</button>`).join('');
  $('previous-question').disabled = currentQuestion === 0;
  $('bluebook-previous').disabled = currentQuestion === 0;
  $('next-question').textContent = currentQuestion === QUESTIONS[currentSet].length - 1 ? 'Finish' : 'Next';
  $('bluebook-next').textContent = $('next-question').textContent;
}

function setPracticeMode(mode) {
  practiceMode = mode;
  $('test-stage').classList.toggle('practice-bluebook', mode === 'bluebook');
  document.querySelectorAll('[data-mode]').forEach((button) => button.classList.toggle('is-active', button.dataset.mode === mode));
  $('switch-mode').textContent = mode === 'bluebook' ? 'Switch to FlashSAT' : 'Switch to Bluebook';
}

function startPractice(set = 'math') {
  currentSet = set === 'daily' ? 'math' : set === 'mock' ? 'math' : set;
  if (!QUESTIONS[currentSet]) currentSet = 'math';
  currentQuestion = 0;
  openPage('questions');
  $('question-library').classList.add('is-hidden');
  $('test-stage').classList.remove('is-hidden');
  setPracticeMode(practiceMode);
  renderQuestion();
}

function leavePractice() {
  $('question-library').classList.remove('is-hidden');
  $('test-stage').classList.add('is-hidden');
}

function answerQuestion(index) {
  const question = QUESTIONS[currentSet][currentQuestion];
  state.progress.answers[question.id] = index;
  renderQuestion();
  persist();
}

function moveQuestion(delta) {
  const next = currentQuestion + delta;
  if (next >= QUESTIONS[currentSet].length) {
    state.progress.sessions += 1;
    state.progress.streak = Math.max(1, state.progress.streak || 0);
    persist();
    renderHome();
    showToast('Practice set complete. Progress saved.');
    leavePractice();
    return;
  }
  if (next < 0) return;
  currentQuestion = next;
  renderQuestion();
}

function openPage(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach((section) => section.classList.toggle('is-active', section.id === `${page}-page`));
  document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('is-active', link.dataset.page === page && (!link.dataset.skill || link.dataset.skill === currentSkill)));
  if (page !== 'questions') leavePractice();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderProfileControls() {
  const isSat = state.profile.exam === 'sat';
  const scores = isSat ? Array.from({ length: 121 }, (_, index) => String(400 + index * 10)) : Array.from({ length: 19 }, (_, index) => (index / 2).toFixed(1));
  $('profile-score').innerHTML = `<option value="">Choose a target score</option>${scores.map((score) => `<option value="${score}">${isSat ? score : score}</option>`).join('')}`;
  $('profile-score').value = scores.includes(state.profile.target) ? state.profile.target : '';
  $('score-help').textContent = isSat ? 'SAT scores are available from 400 to 1600 in 10-point steps.' : 'IELTS overall bands are available from 0.0 to 9.0 in 0.5-band steps.';

  $('profile-sat-date').innerHTML = `<option value="">Choose an SAT test date</option>${SAT_DATES.map((date) => `<option value="${date}">${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T12:00:00`))}</option>`).join('')}`;
  $('profile-sat-date').value = SAT_DATES.includes(state.profile.date) ? state.profile.date : '';
  $('profile-sat-date').hidden = !isSat;
  $('profile-date').hidden = isSat;
  $('profile-date').value = !isSat ? state.profile.date : '';
  $('date-help').textContent = isSat ? 'Official and anticipated SAT dates through June 2028.' : 'Choose any IELTS date through December 2028.';
}

function syncProfileForm() {
  $('profile-name').value = state.profile.name;
  $('profile-exam').value = state.profile.exam;
  renderProfileControls();
}

function applyAuthenticatedUser(user) {
  if (!user?.name || state.profile.name) return;
  state.profile.name = user.name;
  syncProfileForm();
  renderHome();
  persist();
}

function bindEvents() {
  window.addEventListener('luminary:auth-state', (event) => applyAuthenticatedUser(event.detail));
  window.addEventListener('luminary:auth-error', (event) => showToast(event.detail));
  document.addEventListener('click', (event) => {
    const exam = event.target.closest('[data-exam]');
    if (exam) { setExam(exam.dataset.exam); persist(); return; }
    const page = event.target.closest('[data-page]');
    if (page) { currentSkill = page.dataset.skill || ''; openPage(page.dataset.page); return; }
    const theme = event.target.closest('[data-theme]');
    if (theme) { applyTheme(theme.dataset.theme); persist(); showToast(`${THEMES[theme.dataset.theme].name} palette selected.`); return; }
    const set = event.target.closest('[data-start-set], [data-open-practice]');
    if (set) { startPractice(set.dataset.startSet || set.dataset.openPractice); return; }
    const answer = event.target.closest('[data-answer]');
    if (answer) { answerQuestion(Number(answer.dataset.answer)); return; }
    const jump = event.target.closest('[data-jump]');
    if (jump) { currentQuestion = Number(jump.dataset.jump); renderQuestion(); return; }
    const mode = event.target.closest('[data-mode]');
    if (mode) { setPracticeMode(mode.dataset.mode); return; }
  });
  $('leave-practice').addEventListener('click', leavePractice);
  $('previous-question').addEventListener('click', () => moveQuestion(-1));
  $('bluebook-previous').addEventListener('click', () => moveQuestion(-1));
  $('next-question').addEventListener('click', () => moveQuestion(1));
  $('bluebook-next').addEventListener('click', () => moveQuestion(1));
  $('switch-mode').addEventListener('click', () => setPracticeMode(practiceMode === 'flash' ? 'bluebook' : 'flash'));
  $('mark-question').addEventListener('click', () => showToast('Question marked for review.'));
  $('profile-exam').addEventListener('change', () => {
    state.profile.target = '';
    state.profile.date = '';
    setExam($('profile-exam').value, false);
  });
  $('profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    state.profile.name = $('profile-name').value.trim();
    state.profile.target = $('profile-score').value;
    const newExam = $('profile-exam').value;
    state.profile.date = newExam === 'sat' ? $('profile-sat-date').value : $('profile-date').value;
    setExam(newExam, false);
    syncProfileForm();
    renderHome();
    await persist();
    showToast('Settings saved.');
  });
}

async function init() {
  try { mergeState(await api('/api/state')); }
  catch { try { mergeState(JSON.parse(localStorage.getItem('luminary-state') || '{}')); } catch { mergeState(DEFAULT_STATE); } }
  applyTheme(state.profile.theme);
  syncProfileForm();
  renderProblems();
  renderHome();
  setExam(state.profile.exam, false);
  bindEvents();
  applyAuthenticatedUser(window.luminaryAuthUser);
}

init();
