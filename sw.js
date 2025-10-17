// Simple service worker for RCCG Graceland Website
// This handles caching and offline functionality

const CACHE_NAME = 'rccg-graceland-v1';
const urlsToCache = [
  '/',
  '/styles.css',
  '/script.js',
  '/admin.html',
  '/blog.html',
  '/admin-styles.css',
  '/blog-styles.css'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
