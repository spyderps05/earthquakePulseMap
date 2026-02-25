/// <reference lib="webworker" />

const SW_VERSION = "v1.0.0";
const CACHE_NAME = `gimu-eq-${SW_VERSION}`;

const PRECACHE_URLS: string[] = [
    "/",
    "/data/earthquakes.bin",
    "/data/coastline.bin",
    "/data/earthquakes-stats.json",
    "/branding/splash.png",
    "/branding/favicon.png",
    "/favicon/favicon-96x96.png",
    "/favicon/favicon.ico",
    "/favicon/apple-touch-icon.png",
    "/favicon/site.webmanifest",
];

// Add all font files
const FONT_FILES = [
    "/geologica/Geologica-Medium.woff2",
];

const ALL_PRECACHE = [...PRECACHE_URLS, ...FONT_FILES];

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(ALL_PRECACHE))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_NAME)
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // USGS API — network first, fall back to cache
    if (url.hostname === "earthquake.usgs.gov") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request).then((r) => r || new Response("", { status: 503 }))),
        );
        return;
    }

    // Static assets — cache first, fall back to network
    if (request.method === "GET" && url.origin === self.location.origin) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                });
            }),
        );
        return;
    }

    event.respondWith(fetch(request));
});
