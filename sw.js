/* Service worker: lets the installed app open offline and load instantly.
   Files load from the network first (always fresh) and fall back to the cache offline. */
const VERSION = "rem-v17";
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
  "images/logo-mark-white.png",
  "images/logo-full-white.png",
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
  // The admin and its private data always come fresh from the network.
  if (/\/admin(\/|$)/.test(url.pathname)) return;
  if (url.pathname.includes("/api/") && !url.pathname.endsWith("/api/content")) return;
  // Big downloads (PDF books, audio) go straight to the network and are not stored offline.
  if (/\.(pdf|mp3|m4a|wav|zip)$/i.test(url.pathname)) return;

  // Network first so updates show immediately; cached copy when offline.
  // cache: "no-cache" asks the server every time, so a new upload shows up straight away.
  const key = req.mode === "navigate" ? "index.html" : req;
  const fresh = req.mode === "navigate"
    ? fetch(req.url, { cache: "no-cache", credentials: "same-origin" })
    : fetch(req, { cache: "no-cache" });
  e.respondWith(
    fresh
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(key, copy)); }
        return res;
      })
      .catch(() => caches.match(key, { ignoreSearch: true }))
  );
});
