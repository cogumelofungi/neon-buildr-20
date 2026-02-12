-- Adicionar campos de notificação na tabela apps
ALTER TABLE public.apps 
ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_text TEXT DEFAULT 'Você tem 1 nova notificação';