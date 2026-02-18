-- Add advanced settings to social_proof_settings
ALTER TABLE public.social_proof_settings
ADD COLUMN IF NOT EXISTS min_interval_seconds integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS max_interval_seconds integer DEFAULT 15,
ADD COLUMN IF NOT EXISTS min_display_seconds integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS max_display_seconds integer DEFAULT 6,
ADD COLUMN IF NOT EXISTS randomize_order boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_time_ago boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_verified_badge boolean DEFAULT true;

-- Update existing row with sensible defaults
UPDATE public.social_proof_settings SET
  min_interval_seconds = COALESCE(interval_seconds, 5),
  max_interval_seconds = COALESCE(interval_seconds + 10, 15),
  min_display_seconds = COALESCE(display_duration_seconds - 1, 3),
  max_display_seconds = COALESCE(display_duration_seconds + 2, 6);

-- Remove location column from notifications as it's not needed
ALTER TABLE public.social_proof_notifications
DROP COLUMN IF EXISTS location;

-- Add action_type column for pre-defined actions
ALTER TABLE public.social_proof_notifications
ADD COLUMN IF NOT EXISTS action_type text DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS plan_name text;