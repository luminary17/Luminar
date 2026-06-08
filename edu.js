// js/edu.js — education section navigation, hash routing
'use strict';

const Edu = (() => {
  const EDU_HASHES = {
    'edu-main':         '#/edu/',
    'edu-sat':          '#/edu/sat/',
    'edu-sat-vocab':    '#/edu/sat/vocab/',
    'edu-sat-rules':    '#/edu/sat/rules/',
    'edu-sat-hacks':    '#/edu/sat/hacks/',
    'edu-sat-practice': '#/edu/sat/practice/',
    'edu-sat-quizzes':  '#/edu/sat/quizzes/',
    'edu-sat-qbank':    '#/edu/sat/qbank/',
    'edu-ielts':        '#/edu/ielts/',
    'edu-ielts-vocab':  '#/edu/ielts/vocab/',
  };

  function open(id, updateHash = true) {
    document.querySelectorAll('.edu-sec-view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';

    if (id === 'edu-sat-hacks')    Photos.renderSubList();
    if (id === 'edu-sat-practice') _renderPracticeList();
    if (id === 'edu-sat-quizzes')  _renderQuizList();
    if (id === 'edu-sat-vocab')    Vocab.closeFolderPage('sat', false);
    if (id === 'edu-ielts-vocab')  Vocab.closeFolderPage('ielts', false);
    if (id === 'edu-sat-qbank')    _renderQBank();

    if (updateHash) location.hash = EDU_HASHES[id] || '#/edu/';
  }

  function goTo(id) {
    Nav.go('edu', false);
    open(id);
  }

  // ── Practice tests ──────────────────────────────────────────
  let _practiceTests = [];

  async function loadPracticeTests() {
    const snap = await Utils.fbGet('practice-tests');
    _practiceTests = snap.val()
      ? Object.entries(snap.val()).map(([k, v]) => ({ id: k, ...v })) : [];
    _renderPracticeList();
  }

  function _renderPracticeList() {
    const el = document.getElementById('edu-practice-list');
    if (!el) return;
    if (!_practiceTests.length) {
      el.innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;">No practice tests yet</div>';
      return;
    }
    el.innerHTML = _practiceTests.map(t =>
      `<a href="${t.url}" target="_blank" style="text-decoration:none;">
        <div class="edu-card">
          <div>
            <div class="edu-card-title" style="font-size:clamp(14px,4vw,17px);">${t.title}</div>
            ${t.desc ? `<div style="font-size:clamp(11px,3vw,13px);color:#888;margin-top:5px;">${t.desc}</div>` : ''}
          </div>
          <div class="edu-icon">🔗</div>
        </div>
      </a>`
    ).join('');
  }

  // ── Quizzes ─────────────────────────────────────────────────
  let _quizzes = [];
  const TYPE_LABELS = {
    mc:    '📝 Multiple Choice',
    match: '🔗 Matching Pairs',
    open:  '💬 Open Questions',
    real:  '🎯 Real Exam Practice',
  };

  async function loadQuizzes() {
    const snap = await Utils.fbGet('quizzes');
    _quizzes = snap.val()
      ? Object.entries(snap.val()).map(([k, v]) => ({ id: k, ...v })) : [];
    _renderQuizList();
  }

  function _renderQuizList() {
    const el = document.getElementById('edu-quiz-list');
    if (!el) return;
    if (!_quizzes.length) {
      el.innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;">No quizzes yet</div>';
      return;
    }
    el.innerHTML = _quizzes.map(q =>
      `<div class="edu-card" onclick="Quiz.launch('${q.id}')">
        <div>
          <div class="edu-card-title" style="font-size:clamp(15px,4.5vw,18px);">${q.name}</div>
          <div style="font-size:clamp(11px,3vw,13px);color:#888;margin-top:4px;">
            ${TYPE_LABELS[q.type] || q.type} · ${(q.questions || []).length} questions
          </div>
        </div>
        <div class="edu-icon">▶</div>
      </div>`
    ).join('');
  }

  // ── Question Bank ────────────────────────────────────────────
  let _qbank = [];
  let _qbankFilter = 'all';

  async function loadQBank() {
    const snap = await Utils.fbGet('question-bank/sat');
    _qbank = snap.val() ? Object.entries(snap.val()).map(([k, v]) => ({ id: k, ...v })) : [];
  }

  function _renderQBank() {
    const el = document.getElementById('qbank-list');
    const filtersEl = document.getElementById('qbank-filters');
    if (!el) return;

    // Build tag list
    const tags = ['all', ...new Set(_qbank.map(q => q.tag).filter(Boolean))];
    if (filtersEl) {
      filtersEl.innerHTML = tags.map(t =>
        `<button class="qbank-filter-btn ${_qbankFilter === t ? 'active' : ''}"
          onclick="Edu.qbankFilter('${t}')">${t === 'all' ? 'All' : t}</button>`
      ).join('');
    }

    const filtered = _qbankFilter === 'all' ? _qbank : _qbank.filter(q => q.tag === _qbankFilter);
    if (!filtered.length) {
      el.innerHTML = '<div style="text-align:center;padding:48px;color:#aaa;font-size:14px;">No questions yet</div>';
      return;
    }

    el.innerHTML = filtered.map(q => `
      <div class="qbank-card" onclick="this.classList.toggle('open')">
        ${q.tag ? `<div class="qbank-tag">${q.tag}</div>` : ''}
        <div class="qbank-q">${q.q}</div>
        <div class="qbank-opts">
          ${['A','B','C','D'].map(l => q.options?.[l]
            ? `<div class="qbank-opt ${q.correct===l?'correct':''}"><b>${l}.</b> ${q.options[l]}</div>` : ''
          ).join('')}
        </div>
        <div class="qbank-answer">
          <div style="font-size:12px;font-weight:800;color:#22c55e;margin-bottom:4px;">✓ Answer: ${q.correct}</div>
          ${q.explain ? `<div class="qbank-explain">${q.explain}</div>` : ''}
        </div>
      </div>`).join('');
  }

  function qbankFilter(tag) {
    _qbankFilter = tag;
    _renderQBank();
  }

  // ── Firebase listeners ──────────────────────────────────────
  function bindListeners() {
    Utils.fbListen('practice-tests', snap => {
      const d = snap.val();
      _practiceTests = d ? Object.entries(d).map(([k, v]) => ({ id: k, ...v })) : [];
      _renderPracticeList();
    });
    Utils.fbListen('quizzes', snap => {
      const d = snap.val();
      _quizzes = d ? Object.entries(d).map(([k, v]) => ({ id: k, ...v })) : [];
      _renderQuizList();
    });
    Utils.fbListen('question-bank/sat', snap => {
      const d = snap.val();
      _qbank = d ? Object.entries(d).map(([k, v]) => ({ id: k, ...v })) : [];
      if (document.getElementById('edu-sat-qbank')?.style.display !== 'none') _renderQBank();
    });
  }

  async function init() {
    await Promise.all([loadPracticeTests(), loadQuizzes(), loadQBank()]);
    bindListeners();
  }

  return { open, goTo, init, qbankFilter };
})();
