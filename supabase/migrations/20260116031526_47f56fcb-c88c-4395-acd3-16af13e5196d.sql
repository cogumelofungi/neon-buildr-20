-- Create social proof notifications settings table
CREATE TABLE public.social_proof_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  position VARCHAR(20) NOT NULL DEFAULT 'bottom-right',
  interval_seconds INTEGER NOT NULL DEFAULT 5,
  display_duration_seconds INTEGER NOT NULL DEFAULT 4,
  routes TEXT[] NOT NULL DEFAULT ARRAY['/assine', '/assinatura', '/planos']::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social proof notifications table for individual notifications
CREATE TABLE public.social_proof_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  action VARCHAR(200) NOT NULL,
  location VARCHAR(100),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_proof_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_proof_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for social_proof_settings (admin only for write, public for read)
CREATE POLICY "Anyone can view social proof settings"
ON public.social_proof_settings
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert social proof settings"
ON public.social_proof_settings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update social proof settings"
ON public.social_proof_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for social_proof_notifications (admin only for write, public for read)
CREATE POLICY "Anyone can view social proof notifications"
ON public.social_proof_notifications
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert social proof notifications"
ON public.social_proof_notifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update social proof notifications"
ON public.social_proof_notifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete social proof notifications"
ON public.social_proof_notifications
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_social_proof_settings_updated_at
BEFORE UPDATE ON public.social_proof_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_proof_notifications_updated_at
BEFORE UPDATE ON public.social_proof_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.social_proof_settings (is_enabled, position, interval_seconds, display_duration_seconds, routes)
VALUES (false, 'bottom-right', 5, 4, ARRAY['/assine', '/assinatura', '/planos']::TEXT[]);

-- Insert some sample notifications
INSERT INTO public.social_proof_notifications (name, action, location, display_order) VALUES
('João Silva', 'acabou de assinar o plano Completa', 'São Paulo, SP', 1),
('Maria Santos', 'criou seu primeiro app', 'Rio de Janeiro, RJ', 2),
('Pedro Oliveira', 'está personalizando seu ebook', 'Belo Horizonte, MG', 3),
('Ana Costa', 'acabou de publicar seu app', 'Curitiba, PR', 4),
('Carlos Ferreira', 'assinou o plano Consultório', 'Porto Alegre, RS', 5);