// js/user.js — user notes and profile tab
'use strict';

const UserModule = (() => {
  function saveNotes() {
    localStorage.setItem('notes', document.getElementById('notes').value);
  }

  function init() {
    document.getElementById('notes').value = localStorage.getItem('notes') || '';
  }

  return { saveNotes, init };
})();
