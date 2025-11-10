/**
 * Service Worker para Rally X - PWA
 * Permite funcionamiento offline y carga rápida
 */

const CACHE_NAME = 'rallyx-v1.0.0';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/main.css',
    '/js/main.js',
    '/js/config.js',
    '/js/utils/Storage.js',
    '/js/utils/Input.js',
    '/js/utils/Collision.js',
    '/js/systems/AudioManager.js',
    '/js/systems/ParticleSystem.js',
    '/js/systems/ScoreSystem.js',
    '/js/systems/AchievementSystem.js',
    '/js/systems/StateManager.js',
    '/js/entities/Player.js',
    '/js/entities/Enemy.js',
    '/js/entities/Flag.js',
    '/js/entities/PowerUp.js',
    '/js/states/MenuState.js',
    '/js/states/GameState.js',
    '/js/states/PauseState.js',
    '/js/states/GameOverState.js',
    '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Instalando...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Cachando archivos');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('✅ Service Worker: Instalado correctamente');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Error al cachear archivos:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('⚡ Service Worker: Activando...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => cacheName !== CACHE_NAME)
                        .map((cacheName) => {
                            console.log('🗑️ Service Worker: Eliminando cache antigua:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activado correctamente');
                return self.clients.claim();
            })
    );
});

// Interceptar peticiones (Fetch)
self.addEventListener('fetch', (event) => {
    // Ignorar peticiones que no sean GET
    if (event.request.method !== 'GET') {
        return;
    }

    // Ignorar peticiones a dominios externos (fuentes, etc.)
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Si está en cache, devolver la versión cacheada
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Si no está en cache, hacer fetch y cachear
                return fetch(event.request)
                    .then((response) => {
                        // Verificar que la respuesta es válida
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clonar la respuesta porque es un stream que solo se puede usar una vez
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('❌ Error en fetch:', error);

                        // Si falla el fetch, intentar devolver index.html del cache (para navegación offline)
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Mensajes desde el cliente
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME)
            .then(() => {
                console.log('🗑️ Cache limpiada');
            });
    }
});

// Sincronización en segundo plano (opcional)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-highscore') {
        event.waitUntil(
            // Aquí podrías sincronizar el high score con un servidor
            console.log('🔄 Sincronizando datos...')
        );
    }
});

// Notificaciones push (opcional para futuras features)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Nueva actualización disponible',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification('Rally X', options)
    );
});
