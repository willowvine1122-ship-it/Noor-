// Offline support: network first for the app shell so updates arrive quickly,
// cache fallback so Noor still opens without signal.
const CACHE = 'noor-v2';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './index.html'])));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const fonts = url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('gstatic.com') || url.hostname === 'images.unsplash.com';
  if (!sameOrigin && !fonts) return;

  if (fonts || url.pathname.includes('/assets/')) {
    // hashed assets and fonts never change: cache first
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })),
    );
    return;
  }

  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html'))),
  );
});

// Phone reminders sent by the Noor reminder server.
self.addEventListener('push', (e) => {
  let msg = { title: 'Noor', body: '' };
  try { msg = e.data.json(); } catch { msg.body = e.data ? e.data.text() : ''; }
  e.waitUntil(self.registration.showNotification(msg.title, {
    body: msg.body,
    tag: msg.tag || undefined,
    renotify: true,
    icon: './icon-192.png',
    badge: './icon-192.png',
    data: { url: './' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => 'focus' in c);
      return open ? open.focus() : self.clients.openWindow('./');
    }),
  );
});
