// js/utils.js — shared helpers, no dependencies
'use strict';

const Utils = (() => {
  const _debTimers = {};

  function debounce(key, fn, ms = 300) {
    clearTimeout(_debTimers[key]);
    _debTimers[key] = setTimeout(fn, ms);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Safe HTML escape for attribute values
  function esc(s) {
    return (s || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  // FB shorthand — always call after fbReady
  function fb() { return window.fb; }

  async function fbGet(path) {
    const { db, ref, get } = fb();
    return get(ref(db, path));
  }

  async function fbSet(path, data) {
    const { db, ref, set } = fb();
    return set(ref(db, path), data);
  }

  async function fbPush(path, data) {
    const { db, ref, push, set } = fb();
    const r = push(ref(db, path));
    await set(r, data);
    return r.key;
  }

  async function fbRemove(path) {
    const { db, ref, remove } = fb();
    return remove(ref(db, path));
  }

  function fbListen(path, cb) {
    const { db, ref, onValue } = fb();
    return onValue(ref(db, path), cb);
  }

  return { debounce, shuffle, esc, fbGet, fbSet, fbPush, fbRemove, fbListen };
})();
