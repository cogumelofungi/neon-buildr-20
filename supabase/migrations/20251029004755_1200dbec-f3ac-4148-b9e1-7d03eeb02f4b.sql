-- Criar tabela para códigos de verificação
CREATE TABLE public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas seus próprios códigos
CREATE POLICY "Users can view their own verification codes"
ON public.verification_codes
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Service role pode inserir códigos (para edge functions)
CREATE POLICY "Service role can insert verification codes"
ON public.verification_codes
FOR INSERT
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Policy: Service role pode atualizar códigos (para marcar como usado)
CREATE POLICY "Service role can update verification codes"
ON public.verification_codes
FOR UPDATE
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Índice para melhor performance nas buscas
CREATE INDEX idx_verification_codes_email ON public.verification_codes(email);
CREATE INDEX idx_verification_codes_code ON public.verification_codes(code);
CREATE INDEX idx_verification_codes_expires_at ON public.verification_codes(expires_at);