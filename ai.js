// js/ai.js — AI chat module, all state private
'use strict';

const AI = (() => {
  const MODEL  = 'meta-llama/llama-3.3-70b-instruct:free';
  const SYSTEM = `You are Luminary AI — a smart, friendly SAT & IELTS tutor. Speak Russian unless user writes English. Be helpful, warm, concise.

You can: explain SAT/IELTS rules, generate vocabulary, check essays, answer study questions, publish words to Firebase.

When user asks to GENERATE/ADD words (дай, добавь, создай, generate, add words), output ONLY this block:

<WORDS_JSON>
[{"w":"Word","d":"Definition.","ant":"Antonym1, Antonym2","ex":"Example sentence."}]
</WORDS_JSON>

Rules: w and d required. Include ant and ex always. SAT/IELTS level definitions. Natural sentences. Output WORDS_JSON only when publishing words. Otherwise reply conversationally.`;

  const _s = { history: [], ready: false, sending: false };

  // ── Init ────────────────────────────────────────────────────
  function init() {
    if (_s.ready) return;
    _s.ready = true;
    loadFolders();
    _updateKeyBtn();
    const msgs = document.getElementById('ai-msgs');
    msgs.innerHTML = '';
    const hasKey = !!localStorage.getItem('luminary_ai_key');
    _bubble('bot', `👋 Привет! Я <b>Luminary AI</b> — твой персональный репетитор.<br><br>Я могу:<br>
      • Объяснять правила SAT и IELTS<br>
      • Создавать слова с антонимами и примерами<br>
      • Проверять твои эссе<br>
      • Добавлять слова в словарь<br><br>
      ${hasKey ? 'Всё готово! 🚀' : '⚠️ Добавь OpenRouter ключ — нажми <b>⚙️ добавить ключ</b> вверху.'}`);
  }

  async function loadFolders() {
    const type = document.getElementById('ai-type')?.value || 'sat';
    const snap = await Utils.fbGet(`${type}-folders`);
    const folders = snap.val()
      ? Object.entries(snap.val()).map(([k, v]) => ({ id: k, ...v })) : [];
    const sel = document.getElementById('ai-folder');
    if (sel) sel.innerHTML = `<option value="">Без публикации</option>` +
      folders.map(f => `<option value="${f.id}" data-name="${f.name}">${f.name}</option>`).join('');
  }

  // ── UI helpers ──────────────────────────────────────────────
  function _bubble(role, html) {
    const msgs = document.getElementById('ai-msgs');
    if (!msgs) return null;
    if (role === 'user') {
      const d = document.createElement('div');
      d.className = 'ai-bubble ai-user'; d.innerHTML = html;
      msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
      return d;
    }
    const row = document.createElement('div');
    row.className = 'ai-row';
    row.innerHTML = `<div class="ai-avatar">✦</div><div class="ai-bubble ai-bot">${html}</div>`;
    msgs.appendChild(row); msgs.scrollTop = msgs.scrollHeight;
    return row.querySelector('.ai-bot');
  }

  function _typing() {
    const msgs = document.getElementById('ai-msgs');
    const row  = document.createElement('div');
    row.className = 'ai-row'; row.id = 'ai-typing';
    row.innerHTML  = '<div class="ai-avatar">✦</div><div class="ai-bubble ai-bot"><div class="ai-dots"><span></span><span></span><span></span></div></div>';
    msgs.appendChild(row); msgs.scrollTop = msgs.scrollHeight;
  }

  function _removeTyping() { document.getElementById('ai-typing')?.remove(); }

  function resize(ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 110) + 'px'; }
  function keydown(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }

  function chip(txt) {
    const inp = document.getElementById('ai-input');
    if (!inp) return;
    inp.value = txt;
    resize(inp);
    if (!txt.endsWith(' ') && !txt.endsWith(': ')) send();
  }

  // ── API call ────────────────────────────────────────────────
  async function _callAPI(history) {
    const raw = localStorage.getItem('luminary_ai_key') || '';
    const key = raw.replace(/[^\x20-\x7E]/g, '').trim();
    if (!key) throw new Error('NO_KEY');

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key,
        'HTTP-Referer': location.href,
        'X-Title': 'Luminary AI',
      },
      body: JSON.stringify({
        model: MODEL, max_tokens: 2000, temperature: .75,
        messages: [{ role: 'system', content: SYSTEM }, ...history],
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    return data.choices?.[0]?.message?.content || '';
  }

  // ── Send ────────────────────────────────────────────────────
  async function send() {
    if (_s.sending) return;
    const inp   = document.getElementById('ai-input');
    const txt   = (inp?.value || '').trim();
    if (!txt) return;

    const fsel  = document.getElementById('ai-folder');
    const fid   = fsel?.value || '';
    const fname = fsel?.options[fsel.selectedIndex]?.getAttribute('data-name') || '';
    const vtype = document.getElementById('ai-type')?.value || 'sat';

    let existing = [];
    if (fid) {
      const snap = await Utils.fbGet(`${vtype}-words`);
      const d = snap.val() || {};
      existing = Object.values(d).filter(w => w.folder === fid).map(w => w.w);
    }

    inp.value = ''; inp.style.height = 'auto';
    _bubble('user', txt.replace(/</g, '&lt;').replace(/\n/g, '<br>'));
    _s.history.push({
      role: 'user',
      content: txt + (fid
        ? `\n\n[Context: ${vtype.toUpperCase()} folder "${fname}". Existing words (avoid dupes): ${existing.slice(0, 40).join(', ') || 'none'}]`
        : ''),
    });

    _s.sending = true;
    document.getElementById('ai-send').disabled = true;
    _typing();

    try {
      const full = await _callAPI(_s.history.slice(-16));
      _s.history.push({ role: 'assistant', content: full });
      _removeTyping();

      const jm = full.match(/<WORDS_JSON>([\s\S]*?)<\/WORDS_JSON>/);
      let words = [], display = full;
      if (jm) {
        try { words = JSON.parse(jm[1].trim()); } catch { words = []; }
        display = full.replace(/<WORDS_JSON>[\s\S]*?<\/WORDS_JSON>/, '').trim();
      }

      const fmt = (display || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>')
        .replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');

      const sw = encodeURIComponent(JSON.stringify(words));
      let html = fmt;
      if (words.length) {
        html += `<div class="ai-pub-card">
          <div class="ai-pub-title">📦 ${words.length} слов готово${fid ? ` → «${fname}»` : ''}</div>
          <div style="max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;margin-bottom:9px;">
            ${words.map(w => `<div class="ai-word-prev">
              <b>${w.w}</b> — ${w.d}
              ${w.ant ? `<div style="color:#1a85c8;font-size:12px;margin-top:2px;">↔ ${w.ant}</div>` : ''}
              ${w.ex  ? `<div style="color:#aaa;font-size:12px;font-style:italic;">"${w.ex}"</div>` : ''}
            </div>`).join('')}
          </div>
          ${fid
            ? `<button class="ai-pub-btn" onclick="AI.publish('${sw}','${fid}','${vtype}','${Utils.esc(fname)}',this)">
                ✅ Добавить ${words.length} слов в «${fname}»
               </button>`
            : `<div style="font-size:12px;color:#f59e0b;font-weight:700;">⚠️ Выбери папку чтобы опубликовать</div>`}
        </div>`;
      }
      _bubble('bot', html || '...');
    } catch (err) {
      _removeTyping();
      _bubble('bot', err.message === 'NO_KEY'
        ? `⚠️ Добавь <b>OpenRouter API ключ</b> — нажми кнопку вверху.<br>
           Регистрация через Google: <a href="https://openrouter.ai/keys" target="_blank" style="color:var(--acc);font-weight:700;">openrouter.ai/keys</a>`
        : `⚠️ Ошибка: ${err.message}`);
    }
    _s.sending = false;
    document.getElementById('ai-send').disabled = false;
  }

  // ── Publish words to Firebase ───────────────────────────────
  async function publish(enc, fid, type, fname, btn) {
    let words;
    try { words = JSON.parse(decodeURIComponent(enc)); } catch { return; }
    btn.disabled = true; btn.textContent = 'Публикуем...';
    let cnt = 0;
    for (const w of words) {
      if (!w.w || !w.d) continue;
      const payload = { w: w.w, d: w.d, folder: fid, folderName: fname };
      if (w.ant) payload.ant = w.ant;
      if (w.ex)  payload.ex  = w.ex;
      await Utils.fbPush(`${type}-words`, payload);
      cnt++;
    }
    btn.parentElement.innerHTML = `<div style="background:#dcfce7;border-radius:9px;padding:11px;text-align:center;font-weight:800;color:#166534;">✅ ${cnt} слов добавлено в «${fname}»!</div>`;
    _bubble('bot', `🎉 <b>${cnt} слов</b> теперь в папке «<b>${fname}</b>»!`);
    await Vocab.loadWords(type);
    Vocab.renderFolderCards(type);
  }

  // ── Key modal ───────────────────────────────────────────────
  function showKeyModal() {
    const ex = localStorage.getItem('luminary_ai_key') || '';
    const m  = document.createElement('div');
    m.id = 'key-modal';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
    m.innerHTML = `<div style="background:#fff;border-radius:22px;padding:28px;max-width:400px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3);">
      <div style="font-size:32px;text-align:center;margin-bottom:10px;">🤖</div>
      <div style="font-size:19px;font-weight:800;text-align:center;margin-bottom:6px;">OpenRouter API Key</div>
      <div style="font-size:13px;color:#777;text-align:center;margin-bottom:18px;line-height:1.7;">
        Бесплатно · Регистрация через Google<br>
        1. Зайди на <a href="https://openrouter.ai/keys" target="_blank" style="color:var(--acc);font-weight:700;">openrouter.ai/keys</a><br>
        2. Войди → <b>Create Key</b> → скопируй<br>
        3. Вставь сюда 👇
      </div>
      <input id="key-inp" type="password" placeholder="sk-or-v1-..." value="${ex}"
        style="width:100%;padding:13px 15px;border:2px solid rgba(0,0,0,.1);border-radius:11px;font-family:inherit;font-size:14px;margin-bottom:12px;box-sizing:border-box;outline:none;">
      <button onclick="AI.saveKey()" style="width:100%;background:var(--acc);color:#fff;border:none;padding:13px;border-radius:11px;font-family:inherit;font-size:15px;font-weight:800;cursor:pointer;">Сохранить</button>
      <button onclick="document.getElementById('key-modal').remove()"
        style="width:100%;background:none;border:2px solid rgba(0,0,0,.1);color:#aaa;padding:11px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;margin-top:9px;">Отмена</button>
    </div>`;
    document.body.appendChild(m);
    setTimeout(() => document.getElementById('key-inp')?.focus(), 80);
  }

  function saveKey() {
    const raw = document.getElementById('key-inp')?.value || '';
    const key = raw.replace(/[^\x20-\x7E]/g, '').trim();
    if (!key) { alert('Введи ключ!'); return; }
    localStorage.setItem('luminary_ai_key', key);
    document.getElementById('key-modal')?.remove();
    _updateKeyBtn();
    if (_s.ready) _bubble('bot', '✅ Ключ сохранён! Теперь я работаю 🚀');
  }

  function _updateKeyBtn() {
    const btn = document.getElementById('ai-keybtn');
    if (!btn) return;
    const has = !!localStorage.getItem('luminary_ai_key');
    btn.textContent    = has ? '⚡ ключ ✓' : '⚙️ добавить ключ';
    btn.style.background = has ? '#dcfce7' : '#fff3cd';
    btn.style.color      = has ? '#166534' : '#856404';
    btn.style.border     = 'none';
  }

  return { init, loadFolders, chip, send, publish, showKeyModal, saveKey, resize, keydown };
})();
