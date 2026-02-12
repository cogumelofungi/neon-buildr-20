-- Adicionar campos bonus10 até bonus19 na tabela apps (bonus20 não existe porque temos 19 bônus + 1 produto principal = 20 uploads)
ALTER TABLE public.apps 
ADD COLUMN IF NOT EXISTS bonus10_url TEXT,
ADD COLUMN IF NOT EXISTS bonus10_label TEXT DEFAULT 'Bônus 10',
ADD COLUMN IF NOT EXISTS bonus11_url TEXT,
ADD COLUMN IF NOT EXISTS bonus11_label TEXT DEFAULT 'Bônus 11',
ADD COLUMN IF NOT EXISTS bonus12_url TEXT,
ADD COLUMN IF NOT EXISTS bonus12_label TEXT DEFAULT 'Bônus 12',
ADD COLUMN IF NOT EXISTS bonus13_url TEXT,
ADD COLUMN IF NOT EXISTS bonus13_label TEXT DEFAULT 'Bônus 13',
ADD COLUMN IF NOT EXISTS bonus14_url TEXT,
ADD COLUMN IF NOT EXISTS bonus14_label TEXT DEFAULT 'Bônus 14',
ADD COLUMN IF NOT EXISTS bonus15_url TEXT,
ADD COLUMN IF NOT EXISTS bonus15_label TEXT DEFAULT 'Bônus 15',
ADD COLUMN IF NOT EXISTS bonus16_url TEXT,
ADD COLUMN IF NOT EXISTS bonus16_label TEXT DEFAULT 'Bônus 16',
ADD COLUMN IF NOT EXISTS bonus17_url TEXT,
ADD COLUMN IF NOT EXISTS bonus17_label TEXT DEFAULT 'Bônus 17',
ADD COLUMN IF NOT EXISTS bonus18_url TEXT,
ADD COLUMN IF NOT EXISTS bonus18_label TEXT DEFAULT 'Bônus 18',
ADD COLUMN IF NOT EXISTS bonus19_url TEXT,
ADD COLUMN IF NOT EXISTS bonus19_label TEXT DEFAULT 'Bônus 19';

-- Dropar as funções antigas para poder recriá-las com novo tipo de retorno
DROP FUNCTION IF EXISTS public.fetch_public_app(text);
DROP FUNCTION IF EXISTS public.get_published_app(text);

-- Recriar fetch_public_app com os novos campos
CREATE OR REPLACE FUNCTION public.fetch_public_app(app_slug text)
RETURNS TABLE(
  id uuid, 
  nome text, 
  descricao text, 
  cor text, 
  slug text, 
  allow_pdf_download boolean, 
  template text, 
  icone_url text, 
  capa_url text, 
  produto_principal_url text, 
  bonus1_url text, bonus2_url text, bonus3_url text, bonus4_url text, 
  bonus5_url text, bonus6_url text, bonus7_url text, bonus8_url text, bonus9_url text,
  bonus10_url text, bonus11_url text, bonus12_url text, bonus13_url text, bonus14_url text,
  bonus15_url text, bonus16_url text, bonus17_url text, bonus18_url text, bonus19_url text,
  main_product_label text, 
  main_product_description text, 
  bonuses_label text, 
  bonus1_label text, bonus2_label text, bonus3_label text, bonus4_label text, 
  bonus5_label text, bonus6_label text, bonus7_label text, bonus8_label text, bonus9_label text,
  bonus10_label text, bonus11_label text, bonus12_label text, bonus13_label text, bonus14_label text,
  bonus15_label text, bonus16_label text, bonus17_label text, bonus18_label text, bonus19_label text,
  theme_config jsonb, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  link_personalizado text, 
  views integer, 
  downloads integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    id, nome, descricao, cor, slug, allow_pdf_download, template,
    icone_url, capa_url, produto_principal_url,
    bonus1_url, bonus2_url, bonus3_url, bonus4_url, 
    bonus5_url, bonus6_url, bonus7_url, bonus8_url, bonus9_url,
    bonus10_url, bonus11_url, bonus12_url, bonus13_url, bonus14_url,
    bonus15_url, bonus16_url, bonus17_url, bonus18_url, bonus19_url,
    main_product_label, main_product_description, bonuses_label,
    bonus1_label, bonus2_label, bonus3_label, bonus4_label,
    bonus5_label, bonus6_label, bonus7_label, bonus8_label, bonus9_label,
    bonus10_label, bonus11_label, bonus12_label, bonus13_label, bonus14_label,
    bonus15_label, bonus16_label, bonus17_label, bonus18_label, bonus19_label,
    theme_config, created_at, updated_at, link_personalizado, views, downloads
  FROM apps
  WHERE slug = app_slug AND status = 'publicado';
$function$;

-- Recriar get_published_app com os novos campos
CREATE OR REPLACE FUNCTION public.get_published_app(app_slug text)
RETURNS TABLE(
  id uuid, 
  nome text, 
  descricao text, 
  cor text, 
  slug text, 
  allow_pdf_download boolean, 
  template text, 
  icone_url text, 
  capa_url text, 
  produto_principal_url text, 
  bonus1_url text, bonus2_url text, bonus3_url text, bonus4_url text, 
  bonus5_url text, bonus6_url text, bonus7_url text, bonus8_url text, bonus9_url text,
  bonus10_url text, bonus11_url text, bonus12_url text, bonus13_url text, bonus14_url text,
  bonus15_url text, bonus16_url text, bonus17_url text, bonus18_url text, bonus19_url text,
  main_product_label text, 
  main_product_description text, 
  bonuses_label text, 
  bonus1_label text, bonus2_label text, bonus3_label text, bonus4_label text, 
  bonus5_label text, bonus6_label text, bonus7_label text, bonus8_label text, bonus9_label text,
  bonus10_label text, bonus11_label text, bonus12_label text, bonus13_label text, bonus14_label text,
  bonus15_label text, bonus16_label text, bonus17_label text, bonus18_label text, bonus19_label text,
  theme_config jsonb, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  link_personalizado text, 
  views integer, 
  downloads integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    id, nome, descricao, cor, slug, allow_pdf_download, template,
    icone_url, capa_url, produto_principal_url,
    bonus1_url, bonus2_url, bonus3_url, bonus4_url, 
    bonus5_url, bonus6_url, bonus7_url, bonus8_url, bonus9_url,
    bonus10_url, bonus11_url, bonus12_url, bonus13_url, bonus14_url,
    bonus15_url, bonus16_url, bonus17_url, bonus18_url, bonus19_url,
    main_product_label, main_product_description, bonuses_label,
    bonus1_label, bonus2_label, bonus3_label, bonus4_label,
    bonus5_label, bonus6_label, bonus7_label, bonus8_label, bonus9_label,
    bonus10_label, bonus11_label, bonus12_label, bonus13_label, bonus14_label,
    bonus15_label, bonus16_label, bonus17_label, bonus18_label, bonus19_label,
    theme_config, created_at, updated_at, link_personalizado, views, downloads
  FROM apps
  WHERE slug = app_slug AND status = 'publicado';
$function$;