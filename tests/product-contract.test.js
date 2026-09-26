'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
global.window = global;
require(path.join(root, 'full-exam-schema.js'));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const speaking = require(path.join(root, 'ielts-speaking.js'));

test('all bundled IELTS tests remain complete and valid', () => {
  const mocks = JSON.parse(read('data/full-mocks/ielts-academic.json'));
  assert.equal(mocks.length, 10);
  for (const source of mocks) {
    const { valid, errors, mock } = global.FullExamSchema.validate(source, { strictCounts: true });
    assert.ok(valid, `${source.id}: ${errors.join('; ')}`);
    assert.deepEqual(mock.sections.map((section) => section.id), ['listening', 'reading', 'writing']);
  }
});

test('SAT mocks are unavailable while the SAT Question Bank remains', () => {
  assert.equal(fs.existsSync(path.join(root, 'data/full-mocks/sat.json')), false);
  assert.equal(global.FullExamSchema.validate({ exam: 'sat', title: 'Old SAT mock' }).valid, false);
  const app = read('app.js');
  assert.match(app, /`question-bank\/\$\{exam\}/);
  assert.match(app, /result\.exam!==['"]ielts-academic['"]/);
  assert.doesNotMatch(read('index.html'), /SAT Mocks|SAT Practice Tests/);
  for (const adminFile of ['admin/index.html', 'Admin-site/index.html']) {
    const admin = read(adminFile);
    assert.doesNotMatch(admin, /Create SAT Mock|SAT Practice Tests|sat-practice-tests/i);
    assert.match(admin, /question.bank|question bank/i);
  }
});

test('authentication assets and referenced scripts exist', () => {
  for (const file of ['vendor/firebase-app-compat.js', 'vendor/firebase-auth-compat.js', 'firebase-auth.js']) {
    assert.ok(fs.statSync(path.join(root, file)).size > 0, `${file} is missing`);
  }
});

test('Admin inline scripts parse after mock management cleanup', () => {
  for (const file of ['admin/index.html', 'Admin-site/index.html']) {
    const html = read(file);
    const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
    assert.ok(scripts.length > 0, `${file} has no inline scripts`);
    scripts.filter((match) => !/^\s*import\s/m.test(match[1])).forEach((match, index) => {
      assert.doesNotThrow(() => new vm.Script(match[1], { filename: `${file}:${index}` }));
    });
  }
});

test('each IELTS Speaking set has the full three-part interview', () => {
  speaking.TEST_SETS.forEach((set, index) => {
    const interview = speaking.createTest(index);
    assert.equal(interview.id, set.id);
    assert.equal(interview.questions.length, 16);
    assert.deepEqual([...new Set(interview.questions.map((question) => question.part))], [1, 2, 3]);
    const longTurn = interview.questions.find((question) => question.part === 2);
    assert.equal(longTurn.preparationSeconds, 60);
    assert.equal(longTurn.answerLimitSeconds, 120);
    assert.ok(longTurn.followUp);
  });
});

test('every SAT domain has a unique route and every skill has a lesson', () => {
  const context = { window: {} };
  vm.runInNewContext(read('sat-curriculum.js'), context);
  const curriculum = context.window.SatCurriculum;
  const routes = new Set();
  const skills = new Set();
  for (const section of ['math', 'rw']) {
    for (const group of curriculum.groups[section]) {
      const domainSlug = curriculum.slug(group.title);
      const domainRoute = `/sat/${section}/${domainSlug}`;
      assert.ok(!routes.has(domainRoute), `duplicate domain route: ${domainRoute}`);
      assert.equal(curriculum.group(section, domainSlug)?.title, group.title);
      routes.add(domainRoute);
      for (const topic of group.topics) {
        const lessonRoute = `${domainRoute}/${curriculum.slug(topic)}`;
        assert.ok(!routes.has(lessonRoute), `duplicate lesson route: ${lessonRoute}`);
        assert.ok(!skills.has(topic), `duplicate skill: ${topic}`);
        const lesson = curriculum.lesson(section, domainSlug, curriculum.slug(topic));
        assert.equal(lesson?.title, topic);
        assert.equal(lesson.content.length, 5);
        assert.ok(lesson.content.every((part) => typeof part === 'string' && part.length > 8));
        routes.add(lessonRoute);
        skills.add(topic);
      }
    }
  }
  assert.equal(skills.size, 29);
});

test('SAT routes and Question Bank interactions remain connected', () => {
  const app = read('app.js');
  const html = read('index.html');
  assert.match(app, /function applyRoute\(path\)/);
  assert.match(app, /function startSatTopicPractice\(section, domainSlug, skillSlug/);
  assert.match(app, /startPractice\(currentSet, 0, focusedQuestionSet\(questions\)\)/);
  assert.match(app, /event\.target\.closest\('#theme-grid \[data-theme\]'\)/);
  assert.match(html, /sat-question-quality\.js/);
  assert.match(app, /question\.qualityIssues = quality\.issues\(question\)/);
  for (const id of ['sat-overview-page', 'sat-section-page', 'sat-domain-page', 'sat-lesson-page', 'question-library']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});

test('SAT question quality gate excludes unusable items and assigns only supported skills', () => {
  const context = { window: {} };
  vm.runInNewContext(read('sat-question-quality.js'), context);
  const quality = context.window.SatQuestionQuality;
  const base = { domain: 'Algebra', prompt: 'Solve the system of linear equations.', passage: 'x + y = 5 and x - y = 1.', answers: ['(3, 2)', '(2, 3)', '(1, 4)', '(4, 1)'], correct: 0, image: '' };
  assert.equal(quality.inferSkill(base), 'Systems of two linear equations in two variables');
  assert.equal(quality.inferSkill({ ...base, prompt: 'What is the value of x?', passage: '2x = 8' }), '');
  assert.equal(quality.clean('Ginger\u00adbread  is good'), 'Gingerbread is good');
  assert.deepEqual(Array.from(quality.issues(base)), []);
  assert.ok(quality.issues({ ...base, answers: ['1', '2', '2', '4'] }).includes('duplicate-answers'));
  assert.ok(quality.issues({ ...base, prompt: 'What is the value of 7?' }).includes('broken-prompt'));
  assert.ok(quality.issues({ ...base, prompt: 'What is shown in the graph?' }).includes('missing-visual'));
  assert.ok(quality.issues({ ...base, prompt: 'What is shown in the graph?', image: '/graph.png' }).includes('missing-visual'));
  assert.ok(quality.issues({ ...base, prompt: 'What is shown in the graph?', image: 'sat_math_001.png' }).includes('unavailable-image'));
  assert.ok(!quality.issues({ ...base, prompt: 'What is shown in the graph?', image: 'https://example.org/graph.png' }).includes('missing-visual'));
});
