-- Drop e recria a função com os novos campos
DROP FUNCTION IF EXISTS public.get_public_order_bumps(uuid);

CREATE FUNCTION public.get_public_order_bumps(p_app_id uuid)
 RETURNS TABLE(id uuid, label text, description text, content_url text, content_type text, premium_card_title text, premium_card_description text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    id,
    label,
    description,
    content_url,
    content_type,
    premium_card_title,
    premium_card_description
  FROM order_bumps
  WHERE app_id = p_app_id
    AND is_active = true
  ORDER BY display_order ASC;
$function$;