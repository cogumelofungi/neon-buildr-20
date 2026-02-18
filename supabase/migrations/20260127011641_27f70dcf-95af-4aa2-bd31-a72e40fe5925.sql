-- Criar tabela para mapeamentos de apps em domínios personalizados
-- Permite mapear múltiplos apps a um único domínio (raiz e subpaths)
CREATE TABLE public.domain_app_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_domain_id UUID NOT NULL REFERENCES public.custom_domains(id) ON DELETE CASCADE,
  path TEXT NOT NULL DEFAULT '/', -- '/' para raiz, '/app2', '/cursos', etc.
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  app_link TEXT NOT NULL, -- URL completa do app no Migrabook
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(custom_domain_id, path) -- Cada path só pode ter um app
);

-- Habilitar RLS
ALTER TABLE public.domain_app_mappings ENABLE ROW LEVEL SECURITY;

-- Policies para domain_app_mappings
CREATE POLICY "Users can view their own domain mappings"
ON public.domain_app_mappings
FOR SELECT
USING (
  custom_domain_id IN (
    SELECT id FROM public.custom_domains WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert mappings for their domains"
ON public.domain_app_mappings
FOR INSERT
WITH CHECK (
  custom_domain_id IN (
    SELECT id FROM public.custom_domains WHERE user_id = auth.uid()
  )
  AND app_id IN (
    SELECT id FROM public.apps WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own mappings"
ON public.domain_app_mappings
FOR UPDATE
USING (
  custom_domain_id IN (
    SELECT id FROM public.custom_domains WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own mappings"
ON public.domain_app_mappings
FOR DELETE
USING (
  custom_domain_id IN (
    SELECT id FROM public.custom_domains WHERE user_id = auth.uid()
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_domain_app_mappings_updated_at
BEFORE UPDATE ON public.domain_app_mappings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índice para buscas rápidas
CREATE INDEX idx_domain_app_mappings_domain_path ON public.domain_app_mappings(custom_domain_id, path);

-- Comentários
COMMENT ON TABLE public.domain_app_mappings IS 'Mapeamento de apps para paths em domínios personalizados';
COMMENT ON COLUMN public.domain_app_mappings.path IS 'Path do domínio: / para raiz, /app2 para subpath, etc.';