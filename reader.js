// js/edu.js — education section navigation and sub-list rendering
'use strict';

const Edu = (() => {
  const EDU_PATHS = {
    'edu-main':          '/edu/',
    'edu-sat':           '/edu/sat/',
    'edu-sat-vocab':     '/edu/sat/vocab/',
    'edu-sat-rules':     '/edu/sat/rules/',
    'edu-sat-hacks':     '/edu/sat/hacks/',
    'edu-sat-practice':  '/edu/sat/practice/',
    'edu-sat-quizzes':   '/edu/sat/quizzes/',
    'edu-ielts':         '/edu/ielts/',
    'edu-ielts-vocab':   '/edu/ielts/vocab/',
  };

  function open(id, push = true) {
    document.querySelectorAll('.edu-sec-view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';

    if (id === 'edu-sat-hacks')   Photos.renderSubList();
    if (id === 'edu-sat-practice') _renderPracticeList();
    if (id === 'edu-sat-quizzes')  _renderQuizList();
    if (id === 'edu-sat-vocab')    Vocab.closeFolderPage('sat', null, false);
    if (id === 'edu-ielts-vocab')  Vocab.closeFolderPage('ielts', null, false);

    if (push) history.pushState({}, '', EDU_PATHS[id] || '/edu/');
  }

  // Shortcut called from home cards
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
  }

  async function init() {
    await Promise.all([loadPracticeTests(), loadQuizzes()]);
    bindListeners();
  }

  return { open, goTo, init };
})();
