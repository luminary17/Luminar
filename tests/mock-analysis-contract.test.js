'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const worker = fs.readFileSync(path.join(__dirname, '..', 'cloudflare-worker.js'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'main.css'), 'utf8');

assert.match(worker, /function validateMockAnalysisPayload/);
assert.match(worker, /function mockAnalysisPrompt/);
assert.match(worker, /"whatToDo"/);
assert.match(worker, /"howToDo"/);
assert.match(worker, /url\.pathname === '\/mocks\/analyze'/);
assert.match(app, /async function analyzeMockResult/);
assert.match(app, /\$\{LUMINARY_AI_SERVICE_URL\}\/mocks\/analyze/);
assert.match(app, /data-analyze-mock/);
assert.doesNotMatch(app.slice(app.indexOf('function completeMockResult'), app.indexOf('function moveQuestion')), /analyzeMockResult/);
assert.match(app, /function lockVoiceInputForExaminer/);
assert.match(app, /voiceLab\.recognition\?\.abort\(\)/);
assert.match(app, /voiceLab\.examinerTurn/);
assert.match(app, /utterance\.pitch = 0\.78/);
assert.match(worker, /deep, mature, authoritative professor-style voice/);
assert.doesNotMatch(app.slice(app.indexOf('async function speakVoiceReply'), app.indexOf('function clearVoiceAnswerTiming')), /\/speaking\/tts/);
assert.match(css, /\.voice-dome \{ grid-column: 1; grid-row: 1; \}/);
assert.match(css, /\.voice-caption-panel \{ grid-column: 2; grid-row: 1; \}/);

console.log('Mock analysis and voice experience contract tests passed');
