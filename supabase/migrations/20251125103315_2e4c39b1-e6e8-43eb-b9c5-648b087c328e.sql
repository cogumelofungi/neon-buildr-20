-- Atualiza o limite de apps do plano Gratuito para 0
UPDATE plans 
SET app_limit = 0 
WHERE name = 'Gratuito';