'use strict';

/* ================= PROGRAME ================= */
// pts: [minut, Hz-bataie]; între puncte frecvența se schimbă liniar. Durata e scalată la durata aleasă.
const PROGRAME = [
  { id: 'focus', e: '🎯', nume: 'Concentrare', scop: 'Lucru atent, citit, studiu',
    desc: 'Pornește calm (alpha) și urcă spre beta joasă, ritm folosit în studiile despre atenție susținută.',
    c: 200, dur: 30, pts: [[0, 10], [5, 12], [10, 14], [30, 16], [32, 12]], muz: 'luminos' },
  { id: 'invat', e: '📚', nume: 'Învățare', scop: 'Absorbit material nou',
    desc: 'Alpha → beta joasă: treaz și receptiv, fără încordare. Folosește-l cât citești sau te uiți pe note.',
    c: 180, dur: 40, pts: [[0, 9], [6, 10], [10, 12], [30, 13], [40, 10]], muz: 'luminos' },
  { id: 'memor', e: '🧠', nume: 'Memorare', scop: 'Fixat ce ai învățat',
    desc: 'Theta ↔ alpha, intervalul legat de reverie și consolidare. Bun după studiu, la recapitulare lejeră.',
    c: 170, dur: 25, pts: [[0, 10], [5, 7], [12, 6], [20, 8], [25, 10]], muz: 'calm' },
  { id: 'lucid', e: '💡', nume: 'Luciditate', scop: 'Trezire, claritate, energie',
    desc: 'Beta medie (15–20 Hz) pentru stare alertă. Nu-l folosi seara sau înainte de culcare.',
    c: 220, dur: 15, pts: [[0, 12], [3, 16], [8, 18], [13, 20], [15, 14]], muz: 'luminos' },
  { id: 'creat', e: '🎨', nume: 'Creativitate', scop: 'Idei, improvizație, compus',
    desc: 'La granița alpha/theta (≈7–10 Hz), unde mulți raportează gânduri mai libere.',
    c: 190, dur: 30, pts: [[0, 10], [5, 9], [15, 7.5], [25, 8], [30, 10]], muz: 'luminos' },
  { id: 'gamma', e: '⚡', nume: 'Gamma 40 Hz', scop: 'Atenție intensă, sesiuni scurte',
    desc: 'Urcă spre 40 Hz (gamma). Dovezile sunt cele mai slabe dintre toate programele; încearcă 15 minute și vezi în jurnal dacă te ajută. Nu-l folosi seara.',
    c: 250, dur: 15, pts: [[0, 12], [3, 25], [6, 40], [13, 40], [15, 14]], muz: 'luminos' },
  { id: 'relax', e: '🌊', nume: 'Relaxare', scop: 'Descărcat stresul',
    desc: 'Alpha lent (12 → 8 Hz): calm treaz, respirație lungă.',
    c: 160, dur: 20, pts: [[0, 12], [5, 10], [15, 8], [20, 8]], muz: 'calm' },
  { id: 'medit', e: '🧘', nume: 'Meditație / transă', scop: 'Stare meditativă profundă',
    desc: 'Alpha → theta (10 → 6 → 4,5 Hz) și revenire lină. Stai întins sau așezat, ochii închiși, nu lupta cu gândurile.',
    c: 150, dur: 30, pts: [[0, 10], [6, 8], [12, 6], [22, 4.5], [27, 7], [30, 10]], muz: 'adanc' },
  { id: 'somn', e: '🌙', nume: 'Somn', scop: 'Adormit mai ușor',
    desc: 'Coboară încet spre delta (8 → 2 Hz). Pornește-l în pat, cu volumul foarte mic; se oprește singur.',
    c: 130, dur: 45, pts: [[0, 8], [10, 5], [20, 3], [35, 2], [45, 1.5]], muz: 'adanc' },
];
const progById = id => PROGRAME.find(p => p.id === id);

/* ================= MUZICĂ GENERATĂ ================= */
// root = Hz; acorduri = semitonuri față de root pentru 4 voci; note = semitonuri pentru clopoței
const MUZICI = {
  calm:   { nume: 'Calm (la minor)',     root: 110,    note: [0, 3, 5, 7, 10],
            acorduri: [[0, 7, 12, 15], [-4, 3, 8, 12], [3, 10, 15, 19], [-2, 5, 10, 14]] },
  luminos:{ nume: 'Luminos (re lidian)', root: 146.83, note: [0, 2, 4, 7, 9],
            acorduri: [[0, 7, 12, 16], [2, 9, 14, 18], [-3, 4, 9, 12], [5, 12, 17, 21]] },
  adanc:  { nume: 'Adânc (dronă în re)', root: 73.42,  note: [0, 5, 7, 12],
            acorduri: [[0, 7, 12, 19], [0, 5, 12, 17]] },
};
const hzDe = (root, semi) => root * Math.pow(2, semi / 12);

function impuls(ctx, sec) {
  const n = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
  }
  return b;
}

function pornesteMuzica(e, tip, destinatie) {
  const M = MUZICI[tip], ctx = e.ctx;
  const bus = ctx.createGain();
  const dry = ctx.createGain(); dry.gain.value = 0.7;
  const conv = ctx.createConvolver(); conv.buffer = impuls(ctx, 3.5);
  const wet = ctx.createGain(); wet.gain.value = 0.55;
  bus.connect(dry); dry.connect(destinatie);
  bus.connect(conv); conv.connect(wet); wet.connect(destinatie);

  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1000;
  const padG = ctx.createGain(); padG.gain.value = 0.5;
  lp.connect(padG); padG.connect(bus);
  const voci = [0, 1, 2, 3].map(i => {
    const o = ctx.createOscillator();
    o.type = i % 2 ? 'triangle' : 'sine';
    o.detune.value = (i - 1.5) * 4;
    const g = ctx.createGain(); g.gain.value = 0.14;
    o.frequency.value = hzDe(M.root, M.acorduri[0][i]);
    o.connect(g); g.connect(lp); o.start(e.t0);
    return o;
  });

  let tAcord = e.t0, iAcord = 0, tNota = e.t0 + 4;
  const PAS = 16;
  function programeaza(pana) {
    while (tAcord < pana) {
      const ac = M.acorduri[iAcord++ % M.acorduri.length];
      voci.forEach((o, i) => o.frequency.setTargetAtTime(hzDe(M.root, ac[i]), Math.max(tAcord, ctx.currentTime), 3));
      tAcord += PAS;
    }
    while (tNota < pana) {
      if (Math.random() < 0.8) {
        const semi = M.note[Math.floor(Math.random() * M.note.length)] + 12 * (1 + Math.floor(Math.random() * 2));
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = hzDe(M.root, semi);
        g.gain.setValueAtTime(0.0001, tNota);
        g.gain.linearRampToValueAtTime(0.22, tNota + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, tNota + 4.5);
        o.connect(g); g.connect(bus);
        o.start(tNota); o.stop(tNota + 5);
      }
      tNota += 3 + Math.random() * 5;
    }
  }
  programeaza(e.t0 + 90);
  e.timerMuz = setInterval(() => programeaza(ctx.currentTime + 90), 20000);
  e.opresteMuz = () => { clearInterval(e.timerMuz); voci.forEach(o => { try { o.stop(); } catch (_) {} }); };
}

/* ================= SUNET-CHEIE (reactivare țintită a memoriei, fără EEG) =================
   Trei note scurte, ca o semnătură. Se asociază cu un subiect la studiu și se reia încet în somn.
   Cercetările o fac sincronizat cu undele lente măsurate cu EEG; aici e doar după orar, deci aproximativ. */
const CUES = { A: [784, 988, 1175], B: [659, 880, 1047], C: [587, 740, 880] };

function cueLa(ctx, t, tip, vol, dest) {
  CUES[tip].forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain(), s = t + i * 0.35;
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.linearRampToValueAtTime(vol, s + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 1.2);
    o.connect(g); g.connect(dest);
    o.start(s); o.stop(s + 1.3);
  });
}

// c: {tip:'A'|'B'|'C', vol, from, to, every} (secunde de la începutul ședinței)
function pornesteCue(e, c, dest) {
  const ctx = e.ctx;
  let t = e.t0 + c.from;
  const programeaza = pana => {
    while (t < pana && t <= e.t0 + c.to) { cueLa(ctx, t, c.tip, c.vol, dest); t += c.every; }
  };
  programeaza(e.t0 + 90);
  e.timerCue = setInterval(() => programeaza(ctx.currentTime + 90), 20000);
}

/* ================= MOTOR ================= */
let eng = null;

function zgomot(ctx, tip) {
  const n = ctx.sampleRate * 4, buf = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      if (tip === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else {
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

function interp(pts, t) {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const [t0, v0] = pts[i - 1], [t1, v1] = pts[i];
      return v0 + (v1 - v0) * (t - t0) / (t1 - t0);
    }
  }
  return pts[pts.length - 1][1];
}

// o: {prog, min, mode:'bin'|'iso', noise, noiseV, vol, music:'none'|calm|luminos|adanc|file, musicV, file, wake, onTick, onEnd}
async function startSound(o) {
  if (eng) stopSound(true);
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  await ctx.resume();
  const p = o.prog, total = o.min * 60;
  const scala = o.min / p.pts[p.pts.length - 1][0];
  const t0 = ctx.currentTime + 0.15;
  const e = eng = { ctx, t0, total, o, wake: null, audioEl: null, fileEl: null, beat: [], dyn: null };

  const fade = ctx.createGain();
  fade.gain.setValueAtTime(0, t0);
  fade.gain.linearRampToValueAtTime(1, t0 + 6);
  fade.gain.setValueAtTime(1, t0 + total - 10);
  fade.gain.linearRampToValueAtTime(0, t0 + total);
  const vol = ctx.createGain();
  vol.gain.value = (o.vol / 100) ** 2 * 0.5;
  fade.connect(vol);
  e.vol = vol;

  const tonuri = ctx.createGain(); tonuri.gain.value = 0.5; tonuri.connect(fade);
  const oscs = [];
  const pts = p.pts.map(([m, hz]) => [m * scala * 60, hz]);
  e.pts = pts;

  if (o.mode === 'bin') {
    const merger = ctx.createChannelMerger(2);
    [-1, 1].forEach((semn, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.c + semn * pts[0][1] / 2, t0);
      pts.forEach(([s, hz]) => osc.frequency.linearRampToValueAtTime(p.c + semn * hz / 2, t0 + s));
      osc.connect(merger, 0, i);
      oscs.push(osc);
      e.beat.push({ p: osc.frequency, sign: semn, c: p.c });
    });
    merger.connect(tonuri);
  } else {
    const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = p.c;
    const amp = ctx.createGain(); amp.gain.value = 0.5;
    const lfo = ctx.createOscillator(); lfo.type = 'sine';
    lfo.frequency.setValueAtTime(pts[0][1], t0);
    pts.forEach(([s, hz]) => lfo.frequency.linearRampToValueAtTime(hz, t0 + s));
    const lg = ctx.createGain(); lg.gain.value = 0.5;
    lfo.connect(lg); lg.connect(amp.gain);
    osc.connect(amp); amp.connect(tonuri);
    oscs.push(osc, lfo);
    e.beat.push({ p: lfo.frequency, sign: 0, c: p.c });
  }

  let nz = null;
  if (o.noise !== 'none') {
    nz = zgomot(ctx, o.noise);
    const ng = ctx.createGain(); ng.gain.value = (o.noiseV / 100) ** 2 * 0.8;
    nz.connect(ng); ng.connect(fade);
  }

  // muzică
  const muzG = ctx.createGain(); muzG.gain.value = (o.musicV / 100) ** 2 * 0.9;
  muzG.connect(fade);
  e.muzG = muzG;
  if (MUZICI[o.music]) pornesteMuzica(e, o.music, muzG);
  else if (o.music === 'file' && o.file) {
    const el = new Audio(URL.createObjectURL(o.file));
    el.loop = true; el.setAttribute('playsinline', '');
    const src = ctx.createMediaElementSource(el);
    src.connect(muzG);
    e.fileEl = el;
    el.play().catch(() => {});
  }

  const master = ctx.createGain(); // tonuri + muzică (prin vol) și vocea merg aici, apoi la ieșire
  vol.connect(master);
  if (o.cue) pornesteCue(e, o.cue, master);

  // înregistrare cu voce reală (de pe internet), trecută prin același mixaj ca tonurile
  if (o.voiceUrl) {
    const el = new Audio();
    el.crossOrigin = 'anonymous'; el.preload = 'auto'; el.setAttribute('playsinline', '');
    el.src = o.voiceUrl;
    const vg = ctx.createGain(); vg.gain.value = (o.voiceV / 100) ** 2;
    ctx.createMediaElementSource(el).connect(vg);
    vg.connect(master);
    e.voiceEl = el; e.voiceG = vg; e.fade = fade;
    if (o.voiceStart) el.addEventListener('loadedmetadata', () => { el.currentTime = o.voiceStart; }, { once: true });
    el.onerror = () => { if (o.onVoiceError) o.onVoiceError(); };
    let terminat = false;
    const finVoce = () => { // bazele se sting lin, apoi sesiunea se încheie
      if (terminat) return; terminat = true;
      try { fade.gain.cancelScheduledValues(ctx.currentTime); fade.gain.setValueAtTime(fade.gain.value, ctx.currentTime); fade.gain.linearRampToValueAtTime(0, ctx.currentTime + 8); } catch (_) {}
      setTimeout(() => { if (eng === e) finalSunet(); }, 8500);
    };
    el.onended = finVoce;
    if (o.voiceEnd) el.addEventListener('timeupdate', () => { if (el.currentTime >= o.voiceEnd) { el.pause(); finVoce(); } });
    setTimeout(() => { if (eng === e) el.play().catch(() => { if (o.onVoiceError) o.onVoiceError(); }); }, 4000);
  }

  // ieșire prin <audio> ca să meargă cu comutatorul de silențios al iPhone-ului și în fundal
  let prinAudio = false;
  try {
    const dest = ctx.createMediaStreamDestination();
    master.connect(dest);
    const a = new Audio(); a.srcObject = dest.stream; a.setAttribute('playsinline', '');
    await a.play();
    e.audioEl = a; prinAudio = true;
  } catch (_) {}
  if (!prinAudio) master.connect(ctx.destination);

  oscs.forEach(x => { x.start(t0); x.stop(t0 + total + 1); });
  if (nz) { nz.start(t0); nz.stop(t0 + total + 1); }

  if (o.wake && navigator.wakeLock) { try { e.wake = await navigator.wakeLock.request('screen'); } catch (_) {} }
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: p.nume, artist: 'Unde Binaurale' });
    navigator.mediaSession.setActionHandler('pause', pauzaSunet);
    navigator.mediaSession.setActionHandler('play', pauzaSunet);
    navigator.mediaSession.setActionHandler('stop', () => finalSunet());
  }
  e.timer = setInterval(tickSunet, 250);
  tickSunet();
}

// Frecvența de bătaie de acum (urmărește fie programul fix, fie ultima comandă setBeat)
function beatNow(e) {
  const t = e.ctx.currentTime;
  if (e.dyn) {
    const d = e.dyn;
    return t >= d.t1 ? d.to : d.from + (d.to - d.from) * (t - d.t0) / (d.t1 - d.t0);
  }
  return interp(e.pts, Math.max(0, t - e.t0));
}

// Mută lin frecvența de bătaie spre `hz` în `secs` secunde (folosit ca undele să urmeze faza ședinței ghidate)
function setBeat(hz, secs) {
  const e = eng; if (!e || !e.beat.length) return;
  const now = e.ctx.currentTime, from = beatNow(e), s = Math.max(1, secs);
  e.beat.forEach(b => {
    b.p.cancelScheduledValues(now);
    b.p.setValueAtTime(b.sign ? b.c + b.sign * from / 2 : from, now);
    b.p.linearRampToValueAtTime(b.sign ? b.c + b.sign * hz / 2 : hz, now + s);
  });
  e.dyn = { from, to: hz, t0: now, t1: now + s };
}

function tickSunet() {
  const e = eng; if (!e) return;
  const el = e.ctx.currentTime - e.t0;
  if (el >= e.total + 0.5) return finalSunet();
  const t = Math.max(0, el), hz = beatNow(e);
  if (e.o.onTick) e.o.onTick(t, e.total, hz);
}

async function pauzaSunet() {
  const e = eng; if (!e) return false;
  if (e.ctx.state === 'running') {
    await e.ctx.suspend();
    if (e.fileEl) e.fileEl.pause();
    if (e.voiceEl) e.voiceEl.pause();
    return true;
  }
  await e.ctx.resume();
  if (e.fileEl) e.fileEl.play().catch(() => {});
  if (e.voiceEl && e.voiceEl.currentTime > 0) e.voiceEl.play().catch(() => {});
  return false;
}

function stopSound(tacut) {
  const e = eng; if (!e) return;
  eng = null;
  clearInterval(e.timer);
  clearInterval(e.timerCue);
  if (e.opresteMuz) e.opresteMuz();
  try { e.wake && e.wake.release(); } catch (_) {}
  try { e.audioEl && e.audioEl.pause(); } catch (_) {}
  try { e.fileEl && (e.fileEl.pause(), URL.revokeObjectURL(e.fileEl.src)); } catch (_) {}
  try { if (e.voiceEl) { e.voiceEl.onended = null; e.voiceEl.onerror = null; e.voiceEl.pause(); e.voiceEl.removeAttribute('src'); e.voiceEl.load(); } } catch (_) {}
  try { e.ctx.close(); } catch (_) {}
  if (!tacut && e.o.onEnd) e.o.onEnd();
}
function finalSunet() { stopSound(false); }

/* ================= INTERFAȚĂ: TAB SUNET ================= */
let sel = PROGRAME[0], durMin = sel.dur, fisierMuz = null;

function deseneazaProgramele() {
  const g = $('grid'); g.innerHTML = '';
  PROGRAME.forEach(p => {
    const b = document.createElement('button');
    b.className = 'prog' + (p === sel ? ' sel' : '');
    b.innerHTML = `<span class="e">${p.e}</span><b>${p.nume}</b><small>${p.scop}</small>`;
    b.onclick = () => { if (eng) return; sel = p; durMin = p.dur; $('music').value = p.muz; deseneazaProgramele(); deseneazaPanou(); };
    g.appendChild(b);
  });
}

function deseneazaPanou() {
  $('pTitle').textContent = sel.e + ' ' + sel.nume;
  $('pDesc').textContent = sel.desc;
  const d = $('durs'); d.innerHTML = '';
  const opt = [...new Set([10, 20, 30, 45, 60, ...(sel.id === 'somn' ? [90, 120] : []), sel.dur])].sort((a, b) => a - b);
  opt.forEach(m => {
    const c = document.createElement('button');
    c.className = 'chip' + (m === durMin ? ' sel' : '');
    c.textContent = m + ' min';
    c.onclick = () => { if (eng) return; durMin = m; deseneazaPanou(); };
    d.appendChild(c);
  });
  $('volv').textContent = $('vol').value + '%';
  $('filebox').hidden = $('music').value !== 'file';
}

function arataStare(on) {
  $('go').textContent = on ? '■ Oprește' : '▶ Începe';
  $('go').classList.toggle('stop', on);
  $('status').classList.toggle('on', on);
  $('pause').textContent = '⏸ Pauză';
}

// Somn: după primele ~30 min (când somnul profund e mai probabil) la fiecare 30 s, până cu 10 min înainte de final.
// Alte programe: la fiecare minut, ca să se asocieze cu ce înveți.
function planCue() {
  const tip = $('cue').value;
  if (tip === 'none') return null;
  const total = durMin * 60, vol = ($('cuev').value / 100) ** 2 * 0.3;
  if (sel.id === 'somn') return { tip, vol, from: Math.min(1800, total * 0.4), to: total - 600, every: 30 };
  return { tip, vol, from: 60, to: total - 30, every: 60 };
}

function optiuniSunet(extra) {
  return Object.assign({
    prog: sel, min: durMin, mode: $('mode').value,
    noise: $('noise').value, noiseV: +$('noisev').value,
    vol: +$('vol').value, music: $('music').value, musicV: +$('musicv').value, file: fisierMuz,
    wake: $('wake').checked,
    cue: planCue(),
    onTick(t, total, hz) {
      $('hzv').textContent = hz.toFixed(1);
      $('band').textContent = banda(hz);
      $('barfill').style.width = Math.min(100, t / total * 100) + '%';
      $('time').textContent = fmt(t) + ' / ' + fmt(total) + ' · rămas ' + fmt(total - t);
    },
    onEnd() { arataStare(false); sfarsitSesiune(); },
  }, extra);
}

$('go').onclick = async () => {
  if (eng) { finalSunet(); return; }
  if (!await inceputSesiune(sel.nume, durMin)) return;
  try { await startSound(optiuniSunet()); arataStare(true); }
  catch (err) { alert('Nu am putut porni sunetul: ' + err.message); sesiune = null; }
};
$('pause').onclick = async () => { $('pause').textContent = (await pauzaSunet()) ? '▶ Continuă' : '⏸ Pauză'; };
$('vol').oninput = () => { $('volv').textContent = $('vol').value + '%'; if (eng) eng.vol.gain.value = ($('vol').value / 100) ** 2 * 0.5; };
$('musicv').oninput = () => { if (eng) eng.muzG.gain.value = ($('musicv').value / 100) ** 2 * 0.9; };
$('music').onchange = () => { $('filebox').hidden = $('music').value !== 'file'; };
$('file').onchange = () => {
  fisierMuz = $('file').files[0] || null;
  $('fname').textContent = fisierMuz ? fisierMuz.name : 'niciun fișier ales';
};

$('music').value = sel.muz;
deseneazaProgramele();
deseneazaPanou();
