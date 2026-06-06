'use client';

import { useEffect } from 'react';

// Registers the service worker in production so the app is installable/offline-capable.
export function SwRegister() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') return;
        if (!('serviceWorker' in navigator)) return;

        const onLoad = () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                // Registration failures are non-fatal; the app still works online.
            });
        };

        window.addEventListener('load', onLoad);
        return () => window.removeEventListener('load', onLoad);
    }, []);

    return null;
}
