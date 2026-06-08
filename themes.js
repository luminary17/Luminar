// js/themes.js — theme management
'use strict';

const Themes = (() => {
  const LIST = [
    { id: 'ocean', n: 'Ocean',  bg: '#0a1628', card: '#0f2035', sidebar: '#081422', txt: '#dde8f4', muted: '#7a94b0', acc: '#4a9eda', acc2: '#3a8bc9', border: 'rgba(255,255,255,.08)' },
    { id: 'dark',  n: 'Dark',   bg: '#1d1f2f', card: '#252a3d', sidebar: '#161829', txt: '#e8eaf6', muted: '#8890b0', acc: '#0078D4', acc2: '#0065b3', border: 'rgba(255,255,255,.08)' },
    { id: 'navy',  n: 'Navy',   bg: '#0d1b2e', card: '#152540', sidebar: '#091522', txt: '#e2eaf4', muted: '#7090b0', acc: '#60a5fa', acc2: '#3b82f6', border: 'rgba(255,255,255,.09)' },
    { id: 'slate', n: 'Slate',  bg: '#1e293b', card: '#273549', sidebar: '#182030', txt: '#e2e8f0', muted: '#94a3b8', acc: '#7dd3fc', acc2: '#38bdf8', border: 'rgba(255,255,255,.08)' },
    { id: 'black', n: 'Black',  bg: '#0a0a0a', card: '#141414', sidebar: '#050505', txt: '#e5e5e5', muted: '#777',    acc: '#fff',    acc2: '#ccc',    border: 'rgba(255,255,255,.07)' },
    { id: 'green', n: 'Forest', bg: '#0a1a0f', card: '#0f2518', sidebar: '#071208', txt: '#d4f0dc', muted: '#6a9b77', acc: '#4ade80', acc2: '#22c55e', border: 'rgba(255,255,255,.08)' },
  ];

  function set(id) {
    const t = LIST.find(x => x.id === id) || LIST[0];
    const r = document.documentElement.style;
    r.setProperty('--bg',      t.bg);
    r.setProperty('--card',    t.card);
    r.setProperty('--sidebar', t.sidebar);
    r.setProperty('--txt',     t.txt);
    r.setProperty('--txt-muted', t.muted);
    r.setProperty('--acc',     t.acc);
    r.setProperty('--acc2',    t.acc2);
    r.setProperty('--border',  t.border);
    localStorage.setItem('theme', id);
    render();
  }

  function render() {
    const cur = localStorage.getItem('theme') || 'ocean';
    const el = document.getElementById('theme-grid');
    if (!el) return;
    el.innerHTML = LIST.map(t =>
      `<div class="theme-btn ${t.id === cur ? 'active' : ''}" onclick="Themes.set('${t.id}')">
        <div class="color-dot" style="background:${t.bg};border:2px solid ${t.acc}"></div>${t.n}
       </div>`
    ).join('');
  }

  function init() {
    const saved = localStorage.getItem('theme');
    // Reset old incompatible themes
    const valid = LIST.map(x => x.id);
    set(valid.includes(saved) ? saved : 'ocean');
  }

  return { set, render, init };
})();
