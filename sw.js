// Simple service worker for RCCG Graceland Website
// This handles caching and offline functionality

const CACHE_NAME = 'rccg-graceland-v1';

// Get base path for GitHub Pages subdirectory support
// On GitHub Pages: /gracelandweb/
// On Railway/localhost: /
const getBasePath = () => {
  const pathname = self.location.pathname;
  const pathParts = pathname.split('/').filter(part => part.length > 0);
  
  // If service worker is at /gracelandweb/sw.js, base is /gracelandweb
  if (pathParts.length > 0 && !pathParts[0].includes('.')) {
    return `/${pathParts[0]}`;
  }
  return '';
};

const basePath = getBasePath();

const urlsToCache = [
  `${basePath}/`,
  `${basePath}/index.html`,
  `${basePath}/styles.css`,
  `${basePath}/script.js`,
  `${basePath}/blog.html`,
  `${basePath}/blog-styles.css`,
  `${basePath}/logo.png`
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
