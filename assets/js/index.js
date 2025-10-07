/* assets/js/index.js */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('js');

    // 1) Nav activo según la ruta
    try {
      const path = location.pathname.split('/').pop() || 'index.html';
      $$('.topnav a').forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
        if (href === path) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    } catch {}

    // 2) Guardar último rol al hacer click en la sidebar
    try {
      const roleLinks = $$('.menu a[href$=".html"]');
      roleLinks.forEach(a => {
        a.addEventListener('click', () => {
          const url = new URL(a.href, location.href);
          const file = url.pathname.split('/').pop();
          const role = roleNameFromFile(file);
          localStorage.setItem('lastRole', role);
          localStorage.setItem('lastRoleFile', file);
          localStorage.setItem('lastVisitedAt', String(Date.now()));
        });
      });
    } catch {}

    // 3) En index: mostrar "Continue where you left off"
    try {
      const isIndex = (location.pathname.split('/').pop() || 'index.html') === 'index.html';
      if (isIndex) {
        const lastRole = localStorage.getItem('lastRole');
        const lastFile = localStorage.getItem('lastRoleFile');
        const ts = Number(localStorage.getItem('lastVisitedAt') || 0);

        if (lastRole && lastFile) {
          const rel = relativeTimeFromNow(ts);
          const card = document.createElement('section');
          card.className = 'card';
          card.innerHTML = `
            <h2>Continue where you left off</h2>
            <p>Last visited role: <strong>${escapeHtml(lastRole)}</strong>${rel ? ` · ${rel}` : ''}</p>
            <div class="toolbar">
              <a class="btn primary" href="${encodeURI(lastFile)}">Open ${escapeHtml(lastRole)}</a>
              <button class="btn" type="button" id="clear-last-role">Clear</button>
            </div>
          `;
          const hero = $('.hero') || $('.content');
          hero ? hero.insertAdjacentElement('afterend', card) : $('.content')?.appendChild(card);

          $('#clear-last-role', card)?.addEventListener('click', () => {
            localStorage.removeItem('lastRole');
            localStorage.removeItem('lastRoleFile');
            localStorage.removeItem('lastVisitedAt');
            card.remove();
          });
        }
      }
    } catch {}

    function roleNameFromFile(file) {
      const map = { 'producer.html': 'Producer', 'dj.html': 'DJ', 'manager.html': 'Manager', 'index.html': 'Home' };
      return map[file] || file.replace('.html','').replace(/[-_]/g,' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    function relativeTimeFromNow(ts) {
      if (!ts) return '';
      const diff = Date.now() - ts;
      const rtf = new Intl.RelativeTimeFormat(navigator.language || 'en', { numeric: 'auto' });
      const sec = Math.round(diff / 1000);
      if (sec < 60) return rtf.format(-sec, 'second');
      const min = Math.round(sec / 60);
      if (min < 60) return rtf.format(-min, 'minute');
      const hr = Math.round(min / 60);
      if (hr < 24) return rtf.format(-hr, 'hour');
      const day = Math.round(hr / 24);
      if (day < 30) return rtf.format(-day, 'day');
      const mo = Math.round(day / 30);
      if (mo < 12) return rtf.format(-mo, 'month');
      const yr = Math.round(mo / 12);
      return rtf.format(-yr, 'year');
    }

    function escapeHtml(str = '') {
      return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }
  });
})();
