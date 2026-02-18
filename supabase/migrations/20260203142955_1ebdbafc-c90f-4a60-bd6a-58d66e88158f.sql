-- Função para buscar order bumps públicos de um app
CREATE OR REPLACE FUNCTION public.get_public_order_bumps(p_app_id UUID)
RETURNS TABLE (
  id UUID,
  label TEXT,
  description TEXT,
  content_url TEXT,
  content_type TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    label,
    description,
    content_url,
    content_type
  FROM order_bumps
  WHERE app_id = p_app_id
    AND is_active = true
  ORDER BY display_order ASC;
$$;

-- Permitir acesso público à função
GRANT EXECUTE ON FUNCTION public.get_public_order_bumps(UUID) TO anon, authenticated;