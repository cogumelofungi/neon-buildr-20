
-- Add new columns for the premium card redesign
ALTER TABLE public.order_bumps ADD COLUMN IF NOT EXISTS premium_image_url text;
ALTER TABLE public.order_bumps ADD COLUMN IF NOT EXISTS bullet1 text;
ALTER TABLE public.order_bumps ADD COLUMN IF NOT EXISTS bullet2 text;
ALTER TABLE public.order_bumps ADD COLUMN IF NOT EXISTS bullet3 text;
ALTER TABLE public.order_bumps ADD COLUMN IF NOT EXISTS unlock_button_color text DEFAULT '#22c55e';

-- Recreate the public RPC function with the new fields
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
  affiliate_mode boolean,
  premium_image_url text,
  bullet1 text,
  bullet2 text,
  bullet3 text,
  unlock_button_color text
) AS $$
  SELECT
    ob.id,
    ob.label,
    ob.description,
    ob.content_url,
    ob.content_type,
    ob.premium_card_title,
    ob.premium_card_description,
    ob.purchase_link,
    ob.affiliate_mode,
    ob.premium_image_url,
    ob.bullet1,
    ob.bullet2,
    ob.bullet3,
    ob.unlock_button_color
  FROM order_bumps ob
  WHERE ob.app_id = p_app_id
    AND ob.is_active = true
  ORDER BY ob.display_order ASC;
$$ LANGUAGE sql STABLE;
