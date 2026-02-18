-- Adiciona colunas para personalização do card de conteúdos premium
ALTER TABLE public.order_bumps 
ADD COLUMN IF NOT EXISTS premium_card_title text DEFAULT 'Conteúdos Premium',
ADD COLUMN IF NOT EXISTS premium_card_description text DEFAULT 'Desbloqueie com seu código de acesso';