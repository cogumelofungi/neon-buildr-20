// Service Worker Otimizado v4.1 para Apps Publicados
// Com suporte a Range Requests para PDFs e MP3
const CACHE_NAME = 'published-app-pwa-v4.1';
const STATIC_CACHE = 'published-app-static-v1';

//  CRÍTICO: URLs que NÃO devem ser cacheadas (PDFs, MP3, Storage, APIs)
const BYPASS_CACHE_PATTERNS = [
  /\.pdf$/i,
  /\.mp3$/i,
  /supabase\.co\/storage/i,
  /storage\.googleapis\.com/i,
  /\/api\//i,
  /\/auth\//i
];

console.log('[SW-APP v4.1] Service Worker iniciado');

self.addEventListener('install', (event) => {
  console.log('[SW-APP] Instalando v4.1...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW-APP] Ativando v4.1...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== STATIC_CACHE) {
            console.log('[SW-APP] Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => {
      console.log('[SW-APP] Service Worker v4.1 ativado e pronto');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignorar requisições de outros domínios
  if (!url.origin || url.origin !== self.location.origin) return;

  //  BYPASS CRÍTICO: PDFs, MP3 e Storage (permite Range Requests HTTP 206)
  const shouldBypassCache = BYPASS_CACHE_PATTERNS.some(pattern => 
    pattern.test(req.url)
  );

  if (shouldBypassCache) {
    console.log('[SW-APP]  Bypass cache para:', url.pathname);
    
    event.respondWith(
      fetch(req).catch(error => {
        console.error('[SW-APP]  Erro ao buscar recurso:', error);
        throw error;
      })
    );
    return;
  }

  // Lista de rotas reservadas que NÃO são apps publicados
  const reservedRoutes = ['/app', '/admin', '/pricing', '/assine', '/checkout', '/payment-success', '/inactive', '/suporte', '/termos', '/privacidade', '/player'];
  const isReservedRoute = reservedRoutes.some(route => url.pathname.startsWith(route));
  
  // Se não é uma rota reservada e tem slug (não é raiz), trata como app publicado
  const isAppRoute = !isReservedRoute && url.pathname !== '/' && url.pathname.split('/').filter(Boolean).length === 1;

  if (isAppRoute) {
    // Network-first para rotas do app
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, copy);
              console.log('[SW-APP] Cache atualizado para:', url.pathname);
            });
          }
          return res;
        })
        .catch((error) => {
          console.log('[SW-APP] Falha na rede, tentando cache:', url.pathname);
          return caches.match(req).then((cached) => {
            if (cached) {
              console.log('[SW-APP]  Servindo do cache:', url.pathname);
              return cached;
            }
            console.error('[SW-APP]  Recurso não disponível:', url.pathname);
            throw error;
          });
        })
    );
    return;
  }

  // Cache-first para recursos estáticos
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        console.log('[SW-APP]  Servindo do cache (estático):', url.pathname);
        return cached;
      }
      return fetch(req).then((res) => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const copy = res.clone();
        caches.open(STATIC_CACHE).then((cache) => {
          cache.put(req, copy);
          console.log('[SW-APP]  Cache criado para (estático):', url.pathname);
        });
        return res;
      });
    })
  );
});

// Recebe mensagens (ex.: atualização de manifest)
self.addEventListener('message', (event) => {
  if (event.data?.type === 'UPDATE_MANIFEST') {
    console.log('[SW-APP] Requisição de atualização do manifest:', event.data.manifest?.name);
  }
  
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW-APP]  Forçando ativação imediata');
    self.skipWaiting();
  }
  
  if (event.data === 'CLEAR_CACHE') {
    console.log('[SW-APP]  Limpando cache...');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }).then(() => {
        console.log('[SW-APP]  Cache limpo');
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'CACHE_CLEARED' });
          });
        });
      })
    );
  }
});

console.log('[SW-APP]  Service Worker v4.1 carregado com sucesso');
