self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  if (!url.startsWith('http')) return;
  event.respondWith(
    fetch(event.request).catch(function() {
      return new Response('', { status: 503 });
    })
  );
});
