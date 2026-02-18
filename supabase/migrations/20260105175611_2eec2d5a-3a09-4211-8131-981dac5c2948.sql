-- Desabilitar trigger temporariamente para correção de dados
ALTER TABLE user_status DISABLE TRIGGER user_status_change_trigger;

-- Corrigir o usuário com assinatura vencida (pastordiegopeixe@gmail.com)
UPDATE user_status 
SET 
  plan_id = '5660a8b5-fdf9-4d88-818c-328a6aca5e52',
  is_active = false,
  updated_at = now()
WHERE user_id = 'c213cdf3-d1a6-4626-8d27-daac6de92584';

-- Reabilitar trigger
ALTER TABLE user_status ENABLE TRIGGER user_status_change_trigger;