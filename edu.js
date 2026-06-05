// js/themes.js — theme management
'use strict';

const Themes = (() => {
  const LIST = [
    { id: 'beige', n: 'Beige',  bg: '#FFF0DB', card: '#fff',     txt: '#000', acc: '#D9B99B' },
    { id: 'dark',  n: 'Dark',   bg: '#1d1f2f', card: '#252a3d',  txt: '#fff', acc: '#0078D4' },
    { id: 'navy',  n: 'Navy',   bg: '#1a2744', card: '#243b55',  txt: '#fff', acc: '#60a5fa' },
    { id: 'slate', n: 'Slate',  bg: '#334155', card: '#475569',  txt: '#fff', acc: '#94a3b8' },
    { id: 'amber', n: 'Amber',  bg: '#431407', card: '#7c2d12',  txt: '#fff', acc: '#f59e0b' },
    { id: 'black', n: 'Black',  bg: '#1a1a1a', card: '#333',     txt: '#fff', acc: '#fff'    },
  ];

  function set(id) {
    const t = LIST.find(x => x.id === id) || LIST[0];
    const r = document.documentElement.style;
    r.setProperty('--bg',   t.bg);
    r.setProperty('--card', t.card);
    r.setProperty('--txt',  t.txt);
    r.setProperty('--acc',  t.acc);
    localStorage.setItem('theme', id);
    render();
  }

  function render() {
    const cur = localStorage.getItem('theme') || 'beige';
    document.getElementById('theme-grid').innerHTML = LIST.map(t =>
      `<div class="theme-btn ${t.id === cur ? 'active' : ''}" onclick="Themes.set('${t.id}')">
        <div class="color-dot" style="background:${t.bg}"></div>${t.n}
       </div>`
    ).join('');
  }

  function init() {
    set(localStorage.getItem('theme') || 'beige');
  }

  return { set, render, init };
})();
