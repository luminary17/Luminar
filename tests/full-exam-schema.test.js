'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'full-exam-schema.js'), 'utf8'), context);
const schema = context.window.FullExamSchema;

function choice(id) {
  return { id, type: 'single_choice', prompt: 'Question?', options: ['A', 'B', 'C', 'D'], correct: 1 };
}

function satModule(id, stage, count = 1) {
  const rw = id.includes('rw');
  const domains = rw ? ['Information and Ideas', 'Craft and Structure', 'Expression of Ideas', 'Standard English Conventions'] : ['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'];
  return { id, stage, durationMinutes: rw ? 32 : 35, questions: Array.from({ length: count }, (_, index) => ({ ...choice(`${id}-q${index + 1}`), domain: domains[index % domains.length] })) };
}

const sat = {
  schemaVersion: 1,
  id: 'sat-test',
  exam: 'sat',
  title: 'SAT Test',
  sections: [
    { id: 'rw', route: { threshold: 0.6, lowerModuleId: 'rw-low', higherModuleId: 'rw-high' }, modules: [satModule('rw-route', 'routing'), satModule('rw-low', 'lower'), satModule('rw-high', 'higher')] },
    { id: 'math', route: { threshold: 0.6, lowerModuleId: 'math-low', higherModuleId: 'math-high' }, modules: [satModule('math-route', 'routing'), satModule('math-low', 'lower'), satModule('math-high', 'higher')] }
  ]
};

const satResult = schema.validate(sat);
assert.equal(satResult.valid, true, satResult.errors.join('\n'));
assert.equal(satResult.mock.sections[0].modules[0].parts[0].questions[0].correct, 1);
assert.ok(satResult.warnings.some((warning) => warning.includes('official format uses 27')));
assert.equal(schema.validate(sat, { strictCounts: true }).valid, false);

const duplicate = structuredClone(sat);
duplicate.sections[1].modules[0].questions[0].id = 'rw-route-q1';
assert.equal(schema.validate(duplicate).valid, false);

const ielts = {
  schemaVersion: 1,
  id: 'ielts-test',
  exam: 'ielts-academic',
  title: 'IELTS Test',
  sections: [
    { id: 'listening', modules: [{ id: 'l', durationMinutes: 30, parts: [{ id: 'l1', audioUrl: 'https://example.com/a.mp3', questions: [{ id: 'lq1', type: 'text', prompt: 'Name', acceptedAnswers: ['Ada'] }] }] }] },
    { id: 'reading', modules: [{ id: 'r', durationMinutes: 60, parts: [{ id: 'r1', passage: 'Text', questions: [choice('rq1')] }] }] },
    { id: 'writing', modules: [{ id: 'w', durationMinutes: 60, questions: [{ id: 'w1', type: 'writing', prompt: 'Task 1', minWords: 150 }, { id: 'w2', type: 'writing', prompt: 'Task 2', minWords: 250 }] }] }
  ]
};

const ieltsResult = schema.validate(ielts);
assert.equal(ieltsResult.valid, true, ieltsResult.errors.join('\n'));
assert.equal(ieltsResult.mock.exam, 'ielts-academic');
assert.equal(schema.validate({ ...ielts, sections: ielts.sections.slice(0, 2) }).valid, false);

const productionSat = structuredClone(sat);
productionSat.sections[0].modules = [satModule('prw-route', 'routing', 27), satModule('prw-low', 'lower', 27), satModule('prw-high', 'higher', 27)];
productionSat.sections[0].route = { threshold: .6, lowerModuleId: 'prw-low', higherModuleId: 'prw-high' };
productionSat.sections[1].modules = [satModule('pmath-route', 'routing', 22), satModule('pmath-low', 'lower', 22), satModule('pmath-high', 'higher', 22)];
productionSat.sections[1].route = { threshold: .6, lowerModuleId: 'pmath-low', higherModuleId: 'pmath-high' };
assert.equal(schema.validate(productionSat, { strictCounts: true }).valid, true);

const productionIelts = structuredClone(ielts);
productionIelts.sections[0].modules[0].parts = Array.from({ length: 4 }, (_, partIndex) => ({ id: `pl-part-${partIndex + 1}`, audioUrl: `https://example.com/${partIndex + 1}.mp3`, questions: Array.from({ length: 10 }, (_, index) => ({ id: `pl${partIndex * 10 + index + 1}`, type: 'text', prompt: `Listening ${partIndex * 10 + index + 1}`, acceptedAnswers: ['answer'] })) }));
productionIelts.sections[1].modules[0].parts = [14, 13, 13].map((count, partIndex) => {
  const prompts = Array.from({ length: count }, (_, index) => ({ id: `p${partIndex + 1}-${index + 1}`, text: `Paragraph ${index + 1}` }));
  const options = prompts.map((_, index) => `Heading ${index + 1}`);
  return { id: `pr-part-${partIndex + 1}`, passage: `Original academic passage ${partIndex + 1}.`, questions: [{ id: `pr-match-${partIndex + 1}`, type: 'matching', prompt: 'Match headings', prompts, options, matches: Object.fromEntries(prompts.map((prompt, index) => [prompt.id, options[index]])) }] };
});
productionIelts.sections[2].modules[0].questions[0].passage = 'A table showing original data for Task 1.';
assert.equal(schema.validate(productionIelts, { strictCounts: true }).valid, true);
assert.equal(schema.modulePoints(schema.validate(productionIelts).mock.sections[1].modules[0]), 40);

const invalidMultiple = structuredClone(ielts);
invalidMultiple.sections[1].modules[0].parts[0].questions = [{ id: 'bad-multiple', type: 'multiple_choice', prompt: 'Choose two', options: ['A', 'B'], correct: [0, 2] }];
assert.ok(schema.validate(invalidMultiple).errors.some((error) => error.includes('invalid option index')));

const invalidMatching = structuredClone(ielts);
invalidMatching.sections[1].modules[0].parts[0].questions = [{ id: 'bad-matching', type: 'matching', prompt: 'Match', prompts: [{ id: 'a', text: 'A' }], options: ['i'], matches: {} }];
assert.ok(schema.validate(invalidMatching).errors.some((error) => error.includes('matches.a')));

console.log('full-exam-schema tests passed');
