// Service worker for the installable app.
// It keeps a copy of the app shell (the page, scripts and styles) so the app opens
// quickly and shows itself even with a weak connection.
// API requests are never cached: project and task data always comes fresh from the backend.
const CACHE = "novaworks-shell-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle this site's own GET requests. Everything else (the API) goes straight to the network.
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Network first, so a new deployment is picked up at once. The cache is only the fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
  );
});
