-- Enable RLS on email_confirmation_tokens table
-- This table was exposed without any RLS policies, allowing public access to sensitive email verification tokens
ALTER TABLE public.email_confirmation_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can manage email confirmation tokens
-- This prevents public access to sensitive email and token data
-- Edge functions use service_role key so they will continue to work
CREATE POLICY "Service role can manage email confirmation tokens"
ON public.email_confirmation_tokens
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);