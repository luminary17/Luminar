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
    if (id === 'edu-sat-qbank')    { _renderQBank(); }

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
  let _qbvItems = [];   // current filtered list for full-screen
  let _qbvIdx   = 0;    // current question index
  let _qbvAnswered = {}; // { qid: chosenLetter }

  function _fb2Get(path) {
    const { db, ref, get } = window.fb2;
    return get(ref(db, path));
  }
  function _fb2Listen(path, cb) {
    const { db, ref, onValue } = window.fb2;
    return onValue(ref(db, path), cb);
  }

  async function loadQBank() {
    const snap = await _fb2Get('question-bank/sat');
    _qbank = snap.val() ? Object.entries(snap.val()).map(([k, v]) => ({ id: k, ...v })) : [];
  }

  function _renderQBank() {
    const el = document.getElementById('qbank-list');
    const filtersEl = document.getElementById('qbank-filters');
    if (!el) return;

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

    // Show as launch cards (not full questions)
    el.innerHTML = `
      <div style="margin-bottom:16px;padding:16px;background:var(--card);border-radius:14px;border:1px solid var(--border);">
        <div style="font-size:15px;font-weight:800;color:var(--txt);margin-bottom:4px;">${filtered.length} Questions</div>
        <div style="font-size:13px;color:var(--txt-muted);margin-bottom:14px;">Click to start exam-style practice</div>
        <button style="background:var(--acc);color:#fff;border:none;padding:12px 24px;border-radius:12px;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer;width:100%;" onclick="Edu.openQBank()">
          🚀 Start Question Bank
        </button>
      </div>`;
  }

  function openQBank() {
    const filtered = _qbankFilter === 'all' ? _qbank : _qbank.filter(q => q.tag === _qbankFilter);
    if (!filtered.length) return;
    _qbvItems = filtered;
    _qbvIdx = 0;
    _qbvAnswered = {};
    document.getElementById('qbankview').classList.add('active');
    _qbvRender();
    _setupHighlight();
  }

  function closeQBank() {
    document.getElementById('qbankview').classList.remove('active');
    _hideHlBar();
  }

  function _qbvRender() {
    const q = _qbvItems[_qbvIdx];
    if (!q) return;
    const total = _qbvItems.length;
    const pct = (((_qbvIdx) / total) * 100).toFixed(1);

    document.getElementById('qbv-counter').textContent = `${_qbvIdx + 1} / ${total}`;
    document.getElementById('qbv-tag-badge').textContent = q.tag || '';
    document.getElementById('qbv-prog-fill').style.width = pct + '%';
    document.getElementById('qbv-q').innerHTML = q.q;
    document.getElementById('qbv-prev-btn').disabled = _qbvIdx === 0;

    const answered = _qbvAnswered[q.id];
    const optsEl = document.getElementById('qbv-opts');
    optsEl.innerHTML = ['A','B','C','D'].filter(l => q.options?.[l]).map(l => {
      let cls = '';
      if (answered) {
        if (l === q.correct) cls = 'correct';
        else if (l === answered) cls = 'wrong';
      }
      return `<button class="qbv-opt ${cls}" id="qbvo-${l}"
        onclick="Edu.qbvAnswer('${l}')"
        oncontextmenu="Edu.qbvStrike(this,event)"
        ${answered ? 'disabled' : ''}>
        <span class="qbv-opt-letter">${l}</span>
        <span>${q.options[l]}</span>
      </button>`;
    }).join('');

    // Explanation
    const expEl = document.getElementById('qbv-explain');
    if (answered && q.explain) {
      const correct = answered === q.correct;
      expEl.className = 'qbv-explain show';
      expEl.innerHTML = `<div class="qbv-result-badge ${correct ? 'correct' : 'wrong'}">${correct ? '✓ Correct' : '✗ Incorrect'}</div><br>💡 ${q.explain}`;
    } else if (answered) {
      const correct = answered === q.correct;
      expEl.className = 'qbv-explain show';
      expEl.innerHTML = `<div class="qbv-result-badge ${correct ? 'correct' : 'wrong'}">${correct ? '✓ Correct!' : `✗ Incorrect — answer is ${q.correct}`}</div>`;
    } else {
      expEl.className = 'qbv-explain';
      expEl.innerHTML = '';
    }

    // Footer status
    const status = document.getElementById('qbv-status');
    const done = Object.keys(_qbvAnswered).length;
    status.textContent = `${done} / ${total} answered`;

    document.getElementById('qbv-next-btn').textContent = _qbvIdx === total - 1 ? 'Finish' : 'Next →';
  }

  function qbvAnswer(letter) {
    const q = _qbvItems[_qbvIdx];
    if (!q || _qbvAnswered[q.id]) return;
    _qbvAnswered[q.id] = letter;
    _qbvRender();
  }

  function qbvStrike(btn, e) {
    e.preventDefault();
    if (btn.disabled) return;
    btn.classList.toggle('struck');
  }

  function qbvNext() {
    if (_qbvIdx < _qbvItems.length - 1) { _qbvIdx++; _qbvRender(); }
    else closeQBank();
  }

  function qbvPrev() {
    if (_qbvIdx > 0) { _qbvIdx--; _qbvRender(); }
  }

  // ── Highlighting ─────────────────────────────────────────────
  function _setupHighlight() {
    const qEl = document.getElementById('qbv-q');
    if (!qEl) return;
    document.addEventListener('mouseup', _onSelect);
    document.addEventListener('touchend', _onSelect);
  }

  function _onSelect() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { _hideHlBar(); return; }
    const range = sel.getRangeAt(0);
    const qEl = document.getElementById('qbv-q');
    if (!qEl || !qEl.contains(range.commonAncestorContainer)) { _hideHlBar(); return; }
    const rect = range.getBoundingClientRect();
    const bar = document.getElementById('qbv-hl-bar');
    bar.style.top  = (rect.top - 50 + window.scrollY) + 'px';
    bar.style.left = (rect.left + rect.width / 2 - 60) + 'px';
    bar.classList.add('show');
  }

  function _hideHlBar() {
    document.getElementById('qbv-hl-bar')?.classList.remove('show');
  }

  function highlight(color) {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const mark = document.createElement('mark');
    mark.style.background = color;
    mark.style.color = '#000';
    try { range.surroundContents(mark); } catch(e) {}
    sel.removeAllRanges();
    _hideHlBar();
  }

  function clearHighlight() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const marks = document.getElementById('qbv-q')?.querySelectorAll('mark');
    marks?.forEach(m => {
      if (range.intersectsNode(m)) {
        const parent = m.parentNode;
        while (m.firstChild) parent.insertBefore(m.firstChild, m);
        parent.removeChild(m);
      }
    });
    sel.removeAllRanges();
    _hideHlBar();
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
    _fb2Listen('question-bank/sat', snap => {
      const d = snap.val();
      _qbank = d ? Object.entries(d).map(([k, v]) => ({ id: k, ...v })) : [];
      if (document.getElementById('edu-sat-qbank')?.style.display !== 'none') _renderQBank();
    });
  }

  async function init() {
    await Promise.all([loadPracticeTests(), loadQuizzes(), loadQBank()]);
    bindListeners();
  }

  return { open, goTo, init, qbankFilter, openQBank, closeQBank, qbvAnswer, qbvStrike, qbvNext, qbvPrev, highlight, clearHighlight };
})();
