'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, reload the page
                  if (confirm('עדכון חדש זמין! לרענן את האפליקציה?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
      
      // Request notification permission for Android badge support
      if ('Notification' in window && Notification.permission === 'default') {
        // Don't request immediately, wait for user interaction
        const requestPermission = () => {
          Notification.requestPermission().then((permission) => {
            console.log('Notification permission:', permission);
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
