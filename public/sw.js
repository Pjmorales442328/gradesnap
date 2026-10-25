// Network-first service worker: always fresh when online, cached copy when offline.
const CACHE = 'gradesnap'
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const res = await fetch(e.request)
        if (res.ok) cache.put(e.request, res.clone())
        return res
      } catch {
        return (await cache.match(e.request)) || (await cache.match('./')) || Response.error()
      }
    }),
  )
})
