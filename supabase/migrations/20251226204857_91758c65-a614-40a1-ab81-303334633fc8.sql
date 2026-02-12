-- Criar o plano Consultório com os mesmos benefícios do Empresarial
INSERT INTO plans (id, name, app_limit, price)
VALUES ('c8e4d5f2-9a3b-4e1c-8f0d-2a5b6c7d8e9f', 'Consultório', 6, 127)
ON CONFLICT (id) DO NOTHING;