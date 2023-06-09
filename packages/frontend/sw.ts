/// <reference lib="webworker" />

const CACHE_NAME = 'manifest-cache'
const URLS_TO_CACHE = ['/', '/index.html', '/favicon.ico', '/public']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache:', CACHE_NAME)
      return cache.addAll(URLS_TO_CACHE)
    })
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response
      }

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    })
  )
})

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
