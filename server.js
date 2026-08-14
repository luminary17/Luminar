'use strict';

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs/promises');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8012);
const STORE = path.join(ROOT, 'luminary-data.json');
const DEFAULT_STATE = { profile: { name: '', exam: 'sat', target: '', date: '', theme: 'coffee' }, progress: { sessions: 0, streak: 0, answers: {} } };
const SAT_DATES = new Set(['2026-08-22', '2026-09-12', '2026-10-03', '2026-11-07', '2026-12-05', '2027-03-06', '2027-05-01', '2027-06-05', '2027-08-28', '2027-09-18', '2027-10-02', '2027-11-06', '2027-12-04', '2028-03-04', '2028-05-06', '2028-06-03']);
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };

function cleanState(input) {
  const profile = input?.profile || {};
  const progress = input?.progress || {};
  const exam = profile.exam === 'ielts' ? 'ielts' : 'sat';
  const rawTarget = String(profile.target || '');
  const numericTarget = Number(rawTarget);
  const target = exam === 'sat'
    ? (Number.isInteger(numericTarget) && numericTarget >= 400 && numericTarget <= 1600 && numericTarget % 10 === 0 ? String(numericTarget) : '')
    : (Number.isFinite(numericTarget) && numericTarget >= 0 && numericTarget <= 9 && Number.isInteger(numericTarget * 2) ? numericTarget.toFixed(1) : '');
  const rawDate = /^\d{4}-\d{2}-\d{2}$/.test(profile.date || '') ? profile.date : '';
  const date = exam === 'sat' ? (SAT_DATES.has(rawDate) ? rawDate : '') : (rawDate >= '2026-08-14' && rawDate <= '2028-12-31' ? rawDate : '');
  return {
    profile: {
      name: String(profile.name || '').slice(0, 36),
      exam,
      target,
      date,
      theme: ['coffee', 'dark', 'navy', 'purple', 'forest', 'sunset'].includes(profile.theme) ? profile.theme : 'coffee'
    },
    progress: {
      sessions: Math.max(0, Math.min(100000, Number(progress.sessions) || 0)),
      streak: Math.max(0, Math.min(100000, Number(progress.streak) || 0)),
      answers: typeof progress.answers === 'object' && progress.answers ? progress.answers : {}
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
  if (!file.startsWith(ROOT) || !['.html', '.css', '.js'].includes(path.extname(file))) return send(response, 404, { error: 'Not found' });
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
