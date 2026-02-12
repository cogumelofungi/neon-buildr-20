-- Adicionar campo app_link na tabela order_bumps para o link de acesso do app
ALTER TABLE public.order_bumps 
ADD COLUMN IF NOT EXISTS app_link text;

-- Comentário para documentação
COMMENT ON COLUMN public.order_bumps.app_link IS 'Link público do app para o comprador acessar após desbloquear o conteúdo';