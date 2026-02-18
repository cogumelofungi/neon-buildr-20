-- Adicionar campos de personalização visual para Order Bumps
-- Estrutura similar à tabela apps para configuração do "mini-app" do order bump

-- Campos visuais e de estrutura
ALTER TABLE public.order_bumps 
ADD COLUMN IF NOT EXISTS nome text,
ADD COLUMN IF NOT EXISTS cor text DEFAULT '#4783F6',
ADD COLUMN IF NOT EXISTS icone_url text,
ADD COLUMN IF NOT EXISTS capa_url text,
ADD COLUMN IF NOT EXISTS template text DEFAULT 'classic',
ADD COLUMN IF NOT EXISTS app_theme text DEFAULT 'dark',
ADD COLUMN IF NOT EXISTS theme_config jsonb,
ADD COLUMN IF NOT EXISTS allow_pdf_download boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS view_button_label text;

-- Campos de uploads (até 10 arquivos)
ALTER TABLE public.order_bumps
ADD COLUMN IF NOT EXISTS produto_principal_url text,
ADD COLUMN IF NOT EXISTS bonus1_url text,
ADD COLUMN IF NOT EXISTS bonus2_url text,
ADD COLUMN IF NOT EXISTS bonus3_url text,
ADD COLUMN IF NOT EXISTS bonus4_url text,
ADD COLUMN IF NOT EXISTS bonus5_url text,
ADD COLUMN IF NOT EXISTS bonus6_url text,
ADD COLUMN IF NOT EXISTS bonus7_url text,
ADD COLUMN IF NOT EXISTS bonus8_url text,
ADD COLUMN IF NOT EXISTS bonus9_url text;

-- Rótulos dos uploads
ALTER TABLE public.order_bumps
ADD COLUMN IF NOT EXISTS main_product_label text DEFAULT 'Produto Principal',
ADD COLUMN IF NOT EXISTS main_product_description text,
ADD COLUMN IF NOT EXISTS bonuses_label text DEFAULT 'Bônus Exclusivos',
ADD COLUMN IF NOT EXISTS bonus1_label text DEFAULT 'Bônus 1',
ADD COLUMN IF NOT EXISTS bonus2_label text DEFAULT 'Bônus 2',
ADD COLUMN IF NOT EXISTS bonus3_label text DEFAULT 'Bônus 3',
ADD COLUMN IF NOT EXISTS bonus4_label text DEFAULT 'Bônus 4',
ADD COLUMN IF NOT EXISTS bonus5_label text DEFAULT 'Bônus 5',
ADD COLUMN IF NOT EXISTS bonus6_label text DEFAULT 'Bônus 6',
ADD COLUMN IF NOT EXISTS bonus7_label text DEFAULT 'Bônus 7',
ADD COLUMN IF NOT EXISTS bonus8_label text DEFAULT 'Bônus 8',
ADD COLUMN IF NOT EXISTS bonus9_label text DEFAULT 'Bônus 9';

-- Comentários para documentação
COMMENT ON COLUMN public.order_bumps.nome IS 'Nome exibido no app do order bump';
COMMENT ON COLUMN public.order_bumps.cor IS 'Cor principal do tema';
COMMENT ON COLUMN public.order_bumps.template IS 'Template visual: classic, modern, minimal, etc.';
COMMENT ON COLUMN public.order_bumps.produto_principal_url IS 'URL do produto principal (arquivo ou link)';
COMMENT ON COLUMN public.order_bumps.bonus1_url IS 'URL do bônus 1';