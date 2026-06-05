// js/vocab.js — vocabulary folders, word display, cached state
'use strict';

const Vocab = (() => {
  // Private state — no global collisions possible
  const _state = {
    sat:   { folders: [], words: [] },
    ielts: { folders: [], words: [] },
    lastHash: { sat: '', ielts: '' },
  };

  function _hash(arr) {
    if (!arr || !arr.length) return '';
    return arr.length + '|' + (arr[0]?.id || '') + '|' + (arr[arr.length - 1]?.id || '');
  }

  // ── Public getters ──────────────────────────────────────────
  function getFolders(type) { return _state[type].folders; }
  function getWords(type)   { return _state[type].words; }

  // ── Load from Firebase ──────────────────────────────────────
  async function loadFolders(type) {
    const snap = await Utils.fbGet(`${type}-folders`);
    const folders = snap.val()
      ? Object.entries(snap.val()).map(([k, v]) => ({ id: k, ...v }))
      : [];
    _state[type].folders = folders;
    renderFolderCards(type);
    return folders;
  }

  async function loadWords(type) {
    const snap = await Utils.fbGet(`${type}-words`);
    const words = snap.val()
      ? Object.entries(snap.val()).map(([k, v]) => ({ id: k, ...v }))
      : [];
    const h = _hash(words);
    if (_state[type].lastHash === h) return words;
    _state[type].lastHash = h;
    _state[type].words = words;
    requestAnimationFrame(() => renderFolderCards(type));
    return words;
  }

  // ── Render folder grid ──────────────────────────────────────
  function renderFolderCards(type) {
    const elId = type === 'sat' ? 'sat-folder-cards' : 'ielts-folder-cards';
    const el = document.getElementById(elId);
    if (!el) return;

    const folders = _state[type].folders;
    const words   = _state[type].words;

    if (!folders.length) {
      el.innerHTML = '<div style="text-align:center;padding:36px;color:#aaa;">No folders yet</div>';
      return;
    }

    const countById = {};
    words.forEach(w => {
      const fid = w.folder || '__';
      countById[fid] = (countById[fid] || 0) + 1;
    });

    el.innerHTML = folders.map(f => {
      const cnt = countById[f.id] || 0;
      const acc = localStorage.getItem(`dc_acc_${f.id}`);
      return `<div class="edu-card" onclick="Vocab.openFolderPage('${f.id}','${Utils.esc(f.name)}','${type}')">
        <div>
          <div class="edu-card-title">📁 ${f.name}</div>
          <div style="font-size:12px;color:#aaa;margin-top:5px;">${cnt} words${acc !== null ? ` · ${acc}% accuracy` : ''}</div>
        </div>
        <div class="edu-icon">📖</div>
      </div>`;
    }).join('');
  }

  // ── Folder page (word list + duo entry) ─────────────────────
  function openFolderPage(fid, fname, type, updateHash = true) {
    const words = _state[type].words.filter(w => w.folder === fid);
    const pagesEl = document.getElementById(`${type}-folder-pages`);

    let pg = document.getElementById(`fp-${fid}`);
    if (!pg) { pg = document.createElement('div'); pg.id = `fp-${fid}`; pagesEl.appendChild(pg); }

    pg.innerHTML = `
      <button class="back-btn" onclick="Vocab.closeFolderPage('${type}')">← Назад</button>
      <div class="section-title">📁 ${fname}</div>
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap;">
        <span style="font-size:13px;color:#aaa;font-weight:600;">${words.length} words</span>
        <button class="btn-primary" style="width:auto;padding:9px 18px;font-size:13px;"
          onclick="Duo.start('${fid}','${Utils.esc(fname)}','${type}')">🃏 Start Cards</button>
      </div>
      <div>${words.map(w => `
        <div class="vocab-item">
          <div class="v-word">${w.w}</div>
          <div class="v-def">${w.d}</div>
          ${w.ant ? `<div class="v-ant">↔ ${w.ant}</div>` : ''}
          ${w.ex  ? `<div class="v-ex">"${w.ex}"</div>`   : ''}
        </div>`).join('')}
      </div>
      <div class="spacer"></div>`;

    document.getElementById(`${type}-folder-cards`).style.display = 'none';
    document.querySelectorAll(`#${type}-folder-pages > div`).forEach(d => d.style.display = 'none');
    pg.style.display = 'block';

    if (updateHash) location.hash = `#/edu/${type}/vocab/${encodeURIComponent(fid)}/`;
  }

  function closeFolderPage(type, updateHash = true) {
    document.getElementById(`${type}-folder-cards`).style.display = 'block';
    document.querySelectorAll(`#${type}-folder-pages > div`).forEach(d => d.style.display = 'none');
    if (updateHash) location.hash = `#/edu/${type}/vocab/`;
  }

  // ── Firebase realtime listeners ─────────────────────────────
  function bindListeners() {
    Utils.fbListen('sat-words', snap => {
      const d = snap.val();
      const words = d ? Object.entries(d).map(([k, v]) => ({ id: k, ...v })) : [];
      _state.sat.lastHash = '';
      _state.sat.words = words;
      Utils.debounce('sat-vocab-render', () => renderFolderCards('sat'), 250);
    });
    Utils.fbListen('ielts-words', snap => {
      const d = snap.val();
      const words = d ? Object.entries(d).map(([k, v]) => ({ id: k, ...v })) : [];
      _state.ielts.lastHash = '';
      _state.ielts.words = words;
      Utils.debounce('ielts-vocab-render', () => renderFolderCards('ielts'), 250);
    });
  }

  async function init() {
    await Promise.all([loadFolders('sat'), loadFolders('ielts'), loadWords('sat'), loadWords('ielts')]);
    bindListeners();
  }

  return { init, getFolders, getWords, loadFolders, loadWords, renderFolderCards, openFolderPage, closeFolderPage };
})();
