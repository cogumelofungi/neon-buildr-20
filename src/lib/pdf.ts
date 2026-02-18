/**
 * Helpers para PDF proxy (CORS workaround via Edge Function)
 */

export const isStorageUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const u = new URL(url);
    return /supabase\.co\/storage|cdn\.supabase\.co|storage\.googleapis\.com/.test(
      u.host + u.pathname
    );
  } catch {
    return false;
  }
};

export const pdfProxyUrl = (url: string): string => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://jboartixfhvifdecdufq.supabase.co';
  const base = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/pdf-proxy`;
  return `${base}?url=${encodeURIComponent(url)}&t=${Date.now()}`;
};
