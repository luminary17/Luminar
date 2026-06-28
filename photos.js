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

  async function openSub(subId, title) {
    document.getElementById('photo-page-title').textContent = title;
    const el = document.getElementById('photo-page-body');
    el.innerHTML = '<div style="text-align:center;padding:48px;color:#bbb;">Loading...</div>';
    document.getElementById('photo-page').classList.add('active');

    // 1. Load text first — it's small, shows instantly
    const textSnap = await Utils.fbGet(`photo-sections-text/${subId}`);
    const textItems = textSnap.val()
      ? Object.entries(textSnap.val()).map(([k, v]) => ({ id: k, ...v }))
          .sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0))
      : [];

    // Render text immediately
    let html = '<div style="max-width:860px;margin:0 auto;padding-bottom:20px;">';
    textItems.forEach(t => {
      html += `<div class="text-block">
        ${t.title ? `<div class="text-block-title">${t.title}</div>` : ''}
        <div class="text-block-body">${t.body || ''}</div>
      </div>`;
    });
    // Placeholder that photos will populate
    html += `<div id="photo-lazy-slot-${subId}"><div style="text-align:center;padding:16px;color:#aaa;font-size:13px;">📷 Loading images…</div></div>`;
    html += '</div>';
    el.innerHTML = html;

    // 2. Load photos in background — large base64 data, may be slow
    Utils.fbGet(`photo-sections/${subId}`).then(photoSnap => {
      const slot = document.getElementById(`photo-lazy-slot-${subId}`);
      if (!slot) return; // user navigated away

      const photoItems = photoSnap.val()
        ? Object.entries(photoSnap.val()).map(([k, v]) => ({ id: k, ...v }))
            .sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0))
        : [];

      if (!photoItems.length && !textItems.length) {
        el.innerHTML = `<div style="text-align:center;padding:60px;color:#aaa;">
          <div style="font-size:48px;margin-bottom:14px;">📄</div>
          <div style="font-weight:700;">No content yet</div>
        </div>`;
        return;
      }

      if (!photoItems.length) {
        slot.innerHTML = '';
        return;
      }

      let imgHtml = '';
      if (textItems.length) imgHtml += `<div style="font-size:11px;font-weight:800;color:#aaa;letter-spacing:1px;margin:18px 0 10px;text-transform:uppercase;">📷 Images</div>`;
      imgHtml += `<div class="photo-grid">`;
      photoItems.forEach(p => {
        imgHtml += `<div class="photo-card" onclick="Photos.openLightbox(this.querySelector('img').src)">
          <img src="${p.data}" alt="${p.title || ''}" loading="lazy">
          <div class="photo-card-body">${p.title ? `<div class="photo-card-title">${p.title}</div>` : ''}</div>
        </div>`;
      });
      imgHtml += `</div>`;
      slot.innerHTML = imgHtml;
    });
  }

  function closePage() { document.getElementById('photo-page').classList.remove('active'); }

  function openLightbox(src) {
    document.getElementById('lb-img').src = src;
    document.getElementById('lightbox').classList.add('active');
  }
  function closeLightbox() { document.getElementById('lightbox').classList.remove('active'); }

  return { renderSubList, openSub, closePage, openLightbox, closeLightbox };
})();
