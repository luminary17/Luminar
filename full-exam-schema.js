(function (global) {
  'use strict';

  const VERSION = 1;
  const SAT_SECTION_IDS = ['rw', 'math'];
  const IELTS_SECTION_IDS = ['listening', 'reading', 'writing'];
  const QUESTION_TYPES = new Set(['single_choice', 'multiple_choice', 'text', 'numeric', 'matching', 'writing']);
  const SAT_DOMAINS = {
    rw: ['information and ideas', 'craft and structure', 'expression of ideas', 'standard english conventions'],
    math: ['algebra', 'advanced math', 'problem-solving and data analysis', 'geometry and trigonometry']
  };

  function text(value) { return String(value == null ? '' : value).trim(); }
  function array(value) { return Array.isArray(value) ? value : []; }
  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  function fail(errors, path, message) { errors.push(`${path}: ${message}`); }

  function questionId(question, fallback) {
    return text(question.id || question.questionId || fallback).replace(/[^a-zA-Z0-9_-]/g, '-');
  }

  function normalizeCorrect(value, options) {
    if (typeof value === 'number') return value;
    const raw = text(value);
    if (/^[A-Z]$/i.test(raw)) return raw.toUpperCase().charCodeAt(0) - 65;
    const index = options.findIndex((option) => text(option) === raw);
    return index >= 0 ? index : value;
  }

  function normalizeQuestion(input, fallbackId) {
    const raw = input && typeof input === 'object' ? input : {};
    let type = text(raw.type || raw.kind || (raw.minWords ? 'writing' : raw.options || raw.answers ? 'single_choice' : 'text')).toLowerCase();
    const aliases = { mcq: 'single_choice', choice: 'single_choice', multiple: 'multiple_choice', short_answer: 'text', fill_blank: 'text', student_response: 'numeric', essay: 'writing' };
    type = aliases[type] || type;
    const options = array(raw.options || raw.answers).map((option) => text(option));
    let correct = raw.correct !== undefined ? raw.correct : raw.answer;
    if (type === 'single_choice') correct = normalizeCorrect(correct, options);
    if (type === 'multiple_choice') correct = array(correct).map((value) => normalizeCorrect(value, options));
    const acceptedAnswers = array(raw.acceptedAnswers || raw.accepted || (correct !== undefined && ['text', 'numeric'].includes(type) ? [correct] : [])).map((value) => text(value));
    return {
      id: questionId(raw, fallbackId),
      type,
      prompt: text(raw.prompt || raw.question || raw.q),
      instructions: text(raw.instructions),
      passage: text(raw.passage || raw.reference || raw.text),
      image: text(raw.image || raw.imageUrl),
      domain: text(raw.domain || raw.tag || raw.theme),
      skill: text(raw.skill || raw.topic),
      difficulty: text(raw.difficulty || raw.level).toLowerCase(),
      options,
      correct,
      acceptedAnswers,
      caseSensitive: Boolean(raw.caseSensitive),
      maxSelections: Math.max(
        0,
        number(
          raw.maxSelections,
          type === "multiple_choice" ? array(correct).length : 0
        )
      ),
      points: Math.max(0, number(raw.points, type === 'matching' ? array(raw.prompts).length : type === 'multiple_choice' ? array(correct).length : type === 'writing' ? 0 : 1)),
      wordLimit: Math.max(0, number(raw.wordLimit, 0)),
      minWords: Math.max(0, number(raw.minWords, 0)),
      recommendedMinutes: Math.max(0, number(raw.recommendedMinutes, 0)),
      prompts: array(raw.prompts).map((item, index) => ({ id: questionId(item, `${fallbackId}-match-${index + 1}`), text: text(item.text || item.prompt || item.question) })),
      matches: raw.matches && typeof raw.matches === 'object' ? raw.matches : (raw.correct && typeof raw.correct === 'object' && !Array.isArray(raw.correct) ? raw.correct : {}),
      explanation: text(raw.explanation || raw.explain)
    };
  }

  function normalizePart(input, fallbackId) {
    const raw = input && typeof input === 'object' ? input : {};
    const questions = array(raw.questions || raw.tasks).map((question, index) => normalizeQuestion(question, `${fallbackId}-q${index + 1}`));
    return {
      id: questionId(raw, fallbackId),
      title: text(raw.title || raw.name || fallbackId),
      instructions: text(raw.instructions),
      passage: text(raw.passage || raw.text),
      image: text(raw.image || raw.imageUrl),
      audioUrl: text(raw.audioUrl || raw.audio || raw.recording),
      questions
    };
  }

  function normalizeModule(input, sectionId, fallbackId) {
    const raw = input && typeof input === 'object' ? input : {};
    const parts = array(raw.parts).map((part, index) => normalizePart(part, `${fallbackId}-p${index + 1}`));
    const directQuestions = array(raw.questions).map((question, index) => normalizeQuestion(question, `${fallbackId}-q${index + 1}`));
    return {
      id: questionId(raw, fallbackId),
      title: text(raw.title || raw.name || fallbackId),
      stage: text(raw.stage || 'linear').toLowerCase(),
      durationMinutes: Math.max(1, number(raw.durationMinutes || raw.minutes, sectionId === 'rw' ? 32 : sectionId === 'math' ? 35 : 60)),
      instructions: text(raw.instructions),
      parts: parts.length ? parts : [{ id: `${fallbackId}-part`, title: '', instructions: '', passage: '', image: '', audioUrl: '', questions: directQuestions }]
    };
  }

  function normalizeSection(input, exam, index) {
    const raw = input && typeof input === 'object' ? input : {};
    const defaultId = exam === 'sat' ? SAT_SECTION_IDS[index] : IELTS_SECTION_IDS[index];
    const id = text(raw.id || raw.section || defaultId).toLowerCase();
    let modules = array(raw.modules).map((module, moduleIndex) => normalizeModule(module, id, `${id}-m${moduleIndex + 1}`));
    if (!modules.length) modules = [normalizeModule(raw, id, `${id}-main`)];
    return {
      id,
      title: text(raw.title || raw.name || ({ rw: 'Reading and Writing', math: 'Math', listening: 'Listening', reading: 'Academic Reading', writing: 'Academic Writing' })[id] || id),
      instructions: text(raw.instructions),
      breakMinutes: Math.max(0, number(raw.breakMinutes, id === 'rw' && exam === 'sat' ? 10 : 0)),
      route: raw.route && typeof raw.route === 'object' ? {
        threshold: Math.max(0, Math.min(1, number(raw.route.threshold, 0.6))),
        lowerModuleId: text(raw.route.lowerModuleId || raw.route.lower),
        higherModuleId: text(raw.route.higherModuleId || raw.route.higher)
      } : null,
      modules
    };
  }

  function normalize(input) {
    const raw = input && typeof input === 'object' ? input : {};
    const examRaw = text(raw.exam || raw.type).toLowerCase();
    const exam = examRaw === 'ielts' ? 'ielts-academic' : examRaw;
    return {
      schemaVersion: number(raw.schemaVersion, VERSION),
      id: questionId(raw, `mock-${Date.now()}`),
      exam,
      title: text(raw.title || raw.name),
      description: text(raw.description || raw.desc),
      published: raw.published !== false,
      sections: array(raw.sections).map((section, index) => normalizeSection(section, exam, index)),
      scoreTable: raw.scoreTable && typeof raw.scoreTable === 'object' ? raw.scoreTable : null,
      createdAt: number(raw.createdAt, Date.now()),
      updatedAt: Date.now()
    };
  }

  function allQuestions(module) {
    return array(module.parts).flatMap((part) => array(part.questions));
  }

  function questionPoints(question) {
    return Math.max(0, number(question?.points, question?.type === 'writing' ? 0 : 1));
  }

  function modulePoints(module) {
    return allQuestions(module).reduce((total, question) => total + questionPoints(question), 0);
  }

  function validate(input, options = {}) {
    const mock = normalize(input);
    const errors = [];
    const warnings = [];
    if (mock.schemaVersion !== VERSION) fail(errors, 'schemaVersion', `must be ${VERSION}`);
    if (!['sat', 'ielts-academic'].includes(mock.exam)) fail(errors, 'exam', 'must be "sat" or "ielts-academic"');
    if (!mock.title) fail(errors, 'title', 'is required');
    const requiredSections = mock.exam === 'sat' ? SAT_SECTION_IDS : IELTS_SECTION_IDS;
    const sectionIds = mock.sections.map((section) => section.id);
    requiredSections.forEach((id) => { if (!sectionIds.includes(id)) fail(errors, 'sections', `missing required section "${id}"`); });
    const seen = new Set();
    const seenModules = new Set();
    if (new Set(sectionIds).size !== sectionIds.length) fail(errors, 'sections', 'section IDs must be unique');
    mock.sections.forEach((section, sectionIndex) => {
      const sectionPath = `sections[${sectionIndex}]`;
      if (!requiredSections.includes(section.id)) fail(errors, `${sectionPath}.id`, `unexpected section "${section.id}"`);
      if (!section.modules.length) fail(errors, `${sectionPath}.modules`, 'must contain at least one module');
      if (mock.exam === 'sat') {
        const stages = section.modules.map((module) => module.stage);
        ['routing', 'lower', 'higher'].forEach((stage) => { if (!stages.includes(stage)) fail(errors, `${sectionPath}.modules`, `missing "${stage}" module`); });
        if (!section.route) fail(errors, `${sectionPath}.route`, 'is required for adaptive SAT routing');
        if (options.strictCounts && section.modules.length !== 3) fail(errors, `${sectionPath}.modules`, 'must contain exactly routing, lower, and higher modules');
        if (section.route && !section.modules.some((module) => module.id === section.route.lowerModuleId || module.stage === 'lower')) fail(errors, `${sectionPath}.route.lowerModuleId`, 'does not identify a lower module');
        if (section.route && !section.modules.some((module) => module.id === section.route.higherModuleId || module.stage === 'higher')) fail(errors, `${sectionPath}.route.higherModuleId`, 'does not identify a higher module');
      }
      section.modules.forEach((module, moduleIndex) => {
        const modulePath = `${sectionPath}.modules[${moduleIndex}]`;
        if (!module.id) fail(errors, `${modulePath}.id`, 'is required');
        if (seenModules.has(module.id)) fail(errors, `${modulePath}.id`, `duplicate module id "${module.id}"`);
        seenModules.add(module.id);
        if (module.durationMinutes <= 0) fail(errors, `${modulePath}.durationMinutes`, 'must be positive');
        const questions = allQuestions(module);
        if (!questions.length) fail(errors, `${modulePath}.questions`, 'must contain questions');
        const expected = mock.exam === 'sat' ? (section.id === 'rw' ? 27 : 22) : null;
        if (options.strictCounts && expected && questions.length !== expected) fail(errors, `${modulePath}.questions`, `must contain exactly ${expected} questions`);
        else if (expected && questions.length !== expected) warnings.push(`${modulePath}: contains ${questions.length}; official format uses ${expected}`);
        if (mock.exam === 'sat') {
          const officialMinutes = section.id === 'rw' ? 32 : 35;
          if (options.strictCounts && module.durationMinutes !== officialMinutes) fail(errors, `${modulePath}.durationMinutes`, `must be ${officialMinutes}`);
          const domains = new Set(questions.map((question) => question.domain.toLowerCase()));
          SAT_DOMAINS[section.id].forEach((domain) => {
            if (!domains.has(domain)) (options.strictCounts ? errors : warnings).push(`${modulePath}: missing SAT domain "${domain}"`);
          });
        }
        module.parts.forEach((part, partIndex) => {
          if (mock.exam === 'ielts-academic' && section.id === 'listening' && !part.audioUrl) warnings.push(`${modulePath}.parts[${partIndex}]: no audioUrl`);
          part.questions.forEach((question, questionIndex) => {
            const path = `${modulePath}.parts[${partIndex}].questions[${questionIndex}]`;
            if (!question.id) fail(errors, `${path}.id`, 'is required');
            if (seen.has(question.id)) fail(errors, `${path}.id`, `duplicate id "${question.id}"`);
            seen.add(question.id);
            if (!QUESTION_TYPES.has(question.type)) fail(errors, `${path}.type`, `unsupported type "${question.type}"`);
            if (!question.prompt) fail(errors, `${path}.prompt`, 'is required');
            if (['single_choice', 'multiple_choice'].includes(question.type) && question.options.length < 2) fail(errors, `${path}.options`, 'must contain at least two choices');
            if (question.type === 'single_choice' && (!Number.isInteger(question.correct) || question.correct < 0 || question.correct >= question.options.length)) fail(errors, `${path}.correct`, 'must identify one valid option');
            if (question.type === 'multiple_choice' && (!Array.isArray(question.correct) || !question.correct.length)) fail(errors, `${path}.correct`, 'must contain one or more valid option indexes');
            if (['text', 'numeric'].includes(question.type) && !question.acceptedAnswers.length) fail(errors, `${path}.acceptedAnswers`, 'must contain at least one accepted answer');
            if (question.type === 'matching' && (!question.prompts.length || !question.options.length)) fail(errors, path, 'matching requires prompts and options');
            if (mock.exam === 'sat' && section.id === 'rw' && question.type !== 'single_choice') fail(errors, `${path}.type`, 'SAT Reading and Writing uses single-choice questions');
            if (mock.exam === 'sat' && section.id === 'math' && !['single_choice', 'numeric'].includes(question.type)) fail(errors, `${path}.type`, 'SAT Math uses single-choice or numeric responses');
            if (mock.exam === 'ielts-academic' && section.id !== 'writing' && question.type === 'writing') fail(errors, `${path}.type`, 'writing tasks belong in the Writing section');
          });
        });
      });
    });
    if (mock.exam === 'ielts-academic') {
      const listening = mock.sections.find((section) => section.id === 'listening');
      const reading = mock.sections.find((section) => section.id === 'reading');
      const writing = mock.sections.find((section) => section.id === 'writing');
      const count = (section) => section ? section.modules.reduce((total, module) => total + modulePoints(module), 0) : 0;
      if (options.strictCounts && count(listening) !== 40) fail(errors, 'sections.listening', 'must contain exactly 40 questions');
      else if (count(listening) !== 40) warnings.push(`Listening contains ${count(listening)} questions; official format uses 40`);
      if (options.strictCounts && count(reading) !== 40) fail(errors, 'sections.reading', 'must contain exactly 40 questions');
      else if (count(reading) !== 40) warnings.push(`Reading contains ${count(reading)} questions; official format uses 40`);
      const writingTasks = writing ? writing.modules.flatMap(allQuestions) : [];
      if (options.strictCounts && writingTasks.length !== 2) fail(errors, 'sections.writing', 'must contain exactly 2 tasks');
      else if (writingTasks.length !== 2) warnings.push(`Writing contains ${writingTasks.length} tasks; official format uses 2`);
      const listeningParts = listening ? listening.modules.flatMap((module) => module.parts) : [];
      const readingParts = reading ? reading.modules.flatMap((module) => module.parts) : [];
      if (options.strictCounts && listeningParts.length !== 4) fail(errors, 'sections.listening.parts', 'must contain exactly 4 parts');
      if (options.strictCounts && readingParts.length !== 3) fail(errors, 'sections.reading.parts', 'must contain exactly 3 passages');
      if (options.strictCounts) listeningParts.forEach((part, index) => { if (!part.audioUrl) fail(errors, `sections.listening.parts[${index}].audioUrl`, 'is required'); });
      if (options.strictCounts) readingParts.forEach((part, index) => { if (!part.passage) fail(errors, `sections.reading.parts[${index}].passage`, 'is required'); });
      if (options.strictCounts && writingTasks[0] && !writingTasks[0].image && !writingTasks[0].passage) fail(errors, 'sections.writing.task1', 'requires a chart, table, map, process, diagram, or complete reference');
      writingTasks.forEach((task, index) => { if (task.type !== 'writing') fail(errors, `sections.writing.tasks[${index}].type`, 'must be "writing"'); });
    }
    return { valid: errors.length === 0, errors, warnings, mock };
  }

  global.FullExamSchema = { VERSION, QUESTION_TYPES: [...QUESTION_TYPES], normalize, validate, allQuestions, questionPoints, modulePoints };
})(window);
