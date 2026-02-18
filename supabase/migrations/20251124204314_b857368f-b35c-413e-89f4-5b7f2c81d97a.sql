-- Criar plano "Gratuito" se não existir
INSERT INTO public.plans (name, price, app_limit)
VALUES ('Gratuito', 0.00, 1)
ON CONFLICT DO NOTHING;