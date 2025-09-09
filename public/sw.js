// public/sw.js
const CACHE_VERSION = 'v5'
const APP_CACHE = `greensweveseen-${CACHE_VERSION}`
const API_CACHE = `greensweveseen-api-${CACHE_VERSION}`
const CORE_ASSETS = [
  '/',
  '/dashboard',
  '/offline.html',
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
          if (name !== APP_CACHE && name !== API_CACHE) return caches.delete(name)
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

function isAPIGet(request, url) {
  return url.pathname.startsWith('/api/') && request.method === 'GET'
}

function isDashboard(url) {
  return url.pathname === '/dashboard' || url.pathname.startsWith('/dashboard/')
}

function isMutatingRequest(request) {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  // Only handle same-origin
  if (url.origin !== location.origin) return

  // Never cache mutating requests (POST, PUT, DELETE, PATCH)
  if (isMutatingRequest(request)) {
    event.respondWith(fetch(request))
    return
  }

  // API GET requests - Stale While Revalidate
  if (isAPIGet(request, url)) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              cache.put(request, response.clone())
            }
            return response
          })
          .catch(() => {
            // Return cached response if network fails
            return cached || new Response('{"error": "Network unavailable"}', {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            })
          })
        
        // Return cached immediately if available, otherwise wait for network
        if (cached) {
          fetchPromise.catch(() => {}) // Prevent unhandled rejection
          return cached
        }
        
        return fetchPromise
      })
    )
    return
  }

  // Dashboard pages - Stale While Revalidate
  if (isDashboard(url) && isHTMLRequest(request)) {
    event.respondWith(
      caches.open(APP_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              cache.put(request, response.clone())
            }
            return response
          })
          .catch(async () => {
            // Return cached response or offline fallback
            return cached || caches.match('/offline.html') || new Response('Offline', { status: 503 })
          })
        
        // Return cached immediately if available, otherwise wait for network
        if (cached) {
          fetchPromise.catch(() => {}) // Prevent unhandled rejection
          return cached
        }
        
        return fetchPromise
      })
    )
    return
  }

  // Other HTML requests - Network first with offline fallback
  if (isHTMLRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const resClone = res.clone()
            caches.open(APP_CACHE).then((cache) => cache.put(request, resClone))
          }
          return res
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached || caches.match('/offline.html') || caches.match('/')
        })
    )
    return
  }

  // Static assets - Cache first
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((res) => {
          if (res.ok) {
            const resClone = res.clone()
            caches.open(APP_CACHE).then((cache) => cache.put(request, resClone))
          }
          return res
        })
      })
    )
    return
  }

  // Images - Stale while revalidate
  if (isImage(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((res) => {
          if (res.ok) {
            const resClone = res.clone()
            caches.open(APP_CACHE).then((cache) => cache.put(request, resClone))
          }
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
