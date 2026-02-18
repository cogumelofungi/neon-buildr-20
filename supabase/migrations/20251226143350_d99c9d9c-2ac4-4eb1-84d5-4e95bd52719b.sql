-- Add unique constraint on email column for ON CONFLICT to work
ALTER TABLE public.pending_users ADD CONSTRAINT pending_users_email_key UNIQUE (email);