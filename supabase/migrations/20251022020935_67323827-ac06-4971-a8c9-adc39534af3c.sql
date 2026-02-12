-- Remove the unused user_integrations_secure view
-- This view has no RLS policies and is not used in the application
-- The app uses user_integrations table directly with proper RLS and SECURITY DEFINER functions

DROP VIEW IF EXISTS public.user_integrations_secure;