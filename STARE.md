# Stare — Unde Binaurale (PWA)

Actualizat: 2026-10-24

## Unde suntem
Aplicație web instalabilă (PWA), în română, publicată pe GitHub Pages: https://almeueste777-ops.github.io/binaural/
Depozit public: `almeueste777-ops/binaural`, branch `main`, rădăcina = site-ul. Fără server, fără cont, datele stau în telefon (localStorage).
- `sound.js` programe (8) + motor Web Audio (binaural/izocronic, zgomot, muzică generată, fișier propriu)
- `guide.js` respirație, relaxare musculară, hipnoză cu voce (speechSynthesis ro-RO)
- `cards.js` carduri cu repetiție spațiată; `journal.js` jurnal înainte/după + copie de siguranță
- `recordings.js` 4 înregistrări cu voci reale (engleză, CC NC) redate de pe archive.org prin același mixaj; segmente `start`/`end` verificate cu Whisper
- `recordings.js` conține și lista YT: 10 videoclipuri YouTube românești (hipnoză/meditație) în player oficial youtube-nocookie, deschise la cerere; neascultate de mine
- `setBeat(hz,secs)` în sound.js: ramp dinamic al bătăii; guide.js pune câmpul `b` pe fiecare pas al scripturilor
- `app.js` utilitare + tab-uri; `sw.js` cache offline (crește `V` la fiecare publicare)

## Ce e deschis
- NEPROBAT pe iPhone real: sunet cu ecranul blocat, comutatorul de silențios, vocea românească (Setări → Accesibilitate → Conținut rostit → Voci → Română), instalarea pe ecranul de pornire.
- Testat doar în Edge headless: pornește/oprește, ghid, carduri, jurnal, fără erori. Nu s-a ascultat sunetul.
- Textele de hipnoză sunt scrise de mine; de citit de Otilia și ajustat.

- Română: nu există sesiune de hipnoză cu licență liberă găsită (singura română de pe archive.org, Maia Martin, e poezie citită, BY-ND). Opțiune: ea își înregistrează vocea în aplicație.
- Înregistrările depind de archive.org (nu sunt copiate în depozit).

## Ce urmează
- Probă pe iPhone; corecții după ce spune ce nu merge.
- Posibil: sunet-cheie în somn, alarmă blândă, mai multe scripturi.

## Cum se pornește / se publică
Local: `python -I -m http.server 8765` în acest folder. Publicare: `git push origin main` (Pages se reface în ~1 minut); mărește `V` în `sw.js` ca telefonul să ia versiunea nouă.
