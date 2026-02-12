
-- Desabilitar o trigger que causa o problema
ALTER TABLE user_status DISABLE TRIGGER user_status_change_trigger;

-- Atualizar o usuário coroneljosevital@gmail.com
UPDATE user_status 
SET 
  is_active = false,
  plan_id = '5660a8b5-fdf9-4d88-818c-328a6aca5e52',
  updated_at = now()
WHERE user_id = '9bf98e27-deac-4b7e-8d1a-b4d0a7d284f9';

-- Reabilitar o trigger
ALTER TABLE user_status ENABLE TRIGGER user_status_change_trigger;
