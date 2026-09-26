const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'full-mocks', 'sat.json');
const mocks = JSON.parse(fs.readFileSync(file, 'utf8'));
const choice = (skill, prompt, options, correct, explanation, passage = '') => ({ type: 'single_choice', skill, prompt, options, correct, explanation, passage, difficulty: 'medium' });
const number = (skill, prompt, answer, explanation, passage = '') => ({ type: 'numeric', skill, prompt, acceptedAnswers: [String(answer)], explanation, passage, difficulty: 'medium' });

const replacements = {
  Algebra: [
    number('Linear functions', 'The table shows the total fare for a taxi ride. What is the fare, in dollars, for 9 miles?', 32, 'The fare increases by $3 per mile. Since 2 miles cost $11, the starting fee is $5; 5 + 3(9) = 32.', 'Miles: 2 | 4 | 6\nFare ($): 11 | 17 | 23'),
    choice('Systems of two linear equations in two variables', 'A gym offers Plan A for $18 plus $4 per week and Plan B for $10 plus $6 per week. After how many weeks do the plans cost the same?', ['2', '4', '6', '8'], 1, 'Set 18 + 4w = 10 + 6w. Then 8 = 2w, so w = 4.'),
    number('Linear equations in one variable', 'The formula C = (F − 32) × 5/9 converts degrees Fahrenheit to Celsius. What is C when F = 68?', 20, 'Substitute 68: (68 − 32) × 5/9 = 36 × 5/9 = 20.'),
    number('Systems of two linear equations in two variables', 'Ten people buy tickets. Adult tickets cost $12, child tickets cost $8, and the total is $96. How many adult tickets were bought?', 4, 'If a is the number of adult tickets, 12a + 8(10 − a) = 96. Thus 4a = 16 and a = 4.'),
    choice('Linear functions', 'A line has slope −2 and passes through (3, 5). What is its y-intercept?', ['−1', '5', '11', '13'], 2, 'Use y = −2x + b. Substituting (3, 5) gives 5 = −6 + b, so b = 11.'),
    number('Linear functions', 'Two cyclists start together. One travels at 45 miles per hour and the other at 60 miles per hour. How many miles apart are they after 2 hours if they travel in the same direction?', 30, 'Their relative speed is 60 − 45 = 15 miles per hour. In 2 hours the gap is 30 miles.'),
    choice('Linear functions', 'The table gives points on a line. What is the slope?', ['−3', '1/3', '3', '12'], 2, 'The change in y is 5 − (−7) = 12 while the change in x is 4, so slope = 12/4 = 3.', 'x: 0 | 2 | 4\ny: −7 | −1 | 5'),
    number('Systems of two linear equations in two variables', 'Three notebooks and two pens cost $17. Each notebook costs $3. What is the cost, in dollars, of one pen?', 4, 'The notebooks cost $9, leaving $8 for two pens. Each pen costs $4.'),
    choice('Linear inequalities in one or two variables', 'A park charges $7 for entry and $5 per ride. With $40, what is the greatest number of rides a visitor can buy?', ['5', '6', '7', '8'], 1, '7 + 5r ≤ 40, so r ≤ 6.6. The greatest whole number is 6.'),
    number('Linear functions', 'A sequence begins 4, 9, 14, 19, ... What is its 12th term?', 59, 'The sequence increases by 5. Its 12th term is 4 + 11(5) = 59.')
  ],
  'Advanced Math': [
    choice('Nonlinear functions', 'The graph of y = (x + 2)² − 9 crosses the x-axis at which two x-values?', ['−5 and 1', '−3 and 3', '−2 and 9', '1 and 5'], 0, 'Set (x + 2)² = 9, so x + 2 = ±3 and x = −5 or 1.'),
    number('Nonlinear functions', 'A population of 200 grows by 50% each year. What is the population after 2 years?', 450, 'Multiply by 1.5 twice: 200(1.5)² = 450.'),
    choice('Nonlinear equations in one variable and systems of equations in two variables', 'If √(3x + 1) = 7, what is x?', ['8', '12', '16', '24'], 2, 'Square both sides: 3x + 1 = 49, so 3x = 48 and x = 16.'),
    number('Equivalent expressions', 'How many distinct real zeros does the function f(x) = x³ − 4x have?', 3, 'Factor x³ − 4x as x(x − 2)(x + 2). The distinct zeros are −2, 0, and 2.'),
    choice('Equivalent expressions', 'For x ≠ 5, the expression (x² − 25)/(x − 5) is equivalent to which expression?', ['x − 5', 'x + 5', 'x² + 5', '5x'], 1, 'Factor the numerator as (x − 5)(x + 5), then cancel x − 5.'),
    number('Nonlinear functions', 'Let g(x) = x² + 1 and f(x) = 3x − 4. What is f(g(2))?', 11, 'g(2) = 5, then f(5) = 15 − 4 = 11.'),
    choice('Nonlinear equations in one variable and systems of equations in two variables', 'How many distinct real solutions does x² − 6x + 9 = 0 have?', ['0', '1', '2', '3'], 1, 'The equation factors as (x − 3)² = 0, giving one distinct solution.'),
    number('Nonlinear functions', 'A quantity of 80 decreases by 25% and then by another 25%. What is its final value?', 45, 'Each decrease multiplies by 0.75. Thus 80(0.75)² = 45.'),
    choice('Nonlinear functions', 'A projectile’s height is h(t) = −2(t − 3)² + 18. What is its greatest height?', ['3', '12', '18', '20'], 2, 'The squared term is never positive after multiplying by −2, so the maximum is 18.'),
    number('Equivalent expressions', 'If 4^x = 2^6, what is x?', 3, 'Since 4 = 2², the equation becomes 2^(2x) = 2^6. Therefore x = 3.')
  ],
  'Problem-Solving and Data Analysis': [
    choice('One-variable data: Distributions and measures of center and spread', 'What is the median of the five values shown?', ['2', '3', '5', '8'], 1, 'The ordered list is 2, 3, 3, 8, 12. The middle value is 3.', 'Values: 2 | 3 | 3 | 8 | 12'),
    number('One-variable data: Distributions and measures of center and spread', 'A student scores 80, 90, and 100 on three equally weighted tests. What is the mean score?', 90, '(80 + 90 + 100)/3 = 90.'),
    choice('Ratios, rates, proportional relationships, and units', 'Red and blue beads are in the ratio 2:5. There are 84 beads in all. How many are red?', ['12', '24', '30', '60'], 1, 'There are 7 equal parts. Red beads account for 2/7 of 84, or 24.'),
    number('Percentages', 'A restaurant bill is $48 before a 15% tip. How much is the tip, in dollars?', '7.2', '0.15 × 48 = 7.2 dollars.'),
    choice('Ratios, rates, proportional relationships, and units', 'A board is 12 feet long. How many inches long is it?', ['120', '132', '144', '156'], 2, 'Each foot is 12 inches, so 12 feet is 12 × 12 = 144 inches.'),
    number('Probability and conditional probability', 'A bag contains 3 red, 5 blue, and 2 green marbles. What is the probability of drawing a blue marble? Enter a decimal.', '0.5', 'There are 10 marbles and 5 are blue. The probability is 5/10 = 0.5.'),
    choice('Inference from sample statistics and margin of error', 'A survey estimates support at 60% with a margin of error of 4 percentage points. Which interval reflects that margin?', ['52%–68%', '56%–64%', '58%–62%', '60%–64%'], 1, 'Subtract and add 4 percentage points to 60%: 56% to 64%.'),
    choice('Two-variable data: Models and scatterplots', 'The points in the table show a positive association. Which statement best describes the pattern?', ['y tends to rise as x rises', 'y tends to fall as x rises', 'y stays constant', 'x and y must be equal'], 0, 'As x increases from 1 to 4, y increases from 3 to 9.', 'x: 1 | 2 | 3 | 4\ny: 3 | 5 | 7 | 9'),
    number('Probability and conditional probability', 'Of 40 students, 18 play soccer and 10 of those 18 also play chess. If a soccer player is chosen at random, what is the probability that the student plays chess? Enter a fraction.', '5/9', 'The conditional probability is 10/18, which simplifies to 5/9.'),
    choice('Percentages', 'A price rises from $80 to $100. What is the percent increase?', ['20%', '25%', '40%', '80%'], 1, 'The increase is $20. Relative to the original $80, 20/80 = 25%.')
  ],
  'Geometry and Trigonometry': [
    number('Circles', 'A circle has radius 5. What is its area in terms of π? Enter the coefficient of π.', 25, 'Area = πr² = 25π.'),
    choice('Area and volume', 'A rectangular prism measures 3 by 4 by 10 units. What is its volume?', ['17', '40', '120', '240'], 2, 'Volume is length × width × height = 3 × 4 × 10 = 120.'),
    number('Right triangles and trigonometry', 'A right triangle has legs of length 9 and 12. What is the hypotenuse?', 15, 'By the Pythagorean theorem, the hypotenuse is √(9² + 12²) = 15.'),
    choice('Lines, angles, and triangles', 'Two angles of a triangle measure 45° and 55°. What is the third angle?', ['70°', '80°', '90°', '100°'], 1, 'Triangle angles sum to 180°, so the third is 180 − 45 − 55 = 80°.'),
    number('Lines, angles, and triangles', 'A triangle with sides 3, 4, and 5 is enlarged by a scale factor of 4. What is the perimeter of the enlarged triangle?', 48, 'The original perimeter is 12. Scaling all sides by 4 gives perimeter 48.'),
    choice('Area and volume', 'A cylinder has radius 2 and height 7. What is its volume?', ['14π', '28π', '49π', '56π'], 1, 'Volume = πr²h = π(2²)(7) = 28π.'),
    number('Lines, angles, and triangles', 'What is the distance between (0, 0) and (6, 8) in the coordinate plane?', 10, 'Distance = √(6² + 8²) = √100 = 10.'),
    choice('Lines, angles, and triangles', 'A line has slope 2. What is the slope of a perpendicular line?', ['−2', '−1/2', '1/2', '2'], 1, 'Perpendicular slopes are negative reciprocals, so the slope is −1/2.'),
    number('Circles', 'A 90° sector of a circle has radius 8. What is its area in terms of π? Enter the coefficient of π.', 16, 'The sector is one-fourth of the circle. (1/4)π(8²) = 16π.'),
    choice('Right triangles and trigonometry', 'In a right triangle, the side opposite angle θ is 5 and the hypotenuse is 13. What is sin θ?', ['5/13', '12/13', '5/12', '13/5'], 0, 'Sine is opposite over hypotenuse, so sin θ = 5/13.')
  ]
};

if (mocks.length !== 10) throw new Error(`Expected 10 SAT mocks, found ${mocks.length}`);
for (let mockIndex = 0; mockIndex < mocks.length; mockIndex += 1) {
  const mock = mocks[mockIndex];
  const math = mock.sections.find((section) => section.id === 'math');
  if (!math || math.modules.length !== 2) throw new Error(`Unexpected Math structure in ${mock.id}`);
  Object.entries(replacements).forEach(([domain, questions], domainIndex) => {
    const module = math.modules[(domainIndex + mockIndex) % 2];
    const position = module.questions.findIndex((question) => question.domain === domain);
    if (position < 0) throw new Error(`No ${domain} question in ${module.id}`);
    module.questions[position] = { id: `varied-${mock.id}-${domainIndex + 1}`, domain, ...questions[mockIndex] };
  });
}
fs.writeFileSync(file, `${JSON.stringify(mocks, null, 2)}\n`);
