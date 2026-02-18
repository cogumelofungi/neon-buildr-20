// Service Worker Otimizado para PWA com Suporte a PDFs e Range Requests
// Versão: 4.4 - Safari Mobile: Não interceptar PDFs
const CACHE_NAME = 'app-builder-pwa-v4.4';
const urlsToCache = [
  '/placeholder.svg',
  '/manifest.json'
];

// ✅ CRÍTICO: URLs que NÃO devem ser cacheadas (PDFs, Storage, APIs)
// Isso permite Range Requests (HTTP 206) para streaming progressivo
const BYPASS_CACHE_PATTERNS = [
  /\.pdf$/i,
  /\.mp3$/i,
  /\.mp4$/i,
  /\.webm$/i,
  /supabase\.co\/storage/i,
  /storage\.googleapis\.com/i,
  /\/api\//i,
  /\/auth\//i,
  /chrome-extension:/i,
  /devtools:/i
];

// URLs que devem sempre buscar da rede primeiro (rotas reservadas do sistema)
const networkFirstUrls = [
  '/',
  '/app',
  '/app/',
  '/admin',
  '/pricing',
  '/assine',
  '/checkout',
  '/payment-success',
  '/inactive',
  '/suporte',
  '/termos',
  '/privacidade',
  '/player',
  '/sw.js',
  '/test-storage-sw.html'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('🔧 [SW] Instalando Service Worker v4.4...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ [SW] Cache estático criado');
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('⚠️ [SW] Alguns recursos não puderam ser cacheados:', err);
        });
      })
      .then(() => {
        console.log('✅ [SW] Instalação concluída');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ [SW] Erro na instalação:', error);
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // IGNORAR Edge Functions (pdf-proxy e outras) — nunca interceptar
  if (url.pathname.includes('/functions/v1/')) {
    return;
  }

  // Ignorar extensões do Chrome e DevTools
  if (url.protocol === 'chrome-extension:' || url.protocol === 'devtools:') {
    return;
  }

  // Detectar Safari Mobile - não interceptar NADA para evitar crash
  const userAgent = (event.request.headers.get('user-agent') || '').toLowerCase();
  const isSafariMobile = /iphone|ipad|ipod/.test(userAgent) && /safari/.test(userAgent) && !/crios|fxios|opios/.test(userAgent);
  
  if (isSafariMobile && /\.pdf$/i.test(request.url)) {
    // Safari Mobile: deixar passar direto sem interceptar
    return;
  }

  // Ignorar requisições não-GET de diferentes origens (exceto para Supabase Storage)
  if (url.origin !== location.origin && request.method !== 'GET') {
    return;
  }

  // ✅ BYPASS CRÍTICO: PDFs, MP3, MP4 e Storage (permite Range Requests HTTP 206)
  // Isso resolve o problema de PDFs em branco e lentidão no carregamento
  const shouldBypassCache = BYPASS_CACHE_PATTERNS.some(pattern => 
    pattern.test(request.url)
  );

  if (shouldBypassCache) {
    console.log('📦 [SW] Bypass cache para:', url.pathname);
    
    // ✅ SOLUÇÃO SAFARI MOBILE: Não interceptar PDFs no Safari para evitar crash
    // Safari Mobile tem problemas com Range Requests através do SW
    event.respondWith(
      fetch(request, {
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store' // Força Safari a não cachear
      }).catch(error => {
        console.error('❌ [SW] Erro ao buscar:', url.pathname, error);
        return fetch(request); // Fallback para fetch simples
      })
    );
    return;
  }

  // Network-first para rotas do sistema
  const isNetworkFirst = networkFirstUrls.some(path => 
    url.pathname === path || url.pathname.startsWith(path)
  );
  
  if (isNetworkFirst) {
    // Network-first para páginas da aplicação
    event.respondWith(
      fetch(request)
        .then(response => {
          // Se a resposta é válida, atualiza o cache (APENAS para GET)
          if (response && response.status === 200 && request.method === 'GET') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              })
              .catch(err => console.warn('⚠️ [SW] Erro ao cachear:', err));
          }
          return response;
        })
        .catch(() => {
          // Se falha na rede, tenta o cache
          return caches.match(request)
            .then(cached => {
              if (cached) {
                console.log('✅ [SW] Fallback para cache:', url.pathname);
                return cached;
              }
              // Retornar erro de rede se não há cache
              return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
            });
        })
    );
  } else {
    // Cache-first para recursos estáticos
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            console.log('✅ [SW] Cache hit:', url.pathname);
            return response;
          }
          
          console.log('🌐 [SW] Buscando da rede:', url.pathname);
          
          return fetch(request).then(response => {
            // Cachear apenas respostas válidas
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, responseToCache);
                  console.log('💾 [SW] Recurso cacheado:', url.pathname);
                })
                .catch(err => console.warn('⚠️ [SW] Erro ao cachear:', err));
            }
            
            return response;
          }).catch(err => {
            console.error('❌ [SW] Erro ao buscar:', url.pathname, err);
            throw err;
          });
        })
    );
  }
});

// Ativar Service Worker
self.addEventListener('activate', event => {
  console.log('🔧 [SW] Ativando Service Worker v4.3...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('🗑️ [SW] Removendo cache antigo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('✅ [SW] Ativação concluída, assumindo controle...');
      return self.clients.claim();
    }).catch(error => {
      console.error('❌ [SW] Erro na ativação:', error);
    })
  );
});

// ✅ Listener para mensagens do cliente (forçar atualização)
self.addEventListener('message', event => {
  console.log('📨 [SW] Mensagem recebida:', event.data);
  
  if (event.data === 'SKIP_WAITING') {
    console.log('⏩ [SW] Forçando atualização...');
    self.skipWaiting();
  }
  
  if (event.data === 'CLEAR_CACHE') {
    console.log('🗑️ [SW] Limpando cache...');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }).then(() => {
        console.log('✅ [SW] Cache limpo');
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'CACHE_CLEARED' });
          });
        });
      })
    );
  }
});

console.log('✅ [SW] Service Worker v4.4 carregado com sucesso');
