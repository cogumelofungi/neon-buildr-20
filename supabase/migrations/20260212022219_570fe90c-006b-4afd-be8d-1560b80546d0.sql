
CREATE OR REPLACE FUNCTION public.admin_generate_order_bump_code(p_order_bump_id uuid, p_buyer_email text DEFAULT 'manual@admin')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_code text;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Verify user owns the order bump via app ownership
  IF NOT EXISTS (
    SELECT 1 FROM order_bumps ob
    JOIN apps a ON ob.app_id = a.id
    WHERE ob.id = p_order_bump_id AND a.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: you do not own this order bump';
  END IF;

  -- Generate unique code
  v_code := generate_access_code();

  -- Insert access code
  INSERT INTO order_bump_access_codes (order_bump_id, access_code, buyer_email, is_used)
  VALUES (p_order_bump_id, v_code, p_buyer_email, false);

  RETURN v_code;
END;
$$;
