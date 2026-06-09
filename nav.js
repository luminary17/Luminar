// js/nav.js — hash-based routing (works on GitHub Pages)
'use strict';

const Nav = (() => {
  const HASHES = {
    'home':        '#/',
    'edu-sat':     '#/edu/sat/',
    'edu-ielts':   '#/edu/ielts/',
    'tests-sat':   '#/tests/sat/',
    'tests-ielts': '#/tests/ielts/',
    'audio':       '#/audio/',
    'user':        '#/user/',
    'edu':         '#/edu/',
    'tests':       '#/tests/',
  };

  const BTN_MAP = {
    'home':        'n-home',
    'edu':         'n-sat-prep',
    'tests':       'n-sat-mocks',
    'edu-sat':     'n-sat-prep',
    'edu-ielts':   'n-ielts-prep',
    'tests-sat':   'n-sat-mocks',
    'tests-ielts': 'n-ielts-mocks',
    'audio':       'n-audio',
    'user':        'n-user',
  };

  function _activateBtn(key) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const id = BTN_MAP[key];
    if (id) document.getElementById(id)?.classList.add('active');
  }

  // Legacy go() — kept for internal calls
  function go(name, updateHash = true) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(name + '-view')?.classList.add('active');
    _activateBtn(name);
    if (updateHash) location.hash = HASHES[name] || '#/';
  }

  // Navigate to a sub-section directly
  function goSub(btnKey, view, subId, updateHash = true) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(view + '-view')?.classList.add('active');
    _activateBtn(btnKey);
    if (view === 'edu')   Edu.open(subId, false);
    if (view === 'tests') Tests.open(subId);
    if (updateHash) location.hash = HASHES[btnKey] || HASHES[view] || '#/';
  }

  function _fromHash() {
    const h = location.hash.replace(/^#/, '') || '/';
    if (h === '/' || h === '')               return { view: 'home',  btn: 'home' };
    if (h === '/audio/')                     return { view: 'audio', btn: 'audio' };
    if (h === '/user/')                      return { view: 'user',  btn: 'user' };
    if (h === '/edu/sat/' || h === '/edu/')  return { view: 'edu',   btn: 'edu-sat',    edu: 'edu-sat' };
    if (h === '/edu/ielts/')                 return { view: 'edu',   btn: 'edu-ielts',  edu: 'edu-ielts' };
    if (h === '/tests/sat/' || h === '/tests/') return { view: 'tests', btn: 'tests-sat',   tests: 'tests-sat' };
    if (h === '/tests/ielts/')               return { view: 'tests', btn: 'tests-ielts', tests: 'tests-ielts' };
    if (h === '/edu/sat/vocab/')   return { view: 'edu', btn: 'edu-sat', edu: 'edu-sat-vocab' };
    if (h === '/edu/sat/rules/')   return { view: 'edu', btn: 'edu-sat', edu: 'edu-sat-rules' };
    if (h === '/edu/sat/hacks/')   return { view: 'edu', btn: 'edu-sat', edu: 'edu-sat-hacks' };
    if (h === '/edu/sat/practice/')return { view: 'edu', btn: 'edu-sat', edu: 'edu-sat-practice' };
    if (h === '/edu/sat/quizzes/') return { view: 'edu', btn: 'edu-sat', edu: 'edu-sat-quizzes' };
    if (h === '/edu/sat/qbank/')   return { view: 'edu', btn: 'edu-sat', edu: 'edu-sat-qbank' };
    if (h === '/edu/ielts/vocab/') return { view: 'edu', btn: 'edu-ielts', edu: 'edu-ielts-vocab' };
    if (h.startsWith('/edu/sat/vocab/')) {
      const fid = decodeURIComponent(h.split('/')[4] || '');
      return { view: 'edu', btn: 'edu-sat', edu: 'edu-sat-vocab', folderType: 'sat', folderId: fid };
    }
    if (h.startsWith('/edu/ielts/vocab/')) {
      const fid = decodeURIComponent(h.split('/')[4] || '');
      return { view: 'edu', btn: 'edu-ielts', edu: 'edu-ielts-vocab', folderType: 'ielts', folderId: fid };
    }
    return { view: 'home', btn: 'home' };
  }

  function applyRoute() {
    const r = _fromHash();
    go(r.view, false);
    _activateBtn(r.btn);
    if (r.edu)   Edu.open(r.edu, false);
    if (r.tests) Tests.open(r.tests);
    if (r.folderType && r.folderId) {
      const folders = Vocab.getFolders(r.folderType);
      const folder  = folders.find(f => f.id === r.folderId);
      if (folder) Vocab.openFolderPage(folder.id, folder.name, r.folderType, false);
    }
  }

  window.addEventListener('hashchange', applyRoute);

  return { go, goSub, applyRoute };
})();
