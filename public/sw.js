// Service Worker para IA.TEX PWA
const CACHE_NAME = 'iatex-v1.0.0';
const STATIC_CACHE_NAME = 'iatex-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'iatex-dynamic-v1.0.0';

// Arquivos essenciais para cache
const STATIC_FILES = [
  '/',
  '/landing',
  '/demo',
  '/teste-gratis',
  '/favicon.ico',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('IA.TEX SW: Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('IA.TEX SW: Cache criado');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativar Service Worker
self.addEventListener('activate', event => {
  console.log('IA.TEX SW: Ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('IA.TEX SW: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar requests
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Estratégia para diferentes tipos de requests
  if (request.url.includes('/api/')) {
    // API calls - Network first, cache as fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (request.url.includes('/assets/') || request.url.includes('.css') || request.url.includes('.js')) {
    // Assets estáticos - Cache first
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // Páginas - Network first com cache fallback
    event.respondWith(networkFirstStrategy(request));
  }
});

// Estratégia Network First
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Se sucesso, cache para uso futuro
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Se falhar, tenta buscar do cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não tem no cache, retorna página offline
    if (request.destination === 'document') {
      return caches.match('/');
    }
    
    throw error;
  }
}

// Estratégia Cache First
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Push Notifications (para futuro)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.message,
      icon: '/pwa-icon-192.png',
      badge: '/pwa-icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || '1'
      },
      actions: [
        {
          action: 'explore',
          title: 'Ver no IA.TEX',
          icon: '/pwa-icon-192.png'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/pwa-icon-192.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification('IA.TEX', options)
    );
  }
});

// Cliques em notificações
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background Sync (para futuro)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('IA.TEX SW: Sincronização em background');
  // Implementar sincronização de dados quando voltar online
}