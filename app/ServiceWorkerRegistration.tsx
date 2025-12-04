'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Unregister any existing service workers first to prevent invalid state
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        const hasInvalidWorker = registrations.some(reg => !reg.active);
        
        if (hasInvalidWorker) {
          console.log('[SW] Cleaning up invalid service workers...');
          Promise.all(registrations.map(reg => reg.unregister()))
            .then(() => {
              console.log('[SW] All service workers unregistered, reloading...');
              window.location.reload();
            });
          return;
        }
      });

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
          console.error('[SW] Service Worker registration failed:', error);
          
          // If registration fails, try to unregister all and reload
          if (error.name === 'InvalidStateError') {
            console.log('[SW] Invalid state detected, cleaning up...');
            navigator.serviceWorker.getRegistrations().then((registrations) => {
              Promise.all(registrations.map(reg => reg.unregister()))
                .then(() => {
                  console.log('[SW] Cleanup complete, reloading...');
                  setTimeout(() => window.location.reload(), 500);
                });
            });
          }
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
