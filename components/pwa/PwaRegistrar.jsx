'use client';

import { useEffect } from 'react';

/**
 * PwaRegistrar Component
 * Registers the service worker safely in modern browsers.
 * Non-blocking, zero-overhead, zero impact on initial hydration or SSR.
 */
export function PwaRegistrar() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('.local')
    ) {
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            // Service worker successfully registered
            if (process.env.NODE_ENV === 'development') {
              console.log('[PWA] Service Worker registered. Scope:', registration.scope);
            }
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
        return () => window.removeEventListener('load', registerSW);
      }
    }
  }, []);

  return null;
}

export default PwaRegistrar;
