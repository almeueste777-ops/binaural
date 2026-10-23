'use strict';

const $ = id => document.getElementById(id);

function banda(hz) {
  if (hz < 4) return 'Delta · somn adânc';
  if (hz < 8) return 'Theta · reverie, meditație';
  if (hz < 13) return 'Alpha · calm treaz';
  if (hz < 30) return 'Beta · concentrare';
  return 'Gamma';
}

function fmt(s) {
  s = Math.max(0, Math.round(s));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function citeste(k, def) {
  try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (_) { return def; }
}
function scrie(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------- file (tab-uri) ---------- */
function arataTab(nume) {
  document.querySelectorAll('.tab').forEach(t => { t.hidden = t.id !== 'tab-' + nume; });
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('sel', b.dataset.tab === nume));
  scrie('bin.tab', nume);
  if (nume === 'jurnal' && window.deseneazaJurnal) deseneazaJurnal();
  if (nume === 'carduri' && window.deseneazaCarduri) deseneazaCarduri();
}
document.querySelectorAll('nav button').forEach(b => { b.onclick = () => arataTab(b.dataset.tab); });

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
