'use strict';

window.luminaryAppLoaded = true;

const THEMES = {
  coffee: { name: 'Cappuccino White', bg: '#fbfaf8', surface: '#ffffff', surfaceRaised: '#f7f3ef', sidebar: '#514137', sidebarSurface: '#665247', text: '#292522', textSoft: '#756c66', textMuted: '#a39b95', line: '#ebe6e2', accent: '#a97758', accentHover: '#855a41', accentSoft: '#f3eae4', onAccent: '#ffffff', sideText: '#fffdfb', sideMuted: '#e4d9d2', success: '#47745b', danger: '#b34f45' },
  dark: { name: 'Dark', bg: '#171717', surface: '#222222', surfaceRaised: '#2b2b2b', sidebar: '#101010', sidebarSurface: '#303030', text: '#f7f3ed', textSoft: '#c2bbb1', textMuted: '#938b82', line: '#42403d', accent: '#d3a75a', accentHover: '#e2bb73', accentSoft: '#40331e', onAccent: '#241b10', sideText: '#faf7f1', sideMuted: '#bdb6ad', success: '#69bb8c', danger: '#ed8279' },
  navy: { name: 'Dark Blue', bg: '#ffffff', surface: '#ffffff', surfaceRaised: '#ffffff', sidebar: '#101c30', sidebarSurface: '#1d304d', text: '#17263e', textSoft: '#60718a', textMuted: '#8593a6', line: '#dfe5ec', accent: '#357fc4', accentHover: '#2467a8', accentSoft: '#dcecfb', onAccent: '#ffffff', sideText: '#f8fbff', sideMuted: '#bdcbe0', success: '#287a58', danger: '#bf504d' },
  navyFull: { name: 'Dark Blue Fully', bg: '#0a1628', surface: '#0f2035', surfaceRaised: '#162840', sidebar: '#07101e', sidebarSurface: '#172b45', text: '#edf5ff', textSoft: '#b8c9dc', textMuted: '#8199b3', line: '#29415d', accent: '#4a9eda', accentHover: '#70b8e8', accentSoft: '#183d5c', onAccent: '#ffffff', sideText: '#f8fbff', sideMuted: '#a9bfd7', success: '#69bb8c', danger: '#ed8279' },
  purple: { name: 'Dark Purple', bg: '#1b1422', surface: '#251b30', surfaceRaised: '#30223d', sidebar: '#120d18', sidebarSurface: '#372744', text: '#faf4ff', textSoft: '#d2c1dc', textMuted: '#a791b2', line: '#4b395b', accent: '#c69ce6', accentHover: '#dcbaef', accentSoft: '#442c58', onAccent: '#281537', sideText: '#fff8ff', sideMuted: '#d0bfd9', success: '#75bd9b', danger: '#ef92a0' },
  forest: { name: 'Forest', bg: '#15211c', surface: '#1d2d25', surfaceRaised: '#283b30', sidebar: '#0e1813', sidebarSurface: '#2a4535', text: '#f4fbf5', textSoft: '#c1d2c4', textMuted: '#91a896', line: '#3c5445', accent: '#88c99e', accentHover: '#aadab9', accentSoft: '#224d37', onAccent: '#0d2d1c', sideText: '#f6fff7', sideMuted: '#bdd2c1', success: '#8ad0a0', danger: '#f2948b' },
  sunset: { name: 'Sunset', bg: '#2a1b18', surface: '#38231e', surfaceRaised: '#482c24', sidebar: '#1d110f', sidebarSurface: '#4f2f25', text: '#fff6ed', textSoft: '#dec7b5', textMuted: '#b59680', line: '#624237', accent: '#ec8c57', accentHover: '#f2a06f', accentSoft: '#603222', onAccent: '#3a170d', sideText: '#fff7f0', sideMuted: '#dbc3b1', success: '#92c48d', danger: '#f08077' }
};

const DEFAULT_STATE = {
  profile: { name: '', exam: 'sat', target: '', date: '', goals: { sat: { target: '', date: '' }, ielts: { target: '', date: '' } }, theme: 'navy', planPreferences: { currentScore: '', currentRw: '', currentMath: '', minutes: 60, weakTopics: [] } },
  progress: { sessions: 0, streak: 0, lastSessionDate: '', answers: {}, marked: {}, eliminated: {}, questionHistory: [] },
  studyPlan: { setup: null, generatedAt: 0, tasks: [] }
};

const SAT_DATES = ['2026-08-22', '2026-09-12', '2026-10-03', '2026-11-07', '2026-12-05', '2027-03-06', '2027-05-01', '2027-06-05', '2027-08-28', '2027-09-18', '2027-10-02', '2027-11-06', '2027-12-04', '2028-03-04', '2028-05-06', '2028-06-03'];
const SAT_TOPIC_GROUPS = {
  rw: [
    { title: 'Information and Ideas', topics: ['Central Ideas and Details', 'Inferences', 'Command of Evidence'] },
    { title: 'Craft and Structure', topics: ['Words in Context', 'Text Structure and Purpose', 'Cross-Text Connections'] },
    { title: 'Expression of Ideas', topics: ['Rhetorical Synthesis', 'Transitions'] },
    { title: 'Standard English Conventions', topics: ['Boundaries', 'Form, Structure, and Sense'] }
  ],
  math: [
    { title: 'Algebra', topics: ['Linear equations in one variable', 'Linear functions', 'Linear equations in two variables', 'Systems of two linear equations in two variables', 'Linear inequalities in one or two variables'] },
    { title: 'Advanced Math', topics: ['Nonlinear functions', 'Nonlinear equations in one variable and systems of equations in two variables', 'Equivalent expressions'] },
    { title: 'Problem-Solving and Data Analysis', topics: ['Ratios, rates, proportional relationships, and units', 'Percentages', 'One-variable data: Distributions and measures of center and spread', 'Two-variable data: Models and scatterplots', 'Probability and conditional probability', 'Inference from sample statistics and margin of error', 'Evaluating statistical claims: Observational studies and experiments'] },
    { title: 'Geometry and Trigonometry', topics: ['Area and volume', 'Lines, angles, and triangles', 'Right triangles and trigonometry', 'Circles'] }
  ]
};
const SAT_CATEGORIES = Object.fromEntries(Object.entries(SAT_TOPIC_GROUPS).map(([set, groups]) => [set, groups.map((group) => group.title)]));
const DAILY_QUOTES = [
  'Make today small enough to start and meaningful enough to finish.',
  'Your score changes when your habits become more precise.',
  'One honest correction is worth more than ten rushed answers.',
  'Train the reason you missed it, not only the question you missed.',
  'Consistency makes difficult work feel familiar.',
  'A focused twenty minutes can redirect an entire week.',
  'Every mistake is useful once you name its cause.',
  'Do the next clear thing. Momentum will handle the rest.',
  'Accuracy first. Speed follows understanding.',
  'Progress hides inside the questions you once avoided.',
  'You do not need a perfect day to build a better result.',
  'The strongest study plan changes when the evidence changes.',
  'Confidence grows from keeping promises to yourself.',
  'Slow thinking today creates fast decisions on test day.',
  'Review is where practice turns into skill.',
  'A weak area is simply a direction for your next session.',
  'Small wins are how ambitious scores are built.',
  'The question that frustrates you can become the one that teaches you most.',
  'Your future score is being shaped by this ordinary session.',
  'Learn the pattern, then make the pattern automatic.',
  'Clarity beats intensity when intensity has no direction.',
  'You are not behind; you are collecting the data needed to improve.',
  'Repeat the skill, not the same mistake.',
  'A calm mind notices what a hurried mind skips.',
  'Today’s work only needs to be real, not impressive.',
  'Measure progress by what has become easier to explain.',
  'The best strategy is the one you can repeat tomorrow.',
  'Difficult questions become manageable when the process stays simple.',
  'Your mistakes are a map, not a verdict.',
  'Practice with attention and the score will follow.',
  'Mastery begins when you stop guessing why you were wrong.',
  'Protect your focus; it is your fastest route forward.',
  'A better method can save more points than more effort.',
  'Each corrected misconception removes many future errors.',
  'The goal is not more questions. The goal is fewer repeated mistakes.',
  'Give one skill your full attention before asking for another.',
  'Good preparation feels deliberate, not frantic.',
  'Turn uncertainty into a question, then answer it.',
  'The work you repeat becomes the confidence you carry.',
  'You improve fastest when feedback changes your next move.',
  'The score is an outcome; the system is what you control.',
  'Finish one focused set before judging the whole journey.',
  'Strong students are built by strong review loops.',
  'What you understand deeply stays available under pressure.',
  'The next five questions deserve more attention than the last fifty.',
  'Practice is successful when tomorrow’s mistake becomes less likely.',
  'Precision today becomes speed when the clock starts.',
  'Your plan should follow your errors, not your mood.',
  'A clear reason for studying makes starting easier.',
  'Keep the session focused enough to learn from it.'
];

const MATERIAL_DATABASE_URL = 'https://dataluminary-default-rtdb.europe-west1.firebasedatabase.app';
const QUESTION_DATABASE_URL = 'https://luminary-46748-default-rtdb.europe-west1.firebasedatabase.app';
const SPEAKING_AI_SERVICE_URL = 'https://lsatieltsai.crazy-dinow.workers.dev';
const HACK_SECTIONS = [
  { id: 'geo-problems', title: 'SAT Must-Solve Geometry Problems', set: 'math' },
  { id: 'desmos-solutions', title: 'Desmos Solutions for Hardest Questions', set: 'math' },
  { id: 'inference', title: 'Inference: All Hardest Questions', set: 'rw' },
  { id: 'desmos-guide', title: 'Desmos Guide', set: 'math' },
  { id: 'desmos-tips', title: '10 Desmos Tips', set: 'math' }
];

let state = structuredClone(DEFAULT_STATE);
let currentPage = 'home';
let currentSkill = '';
let currentSet = 'math';
let currentQuestion = 0;
let questionBankView = 'sections';
let selectedQuestionTopics = [];
let practiceQuestions = [];
let materialContext = { category: 'rules', id: '' };
let timerSeconds = 0;
let timerRunning = false;
let timerHidden = false;
let timerHandle = null;
let toastTimer;
let goalSaveTimer;
let draftAnswers = {};
let checkedAnswers = {};
let practiceMode = 'bank';
let activePlanTaskId = '';
let questionOpenedAt = 0;
let explanationOpen = false;
const remoteMaterials = {};
const remoteMaterialLoads = {};
const remotePractice = { questions: { sat:{status:'idle',items:[]}, ielts:{status:'idle',items:[]} }, mocks: {}, prep: {} };
const dailyQuestionStore = { sat: { status: 'idle', question: null }, ielts: { status: 'idle', question: null } };
const questionTopicCache = { sat: {}, ielts: {} };
const questionBankLoads = {};
let questionSetLoading = false;
const QUESTION_CACHE_DB = 'luminary-question-cache';
const QUESTION_CACHE_MAX_AGE = 12 * 60 * 60 * 1000;
const MATERIAL_CACHE_PREFIX = 'luminary-material-cache:';
const MATERIAL_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
const ACTIVE_PRACTICE_KEY = 'luminary-active-practice';
const ONBOARDING_KEY = 'luminary-onboarding-v3-complete';
let activeAccountId = '';
let onboardingStep = 1;
let onboardingExam = '';
let practiceXp = 0;
let practiceStreak = 0;
const vocabularyStores = {
  sat: { folders: [], words: [], status: 'idle' },
  ielts: { folders: [], words: [], status: 'idle' }
};
let vocabularyContext = { exam: 'sat', folder: '', query: '', page: 0 };
let vocabularyReview = { words: [], index: 0, known: 0, revealed: false };
let voiceLab = {
  recognition: null,
  listening: false,
  pending: false,
  speaking: false,
  active: false,
  finalText: '',
  interimText: '',
  messages: [],
  requestController: null,
  restartTimer: null,
  utterance: null
};

const $ = (id) => document.getElementById(id);
const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
const dateText = (date) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const compactDisplayText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

async function api(path, options = {}) {
  const isLocalServer = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
  if (!isLocalServer) throw new Error('The local API is unavailable on the published site.');
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, keepalive: true, ...options });
  if (!response.ok) throw new Error('Request failed');
  return response.json();
}

function mergeState(next) {
  const progress = next?.progress || {};
  state = {
    profile: { ...DEFAULT_STATE.profile, ...(next?.profile || {}) },
    progress: {
      ...DEFAULT_STATE.progress,
      ...progress,
      lastSessionDate: String(progress.lastSessionDate || ''),
      answers: { ...DEFAULT_STATE.progress.answers, ...(progress.answers || {}) },
      marked: { ...DEFAULT_STATE.progress.marked, ...(progress.marked || {}) },
      eliminated: { ...DEFAULT_STATE.progress.eliminated, ...(progress.eliminated || {}) },
      questionHistory: Array.isArray(progress.questionHistory) ? progress.questionHistory.slice(-600) : []
    },
    studyPlan: {
      ...DEFAULT_STATE.studyPlan,
      ...(next?.studyPlan || {}),
      tasks: Array.isArray(next?.studyPlan?.tasks) ? next.studyPlan.tasks : []
    }
  };
  state.profile.planPreferences = { ...DEFAULT_STATE.profile.planPreferences, ...(next?.profile?.planPreferences || {}) };
  if (!THEMES[state.profile.theme]) state.profile.theme = 'navy';
  if (!['sat', 'ielts'].includes(state.profile.exam)) state.profile.exam = 'sat';
  const savedGoals = next?.profile?.goals || {};
  state.profile.goals = {
    sat: { ...DEFAULT_STATE.profile.goals.sat, ...(savedGoals.sat || {}) },
    ielts: { ...DEFAULT_STATE.profile.goals.ielts, ...(savedGoals.ielts || {}) }
  };
  if (!savedGoals.sat && !savedGoals.ielts) {
    state.profile.goals[state.profile.exam] = { target: state.profile.target || '', date: state.profile.date || '' };
  }
  const goal = state.profile.goals[state.profile.exam];
  state.profile.target = goal.target;
  state.profile.date = goal.date;
}

function activeGoal() {
  return state.profile.goals[state.profile.exam];
}

function setActiveGoal(target, date) {
  state.profile.goals[state.profile.exam] = { target, date };
  state.profile.target = target;
  state.profile.date = date;
}

async function persist() {
  const savedState = structuredClone(state);
  localStorage.setItem(stateStorageKey(), JSON.stringify(savedState));
  if (activeAccountId) return;
  try { await api('/api/state', { method: 'PUT', body: JSON.stringify(savedState) }); }
  catch { /* Published accounts use the account-scoped browser store. */ }
}

function stateStorageKey(accountId = activeAccountId) {
  return accountId ? `luminary-state:${accountId}` : 'luminary-state';
}

function applyTheme(themeId) {
  const id = THEMES[themeId] ? themeId : 'navy';
  state.profile.theme = id;
  const palette = THEMES[id];
  Object.entries(palette).forEach(([key, value]) => {
    if (key !== 'name') document.documentElement.style.setProperty(`--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, value);
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

function setMobileDrawer(open) {
  const sidebar = $('sidebar');
  const backdrop = $('mobile-drawer-backdrop');
  if (!sidebar || !backdrop) return;
  sidebar.classList.toggle('is-open', open);
  backdrop.classList.toggle('is-visible', open);
  $('mobile-menu-button').setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('is-drawer-open', open);
}

function setExam(exam, returnHome = true) {
  state.profile.exam = exam === 'ielts' ? 'ielts' : 'sat';
  const goal = activeGoal();
  state.profile.target = goal.target;
  state.profile.date = goal.date;
  currentSkill = '';
  questionBankView='sections';selectedQuestionTopics=[];currentSet=state.profile.exam==='sat'?'math':'listening';
  document.querySelectorAll('[data-exam]').forEach((button) => button.classList.toggle('is-active', button.dataset.exam === state.profile.exam));
  document.querySelectorAll('.sat-only').forEach((item) => { item.hidden = state.profile.exam !== 'sat'; });
  document.querySelectorAll('.ielts-only').forEach((item) => { item.hidden = state.profile.exam !== 'ielts'; });
  renderQuestionBank();
  renderHomeControls();
  renderHome();
  renderLearn();
  renderVocab();
  renderProblems();
  renderMocks();
  renderStudyPlan();
  if (returnHome) openPage('home');
}

function dailyQuote() {
  const now = new Date();
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  const identity = `${activeAccountId}:${state.profile.name}`;
  const identitySeed = [...identity].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return DAILY_QUOTES[(day + identitySeed) % DAILY_QUOTES.length];
}

function personalRecommendations() {
  const exam = state.profile.exam;
  const history = (state.progress.questionHistory || []).filter((entry) => entry.exam === exam).slice(-160);
  const groups = new Map();
  history.forEach((entry, index) => {
    const topic = compactDisplayText(entry.domain || entry.skill || entry.set || 'Practice');
    const key = `${entry.set || ''}:${topic}`;
    const item = groups.get(key) || { topic, set: entry.set || (exam === 'sat' ? 'math' : 'reading'), attempts: 0, errors: 0, recentErrors: 0 };
    item.attempts += 1;
    if (!entry.correct) {
      item.errors += 1;
      if (index >= history.length - 40) item.recentErrors += 1;
    }
    groups.set(key, item);
  });
  const ranked = [...groups.values()]
    .filter((item) => item.errors > 0)
    .map((item) => ({ ...item, accuracy: Math.round(((item.attempts - item.errors) / item.attempts) * 100), priority: item.errors * 2 + item.recentErrors * 3 + Math.max(0, 5 - item.attempts) }))
    .sort((left, right) => right.priority - left.priority)
    .slice(0, 3);
  if (ranked.length) return ranked;
  return exam === 'sat'
    ? [
      { topic: 'Standard English Conventions', set: 'rw', attempts: 0, errors: 0 },
      { topic: 'Algebra', set: 'math', attempts: 0, errors: 0 },
      { topic: 'Information and Ideas', set: 'rw', attempts: 0, errors: 0 }
    ]
    : ['Listening', 'Reading', 'Writing'].map((topic) => ({ topic, set: topic.toLowerCase(), attempts: 0, errors: 0 }));
}

function renderRecommendations() {
  const recommendations = personalRecommendations();
  const hasEvidence = recommendations.some((item) => item.attempts > 0);
  $('recommendation-copy').textContent = hasEvidence
    ? 'Built from your recent wrong answers. Completing a set updates the order automatically.'
    : 'Complete a few questions and Luminary will replace these starters with your personal weak areas.';
  $('recommendation-grid').innerHTML = recommendations.map((item, index) => {
    const evidence = item.attempts ? `${item.accuracy}% accuracy · ${item.errors} ${item.errors === 1 ? 'error' : 'errors'}` : 'Starter diagnostic';
    return `<article class="recommendation-card"><span>${index === 0 && hasEvidence ? 'Highest priority' : `Focus ${index + 1}`}</span><strong>${escapeHtml(item.topic)}</strong><p>${escapeHtml(evidence)}</p><div class="recommendation-actions"><button class="button button-primary" data-train-topic="${escapeHtml(item.topic)}" data-train-set="${escapeHtml(item.set)}" type="button">Train now</button>${state.profile.exam === 'sat' ? `<button class="recommendation-link" data-review-topic="${escapeHtml(item.topic)}" type="button">Review</button>` : ''}</div></article>`;
  }).join('');
}

async function startRecommendedTraining(topic, set) {
  showToast(`Building a focused ${topic} set...`);
  let questions = await loadQuestionTopics(state.profile.exam, [topic]);
  if (!questions.length) {
    try {
      const query = `orderBy=${encodeURIComponent('"$key"')}&limitToFirst=60`;
      const data = await fetchDatabaseData(QUESTION_DATABASE_URL, `question-bank/${state.profile.exam}?${query}`, 18000);
      const starterQuestions = Object.entries(data || {}).map(([id, item]) => remoteQuestion(id, item, `${state.profile.exam}-starter`)).filter(validRemoteQuestion);
      questions = starterQuestions.filter((question) => question.set === set);
      if (!questions.length) questions = starterQuestions;
    } catch { questions = []; }
  }
  const recentIds = new Set((state.progress.questionHistory || []).slice(-120).map((entry) => entry.id));
  const ordered = [...questions.filter((question) => !recentIds.has(question.id)), ...questions.filter((question) => recentIds.has(question.id))].slice(0, 10);
  if (!ordered.length) { showToast('No questions are available for this focus yet.'); return; }
  startPractice(set || ordered[0].set, 0, ordered, 'adaptive');
}

async function openRecommendedMaterial(topic) {
  await loadRemoteMaterials('rules');
  const words = topic.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3);
  const material = getMaterials('rules').find((item) => {
    const searchable = `${item.title} ${(item.body || []).map((block) => `${block.heading} ${block.text}`).join(' ')}`.toLowerCase();
    return words.some((word) => searchable.includes(word));
  });
  if (material) openMaterial('rules', material.id);
  else { currentSkill = ''; openPage('learn'); renderLearn(); showToast('Opening the closest available rule library.'); }
}

function renderHome() {
  const isIelts = state.profile.exam === 'ielts';
  const { target, date } = activeGoal();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  $('home-greeting').textContent = `${greeting}${state.profile.name ? `, ${state.profile.name.split(/\s+/)[0]}` : ''}.`;
  $('daily-quote').textContent = dailyQuote();
  $('daily-quote-day').textContent = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  $('home-kicker').textContent = isIelts ? 'IELTS plan' : 'SAT plan';
  $('home-copy').textContent = isIelts ? 'Your next useful IELTS session is ready.' : 'Your next useful SAT session is ready.';
  $('goal-score').textContent = target || '--';
  $('goal-date').textContent = date ? dateText(date) : 'Not selected';
  if (date) {
    const days = Math.ceil((new Date(`${date}T12:00:00`) - new Date()) / 86400000);
    $('goal-countdown').textContent = days > 0 ? plural(days, 'day') : days === 0 ? 'Today' : 'Date passed';
  } else $('goal-countdown').textContent = 'Set your date';
  const daily = dailyQuestionStore[state.profile.exam];
  if (daily.status === 'idle') loadDailyQuestion(state.profile.exam);
  $('daily-title').textContent = isIelts ? 'Daily IELTS question' : 'Daily SAT question';
  if (daily.status === 'loading') {
    $('daily-copy').textContent = 'Loading today\'s separate question...';
    $('daily-action').disabled = true;
    $('daily-action').textContent = 'Loading';
  } else if (daily.question) {
    $('daily-copy').textContent = 'Available for today only.';
    $('daily-action').disabled = false;
    $('daily-action').textContent = 'Start daily question';
  } else {
    $('daily-copy').textContent = 'No daily question has been published for today.';
    $('daily-action').disabled = true;
    $('daily-action').textContent = 'Not available';
  }
  $('stat-focus').textContent = isIelts ? 'IELTS' : 'SAT';
  $('stat-sessions').textContent = state.progress.sessions || 0;
  $('stat-streak').textContent = state.progress.streak || 0;
  $('sidebar-name').textContent = state.profile.name || 'Learner';
  renderRecommendations();
  const plan = state.studyPlan;
  const todayTask = plan.tasks.find((task) => task.date === localDateKey(new Date()) && task.status !== 'completed' && task.status !== 'skipped');
  $('home-plan-card').hidden = isIelts || !plan.setup;
  if (!isIelts && plan.setup) {
    $('home-plan-copy').textContent = todayTask ? `${todayTask.title} · about ${todayTask.minutes} min` : 'Today is clear. Review your upcoming plan.';
    $('home-plan-action').textContent = todayTask ? 'Start today\'s task' : 'Open study plan';
    $('home-plan-action').dataset.planTask = todayTask?.id || '';
  }
}

function localDateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function planDayOffset(date, days) {
  const copy = new Date(`${date}T12:00:00`);
  copy.setDate(copy.getDate() + days);
  return localDateKey(copy);
}

function satGoalOptions() {
  return Array.from({ length: 121 }, (_, index) => String(400 + index * 10));
}

function balancedSectionScore(total, preferred = 0) {
  const value = Math.max(400, Math.min(1600, Number(total) || 400));
  const split = preferred || Math.round(value / 20) * 10;
  return Math.max(200, Math.min(800, split));
}

function emptyPlanSetup() {
  const goal = state.profile.goals.sat || {};
  const target = goal.target || '';
  const targetRw = target ? balancedSectionScore(target) : '';
  return { currentTotal: '', currentRw: '', currentMath: '', target, targetRw, targetMath: target ? String(Number(target) - Number(targetRw)) : '', weakTopics: [], date: goal.date || '', minutes: 60 };
}

function onboardingOptionList(items, label) {
  return `<option value="">${label}</option>${items.map((value) => `<option value="${value}">${value}</option>`).join('')}`;
}

function populateOnboarding(exam) {
  const totals = satGoalOptions();
  const bands = Array.from({ length: 19 }, (_, index) => (index / 2).toFixed(1));
  const futureSatDates = SAT_DATES.filter((date) => date >= localDateKey(new Date()));
  $('onboarding-goal').innerHTML = exam === 'sat' ? onboardingOptionList(totals, 'Choose target score') : onboardingOptionList(bands, 'Choose target band');
  $('onboarding-sat-date').innerHTML = `<option value="">Choose test date</option>${futureSatDates.map((date) => `<option value="${date}">${dateText(date)}</option>`).join('')}`;
  $('onboarding-ielts-date').min = localDateKey(new Date());
  $('onboarding-current-total').innerHTML = onboardingOptionList(totals, 'Choose current score');
  $('onboarding-current-band').innerHTML = onboardingOptionList(bands, 'Choose current band');
  $('onboarding-sat-date-wrap').hidden = exam !== 'sat';
  $('onboarding-ielts-date-wrap').hidden = exam === 'sat';
  $('onboarding-current-total-wrap').hidden = exam !== 'sat';
  $('onboarding-current-band-wrap').hidden = exam === 'sat';
  $('onboarding-sat-weaknesses').hidden = exam !== 'sat';
  $('onboarding-ielts-weaknesses').hidden = exam === 'sat';
  if (!$('onboarding-sat-weaknesses').children.length) {
    $('onboarding-sat-weaknesses').innerHTML = ['rw', 'math'].flatMap((set) => (SAT_TOPIC_GROUPS[set] || []).map((group) => `<label><input type="checkbox" data-onboarding-weak="${escapeHtml(group.title)}"><span>${escapeHtml(group.title)}</span></label>`)).join('');
  }
  if (!$('onboarding-ielts-weaknesses').children.length) {
    $('onboarding-ielts-weaknesses').innerHTML = ['Listening', 'Reading', 'Writing', 'Speaking'].map((skill) => `<label><input type="checkbox" data-onboarding-weak="${skill}"><span>${skill}</span></label>`).join('');
  }
  updateOnboardingGoalPreview();
}

function updateOnboardingGoalPreview() {
  /* Individual onboarding screens no longer need a combined preview. */
}

function showOnboardingStep(step) {
  onboardingStep = Math.max(1, Math.min(6, step));
  const content = {
    1: ['1 of 6', 'Choose your exam.', 'Your workspace will adapt around this choice.', 'Exam'],
    2: ['2 of 6', 'Set a score to aim for.', 'A clear target helps Luminary measure useful progress.', 'Target'],
    3: ['3 of 6', 'When will you take it?', 'Choose the date that sets your pace.', 'Date'],
    4: ['4 of 6', 'Where are you today?', 'A starting point keeps recommendations realistic.', 'Current level'],
    5: ['5 of 6', 'What needs more attention?', 'Pick any areas you want to strengthen first.', 'Focus'],
    6: ['6 of 6', 'How much time feels sustainable?', 'Choose a daily rhythm you can actually keep.', 'Time']
  }[onboardingStep];
  $('onboarding-kicker').textContent = content[0];
  $('onboarding-title').textContent = content[1];
  $('onboarding-copy').textContent = content[2];
  $('onboarding-step-label').textContent = content[3];
  $('onboarding-error').textContent = '';
  document.querySelectorAll('[data-onboarding-step]').forEach((section) => { section.hidden = Number(section.dataset.onboardingStep) !== onboardingStep; });
  $('onboarding-progress-fill').style.width = `${onboardingStep / 6 * 100}%`;
  $('onboarding-back').hidden = onboardingStep === 1;
  $('onboarding-next').textContent = onboardingStep === 6 ? 'Finish setup' : 'Continue';
  $('onboarding-main')?.scrollTo?.({ top: 0, behavior: 'smooth' });
}

function startOnboarding() {
  if (localStorage.getItem(ONBOARDING_KEY) === '1') return;
  onboardingStep = 1;
  onboardingExam = '';
  document.querySelectorAll('[data-onboarding-exam]').forEach((button) => button.classList.remove('is-selected'));
  $('onboarding-view').hidden = false;
  document.body.classList.add('is-onboarding-open');
  showOnboardingStep(1);
}

function skipOnboarding() {
  localStorage.setItem(ONBOARDING_KEY, '1');
  $('onboarding-view').hidden = true;
  document.body.classList.remove('is-onboarding-open');
  openPage('home');
  showToast('Onboarding skipped. You can set your exam and goal anytime.');
}

function validateOnboardingStep() {
  if (onboardingStep === 1 && !onboardingExam) return 'Choose SAT or IELTS to continue.';
  if (onboardingStep === 2 && !$('onboarding-goal').value) return 'Choose your target score.';
  if (onboardingStep === 3 && !(onboardingExam === 'sat' ? $('onboarding-sat-date').value : $('onboarding-ielts-date').value)) return 'Choose your exam date.';
  if (onboardingStep === 4 && onboardingExam === 'sat') {
    const currentTotal = Number($('onboarding-current-total').value);
    const target = Number($('onboarding-goal').value);
    if (!currentTotal) return 'Choose your current SAT score.';
    if (target <= currentTotal) return 'Your target score should be above your current score.';
  }
  if (onboardingStep === 4 && onboardingExam === 'ielts') {
    const current = Number($('onboarding-current-band').value);
    const target = Number($('onboarding-goal').value);
    if (!$('onboarding-current-band').value) return 'Choose your current IELTS band.';
    if (target <= current) return 'Your target band should be above your current band.';
  }
  return '';
}

async function completeOnboarding() {
  const goal = $('onboarding-goal').value;
  const date = onboardingExam === 'sat' ? $('onboarding-sat-date').value : $('onboarding-ielts-date').value;
  const weakRoot = onboardingExam === 'sat' ? $('onboarding-sat-weaknesses') : $('onboarding-ielts-weaknesses');
  const weakTopics = [...weakRoot.querySelectorAll('[data-onboarding-weak]:checked')].map((input) => input.dataset.onboardingWeak);
  const minutes = Number($('onboarding-minutes').value);
  const currentTotal = onboardingExam === 'sat' ? $('onboarding-current-total').value : '';
  const currentRw = currentTotal ? String(balancedSectionScore(currentTotal)) : '';
  const currentMath = currentTotal ? String(Number(currentTotal) - Number(currentRw)) : '';
  const targetRw = onboardingExam === 'sat' ? String(balancedSectionScore(goal)) : '';
  const targetMath = onboardingExam === 'sat' ? String(Number(goal) - Number(targetRw)) : '';
  state.profile.exam = onboardingExam;
  state.profile.goals[onboardingExam] = { target: goal, date };
  state.profile.target = goal;
  state.profile.date = date;
  state.profile.planPreferences = {
    currentScore: onboardingExam === 'sat' ? currentTotal : $('onboarding-current-band').value,
    currentRw,
    currentMath,
    minutes,
    weakTopics
  };
  if (onboardingExam === 'sat') {
    generateStudyPlan({
      currentTotal,
      currentRw,
      currentMath,
      target: goal,
      targetRw,
      targetMath,
      weakTopics,
      date,
      minutes
    }, false);
  }
  localStorage.setItem(ONBOARDING_KEY, '1');
  await persist();
  $('onboarding-view').hidden = true;
  document.body.classList.remove('is-onboarding-open');
  setExam(onboardingExam, false);
  openPage('home');
  if (window.luminaryAuthUser) showToast('Your personalised workspace is ready.');
  else window.dispatchEvent(new CustomEvent('luminary:open-auth', { detail: { mode: 'register' } }));
}

function estimateDomainStats() {
  const history = state.progress.questionHistory || [];
  const domains = SAT_CATEGORIES.rw.concat(SAT_CATEGORIES.math);
  return Object.fromEntries(domains.map((domain) => {
    const attempts = history.filter((entry) => entry.exam === 'sat' && entry.domain === domain);
    const correct = attempts.filter((entry) => entry.correct).length;
    const recent = attempts.slice(-30);
    const recentCorrect = recent.filter((entry) => entry.correct).length;
    const responseSeconds = recent.map((entry) => Number(entry.responseSeconds) || 0).filter(Boolean);
    return [domain, { attempts: attempts.length, accuracy: attempts.length ? correct / attempts.length : null, recentAccuracy: recent.length ? recentCorrect / recent.length : null, repeatedErrors: recent.filter((entry) => !entry.correct).length, averageSeconds: responseSeconds.length ? responseSeconds.reduce((sum, value) => sum + value, 0) / responseSeconds.length : null }];
  }));
}

function planPhase(daysLeft) {
  if (daysLeft <= 10) return 'Final review';
  if (daysLeft <= 30) return 'Performance phase';
  if (daysLeft <= 75) return 'Skill-building phase';
  return 'Foundation phase';
}

function rankedPlanDomains(setup) {
  const stats = estimateDomainStats();
  const rwGap = Math.max(0, Number(setup.targetRw || 0) - Number(setup.currentRw || 0));
  const mathGap = Math.max(0, Number(setup.targetMath || 0) - Number(setup.currentMath || 0));
  const selected = new Set(setup.weakTopics || []);
  const defaults = ['Standard English Conventions', 'Information and Ideas', 'Advanced Math', 'Algebra', 'Problem-Solving and Data Analysis', 'Craft and Structure', 'Expression of Ideas', 'Geometry and Trigonometry'];
  return [...SAT_CATEGORIES.rw, ...SAT_CATEGORIES.math].sort((a, b) => {
    const score = (domain) => {
      const item = stats[domain];
      const selectedDomain = [...selected].some((topic) => topic === domain || topic.startsWith(`${domain}::`));
      const goalGap = SAT_CATEGORIES.rw.includes(domain) ? rwGap : mathGap;
      const observed = item?.recentAccuracy ?? item?.accuracy;
      const weakness = observed === null || observed === undefined ? 55 : (1 - observed) * 100;
      const recentDecline = item?.recentAccuracy !== null && item?.accuracy !== null ? Math.max(0, item.accuracy - item.recentAccuracy) * 45 : 0;
      const repeatWeight = Math.min(item?.repeatedErrors || 0, 8) * 2;
      const paceWeight = item?.averageSeconds && item.averageSeconds > 75 ? Math.min(12, (item.averageSeconds - 75) / 8) : 0;
      const selfReport = selectedDomain ? 24 : 0;
      const exposure = Math.min(item?.attempts || 0, 20) * .25;
      return -(weakness + goalGap * .13 + recentDecline + repeatWeight + paceWeight + selfReport - exposure) + defaults.indexOf(domain) * .01;
    };
    return score(a) - score(b);
  });
}

function makePlanTask(date, domain, index, setup, phase) {
  const set = SAT_CATEGORIES.rw.includes(domain) ? 'rw' : 'math';
  const minutes = Number(setup.minutes) || 60;
  const selectedSkills = (setup.weakTopics || []).filter((topic) => topic.startsWith(`${domain}::`)).map((topic) => topic.split('::')[1]);
  const skill = selectedSkills[index % Math.max(1, selectedSkills.length)] || '';
  const stats = estimateDomainStats()[domain];
  const weaknessFactor = stats?.recentAccuracy === null || stats?.recentAccuracy === undefined ? 1 : Math.max(.7, 1.45 - stats.recentAccuracy);
  const accuracy = stats?.recentAccuracy ?? stats?.accuracy;
  const difficulty = accuracy === null || accuracy === undefined ? '' : accuracy >= .82 ? 'Hard' : accuracy <= .62 ? 'Easy' : 'Medium';
  const count = Math.max(4, Math.min(18, Math.round((minutes / 7) * weaknessFactor)));
  return {
    id: `plan-${date}-${domain.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${index}`,
    date,
    type: 'practice',
    set,
    domain,
    skill,
    difficulty,
    title: skill ? `${domain}: ${skill}` : `${domain} practice`,
    minutes: Math.min(minutes, Math.max(20, count * 5)),
    questionCount: count,
    phase,
    status: 'not_started',
    createdAt: Date.now(),
    completedAt: 0,
    performance: null
  };
}

function generateStudyPlan(setup, preserveCompleted = true) {
  const savedTasks = preserveCompleted ? state.studyPlan.tasks.filter((task) => task.status === 'completed' || task.status === 'skipped' || task.status === 'in_progress') : [];
  const today = localDateKey(new Date());
  const daysLeft = setup.date ? Math.max(1, Math.ceil((new Date(`${setup.date}T12:00:00`) - new Date()) / 86400000)) : 28;
  const horizon = Math.min(21, Math.max(7, daysLeft));
  const phase = planPhase(daysLeft);
  const domains = rankedPlanDomains(setup);
  const tasks = [];
  for (let index = 0; index < horizon; index += 1) {
    const date = planDayOffset(today, index);
    const completedForDay = savedTasks.find((task) => task.date === date);
    if (completedForDay) continue;
    tasks.push(makePlanTask(date, domains[index % domains.length], index, setup, phase));
  }
  state.studyPlan = { setup: { ...setup }, generatedAt: Date.now(), tasks: [...savedTasks, ...tasks] };
  persist();
}

function renderStudyPlan() {
  const page = $('plan-page');
  const isSat = state.profile.exam === 'sat';
  page.querySelector('.plan-sat-only').hidden = !isSat;
  page.querySelector('.plan-unsupported').hidden = isSat;
  if (!isSat) return;
  const plan = state.studyPlan;
  const setup = plan.setup;
  $('plan-setup').hidden = Boolean(setup);
  $('plan-dashboard').hidden = !setup;
  if (!setup) {
    const draft = emptyPlanSetup();
    const scores = satGoalOptions();
    const sectionScores = Array.from({ length: 61 }, (_, index) => String(200 + index * 10));
    const optionList = (items, label) => `<option value="">${label}</option>${items.map((value) => `<option value="${value}">${value}</option>`).join('')}`;
    $('plan-current-total').innerHTML = optionList(scores, 'Choose score');
    $('plan-current-rw').innerHTML = optionList(sectionScores, 'Optional');
    $('plan-current-math').innerHTML = optionList(sectionScores, 'Optional');
    $('plan-target').innerHTML = optionList(scores, 'Choose target');
    $('plan-target-rw').innerHTML = optionList(sectionScores, 'Choose target');
    $('plan-target-math').innerHTML = optionList(sectionScores, 'Choose target');
    $('plan-date').innerHTML = `<option value="">Choose test date</option>${SAT_DATES.map((date) => `<option value="${date}">${dateText(date)}</option>`).join('')}`;
    $('plan-current-total').value = draft.currentTotal;
    $('plan-current-rw').value = draft.currentRw;
    $('plan-current-math').value = draft.currentMath;
    $('plan-target').value = draft.target;
    $('plan-target-rw').value = draft.targetRw;
    $('plan-target-math').value = draft.targetMath;
    $('plan-date').value = draft.date;
    $('plan-minutes').value = String(draft.minutes);
    $('plan-weaknesses').innerHTML = ['rw', 'math'].map((set) => `<section class="plan-weakness-set"><h3>${questionSetName(set)}</h3>${(SAT_TOPIC_GROUPS[set] || []).map((group) => `<div class="plan-weakness-group"><label><input type="checkbox" data-plan-weak="${escapeHtml(group.title)}"><strong>${escapeHtml(group.title)}</strong></label><div>${group.topics.map((topic) => `<label><input type="checkbox" data-plan-weak="${escapeHtml(`${group.title}::${topic}`)}">${escapeHtml(topic)}</label>`).join('')}</div></div>`).join('')}</section>`).join('');
    return;
  }
  const today = localDateKey(new Date());
  const daysLeft = setup.date ? Math.max(0, Math.ceil((new Date(`${setup.date}T12:00:00`) - new Date()) / 86400000)) : null;
  const todayTask = plan.tasks.find((task) => task.date === today && task.status !== 'completed' && task.status !== 'skipped');
  const completed = plan.tasks.filter((task) => task.status === 'completed').length;
  $('plan-phase').textContent = planPhase(daysLeft ?? 999);
  $('plan-summary').textContent = `${setup.currentTotal || 'Current score not set'} to ${setup.target || 'target not set'}${daysLeft !== null ? ` · ${plural(daysLeft, 'day')} left` : ''}`;
  $('plan-completion').textContent = `${completed} completed`;
  $('plan-today').innerHTML = todayTask ? renderPlanTask(todayTask, true) : '<article class="plan-empty"><strong>Nothing left for today.</strong><span>Your next focused task is already scheduled.</span></article>';
  const upcoming = plan.tasks.filter((task) => task.date > today && task.status !== 'skipped').slice(0, 6);
  $('plan-upcoming').innerHTML = upcoming.length ? upcoming.map((task) => renderPlanTask(task)).join('') : '<article class="plan-empty"><strong>Your schedule is clear.</strong></article>';
  const week = Array.from({ length: 7 }, (_, index) => planDayOffset(today, index));
  $('plan-calendar').innerHTML = week.map((date) => {
    const task = plan.tasks.find((item) => item.date === date && item.status !== 'skipped');
    return `<article class="plan-day ${task?.status === 'completed' ? 'is-complete' : ''}"><span>${dateText(date).replace(/, \d{4}/, '')}</span><strong>${task ? escapeHtml(task.domain) : 'Recovery'}</strong><small>${task ? `${task.minutes} min` : 'No task'}</small></article>`;
  }).join('');
}

function renderPlanTask(task, featured = false) {
  const status = task.status === 'completed' ? 'Completed' : task.status === 'in_progress' ? 'In progress' : `${task.questionCount} questions · ${task.minutes} min${task.difficulty ? ` · ${task.difficulty}` : ''}`;
  return `<article class="plan-task ${featured ? 'is-featured' : ''} ${task.status === 'completed' ? 'is-complete' : ''}"><div><p>${escapeHtml(task.date === localDateKey(new Date()) ? 'Today' : dateText(task.date))}</p><h3>${escapeHtml(task.title)}</h3><span>${escapeHtml(task.phase)} · ${status}</span></div>${task.status === 'completed' ? '<strong class="task-complete">Completed</strong>' : `<div class="plan-task-actions"><button class="button button-quiet" data-plan-skip="${escapeHtml(task.id)}" type="button">Skip</button><button class="button button-primary" data-plan-task="${escapeHtml(task.id)}" type="button">Start</button></div>`}</article>`;
}

function syncTargetSections(changed) {
  const total = Number($('plan-target').value);
  if (!total) return;
  const changedValue = Number($(changed).value);
  const otherId = changed === 'plan-target-rw' ? 'plan-target-math' : 'plan-target-rw';
  const other = total - changedValue;
  if (changedValue < 200 || changedValue > 800 || other < 200 || other > 800 || changedValue % 10 !== 0 || other % 10 !== 0) {
    const fallbackRw = balancedSectionScore(total, Number($('plan-target-rw').value));
    $('plan-target-rw').value = String(fallbackRw);
    $('plan-target-math').value = String(total - fallbackRw);
  } else {
    $(otherId).value = String(other);
  }
  $('plan-target-note').textContent = `Reading & Writing ${$('plan-target-rw').value} + Math ${$('plan-target-math').value} = ${total}.`;
}

function syncCurrentTotal(changed) {
  if (changed === 'plan-current-rw' || changed === 'plan-current-math') {
    const rw = Number($('plan-current-rw').value);
    const math = Number($('plan-current-math').value);
    if (rw && math) $('plan-current-total').value = String(rw + math);
  } else {
    const total = Number($('plan-current-total').value);
    if (!total) return;
    const rw = balancedSectionScore(total, Number($('plan-current-rw').value));
    $('plan-current-rw').value = String(rw);
    $('plan-current-math').value = String(total - rw);
  }
}

function planSetupFromForm() {
  const weakTopics = [...document.querySelectorAll('[data-plan-weak]:checked')].map((input) => input.dataset.planWeak);
  return {
    currentTotal: $('plan-current-total').value,
    currentRw: $('plan-current-rw').value,
    currentMath: $('plan-current-math').value,
    target: $('plan-target').value,
    targetRw: $('plan-target-rw').value,
    targetMath: $('plan-target-math').value,
    weakTopics,
    date: $('plan-date').value,
    minutes: Number($('plan-minutes').value)
  };
}

async function startPlanTask(taskId) {
  const task = state.studyPlan.tasks.find((item) => item.id === taskId);
  if (!task || task.status === 'completed') return;
  const loaded = await loadQuestionTopics('sat', [task.domain]);
  const seen = new Set((state.progress.questionHistory || []).filter((entry) => entry.exam === 'sat').map((entry) => entry.id));
  const unseen = loaded.filter((question) => !seen.has(question.id));
  const matchingSkill = task.skill ? loaded.filter((question) => String(question.skill || question.domain).toLowerCase() === task.skill.toLowerCase()) : [];
  const skillPool = matchingSkill.length ? matchingSkill : loaded;
  const matchingDifficulty = task.difficulty ? skillPool.filter((question) => String(question.difficulty || '').toLowerCase() === task.difficulty.toLowerCase()) : [];
  const pool = matchingDifficulty.length ? matchingDifficulty : skillPool;
  const unseenPool = pool.filter((question) => !seen.has(question.id));
  const questions = (unseenPool.length ? unseenPool : pool).slice(0, task.questionCount);
  if (!questions.length) { showToast('No Question Bank questions are available for this topic yet.'); return; }
  task.status = 'in_progress';
  activePlanTaskId = task.id;
  await persist();
  startPractice(task.set, 0, questions, 'plan', task.id);
}

function skipPlanTask(taskId) {
  const task = state.studyPlan.tasks.find((item) => item.id === taskId);
  if (!task || task.status === 'completed') return;
  task.status = 'skipped';
  task.completedAt = Date.now();
  persist();
  renderStudyPlan();
  renderHome();
}

function completePlanTask() {
  const task = state.studyPlan.tasks.find((item) => item.id === activePlanTaskId);
  if (!task) return;
  const checked = practiceQuestions.filter((question) => checkedAnswers[question.id] !== undefined);
  const correct = checked.filter((question) => checkedAnswers[question.id] === question.correct).length;
  task.status = 'completed';
  task.completedAt = Date.now();
  task.performance = { correct, total: checked.length };
  activePlanTaskId = '';
}

async function loadDailyQuestion(exam) {
  const store = dailyQuestionStore[exam];
  if (store.status === 'loading' || store.status === 'ready') return;
  store.status = 'loading';
  try {
    const item = await fetchDatabaseData(QUESTION_DATABASE_URL, `daily-questions/${exam}/current`, 12000);
    const expiresAt = Number(item?.expiresAt || 0);
    if (!item || !expiresAt || expiresAt <= Date.now()) {
      store.question = null;
      store.status = 'expired';
      return;
    }
    const question = remoteQuestion('current', item, `daily-${exam}-${Number(item.publishedAt || expiresAt)}`);
    store.question = validRemoteQuestion(question) ? question : null;
    store.status = store.question ? 'ready' : 'error';
  } catch {
    store.question = null;
    store.status = 'error';
  } finally {
    if (state.profile.exam === exam) renderHome();
  }
}

function getMaterials(category) {
  return remoteMaterials[category] || [];
}

async function fetchMaterialData(path) {
  const key = `${MATERIAL_CACHE_PREFIX}${path}`;
  let cached = null;
  try {
    cached = JSON.parse(localStorage.getItem(key) || 'null');
    if (cached && Date.now() - cached.savedAt < MATERIAL_CACHE_MAX_AGE) return cached.data;
  } catch { /* Ignore a malformed cache entry. */ }
  try {
    const data = await fetchDatabaseData(MATERIAL_DATABASE_URL, path);
    try { localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data })); } catch { /* Large image collections may exceed browser storage. */ }
    return data;
  } catch (error) {
    if (cached?.data) return cached.data;
    throw error;
  }
}

function openQuestionCache() {
  return new Promise((resolve) => {
    if (!window.indexedDB) return resolve(null);
    const request = indexedDB.open(QUESTION_CACHE_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('banks', { keyPath: 'exam' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function readQuestionCache(exam) {
  const database = await openQuestionCache();
  if (!database) return null;
  return new Promise((resolve) => {
    const request = database.transaction('banks').objectStore('banks').get(exam);
    request.onsuccess = () => {
      const saved = request.result;
      resolve(saved && Date.now() - saved.savedAt < QUESTION_CACHE_MAX_AGE ? saved.items : null);
    };
    request.onerror = () => resolve(null);
  });
}

async function writeQuestionCache(exam, items) {
  const database = await openQuestionCache();
  if (!database) return;
  database.transaction('banks', 'readwrite').objectStore('banks').put({ exam, items, savedAt: Date.now() });
}

async function fetchDatabaseData(baseUrl, path, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const [resource, query = ''] = path.split('?');
    const response = await fetch(`${baseUrl}/${resource}.json${query ? `?${query}` : ''}`, { cache: 'no-store', signal: controller.signal });
    if (!response.ok) throw new Error(`Could not load ${path}`);
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function sortByTitle(items) {
  return [...items].sort((a, b) => {
    const left = Number((String(a.title || '').match(/^\d+/) || ['9999'])[0]);
    const right = Number((String(b.title || '').match(/^\d+/) || ['9999'])[0]);
    return left - right || String(a.title || '').localeCompare(String(b.title || ''));
  });
}

function ruleMaterialsFromRemote(data) {
  const folders = new Map();
  Object.entries(data || {}).forEach(([id, item]) => {
    const folder = item.folderName || 'SAT Rules';
    if (!folders.has(folder)) folders.set(folder, []);
    folders.get(folder).push({ id, title: item.title || 'Untitled rule', text: item.body || '' });
  });
  return [...folders.entries()].map(([folder, items]) => ({
    id: `rules-${folder.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
    label: 'Rules',
    title: folder,
    copy: `${items.length} rules from your Luminary material library.`,
    set: 'rw',
    body: sortByTitle(items).map((item) => ({ heading: item.title, text: item.text }))
  }));
}

function hackMaterialsFromRemote(groups) {
  return groups.map(({ section, data }) => {
    const entries = Object.entries(data || {}).map(([id, item]) => ({ id, title: item.title || '', text: item.body || '', addedAt: item.addedAt || 0 })).sort((a, b) => a.addedAt - b.addedAt);
    return {
      id: `hacks-${section.id}`,
      label: 'Study material',
      title: section.title,
      copy: entries.length ? `${entries.length} material${entries.length === 1 ? '' : 's'} from your Luminary library.` : '',
      set: section.set,
      imagePath: `photo-sections/${section.id}`,
      images: [],
      imageStatus: 'idle',
      body: entries.map((entry, index) => ({ heading: entry.title || `Part ${index + 1}`, text: entry.text }))
    };
  });
}

function hackMaterialShell(section) {
  return {
    id: `hacks-${section.id}`,
    label: 'Study material',
    title: section.title,
    copy: '',
    set: section.set,
    imagePath: `photo-sections/${section.id}`,
    images: [],
    imageStatus: 'idle',
    body: []
  };
}

function refreshMaterialCategory(category) {
  if (category === 'rules' && currentPage === 'learn') renderLearn();
  if (category === 'problems' && currentPage === 'problems') renderProblems();
  if (category === 'rules' && currentPage === 'home') renderRecommendations();
}

function loadRemoteMaterials(category) {
  if (state.profile.exam !== 'sat') return Promise.resolve();
  if (remoteMaterialLoads[category]) return remoteMaterialLoads[category];
  remoteMaterialLoads[category] = (async () => {
    try {
      if (category === 'rules') {
        const data = await fetchMaterialData('sat-rules-items');
        const materials = ruleMaterialsFromRemote(data);
        if (materials.length) remoteMaterials.rules = materials;
      }
      if (category === 'problems') {
        remoteMaterials.problems = HACK_SECTIONS.map(hackMaterialShell);
        refreshMaterialCategory(category);
        HACK_SECTIONS.forEach((section) => {
          fetchMaterialData(`photo-sections-text/${section.id}`).then((data) => {
            const material = hackMaterialsFromRemote([{ section, data }])[0];
            remoteMaterials.problems = remoteMaterials.problems.map((item) => item.id === material.id ? material : item);
            refreshMaterialCategory(category);
          }).catch(() => {
            const fallback = remoteMaterials.problems.find((item) => item.id === `hacks-${section.id}`);
            if (fallback) fallback.copy = 'This chapter is temporarily unavailable. Try opening it again later.';
            refreshMaterialCategory(category);
          });
        });
      }
      refreshMaterialCategory(category);
    } catch {
      // The connected material database is temporarily unavailable.
    }
  })();
  return remoteMaterialLoads[category];
}

function resourceCards(items, target, category, emptyCopy = 'Loading your Luminary material library...') {
  $(target).innerHTML = items.length ? items.map((item) => `<button class="resource-card" type="button" data-open-material="${escapeHtml(category)}" data-material-id="${escapeHtml(item.id)}"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.copy)}</small></button>`).join('') : `<p class="empty-state">${escapeHtml(emptyCopy)}</p>`;
}

function renderLearn() {
  const isIelts = state.profile.exam === 'ielts';
  const skill = currentSkill || 'Listening';
  $('learn-kicker').textContent = isIelts ? 'IELTS learn' : 'SAT learn';
  $('learn-title').textContent = isIelts ? skill : 'Rules';
  $('learn-copy').textContent = isIelts ? `${skill} materials appear here when connected to the library.` : 'Rules from your Luminary material library.';
  if(isIelts){
    const store=remotePractice.prep[skill.toLowerCase()];
    if(!store){$('learn-grid').innerHTML='<p class="empty-state">Loading IELTS preparation materials...</p>';loadIeltsPrep(skill);return;}
    $('learn-grid').innerHTML=store.items.map(item=>`<button class="resource-card" type="button" data-open-prep="${escapeHtml(skill.toLowerCase())}" data-prep-id="${escapeHtml(item.id)}">${safeImageSource(item.image)?`<img class="mock-cover" src="${escapeHtml(safeImageSource(item.image))}" alt="">`:''}<span>IELTS ${escapeHtml(skill)}</span><strong>${escapeHtml(item.title||'Preparation material')}</strong><small>${escapeHtml(item.desc||item.description||'Open material')}</small></button>`).join('')||`<p class="empty-state">${store.status==='error'?'Materials could not be loaded right now.':'No materials have been added for this skill yet.'}</p>`;
  } else {resourceCards(getMaterials('rules'), 'learn-grid', 'rules', 'Loading SAT Rules from your Luminary library...');loadRemoteMaterials('rules');}
}

function openIeltsPrep(skill,id){
  const item=remotePractice.prep[skill]?.items.find(entry=>entry.id===id);if(!item)return;
  if(Array.isArray(item.questions)&&item.questions.length){startRemoteQuestions(`ielts-${skill}-${id}`,item.questions,'rw');return;}
  remoteMaterials.prep=[{id:`prep-${id}`,label:`IELTS ${skill}`,title:item.title||'Preparation material',copy:item.desc||item.description||'',body:[{heading:item.title||'Lesson',text:item.body||item.content||''}],images:safeImageSource(item.image)?[{data:item.image,title:item.title||''}]:[],imageStatus:'loaded'}];
  openMaterial('prep',`prep-${id}`);
}

function renderVocab() {
  const exam = state.profile.exam;
  const store = vocabularyStores[exam];
  $('vocab-kicker').textContent = `${exam.toUpperCase()} vocabulary`;
  $('vocab-title').textContent = 'Vocabulary';
  $('vocab-copy').textContent = store.status === 'ready' ? `${store.words.length.toLocaleString('en-US')} words from your Luminary vocabulary database.` : `Loading ${exam.toUpperCase()} vocabulary from your Luminary database.`;
  if (store.status === 'ready') renderVocabularyFolders(exam);
  else $('vocab-grid').innerHTML = `<p class="empty-state">${store.status === 'error' ? 'Vocabulary could not be loaded right now.' : 'Loading vocabulary folders...'}</p>`;
  if (currentPage === 'vocab' || currentPage === 'vocab-study') loadVocabulary(exam);
}

function renderProblems() {
  resourceCards(getMaterials('problems'), 'problems-grid', 'problems', 'Loading Hacks / Problems / Solutions from your Luminary library...');
  loadRemoteMaterials('problems');
}

function renderVocabularyFolders(exam) {
  const store = vocabularyStores[exam];
  const countByFolder = store.words.reduce((counts, word) => {
    const id = word.folder || 'unassigned';
    counts[id] = (counts[id] || 0) + 1;
    return counts;
  }, {});
  const folders = [...store.folders].sort((left, right) => (left.createdAt || 0) - (right.createdAt || 0));
  $('vocab-grid').innerHTML = folders.map((folder) => `<button class="resource-card" type="button" data-open-vocab="${exam}" data-vocab-folder="${escapeHtml(folder.id)}"><span>${exam.toUpperCase()} vocabulary</span><strong>${escapeHtml(folder.name || 'Untitled folder')}</strong><small>${(countByFolder[folder.id] || 0).toLocaleString('en-US')} words</small></button>`).join('') || '<p class="empty-state">No vocabulary folders were found in the connected database.</p>';
}

async function loadVocabulary(exam) {
  const store = vocabularyStores[exam];
  if (store.status === 'loading' || store.status === 'ready') return;
  store.status = 'loading';
  try {
    const [foldersData, wordsData] = await Promise.all([fetchMaterialData(`${exam}-folders`), fetchMaterialData(`${exam}-words`)]);
    store.folders = Object.entries(foldersData || {}).map(([id, folder]) => ({ id, ...folder }));
    store.words = Object.entries(wordsData || {}).map(([id, word]) => ({ id, ...word }));
    store.status = 'ready';
  } catch {
    store.status = 'error';
  }
  if (state.profile.exam === exam && currentPage === 'vocab') renderVocab();
}

function vocabularyFolder(exam, folderId) {
  return vocabularyStores[exam].folders.find((folder) => folder.id === folderId);
}

function visibleVocabularyWords() {
  const { exam, folder, query } = vocabularyContext;
  const normalized = query.trim().toLowerCase();
  return vocabularyStores[exam].words.filter((word) => {
    if (word.folder !== folder) return false;
    if (!normalized) return true;
    return [word.w, word.d, word.ant, word.ex].some((value) => String(value || '').toLowerCase().includes(normalized));
  }).sort((left, right) => String(left.w || '').localeCompare(String(right.w || '')));
}

function renderVocabularyStudy() {
  const { exam, folder, page } = vocabularyContext;
  const activeFolder = vocabularyFolder(exam, folder);
  const words = visibleVocabularyWords();
  const pageSize = 60;
  const pageCount = Math.max(1, Math.ceil(words.length / pageSize));
  vocabularyContext.page = Math.min(page, pageCount - 1);
  const start = vocabularyContext.page * pageSize;
  const currentWords = words.slice(start, start + pageSize);
  $('vocab-study-kicker').textContent = `${exam.toUpperCase()} vocabulary`;
  $('vocab-study-title').textContent = activeFolder?.name || 'Vocabulary';
  $('vocab-study-copy').textContent = `${words.length.toLocaleString('en-US')} words in this folder.`;
  $('vocab-results').textContent = `${words.length.toLocaleString('en-US')} results`;
  $('vocab-list').innerHTML = currentWords.map((word) => `<article class="vocab-entry"><div><h2>${escapeHtml(word.w)}</h2><p>${escapeHtml(word.d)}</p></div>${word.ex ? `<p class="vocab-example">${escapeHtml(word.ex)}</p>` : ''}${word.ant ? `<p class="vocab-antonyms">Antonyms: ${escapeHtml(word.ant)}</p>` : ''}</article>`).join('') || '<p class="empty-state">No words match this search.</p>';
  $('vocab-page-count').textContent = `${vocabularyContext.page + 1} / ${pageCount}`;
  $('vocab-previous').disabled = vocabularyContext.page === 0;
  $('vocab-next').disabled = vocabularyContext.page >= pageCount - 1;
  $('start-vocab-review').disabled = words.length === 0;
}

function openVocabularyFolder(exam, folder) {
  if (vocabularyStores[exam].status !== 'ready') return;
  vocabularyContext = { exam, folder, query: '', page: 0 };
  $('vocab-search').value = '';
  renderVocabularyStudy();
  openPage('vocab-study');
}

function openVocabularyReview() {
  const words = visibleVocabularyWords();
  if (!words.length) return;
  vocabularyReview = { words: words.slice(0, 12), index: 0, known: 0, revealed: false };
  renderVocabularyReview();
  openPage('vocab-review');
}

function renderVocabularyReview() {
  const { words, index, known, revealed } = vocabularyReview;
  const activeFolder = vocabularyFolder(vocabularyContext.exam, vocabularyContext.folder);
  $('vocab-review-kicker').textContent = `${vocabularyContext.exam.toUpperCase()} focused review`;
  $('vocab-review-title').textContent = activeFolder?.name || 'Vocabulary';

  if (index >= words.length) {
    $('vocab-review-count').textContent = `${words.length} reviewed`;
    $('vocab-review-card').innerHTML = `<p class="kicker">Review complete</p><h2>${known} of ${words.length} words felt familiar.</h2><p>Come back tomorrow and make the difficult ones easier.</p>`;
    $('vocab-review-actions').innerHTML = '<button class="button button-quiet" type="button" data-vocab-review="restart">Review this set again</button>';
    return;
  }

  const word = words[index];
  $('vocab-review-count').textContent = `${index + 1} / ${words.length}`;
  $('vocab-review-card').innerHTML = `<p class="kicker">${revealed ? 'Meaning' : 'New word'}</p><h2>${escapeHtml(word.w)}</h2>${revealed ? `<p class="vocab-review-definition">${escapeHtml(word.d)}</p>${word.ex ? `<p class="vocab-example">${escapeHtml(word.ex)}</p>` : ''}${word.ant ? `<p class="vocab-antonyms">Antonyms: ${escapeHtml(word.ant)}</p>` : ''}` : '<p class="vocab-review-hint">Take a moment to recall the meaning before you reveal it.</p>'}`;
  $('vocab-review-actions').innerHTML = revealed
    ? '<button class="button button-quiet" type="button" data-vocab-review="again">Review again</button><button class="button button-primary" type="button" data-vocab-review="know">I know this</button>'
    : '<button class="button button-primary" type="button" data-vocab-review="reveal">Reveal meaning</button>';
}

function respondVocabularyReview(action) {
  if (action === 'restart') {
    vocabularyReview = { ...vocabularyReview, index: 0, known: 0, revealed: false };
  } else if (action === 'reveal') {
    vocabularyReview.revealed = true;
  } else {
    if (action === 'know') vocabularyReview.known += 1;
    vocabularyReview.index += 1;
    vocabularyReview.revealed = false;
  }
  renderVocabularyReview();
}

function splitQuestionText(text) {
  const source = String(text || '').trim();
  const lastQuestionMark = source.lastIndexOf('?');
  if (lastQuestionMark < 0 && source.includes('\n')) return { passage: source, prompt: '' };
  const lineStart = lastQuestionMark >= 0 ? source.lastIndexOf('\n', lastQuestionMark) : -1;
  if (lineStart >= 0) return { passage: source.slice(0, lineStart).trim(), prompt: source.slice(lineStart + 1).trim() };
  return { passage: '', prompt: source };
}

function remoteQuestion(id, item, prefix = 'firebase') {
  const options = item.options || item.answers || {};
  const answers = Array.isArray(options) ? options : ['A', 'B', 'C', 'D'].map((key) => options[key]);
  const rawCorrect = item.correct ?? item.answer;
  const correct = typeof rawCorrect === 'number' ? rawCorrect : Math.max(0, 'ABCD'.indexOf(String(rawCorrect || '').toUpperCase()));
  const domain=item.tag || item.domain || item.topic || 'Practice';const declared=String(item.set||item.section||'').toLowerCase();
  const set=prefix.startsWith('ielts')?(declared||'reading'):declared.includes('math')?'math':declared.includes('read')||declared==='rw'?'rw':/algebra|math|geometry|data|problem solving/i.test(domain)?'math':'rw';
  const providedPassage = item.passage || item.reference || item.text || item.stimulus || '';
  const rawQuestion = item.q || '';
  const split = providedPassage ? { passage: providedPassage, prompt: item.question || item.prompt || rawQuestion } : splitQuestionText(rawQuestion);
  return { id: `${prefix}-${id}`, domain, skill: compactDisplayText(item.skill || item.subtopic || item.subSkill || ''), difficulty: compactDisplayText(item.difficulty || item.level || ''), set, prompt: compactDisplayText(split.prompt || item.question || item.prompt || 'Choose the best answer.'), passage: compactDisplayText(split.passage), answers: answers.map((answer) => compactDisplayText(answer)), correct, image: item.image || item.imageUrl || item.picture || '', explanation: compactDisplayText(item.explain || item.explanation || '') };
}

function validRemoteQuestion(question) {
  return question.prompt && question.answers.length === 4 && question.answers.every(Boolean) && question.correct >= 0 && question.correct < 4;
}

async function loadRemoteQuestionBank(exam = state.profile.exam) {
  const store = remotePractice.questions[exam];
  if (store.status === 'ready') return store.items;
  if (questionBankLoads[exam]) return questionBankLoads[exam];

  store.status = 'loading';
  questionBankLoads[exam] = (async () => {
    try {
      const data = await fetchDatabaseData(QUESTION_DATABASE_URL, `question-bank/${exam}`, 60000);
      store.items = Object.entries(data || {}).map(([id, item]) => remoteQuestion(id, item, `${exam}-bank`)).filter(validRemoteQuestion);
      store.status = 'ready';
      writeQuestionCache(exam, store.items);
      return store.items;
    } catch {
      const cachedItems = await readQuestionCache(exam);
      if (cachedItems?.length) {
        store.items = cachedItems;
        store.status = 'ready';
        return store.items;
      }
      store.status = 'error';
      return [];
    } finally {
      delete questionBankLoads[exam];
      if (currentPage === 'questions') renderQuestionBank();
    }
  })();
  return questionBankLoads[exam];
}

async function loadQuestionTopics(exam, topics) {
  const cache = questionTopicCache[exam];
  const databaseTopics = exam === 'sat' ? [...new Set(topics.map((topic) => topic.split('::')[0]))] : topics;
  const missingTopics = databaseTopics.filter((topic) => !cache[topic]);
  if (!missingTopics.length) return databaseTopics.flatMap((topic) => cache[topic]);
  await Promise.all(missingTopics.map(async (topic) => {
    try {
      const query = `orderBy=${encodeURIComponent('"tag"')}&equalTo=${encodeURIComponent(JSON.stringify(topic))}`;
      const data = await fetchDatabaseData(QUESTION_DATABASE_URL, `question-bank/${exam}?${query}`, 18000);
      cache[topic] = Object.entries(data || {}).map(([id, item]) => remoteQuestion(id, item, `${exam}-topic`)).filter(validRemoteQuestion);
    } catch {
      const available = remotePractice.questions[exam].items.length ? remotePractice.questions[exam].items : (await readQuestionCache(exam)) || [];
      cache[topic] = available.filter((question) => question.domain === topic);
    }
  }));
  return databaseTopics.flatMap((topic) => cache[topic] || []);
}

function currentMockKey(){return state.profile.exam==='ielts'?`ielts/${(currentSkill||'Listening').toLowerCase()}`:'sat/all';}
async function loadRemoteMocks(){
  const key=currentMockKey();if(remotePractice.mocks[key]?.status==='loading'||remotePractice.mocks[key]?.status==='ready')return;
  remotePractice.mocks[key]={status:'loading',items:[]};renderMocks();
  try { let groups;
    if(key==='sat/all')groups=await Promise.all(['reading','math'].map(async skill=>[skill,await fetchMaterialData(`mocks/sat/${skill}`)]));
    else {const skill=key.split('/')[1];groups=[[skill,await fetchMaterialData(`mocks/ielts/${skill}`)]];}
    remotePractice.mocks[key]={status:'ready',items:groups.flatMap(([skill,data])=>Object.entries(data||{}).map(([id,item])=>({id,skill,...item})))};
  } catch {remotePractice.mocks[key]={status:'error',items:[]};}
  if(currentPage==='mocks')renderMocks();
}

function startRemoteQuestions(sourceId, questions, set='math'){
  const normalized=(questions||[]).map((item,index)=>remoteQuestion(`${sourceId}-${index}`,item,sourceId)).filter(validRemoteQuestion);
  if(!normalized.length){showToast('This material has no valid test questions yet.');return;}startPractice(set,0,normalized,sourceId.startsWith('mock-')?'mock':'bank');
}

function renderMocks() {
  const ielts = state.profile.exam === 'ielts';
  const skill = currentSkill || 'Listening';
  $('mocks-kicker').textContent = ielts ? 'IELTS practice' : 'SAT practice';
  $('mocks-title').textContent = ielts ? `${skill} Mocks` : 'SAT Mocks';
  const store=remotePractice.mocks[currentMockKey()];
  if(!store){$('mock-list').innerHTML='<article class="empty-state"><strong>Loading mocks...</strong></article>';loadRemoteMocks();return;}
  if(store.status==='loading'){$('mock-list').innerHTML='<article class="empty-state"><strong>Loading mocks...</strong></article>';return;}
  if(!store.items.length){$('mock-list').innerHTML=`<article class="empty-state"><strong>${store.status==='error'?'Mocks could not be loaded.':'No mocks have been added yet.'}</strong></article>`;return;}
  $('mock-list').innerHTML=store.items.map((mock,index)=>`<article>${safeImageSource(mock.image)?`<img class="mock-cover" src="${escapeHtml(safeImageSource(mock.image))}" alt="">`:''}<div><span>${escapeHtml(mock.skill)} practice</span><strong>${escapeHtml(mock.title||`Mock ${index+1}`)}</strong><small>${escapeHtml(mock.desc||'Timed practice')}</small></div>${Array.isArray(mock.questions)&&mock.questions.length?`<button class="button button-primary" data-start-mock="${escapeHtml(currentMockKey())}" data-mock-id="${escapeHtml(mock.id)}" type="button">Start test</button>`:`<a class="button button-primary" href="${escapeHtml(mock.url||'#')}" target="_blank" rel="noopener">Open</a>`}</article>`).join('');
}

async function loadIeltsPrep(skill){
  const key=skill.toLowerCase();if(remotePractice.prep[key]?.status==='loading'||remotePractice.prep[key]?.status==='ready')return;
  remotePractice.prep[key]={status:'loading',items:[]};
  try {const data=await fetchMaterialData(`ielts-prep/${key}`);remotePractice.prep[key]={status:'ready',items:Object.entries(data||{}).map(([id,item])=>({id,...item}))};}
  catch {remotePractice.prep[key]={status:'error',items:[]};}
  if(currentPage==='learn')renderLearn();
}

function safeImageSource(value) {
  const source = String(value || '');
  return /^(data:image\/(png|jpe?g|webp|gif);base64,|https?:\/\/)/i.test(source) ? source : '';
}

function renderMaterial(material) {
  const isReadingMaterial = materialContext.category === 'problems';
  $('material-page').classList.toggle('is-reading-material', isReadingMaterial);
  $('material-kicker').textContent = `${state.profile.exam.toUpperCase()} material`;
  $('material-title').textContent = material.title;
  $('material-copy').textContent = material.copy;
  const blocks = material.body.map((block, index) => isReadingMaterial
    ? `<article class="reading-block"><p class="reading-index">${String(index + 1).padStart(2, '0')}</p><h2>${escapeHtml(block.heading)}</h2><p>${escapeHtml(block.text)}</p></article>`
    : `<article><span>${String(index + 1).padStart(2, '0')}</span><div><h2>${escapeHtml(block.heading)}</h2><p>${escapeHtml(block.text)}</p></div></article>`).join('');
  const images = (material.images || []).map((image) => {
    const source = safeImageSource(image.data);
    return source ? `<figure${isReadingMaterial ? ' class="reading-visual"' : ''}><img src="${escapeHtml(source)}" alt="${escapeHtml(image.title || material.title)}" loading="lazy">${image.title ? `<figcaption>${escapeHtml(image.title)}</figcaption>` : ''}</figure>` : '';
  }).join('');
  const loading = material.imageStatus === 'loading' ? '<p class="material-status">Loading visual material...</p>' : material.imageStatus === 'unavailable' ? '<p class="material-status">This chapter could not be loaded right now.</p>' : '';
  $('material-list').innerHTML = `${blocks}${images ? `<div class="material-images">${images}</div>` : ''}${loading}`;
}

function loadMaterialImages(material) {
  if (!material.imagePath || material.imageStatus === 'loading' || material.imageStatus === 'loaded' || material.imageStatus === 'unavailable') return;
  material.imageStatus = 'loading';
  renderMaterial(material);
  fetchMaterialData(material.imagePath).then((data) => {
    material.images = Object.entries(data || {}).map(([id, item]) => ({ id, title: item.title || '', data: item.data || '' })).filter((image) => safeImageSource(image.data));
    material.imageStatus = material.images.length ? 'loaded' : 'unavailable';
    if (material.images.length) {
      material.copy = `${material.images.length} visual material${material.images.length === 1 ? '' : 's'} from your Luminary library.`;
    }
    if (currentPage === 'material' && materialContext.id === material.id) renderMaterial(material);
  }).catch(() => {
    material.imageStatus = 'unavailable';
    if (currentPage === 'material' && materialContext.id === material.id) renderMaterial(material);
  });
}

function openMaterial(category, id) {
  const material = getMaterials(category).find((item) => item.id === id);
  if (!material) return;
  materialContext = { category, id };
  renderMaterial(material);
  openPage('material');
  loadMaterialImages(material);
}

function backToMaterials() {
  const page = materialContext.category === 'rules' ? 'learn' : materialContext.category === 'vocab' ? 'vocab' : 'problems';
  openPage(page);
}

function renderThemes() {
  const swatches = Object.entries(THEMES).map(([id, theme]) => `<button class="mini-theme ${id === state.profile.theme ? 'is-selected' : ''}" type="button" data-theme="${id}" title="${escapeHtml(theme.name)}" aria-label="${escapeHtml(theme.name)}" style="--preview-sidebar:${theme.sidebar};--preview-accent:${theme.accent}"></button>`).join('');
  ['theme-grid', 'auth-theme-grid'].forEach((id) => { if ($(id)) $(id).innerHTML = swatches; });
  const current = THEMES[state.profile.theme] || THEMES.navy;
  const icon = $('current-theme-icon');
  if (icon) {
    icon.style.setProperty('--preview-sidebar', current.sidebar);
    icon.style.setProperty('--preview-accent', current.accent);
  }
  if ($('current-theme-name')) $('current-theme-name').textContent = current.name;
  if ($('auth-current-theme-name')) $('auth-current-theme-name').textContent = current.name;
}

function formatTimer() {
  const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const seconds = String(timerSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function renderTimer() {
  $('test-timer').textContent = formatTimer();
  $('test-timer').classList.toggle('is-hidden-timer', timerHidden);
  $('hide-timer').textContent = timerHidden ? 'Show' : 'Hide';
  $('pause-timer').textContent = timerRunning ? 'Stop' : 'Continue';
  $('pause-timer').title = timerRunning ? 'Stop timer' : 'Continue timer';
  $('pause-timer').setAttribute('aria-label', $('pause-timer').title);
}

function startTimer() {
  clearInterval(timerHandle);
  timerSeconds = 0;
  timerRunning = true;
  timerHidden = false;
  renderTimer();
  timerHandle = setInterval(() => {
    if (!timerRunning) return;
    timerSeconds += 1;
    renderTimer();
  }, 1000);
}

function saveActivePractice() {
  if (!practiceQuestions.length || $('test-experience').classList.contains('is-hidden')) return;
  try {
    sessionStorage.setItem(ACTIVE_PRACTICE_KEY, JSON.stringify({
      questions: practiceQuestions,
      set: currentSet,
      question: currentQuestion,
      mode: practiceMode,
      planTaskId: activePlanTaskId,
      draftAnswers,
      checkedAnswers,
      practiceXp,
      practiceStreak,
      timerSeconds,
      timerRunning,
      timerHidden
    }));
  } catch {
    // A very large image-based set may exceed session storage.
  }
}

function clearActivePractice() {
  sessionStorage.removeItem(ACTIVE_PRACTICE_KEY);
}

function restoreActivePractice() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(ACTIVE_PRACTICE_KEY) || 'null');
    if (!saved?.questions?.length) return;
    practiceQuestions = saved.questions;
    currentSet = saved.set || 'math';
    currentQuestion = Math.max(0, Math.min(Number(saved.question) || 0, practiceQuestions.length - 1));
    practiceMode = ['mock', 'plan', 'adaptive'].includes(saved.mode) ? saved.mode : 'bank';
    activePlanTaskId = saved.planTaskId || '';
    draftAnswers = saved.draftAnswers || {};
    checkedAnswers = saved.checkedAnswers || {};
    practiceXp = Math.max(0, Number(saved.practiceXp) || 0);
    practiceStreak = Math.max(0, Number(saved.practiceStreak) || 0);
    timerSeconds = Math.max(0, Number(saved.timerSeconds) || 0);
    timerRunning = saved.timerRunning !== false;
    timerHidden = Boolean(saved.timerHidden);
    openPage('questions');
    $('test-experience').classList.remove('is-hidden');
    $('test-experience').classList.toggle('is-mock-mode', practiceMode === 'mock');
    clearInterval(timerHandle);
    renderTimer();
    timerHandle = setInterval(() => {
      if (!timerRunning) return;
      timerSeconds += 1;
      renderTimer();
    }, 1000);
    renderQuestion();
  } catch {
    clearActivePractice();
  }
}

function stopTimer() {
  clearInterval(timerHandle);
  timerHandle = null;
  timerRunning = false;
}

function toggleTimer() {
  timerRunning = !timerRunning;
  renderTimer();
}

function toggleTimerVisibility() {
  timerHidden = !timerHidden;
  renderTimer();
}

function questionSetName(set) {
  return ({rw:'Reading & Writing',math:'Math',listening:'Listening',reading:'Reading',writing:'Writing',speaking:'Speaking'})[set]||set;
}

function renderQuestionBank() {
  const library = $('question-library');
  library.classList.toggle('question-topic-list', questionBankView === 'topics');
  const exam=state.profile.exam,store=remotePractice.questions[exam];
  if(store.status === 'idle' && currentPage === 'questions') loadRemoteQuestionBank(exam);
  const sections=exam==='sat'?['rw','math']:['listening','reading','writing','speaking'];
  const questionsForSet=(set)=>store.items.filter(question=>question.set===set);

  if (questionBankView === 'sections') {
    $('question-bank-copy').textContent = exam==='sat'?'Choose Reading & Writing or Math.':'Choose an IELTS section.';
    library.innerHTML = sections.map((set) => {
      return `<button class="library-card qbank-section qbank-section-${set}" data-select-set="${set}" type="button"><strong>${questionSetName(set)}</strong></button>`;
    }).join('');
    return;
  }

  const preferred=SAT_CATEGORIES[currentSet]||[];
  const questions = questionsForSet(currentSet);
  const availableTopics = new Set(questions.map((question) => question.domain));
  const topics = exam === 'sat' ? preferred : [...preferred.filter((topic) => availableTopics.has(topic)), ...[...availableTopics].filter((topic) => !preferred.includes(topic))];
  $('question-bank-copy').textContent = `${questionSetName(currentSet)}: choose one or more topics.`;
  const topicList = exam === 'sat'
    ? (SAT_TOPIC_GROUPS[currentSet] || []).map((group) => `<section class="topic-group"><h2>${escapeHtml(group.title)}</h2>${group.topics.map((topic) => {
      const key = `${group.title}::${topic}`;
      const selected = selectedQuestionTopics.includes(key);
      return `<button class="topic-choice ${selected ? 'is-selected' : ''}" data-toggle-topic="${escapeHtml(key)}" type="button"><span class="topic-circle" aria-hidden="true"></span><span><strong>${escapeHtml(topic)}</strong></span></button>`;
    }).join('')}</section>`).join('')
    : topics.map((topic) => {
      const selected = selectedQuestionTopics.includes(topic);
      return `<button class="topic-choice ${selected ? 'is-selected' : ''}" data-toggle-topic="${escapeHtml(topic)}" type="button"><span class="topic-circle" aria-hidden="true"></span><span><strong>${escapeHtml(topic)}</strong></span></button>`;
    }).join('');
  library.innerHTML = `<button class="library-back" data-question-bank-back type="button">Back to sections</button><div class="topic-selection ${exam === 'sat' ? 'is-grouped' : ''}">${topicList}</div><div class="topic-actions"><button class="button button-primary" data-start-selected-topics type="button" ${selectedQuestionTopics.length > 0 && !questionSetLoading ? '' : 'disabled'}>${questionSetLoading ? 'Loading questions...' : 'Start selected questions'}</button></div>`;
}

function toggleQuestionTopic(topic) {
  if (selectedQuestionTopics.includes(topic)) {
    selectedQuestionTopics = selectedQuestionTopics.filter((item) => item !== topic);
  } else {
    selectedQuestionTopics = [...selectedQuestionTopics, topic];
  }
  renderQuestionBank();
}

async function startSelectedTopics() {
  if (!selectedQuestionTopics.length || questionSetLoading) return;
  questionSetLoading = true;
  renderQuestionBank();
  try {
    const questions = await loadQuestionTopics(state.profile.exam, selectedQuestionTopics);
    if (questions.length) startPractice(currentSet, 0, questions);
    else showToast('No questions are available for these topics yet.');
  } catch {
    showToast('Questions could not be loaded right now.');
  } finally {
    questionSetLoading = false;
    if (currentPage === 'questions') renderQuestionBank();
  }
}

function renderQuestion() {
  const question = practiceQuestions[currentQuestion];
  const isMock = practiceMode === 'mock';
  const answer = checkedAnswers[question.id];
  const selectedAnswer = answer ?? draftAnswers[question.id];
  const isChecked = !isMock && answer !== undefined;
  const eliminated = state.progress.eliminated[question.id] || [];
  const marked = Boolean(state.progress.marked[question.id]);
  const section = questionSetName(currentSet);
  $('question-counter').textContent = `Question ${currentQuestion + 1} of ${practiceQuestions.length}`;
  $('test-module').textContent = `${section} / Module 1`;
  $('test-domain').textContent = question.domain;
  const completed = practiceMode === 'mock' ? Object.keys(draftAnswers).length : Object.keys(checkedAnswers).length;
  $('test-progress-fill').style.width = `${Math.min(100, Math.round((completed / Math.max(1, practiceQuestions.length)) * 100))}%`;
  $('test-xp').textContent = `${practiceXp} XP`;
  $('test-streak').textContent = practiceStreak ? `${practiceStreak} correct in a row` : 'Start your streak';
  $('question-domain-label').textContent = question.domain;
  $('question-prompt').textContent = compactDisplayText(question.prompt);
  const passage = compactDisplayText(question.passage);
  $('question-passage').textContent = passage;
  const questionImage=$('question-image'),imageSource=safeImageSource(question.image);
  questionImage.hidden=!imageSource;questionImage.src=imageSource||'';
  const hasContext = Boolean(passage || imageSource);
  $('passage-copy').hidden = !hasContext;
  $('question-workspace').classList.toggle('is-with-passage', hasContext);
  $('mark-question').innerHTML = `<span class="mark-indicator" aria-hidden="true"></span>${marked ? 'Marked for review' : 'Mark for review'}`;
  $('mark-question').classList.toggle('is-marked', marked);
  $('mark-question').setAttribute('aria-pressed', String(marked));
  $('answer-list').innerHTML = question.answers.map((text, index) => {
    const resultClass = isChecked && index === question.correct ? 'is-correct' : isChecked && index === answer ? 'is-incorrect' : '';
    const confirm = !isMock && selectedAnswer === index && !isChecked ? '<button class="confirm-answer" data-check-answer type="button">Check answer</button>' : '';
    return `<div class="answer-row ${eliminated.includes(index) ? 'is-eliminated' : ''}"><button class="answer-option ${selectedAnswer === index ? 'is-selected' : ''} ${resultClass}" data-answer="${index}" type="button" ${isChecked ? 'disabled' : ''}><span class="answer-letter">${'ABCD'[index]}</span><span>${text}</span></button>${confirm}<button class="eliminate-option ${eliminated.includes(index) ? 'is-active' : ''}" data-eliminate="${index}" type="button" title="Eliminate answer ${'ABCD'[index]}" aria-label="Eliminate answer ${'ABCD'[index]}" ${isChecked ? 'disabled' : ''}>x</button></div>`;
  }).join('');
  $('answer-status').textContent = isChecked ? (answer === question.correct ? 'Correct.' : `Incorrect. The correct answer is ${'ABCD'[question.correct]}.`) : '';
  $('answer-status').className = `answer-status ${isChecked ? (answer === question.correct ? 'is-correct' : 'is-incorrect') : ''}`;
  const hasExplanation = Boolean(!isMock && isChecked && question.explanation);
  $('explanation-toggle').classList.toggle('is-hidden', !hasExplanation);
  $('explanation-toggle').textContent = explanationOpen ? 'Hide explanation' : 'View explanation';
  $('explanation-panel').classList.toggle('is-hidden', !hasExplanation || !explanationOpen);
  $('explanation-copy').textContent = hasExplanation ? question.explanation : '';
  $('previous-question').disabled = currentQuestion === 0;
  $('next-question').disabled = false;
  $('next-question').textContent = currentQuestion === practiceQuestions.length - 1 ? 'Finish' : 'Next';
  renderQuestionNavigator();
}

function startPractice(set = 'math', questionIndex = 0, questions = null, mode = 'bank', planTaskId = '') {
  currentSet = set;
  practiceQuestions = questions || [];
  currentQuestion = Math.max(0, Math.min(questionIndex, practiceQuestions.length - 1));
  draftAnswers = {};
  checkedAnswers = {};
  practiceXp = 0;
  practiceStreak = 0;
  practiceMode = mode;
  activePlanTaskId = planTaskId;
  questionOpenedAt = Date.now();
  explanationOpen = false;
  openPage('questions');
  $('test-experience').classList.remove('is-hidden');
  $('test-experience').classList.toggle('is-mock-mode', practiceMode === 'mock');
  $('question-navigator').classList.add('is-hidden');
  startTimer();
  renderQuestion();
  saveActivePractice();
}

function leavePractice() {
  $('test-experience').classList.add('is-hidden');
  $('question-navigator').classList.add('is-hidden');
  stopTimer();
  clearActivePractice();
  activePlanTaskId = '';
}

function answerQuestion(index) {
  const question = practiceQuestions[currentQuestion];
  if (checkedAnswers[question.id] !== undefined) return;
  draftAnswers[question.id] = index;
  if (practiceMode === 'mock') {
    state.progress.answers[question.id] = index;
    persist();
  }
  renderQuestion();
  saveActivePractice();
}

function checkAnswer() {
  const question = practiceQuestions[currentQuestion];
  const choice = draftAnswers[question.id];
  if (practiceMode === 'mock' || choice === undefined || checkedAnswers[question.id] !== undefined) return;
  checkedAnswers[question.id] = choice;
  if (choice === question.correct) {
    practiceStreak += 1;
    practiceXp += 10 + Math.min(20, (practiceStreak - 1) * 2);
  } else {
    practiceStreak = 0;
  }
  state.progress.answers[question.id] = choice;
  const history = state.progress.questionHistory || (state.progress.questionHistory = []);
  const previous = history.findIndex((entry) => entry.id === question.id && entry.activePlanTaskId === activePlanTaskId);
  const record = { id: question.id, exam: state.profile.exam, set: question.set || currentSet, domain: question.domain || '', skill: question.skill || '', difficulty: question.difficulty || '', correct: choice === question.correct, responseSeconds: questionOpenedAt ? Math.max(1, Math.round((Date.now() - questionOpenedAt) / 1000)) : 0, answeredAt: Date.now(), activePlanTaskId };
  if (previous >= 0) history.splice(previous, 1, record);
  else history.push(record);
  if (history.length > 600) history.splice(0, history.length - 600);
  delete draftAnswers[question.id];
  renderQuestion();
  renderHome();
  persist();
  saveActivePractice();
}

function toggleEliminated(index) {
  const question = practiceQuestions[currentQuestion];
  const eliminated = new Set(state.progress.eliminated[question.id] || []);
  eliminated.has(index) ? eliminated.delete(index) : eliminated.add(index);
  state.progress.eliminated[question.id] = [...eliminated];
  renderQuestion();
  persist();
  saveActivePractice();
}

function toggleMark() {
  const question = practiceQuestions[currentQuestion];
  state.progress.marked[question.id] = !state.progress.marked[question.id];
  renderQuestion();
  persist();
  saveActivePractice();
}

function moveQuestion(delta) {
  const next = currentQuestion + delta;
  if (next >= practiceQuestions.length) {
    const now = new Date();
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const today = localDateKey(now);
    const yesterday = localDateKey(yesterdayDate);
    state.progress.sessions += 1;
    state.progress.streak = state.progress.lastSessionDate === today ? Math.max(1, state.progress.streak) : state.progress.lastSessionDate === yesterday ? state.progress.streak + 1 : 1;
    state.progress.lastSessionDate = today;
    if (practiceMode === 'plan') completePlanTask();
    persist();
    renderHome();
    renderStudyPlan();
    showToast(practiceMode === 'mock' ? 'Mock complete. Your responses were saved.' : practiceMode === 'plan' ? 'Plan task complete. Your next task is ready.' : 'Practice set complete. Progress saved.');
    leavePractice();
    return;
  }
  if (next < 0) return;
  currentQuestion = next;
  questionOpenedAt = Date.now();
  explanationOpen = false;
  renderQuestion();
  saveActivePractice();
}

function renderQuestionNavigator() {
  $('navigator-grid').innerHTML = practiceQuestions.map((question, index) => {
    const answered = practiceMode === 'mock' ? draftAnswers[question.id] !== undefined : checkedAnswers[question.id] !== undefined;
    const marked = Boolean(state.progress.marked[question.id]);
    const classes = [index === currentQuestion ? 'is-current' : '', answered ? 'is-answered' : '', marked ? 'is-marked' : ''].filter(Boolean).join(' ');
    return `<button class="navigator-question ${classes}" type="button" data-jump-question="${index}" aria-label="Question ${index + 1}${marked ? ', marked for review' : ''}">${index + 1}</button>`;
  }).join('');
}

function toggleQuestionNavigator() {
  $('question-navigator').classList.toggle('is-hidden');
}

function jumpToQuestion(index) {
  if (!Number.isInteger(index) || index < 0 || index >= practiceQuestions.length) return;
  currentQuestion = index;
  questionOpenedAt = Date.now();
  explanationOpen = false;
  $('question-navigator').classList.add('is-hidden');
  renderQuestion();
  saveActivePractice();
}

function openPage(page) {
  if (page !== 'speaking-ai') endVoiceSession();
  currentPage = page;
  document.body.classList.toggle('is-voice-lab-open', page === 'speaking-ai');
  document.querySelectorAll('.page').forEach((section) => section.classList.toggle('is-active', section.id === `${page}-page`));
  document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('is-active', link.dataset.page === page && (!link.dataset.skill || link.dataset.skill === currentSkill)));
  if (page !== 'questions') leavePractice();
  if (page === 'questions') renderQuestionBank();
  if (page === 'plan') renderStudyPlan();
  if (page === 'speaking-ai') {
    renderVoiceTranscript();
    renderVoiceState();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderVoiceTranscript() {
  const draft = `${voiceLab.finalText} ${voiceLab.interimText}`.replace(/\s+/g, ' ').trim();
  const turns = voiceLab.messages.map((message) => `<article class="voice-turn voice-turn-${message.role}"><span>${message.role === 'user' ? 'You' : message.role === 'model' ? 'Luminary' : 'Connection'}</span><p>${escapeHtml(message.text)}</p></article>`);
  if (draft) turns.push(`<article class="voice-turn voice-turn-user is-draft"><span>You · listening</span><p>${escapeHtml(draft)}</p></article>`);
  if (voiceLab.pending) turns.push('<article class="voice-turn voice-turn-model is-thinking"><span>Luminary</span><p><i></i><i></i><i></i></p></article>');
  $('voice-transcript').innerHTML = turns.length ? turns.join('') : '<article class="voice-turn voice-turn-model"><span>Luminary</span><p>Hi, I’m Luminary. Start the conversation and speak naturally—I’ll answer when you pause.</p></article>';
  $('voice-word-count').textContent = `${voiceLab.messages.length} message${voiceLab.messages.length === 1 ? '' : 's'}`;
  requestAnimationFrame(() => { $('voice-transcript').scrollTop = $('voice-transcript').scrollHeight; });
}

function renderVoiceState() {
  $('speaking-ai-page').classList.toggle('is-listening', voiceLab.listening);
  if (!voiceLab.recognition) {
    $('voice-toggle').textContent = 'Voice unavailable';
    $('voice-toggle').disabled = true;
    $('voice-toggle').setAttribute('aria-pressed', 'false');
    $('voice-status').textContent = 'Use Chrome or Edge';
    $('voice-hint').textContent = 'Live speech recognition is not available in this browser.';
    return;
  }
  $('voice-toggle').textContent = voiceLab.active ? 'End conversation' : 'Start conversation';
  $('voice-toggle').disabled = false;
  $('voice-toggle').setAttribute('aria-pressed', String(voiceLab.active));
  $('voice-status').textContent = voiceLab.listening
    ? 'Listening…'
    : voiceLab.speaking
      ? 'Luminary is speaking…'
      : voiceLab.pending
        ? 'Luminary is thinking…'
        : voiceLab.active
          ? 'Getting ready…'
          : 'Ready';
  $('voice-hint').textContent = voiceLab.listening
    ? 'Speak naturally. Luminary responds automatically when you pause.'
    : voiceLab.speaking
      ? 'Listening resumes automatically when Luminary finishes.'
      : voiceLab.pending
        ? 'Your reply will appear here in a moment.'
        : voiceLab.active
          ? 'The microphone will reopen automatically.'
          : 'Tap once to begin. Luminary listens again after every reply.';
}

function setVoiceListening(listening) {
  voiceLab.listening = listening;
  renderVoiceState();
}

function speakVoiceReply(text) {
  if (!('speechSynthesis' in window) || !text) return Promise.resolve();
  window.speechSynthesis.cancel();
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    voiceLab.utterance = utterance;
    voiceLab.speaking = true;
    renderVoiceState();
    utterance.lang = 'en-US';
    utterance.rate = 0.96;
    const finish = () => {
      if (voiceLab.utterance === utterance) {
        voiceLab.utterance = null;
        voiceLab.speaking = false;
        renderVoiceState();
      }
      resolve();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
  });
}

async function sendVoiceTurn(text) {
  const message = String(text || '').replace(/\s+/g, ' ').trim();
  if (!message) { showToast('I did not hear any words. Please try again.'); return; }
  voiceLab.messages.push({ role: 'user', text: message });
  voiceLab.pending = true;
  setVoiceListening(false);
  renderVoiceTranscript();

  const controller = new AbortController();
  voiceLab.requestController = controller;
  try {
    const response = await fetch(`${SPEAKING_AI_SERVICE_URL}/speaking/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ messages: voiceLab.messages.filter((item) => item.role !== 'error').slice(-12) })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.reply) throw new Error(data.error || 'Luminary could not reply.');
    if (!voiceLab.active || currentPage !== 'speaking-ai' || controller.signal.aborted) return;
    voiceLab.messages.push({ role: 'model', text: String(data.reply).trim() });
    voiceLab.pending = false;
    renderVoiceTranscript();
    await speakVoiceReply(data.reply);
  } catch (error) {
    if (error.name !== 'AbortError') voiceLab.messages.push({ role: 'error', text: error.message || 'Luminary could not reply. Please try again.' });
  } finally {
    if (voiceLab.requestController === controller) {
      voiceLab.requestController = null;
      voiceLab.pending = false;
      setVoiceListening(false);
      renderVoiceTranscript();
      if (voiceLab.active && currentPage === 'speaking-ai') {
        voiceLab.restartTimer = setTimeout(startVoiceLab, 250);
      }
    }
  }
}

function initVoiceLab() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    $('voice-toggle').disabled = true;
    $('voice-status').textContent = 'Use Chrome or Edge';
    $('voice-hint').textContent = 'Live speech recognition is not available in this browser.';
    return;
  }
  voiceLab.recognition = new Recognition();
  voiceLab.recognition.continuous = false;
  voiceLab.recognition.interimResults = true;
  voiceLab.recognition.lang = 'en-US';
  voiceLab.recognition.onresult = (event) => {
    if (!voiceLab.listening) return;
    let interim = '';
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const text = event.results[index][0].transcript.trim();
      if (event.results[index].isFinal) voiceLab.finalText = `${voiceLab.finalText} ${text}`.trim();
      else interim = `${interim} ${text}`.trim();
    }
    voiceLab.interimText = interim;
    renderVoiceTranscript();
  };
  voiceLab.recognition.onerror = (event) => {
    if (event.error === 'no-speech' || event.error === 'aborted') return;
    if (event.error === 'not-allowed') showToast('Allow microphone access to talk with Luminary.');
    else showToast('Voice recognition stopped. Please try again.');
    endVoiceSession();
  };
  voiceLab.recognition.onend = () => {
    if (!voiceLab.listening) return;
    const message = `${voiceLab.finalText} ${voiceLab.interimText}`.replace(/\s+/g, ' ').trim();
    voiceLab.finalText = '';
    voiceLab.interimText = '';
    setVoiceListening(false);
    renderVoiceTranscript();
    if (!voiceLab.active || currentPage !== 'speaking-ai') return;
    if (message) sendVoiceTurn(message);
    else voiceLab.restartTimer = setTimeout(startVoiceLab, 250);
  };
  renderVoiceState();
}

function startVoiceLab() {
  if (!voiceLab.recognition || !voiceLab.active || voiceLab.listening || voiceLab.pending || voiceLab.speaking || currentPage !== 'speaking-ai') return;
  clearTimeout(voiceLab.restartTimer);
  voiceLab.restartTimer = null;
  voiceLab.finalText = '';
  voiceLab.interimText = '';
  try {
    voiceLab.recognition.start();
    setVoiceListening(true);
  } catch {
    voiceLab.active = false;
    renderVoiceState();
    showToast('The microphone could not start.');
  }
}

function startVoiceSession() {
  if (!voiceLab.recognition || voiceLab.active) return;
  voiceLab.active = true;
  renderVoiceState();
  startVoiceLab();
}

function endVoiceSession() {
  clearTimeout(voiceLab.restartTimer);
  voiceLab.restartTimer = null;
  voiceLab.active = false;
  voiceLab.finalText = '';
  voiceLab.interimText = '';
  if (voiceLab.listening && voiceLab.recognition) {
    voiceLab.listening = false;
    try { voiceLab.recognition.abort(); } catch {}
  }
  if (voiceLab.requestController) {
    voiceLab.requestController.abort();
    voiceLab.requestController = null;
  }
  voiceLab.pending = false;
  voiceLab.speaking = false;
  voiceLab.utterance = null;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  renderVoiceState();
  renderVoiceTranscript();
}

function clearVoiceLab() {
  endVoiceSession();
  voiceLab.messages = [];
  renderVoiceTranscript();
}

function renderHomeControls() {
  const isSat = state.profile.exam === 'sat';
  const goal = activeGoal();
  const scores = isSat ? Array.from({ length: 121 }, (_, index) => String(400 + index * 10)) : Array.from({ length: 19 }, (_, index) => (index / 2).toFixed(1));
  $('home-score').innerHTML = `<option value="">Choose a target score</option>${scores.map((score) => `<option value="${score}">${score}</option>`).join('')}`;
  $('home-score').value = scores.includes(goal.target) ? goal.target : '';
  $('score-help').textContent = isSat ? 'SAT scores are available from 400 to 1600 in 10-point steps.' : 'IELTS overall bands are available from 0.0 to 9.0 in 0.5-band steps.';
  $('home-sat-date').innerHTML = `<option value="">Choose an SAT test date</option>${SAT_DATES.map((date) => `<option value="${date}">${dateText(date)}</option>`).join('')}`;
  $('home-sat-date').value = SAT_DATES.includes(goal.date) ? goal.date : '';
  $('home-sat-date').hidden = !isSat;
  $('home-date').hidden = isSat;
  $('home-date').value = !isSat ? goal.date : '';
  $('date-help').textContent = isSat ? 'Official and anticipated SAT dates through June 2028.' : 'Choose any IELTS date through December 2028.';
}

function previewGoal() {
  const exam = state.profile.exam;
  setActiveGoal($('home-score').value, exam === 'sat' ? $('home-sat-date').value : $('home-date').value);
  renderHome();
}

function saveGoalChoice() {
  previewGoal();
  if (state.profile.exam === 'sat' && state.studyPlan.setup) {
    state.studyPlan.setup.target = state.profile.target;
    state.studyPlan.setup.date = state.profile.date;
    generateStudyPlan(state.studyPlan.setup, true);
    renderStudyPlan();
  }
  clearTimeout(goalSaveTimer);
  goalSaveTimer = setTimeout(() => persist(), 250);
}

function applyAuthenticatedUser(user) {
  const nextAccountId = user?.uid || '';
  if (nextAccountId !== activeAccountId) {
    activeAccountId = nextAccountId;
    try {
      const saved = JSON.parse(localStorage.getItem(stateStorageKey()) || 'null');
      if (saved) mergeState(saved);
      else if (nextAccountId) localStorage.setItem(stateStorageKey(), JSON.stringify(state));
    } catch { /* Keep the current session if stored account data is unavailable. */ }
    applyTheme(state.profile.theme);
    setExam(state.profile.exam, false);
  }
  const suggestedName = user?.name || String(user?.email || '').split('@')[0];
  if (suggestedName && !state.profile.name) state.profile.name = suggestedName;
  renderHomeControls();
  renderHome();
  renderStudyPlan();
  if (user) persist();
}

function bindEvents() {
  window.addEventListener('luminary:auth-state', (event) => applyAuthenticatedUser(event.detail));
  window.addEventListener('luminary:auth-error', (event) => showToast(event.detail));
  document.addEventListener('click', (event) => {
    if (!$('global-theme-control').contains(event.target)) {
      $('theme-popover').hidden = true;
      $('global-theme-button').setAttribute('aria-expanded', 'false');
    }
    const onboardingChoice = event.target.closest('[data-onboarding-exam]');
    if (onboardingChoice) {
      onboardingExam = onboardingChoice.dataset.onboardingExam;
      document.querySelectorAll('[data-onboarding-exam]').forEach((button) => button.classList.toggle('is-selected', button === onboardingChoice));
      populateOnboarding(onboardingExam);
      $('onboarding-error').textContent = '';
      return;
    }
    const training = event.target.closest('[data-train-topic]');
    if (training) { startRecommendedTraining(training.dataset.trainTopic, training.dataset.trainSet); return; }
    const reviewTopic = event.target.closest('[data-review-topic]');
    if (reviewTopic) { openRecommendedMaterial(reviewTopic.dataset.reviewTopic); return; }
    const goalEditor = event.target.closest('[data-edit-goal]');
    if (goalEditor) {
      setMobileDrawer(false);
      openPage('home');
      renderHomeControls();
      const field = $(goalEditor.dataset.editGoal === 'date' ? (state.profile.exam === 'sat' ? 'home-sat-date' : 'home-date') : 'home-score');
      requestAnimationFrame(() => { $('home-settings').scrollIntoView({ block: 'center', behavior: 'smooth' }); field.focus({ preventScroll: true }); });
      return;
    }
    const exam = event.target.closest('[data-exam]');
    if (exam) { setExam(exam.dataset.exam); setMobileDrawer(false); persist(); return; }
    const page = event.target.closest('[data-page]');
    if (page) { currentSkill = page.dataset.skill || ''; openPage(page.dataset.page); setMobileDrawer(false); renderLearn(); renderVocab(); renderProblems(); renderMocks(); return; }
    const theme = event.target.closest('[data-theme]');
    if (theme) {
      applyTheme(theme.dataset.theme);
      $('theme-popover').hidden = true;
      $('global-theme-button').setAttribute('aria-expanded', 'false');
      persist();
      showToast(`${THEMES[theme.dataset.theme].name} palette selected.`);
      return;
    }
    const mock = event.target.closest('[data-start-mock]');
    if(mock){const item=remotePractice.mocks[mock.dataset.startMock]?.items.find(entry=>entry.id===mock.dataset.mockId);if(item)startRemoteQuestions(`mock-${item.id}`,item.questions,item.skill==='math'?'math':'rw');return;}
    const prep=event.target.closest('[data-open-prep]');
    if(prep){openIeltsPrep(prep.dataset.openPrep,prep.dataset.prepId);return;}
    const material = event.target.closest('[data-open-material]');
    if (material) { openMaterial(material.dataset.openMaterial, material.dataset.materialId); return; }
    const vocabulary = event.target.closest('[data-open-vocab]');
    if (vocabulary) { openVocabularyFolder(vocabulary.dataset.openVocab, vocabulary.dataset.vocabFolder); return; }
    const review = event.target.closest('[data-vocab-review]');
    if (review) { respondVocabularyReview(review.dataset.vocabReview); return; }
    const planTask = event.target.closest('[data-plan-task]');
    if (planTask) { startPlanTask(planTask.dataset.planTask); return; }
    const skipTask = event.target.closest('[data-plan-skip]');
    if (skipTask) { skipPlanTask(skipTask.dataset.planSkip); return; }
    const confirm = event.target.closest('[data-check-answer]');
    if (confirm) { checkAnswer(); return; }
    const jump = event.target.closest('[data-jump-question]');
    if (jump) { jumpToQuestion(Number(jump.dataset.jumpQuestion)); return; }
    const section = event.target.closest('[data-select-set]');
    if (section) { currentSet = section.dataset.selectSet; selectedQuestionTopics = []; questionBankView = 'topics'; renderQuestionBank(); return; }
    const topic = event.target.closest('[data-toggle-topic]');
    if (topic) { toggleQuestionTopic(topic.dataset.toggleTopic); return; }
    const startSelected = event.target.closest('[data-start-selected-topics]');
    if (startSelected) { startSelectedTopics(); return; }
    const questionBankBack = event.target.closest('[data-question-bank-back]');
    if (questionBankBack) { questionBankView = 'sections'; selectedQuestionTopics = []; renderQuestionBank(); return; }
    const answer = event.target.closest('[data-answer]');
    if (answer) { answerQuestion(Number(answer.dataset.answer)); return; }
    const eliminate = event.target.closest('[data-eliminate]');
    if (eliminate) { toggleEliminated(Number(eliminate.dataset.eliminate)); return; }
  });
  document.addEventListener('keydown', (event) => {
    if ($('test-experience').classList.contains('is-hidden') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName || '')) return;
    const key = event.key.toLowerCase();
    if ('abcd'.includes(key)) { answerQuestion('abcd'.indexOf(key)); return; }
    if (key === 'enter') {
      const question = practiceQuestions[currentQuestion];
      practiceMode === 'mock' || checkedAnswers[question.id] !== undefined ? moveQuestion(1) : checkAnswer();
      return;
    }
    if (key === 'arrowleft') moveQuestion(-1);
    if (key === 'arrowright') moveQuestion(1);
  });
  $('leave-practice').addEventListener('click', leavePractice);
  $('previous-question').addEventListener('click', () => moveQuestion(-1));
  $('next-question').addEventListener('click', () => moveQuestion(1));
  $('mark-question').addEventListener('click', toggleMark);
  $('question-counter').addEventListener('click', toggleQuestionNavigator);
  $('close-question-navigator').addEventListener('click', () => $('question-navigator').classList.add('is-hidden'));
  $('explanation-toggle').addEventListener('click', () => { explanationOpen = !explanationOpen; renderQuestion(); });
  $('pause-timer').addEventListener('click', toggleTimer);
  $('hide-timer').addEventListener('click', toggleTimerVisibility);
  $('mobile-menu-button').addEventListener('click', () => setMobileDrawer(!$('sidebar').classList.contains('is-open')));
  $('mobile-drawer-backdrop').addEventListener('click', () => setMobileDrawer(false));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMobileDrawer(false); });
  $('global-theme-button').addEventListener('click', () => {
    const open = $('theme-popover').hidden;
    $('theme-popover').hidden = !open;
    $('global-theme-button').setAttribute('aria-expanded', String(open));
  });
  $('onboarding-back').addEventListener('click', () => showOnboardingStep(onboardingStep - 1));
  $('onboarding-skip').addEventListener('click', skipOnboarding);
  $('onboarding-next').addEventListener('click', async () => {
    const error = validateOnboardingStep();
    if (error) { $('onboarding-error').textContent = error; return; }
    if (onboardingStep < 6) { showOnboardingStep(onboardingStep + 1); return; }
    $('onboarding-next').disabled = true;
    $('onboarding-next').textContent = 'Building your workspace...';
    try { await completeOnboarding(); }
    finally {
      $('onboarding-next').disabled = false;
      $('onboarding-next').textContent = 'Finish setup';
    }
  });
  $('daily-action').addEventListener('click', () => {
    const question = dailyQuestionStore[state.profile.exam].question;
    if (question) startPractice(question.set, 0, [question], 'daily');
  });
  $('home-plan-action').addEventListener('click', () => {
    const taskId = $('home-plan-action').dataset.planTask;
    if (taskId) startPlanTask(taskId);
    else openPage('plan');
  });
  $('create-study-plan').addEventListener('click', () => {
    const setup = planSetupFromForm();
    if (!setup.currentTotal || !setup.currentRw || !setup.currentMath || !setup.target || !setup.targetRw || !setup.targetMath || !setup.date) { showToast('Complete your current scores, target scores, and SAT date.'); return; }
    if (Number(setup.currentRw) + Number(setup.currentMath) !== Number(setup.currentTotal)) { showToast('Your current Reading & Writing and Math scores must equal your current total.'); return; }
    if (Number(setup.targetRw) + Number(setup.targetMath) !== Number(setup.target)) { showToast('Your target Reading & Writing and Math scores must equal your target total.'); return; }
    if (Number(setup.target) <= Number(setup.currentTotal)) { showToast('Your target score should be above your current score.'); return; }
    state.profile.goals.sat = { target: setup.target, date: setup.date };
    if (state.profile.exam === 'sat') { state.profile.target = setup.target; state.profile.date = setup.date; }
    generateStudyPlan(setup, false);
    renderStudyPlan();
    renderHome();
    showToast('Your SAT study plan is ready.');
  });
  $('refresh-study-plan').addEventListener('click', () => {
    if (!state.studyPlan.setup) return;
    generateStudyPlan(state.studyPlan.setup, true);
    renderStudyPlan();
    renderHome();
    showToast('Your future tasks were updated from your latest work.');
  });
  $('plan-target').addEventListener('change', () => {
    const total = Number($('plan-target').value);
    if (!total) return;
    const rw = balancedSectionScore(total, Number($('plan-target-rw').value));
    $('plan-target-rw').value = String(rw);
    $('plan-target-math').value = String(total - rw);
    syncTargetSections('plan-target-rw');
  });
  $('plan-target-rw').addEventListener('change', () => syncTargetSections('plan-target-rw'));
  $('plan-target-math').addEventListener('change', () => syncTargetSections('plan-target-math'));
  $('plan-current-total').addEventListener('change', () => syncCurrentTotal('plan-current-total'));
  $('plan-current-rw').addEventListener('change', () => syncCurrentTotal('plan-current-rw'));
  $('plan-current-math').addEventListener('change', () => syncCurrentTotal('plan-current-math'));
  $('back-to-materials').addEventListener('click', backToMaterials);
  $('back-to-vocab').addEventListener('click', () => openPage('vocab'));
  $('back-to-vocab-study').addEventListener('click', () => openPage('vocab-study'));
  $('start-vocab-review').addEventListener('click', openVocabularyReview);
  $('vocab-search').addEventListener('input', (event) => {
    vocabularyContext.query = event.target.value;
    vocabularyContext.page = 0;
    renderVocabularyStudy();
  });
  $('vocab-previous').addEventListener('click', () => {
    vocabularyContext.page = Math.max(0, vocabularyContext.page - 1);
    renderVocabularyStudy();
  });
  $('vocab-next').addEventListener('click', () => {
    vocabularyContext.page += 1;
    renderVocabularyStudy();
  });
  $('voice-toggle').addEventListener('click', () => voiceLab.active ? endVoiceSession() : startVoiceSession());
  $('voice-clear').addEventListener('click', clearVoiceLab);
  $('voice-lab-back').addEventListener('click', () => openPage('home'));
  $('voice-lab-exit').addEventListener('click', () => openPage('home'));
  ['home-score', 'home-sat-date', 'home-date'].forEach((id) => {
    $(id).addEventListener('change', saveGoalChoice);
    $(id).addEventListener('input', saveGoalChoice);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveActivePractice();
    if (document.visibilityState === 'hidden' && currentPage === 'speaking-ai') endVoiceSession();
  });
  window.addEventListener('pagehide', endVoiceSession);
}

async function init() {
  try { mergeState(await api('/api/state')); }
  catch { try { mergeState(JSON.parse(localStorage.getItem('luminary-state') || '{}')); } catch { mergeState(DEFAULT_STATE); } }
  applyTheme(state.profile.theme);
  renderHomeControls();
  setExam(state.profile.exam, false);
  renderQuestionBank();
  bindEvents();
  initVoiceLab();
  loadRemoteMaterials('rules');
  if (window.matchMedia('(max-width: 620px)').matches) {
    clearActivePractice();
    openPage('home');
  } else restoreActivePractice();
  applyAuthenticatedUser(window.luminaryAuthUser);
  startOnboarding();
}

init();
