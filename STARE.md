# Stare — Unde Binaurale (PWA)

Actualizat: 2026-10-23

## Unde suntem
Aplicație web instalabilă (PWA), în română, publicată pe GitHub Pages: https://almeueste777-ops.github.io/binaural/
Depozit public: `almeueste777-ops/binaural`, branch `main`, rădăcina = site-ul. Fără server, fără cont, datele stau în telefon (localStorage).
- `sound.js` programe (8) + motor Web Audio (binaural/izocronic, zgomot, muzică generată, fișier propriu)
- `guide.js` respirație, relaxare musculară, hipnoză cu voce (speechSynthesis ro-RO)
- `cards.js` carduri cu repetiție spațiată; `journal.js` jurnal înainte/după + copie de siguranță
- `app.js` utilitare + tab-uri; `sw.js` cache offline (crește `V` la fiecare publicare)

## Ce e deschis
- NEPROBAT pe iPhone real: sunet cu ecranul blocat, comutatorul de silențios, vocea românească (Setări → Accesibilitate → Conținut rostit → Voci → Română), instalarea pe ecranul de pornire.
- Testat doar în Edge headless: pornește/oprește, ghid, carduri, jurnal, fără erori. Nu s-a ascultat sunetul.
- Textele de hipnoză sunt scrise de mine; de citit de Otilia și ajustat.

## Ce urmează
- Probă pe iPhone; corecții după ce spune ce nu merge.
- Posibil: sunet-cheie în somn, alarmă blândă, mai multe scripturi.

## Cum se pornește / se publică
Local: `python -I -m http.server 8765` în acest folder. Publicare: `git push origin main` (Pages se reface în ~1 minut); mărește `V` în `sw.js` ca telefonul să ia versiunea nouă.
