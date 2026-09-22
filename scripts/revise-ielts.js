'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {root}=require('./rewrite-mocks');
const clean=s=>s.replace(/\*\*|`/g,'').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/\r/g,'');
const rx=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const sentences=s=>s.replace(/\n(?!\n|[A-Z][A-Za-z ]{0,20}:)/g,' ').split(/(?<=[.!?])\s+|\n+/).map(x=>x.trim()).filter(Boolean);
const markers=['TRUE','FALSE','NOT GIVEN','YES','NO'];
const headingsLater=[
 ['A changing understanding of delay','The limits of time management','The role of unpleasant emotions','Why self-criticism can backfire','Delaying to protect self-esteem','A task becomes easier through action','The effects of deadlines','Individual differences'],
 ['Sleep as an active process','Distinct stages during a night','Replaying recently learned information','Short bursts of coordinated activity','Implications for education','The costs of sleep deprivation','Questions still to be resolved','The overall evidence'],
 ['Opening science to public participation','A tradition older than the modern label','Projects in different disciplines','Checking the reliability of contributions','Benefits for participants','An uneven pattern of involvement','Future tools and partnerships'],
 ['How common automatic behaviour is','The sequence linking cues and rewards','Different brain systems involved','Why a fixed timetable is misleading','The influence of familiar surroundings','Changing cues to change behaviour','The timing of rewards','Building on an existing routine'],
 ['Defining a response to an inactive treatment','Evidence of physiological mechanisms','How treatment context affects expectations','The contribution of communication','Effects when patients know the treatment is inactive','Ethical questions about clinical use','Limits on what an effect can achieve']
];
const headingFallback=[
 ['i. Turbine technology and its origins','ii. Predictable but intermittent generation','iii. The practical limits of a promising source','iv. Measuring effects on marine life','v. Connecting a project to the grid','vi. Why communities may resist projects'],
 ['i. Why seed diversity matters','ii. Storage methods for different species','iii. Keeping collections viable','iv. The value of accurate records','v. Conservation beyond seed banks'],
 ['i. How light affects the body clock','ii. Light in different cultures','iii. Measuring exposure and sleep','iv. Timing matters','v. Limits of simple advice','vi. Practical changes'],
 ['i. Cooling and water use','ii. Planning for tree loss','iii. Shade and the city','iv. Equity in access to trees','v. Choosing diverse species','vi. Measuring urban canopy'],
 ['i. Selecting and processing old concrete','ii. Water absorption and mix design','iii. Environmental costs beyond the material','iv. Keeping buildings in use','v. The limits of recycled aggregate','vi. Transport and processing']
];
const matchFallback={
  6:['A. Farmers concerned about flooded fields','B. Conservation groups supporting reintroduction','C. Researchers reporting measured effects'],
  7:['A. Ancient trade goods and technologies','B. The routes and their geography','C. Merchants and intermediaries','D. Religion and cultural exchange','E. Political change and security','F. Crops and disease','G. The decline of overland routes','H. The modern Belt and Road Initiative'],
  8:['A. Food preservation before refrigeration','B. Industrial and domestic adoption','C. Changes to shopping and diet','D. Refrigerated international trade','E. Social effects and inequalities','F. Environmental costs and regulation','G. Refrigeration in the future'],
  9:['A. Green space before public parks','B. Health and industrial reform','C. Birkenhead Park and Central Park','D. Social goals and criticism','E. Sport and recreation','F. Playgrounds and changing design','G. Ecological functions','H. Funding and accountability'],
  10:['A. Gradual self-domestication near settlements','B. Deliberate capture and breeding','C. Genetic evidence about diet','D. Behavioural cooperation with humans','E. Multiple origins','F. Archaeological uncertainty']
};
// Explicit paragraph targets replace prompts that previously revealed the paragraph topic.
const targetsLater=[[1,4,2,5,6],[1,2,3,4,5],[1,2,3,4,5],[1,2,3,4,5],[1,2,3,4,5]];
function revise(input){
 const data=structuredClone(input), issues=[];
 for(let fi=0;fi<data.length;fi++){
  const mock=data[fi];mock.contentRevision=2;
  mock.description='Original Academic practice: 40 Listening questions, 40 Reading questions and two Writing tasks. Recordings use synthetic voices. Scores are practice estimates; Writing requires rubric-based review. Speaking is practised separately.';
  let source='';const sourcePath=path.join(root,'..','Luminar-copy',`mock-${String(fi+1).padStart(2,'0')}.md`);
  if(fi<5&&fs.existsSync(sourcePath))source=clean(fs.readFileSync(sourcePath,'utf8'));
  for(const sec of mock.sections.slice(0,2)){
   const reading=sec.id==='reading';
   const sourceSection=reading?source.split('## READING')[1]?.split('## WRITING')[0]:source.split('## LISTENING')[1]?.split('## READING')[0];
   let ordinal=0;
   sec.modules[0].instructions=reading?'Answer all 40 questions in 60 minutes. Read each question’s word limit and use the numbered paragraphs for matching tasks.':'Answer all 40 questions. Each recording can be played once. Read the questions before starting each part. Synthetic voices are used for this practice material.';
   for(let pi=0;pi<sec.modules[0].parts.length;pi++){
    const p=sec.modules[0].parts[pi];
    p.transcript=clean(p.transcript||'');p.passage=clean(p.passage||'');
    if(fi===0&&!reading&&pi===0)p.transcript=p.transcript.replace("Maya: Hello.","Maya: Hello. My name is Maya Patel. That's P A T E L.");
    if(fi===1&&!reading&&pi===1)p.questions[5].acceptedAnswers=['C'];
    if(fi===2&&!reading&&pi===3)p.transcript=p.transcript.replace(/because water is denser than air/gi,'because water is much less compressible than air, despite being denser');
    // Line wrapping in the PDF import must not split answer phrases.
    p.transcript=p.transcript.replace(/([^\n])\n(?!\n|[A-Z][A-Za-z ]{0,24}:)/g,'$1 ');
    let paragraphs=[];
    if(reading){
     paragraphs=p.passage.split(/\n\s*\n/).filter(Boolean);
     if(fi>=6&&paragraphs[0].length<100)paragraphs.shift();
     if(fi===5){
      const lines=p.passage.split('\n');lines.shift();
      const starts=pi===0?['Beavers are often','One of the most cited','Not everyone','In several regions','Supporters','The debate','Looking']:pi===1?['According to','This reframing','Some researchers now','Interestingly','This is sometimes','A further complication','Not all procrastination','Cultural and contextual','Ultimately']:['For much','This assumption','Proponents','This optimistic','There is also','Some economists','Early evidence','A further consideration','Not all researchers','What does seem'];
      let body=lines.join(' ');for(const prefix of starts)body=body.replace(prefix,'\n\n'+prefix);
      paragraphs=body.split(/\n\n/).filter(Boolean);
     }
     p.passage=paragraphs.map((x,i)=>`[${i+1}] ${x.replace(/\s+/g,' ').trim()}`).join('\n\n');
     p.instructions='Read the passage and answer the questions. Paragraph numbers appear in square brackets.';
    }else{
     p.instructions='Read the questions, then play the recording once. Answer limits are stated with each question.';
    }
    const evidenceText=reading?paragraphs.join('\n\n'):p.transcript;
    for(const q of p.questions){
     const legacyId=String(q.id);
     ordinal++;q.id=`v2-${mock.id}-${reading?'r':'l'}-${pi+1}-${ordinal}`;
      const originalNo=Number((legacyId.match(/q(\d+)$/)||[])[1]||ordinal);
      const originalLine=sourceSection&&sourceSection.match(new RegExp('^'+originalNo+'\\.\\s+([^\\n]+)','m'));
      q.prompt=clean(originalLine?originalLine[1]:q.prompt).replace(/_{2,}/g,'________').split(/\s*(?:####\s*)?Questions?\s+\d+\s*[-–]/)[0].trim();
     if(q.options)q.options=q.options.map(o=>clean(o).split(/\s*(?:####\s*)?Questions?\s+\d+\s*[-–]/)[0].trim());
     if(q.type==='single_choice'){
      q.prompt=q.prompt.replace(/\s+A\.\s[\s\S]*$/,'').trim();
      q.instructions='Choose one answer.';
      continue;
     }
     if(q.type!=='text')continue;
     q.acceptedAnswers=q.acceptedAnswers.flatMap(a=>clean(a).split(/\s*\/\s*/)).map(a=>a.replace(/\s*-\s*/g,'-').trim());
     const a=q.acceptedAnswers[0];
     if(markers.includes(a.toUpperCase())){
      const yn=['YES','NO'].includes(a.toUpperCase())||q.acceptedAnswers.some(x=>['Yes','No'].includes(x))||(!['TRUE','FALSE'].includes(a.toUpperCase())&&ordinal>=27&&fi<5);
      q.type='single_choice';q.options=yn?['YES','NO','NOT GIVEN']:['TRUE','FALSE','NOT GIVEN'];q.correct=q.options.indexOf(a.toUpperCase());delete q.acceptedAnswers;
      q.instructions=yn?'Choose YES if the statement agrees with the writer’s views, NO if it contradicts them, or NOT GIVEN if the writer’s view is not stated.':'Choose TRUE if the statement agrees with the passage, FALSE if it contradicts the passage, or NOT GIVEN if there is insufficient information.';
      continue;
     }
     if(reading&&/^\d+$/.test(a)&&/paragraph|explanation|example|reason|warning|distinction|response|list|conflict|benefit|evidence|need|risk|role|difference|importance|possibility|reminder|influence|criticism|caution|performance|uncertainty/i.test(q.prompt)){
      q.type='single_choice';q.options=paragraphs.map((_,i)=>`Paragraph ${i+1}`);q.correct=Number(a)-1;q.prompt=`Which paragraph contains the following information?\n${q.prompt.charAt(0).toUpperCase()+q.prompt.slice(1)}`;q.instructions='Choose one paragraph. A paragraph may be used more than once.';delete q.acceptedAnswers;continue;
     }
     if(reading&&/^[ivx]+$/.test(a)){
      if(fi<5){
       const blocks=[...(sourceSection||'').matchAll(/Headings:\s*([\s\S]*?)(?=\n\d+\.\s*Paragraph)/g)];
       const hs=blocks.flatMap(b=>b[1].split('\n').map(line=>line.match(/^\s*([ivx]+)\.\s*(.+?)\s*$/)).filter(Boolean).map(m=>[m[1],m[2]]));
       if(!hs.length){
        const fallback=headingFallback[fi]||[];
        fallback.forEach(line=>{const m=line.match(/^([ivx]+)\.\s*(.+)$/);if(m)hs.push([m[1],m[2]]);});
       }
       if(hs.length){q.type='single_choice';q.options=hs.map(h=>h[0]+'. '+h[1]);q.correct=hs.findIndex(h=>h[0]===a);delete q.acceptedAnswers;q.prompt=`Choose the best heading for ${q.prompt.toLowerCase()}.`;q.instructions='Choose the main idea of the whole paragraph. There are more headings than questions.';continue;}
      }else{
       const qi=ordinal-14, target=targetsLater[fi-5][qi];
       q.type='single_choice';q.options=headingsLater[fi-5];q.correct=target-1;q.prompt=`Choose the best heading for paragraph ${target}.`;q.instructions='Choose the main idea of the whole paragraph. There are more headings than questions.';delete q.acceptedAnswers;continue;
      }
     }
     if(/^[A-H]$/.test(a)&&!/reference|letter/i.test(q.prompt)){
      const groups=[...p.passage.matchAll(/(?:^|\n)([A-F])\.\s*([^\n]+)/g)];
      const opts=new Map();for(const g of groups)opts.set(g[1],g[2]);
      if(opts.size>=3){q.type='single_choice';q.options=[...opts].map(([l,t])=>l+'. '+t);q.correct=[...opts.keys()].indexOf(a);q.instructions='Choose one option. An option may be used more than once.';delete q.acceptedAnswers;continue;}
      if(reading&&fi>=5&&/^[A-H]$/.test(a)){
       const fallback=matchFallback[fi+1]||[];q.type='single_choice';q.options=fallback;q.correct=Math.max(0,fallback.findIndex(x=>x.startsWith(a+'.')));q.instructions='Choose the correct group, A, B or C (or A–H as shown).';delete q.acceptedAnswers;continue;
      }
     }
     if(reading&&/^\d+$/.test(a)&&((pi===1&&ordinal>=14&&ordinal<=18)||(pi===2&&ordinal>=32&&ordinal<=35))){
      q.type='single_choice';q.options=paragraphs.map((_,i)=>`Paragraph ${i+1}`);q.correct=Number(a)-1;q.prompt=`Which paragraph contains the following information?\n${q.prompt.charAt(0).toUpperCase()+q.prompt.slice(1)}`;q.instructions='Choose one paragraph. A paragraph may be used more than once.';delete q.acceptedAnswers;continue;
     }
     // Restore original form-completion lines where the importer removed underscores.
     const original=sourceSection&&sourceSection.match(new RegExp('^'+ordinal+'\\.\\s+([^\\n]+)','m'));
     if(original&&original[1].includes('___'))q.prompt=original[1].trim();
     else if(!q.prompt.includes('___')){
      const candidates=sentences(evidenceText).map(s=>s.replace(/^[A-Za-z ]{1,25}:\s*/, '')).filter(s=>q.acceptedAnswers.some(v=>new RegExp('(?<![a-z])'+rx(v)+'(?![a-z])','i').test(s)));
      const terms=new Set((q.prompt.toLowerCase().match(/[a-z]{4,}/g)||[]));
      candidates.sort((x,y)=>[...terms].filter(t=>y.toLowerCase().includes(t)).length-[...terms].filter(t=>x.toLowerCase().includes(t)).length);
      if(candidates[0]){
       const sentence=candidates[0];
       const answer=q.acceptedAnswers.find(v=>new RegExp('(?<![a-z])'+rx(v)+'(?![a-z])','i').test(sentence));
       q.prompt=sentence.replace(new RegExp('(?<![a-z])'+rx(answer)+'(?![a-z])','i'),'________');
       q.explanation=`The ${reading?'passage':'recording'} states: “${sentence}”`;
      }else issues.push({form:fi+1,section:sec.id,part:pi+1,number:ordinal,answer:a,prompt:q.prompt});
     }
     q.wordLimit=Math.max(1,...q.acceptedAnswers.map(v=>v.split(/\s+/).length));
     q.instructions=`Complete the gap. Write NO MORE THAN ${['ZERO','ONE','TWO','THREE','FOUR','FIVE'][q.wordLimit]||q.wordLimit} WORD${q.wordLimit===1?'':'S'} AND/OR A NUMBER${reading?' from the passage':''}.`;
    }
    if(!reading)p.passage='';
   }
  }
  const manual={
   '6-listening-1-4':'The one-off joining fee is £________.',
   '6-listening-2-17':'The annual plot rental fee is £________.',
   '7-listening-2-13':'The red route is ________ kilometres long.',
   '8-listening-1-6':'The room hire fee is waived when food spending reaches £________.',
   '8-listening-1-9':'A deposit of £________ is required.',
   '8-listening-2-19':'The gift shop closes ________ before the main site.',
   '9-listening-1-4':'The monthly cost is £________.',
   '9-listening-1-8':'Basic insurance covers items up to £________.',
   '9-listening-1-9':'Additional insurance is available for items worth ________.',
   '10-listening-1-5':'The course fee is £________.',
   '10-listening-3-27':'This choice may limit the ________ of the findings.'
  };
  for(const key of Object.keys(manual)){
   const [form,section,part,num]=key.split('-').map((x,i)=>i===0?Number(x):x);const p=data[form-1].sections.find(s=>s.id===section)?.modules[0]?.parts[part-1];const q=p?.questions?.[Number(num)-1-((Number(part)-1)*10)];if(q&&q.type==='text'){q.prompt=manual[key];q.instructions='Complete the gap. Write NO MORE THAN TWO WORDS AND/OR A NUMBER.';}
  }
  const proxy=data[1].sections.find(s=>s.id==='reading')?.modules[0]?.parts[2]?.questions?.[6];
  if(proxy){proxy.prompt='Technical fairness measures may conflict, so decisions also require discussion of values and ________.';proxy.instructions='Complete the summary. Write NO MORE THAN TWO WORDS.';}
  const f7=data[6].sections.find(s=>s.id==='reading')?.modules[0]?.parts[0]?.questions?.[12];
  if(f7&&f7.acceptedAnswers?.[0]==='H'){f7.type='single_choice';f7.options=matchFallback[7];f7.correct=7;delete f7.acceptedAnswers;f7.prompt='Which group is associated with the modern political initiative connected to the historical network?';f7.instructions='Choose one option, A–H.';}
  for(const mock of data){
   const seen=new Set();for(const sec of mock.sections)for(const mod of sec.modules||[])for(const p of mod.parts||[])for(const q of p.questions||[]){if(seen.has(q.id))issues.push({form:mock.id,duplicate:q.id});seen.add(q.id);}
  }
 }
 return {data,issues};
}
module.exports={revise};
