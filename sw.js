// sw.js
const CACHE_NAME = 'fetchkart-v2'; // Incremented version
const ASSETS = [
    '/',
    'index.html',
    'shop.html',
    'style.css',
    'js/auth.js',
    'js/main.js',
    'js/theme.js',
    'favicon.png'
];

// Install Event - Caching basic assets
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

// Activate Event - Cleaning up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

// Fetch Event - Network first for CSS/JS, Cache first for others
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Use Network First strategy for CSS and JS to ensure latest updates
    if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.includes('shop.html')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
    } else {
        // Default: Cache first, falling back to network
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
    }
});

