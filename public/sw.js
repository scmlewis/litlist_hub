const CACHE_NAME = "litlist-v2";
const STATIC_CACHE = "litlist-static-v2";

const PRECACHE_URLS = ["/", "/auth/signin"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  // Only handle http/https schemes — skip chrome-extension:// etc.
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(navigationHandler(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function navigationHandler(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;

    const offlinePage = await cache.match("/");
    return offlinePage || new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(request)) || new Response("Offline", { status: 503 });
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 408 });
  }
}
