/**
 * Hook para capturar dados de rastreamento do Facebook (FBP, FBC, EXTERNAL_ID, USER_AGENT)
 * Esses dados são usados para integração com Facebook CAPI via Brevo
 */

export interface FacebookTrackingData {
  fbp?: string;
  fbc?: string;
  external_id?: string;
  user_agent?: string;
}

const FB_TRACKING_STORAGE_KEY = "migrabook_fb_tracking";

/**
 * Obtém o valor de um cookie pelo nome
 */
const getCookie = (name: string): string => {
  try {
    const match = document.cookie.split('; ').find(row => row.startsWith(name + '='));
    return match ? match.split('=')[1] : '';
  } catch {
    return '';
  }
};

/**
 * Gera um FBP (Facebook Browser ID) se não existir
 * Formato: fb.1.{timestamp}.{random}
 * NOTA: FBP pode ser gerado pelo sistema se o Pixel não criou ainda
 */
const generateFbp = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000000000);
  return `fb.1.${timestamp}.${random}`;
};

/**
 * Salva um cookie
 */
const setCookie = (name: string, value: string, days: number = 90): void => {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    console.log(`[FB-TRACKING] Cookie set: ${name}=${value.substring(0, 30)}...`);
  } catch (error) {
    console.warn("[FB-TRACKING] Error setting cookie:", error);
  }
};

/**
 * Gera um external_id único (UUID v4)
 */
const generateExternalId = (): string => {
  // Gera UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Captura os dados de rastreamento do Facebook
 * IMPORTANTE: Apenas LÊ os cookies criados pelo Pixel, não gera _fbc manualmente
 * (seguindo recomendação do Meta)
 */
export const captureFacebookTracking = (): FacebookTrackingData => {
  try {
    // Tentar ler cookies existentes (criados pelo Pixel)
    let fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc'); // Apenas lê, não gera - recomendação Meta
    let external_id = getCookie('external_id');
    const user_agent = navigator.userAgent;

    // Se FBP não existe, gerar e salvar (FBP pode ser gerado pelo sistema)
    if (!fbp) {
      fbp = generateFbp();
      setCookie('_fbp', fbp, 90);
      console.log("[FB-TRACKING] Generated new FBP:", fbp);
    }

    // Se external_id não existe, gerar e salvar como cookie persistente
    if (!external_id) {
      external_id = generateExternalId();
      setCookie('external_id', external_id, 365); // Persiste por 1 ano
      console.log("[FB-TRACKING] Generated new EXTERNAL_ID:", external_id);
    } else {
      console.log("[FB-TRACKING] EXTERNAL_ID found:", external_id);
    }

    // FBC: Apenas lê do cookie criado pelo Pixel
    // NÃO geramos _fbc manualmente - seguindo recomendação do Meta
    if (fbc) {
      console.log("[FB-TRACKING] FBC found (created by Pixel):", fbc.substring(0, 20) + '...');
    } else {
      console.log("[FB-TRACKING] FBC not found - will be created by Pixel when user clicks Facebook ad");
    }

    const data: FacebookTrackingData = {};
    
    if (fbp) data.fbp = fbp;
    if (fbc) data.fbc = fbc;
    if (external_id) data.external_id = external_id;
    if (user_agent) data.user_agent = user_agent;

    // Salvar no sessionStorage para uso posterior
    if (Object.keys(data).length > 0) {
      sessionStorage.setItem(FB_TRACKING_STORAGE_KEY, JSON.stringify(data));
      console.log("[FB-TRACKING] Captured Facebook tracking data:", {
        fbp: data.fbp ? data.fbp.substring(0, 20) + '...' : undefined,
        fbc: data.fbc ? data.fbc.substring(0, 20) + '...' : undefined,
        external_id: data.external_id,
        user_agent: data.user_agent ? 'present' : undefined
      });
    }

    return data;
  } catch (error) {
    console.warn("[FB-TRACKING] Error capturing Facebook tracking data:", error);
    return { user_agent: navigator.userAgent };
  }
};

/**
 * Recupera os dados de rastreamento do Facebook salvos
 */
export const getFacebookTrackingData = (): FacebookTrackingData => {
  try {
    // Primeiro, captura dados frescos dos cookies (ou gera se não existirem)
    const freshData = captureFacebookTracking();
    
    // Se tiver dados frescos, retorna eles
    if (Object.keys(freshData).length > 0) {
      return freshData;
    }

    // Senão, tenta recuperar do sessionStorage
    const stored = sessionStorage.getItem(FB_TRACKING_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("[FB-TRACKING] Error reading Facebook tracking data:", error);
  }
  return { user_agent: navigator.userAgent };
};

/**
 * Inicializa o rastreamento do Facebook assim que a página carregar
 * Deve ser chamado no carregamento da página de planos/assine
 */
export const initFacebookTracking = (): void => {
  // Capturar imediatamente
  captureFacebookTracking();
  
  // Recapturar após 2 segundos para pegar cookies criados pelo Pixel
  setTimeout(() => {
    captureFacebookTracking();
  }, 2000);
};
