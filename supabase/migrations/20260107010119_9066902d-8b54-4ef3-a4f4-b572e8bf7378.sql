-- Atualizar função para permitir admin_user_id como null (para atualizações automáticas do sistema)
CREATE OR REPLACE FUNCTION public.handle_user_deactivation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_admin_id uuid;
BEGIN
  -- Tentar obter o ID do admin atual (pode ser null para operações do sistema)
  current_admin_id := auth.uid();
  
  -- Se o usuário foi desativado (is_active = false)
  IF OLD.is_active = true AND NEW.is_active = false THEN
    -- Apenas log da ação, sem despublicar os apps
    INSERT INTO public.admin_audit_log (admin_user_id, target_user_id, action, details)
    VALUES (
      COALESCE(current_admin_id, '00000000-0000-0000-0000-000000000000'::uuid), -- UUID zero para sistema
      NEW.user_id, 
      'user_deactivated',
      jsonb_build_object(
        'reason', CASE WHEN current_admin_id IS NULL THEN 'system_automatic' ELSE 'account_deactivated' END,
        'timestamp', now(),
        'triggered_by', CASE WHEN current_admin_id IS NULL THEN 'webhook_stripe' ELSE 'admin' END
      )
    );
  END IF;
  
  -- Se o usuário foi reativado (is_active = true)
  IF OLD.is_active = false AND NEW.is_active = true THEN
    -- Log da reativação
    INSERT INTO public.admin_audit_log (admin_user_id, target_user_id, action, details)
    VALUES (
      COALESCE(current_admin_id, '00000000-0000-0000-0000-000000000000'::uuid),
      NEW.user_id, 
      'user_reactivated',
      jsonb_build_object(
        'reason', CASE WHEN current_admin_id IS NULL THEN 'system_automatic' ELSE 'account_reactivated' END, 
        'timestamp', now(),
        'triggered_by', CASE WHEN current_admin_id IS NULL THEN 'webhook_stripe' ELSE 'admin' END
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;