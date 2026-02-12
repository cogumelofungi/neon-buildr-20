
-- =============================================
-- FIX 1: Proteger tabela pending_users
-- Criar função SECURITY DEFINER que retorna apenas campos necessários
-- =============================================

CREATE OR REPLACE FUNCTION public.get_pending_user_by_token(p_token text)
RETURNS TABLE(email text, plan_name text, expires_at timestamptz, used_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pu.email,
    pu.plan_name,
    pu.expires_at,
    pu.used_at
  FROM pending_users pu
  WHERE pu.token = p_token
  LIMIT 1;
END;
$$;

-- Remover a política permissiva que expõe TODOS os dados
DROP POLICY IF EXISTS "Anyone can read by token" ON public.pending_users;

-- =============================================
-- FIX 2: Revogar acesso à coluna api_token para role anon
-- Isso impede que usuários não autenticados vejam api_token
-- =============================================

-- Revogar SELECT total da role anon na tabela apps
REVOKE SELECT ON public.apps FROM anon;

-- Conceder SELECT apenas nas colunas seguras (excluindo api_token)
GRANT SELECT (
  id, nome, descricao, cor, slug, status, user_id, created_at, updated_at, views, downloads,
  icone_url, capa_url, produto_principal_url, link_personalizado,
  template, app_theme, theme_config, allow_pdf_download,
  main_product_label, main_product_description, view_button_label, bonuses_label,
  require_login, video_course_enabled, video_modules,
  notification_enabled, notification_title, notification_text, notification_message,
  notification_icon, notification_image, notification_link, notification_button_color,
  whatsapp_enabled, whatsapp_phone, whatsapp_message, whatsapp_button_text,
  whatsapp_button_color, whatsapp_position, whatsapp_icon_size, whatsapp_show_text,
  bonus1_url, bonus1_label, bonus2_url, bonus2_label, bonus3_url, bonus3_label,
  bonus4_url, bonus4_label, bonus5_url, bonus5_label, bonus6_url, bonus6_label,
  bonus7_url, bonus7_label, bonus8_url, bonus8_label, bonus9_url, bonus9_label,
  bonus10_url, bonus10_label, bonus11_url, bonus11_label, bonus12_url, bonus12_label,
  bonus13_url, bonus13_label, bonus14_url, bonus14_label, bonus15_url, bonus15_label,
  bonus16_url, bonus16_label, bonus17_url, bonus17_label, bonus18_url, bonus18_label,
  bonus19_url, bonus19_label
) ON public.apps TO anon;
