'use strict';

/* =====================================================================
   1. LUMINĂ SINCRONIZATĂ CU UNDELE (pe ecran, cu ochii închiși)
   Lumina pulsează la aceeași frecvență ca bătaia sunetului. Acesta e un risc real pentru persoanele
   fotosensibile (epilepsie, migrene), de aceea se pornește doar după o confirmare explicită.
   ===================================================================== */
const LUMA = { ok: citeste('bin.lumaOk', false), on: citeste('bin.luma', false), inten: citeste('bin.lumaI', 35), cul: citeste('bin.lumaC', 'rosu') };
const CULORI = { rosu: '#ff2a1a', ambra: '#ffa11a', albastru: '#2a5cff', alb: '#ffffff' };
const LUMA_MAX_HZ = 30; // peste ~30 Hz un ecran de 60 Hz nu mai poate reda clipirea corect

const lumaEl = document.createElement('div');
lumaEl.id = 'luma';
lumaEl.hidden = true;
lumaEl.innerHTML = '<span>Atinge ecranul ca să oprești lumina</span>';
document.body.appendChild(lumaEl);

function lumaSalveaza() {
  scrie('bin.luma', LUMA.on); scrie('bin.lumaI', LUMA.inten); scrie('bin.lumaC', LUMA.cul); scrie('bin.lumaOk', LUMA.ok);
  document.querySelectorAll('.lumachk').forEach(c => { c.checked = LUMA.on; });
  if (LUMA.on) $('wake').checked = true; // ecranul trebuie să rămână aprins ca lumina să se vadă
}

function opresteLumina() {
  LUMA.on = false; lumaSalveaza();
  lumaEl.hidden = true;
}
lumaEl.addEventListener('pointerdown', opresteLumina);

document.querySelectorAll('.lumachk').forEach(c => {
  c.checked = LUMA.on;
  c.onchange = () => {
    if (!c.checked) { opresteLumina(); return; }
    if (LUMA.ok) { LUMA.on = true; lumaSalveaza(); return; }
    c.checked = false;
    $('lumaOk').checked = false; $('lumaYes').disabled = true;
    $('lumaDlg').showModal();
  };
});
$('lumaOk').onchange = () => { $('lumaYes').disabled = !$('lumaOk').checked; };
$('lumaNo').onclick = () => $('lumaDlg').close();
$('lumaYes').onclick = () => { LUMA.ok = true; LUMA.on = true; lumaSalveaza(); $('lumaDlg').close(); };
$('lumaI').value = LUMA.inten; $('lumaC').value = LUMA.cul;
$('lumaI').oninput = () => { LUMA.inten = +$('lumaI').value; lumaSalveaza(); };
$('lumaC').onchange = () => { LUMA.cul = $('lumaC').value; lumaSalveaza(); };

let lumaFaza = 0, lumaUltim = 0;
function lumaBucla(ts) {
  requestAnimationFrame(lumaBucla);
  const dt = lumaUltim ? Math.min(0.1, (ts - lumaUltim) / 1000) : 0;
  lumaUltim = ts;
  if (!LUMA.on || !eng || eng.ctx.state !== 'running') { lumaEl.hidden = true; return; }
  lumaEl.hidden = false;
  lumaEl.style.background = CULORI[LUMA.cul] || CULORI.rosu;
  const hz = beatNow(eng), I = LUMA.inten / 100;
  if (hz > LUMA_MAX_HZ) { lumaEl.style.opacity = 0.12 * I; return; } // prea rapid pentru ecran: lumină fixă, slabă
  lumaFaza += 2 * Math.PI * hz * dt;
  lumaEl.style.opacity = (0.5 + 0.5 * Math.sin(lumaFaza)) * I; // sinusoidală, nu on/off
}
requestAnimationFrame(lumaBucla);

/* =====================================================================
   2. SUNET-CHEIE LA CARDURI (asociere cu ce înveți)
   ===================================================================== */
let cueCtx = null;
function cueCard() {
  const tip = $('ccue').value;
  if (tip === 'none') return;
  try {
    if (!cueCtx) cueCtx = new (window.AudioContext || window.webkitAudioContext)();
    cueCtx.resume();
    cueLa(cueCtx, cueCtx.currentTime + 0.05, tip, ($('cuev').value / 100) ** 2 * 0.3 + 0.02, cueCtx.destination);
  } catch (_) {}
}

/* =====================================================================
   3. ÎNREGISTRAREA VOCII TALE
   Se păstrează doar pe telefon (IndexedDB). Aplicația nu trimite nimic nicăieri.
   ===================================================================== */
const IDB = {
  db: null,
  async open() {
    if (this.db) return this.db;
    this.db = await new Promise((res, rej) => {
      const r = indexedDB.open('binaural-voci', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('voci', { keyPath: 'id', autoIncrement: true });
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    return this.db;
  },
  async tx(mod, fn) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const t = db.transaction('voci', mod), st = t.objectStore('voci'), rq = fn(st);
      t.oncomplete = () => res(rq && rq.result); t.onerror = () => rej(t.error);
    });
  },
  put(v) { return this.tx('readwrite', s => s.put(v)); },
  all() { return this.tx('readonly', s => s.getAll()); },
  del(id) { return this.tx('readwrite', s => s.delete(id)); },
};

let vReg = null;      // {mr, flux, bucati, t0, timer}
let vProba = null;    // {blob, mime, dur}

function textDeCitit() {
  const tip = $('vtext').value;
  if (tip === 'liber') return '';
  const pasi = tip === 'pmr' ? scriptRelaxare() : scriptHipnoza(10, tip === 'hip-somn' ? 'somn' : 'trezire');
  return pasi.map(s => `${s.t}\n   (pauză ~${Math.round(s.p)} s)`).join('\n\n');
}
function actualizeazaText() {
  const t = textDeCitit();
  $('vscript').textContent = t;
  $('vscript').hidden = !t;
}
$('vtext').onchange = actualizeazaText;
$('sug').addEventListener('input', actualizeazaText);

async function listaVoci() {
  let voci = [];
  try { voci = await IDB.all(); } catch (_) {}
  $('vlist').innerHTML = voci.length ? voci.slice().reverse().map(v =>
    `<div class="rec"><b>${esc(v.nume)}</b> <span class="tag">${fmt(v.dur)}</span>
      <div class="row" style="margin-top:6px">
       <select class="vprog" data-id="${v.id}" style="flex:2"><option value="relax">cu unde: relaxare</option><option value="medit">meditație</option><option value="somn">somn</option><option value="">fără unde</option></select>
       <button class="small ok vplay" data-id="${v.id}" style="flex:1">▶</button>
       <button class="small no vdel" data-id="${v.id}" aria-label="Șterge">🗑</button>
      </div></div>`).join('') : '<p class="mic">Nu ai înregistrări salvate.</p>';
  $('vlist').querySelectorAll('.vplay').forEach(b => { b.onclick = () => redaVoce(+b.dataset.id, voci); });
  $('vlist').querySelectorAll('.vdel').forEach(b => {
    b.onclick = async () => { await IDB.del(+b.dataset.id); listaVoci(); };
  });
}

async function redaVoce(id, voci) {
  const v = voci.find(x => x.id === id);
  if (!v) return;
  const url = URL.createObjectURL(v.blob);
  const prog = document.querySelector(`.vprog[data-id="${id}"]`).value;
  if (prog) porniInregistrare({ titlu: v.nume, url, start: 0, end: 0, dur: v.dur, prog });
  else porniSimplu(v, url);
}

// fără unde: doar redare simplă a vocii
function porniSimplu(v, url) {
  if (eng) stopSound(true);
  const a = new Audio(url);
  a.play();
  $('vplayer').hidden = false;
  $('vplayer').innerHTML = `<b>${esc(v.nume)}</b>`;
  $('vplayer').appendChild(a); a.controls = true; a.style.width = '100%';
}

$('vrec').onclick = async () => {
  if (vReg) { opresteInregistrarea(); return; }
  if (!navigator.mediaDevices || !window.MediaRecorder) { alert('Acest browser nu poate înregistra. Pe iPhone folosește Safari (iOS 14.3 sau mai nou).'); return; }
  if (eng) stopSound(true);
  let flux;
  try { flux = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
  catch (_) { alert('Nu am voie să folosesc microfonul. Acceptă cererea sau activează-l în Setări → Safari → Microfon.'); return; }
  const mime = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find(m => MediaRecorder.isTypeSupported(m)) || '';
  const mr = new MediaRecorder(flux, mime ? { mimeType: mime } : undefined);
  const bucati = [];
  mr.ondataavailable = e => { if (e.data.size) bucati.push(e.data); };
  mr.onstop = () => {
    flux.getTracks().forEach(t => t.stop()); // eliberează microfonul (iPhone redă mai încet cât e activ)
    const dur = (Date.now() - vReg.t0) / 1000;
    clearInterval(vReg.timer);
    vProba = { blob: new Blob(bucati, { type: mr.mimeType || mime }), dur };
    vReg = null;
    $('vrec').textContent = '● Înregistrează';
    $('vrec').classList.remove('no');
    $('vtimp').textContent = '';
    $('vprev').hidden = false;
    $('vaudio').src = URL.createObjectURL(vProba.blob);
    $('vnume').value = 'Vocea mea ' + new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
  };
  mr.start(1000);
  vReg = { mr, t0: Date.now(), timer: setInterval(() => { $('vtimp').textContent = '● ' + fmt((Date.now() - vReg.t0) / 1000); }, 500) };
  $('vrec').textContent = '■ Oprește înregistrarea';
  $('vrec').classList.add('no');
  $('vprev').hidden = true;
};

function opresteInregistrarea() { if (vReg) vReg.mr.stop(); }

$('vsave').onclick = async () => {
  if (!vProba) return;
  try {
    await IDB.put({ nume: $('vnume').value.trim() || 'Vocea mea', blob: vProba.blob, dur: vProba.dur, creat: Date.now() });
  } catch (_) { alert('Nu am putut salva înregistrarea (spațiu plin?).'); return; }
  vProba = null; $('vprev').hidden = true; $('vaudio').removeAttribute('src');
  listaVoci();
};
$('vcancel').onclick = () => { vProba = null; $('vprev').hidden = true; $('vaudio').removeAttribute('src'); };

actualizeazaText();
listaVoci();
