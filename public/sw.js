const CACHE_NAME = "salon-ai-v6";
const ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/theme-toggle.js",
  "/app.js",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-maskable.svg",
  "/Salon_AI_IMG.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      ),
      self.clients.claim()
    ])
  );
});

function shouldRefreshFromNetwork(url) {
  return (
    url.pathname === "/" ||
    url.pathname === "/index.html" ||
    url.pathname === "/styles.css" ||
    url.pathname === "/app.js" ||
    url.pathname === "/dashboard.html" ||
    url.pathname === "/dashboard.js" ||
    url.pathname === "/auth.html" ||
    url.pathname === "/auth.js" ||
    url.pathname === "/theme-toggle.js" ||
    url.pathname === "/manifest.webmanifest"
  );
}

async function networkFirst(request, fallbackPath = null) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallbackPath) {
      const fallback = await caches.match(fallbackPath);
      if (fallback) return fallback;
    }
    throw new Error("offline");
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isApiRequest = isSameOrigin && url.pathname.startsWith("/api/");
  const isNavigation = event.request.mode === "navigate";
  const isPrecachedAsset = isSameOrigin && ASSETS.includes(url.pathname);
  const isIconAsset = isSameOrigin && url.pathname.startsWith("/icons/");
  const isStaticFile = isSameOrigin && /\.(?:css|js|png|svg|jpg|jpeg|webp|ico|woff2?)$/i.test(url.pathname);

  // Never cache API traffic to avoid stale or private data leaks.
  if (isApiRequest) return;
  // Only cache navigations and static assets we explicitly recognize.
  if (!isNavigation && !isPrecachedAsset && !isIconAsset && !isStaticFile) return;

  if (isNavigation || shouldRefreshFromNetwork(url)) {
    event.respondWith(networkFirst(event.request, "/index.html"));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || !response.ok || !isSameOrigin) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => (event.request.mode === "navigate" ? caches.match("/index.html") : Promise.reject()));
    })
  );
});
