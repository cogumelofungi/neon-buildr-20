-- Desativar contas com assinatura vencida no Stripe
UPDATE public.user_status 
SET is_active = false, updated_at = now() 
WHERE user_id IN ('ec0bfab1-60c1-46d2-8414-f39f38cdaacc', '87658ef2-e308-42bb-b2af-d9c952db149c');