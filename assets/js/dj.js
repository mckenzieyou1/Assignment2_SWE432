// assets/js/dj.js
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const els = {
    status: $('#status'),
    queueBody: $('#queue .table tbody'),
    selectForm: $('#select form'),
    slotDate: $('#slot-date'),
    slotTime: $('#slot-time'),
    pselect: $('#pselect'),
    quickForm: $('#quick form'),
    quickInput: $('#q'),
    notesForm: $('#notes form'),
    notesText: $('#notes-text'),
  };

  function getSlot() {
    const d = (els.slotDate?.value || '').trim();
    const t = (els.slotTime?.value || '').trim();
    if (!d || !t) return '';
    return `${d}T${t}`;
  }

  function storageKey() {
    const slot = getSlot();
    const list = (els.pselect?.value || '').trim();
    if (!slot || !list) return null;
    return `djQueue:${list}:${slot}`;
  }
  function notesKey() {
    const slot = getSlot();
    const list = (els.pselect?.value || '').trim();
    if (!slot || !list) return 'djNotes';
    return `djNotes:${list}:${slot}`;
  }
  const ASSIGN_KEY = 'djAssignment:last';

  const say = (msg) => { if (els.status) els.status.textContent = msg; };
  const clamp = (n, a, b) => Math.min(Math.max(n, a), b);

  function parseDuration(str) {
    const m = String(str || '').match(/(\d{1,2}):(\d{2})/);
    if (!m) return 180;
    const mm = parseInt(m[1], 10);
    const ss = parseInt(m[2], 10);
    return clamp(mm, 0, 99) * 60 + clamp(ss, 0, 59);
  }
  function fmt(ms) {
    const m = Math.floor(ms / 60);
    const s = ms % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function renumber() {
    $$('#queue .table tbody tr').forEach((tr, i, arr) => {
      const idxCell = tr.children[0];
      if (idxCell) idxCell.textContent = String(i + 1);
      const upBtn = tr.querySelector('button:nth-of-type(1)');
      const midBtn = tr.querySelector('button:nth-of-type(2)');
      const isFirst = i === 0;
      const isLast = i === arr.length - 1;
      if (upBtn) upBtn.disabled = isFirst;
      if (midBtn && midBtn.textContent.toLowerCase().includes('down')) midBtn.disabled = isLast;
    });
  }

  function serializeQueue() {
    return $$('#queue .table tbody tr').map(tr => {
      const title = tr.children[1]?.textContent.trim() || '';
      const durCell = tr.children[2];
      const original = durCell?.dataset?.original || durCell?.textContent.trim() || '03:00';
      return { title, dur: original };
    });
  }

  function saveQueue() {
    const key = storageKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(serializeQueue()));
  }

  function loadQueueOrKeep() {
    const key = storageKey();
    if (!key) return false;
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr) || !els.queueBody) return false;
      els.queueBody.innerHTML = '';
      arr.forEach(item => {
        els.queueBody.appendChild(makeRow(item.title, item.dur));
      });
      renumber();
      saveQueue();
      return true;
    } catch { return false; }
  }

  function makeRow(title, dur = '03:00') {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td></td>
      <td>${escapeHtml(title || 'Untitled')}</td>
      <td data-original="${escapeHtml(dur)}">${escapeHtml(dur)}</td>
      <td class="actions">
        <div class="toolbar">
          <button class="btn small" type="button">Move up</button>
          <button class="btn small" type="button">Move down</button>
          <button class="btn small danger" type="button">Remove</button>
        </div>
      </td>
    `;
    return tr;
  }

  function escapeHtml(str = '') {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function onQueueClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const tr = e.target.closest('tr');
    if (!tr) return;
    const text = btn.textContent.toLowerCase();
    if (text.includes('move up')) {
      const prev = tr.previousElementSibling;
      if (prev) tr.parentNode.insertBefore(tr, prev);
      renumber(); saveQueue(); setNowPlayingIfFirstChanged();
    } else if (text.includes('move down')) {
      const next = tr.nextElementSibling;
      if (next) tr.parentNode.insertBefore(next, tr);
      renumber(); saveQueue(); setNowPlayingIfFirstChanged();
    } else if (text.includes('remove')) {
      const wasFirst = tr === els.queueBody.firstElementChild;
      tr.remove();
      renumber(); saveQueue();
      if (wasFirst) setNowPlaying();
    }
  }

  function parseQuickInput(val) {
    let title = val.trim();
    let dur = '03:00';
    const durMatch = title.match(/(\d{1,2}:\d{2})$/);
    if (durMatch) {
      dur = durMatch[1];
      title = title.replace(durMatch[0], '').replace(/[–—-]+$/,'').trim();
    }
    if (/^#\d+$/.test(title)) title = `Track ${title}`;
    return { title: title || 'Untitled', dur };
  }

  function onQuickSubmit(e) {
    e.preventDefault();
    if (!els.quickInput) return;
    const { submitter } = e;
    const pos = submitter?.value || 'bottom';
    const { title, dur } = parseQuickInput(els.quickInput.value);
    const tr = makeRow(title, dur);
    if (!els.queueBody) return;
    if (pos === 'top') {
      els.queueBody.insertBefore(tr, els.queueBody.firstChild);
      setNowPlaying();
    } else {
      els.queueBody.appendChild(tr);
    }
    els.quickInput.value = '';
    renumber(); saveQueue();
    say(`Added "${title}" to ${pos}.`);
  }

  function loadNotes() {
    const key = notesKey();
    const val = localStorage.getItem(key || 'djNotes');
    if (els.notesText && val) els.notesText.value = val;
  }
  function onNotesSubmit(e) {
    e.preventDefault();
    const key = notesKey();
    if (!key) return;
    localStorage.setItem(key, els.notesText?.value || '');
    say('Notes saved.');
  }

  function onSelectSubmit(e) {
    e.preventDefault();
    const list = els.pselect?.value?.trim();
    const slot = getSlot();
    if (!list || !slot) {
      say('Please select a playlist, date and time.');
      return;
    }
    localStorage.setItem(ASSIGN_KEY, JSON.stringify({ list, slot, ts: Date.now() }));
    say(`Loaded playlist "${list}" for ${slot}`);
    localStorage.setItem('lastRole', 'DJ');
    localStorage.setItem('lastRoleFile', 'dj.html');
    localStorage.setItem('lastVisitedAt', String(Date.now()));
    if (!loadQueueOrKeep()) {
      renumber();
      saveQueue();
    }
    setNowPlaying(true);
    startCountdown();
    loadNotes();
  }

  let timer = null;
  function clearTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function setNowPlaying(announce = false) {
    if (!els.queueBody) return;
    $$('#queue .table tbody tr').forEach(tr => {
      tr.removeAttribute('aria-current');
      const durCell = tr.children[2];
      if (durCell && durCell.dataset.original) {
        durCell.textContent = durCell.dataset.original;
      }
    });
    const first = els.queueBody.firstElementChild;
    if (!first) { clearTimer(); say('Queue is empty.'); return; }
    first.setAttribute('aria-current', 'row');
    const title = first.children[1]?.textContent.trim();
    if (announce) say(`Now playing: ${title}`);
  }

  function setNowPlayingIfFirstChanged() {
    const first = els.queueBody?.firstElementChild;
    if (!first) return setNowPlaying();
    if (!first.hasAttribute('aria-current')) setNowPlaying(true);
  }

  function startCountdown() {
    clearTimer();
    const first = els.queueBody?.firstElementChild;
    if (!first) return;
    const durCell = first.children[2];
    const original = durCell?.dataset.original || durCell?.textContent.trim() || '03:00';
    const title = first.children[1]?.textContent.trim();
    let remaining = parseDuration(original);
    tick();
    timer = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearTimer();
        advanceToNext();
        return;
      }
      tick();
    }, 1000);
    function tick() {
      if (durCell) durCell.textContent = `${original} • ${fmt(remaining)}`;
      if (remaining % 5 === 0) say(`Playing "${title}" — ${fmt(remaining)} left`);
    }
  }

  function advanceToNext() {
    const first = els.queueBody?.firstElementChild;
    if (!first) return;
    const title = first.children[1]?.textContent.trim();
    els.queueBody.appendChild(first);
    renumber(); saveQueue();
    say(`Finished "${title}". Next…`);
    setNowPlaying(true);
    startCountdown();
  }

  document.addEventListener('DOMContentLoaded', () => {
    try {
      localStorage.setItem('lastRole', 'DJ');
      localStorage.setItem('lastRoleFile', 'dj.html');
      localStorage.setItem('lastVisitedAt', String(Date.now()));
    } catch {}
    els.queueBody?.addEventListener('click', onQueueClick);
    els.quickForm?.addEventListener('submit', onQuickSubmit);
    els.notesForm?.addEventListener('submit', onNotesSubmit);
    els.selectForm?.addEventListener('submit', onSelectSubmit);
    const last = localStorage.getItem(ASSIGN_KEY);
    if (last) {
      try {
        const { list, slot } = JSON.parse(last);
        if (els.pselect) {
          const opt = [...els.pselect.options].find(o => o.value === list);
          if (opt) els.pselect.value = list;
        }
        if (slot) {
          const [d, t] = String(slot).split('T');
          if (els.slotDate) els.slotDate.value = d || '';
          if (els.slotTime) els.slotTime.value = (t || '').slice(0,5);
        }
      } catch {}
    }
    renumber();
    setNowPlaying();
  });
})();
