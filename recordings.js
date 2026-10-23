'use strict';

/* Înregistrări cu voci reale, cu licență Creative Commons, încărcate de pe Internet Archive (nu sunt copiate în aplicație).
   Toate sunt NC (doar uz necomercial) — aplicația e gratuită, fără reclame. Fișierele se redau neschimbate. */
const IA = 'https://archive.org/download/';
const REC = [
  { id: 'gently', titlu: 'Gently Fall Asleep', autor: 'Grant Raymond Barrett', scop: '🌙 Somn',
    desc: 'Meditație ghidată de adormire: respirație, relaxarea mușchilor, imagine cu un apus. Voce calmă, cu pauze lungi.',
    url: IA + 'GentlyFallAsleep/02%20Sleepy%20Twilight%20-%20Guided%20Meditati.mp3',
    start: 0, end: 0, dur: 505, prog: 'somn',
    lic: 'CC BY-NC 4.0', licUrl: 'https://creativecommons.org/licenses/by-nc/4.0/', sursa: 'https://archive.org/details/GentlyFallAsleep' },
  { id: 'beach', titlu: 'Beach Dreamscape', autor: 'HypnoResearcher', scop: '🌙 Anxietate → somn',
    desc: 'Sesiune de hipnoză de seara, în pat: relaxare progresivă, plajă, numărătoare spre somn. Se termină cu sugestia de somn odihnitor.',
    url: IA + 'BeachDreamscapeHypnoticEmpowermentForAnxiety/BeachRelease.mp3',
    start: 0, end: 0, dur: 1202, prog: 'somn',
    lic: 'CC BY-NC-ND 3.0 US', licUrl: 'https://creativecommons.org/licenses/by-nc-nd/3.0/us/', sursa: 'https://archive.org/details/BeachDreamscapeHypnoticEmpowermentForAnxiety' },
  { id: 'sleep', titlu: 'Sleep Made Simple (partea de meditație)', autor: 'L.S. King, Be n*tranced 12', scop: '🌙 Somn',
    desc: 'Din episodul de podcast, doar meditația ghidată (începe după sfaturile despre somn). Se termină cu urări de somn liniștit.',
    url: IA + 'LSKingBentranced12SleepMadeSimple/Be_n_tranced_12__Sleep_Made_Simple_vbr.mp3',
    start: 638, end: 0, dur: 1299, prog: 'somn',
    lic: 'CC BY-NC-SA 2.5', licUrl: 'https://creativecommons.org/licenses/by-nc-sa/2.5/', sursa: 'https://archive.org/details/LSKingBentranced12SleepMadeSimple' },
  { id: 'massage', titlu: 'A Mental Massage (partea de meditație)', autor: 'L.S. King, Be n*tranced 8', scop: '💆 Relaxare, stres',
    desc: 'Din episodul de podcast, doar meditația ghidată: te imaginezi pe o masă de masaj. Se termină cu numărătoare 1–2–3 și trezire.',
    url: IA + 'LSKingBentranced8aMentalMassage/Be_n_tranced_8__A_Mental_Massage_vbr.mp3',
    start: 595, end: 1380, dur: 1530, prog: 'relax',
    lic: 'CC BY-NC-SA 2.5', licUrl: 'https://creativecommons.org/licenses/by-nc-sa/2.5/', sursa: 'https://archive.org/details/LSKingBentranced8aMentalMassage' },
];

let recCurenta = null;

function deseneazaInregistrari() {
  $('reclist').innerHTML = REC.map(r => {
    const min = Math.round(((r.end || r.dur) - r.start) / 60);
    return `<div class="rec">
      <b>${esc(r.titlu)}</b> <span class="tag">${r.scop} · ${min} min · engleză</span>
      <p>${esc(r.desc)}</p>
      <p class="mic">Voce: ${esc(r.autor)} · Licență <a href="${r.licUrl}" target="_blank" rel="noopener">${r.lic}</a> ·
       <a href="${r.sursa}" target="_blank" rel="noopener">sursa</a></p>
      <button class="small ok" data-id="${r.id}">▶ Ascultă</button>
    </div>`;
  }).join('');
  $('reclist').querySelectorAll('button').forEach(b => { b.onclick = () => porniInregistrare(REC.find(r => r.id === b.dataset.id)); });
}

function arataRec(on) {
  $('rstage').hidden = !on;
  $('reclist').hidden = on;
}

async function porniInregistrare(r) {
  if (eng) stopSound(true);
  const durataSec = (r.end || r.dur) - r.start;
  const min = Math.ceil(durataSec / 60) + 1;
  if (!await inceputSesiune(r.titlu, min)) return;
  recCurenta = r;
  $('rtitlu').textContent = r.titlu;
  $('rinfo').textContent = 'Se încarcă înregistrarea…';
  arataRec(true);
  const fond = $('rfond').checked;
  try {
    await startSound({
      prog: progById(r.prog), min, mode: 'bin', noise: 'brown', noiseV: fond ? 35 : 0,
      vol: fond ? +$('rvolf').value : 0, music: 'none', musicV: 0, file: null, wake: $('wake').checked,
      voiceUrl: r.url, voiceStart: r.start, voiceEnd: r.end, voiceV: +$('rvolv').value,
      onVoiceError() { $('rinfo').textContent = 'Nu pot încărca înregistrarea. Verifică internetul și încearcă din nou.'; },
      onTick() {
        const e = eng; if (!e || !e.voiceEl) return;
        const t = Math.max(0, e.voiceEl.currentTime - r.start);
        if (t > 0) $('rinfo').textContent = `${fmt(t)} / ${fmt(durataSec)}`;
      },
      onEnd() { arataRec(false); recCurenta = null; sfarsitSesiune(); },
    });
  } catch (err) {
    arataRec(false); recCurenta = null; sesiune = null;
    alert('Nu am putut porni: ' + err.message);
  }
}

$('rstop').onclick = () => { if (eng) finalSunet(); else { arataRec(false); } };
$('rpause').onclick = async () => { $('rpause').textContent = (await pauzaSunet()) ? '▶ Continuă' : '⏸ Pauză'; };
$('rvolv').oninput = () => { if (eng && eng.voiceG) eng.voiceG.gain.value = ($('rvolv').value / 100) ** 2; };
$('rvolf').oninput = () => { if (eng) eng.vol.gain.value = ($('rvolf').value / 100) ** 2 * 0.5; };
deseneazaInregistrari();

/* ============ YouTube: hipnoză și meditație ghidată în română ============
   Playerul oficial YouTube (youtube-nocookie), încărcat doar când apeși „Deschide”. Nu se copiază nimic.
   Nu le-am ascultat eu: titlul, canalul și durata vin de la YouTube. */
const YT = [
  { id: 'Ma3mcNwN6xI', titlu: 'Meditație ghidată pentru relaxare, somn liniștit și gândire pozitivă', canal: 'Dr. Elena Gabor Hypnosis / Hypnotherapy', min: 40, scop: '🌙 Relaxare + somn' },
  { id: 'GR5GWU57Kms', titlu: 'Adormi ușor — meditație ghidată pentru un somn liniștit', canal: 'Georgiana Buta', min: 10, scop: '🌙 Somn, scurt' },
  { id: 'yZOmDHsaP98', titlu: 'Hipnoza de relaxare — întărește-ți încrederea în sine', canal: 'Victoria Danuta', min: 24, scop: '💆 Relaxare, încredere' },
  { id: '8dbCzHSJp4k', titlu: 'Autohipnoză ghidată (gratuit) — echilibru emoțional și relaxare', canal: 'Adrian Rusin', min: 15, scop: '💆 Echilibru emoțional' },
  { id: 'q0QP6ue3fAs', titlu: 'Atac de panică, anxietate — reducere rapidă (autohipnoză)', canal: 'Liliana Ștefan, psihoterapeut somatic', min: 20, scop: '🌬 Anxietate' },
  { id: '7ocJbjeBv7Q', titlu: 'Somn ușor — alunecă într-un somn odihnitor', canal: 'Liliana Ștefan', min: 32, scop: '🌙 Somn' },
  { id: 'e89nxOnrKus', titlu: 'Transă ghidată pentru somn profund (432 Hz)', canal: 'Laurențiu Guran', min: 42, scop: '🌙 Somn profund' },
  { id: 'mnutqwgSs7M', titlu: 'Hipnoză pentru anxietate și relaxare (scurtă)', canal: 'New life', min: 11, scop: '🌬 Anxietate, relaxare' },
  { id: 'YsHAbhYJUBQ', titlu: 'Meditație ghidată pentru începători — relaxare profundă', canal: 'Zen App Meditații Ghidate', min: 26, scop: '💆 Relaxare' },
  { id: 'ryuh27lqpvI', titlu: 'Somn liniștit în 10 minute — sugestii hipnotice', canal: 'Meditații ghidate & Hipnoză', min: 12, scop: '🌙 Somn, scurt' },
];
let ytCurent = null;

function deseneazaYT() {
  $('ytlist').innerHTML = YT.map(v => `<div class="rec" id="yt-${v.id}">
    <b>${esc(v.titlu)}</b> <span class="tag">${v.scop} · ${v.min} min · română</span>
    <p class="mic">${esc(v.canal)} · <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">pe YouTube</a></p>
    <div class="ytslot"></div>
    <button class="small ok" data-id="${v.id}">▶ Deschide</button>
  </div>`).join('');
  $('ytlist').querySelectorAll('button').forEach(b => { b.onclick = () => deschideYT(YT.find(v => v.id === b.dataset.id)); });
}

async function deschideYT(v) {
  if (ytCurent) inchideYT(false);
  if (eng) stopSound(true);
  if (!await inceputSesiune(v.titlu, v.min)) return;
  ytCurent = v;
  const card = $('yt-' + v.id);
  card.querySelector('.ytslot').innerHTML =
    `<div style="position:relative;padding-top:56.25%;margin:8px 0"><iframe style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:12px"
      src="https://www.youtube-nocookie.com/embed/${v.id}?rel=0&playsinline=1&modestbranding=1" title="${esc(v.titlu)}"
      allow="autoplay; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
  const b = card.querySelector('button');
  b.textContent = '✓ Gata'; b.className = 'small no';
  b.onclick = () => inchideYT(true);
}

function inchideYT(intreaba) {
  if (!ytCurent) return;
  const card = $('yt-' + ytCurent.id);
  ytCurent = null;
  if (card) card.querySelector('.ytslot').innerHTML = '';
  deseneazaYT();
  if (intreaba) sfarsitSesiune(); else sesiune = null;
}
deseneazaYT();
