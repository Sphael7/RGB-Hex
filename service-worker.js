const CACHE_NAME = 'colorforge-v3'; // Tingkatkan versi cache setiap kali Anda mengubah aset yang di-cache
const BASE_PATH = '/rgb-hex/RGB-Hex-7bedd7301005b9f4c3e28f6f8eecdb56cd37ee38/'; // Sesuaikan dengan BASE_PATH di script.js

const urlsToCache = [
    // Cache halaman utama dan aset inti
    `${BASE_PATH}index.html`,
    `${BASE_PATH}style.css`,
    `${BASE_PATH}script.js`,
    // Aset yang diunggah
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
                // Tambahkan semua URL ke cache. Jika ada yang gagal, instalasi akan gagal.
                return cache.addAll(urlsToCache).catch(error => {
                    console.error('Failed to cache some URLs:', error);
                    // Lanjutkan meskipun ada kesalahan, tetapi catat untuk debugging
                });
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
                    // Hanya cache respons yang valid (status 200) dan bukan ekstensi
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        return caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        });
                    }
                    return networkResponse; // Jangan cache respons yang tidak valid
                });
            })
            .catch(() => {
                // Tangani kasus offline atau gagal fetch untuk resource penting
                console.warn('Network request failed and no cache match found for:', event.request.url);
                return new Response('Content is not available offline. Please check your internet connection or try again later.', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({'Content-Type': 'text/plain'})
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
