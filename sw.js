const CACHE_NAME = 'chronosync-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Service Worker dan simpan file ke memori HP
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Jalankan aplikasi dari memori (bisa Offline)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Fitur Notifikasi Background (Menerima perintah dari aplikasi)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification("Waktunya Tiba! ⏰", {
      body: event.data.message,
      icon: "https://cdn-icons-png.flaticon.com/512/825/825590.png",
      vibrate: [200, 100, 200] // Membuat HP bergetar (Android)
    });
  }
});
