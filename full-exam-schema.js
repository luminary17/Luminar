(function (global) {
  'use strict';

  const VERSION = 1;
  const IELTS_SECTION_IDS = ['listening', 'reading', 'writing'];
  const QUESTION_TYPES = new Set(['single_choice', 'multiple_choice', 'text', 'numeric', 'matching', 'writing']);

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
      transcript: text(raw.transcript || raw.script),
      headings: array(raw.headings).map((heading) => text(heading)),
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
      durationMinutes: Math.max(1, number(raw.durationMinutes || raw.minutes, sectionId === 'listening' ? 40 : 60)),
      instructions: text(raw.instructions),
      parts: parts.length ? parts : [{ id: `${fallbackId}-part`, title: '', instructions: '', passage: '', image: '', audioUrl: '', transcript: '', questions: directQuestions }]
    };
  }

  function normalizeSection(input, index) {
    const raw = input && typeof input === 'object' ? input : {};
    const defaultId = IELTS_SECTION_IDS[index];
    const id = text(raw.id || raw.section || defaultId).toLowerCase();
    let modules = array(raw.modules).map((module, moduleIndex) => normalizeModule(module, id, `${id}-m${moduleIndex + 1}`));
    if (!modules.length) modules = [normalizeModule(raw, id, `${id}-main`)];
    return {
      id,
      title: text(raw.title || raw.name || ({ listening: 'Listening', reading: 'Academic Reading', writing: 'Academic Writing' })[id] || id),
      instructions: text(raw.instructions),
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
      order: Math.max(0, number(raw.order, 0)),
      title: text(raw.title || raw.name),
      description: text(raw.description || raw.desc),
      published: raw.published !== false,
      sections: array(raw.sections).map((section, index) => normalizeSection(section, index)),
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
    if (mock.exam !== 'ielts-academic') fail(errors, 'exam', 'must be "ielts-academic"');
    if (!mock.title) fail(errors, 'title', 'is required');
    const requiredSections = IELTS_SECTION_IDS;
    const sectionIds = mock.sections.map((section) => section.id);
    requiredSections.forEach((id) => { if (!sectionIds.includes(id)) fail(errors, 'sections', `missing required section "${id}"`); });
    const seen = new Set();
    const seenModules = new Set();
    if (new Set(sectionIds).size !== sectionIds.length) fail(errors, 'sections', 'section IDs must be unique');
    mock.sections.forEach((section, sectionIndex) => {
      const sectionPath = `sections[${sectionIndex}]`;
      if (!requiredSections.includes(section.id)) fail(errors, `${sectionPath}.id`, `unexpected section "${section.id}"`);
      if (!section.modules.length) fail(errors, `${sectionPath}.modules`, 'must contain at least one module');
      section.modules.forEach((module, moduleIndex) => {
        const modulePath = `${sectionPath}.modules[${moduleIndex}]`;
        if (!module.id) fail(errors, `${modulePath}.id`, 'is required');
        if (seenModules.has(module.id)) fail(errors, `${modulePath}.id`, `duplicate module id "${module.id}"`);
        seenModules.add(module.id);
        if (module.durationMinutes <= 0) fail(errors, `${modulePath}.durationMinutes`, 'must be positive');
        const questions = allQuestions(module);
        if (!questions.length) fail(errors, `${modulePath}.questions`, 'must contain questions');
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
            if (question.type === 'multiple_choice') {
              if (!Array.isArray(question.correct) || !question.correct.length) fail(errors, `${path}.correct`, 'must contain one or more valid option indexes');
              else if (question.correct.some((answer) => !Number.isInteger(answer) || answer < 0 || answer >= question.options.length)) fail(errors, `${path}.correct`, 'contains an invalid option index');
              else if (new Set(question.correct).size !== question.correct.length) fail(errors, `${path}.correct`, 'must not contain duplicate option indexes');
              if (question.maxSelections < question.correct.length) fail(errors, `${path}.maxSelections`, 'must allow every correct selection');
            }
            if (['text', 'numeric'].includes(question.type) && !question.acceptedAnswers.length) fail(errors, `${path}.acceptedAnswers`, 'must contain at least one accepted answer');
            if (question.type === 'matching') {
              if (!question.prompts.length || !question.options.length) fail(errors, path, 'matching requires prompts and options');
              question.prompts.forEach((prompt) => {
                if (!Object.prototype.hasOwnProperty.call(question.matches, prompt.id)) fail(errors, `${path}.matches.${prompt.id}`, 'is required');
                else if (!question.options.includes(text(question.matches[prompt.id]))) fail(errors, `${path}.matches.${prompt.id}`, 'must match one of the provided options');
              });
            }
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
      if (options.strictCounts) [listening, reading, writing].filter(Boolean).forEach((section) => {
        if (section.modules.length !== 1) fail(errors, `sections.${section.id}.modules`, 'must contain exactly one timed module');
      });
      if (options.strictCounts && listeningParts.length !== 4) fail(errors, 'sections.listening.parts', 'must contain exactly 4 parts');
      if (options.strictCounts && readingParts.length !== 3) fail(errors, 'sections.reading.parts', 'must contain exactly 3 passages');
      listeningParts.forEach((part, index) => { if (!part.audioUrl && options.strictCounts) warnings.push(`sections.listening.parts[${index}].audioUrl: audio pending`); });
      if (options.strictCounts) readingParts.forEach((part, index) => { if (!part.passage) fail(errors, `sections.reading.parts[${index}].passage`, 'is required'); });
      if (options.strictCounts && writingTasks[0] && !writingTasks[0].image && !writingTasks[0].passage) fail(errors, 'sections.writing.task1', 'requires a chart, table, map, process, diagram, or complete reference');
      if (options.strictCounts && writingTasks[0] && writingTasks[0].minWords < 150) fail(errors, 'sections.writing.task1.minWords', 'must be at least 150');
      if (options.strictCounts && writingTasks[1] && writingTasks[1].minWords < 250) fail(errors, 'sections.writing.task2.minWords', 'must be at least 250');
      writingTasks.forEach((task, index) => { if (task.type !== 'writing') fail(errors, `sections.writing.tasks[${index}].type`, 'must be "writing"'); });
    }
    return { valid: errors.length === 0, errors, warnings, mock };
  }

  global.FullExamSchema = { VERSION, QUESTION_TYPES: [...QUESTION_TYPES], normalize, validate, allQuestions, questionPoints, modulePoints };
})(window);
