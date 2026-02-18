-- 1. Remover política conflitante na tabela profiles que pode causar confusão
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;

-- 2. Corrigir funções sem search_path definido
CREATE OR REPLACE FUNCTION public.update_page_configurations_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_purchases_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_custom_domains_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.protect_bypass_flag()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.stripe_customer_id IS NOT NULL THEN
    NEW.bypass_stripe_check := false;
  END IF;
  RETURN NEW;
END;
$function$;