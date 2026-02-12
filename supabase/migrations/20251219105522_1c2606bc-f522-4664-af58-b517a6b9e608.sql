-- Adicionar campos de tradução para título, descrição e seção
ALTER TABLE public.tutorial_videos
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS title_es TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_es TEXT,
ADD COLUMN IF NOT EXISTS section_en TEXT,
ADD COLUMN IF NOT EXISTS section_es TEXT;