'use strict';

/* Carduri cu repetiție spațiată (cutii Leitner): corect → revine mai târziu; greșit → o iei de la capăt. */
const INTERVALE = [0, 1, 3, 7, 21, 45]; // zile, pe cutia 0..5
const ZI = 86400000;
let coada = [], curent = null, arataSpate = false;

const carduri = () => citeste('bin.carduri', []);
const salveazaCarduri = c => scrie('bin.carduri', c);
const inceputZi = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
const scadente = () => carduri().filter(c => c.due <= Date.now());

function deseneazaCarduri() {
  const toate = carduri(), sc = scadente();
  $('cinfo').textContent = toate.length
    ? `${toate.length} carduri · ${sc.length} de repetat acum`
    : 'Nu ai încă carduri. Adaugă primul mai jos.';
  $('crev').hidden = !sc.length || !!curent;
  $('clist').innerHTML = toate.slice().reverse().map(c =>
    `<li><span>${esc(c.f)} → ${esc(c.b)}</span><button data-id="${c.id}" aria-label="Șterge">✕</button></li>`).join('');
  $('clist').querySelectorAll('button').forEach(b => {
    b.onclick = () => { salveazaCarduri(carduri().filter(c => c.id !== +b.dataset.id)); deseneazaCarduri(); };
  });
}

function urmatorul() {
  curent = coada.shift() || null;
  arataSpate = false;
  $('cplay').hidden = !curent;
  if (!curent) { deseneazaCarduri(); $('cinfo').textContent += ' · Gata pe azi 👏'; return; }
  $('cfata').textContent = curent.f;
  cueCard();
  $('cspate').textContent = '';
  $('cshow').hidden = false; $('cans').hidden = true;
  $('crev').hidden = true;
}

function raspuns(stiu) {
  const toate = carduri(), c = toate.find(x => x.id === curent.id);
  if (c) {
    if (stiu) { c.box = Math.min(5, c.box + 1); c.due = inceputZi() + INTERVALE[c.box] * ZI; }
    else { c.box = 0; c.due = Date.now() + 10 * 60000; }
    salveazaCarduri(toate);
  }
  if (!stiu) coada.push(curent);
  urmatorul();
}

$('crev').onclick = () => { coada = scadente().sort(() => Math.random() - 0.5); urmatorul(); };
$('cshow').onclick = () => { $('cspate').textContent = curent.b; $('cshow').hidden = true; $('cans').hidden = false; };
$('cyes').onclick = () => raspuns(true);
$('cno').onclick = () => raspuns(false);
$('cstop').onclick = () => { coada = []; curent = null; $('cplay').hidden = true; deseneazaCarduri(); };
$('cadd').onclick = () => {
  const f = $('cf').value.trim(), b = $('cb').value.trim();
  if (!f || !b) return;
  const c = carduri();
  c.push({ id: Date.now(), f, b, box: 0, due: 0 });
  salveazaCarduri(c);
  $('cf').value = ''; $('cb').value = ''; $('cf').focus();
  deseneazaCarduri();
};
