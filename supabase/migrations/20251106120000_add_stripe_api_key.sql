-- Adicionar coluna para armazenar a Stripe Secret Key de cada usuário
ALTER TABLE products
ADD COLUMN stripe_api_key TEXT;

-- Comentário explicativo
COMMENT ON COLUMN products.stripe_api_key IS 'Stripe Secret Key (sk_live_...) para chamadas à API. Usado apenas para plataforma Stripe.';
