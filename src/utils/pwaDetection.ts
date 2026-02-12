/**
 * Utilitários para detecção de dispositivos e capacidades PWA
 */

export interface DeviceInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  isOpera: boolean;
  isSamsung: boolean;
  isBrave: boolean;
  isStandalone: boolean;
  supportsInstallPrompt: boolean;
  browserName: string;
  osName: string;
}

/**
 * Detecta informações detalhadas sobre o dispositivo e navegador
 */
export const detectDevice = (): DeviceInfo => {
  const ua = navigator.userAgent || '';
  
  // Detecção de OS
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isAndroid = /android/i.test(ua);
  
  // Detecção de navegadores
  // Ordem importante: verificar navegadores específicos antes dos genéricos
  const isSamsung = /SamsungBrowser/i.test(ua);
  const isEdge = /Edg/i.test(ua);
  const isOpera = /OPR|Opera|OPiOS/i.test(ua);
  const isFirefox = /Firefox|FxiOS/i.test(ua);
  const isBrave = !!(navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function';
  
  // Chrome: inclui CriOS (Chrome no iOS), mas exclui outros navegadores Chromium
  const isChrome = (/Chrome|CriOS/i.test(ua) && !isSamsung && !isEdge && !isOpera && !isBrave);
  
  // Safari: apenas Safari puro (sem outros navegadores baseados em WebKit)
  const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|OPR|SamsungBrowser/.test(ua);
  
  // Detecção de modo standalone (PWA instalado)
  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    (navigator as any).standalone === true; // iOS Safari
  
  // Suporte ao prompt de instalação
  // Opera e Firefox não suportam beforeinstallprompt de forma confiável
  const supportsInstallPrompt = 
    'BeforeInstallPromptEvent' in window ||
    (isAndroid && (isChrome || isSamsung || isEdge || isOpera || isBrave)) ||
    (isChrome || isEdge || isOpera || isBrave); // Desktop também

  // Nome do navegador - ordem importa para navegadores Chromium
  let browserName = 'Unknown';
  if (isSamsung) browserName = 'Samsung Internet';
  else if (isBrave) browserName = 'Brave';
  else if (isOpera) browserName = 'Opera';
  else if (isEdge) browserName = 'Edge';
  else if (isFirefox) browserName = 'Firefox';
  else if (isChrome) browserName = 'Chrome';
  else if (isSafari) browserName = 'Safari';
  
  // Nome do OS
  let osName = 'Unknown';
  if (isIOS) osName = 'iOS';
  else if (isAndroid) osName = 'Android';
  else if (/Windows/i.test(ua)) osName = 'Windows';
  else if (/Mac/i.test(ua)) osName = 'macOS';
  else if (/Linux/i.test(ua)) osName = 'Linux';
  
  return {
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    isFirefox,
    isEdge,
    isOpera,
    isSamsung,
    isBrave,
    isStandalone,
    supportsInstallPrompt,
    browserName,
    osName
  };
};

/**
 * Verifica se o PWA está instalado baseado em múltiplas verificações
 * IMPORTANTE: Não usar localStorage para determinar se está instalado permanentemente
 * pois não há como detectar quando o usuário desinstala o PWA
 */
export const isPWAInstalled = (appId: string): boolean => {
  const device = detectDevice();
  
  // Apenas verificar se está em modo standalone (realmente instalado e aberto como PWA)
  if (device.isStandalone) {
    console.log('[PWA Detection] App está em modo standalone - instalado');
    return true;
  }
  
  // Se não está em standalone, consideramos não instalado
  // Isso permite que o banner apareça novamente após desinstalação
  console.log('[PWA Detection] App não está em modo standalone - não instalado');
  return false;
};

/**
 * Marca um PWA como instalado
 */
export const markPWAAsInstalled = (appId: string): void => {
  try {
    const installedApps = JSON.parse(localStorage.getItem('installedPWAs') || '[]');
    if (!installedApps.includes(appId)) {
      installedApps.push(appId);
      localStorage.setItem('installedPWAs', JSON.stringify(installedApps));
    }
  } catch (e) {
    console.warn('[PWA Detection] Erro ao marcar como instalado:', e);
  }
};

/**
 * Remove um PWA da lista de instalados
 */
export const markPWAAsUninstalled = (appId: string): void => {
  try {
    const installedApps = JSON.parse(localStorage.getItem('installedPWAs') || '[]');
    const updatedApps = installedApps.filter((id: string) => id !== appId);
    localStorage.setItem('installedPWAs', JSON.stringify(updatedApps));
  } catch (e) {
    console.warn('[PWA Detection] Erro ao remover da lista:', e);
  }
};

/**
 * Obtém instruções de instalação específicas para o dispositivo
 */
export const getInstallInstructions = (device: DeviceInfo): string => {
  if (device.isIOS && device.isSafari) {
    return '1. Toque nos 3 pontinhos [...]\n2. Toque em "Compartilhar"\n3. Toque em "Mais"\n4. Toque em "Adicionar à Tela de Início"\n5. Toque em "Adicionar"';
  }
  
  if (device.isIOS && device.isChrome) {
    return '1. Toque no ícone de compartilhar\n2. Toque em "Mais" (3 pontinhos)\n3. Toque em "Adicionar à Tela de Início"\n4. Toque em "Adicionar"';
  }
  
  if (device.isIOS) {
    return 'Abra este link no Safari para instalar o aplicativo';
  }
  
  if (device.isAndroid && device.isChrome) {
    return 'Toque no menu (⋮) e selecione "Adicionar à tela inicial"';
  }
  
  if (device.isAndroid && device.isFirefox) {
    return 'Abra o menu e toque em "Instalar" ou "Adicionar à tela inicial"';
  }
  
  if (device.isAndroid && device.isSamsung) {
    return 'Toque no menu e selecione "Adicionar página a" → "Tela inicial"';
  }
  
  if (device.isAndroid && device.isOpera) {
    return 'Toque no menu (⋮) no canto superior direito → "Adicionar à" → "Tela inicial"';
  }

  if (device.isIOS && device.isOpera) {
    return 'Abra este link no Safari e use "Compartilhar → Adicionar à Tela de Início"';
  }
  
    if (device.isAndroid && device.isFirefox) {
      return 'Toque no menu (⋮) e selecione "Instalar" ou "Adicionar à tela inicial"';
    }
    
    if (device.isIOS && device.isFirefox) {
      return 'Abra este link no Safari e use "Compartilhar → Adicionar à Tela de Início"';
    }
  
    // Adicionar ANTES da última linha (linha 182)
  
  if (device.isAndroid && device.isBrave) {
    return 'Toque no menu Brave (⋮) e selecione "Adicionar à tela inicial"';
  }
  
  if (device.isBrave) {
    return 'Clique no menu Brave (⋮) e selecione "Instalar aplicativo"';
  }
  
  return 'Use o menu do navegador para adicionar à tela inicial';

};

/**
 * Log detalhado para debug de PWA
 */
export const logPWADebugInfo = (device: DeviceInfo, appId: string): void => {
  const isInstalled = isPWAInstalled(appId);
  
  console.group('🔍 PWA Debug Information');
  console.log('📱 Device:', {
    OS: device.osName,
    Browser: device.browserName,
    isStandalone: device.isStandalone,
    supportsInstallPrompt: device.supportsInstallPrompt
  });
  console.log('📦 Installation:', {
    appId,
    isInstalled,
    localStorage: localStorage.getItem('installedPWAs')
  });
  console.log('🌐 Environment:', {
    userAgent: navigator.userAgent,
    displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
    serviceWorker: 'serviceWorker' in navigator
  });
  console.groupEnd();
};
