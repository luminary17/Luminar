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

    const [photoSnap, textSnap] = await Promise.all([
      Utils.fbGet(`photo-sections/${subId}`),
      Utils.fbGet(`photo-sections-text/${subId}`),
    ]);

    const photos = photoSnap.val()
      ? Object.entries(photoSnap.val()).map(([k, v]) => ({ id: k, type: 'photo', ...v })) : [];
    const texts = textSnap.val()
      ? Object.entries(textSnap.val()).map(([k, v]) => ({ id: k, type: 'text',  ...v })) : [];

    const allItems = [...photos, ...texts].sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));

    if (!allItems.length) {
      el.innerHTML = `<div style="text-align:center;padding:60px;color:#aaa;">
        <div style="font-size:48px;margin-bottom:14px;">📄</div>
        <div style="font-weight:700;">No content yet</div>
      </div>`;
      return;
    }

    const textItems  = allItems.filter(i => i.type === 'text');
    const photoItems = allItems.filter(i => i.type === 'photo');
    let html = '<div style="max-width:860px;margin:0 auto;padding-bottom:20px;">';

    textItems.forEach(t => {
      html += `<div class="text-block">
        ${t.title ? `<div class="text-block-title">${t.title}</div>` : ''}
        <div class="text-block-body">${t.body || ''}</div>
      </div>`;
    });

    if (photoItems.length) {
      if (textItems.length) html += `<div style="font-size:11px;font-weight:800;color:#aaa;letter-spacing:1px;margin:18px 0 10px;text-transform:uppercase;">📷 Images</div>`;
      html += `<div class="photo-grid">`;
      photoItems.forEach(p => {
        html += `<div class="photo-card" onclick="Photos.openLightbox('${p.data}')">
          <img src="${p.data}" alt="${p.title || ''}">
          <div class="photo-card-body">${p.title ? `<div class="photo-card-title">${p.title}</div>` : ''}</div>
        </div>`;
      });
      html += `</div>`;
    }
    html += '</div>';
    el.innerHTML = html;
  }

  function closePage() { document.getElementById('photo-page').classList.remove('active'); }

  function openLightbox(src) {
    document.getElementById('lb-img').src = src;
    document.getElementById('lightbox').classList.add('active');
  }
  function closeLightbox() { document.getElementById('lightbox').classList.remove('active'); }

  return { renderSubList, openSub, closePage, openLightbox, closeLightbox };
})();
