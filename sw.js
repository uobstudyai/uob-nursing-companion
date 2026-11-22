// UoB Nursing AI Companion: service worker. It only makes the site installable and shows the last
// copy of the page when the phone is offline. Pages always come from the network first, so a new
// version on GitHub reaches students straight away. API calls and other sites are never touched.
const CACHE = 'uob-companion-v19';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './icon-192.png'])).catch(() => {}));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok && r.mode === 'navigate') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
    return res;
  }).catch(() => caches.match(r).then(m => m || caches.match('./')).then(m => m || new Response('You are offline. Connect to the internet and try again.', { status: 503, headers: { 'Content-Type': 'text/plain' } }))));
});
