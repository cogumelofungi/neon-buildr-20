-- Tabela para histórico de assinaturas (backup/restauração)
CREATE TABLE public.subscription_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Dados antes da mudança
  previous_plan_id UUID,
  previous_plan_name TEXT,
  previous_status TEXT,
  
  -- Dados depois da mudança
  new_plan_id UUID,
  new_plan_name TEXT,
  new_status TEXT,
  
  -- Metadados
  event_type TEXT NOT NULL, -- 'upgrade', 'downgrade', 'cancel', 'reactivate', 'auto_restore'
  event_source TEXT NOT NULL, -- 'webhook', 'checkout', 'portal', 'admin', 'auto_restore'
  stripe_event_id TEXT,
  
  -- Dados para restauração
  can_restore BOOLEAN DEFAULT true,
  restored_at TIMESTAMP WITH TIME ZONE,
  restored_by UUID,
  restore_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  raw_data JSONB -- Dados brutos da Stripe para debug
);

-- Índices para queries rápidas
CREATE INDEX idx_subscription_history_user_id ON public.subscription_history(user_id);
CREATE INDEX idx_subscription_history_email ON public.subscription_history(user_email);
CREATE INDEX idx_subscription_history_created_at ON public.subscription_history(created_at DESC);
CREATE INDEX idx_subscription_history_event_type ON public.subscription_history(event_type);

-- RLS
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- Admins podem ver tudo
CREATE POLICY "Admins can view all subscription history" 
ON public.subscription_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Usuários podem ver seu próprio histórico
CREATE POLICY "Users can view own subscription history" 
ON public.subscription_history 
FOR SELECT 
USING (user_id = auth.uid());

-- Service role pode inserir (para webhooks)
CREATE POLICY "Service role can insert subscription history" 
ON public.subscription_history 
FOR INSERT 
WITH CHECK (true);