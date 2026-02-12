-- Adicionar colunas para nome e telefone na tabela pending_users
ALTER TABLE public.pending_users 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS phone text;