// js/reader.js — book reader, self-contained
'use strict';

const Reader = (() => {
  const _s = { bookIdx: 0, pageIdx: 0, books: [] };

  function setBooks(books) { _s.books = books; }

  function open(idx) {
    _s.bookIdx = idx;
    _s.pageIdx = 0;
    document.getElementById('r-book').textContent = _s.books[idx].t;
    document.getElementById('reader').classList.add('active');
    _render();
  }

  function close() { document.getElementById('reader').classList.remove('active'); }

  function page(dir) {
    const b  = _s.books[_s.bookIdx];
    const np = _s.pageIdx + dir;
    if (np < 0 || np >= b.pages.length) return;
    _s.pageIdx = np;
    _render();
  }

  function _render() {
    const b   = _s.books[_s.bookIdx];
    const tot = b.pages.length;
    const cur = _s.pageIdx + 1;
    document.getElementById('r-content').textContent  = b.pages[_s.pageIdx] || '';
    document.getElementById('r-prog').style.width     = `${(cur / tot) * 100}%`;
    document.getElementById('r-prog-txt').textContent = `Page ${cur} of ${tot}`;

    let ch = 'Reading';
    (b.chapters || []).forEach(c => {
      if (_s.pageIdx >= c.startPage && _s.pageIdx <= c.endPage) ch = c.title;
    });
    document.getElementById('r-chapter').textContent = ch;
  }

  return { setBooks, open, close, page };
})();
