// js/nav.js — hash-based routing (works on GitHub Pages)
'use strict';

const Nav = (() => {
  const TAB_HASHES = {
    home:  '#/',
    edu:   '#/edu/',
    tests: '#/tests/',
    audio: '#/audio/',
    user:  '#/user/',
  };

  function go(name, updateHash = true) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(name + '-view').classList.add('active');
    document.getElementById('n-' + name).classList.add('active');
    if (name === 'edu' && updateHash) Edu.open('edu-main', false);
    if (name === 'tests' && updateHash) Tests.open('tests-main');
    if (updateHash) location.hash = TAB_HASHES[name] || '#/';
  }

  function _fromHash() {
    const h = location.hash.replace(/^#/, '') || '/';
    if (h === '/' || h === '')             return { tab: 'home' };
    if (h === '/audio/')                   return { tab: 'audio' };
    if (h === '/user/')                    return { tab: 'user' };
    if (h.startsWith('/tests/'))           return { tab: 'tests' };
    if (h === '/edu/')                     return { tab: 'edu', edu: 'edu-main' };
    if (h === '/edu/sat/')                 return { tab: 'edu', edu: 'edu-sat' };
    if (h === '/edu/sat/vocab/')           return { tab: 'edu', edu: 'edu-sat-vocab' };
    if (h === '/edu/sat/rules/')           return { tab: 'edu', edu: 'edu-sat-rules' };
    if (h === '/edu/sat/hacks/')           return { tab: 'edu', edu: 'edu-sat-hacks' };
    if (h === '/edu/sat/practice/')        return { tab: 'edu', edu: 'edu-sat-practice' };
    if (h === '/edu/sat/quizzes/')         return { tab: 'edu', edu: 'edu-sat-quizzes' };
    if (h === '/edu/ielts/')               return { tab: 'edu', edu: 'edu-ielts' };
    if (h === '/edu/ielts/vocab/')         return { tab: 'edu', edu: 'edu-ielts-vocab' };
    if (h.startsWith('/edu/sat/vocab/')) {
      const fid = decodeURIComponent(h.split('/')[4] || '');
      return { tab: 'edu', edu: 'edu-sat-vocab', folderType: 'sat', folderId: fid };
    }
    if (h.startsWith('/edu/ielts/vocab/')) {
      const fid = decodeURIComponent(h.split('/')[4] || '');
      return { tab: 'edu', edu: 'edu-ielts-vocab', folderType: 'ielts', folderId: fid };
    }
    return { tab: 'home' };
  }

  function applyRoute() {
    const route = _fromHash();
    go(route.tab, false);
    if (route.edu) Edu.open(route.edu, false);
    if (route.folderType && route.folderId) {
      const folders = Vocab.getFolders(route.folderType);
      const folder = folders.find(f => f.id === route.folderId);
      if (folder) Vocab.openFolderPage(folder.id, folder.name, route.folderType, false);
    }
  }

  window.addEventListener('hashchange', applyRoute);

  return { go, applyRoute };
})();
