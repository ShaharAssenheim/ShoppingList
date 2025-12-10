'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker with error handling
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[SW] Service Worker registered:', registration);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update().catch(err => {
              console.warn('[SW] Update check failed:', err);
            });
          }, 60000); // Check every minute
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log('[SW] New content is available; please refresh.');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[SW] Service Worker registration failed:', error);
          // Just log the error, don't reload the page
        });
      
      // Request notification permission
      if ('Notification' in window) {
        console.log('[SW] Current notification permission:', Notification.permission);
        
        if (Notification.permission === 'default') {
          // Request permission after a short delay (gives user time to see the app)
          setTimeout(() => {
            Notification.requestPermission().then((permission) => {
              console.log('[SW] Notification permission result:', permission);
            });
          }, 2000);
        }
      }
    }
  }, []);

  return null;
}
