
-- Add purchase_link column to order_bumps table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'order_bumps' 
    AND column_name = 'purchase_link'
  ) THEN
    ALTER TABLE public.order_bumps ADD COLUMN purchase_link text NULL;
  END IF;
END $$;

-- Recreate the function with the new return type
DROP FUNCTION IF EXISTS public.get_public_order_bumps(uuid);

CREATE OR REPLACE FUNCTION public.get_public_order_bumps(p_app_id uuid)
RETURNS TABLE(
  id uuid,
  label text,
  description text,
  content_url text,
  content_type text,
  premium_card_title text,
  premium_card_description text,
  purchase_link text
)
LANGUAGE sql
STABLE SECURITY DEFINER
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
    ob.purchase_link
  FROM order_bumps ob
  WHERE ob.app_id = p_app_id
    AND ob.is_active = true
  ORDER BY ob.display_order ASC;
$$;
