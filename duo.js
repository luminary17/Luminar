// js/quiz.js — quiz engine (MC, matching, open, real exam)
'use strict';

const Quiz = (() => {
  // Encapsulated state
  const _s = {
    qs: [], idx: 0, score: 0,
    type: 'mc', title: '', answered: false,
  };

  const _match = {
    pairs: [], selected: null, matched: [], wrong: 0, terms: [], defs: [],
  };

  // ── Public entry points ─────────────────────────────────────
  function start(questions, title, type) {
    const qs = Utils.shuffle([...questions]);
    Object.assign(_s, { qs, idx: 0, score: 0, type, title, answered: false });
    document.getElementById('qz-title').textContent = title;
    document.getElementById('qz-result').classList.remove('show');

    const body = document.getElementById('qz-body');
    body.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:14px;';
    document.getElementById('quizview').classList.add('active');

    if (type === 'match') _renderMatch();
    else _renderQ();
  }

  function exit() { document.getElementById('quizview').classList.remove('active'); }

  function retry() {
    _s.idx = 0; _s.score = 0; _s.answered = false;
    _s.qs = Utils.shuffle([..._s.qs]);
    document.getElementById('qz-result').classList.remove('show');
    document.getElementById('qz-body').style.display = 'flex';
    if (_s.type === 'match') _renderMatch();
    else _renderQ();
  }

  async function launch(id) {
    const snap = await Utils.fbGet(`quizzes/${id}`);
    const q = snap.val();
    if (q) start(q.questions, q.name, q.type);
  }

  // ── MC / Open rendering ─────────────────────────────────────
  function _renderQ() {
    if (_s.idx >= _s.qs.length) { _showResult(); return; }
    const q   = _s.qs[_s.idx];
    const tot = _s.qs.length;
    document.getElementById('qz-counter').textContent = `${_s.idx + 1}/${tot}`;
    document.getElementById('qz-prog').style.width = `${(_s.idx / tot) * 100}%`;

    const body = document.getElementById('qz-body');

    if (_s.type === 'open') {
      body.innerHTML = `
        <div class="quiz-qcard" style="width:100%;max-width:540px;">
          <div class="quiz-qlabel">Open Question</div>
          <div class="quiz-qtext">${q.q}</div>
          ${q.hint ? `<div style="font-size:12px;color:#aaa;margin-top:8px;font-style:italic;">Hint: ${q.hint}</div>` : ''}
        </div>
        <textarea class="open-textarea" id="open-ans" placeholder="Write your answer here..."></textarea>
        <button class="open-check-btn" onclick="Quiz._submitOpen()">Submit Answer</button>
        <div class="quiz-fb" id="quiz-fb"></div>
        <button class="quiz-next" id="quiz-next" onclick="Quiz._next()">Next →</button>`;
      _s.answered = false;
      return;
    }

    const TYPE_LABELS = { mc: 'Multiple Choice', real: `Section: ${q.section || 'Mixed'}` };
    const letters = ['A', 'B', 'C', 'D'].filter(l => q.options?.[l]);

    body.innerHTML = `
      <div class="quiz-qcard" style="width:100%;max-width:540px;">
        <div class="quiz-qlabel">${TYPE_LABELS[_s.type] || 'Question'}</div>
        <div class="quiz-qtext">${q.q}</div>
      </div>
      <div class="quiz-options" style="width:100%;max-width:540px;">
        ${letters.map(l =>
          `<button class="quiz-opt" onclick="Quiz._answer('${l}')" data-l="${l}">
            <span class="quiz-opt-letter">${l}</span>
            <span>${q.options[l]}</span>
          </button>`
        ).join('')}
      </div>
      <div class="quiz-fb" id="quiz-fb"></div>
      <button class="quiz-next" id="quiz-next" onclick="Quiz._next()">Next →</button>`;
    _s.answered = false;
  }

  function _answer(letter) {
    if (_s.answered) return;
    _s.answered = true;
    const q  = _s.qs[_s.idx];
    const ok = letter === q.correct;
    if (ok) _s.score++;

    document.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.disabled = true;
      const l = btn.dataset.l;
      if (l === q.correct) btn.classList.add('correct');
      if (l === letter && !ok) btn.classList.add('wrong');
    });

    const fb = document.getElementById('quiz-fb');
    fb.classList.add('show', ok ? 'correct' : 'wrong');
    fb.innerHTML = ok
      ? `<b>✓ Correct!</b>${q.explain ? ` — ${q.explain}` : ''}`
      : `<b>✗ Answer: ${q.correct}</b> — ${q.options[q.correct]}${q.explain ? `<br>💡 ${q.explain}` : ''}`;

    const nxt = document.getElementById('quiz-next');
    nxt.textContent = _s.idx + 1 >= _s.qs.length ? 'See Results →' : 'Next →';
    nxt.classList.add('show');
  }

  function _submitOpen() {
    const ans = (document.getElementById('open-ans')?.value || '').trim();
    if (!ans) { alert('Write an answer first!'); return; }
    _s.answered = true; _s.score++;
    const fb = document.getElementById('quiz-fb');
    fb.classList.add('show', 'correct');
    fb.innerHTML = `<b>✓ Answer recorded!</b><br>Compare with model answer:<br><em>${_s.qs[_s.idx].hint || 'Review your notes'}</em>`;
    const nxt = document.getElementById('quiz-next');
    nxt.textContent = _s.idx + 1 >= _s.qs.length ? 'See Results →' : 'Next →';
    nxt.classList.add('show');
  }

  function _next() {
    _s.idx++;
    if (_s.idx >= _s.qs.length) _showResult();
    else { document.getElementById('qz-body').innerHTML = ''; _renderQ(); }
  }

  // ── Matching ────────────────────────────────────────────────
  function _renderMatch() {
    _match.pairs    = _s.qs.map(q => ({ term: q.term, def: q.def }));
    _match.terms    = Utils.shuffle([..._match.pairs]).map(p => ({ type: 'term', val: p.term }));
    _match.defs     = Utils.shuffle([..._match.pairs]).map(p => ({ type: 'def',  val: p.def  }));
    _match.selected = null;
    _match.matched  = [];
    _match.wrong    = 0;

    document.getElementById('qz-counter').textContent = `${_s.qs.length} pairs`;
    document.getElementById('qz-prog').style.width = '0%';
    _renderMatchBoard();
  }

  function _renderMatchBoard() {
    const { terms, defs, matched, pairs } = _match;

    const isMatched = (type, val) => {
      if (type === 'term') return matched.includes(val);
      return matched.some(m => pairs.find(p => p.term === m && p.def === val));
    };

    document.getElementById('qz-body').innerHTML = `
      <div class="quiz-qcard" style="width:100%;max-width:540px;">
        <div class="quiz-qlabel">Matching Quiz</div>
        <div class="quiz-qtext">Match each term with its definition</div>
      </div>
      <div class="match-grid" style="width:100%;max-width:540px;">
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${terms.map((t, i) =>
            `<div class="match-item ${isMatched('term', t.val) ? 'matched' : ''}" id="term-${i}"
              onclick="Quiz._matchClick('term',${i},'${Utils.esc(t.val)}')">${t.val}</div>`
          ).join('')}
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${defs.map((d, i) =>
            `<div class="match-item ${isMatched('def', d.val) ? 'matched' : ''}" id="def-${i}"
              onclick="Quiz._matchClick('def',${i},'${Utils.esc(d.val)}')">${d.val}</div>`
          ).join('')}
        </div>
      </div>`;
  }

  function _matchClick(type, idx, val) {
    const m = _match;
    if (m.matched.includes(val) || m.matched.some(x => m.pairs.find(p => p.term === x && p.def === val))) return;

    if (!m.selected) {
      m.selected = { type, idx, val };
      document.getElementById(`${type}-${idx}`).classList.add('selected');
      return;
    }

    if (m.selected.type === type) {
      document.getElementById(`${m.selected.type}-${m.selected.idx}`).classList.remove('selected');
      m.selected = { type, idx, val };
      document.getElementById(`${type}-${idx}`).classList.add('selected');
      return;
    }

    const s    = m.selected;
    const term = type === 'term' ? val : s.val;
    const def  = type === 'def'  ? val : s.val;
    const pair = m.pairs.find(p => p.term === term && p.def === def);

    if (pair) {
      m.matched.push(term, def);
      _s.score++;
      document.getElementById(`${type}-${idx}`).classList.add('matched');
      document.getElementById(`${s.type}-${s.idx}`).classList.remove('selected');
      document.getElementById(`${s.type}-${s.idx}`).classList.add('matched');
      if (m.matched.length / 2 >= m.pairs.length) setTimeout(_showResult, 600);
      else document.getElementById('qz-prog').style.width = `${(m.matched.length / 2 / m.pairs.length) * 100}%`;
    } else {
      m.wrong++;
      [{ t: type, i: idx }, { t: s.type, i: s.idx }].forEach(({ t, i }) => {
        const el = document.getElementById(`${t}-${i}`);
        el.classList.add('wrong-flash');
        setTimeout(() => el.classList.remove('wrong-flash', 'selected'), 400);
      });
    }
    m.selected = null;
  }

  // ── Result screen ────────────────────────────────────────────
  function _showResult() {
    const tot = _s.qs.length;
    const pct = Math.round(_s.score / tot * 100);
    document.getElementById('qz-prog').style.width = '100%';
    document.getElementById('qz-body').style.display = 'none';
    document.getElementById('qz-result').classList.add('show');
    document.getElementById('qz-res-pct').textContent = pct + '%';
    document.getElementById('qz-res-ring').style.setProperty('--pct', pct + '%');

    let emoji = '🎉', title = 'Great job!';
    if (pct === 100) { emoji = '🏆'; title = 'Perfect score!'; }
    else if (pct >= 80) { emoji = '🌟'; title = 'Excellent!'; }
    else if (pct >= 60) { emoji = '👍'; title = 'Good effort!'; }
    else { emoji = '📖'; title = 'Keep practicing!'; }

    document.getElementById('qz-res-emoji').textContent = emoji;
    document.getElementById('qz-res-title').textContent = title;
    document.getElementById('qz-res-sub').textContent   = `${_s.score}/${tot} correct`;
  }

  // Expose internal handlers needed by inline onclick attrs
  return { start, exit, retry, launch, _answer, _submitOpen, _next, _matchClick };
})();
