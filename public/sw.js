// Service Worker for PWA with Badge Support
const CACHE_NAME = 'shopping-list-v1';
const STATIC_CACHE = [
  '/',
  '/manifest.json',
  '/icon-192.svg'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(STATIC_CACHE).catch((err) => {
          console.error('Service Worker: Cache addAll failed', err);
          // Continue even if caching fails
          return Promise.resolve();
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseClone = response.clone();
        // Cache the fetched response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_BADGE') {
    const count = event.data.count || 0;
    
    // Try to update badge via Badging API
    if (self.navigator && 'setAppBadge' in self.navigator) {
      if (count > 0) {
        self.navigator.setAppBadge(count).catch((err) => {
          console.error('Failed to set badge:', err);
        });
      } else {
        self.navigator.clearAppBadge().catch((err) => {
          console.error('Failed to clear badge:', err);
        });
      }
    }
    
    // For Android: Update notification badge (requires notification permission)
    if (count > 0 && Notification.permission === 'granted') {
      // Show a silent notification with badge
      self.registration.showNotification('רשימת קניות', {
        body: `יש לך ${count} פריטים ברשימה`,
        badge: '/icon-192.png',
        icon: '/icon-192.png',
        tag: 'shopping-badge',
        renotify: false,
        silent: true,
        data: { count }
      });
    }
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (let client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
