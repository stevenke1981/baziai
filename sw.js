/**
 * sw.js — 八字命盤 Service Worker
 * cache-first 靜態資源；導航請求 network-first 回退首頁（離線可開啟）
 */
const CACHE = 'baziai-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/base.css',
    '/css/layout.css',
    '/css/components.css',
    '/css/pages.css',
    '/js/app.js',
    '/js/bazi.js',
    '/js/lunming.js',
    '/js/lunming2.js',
    '/js/geju.js',
    '/js/geju-ref.js',
    '/js/data.js',
    '/js/config.js',
    '/js/store.js',
    '/js/error.js',
    '/icon-192.png',
    '/icon-512.png',
    '/icon-maskable-192.png',
    '/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE)
            .then((cache) => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    // 導航（頁面）請求：network-first，離線回退快取首頁
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req).catch(() => caches.match('/index.html'))
        );
        return;
    }

    // 其餘靜態資源：cache-first，並在取得後回填快取
    event.respondWith(
        caches.match(req).then((cached) => {
            if (cached) return cached;
            return fetch(req).then((res) => {
                if (res && res.status === 200 && res.type === 'basic') {
                    const copy = res.clone();
                    caches.open(CACHE).then((cache) => cache.put(req, copy));
                }
                return res;
            }).catch(() => cached);
        })
    );
});
