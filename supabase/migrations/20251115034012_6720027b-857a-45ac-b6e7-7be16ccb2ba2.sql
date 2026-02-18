-- Create tutorial_videos table
CREATE TABLE public.tutorial_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  category TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tutorial_videos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Anyone can view active videos"
ON public.tutorial_videos
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all videos"
ON public.tutorial_videos
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_tutorial_videos_updated_at
BEFORE UPDATE ON public.tutorial_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns vídeos de exemplo
INSERT INTO public.tutorial_videos (title, description, video_url, category, slug) VALUES
('Tutorial Braip', 'Como integrar com Braip', 'dQw4w9WgXcQ', 'braip', 'tutorial-braip'),
('Tutorial Kiwify', 'Como integrar com Kiwify', 'dQw4w9WgXcQ', 'kiwify', 'tutorial-kiwify'),
('Tutorial Hotmart', 'Como integrar com Hotmart', 'dQw4w9WgXcQ', 'hotmart', 'tutorial-hotmart'),
('Tutorial Monetizze', 'Como integrar com Monetizze', 'dQw4w9WgXcQ', 'monetizze', 'tutorial-monetizze'),
('Tutorial Perfect Pay', 'Como integrar com Perfect Pay', 'dQw4w9WgXcQ', 'perfectpay', 'tutorial-perfectpay');