(function (global) {
  'use strict';

  const rules = {
    'Information and Ideas': [
      ['Command of Evidence', /\b(?:which (?:choice|finding|quotation|data point).{0,75}(?:support|evidence)|best supports?|most strongly supports?|weaken(?:s|ing)? the (?:claim|argument))\b/i],
      ['Central Ideas and Details', /\b(?:main idea|central idea|primary focus|best summarizes?|most accurately summarizes?|main point)\b/i],
      ['Inferences', /\b(?:most logically completes?|can (?:reasonably )?be inferred|most strongly suggests?|most likely infer)\b/i]
    ],
    'Craft and Structure': [
      ['Cross-Text Connections', /\b(?:text 1|text 2|both texts|the two texts|which response would the author of)\b/i],
      ['Words in Context', /\b(?:as used in the text|most nearly means|most logical and precise word|most precise word or phrase|meaning of the word)\b/i],
      ['Text Structure and Purpose', /\b(?:main purpose|primary purpose|function of the|structure of the text|author's purpose|author’s purpose)\b/i]
    ],
    'Expression of Ideas': [
      ['Transitions', /\b(?:most logical transition|best transition|transition word|transitional phrase)\b/i],
      ['Rhetorical Synthesis', /\b(?:student (?:has )?(?:taken|made) the following notes|most effectively uses relevant information|student's goal|student’s goal)\b/i]
    ],
    'Advanced Math': [
      ['Equivalent expressions', /\b(?:equivalent expression|equivalent form|rewrite (?:the )?expression|factored form|expand (?:the )?expression)\b/i],
      ['Nonlinear equations in one variable and systems of equations in two variables', /\b(?:quadratic equation|solutions? to the nonlinear equation|roots? of (?:the )?(?:equation|function)|zeros? of (?:the )?function)\b/i],
      ['Nonlinear functions', /\b(?:quadratic function|exponential function|nonlinear function|parabola)\b/i]
    ],
    'Algebra': [
      ['Systems of two linear equations in two variables', /\b(?:system of (?:two )?linear equations|system of equations|two lines intersect|lines intersect)\b/i],
      ['Linear inequalities in one or two variables', /\b(?:linear inequalit|inequalit(?:y|ies)|shaded region)\b/i],
      ['Linear functions', /\b(?:linear function|slope|rate of change|y-intercept|x-intercept)\b/i],
      ['Linear equations in two variables', /\b(?:equation of (?:the|a) line|linear equation in two variables)\b/i],
      ['Linear equations in one variable', /\blinear equation in one variable\b/i]
    ],
    'Problem-Solving and Data Analysis': [
      ['Evaluating statistical claims: Observational studies and experiments', /\b(?:observational stud|randomized experiment|random assignment|statistical claim)\b/i],
      ['Inference from sample statistics and margin of error', /\b(?:margin of error|sample statistic|confidence interval)\b/i],
      ['Probability and conditional probability', /\b(?:probability|probable|likelihood)\b/i],
      ['Two-variable data: Models and scatterplots', /\b(?:scatterplot|line of best fit|two-variable data|regression line)\b/i],
      ['One-variable data: Distributions and measures of center and spread', /\b(?:median|mean|standard deviation|interquartile range|histogram|distribution of)\b/i],
      ['Percentages', /\b(?:percent|percentage|% of|% increase|% decrease)\b/i],
      ['Ratios, rates, proportional relationships, and units', /\b(?:ratio|unit rate|proportional relationship|per hour|per minute|per gallon|conversion factor)\b/i]
    ],
    'Geometry and Trigonometry': [
      ['Circles', /\b(?:circle|circumference|radius|diameter|arc length)\b/i],
      ['Right triangles and trigonometry', /\b(?:right triangle|hypotenuse|sine|cosine|tangent|trigonomet)\b/i],
      ['Area and volume', /\b(?:area of|volume of|surface area|cubic units|square units)\b/i],
      ['Lines, angles, and triangles', /\b(?:triangle|angle|parallel lines|similar figures)\b/i]
    ]
  };

  function clean(value) {
    return String(value ?? '').replace(/[\u00ad\u200b\ufeff]/g, '').replace(/\s+/g, ' ').trim();
  }

  function inferSkill(question) {
    const domain = clean(question.domain);
    const prompt = clean(question.prompt);
    const passage = clean(question.passage);
    const wording = `${prompt} ${passage}`;
    if (domain === 'Standard English Conventions') {
      if (!/conventions of standard english/i.test(prompt)) return '';
      const answers = (question.answers || []).map(clean);
      const punctuationOnly = answers.length === 4 && new Set(answers.map((answer) => answer.replace(/[.,;:!?—–\-()"“”'‘’\s]/g, '').toLowerCase())).size === 1;
      return punctuationOnly ? 'Boundaries' : 'Form, Structure, and Sense';
    }
    for (const [skill, pattern] of rules[domain] || []) {
      if (pattern.test(wording)) return skill;
    }
    return '';
  }

  function issues(question) {
    const result = [];
    const prompt = clean(question.prompt);
    const passage = clean(question.passage);
    const answers = (question.answers || []).map(clean);
    if (!prompt || answers.length !== 4 || answers.some((answer) => !answer)) result.push('incomplete');
    if (answers.length === 4 && new Set(answers.map((answer) => answer.toLowerCase())).size !== 4) result.push('duplicate-answers');
    if (!Number.isInteger(question.correct) || question.correct < 0 || question.correct > 3) result.push('invalid-key');
    if (/^what is the value of \d+\?$/i.test(prompt) || /^what is the slope of line \d+\?$/i.test(prompt) || /\bf\(([a-wyz])\).*\bwhen x\s*=/i.test(prompt)) result.push('broken-prompt');
    const image = String(question.image || '');
    const usableImage = /^(data:image\/(?:png|jpe?g|webp|gif);base64,|https?:\/\/)/i.test(image);
    if (image && !usableImage) result.push('unavailable-image');
    if (!usableImage && /\b(?:shown in (?:the|a) (?:graph|table|figure|diagram)|(?:data|values|information) (?:in|from) (?:the|a) (?:graph|table)|based on (?:the|a) (?:graph|table)|(?:graph|table|figure|diagram) (?:shown|below|above))\b/i.test(`${prompt} ${passage}`)) result.push('missing-visual');
    if (/[\ufffd\u25a1]/.test(`${prompt} ${passage} ${answers.join(' ')}`)) result.push('broken-symbol');
    if (/(?:\b(?:tt|ee|nn|ll|le)\b[\s|]*){6,}/i.test(passage) || /(?:[a-z]{2,5})\1{3,}/i.test(passage)) result.push('ocr-noise');
    return result;
  }

  global.SatQuestionQuality = { clean, inferSkill, issues };
})(window);
