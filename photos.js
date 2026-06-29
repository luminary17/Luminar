// js/photos.js — photo gallery sections
'use strict';

const Photos = (() => {
  const SUBS = [
    { id: 'geo-problems',    emoji: '📐', title: 'SAT Must-Solve Geometry Problems'      },
    { id: 'desmos-solutions',emoji: '🖩', title: 'Desmos Solutions for Hardest Questions' },
    { id: 'inference',       emoji: '🧠', title: 'Inference: All Hardest Questions'       },
    { id: 'desmos-guide',    emoji: '📖', title: 'Desmos Guide'                           },
    { id: 'desmos-tips',     emoji: '💡', title: '10 Desmos Tips'                         },
  ];

  function renderSubList() {
    const el = document.getElementById('edu-photo-list');
    if (!el) return;
    el.innerHTML = SUBS.map(sub => `
      <div class="photo-sub-card" onclick="Photos.openSub('${sub.id}','${Utils.esc(sub.title)}')">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="font-size:clamp(20px,6vw,26px);">${sub.emoji}</div>
          <div><div style="font-weight:800;font-size:clamp(14px,4vw,16px);">${sub.title}</div></div>
        </div>
        <div style="font-size:20px;color:#ccc;">›</div>
      </div>`).join('');
  }

  function openSub(subId, title) {
    document.getElementById('photo-page-title').textContent = title;
    const el = document.getElementById('photo-page-body');
    // Open page immediately — don't await anything first
    el.innerHTML = `<div style="max-width:860px;margin:0 auto;padding-bottom:20px;">
      <div id="text-slot-${subId}"></div>
      <div id="photo-slot-${subId}" style="text-align:center;padding:20px;color:#aaa;font-size:13px;">📷 Loading images…</div>
    </div>`;
    document.getElementById('photo-page').classList.add('active');

    // Fire both fetches simultaneously — render each slot as it arrives
    Utils.fbGet(`photo-sections-text/${subId}`).then(snap => {
      const slot = document.getElementById(`text-slot-${subId}`);
      if (!slot) return;
      const texts = snap.val()
        ? Object.entries(snap.val()).map(([k, v]) => ({ id: k, ...v }))
            .sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0))
        : [];
      if (!texts.length) { slot.innerHTML = ''; return; }
      let html = '';
      texts.forEach(t => {
        html += `<div class="text-block">
          ${t.title ? `<div class="text-block-title">${t.title}</div>` : ''}
          <div class="text-block-body">${t.body || ''}</div>
        </div>`;
      });
      slot.innerHTML = html;
    }).catch(() => {});

    Utils.fbGet(`photo-sections/${subId}`).then(snap => {
      const slot = document.getElementById(`photo-slot-${subId}`);
      if (!slot) return;
      const photos = snap.val()
        ? Object.entries(snap.val()).map(([k, v]) => ({ id: k, ...v }))
            .sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0))
        : [];
      if (!photos.length) { slot.innerHTML = ''; return; }
      let html = `<div style="font-size:11px;font-weight:800;color:#aaa;letter-spacing:1px;margin:10px 0;text-transform:uppercase;">📷 Images</div>
        <div class="photo-grid">`;
      photos.forEach(p => {
        html += `<div class="photo-card" onclick="Photos.openLightbox(this.querySelector('img').src)">
          <img src="${p.data}" alt="${p.title || ''}" loading="lazy">
          <div class="photo-card-body">${p.title ? `<div class="photo-card-title">${p.title}</div>` : ''}</div>
        </div>`;
      });
      html += `</div>`;
      slot.innerHTML = html;
    }).catch(() => {});
  }

  function closePage() { document.getElementById('photo-page').classList.remove('active'); }

  function openLightbox(src) {
    document.getElementById('lb-img').src = src;
    document.getElementById('lightbox').classList.add('active');
  }
  function closeLightbox() { document.getElementById('lightbox').classList.remove('active'); }

  return { renderSubList, openSub, closePage, openLightbox, closeLightbox };
})();
