-- Adicionar campo favicon_url na tabela custom_domains
ALTER TABLE public.custom_domains 
ADD COLUMN IF NOT EXISTS favicon_url text DEFAULT NULL;