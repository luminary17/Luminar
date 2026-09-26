'use strict';

global.window = global;
require('../sat-question-quality.js');

const url = 'https://luminary-46748-default-rtdb.europe-west1.firebasedatabase.app/question-bank/sat.json';

async function main() {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`SAT Question Bank request failed: ${response.status}`);
  const records = await response.json();
  const summary = { total: 0, available: 0, excluded: 0, matchedSkill: 0, issues: {}, examples: {} };

  for (const [id, item] of Object.entries(records || {})) {
    const question = {
      domain: item.tag || item.domain || item.topic || '',
      prompt: item.q || item.question || item.prompt || '',
      passage: item.passage || item.reference || item.text || item.stimulus || '',
      answers: ['A', 'B', 'C', 'D'].map((letter) => item.options?.[letter] || ''),
      correct: typeof item.correct === 'number' ? item.correct : 'ABCD'.indexOf(String(item.correct || '').toUpperCase()),
      image: item.image || item.imageUrl || item.picture || ''
    };
    const issues = SatQuestionQuality.issues(question);
    summary.total += 1;
    if (issues.length) summary.excluded += 1;
    else {
      summary.available += 1;
      if (SatQuestionQuality.inferSkill(question)) summary.matchedSkill += 1;
    }
    for (const issue of issues) {
      summary.issues[issue] = (summary.issues[issue] || 0) + 1;
      (summary.examples[issue] ||= []).length < 5 && summary.examples[issue].push({ id, domain: question.domain, prompt: question.prompt.slice(0, 130) });
    }
  }

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
