/**
 * Conjuga Service Worker（PWA 离线）
 * 策略：
 *  - 构建产物（hash 文件名）：cache-first，永久缓存
 *  - index.html / manifest / icon：network-first，失败回缓存
 */
const CACHE_NAME = 'conjuga-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
]

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  if (url.origin !== location.origin) return

  // 带 hash 的构建产物：cache-first
  if (/[.-][a-zA-Z0-9_-]{8}\.(js|css|woff2?)$/.test(url.pathname) || url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(hit => hit ?? fetch(e.request).then(res => {
        const copy = res.clone()
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy))
        return res
      }))
    )
    return
  }

  // 其余（页面 / manifest）：network-first
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone()
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy))
        return res
      })
      .catch(() => caches.match(e.request).then(hit => hit ?? caches.match('/')))
  )
})
