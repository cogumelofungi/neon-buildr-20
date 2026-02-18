import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Redireciona o PWA instalado para o último app publicado acessado
try {
  // iOS usa navigator.standalone, outros usam display-mode
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isIOSStandalone = (navigator as any).standalone === true;
  const isDisplayModeStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  const isStandalone = isIOSStandalone || isDisplayModeStandalone;
  
  if (isStandalone) {
    const current = window.location.pathname;
    
    // Lista de rotas reservadas que não devem ser tratadas como app slugs
    const reservedRoutes = ['/app', '/admin', '/pricing', '/assine', '/checkout', '/payment-success', '/inactive', '/suporte', '/termos', '/privacidade', '/player', '/auth'];
    const isReservedRoute = reservedRoutes.some(route => current.startsWith(route));
    
    // Se estamos na raiz, tentar redirecionar para o app salvo
    if (current === '/' || current === '/index.html') {
      // iOS PWA: usar slug específico do iOS
      if (isIOS) {
        const iosSlug = localStorage.getItem('ios_pwa_last_slug');
        if (iosSlug) {
          console.log('[PWA iOS] Redirecionando da raiz para:', iosSlug);
          window.location.replace(`/${iosSlug}`);
        }
      } else {
        // Android/Desktop: usar rota padrão
        const saved = localStorage.getItem('pwaDefaultRoute');
        if (saved && saved !== '/') {
          console.log('[PWA] Redirecionando da raiz para:', saved);
          window.location.replace(saved);
        }
      }
    }
  }
} catch (e) {
  // apenas garante que a app continue renderizando
  console.warn('[PWA] Erro no redirecionamento:', e);
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
