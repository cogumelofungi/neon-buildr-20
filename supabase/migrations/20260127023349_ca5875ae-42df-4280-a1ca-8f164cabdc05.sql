-- Remover política antiga de INSERT
DROP POLICY IF EXISTS "Users can insert mappings for their domains" ON public.domain_app_mappings;

-- Criar nova política que funciona com o fluxo de ativação por token
CREATE POLICY "Users can insert mappings for their domains" 
  ON public.domain_app_mappings 
  FOR INSERT 
  WITH CHECK (
    -- O domínio deve pertencer ao usuário atual
    (custom_domain_id IN (
      SELECT id FROM custom_domains 
      WHERE user_id = auth.uid()
    ))
    AND
    -- O app deve pertencer ao usuário atual
    (app_id IN (
      SELECT id FROM apps 
      WHERE user_id = auth.uid()
    ))
  );