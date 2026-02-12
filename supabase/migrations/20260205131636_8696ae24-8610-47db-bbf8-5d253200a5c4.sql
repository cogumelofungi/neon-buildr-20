-- Adicionar campos de integração à tabela order_bumps para funcionar independentemente
ALTER TABLE public.order_bumps
ADD COLUMN IF NOT EXISTS api_token text,
ADD COLUMN IF NOT EXISTS webhook_token text,
ADD COLUMN IF NOT EXISTS client_id text,
ADD COLUMN IF NOT EXISTS client_secret text,
ADD COLUMN IF NOT EXISTS basic_token text,
ADD COLUMN IF NOT EXISTS hottok text,
ADD COLUMN IF NOT EXISTS postback_key text,
ADD COLUMN IF NOT EXISTS stripe_api_key text,
ADD COLUMN IF NOT EXISTS account_id text,
ADD COLUMN IF NOT EXISTS store_slug text,
ADD COLUMN IF NOT EXISTS yampi_secret_key text,
ADD COLUMN IF NOT EXISTS default_language text DEFAULT 'pt-br';