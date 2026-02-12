-- Remover policy pública que permite SELECT irrestrito na tabela custom_domains
-- (a ativação por token passará a ser feita via Edge Function com service role)
DROP POLICY IF EXISTS "Anyone can read by verification_code" ON public.custom_domains;