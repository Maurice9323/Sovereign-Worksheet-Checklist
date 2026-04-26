const CACHE = 'alrpg-checklist-v1';
const SHELL = [
  '/Sovereign-Worksheet-Checklist/',
  '/Sovereign-Worksheet-Checklist/index.html',
  '/Sovereign-Worksheet-Checklist/manifest.json',
  '/Sovereign-Worksheet-Checklist/icon-192.png',
  '/Sovereign-Worksheet-Checklist/icon-512.png'
];

self.addEventListener('install', e => {{
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
}});

self.addEventListener('activate', e => {{
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
}});

self.addEventListener('fetch', e => {{
  const url = new URL(e.request.url);
  if (
    url.hostname.includes('firestore') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic') ||
    url.hostname.includes('fonts.google')
  ) return;
  e.respondWith(
    caches.match(e.request).then(cached => {{
      const networkFetch = fetch(e.request).then(res => {{
        if (res.ok && e.request.method === 'GET') {{
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }}
        return res;
      }}).catch(() => cached);
      return cached || networkFetch;
    }})
  );
}});
