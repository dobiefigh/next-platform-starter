// Minimal, network-first service worker.
// Network-first guarantees fresh content when online and falls back to cache when offline.
const CACHE = 'ikigai-v1';

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
            await self.clients.claim();
        })()
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;
    if (new URL(request.url).origin !== self.location.origin) return;

    event.respondWith(
        (async () => {
            try {
                const response = await fetch(request);
                const cache = await caches.open(CACHE);
                cache.put(request, response.clone());
                return response;
            } catch {
                const cached = await caches.match(request);
                if (cached) return cached;
                if (request.mode === 'navigate') {
                    const home = await caches.match('/');
                    if (home) return home;
                }
                throw new Error('Offline and no cached response available.');
            }
        })()
    );
});
