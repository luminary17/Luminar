// js/nav.js — tab navigation and URL routing
'use strict';

const Nav = (() => {
  const TAB_PATHS = {
    home:  '/',
    edu:   '/edu/',
    audio: '/audio/',
    ai:    '/ai/',
    user:  '/user/',
  };

  function go(name, push = true) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(name + '-view').classList.add('active');
    document.getElementById('n-' + name).classList.add('active');
    if (name === 'edu' && push) Edu.open('edu-main', false);
    if (name === 'ai') AI.init();
    if (push) _push(TAB_PATHS[name] || '/');
  }

  function _push(path) {
    if (location.pathname !== path) history.pushState({}, '', path);
  }

  function _fromPath() {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/')                       return { tab: 'home' };
    if (path === '/audio')                  return { tab: 'audio' };
    if (path === '/ai')                     return { tab: 'ai' };
    if (path === '/user')                   return { tab: 'user' };
    if (path === '/edu')                    return { tab: 'edu', edu: 'edu-main' };
    if (path === '/edu/sat')                return { tab: 'edu', edu: 'edu-sat' };
    if (path === '/edu/sat/vocab')          return { tab: 'edu', edu: 'edu-sat-vocab' };
    if (path === '/edu/sat/rules')          return { tab: 'edu', edu: 'edu-sat-rules' };
    if (path === '/edu/sat/hacks')          return { tab: 'edu', edu: 'edu-sat-hacks' };
    if (path === '/edu/sat/practice')       return { tab: 'edu', edu: 'edu-sat-practice' };
    if (path === '/edu/sat/quizzes')        return { tab: 'edu', edu: 'edu-sat-quizzes' };
    if (path === '/edu/ielts')              return { tab: 'edu', edu: 'edu-ielts' };
    if (path === '/edu/ielts/vocab')        return { tab: 'edu', edu: 'edu-ielts-vocab' };
    if (path.startsWith('/edu/sat/vocab/')) {
      const fid = decodeURIComponent(path.split('/')[4] || '');
      return { tab: 'edu', edu: 'edu-sat-vocab', folderType: 'sat', folderId: fid };
    }
    if (path.startsWith('/edu/ielts/vocab/')) {
      const fid = decodeURIComponent(path.split('/')[4] || '');
      return { tab: 'edu', edu: 'edu-ielts-vocab', folderType: 'ielts', folderId: fid };
    }
    return { tab: 'home' };
  }

  function applyRoute() {
    const route = _fromPath();
    go(route.tab, false);
    if (route.edu) Edu.open(route.edu, false);
    if (route.folderType && route.folderId) {
      const folders = Vocab.getFolders(route.folderType);
      const folder = folders.find(f => f.id === route.folderId);
      if (folder) Vocab.openFolderPage(folder.id, folder.name, route.folderType, false);
    }
  }

  window.addEventListener('popstate', applyRoute);

  return { go, applyRoute };
})();
