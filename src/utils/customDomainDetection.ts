/**
 * Utilitário para detectar se estamos em contexto de domínio customizado
 * via Cloudflare Worker
 */

// Lista de domínios conhecidos do Migrabook (não são domínios customizados)
const KNOWN_MIGRABOOK_DOMAINS = [
  'migrabook.app',
  'localhost',
  '127.0.0.1',
  'lovable.app',
  'lovable.dev',
  'lovableproject.com'
];

/**
 * Verifica se estamos em um contexto de domínio customizado
 * O Worker injeta headers e meta tags para identificar
 */
export const isCustomDomainContext = (): boolean => {
  // 1. Verificar meta tag injetada pelo Worker
  const metaCustomDomain = document.querySelector('meta[name="x-custom-domain"]');
  if (metaCustomDomain?.getAttribute('content')) {
    return true;
  }
  
  // 2. Verificar se o hostname atual NÃO é um domínio conhecido
  const hostname = window.location.hostname.toLowerCase();
  const isKnownDomain = KNOWN_MIGRABOOK_DOMAINS.some(domain => 
    hostname === domain || 
    hostname.endsWith('.' + domain) ||
    hostname.includes('preview--') // Preview do Lovable
  );
  
  // 3. Verificar localStorage para persistência entre reloads
  const storedCustomDomain = localStorage.getItem('__custom_domain__');
  if (storedCustomDomain === hostname && !isKnownDomain) {
    return true;
  }
  
  // Se não é domínio conhecido, provavelmente é customizado
  if (!isKnownDomain) {
    // Salvar para persistência
    localStorage.setItem('__custom_domain__', hostname);
    return true;
  }
  
  return false;
};

/**
 * Retorna o slug do app mapeado para o domínio customizado
 * O Worker injeta essa informação via meta tag ou localStorage
 * IMPORTANTE: Meta tag do Worker SEMPRE tem prioridade sobre localStorage
 * para garantir que mudanças de mapeamento sejam refletidas imediatamente
 */
export const getCustomDomainAppSlug = (): string | null => {
  // 1. SEMPRE verificar meta tag primeiro (fonte da verdade do Worker)
  const metaSlug = document.querySelector('meta[name="x-custom-domain-slug"]');
  const metaPath = document.querySelector('meta[name="x-custom-domain-path"]');
  
  if (metaSlug?.getAttribute('content')) {
    const slug = metaSlug.getAttribute('content');
    const path = metaPath?.getAttribute('content') || '/';
    
    // Invalidar cache se o slug ou path mudou (mapeamento foi alterado)
    const cachedSlug = localStorage.getItem('__custom_domain_slug__');
    const cachedPath = localStorage.getItem('__custom_domain_path__');
    
    if (cachedSlug !== slug || cachedPath !== path) {
      console.log('[CustomDomain] Mapeamento alterado, atualizando cache:', { 
        oldSlug: cachedSlug, newSlug: slug,
        oldPath: cachedPath, newPath: path 
      });
    }
    
    // Atualizar localStorage com valores frescos do Worker
    if (slug) {
      localStorage.setItem('__custom_domain_slug__', slug);
      localStorage.setItem('__custom_domain_path__', path);
    }
    return slug;
  }
  
  // 2. Fallback para localStorage APENAS se não houver meta tag
  // (isso pode acontecer em reloads muito rápidos antes do Worker processar)
  const storedSlug = localStorage.getItem('__custom_domain_slug__');
  if (storedSlug && isCustomDomainContext()) {
    console.log('[CustomDomain] Usando cache localStorage (meta tag ausente):', storedSlug);
    return storedSlug;
  }
  
  return null;
};

/**
 * Retorna o nome do domínio customizado atual
 */
export const getCustomDomainName = (): string | null => {
  if (!isCustomDomainContext()) return null;
  
  const metaCustomDomain = document.querySelector('meta[name="x-custom-domain"]');
  const fromMeta = metaCustomDomain?.getAttribute('content');
  if (fromMeta) return fromMeta;
  
  // Fallback para hostname se parece ser domínio customizado
  const hostname = window.location.hostname.toLowerCase();
  const isKnownDomain = KNOWN_MIGRABOOK_DOMAINS.some(domain => 
    hostname === domain || 
    hostname.endsWith('.' + domain) ||
    hostname.includes('preview--')
  );
  
  if (!isKnownDomain) {
    return hostname;
  }
  
  return null;
};

/**
 * Lista de rotas reservadas - usada apenas para validação no CustomDomainManager
 * para alertar o usuário sobre possíveis conflitos, mas NÃO bloqueia o mapeamento.
 * 
 * Em domínios customizados, QUALQUER path pode ser mapeado para um app,
 * pois o domínio é diferente do migrabook.app.
 */
export const RESERVED_ROUTES: string[] = [];

/**
 * Rotas que podem gerar aviso (mas não bloqueio) no gerenciador de domínios
 */
export const WARNING_ROUTES = [
  '/login',
  '/auth', 
  '/admin',
  '/app',
  '/checkout',
  '/payment-success',
  '/inactive',
  '/suporte',
  '/termos',
  '/privacidade',
  '/player',
  '/academy',
  '/configurar-senha',
  '/redefinir-senha',
  '/setup-password',
  '/pricing',
  '/assinatura',
  '/planos',
  '/assine',
  '/acesso'
];

/**
 * Verifica se uma rota é reservada (não deve ser acessível em domínio customizado)
 */
export const isReservedRoute = (path: string): boolean => {
  const normalizedPath = path.toLowerCase();
  return RESERVED_ROUTES.some(route => 
    normalizedPath === route || 
    normalizedPath.startsWith(route + '/')
  );
};
