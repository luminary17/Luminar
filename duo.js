// js/duo.js — duocard flashcard session, fully self-contained
'use strict';

const Duo = (() => {
  // All state is private — zero global pollution
  const _s = {
    fid: null, fname: null, type: null,
    queue: [], all: [], known: 0, tot: 0,
    tot_swipes: 0, r_swipes: 0,
    swiping: false, promptSides: {},
  };

  const _drag = { active: false, sx: 0, sy: 0, cx: 0, cy: 0 };

  // ── Persistence ─────────────────────────────────────────────
  function _save() {
    localStorage.setItem(`dc_${_s.fid}`, JSON.stringify({ ..._s, swiping: false }));
  }
  function _load(fid) {
    try { return JSON.parse(localStorage.getItem(`dc_${fid}`)); } catch { return null; }
  }
  function _clear(fid) { localStorage.removeItem(`dc_${fid}`); }

  // ── Start ───────────────────────────────────────────────────
  function start(fid, fname, type) {
    const words = Vocab.getWords(type).filter(w => w.folder === fid);
    if (!words.length) { alert('No words in this folder!'); return; }

    const saved = _load(fid);
    if (saved && saved.queue && saved.queue.length > 0) {
      Object.assign(_s, { promptSides: {}, ...saved });
    } else {
      Object.assign(_s, {
        fid, fname, type,
        queue: Utils.shuffle([...words]),
        all: words, known: 0, tot: words.length,
        tot_swipes: 0, r_swipes: 0, swiping: false, promptSides: {},
      });
    }

    document.getElementById('duo-folder').textContent = fname;
    document.getElementById('duo-complete').classList.remove('active');
    document.getElementById('duo-actions').style.display = 'flex';
    document.getElementById('duoview').classList.add('active');
    _showCard();
    _bindDrag();
  }

  // ── Card display ────────────────────────────────────────────
  function _showCard() {
    if (!_s.queue.length) { _complete(); return; }
    const w = _s.queue[0];
    const card = document.getElementById('duo-card');
    card.classList.remove('tint-r', 'tint-l');
    card.style.transition = card.style.transform = card.style.opacity = '';

    const key = w.id || w.w;
    if (!_s.promptSides[key]) _s.promptSides[key] = Math.random() < 0.5 ? 'word' : 'definition';
    const showWord = _s.promptSides[key] === 'word';

    document.getElementById('duo-word').textContent = showWord ? w.w : w.d;
    document.getElementById('duo-def').textContent  = showWord ? w.d : w.w;

    const ex = document.getElementById('duo-extra');
    ex.innerHTML = '';
    if (w.ant) ex.innerHTML += `<div class="duo-ant">↔ ${w.ant}</div>`;
    if (w.ex)  ex.innerHTML += `<div class="duo-ex">"${w.ex}"</div>`;
    ex.style.display = (w.ant || w.ex) ? 'block' : 'none';

    _updateProg();
  }

  function _updateProg() {
    const pct = _s.tot > 0 ? Math.round(_s.known / _s.tot * 100) : 0;
    document.getElementById('duo-stats').textContent = `${_s.known}/${_s.tot}`;
    document.getElementById('duo-prog').style.width = pct + '%';
  }

  // ── Swipe ───────────────────────────────────────────────────
  function swipe(dir) {
    if (_s.swiping || !_s.queue.length) return;
    _s.swiping = true;
    const card = document.getElementById('duo-card');
    const ok = dir === 'right';
    const tx = ok ? window.innerWidth * 1.2 : -window.innerWidth * 1.2;

    card.style.transition = 'transform .35s ease,opacity .35s ease';
    card.style.transform  = `translateX(${tx}px) rotate(${ok ? 16 : -16}deg)`;
    card.style.opacity    = '0';

    document.getElementById('duo-know').classList.toggle('show', ok);
    document.getElementById('duo-dontknow').classList.toggle('show', !ok);

    setTimeout(() => {
      const w = _s.queue.shift();
      _s.tot_swipes++;
      if (ok) { _s.r_swipes++; _s.known++; } else { _s.queue.push(w); }
      _save();

      document.getElementById('duo-know').classList.remove('show');
      document.getElementById('duo-dontknow').classList.remove('show');
      card.style.transition = 'none';
      card.style.transform  = `translateX(${ok ? -60 : 60}px)`;
      card.style.opacity    = '0';

      requestAnimationFrame(() => requestAnimationFrame(() => {
        card.style.transition = 'transform .28s ease,opacity .28s ease';
        card.style.transform  = '';
        card.style.opacity    = '1';
        _showCard();
        _s.swiping = false;
      }));
    }, 350);
  }

  // ── Complete screen ─────────────────────────────────────────
  function _complete() {
    const acc = _s.tot_swipes > 0 ? Math.round(_s.r_swipes / _s.tot_swipes * 100) : 100;
    localStorage.setItem(`dc_acc_${_s.fid}`, acc);
    _clear(_s.fid);
    document.getElementById('duo-actions').style.display = 'none';
    document.getElementById('duo-complete').classList.add('active');
    document.getElementById('duo-acc-pct').textContent = acc + '%';
    document.getElementById('duo-acc-ring').style.setProperty('--pct', acc + '%');
    document.getElementById('duo-complete-sub').textContent = `You mastered all ${_s.all.length} words!`;
  }

  function exit() {
    if (_s.queue.length > 0) {
      _save();
      if (_s.tot_swipes > 0)
        localStorage.setItem(`dc_acc_${_s.fid}`, Math.round(_s.r_swipes / _s.tot_swipes * 100));
    }
    document.getElementById('duoview').classList.remove('active');
    _unbindDrag();
    Vocab.renderFolderCards(_s.type || 'sat');
  }

  // ── Drag ────────────────────────────────────────────────────
  function _dragStart(e) {
    if (_s.swiping) return;
    const t = e.touches ? e.touches[0] : e;
    Object.assign(_drag, { active: true, sx: t.clientX, sy: t.clientY, cx: t.clientX, cy: t.clientY });
    document.getElementById('duo-card').style.transition = 'none';
  }

  function _dragMove(e) {
    if (!_drag.active) return;
    const t = e.touches ? e.touches[0] : e;
    _drag.cx = t.clientX; _drag.cy = t.clientY;
    const dx = _drag.cx - _drag.sx;
    const card = document.getElementById('duo-card');
    card.style.transform = `translateX(${dx}px) rotate(${dx * .05}deg)`;
    card.classList.toggle('tint-r', dx > 70);
    card.classList.toggle('tint-l', dx < -70);
    document.getElementById('duo-know').classList.toggle('show', dx > 70);
    document.getElementById('duo-dontknow').classList.toggle('show', dx < -70);
  }

  function _dragEnd() {
    if (!_drag.active) return;
    _drag.active = false;
    const dx = _drag.cx - _drag.sx, dy = _drag.cy - _drag.sy;
    const card = document.getElementById('duo-card');
    document.getElementById('duo-know').classList.remove('show');
    document.getElementById('duo-dontknow').classList.remove('show');
    card.classList.remove('tint-r', 'tint-l');
    if (Math.abs(dx) > 90 && Math.abs(dy) < 90) swipe(dx > 0 ? 'right' : 'left');
    else { card.style.transition = 'transform .3s ease'; card.style.transform = ''; }
  }

  function _bindDrag() {
    const c = document.getElementById('duo-card');
    c.addEventListener('mousedown', _dragStart);
    c.addEventListener('touchstart', _dragStart, { passive: true });
    window.addEventListener('mousemove', _dragMove);
    window.addEventListener('touchmove', _dragMove, { passive: true });
    window.addEventListener('mouseup', _dragEnd);
    window.addEventListener('touchend', _dragEnd);
  }

  function _unbindDrag() {
    const c = document.getElementById('duo-card');
    c.removeEventListener('mousedown', _dragStart);
    c.removeEventListener('touchstart', _dragStart);
    window.removeEventListener('mousemove', _dragMove);
    window.removeEventListener('touchmove', _dragMove);
    window.removeEventListener('mouseup', _dragEnd);
    window.removeEventListener('touchend', _dragEnd);
  }

  return { start, swipe, exit };
})();
