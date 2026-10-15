/* Service worker: lets the installed app open offline and load instantly.
   Bump VERSION whenever you publish changes so phones pick up the new files. */
const VERSION = "reyan-v1";
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "mobile.css",
  "site-data.js",
  "script.js",
  "app.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  // Only handle our own files; YouTube, fonts, audio etc. go straight to the network.
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // Pages: network first so content stays fresh, cached copy when offline.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put("index.html", copy)); }
          return res;
        })
        .catch(() => caches.match("index.html"))
    );
    return;
  }

  // Other files: serve from cache, refresh in the background.
  e.respondWith(
    caches.match(req).then((cached) => {
      const fresh = fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
