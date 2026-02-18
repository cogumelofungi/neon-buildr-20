-- Add pause control columns to social_proof_settings
ALTER TABLE public.social_proof_settings
ADD COLUMN IF NOT EXISTS notifications_before_pause integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pause_duration_seconds integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS enable_pause boolean DEFAULT false;

-- Update existing record with default values
UPDATE public.social_proof_settings
SET 
  notifications_before_pause = COALESCE(notifications_before_pause, 0),
  pause_duration_seconds = COALESCE(pause_duration_seconds, 30),
  enable_pause = COALESCE(enable_pause, false);