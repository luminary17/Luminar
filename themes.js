// js/themes.js — theme management
'use strict';

const Themes = (() => {
  const LIST = [
    // — Light themes —
    { id: 'pearl',   n: 'Pearl',   bg: '#d9e5f1', card: '#ffffff', sidebar: '#c4d6e8', txt: '#0f2033', muted: '#5a7a9a', acc: '#2563eb', acc2: '#1d4ed8', border: 'rgba(0,0,0,.08)', gSat: 'linear-gradient(135deg,#1e40af,#3b82f6)', gIelts: 'linear-gradient(135deg,#065f46,#10b981)', gVocab: 'linear-gradient(135deg,#92400e,#f59e0b)', gTests: 'linear-gradient(135deg,#5b21b6,#8b5cf6)' },
    { id: 'snow',    n: 'Snow',    bg: '#f8fafc', card: '#ffffff', sidebar: '#f1f5f9', txt: '#0f172a', muted: '#64748b', acc: '#3b82f6', acc2: '#2563eb', border: 'rgba(0,0,0,.07)', gSat: 'linear-gradient(135deg,#1e40af,#60a5fa)', gIelts: 'linear-gradient(135deg,#14532d,#22c55e)', gVocab: 'linear-gradient(135deg,#78350f,#fbbf24)', gTests: 'linear-gradient(135deg,#4c1d95,#a78bfa)' },
    { id: 'linen',   n: 'Linen',   bg: '#fdf6ec', card: '#ffffff', sidebar: '#f5ebe0', txt: '#1c1512', muted: '#8c7a6b', acc: '#c2773a', acc2: '#a8622e', border: 'rgba(0,0,0,.07)', gSat: 'linear-gradient(135deg,#7c2d12,#f97316)', gIelts: 'linear-gradient(135deg,#14532d,#16a34a)', gVocab: 'linear-gradient(135deg,#713f12,#eab308)', gTests: 'linear-gradient(135deg,#4a1d96,#7c3aed)' },
    { id: 'lavender',n: 'Lavender',bg: '#f3f0ff', card: '#ffffff', sidebar: '#e8e0ff', txt: '#1e1040', muted: '#7060a0', acc: '#7c3aed', acc2: '#6d28d9', border: 'rgba(0,0,0,.07)', gSat: 'linear-gradient(135deg,#1e3a8a,#6366f1)', gIelts: 'linear-gradient(135deg,#134e4a,#14b8a6)', gVocab: 'linear-gradient(135deg,#7c2d12,#f97316)', gTests: 'linear-gradient(135deg,#581c87,#a855f7)' },
    { id: 'mint',    n: 'Mint',    bg: '#edfdf4', card: '#ffffff', sidebar: '#d1fae5', txt: '#052e16', muted: '#5a9070', acc: '#16a34a', acc2: '#15803d', border: 'rgba(0,0,0,.07)', gSat: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', gIelts: 'linear-gradient(135deg,#14532d,#22c55e)', gVocab: 'linear-gradient(135deg,#78350f,#f59e0b)', gTests: 'linear-gradient(135deg,#4c1d95,#8b5cf6)' },
    { id: 'blush',   n: 'Blush',   bg: '#fff1f4', card: '#ffffff', sidebar: '#ffe4ea', txt: '#1a0508', muted: '#9f5060', acc: '#e11d48', acc2: '#be123c', border: 'rgba(0,0,0,.07)', gSat: 'linear-gradient(135deg,#9f1239,#f43f5e)', gIelts: 'linear-gradient(135deg,#14532d,#16a34a)', gVocab: 'linear-gradient(135deg,#78350f,#f97316)', gTests: 'linear-gradient(135deg,#4c1d95,#8b5cf6)' },
    // — Dark themes —
    { id: 'ocean',   n: 'Ocean',   bg: '#0a1628', card: '#0f2035', sidebar: '#081422', txt: '#dde8f4', muted: '#7a94b0', acc: '#4a9eda', acc2: '#3a8bc9', border: 'rgba(255,255,255,.08)', gSat: 'linear-gradient(135deg,#1a3a64,#2d6aad)', gIelts: 'linear-gradient(135deg,#064e3b,#059669)', gVocab: 'linear-gradient(135deg,#78350f,#d97706)', gTests: 'linear-gradient(135deg,#3b0764,#7e22ce)' },
    { id: 'midnight',n: 'Midnight',bg: '#1d1f2f', card: '#252a3d', sidebar: '#161829', txt: '#e8eaf6', muted: '#8890b0', acc: '#0078D4', acc2: '#0065b3', border: 'rgba(255,255,255,.08)', gSat: 'linear-gradient(135deg,#1e3a8a,#2563eb)', gIelts: 'linear-gradient(135deg,#064e3b,#10b981)', gVocab: 'linear-gradient(135deg,#78350f,#f59e0b)', gTests: 'linear-gradient(135deg,#4c1d95,#7c3aed)' },
    { id: 'slate',   n: 'Slate',   bg: '#1e293b', card: '#273549', sidebar: '#182030', txt: '#e2e8f0', muted: '#94a3b8', acc: '#7dd3fc', acc2: '#38bdf8', border: 'rgba(255,255,255,.08)', gSat: 'linear-gradient(135deg,#0c4a6e,#0ea5e9)', gIelts: 'linear-gradient(135deg,#064e3b,#34d399)', gVocab: 'linear-gradient(135deg,#78350f,#fbbf24)', gTests: 'linear-gradient(135deg,#3b0764,#a855f7)' },
    { id: 'forest',  n: 'Forest',  bg: '#0a1a0f', card: '#0f2518', sidebar: '#071208', txt: '#d4f0dc', muted: '#6a9b77', acc: '#4ade80', acc2: '#22c55e', border: 'rgba(255,255,255,.08)', gSat: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', gIelts: 'linear-gradient(135deg,#14532d,#16a34a)', gVocab: 'linear-gradient(135deg,#713f12,#ca8a04)', gTests: 'linear-gradient(135deg,#4c1d95,#7c3aed)' },
    { id: 'noir',    n: 'Noir',    bg: '#0a0a0a', card: '#141414', sidebar: '#050505', txt: '#e5e5e5', muted: '#777',    acc: '#ffffff', acc2: '#cccccc', border: 'rgba(255,255,255,.07)', gSat: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', gIelts: 'linear-gradient(135deg,#14532d,#16a34a)', gVocab: 'linear-gradient(135deg,#78350f,#f59e0b)', gTests: 'linear-gradient(135deg,#4c1d95,#8b5cf6)' },
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
    r.setProperty('--g-sat',   t.gSat);
    r.setProperty('--g-ielts', t.gIelts);
    r.setProperty('--g-vocab', t.gVocab);
    r.setProperty('--g-tests', t.gTests);
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
    const valid = LIST.map(x => x.id);
    set(valid.includes(saved) ? saved : 'pearl');
  }

  return { set, render, init };
})();
