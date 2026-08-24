'use strict';

window.luminaryAppLoaded = true;

const THEMES = {
  coffee: { name: 'Beige & White', bg: '#f4efe7', surface: '#fffdf9', surfaceRaised: '#ffffff', sidebar: '#31251d', sidebarSurface: '#4a382b', text: '#30251c', textSoft: '#786958', textMuted: '#958677', line: '#dfd1bd', accent: '#ca983e', accentHover: '#ae7e30', accentSoft: '#f1dfbb', onAccent: '#2d2118', sideText: '#fffaf2', sideMuted: '#cbbba8', success: '#2d7a58', danger: '#af4c43' },
  dark: { name: 'Dark', bg: '#171717', surface: '#222222', surfaceRaised: '#2b2b2b', sidebar: '#101010', sidebarSurface: '#303030', text: '#f7f3ed', textSoft: '#c2bbb1', textMuted: '#938b82', line: '#42403d', accent: '#d3a75a', accentHover: '#e2bb73', accentSoft: '#40331e', onAccent: '#241b10', sideText: '#faf7f1', sideMuted: '#bdb6ad', success: '#69bb8c', danger: '#ed8279' },
  navy: { name: 'Dark Blue', bg: '#111827', surface: '#182235', surfaceRaised: '#202c42', sidebar: '#0b1220', sidebarSurface: '#1c2b43', text: '#f3f7ff', textSoft: '#b7c4d9', textMuted: '#8594ab', line: '#34445c', accent: '#71b5ee', accentHover: '#9bcdf3', accentSoft: '#183b5d', onAccent: '#09253d', sideText: '#f5f9ff', sideMuted: '#b5c2d7', success: '#65c5a1', danger: '#ef8c92' },
  purple: { name: 'Dark Purple', bg: '#1b1422', surface: '#251b30', surfaceRaised: '#30223d', sidebar: '#120d18', sidebarSurface: '#372744', text: '#faf4ff', textSoft: '#d2c1dc', textMuted: '#a791b2', line: '#4b395b', accent: '#c69ce6', accentHover: '#dcbaef', accentSoft: '#442c58', onAccent: '#281537', sideText: '#fff8ff', sideMuted: '#d0bfd9', success: '#75bd9b', danger: '#ef92a0' },
  forest: { name: 'Forest', bg: '#15211c', surface: '#1d2d25', surfaceRaised: '#283b30', sidebar: '#0e1813', sidebarSurface: '#2a4535', text: '#f4fbf5', textSoft: '#c1d2c4', textMuted: '#91a896', line: '#3c5445', accent: '#88c99e', accentHover: '#aadab9', accentSoft: '#224d37', onAccent: '#0d2d1c', sideText: '#f6fff7', sideMuted: '#bdd2c1', success: '#8ad0a0', danger: '#f2948b' },
  sunset: { name: 'Sunset', bg: '#2a1b18', surface: '#38231e', surfaceRaised: '#482c24', sidebar: '#1d110f', sidebarSurface: '#4f2f25', text: '#fff6ed', textSoft: '#dec7b5', textMuted: '#b59680', line: '#624237', accent: '#ec8c57', accentHover: '#f2a06f', accentSoft: '#603222', onAccent: '#3a170d', sideText: '#fff7f0', sideMuted: '#dbc3b1', success: '#92c48d', danger: '#f08077' }
};

const DEFAULT_STATE = {
  profile: { name: '', exam: 'sat', target: '', date: '', goals: { sat: { target: '', date: '' }, ielts: { target: '', date: '' } }, theme: 'coffee' },
  progress: { sessions: 0, streak: 0, lastSessionDate: '', answers: {}, marked: {}, eliminated: {} }
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

const MATERIAL_DATABASE_URL = 'https://dataluminary-default-rtdb.europe-west1.firebasedatabase.app';
const QUESTION_DATABASE_URL = 'https://luminary-46748-default-rtdb.europe-west1.firebasedatabase.app';
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
let draftAnswers = {};
let checkedAnswers = {};
let practiceMode = 'bank';
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
const ACTIVE_PRACTICE_KEY = 'luminary-active-practice';
const vocabularyStores = {
  sat: { folders: [], words: [], status: 'idle' },
  ielts: { folders: [], words: [], status: 'idle' }
};
let vocabularyContext = { exam: 'sat', folder: '', query: '', page: 0 };
let vocabularyReview = { words: [], index: 0, known: 0, revealed: false };

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
      eliminated: { ...DEFAULT_STATE.progress.eliminated, ...(progress.eliminated || {}) }
    }
  };
  if (!THEMES[state.profile.theme]) state.profile.theme = 'coffee';
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
  try { await api('/api/state', { method: 'PUT', body: JSON.stringify(state) }); }
  catch { localStorage.setItem('luminary-state', JSON.stringify(state)); showToast('Saved in this browser while the local server is unavailable.'); }
}

function applyTheme(themeId) {
  const id = THEMES[themeId] ? themeId : 'coffee';
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
  $('profile-exam').value = state.profile.exam;
  renderQuestionBank();
  renderProfileControls();
  renderHome();
  renderLearn();
  renderVocab();
  renderProblems();
  renderMocks();
  if (returnHome) openPage('home');
}

function renderHome() {
  const isIelts = state.profile.exam === 'ielts';
  const { target, date } = activeGoal();
  $('home-kicker').textContent = isIelts ? 'IELTS plan' : 'SAT plan';
  $('home-copy').textContent = isIelts ? 'Keep Listening, Reading, Writing, and Speaking in balance.' : 'Choose one focused task and keep moving.';
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
  return fetchDatabaseData(MATERIAL_DATABASE_URL, path);
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
}

function loadRemoteMaterials(category) {
  if (state.profile.exam !== 'sat' || remoteMaterialLoads[category]) return;
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
  return { id: `${prefix}-${id}`, domain, set, prompt: compactDisplayText(split.prompt || item.question || item.prompt || 'Choose the best answer.'), passage: compactDisplayText(split.passage), answers: answers.map((answer) => compactDisplayText(answer)), correct, image: item.image || item.imageUrl || item.picture || '', explanation: compactDisplayText(item.explain || item.explanation || '') };
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
  const allQuestions = await loadRemoteQuestionBank(exam);
  missingTopics.forEach((topic) => { cache[topic] = allQuestions.filter((question) => question.domain === topic); });
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
  $('theme-grid').innerHTML = Object.entries(THEMES).map(([id, theme]) => `<button class="theme-card ${id === state.profile.theme ? 'is-selected' : ''}" type="button" data-theme="${id}"><span class="theme-preview" style="--preview-bg:${theme.bg};--preview-surface:${theme.surface};--preview-accent:${theme.accent}"><i></i><b></b><em></em></span><span><strong>${theme.name}</strong><small>Background, surface, accent</small></span><span class="selected-label">Selected</span></button>`).join('');
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
      draftAnswers,
      checkedAnswers,
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
    practiceMode = saved.mode === 'mock' ? 'mock' : 'bank';
    draftAnswers = saved.draftAnswers || {};
    checkedAnswers = saved.checkedAnswers || {};
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
  if(store.status === 'idle') loadRemoteQuestionBank(exam);
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

function startPractice(set = 'math', questionIndex = 0, questions = null, mode = 'bank') {
  currentSet = set;
  practiceQuestions = questions || [];
  currentQuestion = Math.max(0, Math.min(questionIndex, practiceQuestions.length - 1));
  draftAnswers = {};
  checkedAnswers = {};
  practiceMode = mode;
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
  state.progress.answers[question.id] = choice;
  delete draftAnswers[question.id];
  renderQuestion();
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
    const localDateKey = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    const now = new Date();
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const today = localDateKey(now);
    const yesterday = localDateKey(yesterdayDate);
    state.progress.sessions += 1;
    state.progress.streak = state.progress.lastSessionDate === today ? Math.max(1, state.progress.streak) : state.progress.lastSessionDate === yesterday ? state.progress.streak + 1 : 1;
    state.progress.lastSessionDate = today;
    persist();
    renderHome();
    showToast(practiceMode === 'mock' ? 'Mock complete. Your responses were saved.' : 'Practice set complete. Progress saved.');
    leavePractice();
    return;
  }
  if (next < 0) return;
  currentQuestion = next;
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
  explanationOpen = false;
  $('question-navigator').classList.add('is-hidden');
  renderQuestion();
  saveActivePractice();
}

function openPage(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach((section) => section.classList.toggle('is-active', section.id === `${page}-page`));
  document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('is-active', link.dataset.page === page && (!link.dataset.skill || link.dataset.skill === currentSkill)));
  if (page !== 'questions') leavePractice();
  if (page === 'questions') renderQuestionBank();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderProfileControls() {
  const isSat = state.profile.exam === 'sat';
  const goal = activeGoal();
  const scores = isSat ? Array.from({ length: 121 }, (_, index) => String(400 + index * 10)) : Array.from({ length: 19 }, (_, index) => (index / 2).toFixed(1));
  $('profile-score').innerHTML = `<option value="">Choose a target score</option>${scores.map((score) => `<option value="${score}">${score}</option>`).join('')}`;
  $('profile-score').value = scores.includes(goal.target) ? goal.target : '';
  $('score-help').textContent = isSat ? 'SAT scores are available from 400 to 1600 in 10-point steps.' : 'IELTS overall bands are available from 0.0 to 9.0 in 0.5-band steps.';
  $('profile-sat-date').innerHTML = `<option value="">Choose an SAT test date</option>${SAT_DATES.map((date) => `<option value="${date}">${dateText(date)}</option>`).join('')}`;
  $('profile-sat-date').value = SAT_DATES.includes(goal.date) ? goal.date : '';
  $('profile-sat-date').hidden = !isSat;
  $('profile-date').hidden = isSat;
  $('profile-date').value = !isSat ? goal.date : '';
  $('date-help').textContent = isSat ? 'Official and anticipated SAT dates through June 2028.' : 'Choose any IELTS date through December 2028.';
}

function syncProfileForm() {
  $('profile-name').value = state.profile.name;
  $('profile-exam').value = state.profile.exam;
  renderProfileControls();
}

function previewGoal() {
  const exam = $('profile-exam').value;
  state.profile.exam = exam;
  setActiveGoal($('profile-score').value, exam === 'sat' ? $('profile-sat-date').value : $('profile-date').value);
  renderHome();
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
    if (page) { currentSkill = page.dataset.skill || ''; openPage(page.dataset.page); renderLearn(); renderVocab(); renderProblems(); renderMocks(); return; }
    const theme = event.target.closest('[data-theme]');
    if (theme) { applyTheme(theme.dataset.theme); persist(); showToast(`${THEMES[theme.dataset.theme].name} palette selected.`); return; }
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
  $('daily-action').addEventListener('click', () => {
    const question = dailyQuestionStore[state.profile.exam].question;
    if (question) startPractice(question.set, 0, [question], 'daily');
  });
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
  $('profile-exam').addEventListener('change', () => {
    setExam($('profile-exam').value, false);
    syncProfileForm();
    renderHome();
  });
  $('profile-score').addEventListener('change', previewGoal);
  $('profile-sat-date').addEventListener('change', previewGoal);
  $('profile-date').addEventListener('change', previewGoal);
  $('profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const exam = $('profile-exam').value;
    const target = $('profile-score').value;
    const date = exam === 'sat' ? $('profile-sat-date').value : $('profile-date').value;
    state.profile.name = $('profile-name').value.trim();
    state.profile.exam = exam;
    setActiveGoal(target, date);
    setExam(exam, false);
    syncProfileForm();
    renderHome();
    await persist();
    showToast('Settings saved.');
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveActivePractice();
  });
}

async function init() {
  try { mergeState(await api('/api/state')); }
  catch { try { mergeState(JSON.parse(localStorage.getItem('luminary-state') || '{}')); } catch { mergeState(DEFAULT_STATE); } }
  applyTheme(state.profile.theme);
  syncProfileForm();
  setExam(state.profile.exam, false);
  renderQuestionBank();
  bindEvents();
  restoreActivePractice();
  applyAuthenticatedUser(window.luminaryAuthUser);
}

init();
