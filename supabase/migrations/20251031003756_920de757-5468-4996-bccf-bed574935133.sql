-- Adicionar campos para personalização da notificação
ALTER TABLE public.apps 
ADD COLUMN IF NOT EXISTS notification_button_color TEXT DEFAULT '#f97316',
ADD COLUMN IF NOT EXISTS notification_icon TEXT DEFAULT 'gift';