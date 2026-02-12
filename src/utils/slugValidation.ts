/**
 * Lista de palavras reservadas que não podem ser usadas como slugs de app
 * Estas rotas são usadas pelo sistema e não podem ser sobrescritas
 */
export const RESERVED_SLUGS = [
  'app',
  'admin',
  'pricing',
  'assine',
  'checkout',
  'payment-success',
  'inactive',
  'suporte',
  'termos',
  'privacidade',
  'player',
  'auth',
  'login',
  'logout',
  'api',
  'static',
  'assets',
  'public',
  'manifest.json',
  'sw.js',
  'robots.txt',
  'favicon.ico',
  'sitemap.xml'
];

/**
 * Mapa de caracteres acentuados para suas versões sem acento
 */
const ACCENT_MAP: Record<string, string> = {
  'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a', 'å': 'a',
  'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
  'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
  'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
  'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
  'ç': 'c', 'ñ': 'n', 'ý': 'y', 'ÿ': 'y',
  'Á': 'a', 'À': 'a', 'Ã': 'a', 'Â': 'a', 'Ä': 'a', 'Å': 'a',
  'É': 'e', 'È': 'e', 'Ê': 'e', 'Ë': 'e',
  'Í': 'i', 'Ì': 'i', 'Î': 'i', 'Ï': 'i',
  'Ó': 'o', 'Ò': 'o', 'Õ': 'o', 'Ô': 'o', 'Ö': 'o',
  'Ú': 'u', 'Ù': 'u', 'Û': 'u', 'Ü': 'u',
  'Ç': 'c', 'Ñ': 'n', 'Ý': 'y'
};

/**
 * Normaliza um slug removendo acentos e caracteres especiais
 * @param input - O texto a ser normalizado
 * @returns O slug normalizado
 */
export const normalizeSlug = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let normalized = input.toLowerCase().trim();

  // Substituir caracteres acentuados
  for (const [accented, plain] of Object.entries(ACCENT_MAP)) {
    normalized = normalized.replace(new RegExp(accented, 'g'), plain);
  }

  // Substituir espaços e caracteres especiais por hífen (exceto letras, números, hífen e underscore)
  normalized = normalized.replace(/[^a-z0-9_-]/g, '-');

  // Remover hífens consecutivos
  normalized = normalized.replace(/-+/g, '-');

  // Remover hífens no início e fim
  normalized = normalized.replace(/^-+|-+$/g, '');

  return normalized;
};

/**
 * Valida se um slug pode ser usado para um app publicado
 * @param slug - O slug a ser validado
 * @returns true se o slug é válido, false caso contrário
 */
export const isValidSlug = (slug: string): boolean => {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  const normalizedSlug = slug.toLowerCase().trim();

  // Verificar se não é uma palavra reservada
  if (RESERVED_SLUGS.includes(normalizedSlug)) {
    return false;
  }

  // Verificar formato válido (alfanumérico, hífens e underscores)
  const slugRegex = /^[a-z0-9_-]+$/;
  if (!slugRegex.test(normalizedSlug)) {
    return false;
  }

  // Verificar tamanho mínimo e máximo
  if (normalizedSlug.length < 3 || normalizedSlug.length > 50) {
    return false;
  }

  return true;
};

/**
 * Retorna uma mensagem de erro apropriada para um slug inválido
 * @param slug - O slug inválido
 * @returns Mensagem de erro em português
 */
export const getSlugValidationError = (slug: string): string => {
  if (!slug || typeof slug !== 'string') {
    return 'O slug é obrigatório';
  }

  const normalizedSlug = slug.toLowerCase().trim();

  if (RESERVED_SLUGS.includes(normalizedSlug)) {
    return 'Este slug é uma palavra reservada do sistema e não pode ser usado';
  }

  const slugRegex = /^[a-z0-9_-]+$/;
  if (!slugRegex.test(normalizedSlug)) {
    return 'O slug deve conter apenas letras minúsculas, números, hífens e underscores';
  }

  if (normalizedSlug.length < 3) {
    return 'O slug deve ter no mínimo 3 caracteres';
  }

  if (normalizedSlug.length > 50) {
    return 'O slug deve ter no máximo 50 caracteres';
  }

  return 'Slug inválido';
};
