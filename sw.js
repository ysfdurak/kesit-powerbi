/* Kesit Power BI service worker: önce ağ, ağ yoksa son kaydedilen kopya.
   Kurulumda uygulama dosyaları önbelleğe alınır; yeni sürümde eski önbellekler silinir. Sürüm ghpack.sh ile yazılır. */
const CACHE = 'kesit-powerbi-2df5d5e140';
const CORE = ['./', './index.html', './kesit.js', './config.js', './vendor/fonts.css', './favicon.svg', './manifest.webmanifest'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('kesit-powerbi-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); }
    return res;
  }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});
