'use strict';

/* Jurnal: notezi cum te simți înainte și după fiecare ședință și vezi ce te ajută pe tine. */
let sesiune = null; // ședința curentă: {nume, min, inainte, t}

function cere(titlu) { // -> {f, c} | null (sari) | undefined (anulează)
  return new Promise(res => {
    const d = $('rate');
    $('rateTitle').textContent = titlu;
    $('rf').value = 5; $('rc').value = 5;
    $('rfv').textContent = 5; $('rcv').textContent = 5;
    const inchide = v => { d.close(); res(v); };
    $('rateOk').onclick = () => inchide({ f: +$('rf').value, c: +$('rc').value });
    $('rateSkip').onclick = () => inchide(null);
    $('rateCancel').onclick = () => inchide(undefined);
    d.oncancel = () => res(undefined);
    d.showModal();
  });
}
$('rf').oninput = () => { $('rfv').textContent = $('rf').value; };
$('rc').oninput = () => { $('rcv').textContent = $('rc').value; };

async function inceputSesiune(nume, min) {
  let inainte = null;
  if ($('jon').checked) {
    inainte = await cere('Cum te simți ACUM, înainte de ședință?');
    if (inainte === undefined) return false;
  }
  sesiune = { nume, min, inainte, t: Date.now() };
  return true;
}

async function sfarsitSesiune() {
  const s = sesiune; sesiune = null;
  if (!s || !s.inainte) return;
  const dupa = await cere('Cum te simți ACUM, după ședință?');
  if (!dupa) return;
  const j = citeste('bin.jurnal', []);
  j.push({ t: s.t, nume: s.nume, min: s.min, fi: s.inainte.f, ci: s.inainte.c, fa: dupa.f, ca: dupa.c });
  scrie('bin.jurnal', j);
}

$('jon').checked = citeste('bin.jon', true);
$('jon').onchange = () => scrie('bin.jon', $('jon').checked);

function sgn(x) { return (x > 0 ? '+' : '') + x.toFixed(1).replace('.', ','); }

function deseneazaJurnal() {
  const j = citeste('bin.jurnal', []);
  const g = {};
  j.forEach(e => {
    const a = g[e.nume] || (g[e.nume] = { n: 0, df: 0, dc: 0 });
    a.n++; a.df += e.fa - e.fi; a.dc += e.ca - e.ci;
  });
  const nume = Object.keys(g);
  let h = '';
  if (!nume.length) {
    h = '<p>Încă nu ai ședințe notate. Bifează „Întreabă-mă înainte și după” și fă o ședință.</p>';
  } else {
    h = '<table><tr><th>Program</th><th>Ședințe</th><th>Concentrare</th><th>Calm</th></tr>';
    nume.sort((a, b) => g[b].df + g[b].dc - g[a].df - g[a].dc).forEach(k => {
      const a = g[k], df = a.df / a.n, dc = a.dc / a.n;
      h += `<tr><td>${esc(k)}</td><td>${a.n}</td><td class="${df > 0 ? 'pos' : df < 0 ? 'neg' : ''}">${sgn(df)}</td><td class="${dc > 0 ? 'pos' : dc < 0 ? 'neg' : ''}">${sgn(dc)}</td></tr>`;
    });
    h += '</table><p class="mic">Media schimbării (după − înainte), scara 1–10. Cu puține ședințe, diferențele pot fi întâmplare.</p>';
  }
  $('jstat').innerHTML = h;
  const ultimele = j.slice(-10).reverse();
  $('jlist').innerHTML = ultimele.map(e => {
    const z = new Date(e.t).toLocaleString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    return `<li>${z} · ${esc(e.nume)} (${e.min} min) — concentrare ${e.fi}→${e.fa}, calm ${e.ci}→${e.ca}</li>`;
  }).join('');
}

/* ---------- copie de siguranță ---------- */
$('bkShow').onclick = () => {
  $('bkText').value = JSON.stringify({
    jurnal: citeste('bin.jurnal', []), carduri: citeste('bin.carduri', []), sugestii: citeste('bin.sugestii', ''),
  });
  $('bkText').select();
};
$('bkLoad').onclick = () => {
  try {
    const d = JSON.parse($('bkText').value);
    if (Array.isArray(d.jurnal)) scrie('bin.jurnal', d.jurnal);
    if (Array.isArray(d.carduri)) scrie('bin.carduri', d.carduri);
    if (typeof d.sugestii === 'string') { scrie('bin.sugestii', d.sugestii); $('sug').value = d.sugestii; }
    deseneazaJurnal(); if (window.deseneazaCarduri) deseneazaCarduri();
    $('bkText').value = 'Restaurat.';
  } catch (_) { $('bkText').value = 'Textul nu e o copie de siguranță validă.'; }
};
