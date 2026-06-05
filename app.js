// js/app.js — bootstrap
'use strict';

window.addEventListener('fbReady', async () => {
  Themes.init();
  UserModule.init();

  await Promise.all([
    Vocab.init(),
    Edu.init(),
  ]);

  Tests.init();
  Podcasts.bindListener();
  Rules.bindListeners();

  Utils.fbListen('books', snap => {
    const d = snap.val();
    const books = d ? Object.entries(d).map(([k, v]) => ({ id: k, ...v })) : [];
    Reader.setBooks(books);
  });

  Nav.applyRoute();

  document.getElementById('ai-type')?.addEventListener('change', () => AI.loadFolders());
});
