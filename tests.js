// js/tests.js — Mock Tests module (SAT + IELTS)
'use strict';

const Tests = (() => {
  const SECTIONS = [
    'tests-main',
    'tests-sat', 'tests-sat-reading', 'tests-sat-math',
    'tests-ielts', 'tests-ielts-speaking', 'tests-ielts-writing',
    'tests-ielts-reading', 'tests-ielts-listening',
  ];

  // Firebase key → section id map
  const FB_MAP = {
    'tests-sat-reading':    'mocks/sat/reading',
    'tests-sat-math':       'mocks/sat/math',
    'tests-ielts-speaking': 'mocks/ielts/speaking',
    'tests-ielts-writing':  'mocks/ielts/writing',
    'tests-ielts-reading':  'mocks/ielts/reading',
    'tests-ielts-listening':'mocks/ielts/listening',
  };

  // Container id for each leaf section
  const LIST_ID = {
    'tests-sat-reading':    'mock-list-sat-reading',
    'tests-sat-math':       'mock-list-sat-math',
    'tests-ielts-speaking': 'mock-list-ielts-speaking',
    'tests-ielts-writing':  'mock-list-ielts-writing',
    'tests-ielts-reading':  'mock-list-ielts-reading',
    'tests-ielts-listening':'mock-list-ielts-listening',
  };

  function open(id) {
    SECTIONS.forEach(s => {
      const el = document.getElementById(s);
      if (el) el.style.display = 'none';
    });
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';

    // Load list if it's a leaf section
    if (FB_MAP[id]) _loadList(id);
  }

  async function _loadList(id) {
    const listEl = document.getElementById(LIST_ID[id]);
    if (!listEl) return;
    listEl.innerHTML = '<div style="text-align:center;padding:32px;color:#bbb;">Loading...</div>';

    const snap = await Utils.fbGet(FB_MAP[id]);
    const items = snap.val()
      ? Object.entries(snap.val()).map(([k, v]) => ({ id: k, ...v }))
      : [];

    if (!items.length) {
      listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;font-size:14px;">No tests yet</div>';
      return;
    }

    listEl.innerHTML = items.map(t => `
      <a href="${t.url}" target="_blank" style="text-decoration:none;">
        <div class="edu-card">
          <div>
            <div class="edu-card-title" style="font-size:clamp(14px,4vw,17px);">${t.title}</div>
            ${t.desc ? `<div style="font-size:clamp(11px,3vw,13px);color:#888;margin-top:5px;">${t.desc}</div>` : ''}
          </div>
          <div class="edu-icon">🔗</div>
        </div>
      </a>`).join('');
  }

  // Realtime listeners for all leaf sections
  function bindListeners() {
    Object.entries(FB_MAP).forEach(([secId, fbPath]) => {
      Utils.fbListen(fbPath, snap => {
        const items = snap.val()
          ? Object.entries(snap.val()).map(([k, v]) => ({ id: k, ...v }))
          : [];
        const listEl = document.getElementById(LIST_ID[secId]);
        if (!listEl) return;
        if (!items.length) {
          listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;font-size:14px;">No tests yet</div>';
          return;
        }
        listEl.innerHTML = items.map(t => `
          <a href="${t.url}" target="_blank" style="text-decoration:none;">
            <div class="edu-card">
              <div>
                <div class="edu-card-title" style="font-size:clamp(14px,4vw,17px);">${t.title}</div>
                ${t.desc ? `<div style="font-size:clamp(11px,3vw,13px);color:#888;margin-top:5px;">${t.desc}</div>` : ''}
              </div>
              <div class="edu-icon">🔗</div>
            </div>
          </a>`).join('');
      });
    });
  }

  function init() {
    bindListeners();
  }

  return { open, init };
})();
