// js/podcasts.js — podcast list rendering
'use strict';

const Podcasts = (() => {
  function render(pods) {
    const el = document.getElementById('podcast-list');
    if (!el) return;
    el.innerHTML = pods.length
      ? pods.map(p =>
          `<a href="${p.u}" target="_blank" class="podcast-item">
            <div class="podcast-thumb" style="background-image:url('${p.i}')"></div>
            <div class="podcast-body"><h3>${p.t}</h3><span style="font-size:12px;color:#888;">Слушать на YouTube</span></div>
          </a>`).join('')
      : '<div style="text-align:center;padding:36px;color:#aaa;">No podcasts yet</div>';
  }

  function bindListener() {
    Utils.fbListen('podcasts', snap => {
      const d = snap.val();
      const pods = d ? Object.entries(d).map(([k, v]) => ({ id: k, ...v })) : [];
      render(pods);
    });
  }

  return { render, bindListener };
})();
