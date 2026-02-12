-- Adicionar campo require_login na tabela apps
ALTER TABLE public.apps 
ADD COLUMN IF NOT EXISTS require_login boolean DEFAULT false;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.apps.require_login IS 'Quando true, exige que o visitante insira o email de compra para acessar o app';