// Novarge – çevrimdışı çalışma için önbellek (service worker)
// Uygulama güncellendiğinde SURUM değerini artırın.
const SURUM = 'novarge-v2';
const DOSYALAR = [
  './', 'index.html', 'manifest.json', 'ikon.svg',
  'css/stil.css',
  'fonts/fonts.css',
  'fonts/andika-latin-400-normal.woff2', 'fonts/andika-latin-ext-400-normal.woff2',
  'fonts/andika-latin-700-normal.woff2', 'fonts/andika-latin-ext-700-normal.woff2',
  'fonts/baloo-2-latin-600-normal.woff2', 'fonts/baloo-2-latin-ext-600-normal.woff2',
  'fonts/baloo-2-latin-800-normal.woff2', 'fonts/baloo-2-latin-ext-800-normal.woff2',
  'ikonlar/ikon-192.png', 'ikonlar/ikon-512.png', 'ikonlar/ikon-maskable-512.png',
  'ikonlar/apple-touch-icon.png', 'ikonlar/favicon-32.png',
  'js/veri.js', 'js/ses.js', 'js/cizim.js', 'js/yz.js', 'js/oyunlar.js', 'js/uygulama.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SURUM).then((c) => c.addAll(DOSYALAR)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((k) => Promise.all(k.filter((x) => x !== SURUM).map((x) => caches.delete(x))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Yalnızca bu sitenin GET isteklerini yönet; yapay zeka (api/) istekleri her zaman ağa gider
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.includes('/api/')) return;
  // Önce ağ (güncel sürüm), ağ yoksa önbellek
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) {
          const kopya = r.clone();
          caches.open(SURUM).then((c) => c.put(e.request, kopya));
        }
        return r;
      })
      .catch(() =>
        caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))
      )
  );
});
