'use strict';

const assert = require('node:assert/strict');
const speaking = require('../ielts-speaking.js');

assert.equal(speaking.TEST_SETS.length, 3);

speaking.TEST_SETS.forEach((set, setIndex) => {
  const test = speaking.createTest(setIndex);
  assert.equal(test.id, set.id);
  assert.equal(test.questions.filter((question) => question.part === 1).length, 10);
  assert.equal(test.questions.filter((question) => question.part === 2).length, 1);
  assert.equal(test.questions.filter((question) => question.part === 3).length, 5);
  assert.equal(test.questions.filter((question) => question.assessed === false).length, 2);
  assert.ok(test.questions.filter((question) => question.part === 1).every((question) => question.answerLimitSeconds === 30));
  assert.ok(test.questions.filter((question) => question.part === 3).every((question) => question.answerLimitSeconds === 60));

  const cueCard = test.questions.find((question) => question.part === 2);
  assert.equal(cueCard.preparationSeconds, 60);
  assert.equal(cueCard.answerLimitSeconds, 120);
  assert.equal(cueCard.followUpAnswerLimitSeconds, 30);
  assert.ok(cueCard.startPrompt);
  assert.ok(cueCard.followUp);

  test.questions.forEach((question) => {
    assert.ok(question.id);
    assert.ok(question.text);
    assert.ok([1, 2, 3].includes(question.part));
    assert.ok(question.answerLimitSeconds > 0);
  });
});

console.log('IELTS Speaking tests passed');
