'use strict';

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs/promises');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8012);
const STORE = path.join(ROOT, 'luminary-data.json');
const DEFAULT_STATE = { profile: { name: '', exam: 'sat', target: '', date: '', goals: { sat: { target: '', date: '' }, ielts: { target: '', date: '' } }, theme: 'coffee', planPreferences: { currentScore: '', currentRw: '', currentMath: '', minutes: 60, weakTopics: [] } }, progress: { sessions: 0, streak: 0, lastSessionDate: '', answers: {}, marked: {}, eliminated: {}, questionHistory: [], mockResults: [] }, studyPlan: { setup: null, generatedAt: 0, tasks: [] } };
const SAT_DATES = new Set(['2026-08-22', '2026-09-12', '2026-10-03', '2026-11-07', '2026-12-05', '2027-03-06', '2027-05-01', '2027-06-05', '2027-08-28', '2027-09-18', '2027-10-02', '2027-11-06', '2027-12-04', '2028-03-04', '2028-05-06', '2028-06-03']);
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

function cleanGoal(exam, input = {}) {
  const rawTarget = String(input.target || '');
  const numericTarget = Number(rawTarget);
  const target = !rawTarget ? '' : exam === 'sat'
    ? (Number.isInteger(numericTarget) && numericTarget >= 400 && numericTarget <= 1600 && numericTarget % 10 === 0 ? String(numericTarget) : '')
    : (Number.isFinite(numericTarget) && numericTarget >= 0 && numericTarget <= 9 && Number.isInteger(numericTarget * 2) ? numericTarget.toFixed(1) : '');
  const rawDate = /^\d{4}-\d{2}-\d{2}$/.test(input.date || '') ? input.date : '';
  const date = exam === 'sat' ? (SAT_DATES.has(rawDate) ? rawDate : '') : (rawDate >= '2026-08-14' && rawDate <= '2028-12-31' ? rawDate : '');
  return { target, date };
}

function cleanState(input) {
  const profile = input?.profile || {};
  const progress = input?.progress || {};
  const exam = profile.exam === 'ielts' ? 'ielts' : 'sat';
  const savedGoals = profile.goals || {};
  const goals = {
    sat: cleanGoal('sat', savedGoals.sat || (exam === 'sat' ? profile : {})),
    ielts: cleanGoal('ielts', savedGoals.ielts || (exam === 'ielts' ? profile : {}))
  };
  const activeGoal = goals[exam];
  const marked = typeof progress.marked === 'object' && progress.marked ? progress.marked : {};
  const eliminated = typeof progress.eliminated === 'object' && progress.eliminated ? progress.eliminated : {};
  const questionHistory = Array.isArray(progress.questionHistory) ? progress.questionHistory.slice(-600).map((entry) => ({
    id: String(entry?.id || '').slice(0, 180),
    exam: entry?.exam === 'ielts' ? 'ielts' : 'sat',
    set: String(entry?.set || '').slice(0, 32),
    domain: String(entry?.domain || '').slice(0, 120),
    skill: String(entry?.skill || '').slice(0, 120),
    difficulty: String(entry?.difficulty || '').slice(0, 32),
    correct: Boolean(entry?.correct),
    responseSeconds: Math.max(0, Math.min(36000, Number(entry?.responseSeconds) || 0)),
    answeredAt: Math.max(0, Number(entry?.answeredAt) || 0),
    activePlanTaskId: String(entry?.activePlanTaskId || '').slice(0, 180),
    mockResultId: String(entry?.mockResultId || '').slice(0, 180)
  })).filter((entry) => entry.id) : [];
  const preferences = profile.planPreferences || {};
  const mockResults = Array.isArray(progress.mockResults) ? progress.mockResults.slice(-30).map((result) => ({
    id: String(result?.id || '').slice(0, 180),
    sourceId: String(result?.sourceId || '').slice(0, 180),
    title: String(result?.title || 'Practice mock').slice(0, 160),
    skill: String(result?.skill || '').slice(0, 80),
    exam: result?.exam === 'ielts' ? 'ielts' : 'sat',
    correct: Math.max(0, Number(result?.correct) || 0),
    total: Math.max(0, Number(result?.total) || 0),
    accuracy: Math.max(0, Math.min(100, Number(result?.accuracy) || 0)),
    estimatedScore: Math.max(0, Number(result?.estimatedScore) || 0),
    completedAt: Math.max(0, Number(result?.completedAt) || 0),
    analyzedAt: Math.max(0, Number(result?.analyzedAt) || 0),
    analysis: result?.analysis && typeof result.analysis === 'object' ? result.analysis : null,
    answers: Array.isArray(result?.answers) ? result.answers.slice(0, 200) : []
  })).filter((result) => result.id) : [];
  const studyPlan = input?.studyPlan && typeof input.studyPlan === 'object' ? input.studyPlan : {};
  return {
    profile: {
      name: String(profile.name || '').slice(0, 36),
      exam,
      target: activeGoal.target,
      date: activeGoal.date,
      goals,
      theme: ['coffee', 'dark', 'navy', 'navyFull', 'purple', 'forest', 'sunset'].includes(profile.theme) ? profile.theme : 'coffee',
      planPreferences: {
        currentScore: String(preferences.currentScore || '').slice(0, 12),
        currentRw: String(preferences.currentRw || '').slice(0, 12),
        currentMath: String(preferences.currentMath || '').slice(0, 12),
        minutes: [30, 45, 60, 90, 120].includes(Number(preferences.minutes)) ? Number(preferences.minutes) : 60,
        weakTopics: Array.isArray(preferences.weakTopics) ? preferences.weakTopics.slice(0, 80).map((item) => String(item).slice(0, 180)) : []
      }
    },
    progress: {
      sessions: Math.max(0, Math.min(100000, Number(progress.sessions) || 0)),
      streak: Math.max(0, Math.min(100000, Number(progress.streak) || 0)),
      lastSessionDate: /^\d{4}-\d{2}-\d{2}$/.test(progress.lastSessionDate || '') ? progress.lastSessionDate : '',
      answers: typeof progress.answers === 'object' && progress.answers ? progress.answers : {},
      marked,
      eliminated,
      questionHistory,
      mockResults
    },
    studyPlan: {
      setup: studyPlan.setup && typeof studyPlan.setup === 'object' ? studyPlan.setup : null,
      generatedAt: Math.max(0, Number(studyPlan.generatedAt) || 0),
      tasks: Array.isArray(studyPlan.tasks) ? studyPlan.tasks.slice(0, 400) : []
    }
  };
}

async function readState() {
  try { return cleanState(JSON.parse(await fs.readFile(STORE, 'utf8'))); }
  catch { return structuredClone(DEFAULT_STATE); }
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) throw new Error('Payload too large');
  }
  return JSON.parse(body || '{}');
}

function send(response, status, body, type = 'application/json; charset=utf-8') {
  response.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  response.end(typeof body === 'string' ? body : JSON.stringify(body));
}

async function staticFile(url, response) {
  const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const file = path.resolve(ROOT, `.${pathname}`);
  if (!file.startsWith(ROOT) || !['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(path.extname(file))) return send(response, 404, { error: 'Not found' });
  try {
    const body = await fs.readFile(file);
    response.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(body);
  } catch { send(response, 404, { error: 'Not found' }); }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  try {
    if (url.pathname === '/api/state' && request.method === 'GET') return send(response, 200, await readState());
    if (url.pathname === '/api/state' && request.method === 'PUT') {
      const next = cleanState(await readJson(request));
      await fs.writeFile(STORE, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
      return send(response, 200, next);
    }
    if (url.pathname.startsWith('/api/')) return send(response, 404, { error: 'Not found' });
    return staticFile(url, response);
  } catch (error) {
    const status = error instanceof SyntaxError ? 400 : 500;
    return send(response, status, { error: status === 400 ? 'Invalid JSON' : 'Server error' });
  }
});

server.listen(PORT, () => console.log(`Luminary is running at http://127.0.0.1:${PORT}`));
