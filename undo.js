// js/undo.js — undo toast, no dependencies
'use strict';

const Undo = (() => {
  let _state = null;
  let _timer = null;

  function show(msg, onUndo) {
    if (_timer) clearTimeout(_timer);
    _state = { onUndo };
    document.getElementById('undo-msg').textContent = msg;
    document.getElementById('undo-toast').classList.add('show');
    _timer = setTimeout(() => {
      document.getElementById('undo-toast').classList.remove('show');
      _state = null;
    }, 5000);
  }

  function do_() {
    if (!_state) return;
    clearTimeout(_timer);
    document.getElementById('undo-toast').classList.remove('show');
    _state.onUndo();
    _state = null;
  }

  return { show, do: do_ };
})();
