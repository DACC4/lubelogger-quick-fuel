const CACHE_NAME = 'fuel-logger-v1';
const RUNTIME_CACHE = 'runtime-cache';

// Resources to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/static/js/main.bundle.js',
  '/static/css/main.bundle.css',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/vehicles',
  '/api/vehicle/info'
];

// Install event - precache static resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      })
      .then(cachesToDelete => {
        return Promise.all(cachesToDelete.map(cacheToDelete => {
          return caches.delete(cacheToDelete);
        }));
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', event => {
  // Handle API requests
  if (event.request.url.includes('/api/')) {
    // For API requests, try network first, then cache
    event.respondWith(
      handleAPIRequest(event.request)
    );
    return;
  }

  // For non-API requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME_CACHE)
          .then(cache => {
            return fetch(event.request)
              .then(response => {
                // Cache valid responses
                if (response.status === 200) {
                  cache.put(event.request, response.clone());
                }
                return response;
              })
              .catch(() => {
                // If offline and resource not cached, return offline page
                if (event.request.mode === 'navigate') {
                  return caches.match('/offline.html');
                }
                return null;
              });
          });
      })
  );
});

// Handle API requests with specific caching strategy
async function handleAPIRequest(request) {
  // Check if this is a GET request to an endpoint we want to cache
  const shouldCache = request.method === 'GET' && 
    API_ENDPOINTS.some(endpoint => request.url.includes(endpoint));

  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful GET responses for specific endpoints
    if (shouldCache && response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache, return error response
    return new Response(JSON.stringify({ error: 'Network error' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Background sync for pending fuel logs
self.addEventListener('sync', event => {
  if (event.tag === 'sync-fuel-logs') {
    event.waitUntil(syncPendingLogs());
  }
});

// Handle push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Logs',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Fuel Logger', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i];
            }
          }
          return client.focus();
        }
        return clients.openWindow('/');
      })
  );
});

// Helper function to sync pending logs
async function syncPendingLogs() {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const requests = await cache.keys();
    const pendingLogs = requests.filter(request => 
      request.url.includes('/api/vehicle/gasrecords/add')
    );

    const syncPromises = pendingLogs.map(async request => {
      try {
        const response = await fetch(request.clone());
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.error('Failed to sync log:', error);
      }
    });

    await Promise.all(syncPromises);
  } catch (error) {
    console.error('Sync failed:', error);
  }
}