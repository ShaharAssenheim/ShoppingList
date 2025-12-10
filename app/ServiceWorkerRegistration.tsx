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
      
      // Request notification permission for Android badge support
      if ('Notification' in window && Notification.permission === 'default') {
        // Don't request immediately, wait for user interaction
        const requestPermission = () => {
          Notification.requestPermission().then((permission) => {
            console.log('[SW] Notification permission:', permission);
          });
          // Remove listener after first interaction
          document.removeEventListener('click', requestPermission);
        };
        document.addEventListener('click', requestPermission, { once: true });
      }
    }
  }, []);

  return null;
}
