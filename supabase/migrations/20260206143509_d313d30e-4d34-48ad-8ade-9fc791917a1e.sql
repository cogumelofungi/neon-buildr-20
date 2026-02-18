
-- Add affiliate_mode column to order_bumps table
ALTER TABLE public.order_bumps ADD COLUMN IF NOT EXISTS affiliate_mode boolean NOT NULL DEFAULT false;

-- Drop and recreate function with new return type
DROP FUNCTION IF EXISTS public.get_public_order_bumps(uuid);

CREATE FUNCTION public.get_public_order_bumps(p_app_id uuid)
RETURNS TABLE(
  id uuid,
  label text,
  description text,
  content_url text,
  content_type text,
  premium_card_title text,
  premium_card_description text,
  purchase_link text,
  affiliate_mode boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    ob.id,
    ob.label,
    ob.description,
    ob.content_url,
    ob.content_type,
    ob.premium_card_title,
    ob.premium_card_description,
    ob.purchase_link,
    ob.affiliate_mode
  FROM order_bumps ob
  WHERE ob.app_id = p_app_id
    AND ob.is_active = true
  ORDER BY ob.display_order ASC;
$$;
