'use strict';

// Programe: puncte [minut, Hz-bataie]; între puncte frecvența de bătaie se schimbă liniar.
// Durata afișată e scalată la durata aleasă de utilizator.
const PROGRAME = [
  { id: 'focus', e: '🎯', nume: 'Concentrare', scop: 'Lucru atent, citit, studiu',
    desc: 'Pornește calm (alpha) și urcă spre beta joasă, ritm folosit în studiile despre atenție susținută.',
    c: 200, dur: 30, pts: [[0, 10], [5, 12], [10, 14], [30, 16], [32, 12]] },
  { id: 'invat', e: '📚', nume: 'Învățare', scop: 'Absorbit material nou',
    desc: 'Alpha → beta joasă: treaz și receptiv, fără încordare. Folosește-l cât citești sau te uiți pe note.',
    c: 180, dur: 40, pts: [[0, 9], [6, 10], [10, 12], [30, 13], [40, 10]] },
  { id: 'memor', e: '🧠', nume: 'Memorare', scop: 'Fixat ce ai învățat',
    desc: 'Theta ↔ alpha, intervalul legat de reverie și consolidare. Bun după studiu, la recapitulare lejeră.',
    c: 170, dur: 25, pts: [[0, 10], [5, 7], [12, 6], [20, 8], [25, 10]] },
  { id: 'lucid', e: '💡', nume: 'Luciditate', scop: 'Trezire, claritate, energie',
    desc: 'Beta medie (15–20 Hz) pentru stare alertă. Nu-l folosi seara sau înainte de culcare.',
    c: 220, dur: 15, pts: [[0, 12], [3, 16], [8, 18], [13, 20], [15, 14]] },
  { id: 'creat', e: '🎨', nume: 'Creativitate', scop: 'Idei, improvizație, compus',
    desc: 'La granița alpha/theta (≈7–10 Hz), unde mulți raportează gânduri mai libere.',
    c: 190, dur: 30, pts: [[0, 10], [5, 9], [15, 7.5], [25, 8], [30, 10]] },
  { id: 'relax', e: '🌊', nume: 'Relaxare', scop: 'Descărcat stresul',
    desc: 'Alpha lent (12 → 8 Hz): calm treaz, respirație lungă.',
    c: 160, dur: 20, pts: [[0, 12], [5, 10], [15, 8], [20, 8]] },
  { id: 'medit', e: '🧘', nume: 'Meditație / transă', scop: 'Stare meditativă profundă',
    desc: 'Alpha → theta (10 → 6 → 4,5 Hz) și revenire lină. Ghid: stai întins sau așezat, ochii închiși, nu lupta cu gândurile.',
    c: 150, dur: 30, pts: [[0, 10], [6, 8], [12, 6], [22, 4.5], [27, 7], [30, 10]] },
  { id: 'somn', e: '🌙', nume: 'Somn', scop: 'Adormit mai ușor',
    desc: 'Coboară încet spre delta (8 → 2 Hz). Pornește-l în pat, cu volumul foarte mic; se oprește singur.',
    c: 130, dur: 45, pts: [[0, 8], [10, 5], [20, 3], [35, 2], [45, 1.5]] },
];

const $ = id => document.getElementById(id);
const DURATE = [10, 20, 30, 45, 60];
let sel = PROGRAME[0], durMin = sel.dur;
let ctx = null, audioEl = null, st = null; // st = sesiunea curentă

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

/* ---------- interfață ---------- */
function deseneazaProgramele() {
  const g = $('grid');
  g.innerHTML = '';
  PROGRAME.forEach(p => {
    const b = document.createElement('button');
    b.className = 'prog' + (p === sel ? ' sel' : '');
    b.innerHTML = `<span class="e">${p.e}</span><b>${p.nume}</b><small>${p.scop}</small>`;
    b.onclick = () => { if (st) return; sel = p; durMin = p.dur; deseneazaProgramele(); deseneazaPanou(); };
    g.appendChild(b);
  });
}

function deseneazaPanou() {
  $('pTitle').textContent = sel.e + ' ' + sel.nume;
  $('pDesc').textContent = sel.desc;
  const d = $('durs');
  d.innerHTML = '';
  const opt = DURATE.includes(sel.dur) ? DURATE : [...DURATE, sel.dur].sort((a, b) => a - b);
  opt.forEach(m => {
    const c = document.createElement('button');
    c.className = 'chip' + (m === durMin ? ' sel' : '');
    c.textContent = m + ' min';
    c.onclick = () => { if (st) return; durMin = m; deseneazaPanou(); };
    d.appendChild(c);
  });
  $('volv').textContent = $('vol').value + '%';
}

/* ---------- sunet ---------- */
function zgomot(tip) {
  const n = ctx.sampleRate * 4, buf = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      if (tip === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else { // roz (Paul Kellet)
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
      }
    }
  }
  const s = ctx.createBufferSource();
  s.buffer = buf; s.loop = true;
  return s;
}

function interp(pts, t) { // t în minute (din program, nescalat)
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const [t0, v0] = pts[i - 1], [t1, v1] = pts[i];
      return v0 + (v1 - v0) * (t - t0) / (t1 - t0);
    }
  }
  return pts[pts.length - 1][1];
}

async function porneste() {
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();
  await ctx.resume();

  const total = durMin * 60;
  const scala = durMin / sel.pts[sel.pts.length - 1][0]; // minute reale / minute program
  const t0 = ctx.currentTime + 0.15;
  const fade = ctx.createGain();           // fade in/out
  const vol = ctx.createGain();            // volum utilizator
  vol.gain.value = ($('vol').value / 100) ** 2 * 0.5;
  fade.gain.setValueAtTime(0, t0);
  fade.gain.linearRampToValueAtTime(1, t0 + 6);
  fade.gain.setValueAtTime(1, t0 + total - 10);
  fade.gain.linearRampToValueAtTime(0, t0 + total);
  fade.connect(vol);

  const tonuri = ctx.createGain();
  tonuri.gain.value = 0.5;
  tonuri.connect(fade);

  const oscs = [];
  const mod = $('mode').value;
  const pts = sel.pts.map(([m, hz]) => [m * scala * 60, hz]); // în secunde reale

  if (mod === 'bin') {
    const merger = ctx.createChannelMerger(2);
    ['L', 'R'].forEach((lat, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      const semn = i ? 1 : -1;
      o.frequency.setValueAtTime(sel.c + semn * pts[0][1] / 2, t0);
      pts.forEach(([s, hz]) => o.frequency.linearRampToValueAtTime(sel.c + semn * hz / 2, t0 + s));
      o.connect(merger, 0, i);
      oscs.push(o);
    });
    merger.connect(tonuri);
  } else { // izocronic: ton unic modulat în amplitudine
    const o = ctx.createOscillator();
    o.type = 'sine'; o.frequency.value = sel.c;
    const amp = ctx.createGain(); amp.gain.value = 0.5;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(pts[0][1], t0);
    pts.forEach(([s, hz]) => lfo.frequency.linearRampToValueAtTime(hz, t0 + s));
    const lg = ctx.createGain(); lg.gain.value = 0.5;
    lfo.connect(lg); lg.connect(amp.gain);
    o.connect(amp); amp.connect(tonuri);
    oscs.push(o, lfo);
  }

  let nz = null;
  const tip = $('noise').value;
  if (tip !== 'none') {
    nz = zgomot(tip);
    const ng = ctx.createGain();
    ng.gain.value = ($('noisev').value / 100) ** 2 * 0.8;
    nz.connect(ng); ng.connect(fade);
  }

  // Ieșire: prin element <audio> (merge și cu comutatorul de silențios al iPhone-ului și în fundal);
  // dacă nu merge, direct la difuzor.
  let prinAudio = false;
  try {
    const dest = ctx.createMediaStreamDestination();
    vol.connect(dest);
    audioEl = new Audio();
    audioEl.srcObject = dest.stream;
    audioEl.setAttribute('playsinline', '');
    await audioEl.play();
    prinAudio = true;
  } catch (e) { audioEl = null; }
  if (!prinAudio) vol.connect(ctx.destination);

  oscs.forEach(o => { o.start(t0); o.stop(t0 + total + 1); });
  if (nz) { nz.start(t0); nz.stop(t0 + total + 1); }

  st = { t0, total, pts, vol, scala, paused: false, wake: null, timer: null };

  if ($('wake').checked && navigator.wakeLock) {
    try { st.wake = await navigator.wakeLock.request('screen'); } catch (e) {}
  }
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: sel.nume, artist: 'Unde Binaurale' });
    navigator.mediaSession.setActionHandler('pause', pauza);
    navigator.mediaSession.setActionHandler('play', pauza);
    navigator.mediaSession.setActionHandler('stop', opreste);
  }

  $('go').textContent = '■ Oprește';
  $('go').classList.add('stop');
  $('status').classList.add('on');
  st.timer = setInterval(tick, 250);
  tick();
}

function tick() {
  if (!st) return;
  const el = ctx.currentTime - st.t0;
  if (el >= st.total + 0.5) return opreste();
  const e = Math.max(0, el);
  const hz = interp(st.pts.map(([s, h]) => [s, h]), e);
  $('hzv').textContent = hz.toFixed(1);
  $('band').textContent = banda(hz);
  $('barfill').style.width = Math.min(100, e / st.total * 100) + '%';
  $('time').textContent = fmt(e) + ' / ' + fmt(st.total) + ' · rămas ' + fmt(st.total - e);
}

async function pauza() {
  if (!st) return;
  if (ctx.state === 'running') { await ctx.suspend(); $('pause').textContent = '▶ Continuă'; }
  else { await ctx.resume(); $('pause').textContent = '⏸ Pauză'; }
}

function opreste() {
  if (!st) return;
  clearInterval(st.timer);
  try { st.wake && st.wake.release(); } catch (e) {}
  try { audioEl && audioEl.pause(); } catch (e) {}
  audioEl = null;
  try { ctx.close(); } catch (e) {}
  ctx = null; st = null;
  $('go').textContent = '▶ Începe';
  $('go').classList.remove('stop');
  $('status').classList.remove('on');
  $('pause').textContent = '⏸ Pauză';
}

$('go').onclick = () => st ? opreste() : porneste();
$('pause').onclick = pauza;
$('vol').oninput = () => {
  $('volv').textContent = $('vol').value + '%';
  if (st) st.vol.gain.value = ($('vol').value / 100) ** 2 * 0.5;
};

deseneazaProgramele();
deseneazaPanou();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
