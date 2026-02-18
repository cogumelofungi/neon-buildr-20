-- Função segura para verificar se um e-mail tem compra válida para um app
-- Usa SECURITY DEFINER para bypass de RLS, mas só retorna dados limitados
CREATE OR REPLACE FUNCTION public.verify_purchase_email(
  p_app_id UUID,
  p_email TEXT
)
RETURNS TABLE(
  purchase_id UUID,
  buyer_name TEXT,
  buyer_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.buyer_name,
    p.buyer_email
  FROM purchases p
  WHERE p.app_id = p_app_id
    AND LOWER(TRIM(p.buyer_email)) = LOWER(TRIM(p_email))
    AND p.status = 'completed'
  LIMIT 1;
END;
$$;