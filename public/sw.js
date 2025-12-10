// Service Worker for PWA with Badge Support
const CACHE_NAME = 'shopping-list-v3';
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
    }).then(() => {
      return self.clients.claim().catch((err) => {
        // Ignore InvalidStateError if it happens, it just means we can't take control immediately
        console.log('Service Worker: Could not claim clients', err);
      });
    })
  );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for http/https schemes
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response
        const responseClone = response.clone();
        // Cache the fetched response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone).catch((err) => {
            console.warn('Failed to cache:', event.request.url, err);
          });
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
  }
  
  // New item notification - show to user when app is in background
  if (event.data && event.data.type === 'NEW_ITEM_ADDED') {
    const { itemName, emoji, addedBy } = event.data;
    
    // Only show notification if permission granted and app is not focused
    if (Notification.permission === 'granted') {
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if any window is focused
          const hasFocusedClient = clientList.some(client => client.visibilityState === 'visible');
          
          // Only notify if app is in background
          if (!hasFocusedClient) {
            self.registration.showNotification('פריט חדש נוסף! 🛒', {
              body: `${emoji} ${itemName}${addedBy ? ` (נוסף ע״י ${addedBy})` : ''}`,
              icon: '/icon-192.svg',
              badge: '/icon-192.svg',
              tag: 'new-item-' + Date.now(),
              renotify: true,
              vibrate: [100, 50, 100],
              data: { url: '/' }
            });
          }
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
