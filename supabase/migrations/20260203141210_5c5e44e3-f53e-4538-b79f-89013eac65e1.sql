-- Tabela de configuração de order bumps
CREATE TABLE public.order_bumps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  content_url TEXT NOT NULL,
  content_type TEXT DEFAULT 'file',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de códigos de acesso para order bumps
CREATE TABLE public.order_bump_access_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_bump_id UUID NOT NULL REFERENCES public.order_bumps(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,
  buyer_email TEXT NOT NULL,
  access_code TEXT NOT NULL UNIQUE,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_order_bumps_app_id ON public.order_bumps(app_id);
CREATE INDEX idx_order_bumps_product_provider ON public.order_bumps(product_id, provider);
CREATE INDEX idx_order_bump_access_codes_code ON public.order_bump_access_codes(access_code);
CREATE INDEX idx_order_bump_access_codes_email ON public.order_bump_access_codes(buyer_email);

-- Enable RLS
ALTER TABLE public.order_bumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_bump_access_codes ENABLE ROW LEVEL SECURITY;

-- Políticas para order_bumps
CREATE POLICY "Users can view their own order bumps"
ON public.order_bumps FOR SELECT
USING (app_id IN (SELECT id FROM apps WHERE user_id = auth.uid()));

CREATE POLICY "Users can create order bumps for their apps"
ON public.order_bumps FOR INSERT
WITH CHECK (app_id IN (SELECT id FROM apps WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own order bumps"
ON public.order_bumps FOR UPDATE
USING (app_id IN (SELECT id FROM apps WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own order bumps"
ON public.order_bumps FOR DELETE
USING (app_id IN (SELECT id FROM apps WHERE user_id = auth.uid()));

-- Políticas para order_bump_access_codes
CREATE POLICY "Users can view access codes for their order bumps"
ON public.order_bump_access_codes FOR SELECT
USING (order_bump_id IN (
  SELECT ob.id FROM order_bumps ob
  JOIN apps a ON ob.app_id = a.id
  WHERE a.user_id = auth.uid()
));

CREATE POLICY "Service role can manage access codes"
ON public.order_bump_access_codes FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Trigger para updated_at
CREATE TRIGGER update_order_bumps_updated_at
BEFORE UPDATE ON public.order_bumps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar código de acesso amigável
CREATE OR REPLACE FUNCTION public.generate_access_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := 'MB-';
  i INTEGER;
BEGIN
  FOR i IN 1..4 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;