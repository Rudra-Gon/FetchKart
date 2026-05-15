// sw.js

const CACHE_NAME = "fetchkart-v3"; // Incremented cache version

const ASSETS = [
  "/",
  "index.html",
  "shop.html",
  "style.css",
  "js/auth.js",
  "js/main.js",
  "js/theme.js",
  "favicon.png",
];


// ========================================
// Install Event - Cache essential assets
// ========================================
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }),
  );
});


// ========================================
// Activate Event - Remove old caches
// ========================================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
    }),
  );
});


// ========================================
// Fetch Event
//
// Network First Strategy:
// - HTML
// - CSS
// - JS
//
// Cache First Strategy:
// - Images
// - Other static assets
// ========================================
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Detect dynamic assets
  const isDynamicAsset =
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".html") ||
    url.pathname === "/";

  // ====================================
  // Network First for dynamic files
  // Ensures latest updates are fetched
  // ====================================
  if (isDynamicAsset) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone response before caching
          const clonedResponse = response.clone();

          // Update cache with latest version
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });

          return response;
        })

        // If offline, fallback to cache
        .catch(() => {
          return caches.match(event.request);
        }),
    );

    return;
  }

  // ====================================
  // Cache First for static assets
  // Faster loading for images/files
  // ====================================
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    }),
  );
});


// ========================================
// Developed by Rudra-Gon
// Microtech Internship Evaluation Project
// ========================================
