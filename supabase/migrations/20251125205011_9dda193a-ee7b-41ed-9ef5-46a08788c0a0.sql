-- Add video course fields to apps table
ALTER TABLE apps 
ADD COLUMN IF NOT EXISTS video_course_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS video_modules jsonb DEFAULT '[]'::jsonb;