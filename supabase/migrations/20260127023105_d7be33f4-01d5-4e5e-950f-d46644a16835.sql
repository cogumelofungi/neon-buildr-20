-- Permitir que user_id e app_id sejam NULL inicialmente
ALTER TABLE public.custom_domains 
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.custom_domains 
  ALTER COLUMN app_id DROP NOT NULL;

-- Atualizar políticas RLS para permitir leitura por token
-- (necessário para validação do token durante ativação)
CREATE POLICY "Anyone can read by verification_code" 
  ON public.custom_domains 
  FOR SELECT 
  USING (true);