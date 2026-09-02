const CACHE_VERSION = "20260903000412";
const APP_CACHE = `romana-salon-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline/";

const PRECACHE_URLS = [
  "/",
  "/storitve/",
  "/neolifting/",
  "/paketi/",
  "/o-meni/",
  "/narocanje/",
  "/kontakt/",
  "/kazalo-strani/",
  "/zasebnost/",
  "/blog/",
  OFFLINE_URL,
  "/assets/css/main.css",
  "/assets/js/main.js",
  "/assets/fonts/source-sans-3-normal-latin.woff2",
  "/assets/fonts/source-sans-3-normal-latin-ext.woff2",
  "/assets/fonts/source-sans-3-italic-latin.woff2",
  "/assets/fonts/source-sans-3-italic-latin-ext.woff2",
  "/assets/fonts/pinyon-script-hero.woff2",
  "/assets/images/logo.svg",
  "/assets/images/hero-romana-salon-480w.webp",
  "/assets/images/card-rocni-obrazni-rituali-320w.webp",
  "/assets/images/card-strokovne-nege-koze-320w.webp",
  "/assets/images/card-nega-telesa-320w.webp",
  "/assets/images/card-nega-stopal-320w.webp",
  "/assets/images/card-depilacija-320w.webp",
  "/assets/images/romana-kozmeticarka-320w.webp",
  "/assets/images/blog-abhyanga-ajurvedska-masaza-480w.webp",
  "/assets/images/blog-kansa-wand-480w.webp",
  "/assets/images/sumup-booking/01-izbira-storitve.webp",
  "/assets/images/icon-192.png",
  "/assets/images/icon-512.png",
  "/assets/images/apple-touch-icon.png",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("romana-salon-") && key !== APP_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(APP_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_error) {
    return (await caches.match(request)) || caches.match(OFFLINE_URL);
  }
}

async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response && response.ok) {
      const responseClone = response.clone();
      caches.open(APP_CACHE).then((cache) => cache.put(request, responseClone));
    }
    return response;
  });

  return cachedResponse || fetchPromise;
}
