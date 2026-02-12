-- PASSO 1: Deletar planos existentes e dados relacionados
DELETE FROM public.user_status WHERE plan_id IS NOT NULL;
DELETE FROM public.plans;

-- PASSO 2: Adicionar colunas faltantes na tabela user_status
ALTER TABLE public.user_status 
ADD COLUMN IF NOT EXISTS bypass_stripe_check BOOLEAN DEFAULT false;

ALTER TABLE public.user_status 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

ALTER TABLE public.user_status 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

ALTER TABLE public.user_status 
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- A coluna last_renewal_date já existe, não precisa adicionar

-- PASSO 3: Inserir planos com IDs FIXOS (mesmos IDs para mensal e anual)
INSERT INTO public.plans (id, name, app_limit, price) VALUES
  ('8851ac57-8aa3-450b-8fda-c13f1f064efa', 'Essencial', 3, 19.00),
  ('2e93cc7a-5800-4bf3-8a18-7a1cffbe521c', 'Profissional', 5, 49.00),
  ('21c9894c-279a-4152-bc18-65309448f5cf', 'Empresarial', 10, 99.00);

-- PASSO 4: Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_status_stripe_customer 
ON public.user_status(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_user_status_stripe_subscription 
ON public.user_status(stripe_subscription_id);
