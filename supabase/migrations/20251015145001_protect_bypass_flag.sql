-- Função que protege o campo bypass_stripe_check
CREATE OR REPLACE FUNCTION protect_bypass_flag()
RETURNS TRIGGER AS $$
BEGIN
  -- Se tem stripe_customer_id, NUNCA permitir bypass = true
  IF NEW.stripe_customer_id IS NOT NULL THEN
    NEW.bypass_stripe_check := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que executa antes de INSERT ou UPDATE
CREATE TRIGGER enforce_bypass_consistency
BEFORE UPDATE OR INSERT ON user_status
FOR EACH ROW
EXECUTE FUNCTION protect_bypass_flag();
