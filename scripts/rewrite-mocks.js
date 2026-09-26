'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const round = n => Number(n.toFixed(8));
const signed = n => n < 0 ? `− ${-n}` : `+ ${n}`;
function rng(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
function choice(id, prompt, answer, wrong, explanation, domain, skill, difficulty='medium', passage='') {
  const options = [answer, ...wrong].map(String);
  if (options.length !== 4 || new Set(options).size !== 4) throw new Error(`Ambiguous options: ${id}: ${options}`);
  const random = rng([...id].reduce((a,c)=>a*31+c.charCodeAt(0),0));
  for (let i=3;i>0;i--) { const j=Math.floor(random()*(i+1)); [options[i],options[j]]=[options[j],options[i]]; }
  return {id,type:'single_choice',prompt,passage,options,correct:options.indexOf(String(answer)),explanation,domain,skill,difficulty};
}
function numeric(id,prompt,answer,explanation,domain,skill,difficulty='medium') {
  return {id,type:'numeric',prompt,acceptedAnswers:[String(round(answer))],explanation,domain,skill,difficulty};
}
function mathModule(form, module) {
  const n=form+1, a=n+2, b=n+5, x=n+3, list=[];
  const A='Algebra', M='Advanced Math', P='Problem-Solving and Data Analysis', G='Geometry and Trigonometry';
  const id=()=>`v2-sat${String(n).padStart(2,'0')}-math${module+1}-${list.length+1}`;
  const c=(p,v,w,e,d,s,l)=>list.push(choice(id(),p,v,w,e,d,s,l));
  const r=(p,v,e,d,s,l)=>list.push(numeric(id(),p,v,e,d,s,l));
  if(module===0) {
    c(`If ${a}x + ${b} = ${a*x+b}, what is x?`,x,[x-1,x+1,x+a],`Subtract ${b}: ${a}x = ${a*x}. Dividing by ${a} gives x = ${x}.`,A,'Linear equations in one variable','easy');
    c(`The function f is defined by f(t) = ${a}t − ${b}. What is f(4)?`,4*a-b,[4*a+b,a-b,4*a],`Substitute 4 for t: ${a}(4) − ${b} = ${4*a-b}.`,A,'Linear functions','easy');
    r(`A museum charges a fixed booking fee of $${10+n} and $${a} per ticket. A group pays $${10+n+a*(n+6)}. How many tickets did it buy?`,n+6,`The tickets cost ${10+n+a*(n+6)} − ${10+n} = ${a*(n+6)} dollars. Divide by ${a} dollars per ticket: ${n+6}.`,A,'Linear equations in one variable','easy');
    c(`The equation y = −${a}x + ${a*b} represents a line. What is its x-intercept?`,`(${b}, 0)`,[`(0, ${a*b})`,`(−${b}, 0)`,`(${a*b}, 0)`],`At the x-intercept y = 0. Thus ${a}x = ${a*b}, so x = ${b}.`,A,'Linear equations in two variables','easy');
    r(`If x + y = ${2*n+9} and x − y = 5, what is x?`,n+7,`Add the equations: 2x = ${2*n+14}. Therefore x = ${n+7}.`,A,'Systems of two linear equations in two variables','easy');
    c(`What is the greatest integer x satisfying 3x + ${n} < ${3*(n+8)+n}?`,n+7,[n+8,n+9,n+6],`Subtract ${n} and divide by 3 to get x < ${n+8}. The greatest integer below ${n+8} is ${n+7}.`,A,'Linear inequalities in one or two variables','medium');
    c(`A line passes through (1, ${n+4}) and (5, ${n+16}). What is its slope?`,3,[12,4,-3],`Slope is (${n+16} − ${n+4})/(5 − 1) = 12/4 = 3.`,A,'Linear functions','easy');
    c(`A machine fills ${a} bottles each minute. It has already filled ${b} bottles. Which expression gives the total after t more minutes?`,`${a}t + ${b}`,[`${b}t + ${a}`,`${a+b}t`,`${a}t − ${b}`],`The additional number is ${a}t; add the ${b} bottles already filled.`,A,'Linear functions','easy');
    c(`Which expression is equivalent to (x + ${a})(x − ${a})?`,`x² − ${a*a}`,[`x² + ${a*a}`,`x² − ${2*a}x + ${a*a}`,`x² − ${a}`],`The middle terms cancel: x² − ${a}x + ${a}x − ${a*a} = x² − ${a*a}.`,M,'Equivalent expressions','easy');
    r(`The function g(x) = (x − ${b})² + ${n+1} has a minimum. What is the minimum value?`,n+1,`A square is nonnegative and equals zero at x = ${b}. The minimum output is ${n+1}, not the x-coordinate ${b}.`,M,'Nonlinear functions','easy');
    c(`The equation (x − ${a})(x − ${b}) = 0 has two solutions. What is their sum?`,a+b,[a*b,b-a,-a-b],`The solutions are ${a} and ${b}; their sum is ${a+b}.`,M,'Nonlinear equations in one variable and systems of equations in two variables','easy');
    const p=n+2,q=n+5;
    c(`For positive x, which expression is equivalent to x^${p} × x^${q}?`,`x^${p+q}`,[`x^${p*q}`,`${p+q}x`, `x^${q-p}`],`When multiplying powers with the same base, add exponents: ${p} + ${q} = ${p+q}.`,M,'Equivalent expressions','easy');
    r(`If √(x + ${b}) = ${a}, what is x?`,a*a-b,`Squaring gives x + ${b} = ${a*a}, so x = ${a*a-b}. Substitution gives √${a*a} = ${a}.`,M,'Nonlinear equations in one variable and systems of equations in two variables','medium');
    c(`A culture initially has ${50*n} cells. Its population doubles every hour. How many cells does the model predict after 3 hours?`,400*n,[150*n,200*n,100*n],`Three doublings multiply the initial population by 2³ = 8: ${50*n} × 8 = ${400*n}.`,M,'Nonlinear functions','medium');
    c(`For x ≠ ${a}, which expression equals (x² − ${a*a})/(x − ${a})?`,`x + ${a}`,[`x − ${a}`,`x² + ${a}`,`${2*a}`],`Factor the numerator as (x − ${a})(x + ${a}) and cancel x − ${a}. The restriction makes cancellation valid.`,M,'Equivalent expressions','medium');
    r(`A jacket costs $${80+10*n} before a 20% discount. What is the sale price, in dollars?`,(80+10*n)*.8,`The customer pays 80% of the original price: 0.8 × ${80+10*n} = ${(80+10*n)*.8}.`,P,'Percentages','easy');
    c(`A mixture contains ${2*a} liters of water and ${a} liters of concentrate. What fraction of the mixture is concentrate?`,'1/3',['1/2','2/3','2'],`There are ${3*a} liters in total, so the concentrate fraction is ${a}/${3*a} = 1/3.`,P,'Ratios, rates, proportional relationships, and units','medium');
    r(`The mean of five numbers is ${n+12}. Four numbers are ${n+8}, ${n+10}, ${n+11}, and ${n+14}. What is the fifth number?`,n+17,`The required total is ${5*(n+12)}. The four known numbers sum to ${4*n+43}, leaving ${n+17}.`,P,'One-variable data: Distributions and measures of center and spread','medium');
    c(`A bag contains ${a} red tokens and ${2*a} blue tokens. One token is selected at random. What is the probability that it is red?`,'1/3',['2/3','1/2','3/2'],`There are ${3*a} equally likely tokens, of which ${a} are red. The probability is 1/3.`,P,'Probability and conditional probability','easy');
    c(`A circle has radius ${a} centimeters. What is its area, in square centimeters?`,`${a*a}π`,[`${2*a}π`,`${a}π`,`${4*a*a}π`],`Area is πr² = π(${a})² = ${a*a}π. Circumference would use 2πr.`,G,'Area and volume','easy');
    c(`A right triangle has sides ${3*a}, ${4*a}, and ${5*a}. For the acute angle opposite the side of length ${3*a}, what is its sine?`,'3/5',['4/5','3/4','5/3'],`Sine is opposite/hypotenuse = ${3*a}/${5*a} = 3/5. The longest side is the hypotenuse.`,G,'Right triangles and trigonometry','medium');
    r(`Two similar triangles have corresponding side lengths in a ratio of 2:5. A side of the smaller triangle is ${2*a} centimeters. How long is the corresponding side of the larger triangle?`,5*a,`Multiply the smaller length by 5/2: ${2*a} × 5/2 = ${5*a} centimeters.`,G,'Lines, angles, and triangles','medium');
  } else {
    r(`For what value of k does ${a}(x − 2) = ${a}x + k have infinitely many solutions?`,-2*a,`Expanding gives ${a}x − ${2*a} = ${a}x + k. The constants must agree, so k = −${2*a}.`,A,'Linear equations in one variable','medium');
    c(`The line ${a}x + 2y = ${2*b} is perpendicular to a second line. What is the slope of the second line?`,`2/${a}`,[`−${a}/2`,`${a}/2`,`−2/${a}`],`The first slope is −${a}/2. Perpendicular slopes have product −1, so the other slope is 2/${a}.`,A,'Linear functions','medium');
    r(`A shop sold ${n+20} tickets. Adult tickets cost $12 and child tickets cost $7. Revenue was $${12*(n+8)+7*12}. How many adult tickets were sold?`,n+8,`Let a be the number of adults. Then 12a + 7(${n+20} − a) = ${12*(n+8)+84}. Thus 5a = ${5*(n+8)} and a = ${n+8}.`,A,'Systems of two linear equations in two variables','medium');
    c(`A rental costs $${15+n} plus $${a} per hour. A customer can spend at most $${15+n+6*a}. What is the maximum whole number of hours available?`,6,[5,7,6*a],`The hourly budget is ${6*a}; dividing by ${a} gives 6 hours. The phrase at most includes equality.`,A,'Linear inequalities in one or two variables','medium');
    c(`The function f is linear, with f(2) = ${2*a+b} and f(6) = ${6*a+b}. What is f(0)?`,b,[a,2*a+b,-b],`The slope is (${6*a+b} − ${2*a+b})/4 = ${a}. Therefore f(0) = f(2) − 2(${a}) = ${b}.`,A,'Linear functions','medium');
    r(`The system ${a}x + y = 9 and ${2*a}x + 2y = k has no solution when k = ${18+n}. What is the difference between k and the value that would produce infinitely many solutions?`,n,`Twice the first equation has right side 18. The difference is (${18+n}) − 18 = ${n}.`,A,'Systems of two linear equations in two variables','medium');
    c(`A tank contains ${100+10*n} liters. Water drains at 4 liters per minute. Which inequality describes times t when at least 40 liters remain?`,`0 ≤ t ≤ ${15+2.5*n}`,[`t ≥ ${15+2.5*n}`,`0 ≤ t ≤ ${35+2.5*n}`,`t ≤ −${15+2.5*n}`],`Solve ${100+10*n} − 4t ≥ 40: t ≤ ${15+2.5*n}. Time cannot be negative.`,A,'Linear inequalities in one or two variables','medium');
    r(`The quadratic x² − ${2*a}x + k = 0 has exactly one real solution. What is k?`,a*a,`The discriminant must be zero: (${2*a})² − 4k = 0. Thus k = ${a*a}.`,M,'Nonlinear equations in one variable and systems of equations in two variables','hard');
    c(`For f(x) = x² − ${2*b}x + ${b*b+a}, what is the minimum value of f?`,a,[b,b*b+a,-a],`Complete the square: f(x) = (x − ${b})² + ${a}. Its minimum is ${a}.`,M,'Nonlinear functions','medium');
    r(`If x² + bx + ${a*(a+3)} = (x + ${a})(x + ${a+3}) for every x, what is b?`,2*a+3,`Expanding the product gives x² + ${2*a+3}x + ${a*(a+3)}. Match the coefficient of x.`,M,'Equivalent expressions','medium');
    const outer=n+5;
    c(`For positive a, which expression is equivalent to (a^(1/2))^${outer}?`,`a^${outer/2}`,[`a^${outer}`,`a^${outer+1}`,`a^${1/outer}`],`A power raised to a power multiplies exponents: (1/2) × ${outer} = ${outer/2}.`,M,'Equivalent expressions','medium');
    r(`The graphs y = x² and y = ${n}x + ${a*(a+n)} intersect at two points. What is the sum of their x-coordinates?`,n,`Equate outputs: x² − ${n}x − ${a*(a+n)} = 0. For x² + bx + c, the sum of roots is −b, here ${n}.`,M,'Nonlinear equations in one variable and systems of equations in two variables','hard');
    c(`A value grows by 8% each year. Its initial value is ${100*n}. Which expression models its value after t years?`,`${100*n}(1.08)^t`,[`${100*n}(0.08)^t`,`${100*n} + 8t`,`${100*n}(0.92)^t`],`Each year multiplies the current value by 1 + 0.08 = 1.08. Repeated multiplication gives the exponent t.`,M,'Nonlinear functions','medium');
    c(`For x ≠ 0, (x² + ${a}x)/x = ${b}. What is x?`,b-a,[b+a,a*b,b],`Divide each term by x: x + ${a} = ${b}. Hence x = ${b-a}, which meets x ≠ 0.`,M,'Equivalent expressions','medium');
    r(`A rectangle has length x + ${n} and width x. Its area is ${a*(a+n)}. What is the positive value of x?`,a,`Solve x(x + ${n}) = ${a*(a+n)}. The positive solution is ${a}; substitution gives ${a} × ${a+n}. The other root is negative and cannot be a width.`,M,'Nonlinear equations in one variable and systems of equations in two variables','hard');
    const rise=20+n*5, fall=100-(10000/(100+rise));
    c(`A price increases by ${rise}% and then decreases by ${fall.toFixed(2)}%. Compared with the original price, the final price is`,'unchanged',['higher by 5%','lower by 5%','lower by 10%'],`The second multiplier is 100/(100 + ${rise}), so the two multipliers multiply to 1.`,P,'Percentages','medium');
    c(`A random sample of ${100*n} city residents is used to estimate support for a policy. Which change would generally reduce the margin of error, using the same sampling method and confidence level?`,'Increase the random sample size',['Survey only supporters','Lower the response rate','Use only one neighborhood'],`A larger representative random sample generally reduces sampling variability. Restricting the sample introduces selection bias.`,P,'Inference from sample statistics and margin of error','medium');
    const group=['students','apprentices','athletes','trainees','readers','designers','musicians','volunteers','researchers','players'][n-1];
    c(`A study finds that ${group} who choose to attend tutoring have higher scores. Why does this alone not establish that tutoring caused the difference?`,'The groups were not randomly assigned',['There were two groups','Scores were numerical','Tutoring occurred before the test'],`The ${group} selected tutoring themselves. Motivation or prior attainment could differ between groups and explain some of the association.`,P,'Evaluating statistical claims: Observational studies and experiments','medium');
    r(`A machine travels ${3*n} kilometers in 15 minutes. At this constant speed, how many kilometers will it travel in one hour?`,12*n,`One hour contains four 15-minute intervals, so distance is 4 × ${3*n} = ${12*n} kilometers.`,P,'Ratios, rates, proportional relationships, and units','medium');
    c(`Two similar solids have corresponding lengths in the ratio 1:${a}. What is the ratio of the smaller volume to the larger volume?`,`1:${a**3}`,[`1:${a}`,`1:${a*a}`,`${a}:1`],`Volumes scale by the cube of the length factor. The volume ratio is 1:${a**3}.`,G,'Area and volume','hard');
    r(`The circle (x − ${a})² + (y + ${b})² = ${n*n+8*n+16} has radius r. What is r?`,n+4,`The radius squared is ${n*n+8*n+16} = (${n+4})², so the positive radius is ${n+4}.`,G,'Circles','medium');
    const opp=3+n, hyp=5+n, trig=`${opp}/${hyp}`;
    c(`Angles A and B in a right triangle are complementary. If sin A = ${trig}, what is cos B?`,trig,[`${hyp-1}/${hyp}`,`${opp}/${hyp-1}`,`${hyp}/${opp}`],`Since B = 90° − A, cos B = sin A = ${trig}.`,G,'Right triangles and trigonometry','medium');
  }
  if(list.length!==22)throw Error('Math module count');
  return list;
}

module.exports={root,choice,numeric,mathModule,rng,signed};
