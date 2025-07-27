const CACHE_NAME = 'colorforge-v1';
const BASE_PATH = '/'; // Ini harus sama dengan BASE_PATH di script.js dan start_url di manifest.json

const urlsToCache = [
    // Cache halaman utama dan aset inti
    `${BASE_PATH}index.html`,
    `${BASE_PATH}style.css`,
    `${BASE_PATH}script.js`,
    // Aset ikon (pastikan path ini benar relatif terhadap BASE_PATH)
    `${BASE_PATH}icons/icon-192x192.png`,
    `${BASE_PATH}icons/icon-512x512.png`,
    `${BASE_PATH}icons/maskable_icon.png`,
    // CDN eksternal (hati-hati dengan cache, mungkin perlu strategi berbeda)
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.11/clipboard.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js'
];

// Instalasi Service Worker & Caching Aset
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Failed to cache during install:', error);
            })
    );
});

// Strategi Cache-First untuk permintaan
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Jika ada di cache, sajikan dari cache
                if (response) {
                    return response;
                }
                // Jika tidak ada, ambil dari jaringan
                return fetch(event.request).then((networkResponse) => {
                    // Hanya cache respons yang valid (status 200)
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    // Caching aset baru saat diambil dari jaringan
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
            .catch(() => {
                // Tangani kasus offline atau gagal fetch
                // Anda bisa mengarahkan ke halaman offline khusus jika ada
                // return caches.match(`${BASE_PATH}offline.html`);
                return new Response('<h1>You are offline.</h1><p>Please check your internet connection.</p>', {
                    headers: { 'Content-Type': 'text/html' }
                });
            })
    );
});

// Aktivasi Service Worker & Penghapusan Cache Lama
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName); // Hapus cache lama
                    }
                })
            );
        })
    );
});
