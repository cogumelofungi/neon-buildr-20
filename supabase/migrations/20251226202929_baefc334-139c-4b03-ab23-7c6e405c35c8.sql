-- Corrigir o user_status dos usuários que compraram com os novos price IDs
-- jehdeisy@gmail.com - Plano Profissional
UPDATE user_status 
SET plan_id = '2e93cc7a-5800-4bf3-8a18-7a1cffbe521c'
WHERE user_id = '0a537e97-d00a-4ace-94f0-9c7bc2d279ad';

-- carlosilvaneto@gmail.com - Plano Profissional (já existia, precisa atualizar o stripe info)
UPDATE user_status 
SET 
  plan_id = '2e93cc7a-5800-4bf3-8a18-7a1cffbe521c',
  stripe_customer_id = 'cus_Tg3TxilPqpuYaT',
  stripe_subscription_id = 'sub_1SihMKCOewOtyI3v18NQmpKx',
  payment_method = 'stripe',
  bypass_stripe_check = false,
  last_renewal_date = NOW()
WHERE user_id = '53c00a01-ddf8-47f3-b678-a8da1dfb4e19';