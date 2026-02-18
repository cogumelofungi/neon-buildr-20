-- Add section column to tutorial_videos for grouping in /academy
ALTER TABLE public.tutorial_videos 
ADD COLUMN section text;

-- Add index for section queries
CREATE INDEX idx_tutorial_videos_section ON public.tutorial_videos(section);

-- Update existing integration videos to have a default section
UPDATE public.tutorial_videos 
SET section = 'Integrações com Plataformas'
WHERE category IN ('hotmart', 'kiwify', 'eduzz', 'monetizze', 'braip', 'perfectpay', 'ticto', 'cartpanda', 'stripe', 'cakto');