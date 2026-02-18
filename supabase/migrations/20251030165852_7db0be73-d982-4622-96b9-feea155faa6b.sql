-- Add notification title and message columns to apps table
ALTER TABLE public.apps
ADD COLUMN notification_title TEXT DEFAULT 'Nova Notificação',
ADD COLUMN notification_message TEXT DEFAULT 'Você tem uma nova atualização disponível!';