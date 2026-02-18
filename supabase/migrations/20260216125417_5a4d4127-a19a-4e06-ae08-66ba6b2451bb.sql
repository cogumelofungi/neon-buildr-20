
-- RPC para buscar detalhes públicos de um order bump específico (sem campos sensíveis de API)
CREATE OR REPLACE FUNCTION public.get_public_order_bump_details(p_order_bump_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', ob.id,
    'app_id', ob.app_id,
    'label', ob.label,
    'description', ob.description,
    'content_url', ob.content_url,
    'content_type', ob.content_type,
    'product_id', ob.product_id,
    'provider', ob.provider,
    'display_order', ob.display_order,
    'is_active', ob.is_active,
    'app_link', ob.app_link,
    'nome', ob.nome,
    'cor', ob.cor,
    'icone_url', ob.icone_url,
    'capa_url', ob.capa_url,
    'template', ob.template,
    'app_theme', ob.app_theme,
    'theme_config', ob.theme_config,
    'allow_pdf_download', ob.allow_pdf_download,
    'view_button_label', ob.view_button_label,
    'produto_principal_url', ob.produto_principal_url,
    'bonus1_url', ob.bonus1_url,
    'bonus1_label', ob.bonus1_label,
    'bonus1_thumbnail', ob.bonus1_thumbnail,
    'bonus2_url', ob.bonus2_url,
    'bonus2_label', ob.bonus2_label,
    'bonus2_thumbnail', ob.bonus2_thumbnail,
    'bonus3_url', ob.bonus3_url,
    'bonus3_label', ob.bonus3_label,
    'bonus3_thumbnail', ob.bonus3_thumbnail,
    'bonus4_url', ob.bonus4_url,
    'bonus4_label', ob.bonus4_label,
    'bonus4_thumbnail', ob.bonus4_thumbnail,
    'bonus5_url', ob.bonus5_url,
    'bonus5_label', ob.bonus5_label,
    'bonus5_thumbnail', ob.bonus5_thumbnail,
    'bonus6_url', ob.bonus6_url,
    'bonus6_label', ob.bonus6_label,
    'bonus6_thumbnail', ob.bonus6_thumbnail,
    'bonus7_url', ob.bonus7_url,
    'bonus7_label', ob.bonus7_label,
    'bonus7_thumbnail', ob.bonus7_thumbnail,
    'bonus8_url', ob.bonus8_url,
    'bonus8_label', ob.bonus8_label,
    'bonus8_thumbnail', ob.bonus8_thumbnail,
    'bonus9_url', ob.bonus9_url,
    'bonus9_label', ob.bonus9_label,
    'bonus9_thumbnail', ob.bonus9_thumbnail,
    'main_product_label', ob.main_product_label,
    'main_product_description', ob.main_product_description,
    'main_product_thumbnail', ob.main_product_thumbnail,
    'bonuses_label', ob.bonuses_label,
    'premium_card_title', ob.premium_card_title,
    'premium_card_description', ob.premium_card_description,
    'premium_image_url', ob.premium_image_url,
    'bullet1', ob.bullet1,
    'bullet2', ob.bullet2,
    'bullet3', ob.bullet3,
    'unlock_button_color', ob.unlock_button_color,
    'affiliate_mode', ob.affiliate_mode,
    'purchase_link', ob.purchase_link,
    'default_language', ob.default_language,
    'created_at', ob.created_at,
    'updated_at', ob.updated_at
  ) INTO result
  FROM order_bumps ob
  INNER JOIN apps a ON ob.app_id = a.id
  WHERE ob.id = p_order_bump_id
    AND ob.is_active = true
    AND a.status = 'publicado';

  RETURN result;
END;
$$;
