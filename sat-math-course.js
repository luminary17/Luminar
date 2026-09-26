'use strict';

// This catalog follows the Luminary curriculum. It is separate from the
// College Board domain/skill tags used by the existing Question Bank.
const GROUPS = [
  { title: 'Algebra', topics: ['Algebra Formulas', 'Expressions', 'Linear Equations', 'Linear System of Equations', 'Linear Functions', 'Linear Inequalities'] },
  { title: 'Advanced Math', topics: ['Advanced Math Formulas', 'Polynomials', 'Exponents & Radicals', 'Functions & Function Notation', 'Exponential Functions', 'Quadratics'] },
  { title: 'Problem Solving', topics: ['Problem Solving Formulas', 'Percent, Ratio & Proportion', 'Unit Conversion', 'Probability', 'Mean, Median, Mode, Range', 'Scatterplots', 'Research Organizing (Margin of Error, Outliers)'] },
  { title: 'Geometry and Trigonometry', topics: ['Geometry & Trigonometry Formulas', 'Lines & Angles', 'Triangles', 'Trigonometry', 'Circles', 'Areas & Volumes'] }
];

const LESSONS = {
  'Algebra Formulas': {
    description: 'Recall the relationships that turn a verbal SAT Math problem into an equation.',
    slides: [
      { title: 'Start with a relationship', body: 'A formula describes how quantities are connected. Define what each symbol represents before substituting numbers.', formula: 'distance = rate × time', example: 'At 45 miles per hour for 3 hours, distance = 45 × 3 = 135 miles.' },
      { title: 'Slope measures change', body: 'Slope is the change in y divided by the change in x. Subtract coordinates in the same order in the numerator and denominator.', formula: 'm = (y₂ − y₁) / (x₂ − x₁)', example: 'Through (2, 3) and (6, 11): m = (11 − 3) / (6 − 2) = 2.' },
      { title: 'Write a line', body: 'In slope-intercept form, m is slope and b is the y-intercept. Point-slope form is useful when a point and slope are given.', formula: 'y = mx + b    |    y − y₁ = m(x − x₁)', example: 'Slope 2 through (2, 3): y − 3 = 2(x − 2), so y = 2x − 1.' },
      { title: 'Change the subject', body: 'Rearrange a formula by applying the same operation to both sides. Check the result by substituting it back into the original equation.', formula: 'A = lw  →  w = A/l  (l ≠ 0)', example: 'If a rectangle has area 36 and length 9, its width is 36/9 = 4.' },
      { title: 'SAT checkpoint', body: 'The formula is only the start. Watch units, identify which value the question asks for, and check whether the result is sensible.', formula: 'identify → substitute → solve → check', example: 'A speed in miles per hour multiplied by time in hours must produce miles.' }
    ],
    recall: [
      ['What does slope measure?', ['Change in y divided by change in x', 'Change in x divided by change in y', 'The y-intercept', 'The x-intercept'], 0, 'Use vertical change over horizontal change.'],
      ['Which formula is slope-intercept form?', ['y = mx + b', 'A = lw', 'd = rt', 'y − y₁ = m(x − x₁)'], 0, 'The b term gives the y-intercept.'],
      ['In distance = rate × time, what is the unit of distance if rate is km/h and time is hours?', ['km', 'hours', 'km/h', 'h/km'], 0, 'The hours cancel.'],
      ['If A = lw and l is not zero, which formula gives w?', ['w = A/l', 'w = Al', 'w = l/A', 'w = A − l'], 0, 'Divide both sides by l.']
    ],
    check: [
      ['What is the slope through (1, 4) and (5, 12)?', ['2', '4', '8', '1/2'], 0, '(12 − 4)/(5 − 1) = 2.'],
      ['A line has slope 3 and passes through (0, −2). Which equation represents it?', ['y = 3x − 2', 'y = −2x + 3', 'y = 3x + 2', 'y = x − 2'], 0, 'The point (0, −2) is the y-intercept.'],
      ['A car travels 150 miles in 3 hours at a constant rate. What is its rate?', ['50 mph', '450 mph', '153 mph', '147 mph'], 0, 'rate = distance/time = 150/3.'],
      ['A rectangle has area 54 square units and length 9 units. What is its width?', ['6', '9', '45', '486'], 0, 'w = A/l = 54/9.']
    ]
  },
  'Expressions': {
    description: 'Simplify, expand, and factor expressions while preserving their value.',
    slides: [
      { title: 'What is an expression?', body: 'An expression contains numbers, variables, and operations but no equals sign. An equation says two expressions have the same value.', formula: '3x + 5  is an expression;  3x + 5 = 20  is an equation', example: 'For x = 2, the expression 3x + 5 has value 11.' },
      { title: 'Combine like terms', body: 'Terms can be added only when their variable parts match exactly. Constants combine with constants.', formula: '4x + 7 − x + 2 = 3x + 9', example: 'Do not combine x and x²: they represent different powers.' },
      { title: 'Distribute carefully', body: 'Multiply every term inside parentheses, including negative terms.', formula: 'a(b + c) = ab + ac', example: '−2(3x − 5) = −6x + 10.' },
      { title: 'Factor to reveal structure', body: 'Factoring reverses distribution. Check a factorization by multiplying it out.', formula: 'ab + ac = a(b + c)', example: '6x + 9 = 3(2x + 3).' },
      { title: 'Equivalent expressions', body: 'Two expressions are equivalent if they have the same value for every allowed value of the variable. Testing a few values can reject a wrong option; algebra proves equivalence.', formula: '2(x + 3) = 2x + 6', example: '2(x + 3) is not equivalent to 2x + 3 because the 3 must also be doubled.' }
    ],
    recall: [
      ['Which terms are like terms?', ['3x and −5x', '3x and 3x²', '3x and 3y', '3 and 3x'], 0, 'The variable and exponent must match.'],
      ['What does distribution require?', ['Multiply every term inside parentheses', 'Multiply only the first term', 'Add the outside number', 'Remove all negative signs'], 0, 'Apply the factor to every term.'],
      ['What operation reverses expansion?', ['Factoring', 'Substitution', 'Division only', 'Squaring'], 0, 'Factoring rewrites a sum as a product.'],
      ['When are two expressions equivalent?', ['When they match for every allowed input', 'When they match at one input', 'When both include x', 'When they have the same number of terms'], 0, 'One matching input is not enough.']
    ],
    check: [
      ['Simplify 5x + 8 − 2x − 3.', ['3x + 5', '7x + 11', '3x + 11', '7x + 5'], 0, 'Combine x terms and constants separately.'],
      ['Expand −3(2x − 4).', ['−6x + 12', '−6x − 12', '−3x + 12', '6x − 12'], 0, 'Multiply −3 by both 2x and −4.'],
      ['Factor 8x + 12 completely using the greatest common factor.', ['4(2x + 3)', '2(4x + 6)', '8(x + 12)', '4(2x + 12)'], 0, 'The greatest common factor is 4.'],
      ['Which expression equals 3(x + 2) − x?', ['2x + 6', '3x + 6', '2x + 2', '4x + 6'], 0, 'Distribute first, then combine 3x − x.']
    ]
  },
  'Linear Equations': {
    description: 'Solve equations in one or two variables and recognize when there are no or infinitely many solutions.',
    slides: [
      { title: 'Keep both sides balanced', body: 'Adding, subtracting, multiplying, or dividing both sides by the same nonzero number preserves an equation.', formula: 'ax + b = c  →  x = (c − b)/a, a ≠ 0', example: '3x + 5 = 20 gives 3x = 15, so x = 5.' },
      { title: 'Clear parentheses and fractions', body: 'Distribute before combining terms. A common nonzero denominator can clear every fraction in one step.', formula: '2(x − 3) = x + 4  →  2x − 6 = x + 4', example: 'Subtract x and add 6 to get x = 10.' },
      { title: 'Check the final statement', body: 'If variables cancel, a false statement means no solution and a true statement means every allowed value is a solution.', formula: '0 = 5 → no solution;  0 = 0 → infinitely many', example: '2(x + 1) = 2x + 3 becomes 2 = 3, so it has no solution.' },
      { title: 'Two variables describe a line', body: 'An equation in x and y usually has many ordered-pair solutions. Substitute a pair to test it.', formula: 'y = 2x + 1', example: '(3, 7) is a solution because 7 = 2(3) + 1.' }
    ],
    recall: [
      ['What must you do when adding 4 to one side of an equation?', ['Add 4 to the other side', 'Subtract 4 from the other side', 'Multiply the other side by 4', 'Nothing'], 0, 'Equal changes preserve equality.'],
      ['What does a final statement of 0 = 7 mean?', ['No solution', 'Infinitely many solutions', 'x = 7', 'x = 0'], 0, 'The statement is impossible.'],
      ['What does a final statement of 0 = 0 mean after valid simplification?', ['Every allowed value works', 'No value works', 'Only zero works', 'Only one value works'], 0, 'The equation is an identity.']
    ],
    check: [
      ['Solve 4x − 7 = 21.', ['7', '3.5', '14', '28'], 0, 'Add 7, then divide 28 by 4.'],
      ['Solve 3(x + 2) = 2x + 11.', ['5', '11', '17', '−5'], 0, '3x + 6 = 2x + 11, so x = 5.'],
      ['Does (2, 5) satisfy y = 3x − 1?', ['Yes', 'No', 'Only if x = 5', 'Cannot be determined'], 0, '3(2) − 1 = 5.']
    ]
  },
  'Linear System of Equations': {
    description: 'Find the ordered pair that satisfies two equations at once.',
    slides: [
      { title: 'What is a system?', body: 'A solution is an ordered pair that satisfies both equations. On a graph, it is the intersection of their lines.', formula: 'x + y = 7    and    x − y = 1', example: '(4, 3) satisfies both: 4 + 3 = 7 and 4 − 3 = 1.' },
      { title: 'Use substitution', body: 'Isolate one variable in one equation and replace it in the other. Then solve and substitute back.', formula: 'y = 7 − x  →  x − (7 − x) = 1', example: '2x − 7 = 1 gives x = 4, then y = 3.' },
      { title: 'Use elimination', body: 'Add or subtract equations to cancel one variable. Multiply an entire equation first if coefficients do not already match.', formula: '(x + y) + (x − y) = 7 + 1', example: '2x = 8, so x = 4 and y = 3.' },
      { title: 'Recognize special cases', body: 'Parallel distinct lines have no solution. Two equations for the same line have infinitely many solutions.', formula: 'same slope, different intercepts → no solution', example: 'y = 2x + 1 and y = 2x − 3 never intersect.' }
    ],
    recall: [
      ['What represents a solution to a two-variable system?', ['A pair satisfying both equations', 'A pair satisfying just one equation', 'The first x-intercept', 'Any point on either line'], 0, 'Check the pair in both equations.'],
      ['What is the goal of elimination?', ['Cancel one variable', 'Remove both equations', 'Multiply only one term', 'Find the y-intercept'], 0, 'Combining equations leaves one variable.'],
      ['How many solutions do distinct parallel lines have?', ['Zero', 'One', 'Two', 'Infinitely many'], 0, 'Distinct parallel lines do not meet.']
    ],
    check: [
      ['Solve x + y = 9 and x − y = 3.', ['(6, 3)', '(3, 6)', '(9, 3)', '(6, 9)'], 0, 'Add the equations: 2x = 12.'],
      ['Solve y = x + 2 and y = 3x − 4.', ['(3, 5)', '(5, 3)', '(2, 4)', '(−3, −1)'], 0, 'Set x + 2 = 3x − 4, giving x = 3.'],
      ['How many solutions do y = 4x + 1 and 2y = 8x + 2 have?', ['Infinitely many', 'None', 'Exactly one', 'Exactly two'], 0, 'The second equation is twice the first.']
    ]
  },
  'Linear Functions': {
    description: 'Interpret slope, intercepts, tables, and the meaning of a linear model.',
    slides: [
      { title: 'Constant rate of change', body: 'A linear function changes by the same amount in y for each equal change in x.', formula: 'f(x) = mx + b', example: 'If f(x) = 3x + 2, increasing x by 1 increases f(x) by 3.' },
      { title: 'Read slope and intercept', body: 'The slope m is the rate of change. The y-intercept b is the value when x is zero.', formula: 'm = Δy/Δx;  b = f(0)', example: 'A taxi charge of $4 plus $2 per mile is C(m) = 2m + 4.' },
      { title: 'Build a model from points', body: 'Find slope from two points, then substitute one point into y = mx + b to find b.', formula: 'm = (y₂ − y₁)/(x₂ − x₁)', example: 'Through (1, 5) and (3, 9), m = 2 and b = 3, so y = 2x + 3.' },
      { title: 'Domain matters', body: 'A mathematical line extends forever, but a real context may allow only certain inputs.', formula: 'C(m) = 2m + 4,  m ≥ 0', example: 'A negative number of miles is not meaningful in the taxi model.' }
    ],
    recall: [
      ['In f(x) = mx + b, what does m represent?', ['Rate of change', 'Value at x = 0', 'The x-intercept', 'The maximum value'], 0, 'm is the slope.'],
      ['In f(x) = mx + b, what is f(0)?', ['b', 'm', 'm + b', '0'], 0, 'Set x to zero.'],
      ['What characterizes a linear function in a table?', ['Constant change in output for equal input steps', 'Constant output', 'Outputs always positive', 'Inputs always whole numbers'], 0, 'This is a constant rate of change.']
    ],
    check: [
      ['If f(x) = 5x − 2, what is f(3)?', ['13', '15', '17', '3'], 0, '5(3) − 2 = 13.'],
      ['What is the slope through (2, 6) and (6, 14)?', ['2', '4', '8', '1/2'], 0, '(14 − 6)/(6 − 2) = 2.'],
      ['A service costs $10 to start plus $3 per hour. Which model gives total cost C for h hours?', ['C = 3h + 10', 'C = 10h + 3', 'C = 13h', 'C = 3h − 10'], 0, 'The initial fee is the intercept.']
    ]
  },
  'Linear Inequalities': {
    description: 'Solve inequalities and interpret boundaries in one or two variables.',
    slides: [
      { title: 'Solve like an equation', body: 'Use inverse operations to isolate the variable. The answer is usually a range rather than one number.', formula: 'x + 4 > 9  →  x > 5', example: '6 works because 6 + 4 > 9, while 5 does not.' },
      { title: 'Reverse when dividing by a negative', body: 'Multiplying or dividing both sides by a negative number reverses the inequality symbol.', formula: '−2x < 8  →  x > −4', example: 'x = 0 works: 0 < 8.' },
      { title: 'Read boundary symbols', body: 'Strict inequalities exclude the boundary. Inclusive inequalities include it.', formula: 'x > 3 excludes 3;  x ≥ 3 includes 3', example: 'On a number line, use an open circle for > and a filled circle for ≥.' },
      { title: 'Graph two variables', body: 'Replace the symbol with equality to draw the boundary line, then test a point to decide which side to shade.', formula: 'y ≥ 2x + 1', example: '(0, 2) satisfies the inequality because 2 ≥ 1.' }
    ],
    recall: [
      ['When does an inequality symbol reverse?', ['When multiplying or dividing by a negative', 'When adding a positive', 'When subtracting a positive', 'When multiplying by a positive'], 0, 'A negative scaling reverses order.'],
      ['Does x ≥ 4 include x = 4?', ['Yes', 'No', 'Only on a graph', 'Only if x is an integer'], 0, 'The equals bar includes the boundary.'],
      ['What does an open circle mean on a number line?', ['The endpoint is excluded', 'The endpoint is included', 'Only the endpoint works', 'No solution'], 0, 'Strict inequalities exclude the endpoint.']
    ],
    check: [
      ['Solve 2x + 3 ≤ 11.', ['x ≤ 4', 'x ≥ 4', 'x ≤ 7', 'x ≥ 7'], 0, 'Subtract 3 and divide by positive 2.'],
      ['Solve −3x ≥ 12.', ['x ≤ −4', 'x ≥ −4', 'x ≤ 4', 'x ≥ 4'], 0, 'Divide by −3 and reverse the symbol.'],
      ['Does (0, 2) satisfy y < 2x + 3?', ['Yes', 'No', 'Only on the boundary', 'Cannot be determined'], 0, '2 < 3 is true.']
    ]
  }
};

const catalog = document.getElementById('catalog');
const lesson = document.getElementById('lesson');
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let activeTopic = '';
let activeTab = 'slides';
let slideIndex = 0;

catalog.innerHTML = GROUPS.map(group => `<section class="group"><h2>${escapeHtml(group.title)}</h2><div class="cards">${group.topics.map(topic => {
  const ready = Boolean(LESSONS[topic]);
  return `<button class="topic-card ${ready ? 'ready' : ''}" type="button" data-topic="${escapeHtml(topic)}" ${ready ? '' : 'disabled'}><small>${ready ? 'Lesson ready' : 'In development'}</small><strong>${escapeHtml(topic)}</strong><span>${ready ? 'Presentation · recall quiz · presentation check' : 'Lesson and topic practice are being prepared.'}</span></button>`;
}).join('')}</div></section>`).join('');
document.getElementById('ready-count').textContent = String(Object.keys(LESSONS).length);

function renderQuiz(kind) {
  const items = LESSONS[activeTopic][kind];
  const label = kind === 'recall' ? 'Topic recall' : 'Presentation check';
  return `<div class="panel"><h3>${label}</h3><p>${kind === 'recall' ? 'Recall the key terms and formulas.' : 'Apply the methods from the presentation to new values.'}</p>${items.map(([question, options], index) => {
    const offset = (index * 3 + (kind === 'check' ? 2 : 1)) % options.length;
    const choices = options.map((_, choice) => ({ text: options[(choice - offset + options.length) % options.length], originalIndex: (choice - offset + options.length) % options.length }));
    return `<div class="quiz-item"><fieldset><legend>${index + 1}. ${escapeHtml(question)}</legend>${choices.map(choice => `<label><input type="radio" name="${kind}-${index}" value="${choice.originalIndex}">${escapeHtml(choice.text)}</label>`).join('')}</fieldset><div class="quiz-feedback" id="feedback-${index}" aria-live="polite"></div></div>`;
  }).join('')}<button class="primary" type="button" data-grade="${kind}">Check answers</button></div>`;
}

function renderLesson() {
  const data = LESSONS[activeTopic];
  const tabs = [['slides', 'Presentation'], ['recall', 'Topic recall'], ['check', 'Presentation check']];
  let body;
  if (activeTab === 'slides') {
    const slide = data.slides[slideIndex];
    body = `<div class="panel"><span class="slide-count">SLIDE ${slideIndex + 1} OF ${data.slides.length}</span><h3>${escapeHtml(slide.title)}</h3><p>${escapeHtml(slide.body)}</p><span class="formula">${escapeHtml(slide.formula)}</span><p><strong>Example:</strong> ${escapeHtml(slide.example)}</p><div class="slide-actions"><button class="quiet" type="button" data-slide="previous" ${slideIndex === 0 ? 'disabled' : ''}>Previous</button><button class="primary" type="button" data-slide="next">${slideIndex === data.slides.length - 1 ? 'Take topic quiz' : 'Next slide'}</button></div></div>`;
  } else body = renderQuiz(activeTab);
  lesson.innerHTML = `<div class="lesson-head"><div><p class="eyebrow">SAT MATH LESSON</p><h2>${escapeHtml(activeTopic)}</h2><p>${escapeHtml(data.description)}</p></div><button class="quiet" type="button" data-close-lesson>Close</button></div><div class="tabs" role="tablist" aria-label="Lesson sections">${tabs.map(([id, label]) => `<button class="quiet" type="button" role="tab" data-tab="${id}" aria-selected="${id === activeTab}">${label}</button>`).join('')}</div>${body}<a class="practice-link" href="index.html">Return to the workspace to open Question Bank →</a>`;
  lesson.hidden = false;
}

catalog.addEventListener('click', event => {
  const button = event.target.closest('[data-topic]');
  if (!button || !LESSONS[button.dataset.topic]) return;
  activeTopic = button.dataset.topic;
  activeTab = 'slides';
  slideIndex = 0;
  renderLesson();
  lesson.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

lesson.addEventListener('click', event => {
  const tab = event.target.closest('[data-tab]');
  if (tab) { activeTab = tab.dataset.tab; renderLesson(); return; }
  const slide = event.target.closest('[data-slide]');
  if (slide) {
    if (slide.dataset.slide === 'previous') slideIndex = Math.max(0, slideIndex - 1);
    else if (slideIndex < LESSONS[activeTopic].slides.length - 1) slideIndex += 1;
    else activeTab = 'recall';
    renderLesson();
    return;
  }
  if (event.target.closest('[data-close-lesson]')) { lesson.hidden = true; activeTopic = ''; return; }
  const grade = event.target.closest('[data-grade]');
  if (!grade) return;
  let score = 0;
  LESSONS[activeTopic][grade.dataset.grade].forEach(([, , answer, explanation], index) => {
    const choice = lesson.querySelector(`input[name="${grade.dataset.grade}-${index}"]:checked`);
    const feedback = document.getElementById(`feedback-${index}`);
    const correct = choice && Number(choice.value) === answer;
    if (correct) score += 1;
    feedback.className = `quiz-feedback ${correct ? 'correct' : 'incorrect'}`;
    feedback.textContent = `${correct ? 'Correct.' : `Correct answer: ${LESSONS[activeTopic][grade.dataset.grade][index][1][answer]}.`} ${explanation}`;
  });
  grade.textContent = `${score}/${LESSONS[activeTopic][grade.dataset.grade].length} correct · Check again`;
});
