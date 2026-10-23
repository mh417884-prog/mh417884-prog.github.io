/* Research with Mufti Hassan — app-shell service worker (offline shell + install).
   Data always comes from the network/Firestore when available; this caches only
   the static shell so the app opens on weak connections. */
const CACHE = "rwmh-shell-v12";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "https://research-with-mufti-hassan.web.app/assets/logo.png",
  "https://research-with-mufti-hassan.web.app/assets/icon-192.png",
  "https://research-with-mufti-hassan.web.app/assets/icon-512.png",
  "https://research-with-mufti-hassan.web.app/assets/favicon.png",
  "./assets/vendor/qrcode.min.js"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never cache Firebase/CDN traffic
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return r; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.ok && (url.pathname.endsWith(".png") || url.pathname.endsWith(".ttf") || url.pathname.endsWith(".pdf") || url.pathname.endsWith(".svg"))) {
        const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy));
      }
      return r;
    }).catch(() => hit))
  );
});
