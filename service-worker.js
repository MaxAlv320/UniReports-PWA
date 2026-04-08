const CACHE = "georeport-v2";

const ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/css/styles.css",
  "/js/app.js",
  "/js/db.js",
  "/js/sync.js",
  "/manifest.json",
];

// INSTALAR
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

// FETCH (offline fallback)
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .catch(() => caches.match(e.request))
      .then((res) => res || caches.match("/offline.html")),
  );
});
