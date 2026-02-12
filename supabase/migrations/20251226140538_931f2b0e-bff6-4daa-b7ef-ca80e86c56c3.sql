-- Tabela para armazenar usuários pendentes de criar senha após compra no Stripe
CREATE TABLE public.pending_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id UUID REFERENCES public.plans(id),
  plan_name TEXT,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ
);

-- Criar índice para busca por email e token
CREATE INDEX idx_pending_users_email ON public.pending_users(email);
CREATE INDEX idx_pending_users_token ON public.pending_users(token);

-- Habilitar RLS
ALTER TABLE public.pending_users ENABLE ROW LEVEL SECURITY;

-- Política para service role poder inserir/atualizar
CREATE POLICY "Service role can manage pending users"
ON public.pending_users
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Política para permitir leitura pública por token (para validação na página de setup)
CREATE POLICY "Anyone can read by token"
ON public.pending_users
FOR SELECT
USING (true);