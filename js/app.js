// js/app.js — bootstrap: all modules are loaded before this runs
'use strict';

// Modules load order in HTML:
//   utils → undo → themes → nav → vocab → duo → quiz
//   → reader → photos → podcasts → rules → ai → edu → user → app
//
// app.js fires LAST, so every module is defined when we call them.

window.addEventListener('fbReady', async () => {
  // 1. Themes + user prefs (no async needed)
  Themes.init();
  UserModule.init();

  // 2. Load all data in parallel
  await Promise.all([
    Vocab.init(),
    Edu.init(),
  ]);

  // 3. Bind Firebase realtime listeners
  Podcasts.bindListener();
  Rules.bindListeners();

  // 4. Books realtime listener → reader
  Utils.fbListen('books', snap => {
    const d = snap.val();
    const books = d ? Object.entries(d).map(([k, v]) => ({ id: k, ...v })) : [];
    Reader.setBooks(books);
  });

  // 5. Resolve URL route AFTER data is ready
  Nav.applyRoute();

  // 6. Defer AI folder load slightly (non-critical path)
  setTimeout(() => AI.loadFolders(), 600);
  document.getElementById('ai-type')?.addEventListener('change', () => AI.loadFolders());
});
