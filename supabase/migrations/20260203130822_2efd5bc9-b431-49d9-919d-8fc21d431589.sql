-- Permitir que app_id seja NULL na tabela products
-- Isso permite que o usuário insira qualquer URL sem precisar de um app cadastrado

ALTER TABLE public.products 
ALTER COLUMN app_id DROP NOT NULL;