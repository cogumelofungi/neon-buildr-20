-- Corrigir política RLS conflitante na tabela profiles
-- Remove política problemática que pode permitir acesso indevido
DROP POLICY IF EXISTS "No anonymous access to profiles" ON public.profiles;

-- Garantir que anonymous users não têm acesso (RESTRICTIVE policy)
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);