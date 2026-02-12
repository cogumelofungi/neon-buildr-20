-- Add theme field to apps table
ALTER TABLE public.apps 
ADD COLUMN IF NOT EXISTS app_theme TEXT DEFAULT 'dark' CHECK (app_theme IN ('light', 'dark'));