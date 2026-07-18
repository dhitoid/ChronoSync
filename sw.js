const CACHE_NAME = 'chronosync-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

let scheduledTasks = [];
let timerInterval = null;

// Install & Cache
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Fetch (Bisa Offline)
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});

// Menerima jadwal dari aplikasi dan menjalankan timer di Latar Belakang
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SYNC_TASKS') {
    scheduledTasks = event.data.tasks;
    startBackgroundTimer();
  }
});

function startBackgroundTimer() {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

    scheduledTasks.forEach(task => {
      if (task.time === currentTime && !task.notified) {
        // Picu Notifikasi Sistem
        self.registration.showNotification("Waktunya Tiba! ⏰", {
          body: task.name,
          icon: "https://cdn-icons-png.flaticon.com/512/825/825590.png",
          badge: "https://cdn-icons-png.flaticon.com/512/825/825590.png",
          vibrate: [200, 100, 200, 100, 400], // Getaran khas alarm
          requireInteraction: true // Notifikasi tetap ada sampai diklik
        });
        
        task.notified = true;

        // Beritahu aplikasi (jika sedang dibuka) untuk update tampilan
        self.clients.matchAll().then(clients => {
          clients.forEach(client => client.postMessage({ type: 'UPDATE_UI' }));
        });
      }
    });
  }, 10000); // Cek setiap 10 detik di background
}
