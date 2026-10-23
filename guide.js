'use strict';

/* Ghid: respirație, relaxare musculară progresivă, ședințe de hipnoză vorbite. */
let gId = 0;            // se schimbă la fiecare pornire/oprire; pașii vechi se opresc singuri
let gDorm = null;       // anulează așteptarea curentă
let gVoce = null;
let gRuleaza = false;

const RESP = {
  r478: { nume: 'Respirație 4-7-8', faze: [['Inspiră', 4], ['Ține', 7], ['Expiră', 8]] },
  box:  { nume: 'Respirație pătrată', faze: [['Inspiră', 4], ['Ține', 4], ['Expiră', 4], ['Ține', 4]] },
  coer: { nume: 'Respirație coerentă (5,5/min)', faze: [['Inspiră', 5.5], ['Expiră', 5.5]] },
};
const NUMERE = { 10: 'Zece', 9: 'Nouă', 8: 'Opt', 7: 'Șapte', 6: 'Șase', 5: 'Cinci', 4: 'Patru', 3: 'Trei', 2: 'Doi', 1: 'Unu' };

function alegeVoce() {
  if (!window.speechSynthesis) return;
  gVoce = speechSynthesis.getVoices().find(v => /^ro/i.test(v.lang)) || null;
  $('gnota').hidden = !!gVoce || !window.speechSynthesis;
}
if (window.speechSynthesis) {
  alegeVoce();
  speechSynthesis.onvoiceschanged = alegeVoce;
} else {
  $('gnota').hidden = false;
  $('gnota').textContent = 'Acest browser nu are voce. Textul apare pe ecran și poți citi.';
}

function dormi(ms) {
  return new Promise(res => {
    const t = setTimeout(res, ms);
    gDorm = () => { clearTimeout(t); res(); };
  });
}

function spune(text, vol) {
  const cuvinte = text.split(/\s+/).length;
  return new Promise(res => {
    if (!$('gvoce').checked || !window.speechSynthesis) { setTimeout(res, cuvinte * 450); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ro-RO'; if (gVoce) u.voice = gVoce;
    u.rate = 0.8; u.pitch = 0.9; u.volume = vol || 1;
    let gata = false;
    const f = () => { if (!gata) { gata = true; clearTimeout(tm); res(); } };
    const tm = setTimeout(f, cuvinte * 700 + 4000); // plasă de siguranță dacă onend nu vine
    u.onend = f; u.onerror = f;
    speechSynthesis.speak(u);
  });
}

/* ---------- scripturi ---------- */
function scriptRelaxare() {
  const s = [];
  let B = 10;
  const add = (t, p) => s.push({ t, p, b: B });
  add('Întinde-te sau stai comod. Vom încorda pe rând grupe de mușchi, vom ține câteva secunde, apoi vom lăsa totul să se relaxeze. Încordează doar cât simți, fără durere.', 6);
  const grupe = ['Pumnii și antebrațele: strânge pumnii', 'Brațele: îndoaie coatele și încordează mușchii', 'Fruntea: ridică sprâncenele',
    'Ochii și obrajii: strânge ușor ochii', 'Maxilarul: apasă ușor dinții', 'Umerii: ridică-i spre urechi',
    'Pieptul și spatele: trage omoplații înapoi', 'Abdomenul: strânge-l', 'Coapsele și fesele: strânge-le',
    'Pulpele: trage degetele de la picioare spre tine', 'Tălpile: strânge degetele de la picioare'];
  grupe.forEach((g, i) => {
    B = 10 - i * 0.15; // alpha care coboară lent pe parcursul relaxării
    add(g + '. Inspiră și încordează... ține.', 5);
    add('Și acum expiră, și relaxează complet. Simte diferența, căldura, greutatea.', 10);
  });
  B = 8;
  add('Observă tot corpul, greu și relaxat. Rămâi așa câteva respirații.', 20);
  B = 11;
  add('Când ești gata, mișcă ușor degetele și deschide ochii.', 3);
  return s;
}

function scriptHipnoza(min, final) {
  const s = [];
  let B = 10; // frecvența de bătaie (Hz) a fazei curente; undele urmăresc ședința
  const add = (t, p) => s.push({ t, p: Math.round(p * m * 10) / 10, b: B });
  const m = Math.min(1.5, Math.max(0.5, min / 10));
  add('Așază-te sau întinde-te într-o poziție comodă. Nu ai nimic de făcut și nimic de rezolvat acum.', 6);
  add('Lasă ochii să se închidă. Fă o respirație mai adâncă, pe nas, și lasă aerul să iasă încet, pe gură.', 8);
  add('Încă una. Inspiră liniștit... și expiră, lăsând greutatea să plece din umeri.', 8);
  add('Doar observă respirația, exact așa cum este. Nu trebuie să o schimbi.', 10);
  const corp = ['fruntea', 'ochii și obrajii', 'maxilarul', 'gâtul și umerii', 'brațele și mâinile', 'pieptul', 'abdomenul', 'spatele', 'șoldurile', 'picioarele'];
  const k = min <= 5 ? 5 : min <= 10 ? 8 : 10;
  corp.slice(0, k).forEach((p, i) => { B = 9 - i * 0.12; add(`Adu atenția la ${p}. Observă ce simți acolo și lasă să se înmoaie, să devină mai greu, mai cald, mai relaxat.`, 7); });
  B = 8;
  add('Acum imaginează-ți o scară cu zece trepte, care coboară încet. Voi număra înapoi, și cu fiecare număr te vei relaxa mai profund.', 6);
  for (let n = 10; n >= 1; n--) { B = 8 - (10 - n) * 0.25; add(n > 1 ? `${NUMERE[n]}. Cobori o treaptă și te relaxezi mai profund.` : 'Unu. Ai ajuns jos, într-o liniște adâncă.', 6); }
  B = 6;
  add('Imaginează-ți acum un loc în care te simți complet în siguranță și liniștit. Poate fi real sau inventat. Observă ce vezi, ce auzi, ce miros are, și cât de confortabil este corpul tău acolo.', 20);
  B = 5.5; // theta joasă: starea cea mai receptivă pentru sugestii
  add('Din acest loc liniștit, mintea ta este deschisă și receptivă. Voi spune câteva idei, iar tu le primești cu blândețe.', 5);
  let sug = $('sug').value.split('\n').map(x => x.trim()).filter(Boolean);
  if (!sug.length) sug = ['Ești calm și în siguranță.', 'Mintea ta este limpede și atentă.', 'Fiecare zi te găsește puțin mai încrezător.'];
  sug.forEach(x => add(x, 10));
  add('Rămâi o clipă cu aceste idei, în liniște.', 15);
  sug.forEach(x => add(x, 8));
  add('Rămâi aici cât vrei, în liniște.', 25);
  if (final === 'somn') {
    B = 4;
    add('Nu mai este nevoie să asculți. Lasă vocea mea să se îndepărteze, ca o muzică în depărtare.', 8);
    B = 3;
    add('Cu fiecare respirație ești tot mai greu, tot mai somnoros. Poți adormi acum, într-un somn liniștit și odihnitor.', 15);
    B = 2;
    add('Noapte bună.', 5);
  } else {
    B = 7;
    add('Acum este timpul să revii, în ritmul tău. Voi număra de la unu la cinci, și cu fiecare număr devii mai treaz și mai plin de energie.', 5);
    B = 8.5; add('Unu. Simți corpul, greutatea lui, locul în care ești.', 4);
    B = 10; add('Doi. Mișcă ușor degetele de la mâini și de la picioare.', 4);
    B = 11.5; add('Trei. Fă o respirație adâncă și lasă energia să revină în tot corpul.', 4);
    B = 13; add('Patru. Auzi sunetele din jur, ești aproape complet prezent.', 4);
    B = 14; add('Cinci. Deschide ochii. Ești treaz, odihnit, calm și atent. Bine ai revenit.', 3);
  }
  return s;
}

const durataScript = s => s.reduce((a, x) => a + x.p + x.t.split(/\s+/).length * 0.75, 0);

/* ---------- rulare ---------- */
function arataGhid(on) {
  gRuleaza = on;
  $('ggo').textContent = on ? '■ Oprește' : '▶ Începe';
  $('ggo').classList.toggle('stop', on);
  $('gstage').hidden = !on;
}

async function ruleazaScript(steps, id) {
  for (let i = 0; i < steps.length; i++) {
    if (id !== gId) return false;
    $('gtext').textContent = steps[i].t;
    $('gprog').style.width = (i / steps.length * 100) + '%';
    if (steps[i].b && eng) setBeat(steps[i].b, steps[i].p + 8); // undele urmăresc faza ședinței
    await spune(steps[i].t, $('gfinal').value === 'somn' && $('gtip').value === 'hip' ? 0.75 : 1);
    if (id !== gId) return false;
    await dormi(steps[i].p * 1000);
  }
  return true;
}

async function ruleazaRespiratie(def, min, id) {
  const sfarsit = Date.now() + min * 60000;
  const cerc = $('cerc');
  while (Date.now() < sfarsit) {
    for (const [eticheta, sec] of def.faze) {
      if (id !== gId) return false;
      $('gtext').textContent = eticheta;
      cerc.style.transition = `transform ${sec}s ease-in-out`;
      if (eticheta === 'Inspiră') cerc.style.transform = 'scale(1)';
      else if (eticheta === 'Expiră') cerc.style.transform = 'scale(0.45)';
      if ($('gvoce').checked && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(eticheta); u.lang = 'ro-RO'; if (gVoce) u.voice = gVoce; u.rate = 0.85;
        speechSynthesis.cancel(); speechSynthesis.speak(u);
      }
      for (let r = Math.ceil(sec); r > 0; r--) {
        $('gsub').textContent = r;
        $('gprog').style.width = Math.min(100, (1 - (sfarsit - Date.now()) / (min * 60000)) * 100) + '%';
        await dormi(Math.min(1000, sec * 1000 - (Math.ceil(sec) - r) * 1000));
        if (id !== gId) return false;
      }
    }
  }
  return true;
}

function opresteGhid(natural) {
  gId++;
  if (gDorm) gDorm();
  if (window.speechSynthesis) speechSynthesis.cancel();
  $('cerc').style.transition = 'none'; $('cerc').style.transform = 'scale(0.45)';
  const somn = $('gtip').value === 'hip' && $('gfinal').value === 'somn' && natural;
  if (eng && !somn) { // fundal: se stinge lin
    const e = eng;
    try { e.vol.gain.cancelScheduledValues(e.ctx.currentTime); e.vol.gain.setTargetAtTime(0, e.ctx.currentTime, 0.8); } catch (_) {}
    setTimeout(() => { if (eng === e) stopSound(true); }, 3000);
  }
  arataGhid(false);
  sfarsitSesiune();
}

async function porniGhid() {
  const tip = $('gtip').value, id = ++gId;
  const min = +$('gmin').value;
  let steps = null, minTotal = min;
  if (tip === 'pmr') { steps = scriptRelaxare(); minTotal = Math.ceil(durataScript(steps) / 60); }
  if (tip === 'hip') { steps = scriptHipnoza(min, $('gfinal').value); minTotal = Math.ceil(durataScript(steps) / 60); }
  const nume = tip === 'pmr' ? 'Relaxare musculară' : tip === 'hip' ? 'Hipnoză' : RESP[tip].nume;

  if (!await inceputSesiune(nume, minTotal)) { gId++; return; }
  if (id !== gId) return;
  arataGhid(true);
  $('gcerc').hidden = !(tip in RESP);
  $('gsub').textContent = '';
  $('gtext').textContent = '';
  if (window.speechSynthesis) { speechSynthesis.cancel(); } // deblochează vocea pe iPhone (în gestul utilizatorului)

  if (tip !== 'r478' && tip !== 'box' && tip !== 'coer' && $('gfond').checked) {
    const somn = tip === 'hip' && $('gfinal').value === 'somn';
    const prog = progById(tip === 'hip' ? (somn ? 'somn' : 'medit') : 'relax');
    try {
      await startSound({
        prog, min: somn ? 25 : Math.max(5, minTotal + 1), mode: 'bin', noise: 'brown', noiseV: 40,
        vol: +$('gvol').value, music: 'none', musicV: 0, file: null, wake: $('wake').checked,
        onTick() {}, onEnd() {},
      });
    } catch (_) {}
  }
  if (id !== gId) return;

  const ok = tip in RESP ? await ruleazaRespiratie(RESP[tip], min, id) : await ruleazaScript(steps, id);
  if (ok && id === gId) {
    $('gtext').textContent = 'Gata.';
    $('gprog').style.width = '100%';
    await dormi(1500);
    if (id === gId) opresteGhid(true);
  }
}

function actualizeazaGhid() {
  const tip = $('gtip').value;
  $('gminbox').hidden = tip === 'pmr';
  $('ghipbox').hidden = tip !== 'hip';
  $('gfondbox').hidden = tip in RESP;
  $('gdesc').textContent = {
    r478: 'Inspiri 4 secunde, ții 7, expiri 8. Calmează sistemul nervos; bun înainte de somn.',
    box: 'Patru timpi egali: inspiri, ții, expiri, ții. Echilibrează înainte de un examen sau o discuție dificilă.',
    coer: 'Aproximativ 5,5 respirații pe minut: ritmul la care pulsul se sincronizează cel mai bine cu respirația.',
    pmr: 'Încordezi și relaxezi pe rând grupe de mușchi. Durează în jur de 12 minute.',
    hip: 'Relaxare, scară în jos, loc sigur, apoi sugestiile tale și trezire (sau somn).',
  }[tip];
}

$('gtip').onchange = actualizeazaGhid;
$('ggo').onclick = () => { if (gRuleaza) opresteGhid(false); else porniGhid(); };
$('sug').value = citeste('bin.sugestii', '');
$('sug').oninput = () => scrie('bin.sugestii', $('sug').value);
actualizeazaGhid();
