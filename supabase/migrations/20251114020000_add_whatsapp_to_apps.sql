-- Adicionar campos de WhatsApp na tabela apps
ALTER TABLE apps ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS whatsapp_message TEXT DEFAULT 'Olá! Vim através do app e gostaria de mais informações.';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS whatsapp_position TEXT DEFAULT 'bottom-right';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS whatsapp_button_color TEXT DEFAULT '#25D366';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS whatsapp_button_text TEXT DEFAULT 'Fale Conosco';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS whatsapp_show_text BOOLEAN DEFAULT TRUE;
