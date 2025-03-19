const CACHE_NAME = "customer-complaint-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  // Check if the request is an API request
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      // First check if we're online
      Promise.resolve(self.navigator.onLine).then((isOnline) => {
        if (isOnline) {
          // If online, try network first
          return fetch(event.request.clone())
            .then((response) => {
              if (!response || response.status !== 200) {
                return response;
              }

              // Clone the response
              const responseToCache = response.clone();

              caches.open("api-cache").then((cache) => {
                cache.put(event.request, responseToCache);
              });

              return response;
            })
            .catch(() => {
              // If network fails while online, try cache
              return caches.match(event.request);
            });
        } else {
          // If offline, try cache first
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cache available, return offline response
            return new Response(
              JSON.stringify({
                error: "You are offline",
                offline: true,
                timestamp: new Date().toISOString(),
              }),
              {
                headers: { "Content-Type": "application/json" },
              }
            );
          });
        }
      })
    );
  } else {
    // For non-API requests
    event.respondWith(
      Promise.resolve(self.navigator.onLine).then((isOnline) => {
        if (isOnline) {
          return fetch(event.request).catch(() => caches.match(event.request));
        } else {
          return caches
            .match(event.request)
            .then((cachedResponse) => cachedResponse || fetch(event.request));
        }
      })
    );
  }
});
