import { supabase } from '@/integrations/supabase/client';
import { normalizeSlug } from './slugValidation';

/**
 * Gera um slug único para importação de apps.
 * Adiciona "-copy" ao slug original. Se já existir, tenta "-copy-1", "-copy-2", etc.
 * Verifica no banco de dados (tabela apps, coluna link_personalizado) se o slug já está em uso.
 *
 * @param originalSlug - O slug original do app sendo importado
 * @returns O slug único gerado
 */
export const generateUniqueSlug = async (originalSlug: string): Promise<string> => {
  if (!originalSlug) return '';

  const baseSlug = normalizeSlug(originalSlug);
  if (!baseSlug) return '';

  // Remove sufixos -copy, -copy-N existentes para evitar acúmulo
  const cleanBase = baseSlug.replace(/-copy(-\d+)?$/, '');

  // Primeira tentativa: slug-copy
  const firstCandidate = `${cleanBase}-copy`;

  const { data: existingApps } = await supabase
    .from('apps')
    .select('link_personalizado')
    .like('link_personalizado', `${cleanBase}-copy%`);

  const existingSlugs = new Set(
    (existingApps || []).map(app => app.link_personalizado?.toLowerCase())
  );

  if (!existingSlugs.has(firstCandidate)) {
    return firstCandidate;
  }

  // Tentar -copy-1, -copy-2, etc.
  for (let i = 1; i <= 100; i++) {
    const candidate = `${cleanBase}-copy-${i}`;
    if (!existingSlugs.has(candidate)) {
      return candidate;
    }
  }

  // Fallback extremo
  return `${cleanBase}-copy-${Date.now()}`;
};
