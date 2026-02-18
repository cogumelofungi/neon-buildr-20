-- Tabela de agendamentos para o plano Consultório
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  service_type TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_appointments_app_id ON public.appointments(app_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Habilitar RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Apenas o dono do app pode ver/gerenciar os agendamentos
CREATE POLICY "Users can view appointments for their apps"
ON public.appointments
FOR SELECT
USING (
  app_id IN (
    SELECT id FROM apps WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert appointments for their apps"
ON public.appointments
FOR INSERT
WITH CHECK (
  app_id IN (
    SELECT id FROM apps WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update appointments for their apps"
ON public.appointments
FOR UPDATE
USING (
  app_id IN (
    SELECT id FROM apps WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete appointments for their apps"
ON public.appointments
FOR DELETE
USING (
  app_id IN (
    SELECT id FROM apps WHERE user_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();