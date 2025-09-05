// public/sw.js
const CACHE_VERSION = 'v4'
const APP_CACHE = `greensweveseen-${CACHE_VERSION}`
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  )
})

self.addEventListener('activate', (event) => {
  // Claim control of uncontrolled clients as soon as SW activates
  self.clients.claim()
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((name) => {
          if (name !== APP_CACHE) return caches.delete(name)
        })
      )
    )
  )
})

function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html')
}

function isStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/')
}

function isImage(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)
}

function isAPI(url) {
  return url.pathname.startsWith('/api/')
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  // Only handle same-origin
  if (url.origin !== location.origin) return

  if (isAPI(url)) {
    // Network-first for APIs; do not cache auth-sensitive data
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    )
    return
  }

  if (isHTMLRequest(request)) {
    // Network-first for navigation/doc
    event.respondWith(
      fetch(request)
        .then((res) => {
          const resClone = res.clone()
          caches.open(APP_CACHE).then((cache) => cache.put(request, resClone))
          return res
        })
        .catch(async () => {
          const cached = await caches.match(request)
          // Fall back to cached homepage if available
          return cached || caches.match('/')
        })
    )
    return
  }

  if (isStaticAsset(url)) {
    // Cache-first for hashed static assets
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((res) => {
          const resClone = res.clone()
          caches.open(APP_CACHE).then((cache) => cache.put(request, resClone))
          return res
        })
      })
    )
    return
  }

  if (isImage(url)) {
    // Stale-while-revalidate for images
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((res) => {
          const resClone = res.clone()
          caches.open(APP_CACHE).then((cache) => cache.put(request, resClone))
          return res
        })
        return cached || fetchPromise
      })
    )
    return
  }

  // Default: try cache, then network
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  )
})

// Optional: SW update broadcast to clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
