'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const worker = fs.readFileSync(path.join(__dirname, '..', 'cloudflare-worker.js'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

assert.match(worker, /four public IELTS Speaking criteria with equal weight/);
assert.match(worker, /Response length is evidence, not a separate fifth criterion/);
assert.match(worker, /Never deduct merely because the candidate used the full allowed time/);
assert.match(worker, /formal, serious, neutral and respectful/);
assert.match(worker, /function assessmentText/);
assert.match(worker, /new Set\(answers\.map\(\(answer\) => answer\.part\)\)\.size < 3/);
assert.match(worker, /MAX_ASSESSMENT_BODY_BYTES/);
assert.match(worker, /controller\.abort\(\), 55_000/);
assert.match(app, /requestSpeakingAssessment/);
assert.match(app, /startAnswerRecording/);
assert.match(app, /answer\.interrupted/);

console.log('Speaking assessment contract tests passed');
