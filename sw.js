const V = 'binaural-v3';
const FISIERE = ['./', 'index.html', 'app.js', 'journal.js', 'sound.js', 'guide.js', 'recordings.js', 'cards.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FISIERE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// întâi rețeaua (ca actualizările să ajungă), apoi memoria locală când nu e internet
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return; // înregistrările de pe internet nu se salvează
  e.respondWith(fetch(e.request).then(r => {
    const copie = r.clone();
    caches.open(V).then(c => c.put(e.request, copie));
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
