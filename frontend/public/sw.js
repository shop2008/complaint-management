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
      caches.match(event.request).then((response) => {
        if (response) {
          // Return cached response
          return response;
        }

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
            // Return a custom offline response for API requests
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
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
