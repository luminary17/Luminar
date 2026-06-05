// js/rules.js — SAT rules page rendering
'use strict';

const Rules = (() => {
  function render(items, folderQuizzes = {}) {
    const el = document.getElementById('sat-rules-content');
    if (!el) return;

    if (!items.length) {
      el.innerHTML = '<div style="text-align:center;padding:48px;color:#bbb;font-size:15px;">No rules yet</div>';
      return;
    }

    const quizItems = items.filter(it => it.quiz?.q);
    const grouped   = {};
    items.forEach(it => {
      const fn = it.folderName || 'General';
      if (!grouped[fn]) grouped[fn] = [];
      grouped[fn].push(it);
    });

    const qdataStr = JSON.stringify(quizItems).replace(/"/g, '&quot;');
    let n = 1;
    let html = `<div class="rules-wrap">
      <div class="rules-main-title">SAT Grammar &amp; Punctuation Rules</div>
      <div class="rules-sub">Master the rules. Ace the test. · ${items.length} rules</div>
      ${quizItems.length
        ? `<button class="rule-practice-btn" onclick='Quiz.start(${qdataStr},"Rules Practice","mc")'>
            ✏️ Practice All Questions <span class="rule-cnt">${quizItems.length} Qs</span>
           </button>`
        : ''}`;

    for (const [sec, its] of Object.entries(grouped)) {
      const fid = its[0]?.folder || '';
      const fq  = fid && folderQuizzes[fid] ? folderQuizzes[fid] : null;
      const fqData = fq ? JSON.stringify(fq.questions).replace(/"/g, '&quot;') : '';

      html += `<div class="rule-sec-header">
        <div class="rule-sec-title">${sec}</div>
        ${fq
          ? `<button class="rule-folder-quiz-btn"
              onclick='Quiz.start(${fqData},"${Utils.esc(fq.name)}","mc")'>
              🧩 ${fq.name} <span style="opacity:.7;font-size:10px;">(${fq.questions.length})</span>
             </button>`
          : ''}
      </div>`;

      for (const it of its) {
        html += `<div class="rule-block">
          <div style="display:flex;align-items:baseline;gap:3px;margin-bottom:12px;">
            <span class="rule-num">${n++}.&nbsp;</span>
            <span class="rule-stmt">${it.title}</span>
          </div>`;

        if (it.body) {
          it.body.split('\n').filter(p => p.trim()).forEach(p => {
            const t = p.trim();
            if      (t.startsWith('✅') || t.startsWith('☑'))  html += `<div class="rule-body rule-ok">${t.replace(/^[✅☑]\s*/u, '')}</div>`;
            else if (t.startsWith('❌') || t.startsWith('✗'))   html += `<div class="rule-body rule-bad">${t.replace(/^[❌✗]\s*/u, '')}</div>`;
            else if (t.startsWith('•') || t.startsWith('-') || t.startsWith('–')) html += `<div class="rule-body rule-bullet">${t.replace(/^[-–•]\s*/u, '')}</div>`;
            else html += `<div class="rule-body">${t}</div>`;
          });
        }

        if (it.quiz?.q) html += `<div class="rule-quiz-badge">🧠 Practice question</div>`;
        html += `</div>`;
      }
    }

    html += '</div>';
    el.innerHTML = html;
  }

  function bindListeners() {
    Utils.fbListen('rules-items', async snap => {
      const d = snap.val();
      const items = d ? Object.entries(d).map(([k, v]) => ({ id: k, ...v })) : [];
      const fqSnap = await Utils.fbGet('rules-folder-quizzes');
      render(items, fqSnap.val() || {});
    });

    Utils.fbListen('rules-folder-quizzes', async snap => {
      const fqs = snap.val() || {};
      const iSnap = await Utils.fbGet('rules-items');
      const d = iSnap.val();
      const items = d ? Object.entries(d).map(([k, v]) => ({ id: k, ...v })) : [];
      render(items, fqs);
    });
  }

  return { render, bindListeners };
})();
