import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface OrderBump {
  id: string;
  app_id: string;
  product_id: string;
  provider: string;
  label: string;
  description?: string;
  content_url: string;
  content_type: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  app_link?: string;
  // Campos de integração (para funcionar independentemente)
  api_token?: string;
  webhook_token?: string;
  client_id?: string;
  client_secret?: string;
  basic_token?: string;
  hottok?: string;
  postback_key?: string;
  stripe_api_key?: string;
  account_id?: string;
  store_slug?: string;
  yampi_secret_key?: string;
  default_language?: string;
  purchase_link?: string;
  // Premium card fields
  premium_card_title?: string;
  premium_card_description?: string;
  premium_image_url?: string;
  bullet1?: string;
  bullet2?: string;
  bullet3?: string;
  unlock_button_color?: string;
  affiliate_mode?: boolean;
  // Campos visuais
  nome?: string;
  cor?: string;
  icone_url?: string;
  capa_url?: string;
  template?: string;
  app_theme?: string;
  theme_config?: any;
  allow_pdf_download?: boolean;
  view_button_label?: string;
  // Uploads
  produto_principal_url?: string;
  bonus1_url?: string;
  bonus2_url?: string;
  bonus3_url?: string;
  bonus4_url?: string;
  bonus5_url?: string;
  bonus6_url?: string;
  bonus7_url?: string;
  bonus8_url?: string;
  bonus9_url?: string;
  // Thumbnails
  main_product_thumbnail?: string;
  bonus1_thumbnail?: string;
  bonus2_thumbnail?: string;
  bonus3_thumbnail?: string;
  bonus4_thumbnail?: string;
  bonus5_thumbnail?: string;
  bonus6_thumbnail?: string;
  bonus7_thumbnail?: string;
  bonus8_thumbnail?: string;
  bonus9_thumbnail?: string;
  // Rótulos
  main_product_label?: string;
  main_product_description?: string;
  bonuses_label?: string;
  bonus1_label?: string;
  bonus2_label?: string;
  bonus3_label?: string;
  bonus4_label?: string;
  bonus5_label?: string;
  bonus6_label?: string;
  bonus7_label?: string;
  bonus8_label?: string;
  bonus9_label?: string;
  // Video Course
  video_course_enabled?: boolean;
  video_modules?: any;
}

export interface OrderBumpFormData {
  product_id: string;
  provider: string;
  label: string;
  description?: string;
  content_url: string;
  content_type: string;
  app_link?: string;
  // Campos de integração
  api_token?: string;
  webhook_token?: string;
  client_id?: string;
  client_secret?: string;
  basic_token?: string;
  hottok?: string;
  postback_key?: string;
  stripe_api_key?: string;
  account_id?: string;
  store_slug?: string;
  yampi_secret_key?: string;
  default_language?: string;
  purchase_link?: string;
  // Premium card fields
  premium_card_title?: string;
  premium_card_description?: string;
  premium_image_url?: string;
  bullet1?: string;
  bullet2?: string;
  bullet3?: string;
  unlock_button_color?: string;
  affiliate_mode?: boolean;
  // Campos visuais
  nome?: string;
  cor?: string;
  icone_url?: string;
  capa_url?: string;
  template?: string;
  app_theme?: string;
  theme_config?: any;
  allow_pdf_download?: boolean;
  view_button_label?: string;
  // Uploads
  produto_principal_url?: string;
  bonus1_url?: string;
  bonus2_url?: string;
  bonus3_url?: string;
  bonus4_url?: string;
  bonus5_url?: string;
  bonus6_url?: string;
  bonus7_url?: string;
  bonus8_url?: string;
  bonus9_url?: string;
  // Thumbnails
  main_product_thumbnail?: string;
  bonus1_thumbnail?: string;
  bonus2_thumbnail?: string;
  bonus3_thumbnail?: string;
  bonus4_thumbnail?: string;
  bonus5_thumbnail?: string;
  bonus6_thumbnail?: string;
  bonus7_thumbnail?: string;
  bonus8_thumbnail?: string;
  bonus9_thumbnail?: string;
  // Rótulos
  main_product_label?: string;
  main_product_description?: string;
  bonuses_label?: string;
  bonus1_label?: string;
  bonus2_label?: string;
  bonus3_label?: string;
  bonus4_label?: string;
  bonus5_label?: string;
  bonus6_label?: string;
  bonus7_label?: string;
  bonus8_label?: string;
  bonus9_label?: string;
  // Video Course
  video_course_enabled?: boolean;
  video_modules?: any;
}

const MAX_ORDER_BUMPS = 5;

export function useOrderBumps(appId: string | undefined) {
  const { toast } = useToast();
  const [orderBumps, setOrderBumps] = useState<OrderBump[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOrderBumps = async () => {
    if (!appId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("order_bumps")
        .select("*")
        .eq("app_id", appId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setOrderBumps((data as OrderBump[]) || []);
    } catch (error: any) {
      console.error("Erro ao carregar order bumps:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os order bumps.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderBumps();
  }, [appId]);

  const createOrderBump = async (data: OrderBumpFormData) => {
    if (!appId) return null;

    if (orderBumps.length >= MAX_ORDER_BUMPS) {
      toast({
        title: "Limite atingido",
        description: `Você pode ter no máximo ${MAX_ORDER_BUMPS} order bumps por app.`,
        variant: "destructive",
      });
      return null;
    }

    try {
      setLoading(true);
      const newOrderBump = {
        app_id: appId,
        product_id: data.product_id,
        provider: data.provider,
        label: data.label,
        description: data.description || null,
        content_url: data.content_url || data.produto_principal_url || "",
        content_type: data.content_type,
        display_order: orderBumps.length,
        is_active: true,
        app_link: data.app_link || null,
        // Campos de integração (para funcionar independentemente)
        api_token: data.api_token || null,
        webhook_token: data.webhook_token || null,
        client_id: data.client_id || null,
        client_secret: data.client_secret || null,
        basic_token: data.basic_token || null,
        hottok: data.hottok || null,
        postback_key: data.postback_key || null,
        stripe_api_key: data.stripe_api_key || null,
        account_id: data.account_id || null,
        store_slug: data.store_slug || null,
        yampi_secret_key: data.yampi_secret_key || null,
        default_language: data.default_language || "pt-br",
        // Premium card fields
        premium_card_title: data.premium_card_title || null,
        premium_card_description: data.premium_card_description || null,
        premium_image_url: data.premium_image_url || null,
        bullet1: data.bullet1 || null,
        bullet2: data.bullet2 || null,
        bullet3: data.bullet3 || null,
        unlock_button_color: data.unlock_button_color || '#22c55e',
        affiliate_mode: data.affiliate_mode ?? false,
        // Campos visuais
        nome: data.nome || null,
        cor: data.cor || "#4783F6",
        icone_url: data.icone_url || null,
        capa_url: data.capa_url || null,
        template: data.template || "classic",
        app_theme: data.app_theme || "dark",
        theme_config: data.theme_config || null,
        allow_pdf_download: data.allow_pdf_download ?? true,
        view_button_label: data.view_button_label || null,
        // Uploads
        produto_principal_url: data.produto_principal_url || null,
        bonus1_url: data.bonus1_url || null,
        bonus2_url: data.bonus2_url || null,
        bonus3_url: data.bonus3_url || null,
        bonus4_url: data.bonus4_url || null,
        bonus5_url: data.bonus5_url || null,
        bonus6_url: data.bonus6_url || null,
        bonus7_url: data.bonus7_url || null,
        bonus8_url: data.bonus8_url || null,
        bonus9_url: data.bonus9_url || null,
        // Thumbnails
        main_product_thumbnail: data.main_product_thumbnail || null,
        bonus1_thumbnail: data.bonus1_thumbnail || null,
        bonus2_thumbnail: data.bonus2_thumbnail || null,
        bonus3_thumbnail: data.bonus3_thumbnail || null,
        bonus4_thumbnail: data.bonus4_thumbnail || null,
        bonus5_thumbnail: data.bonus5_thumbnail || null,
        bonus6_thumbnail: data.bonus6_thumbnail || null,
        bonus7_thumbnail: data.bonus7_thumbnail || null,
        bonus8_thumbnail: data.bonus8_thumbnail || null,
        bonus9_thumbnail: data.bonus9_thumbnail || null,
        // Rótulos
        main_product_label: data.main_product_label || "Produto Principal",
        main_product_description: data.main_product_description || null,
        bonuses_label: data.bonuses_label || "Bônus Exclusivos",
        bonus1_label: data.bonus1_label || "Bônus 1",
        bonus2_label: data.bonus2_label || "Bônus 2",
        bonus3_label: data.bonus3_label || "Bônus 3",
        bonus4_label: data.bonus4_label || "Bônus 4",
        bonus5_label: data.bonus5_label || "Bônus 5",
        bonus6_label: data.bonus6_label || "Bônus 6",
        bonus7_label: data.bonus7_label || "Bônus 7",
        bonus8_label: data.bonus8_label || "Bônus 8",
        bonus9_label: data.bonus9_label || "Bônus 9",
      };

      const { data: created, error } = await supabase
        .from("order_bumps")
        .insert(newOrderBump)
        .select()
        .single();

      if (error) throw error;

      setOrderBumps((prev) => [...prev, created as OrderBump]);
      toast({
        title: "Order Bump criado",
        description: "O conteúdo premium foi adicionado com sucesso.",
      });

      return created as OrderBump;
    } catch (error: any) {
      console.error("Erro ao criar order bump:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o order bump.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderBump = async (id: string, data: Partial<OrderBumpFormData>) => {
    try {
      setLoading(true);
      
      // Lista de campos válidos na tabela order_bumps (todos os campos existentes no banco)
      const validFields = [
        'product_id', 'provider', 'label', 'description', 'content_url', 'content_type',
        'app_link', 'nome', 'cor', 'icone_url', 'capa_url', 'template', 'app_theme',
        'theme_config', 'allow_pdf_download', 'view_button_label', 'produto_principal_url',
        'bonus1_url', 'bonus2_url', 'bonus3_url', 'bonus4_url', 'bonus5_url',
        'bonus6_url', 'bonus7_url', 'bonus8_url', 'bonus9_url',
        // Thumbnails
        'main_product_thumbnail', 'bonus1_thumbnail', 'bonus2_thumbnail', 'bonus3_thumbnail',
        'bonus4_thumbnail', 'bonus5_thumbnail', 'bonus6_thumbnail', 'bonus7_thumbnail',
        'bonus8_thumbnail', 'bonus9_thumbnail',
        'main_product_label', 'main_product_description', 'bonuses_label',
        'bonus1_label', 'bonus2_label', 'bonus3_label', 'bonus4_label', 'bonus5_label',
        'bonus6_label', 'bonus7_label', 'bonus8_label', 'bonus9_label', 'is_active', 'display_order',
        // Campos de integração (agora existem no banco)
        'api_token', 'webhook_token', 'client_id', 'client_secret', 'basic_token',
        'hottok', 'postback_key', 'stripe_api_key', 'account_id', 'store_slug',
        'yampi_secret_key', 'default_language', 'purchase_link',
        // Textos do card premium
        'premium_card_title', 'premium_card_description',
        'premium_image_url', 'bullet1', 'bullet2', 'bullet3', 'unlock_button_color',
        // Modo afiliado
        'affiliate_mode',
        // Video Course
        'video_course_enabled', 'video_modules'
      ];
      
      // Filtrar apenas campos válidos
      const updateData: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        if (validFields.includes(key)) {
          updateData[key] = value;
        }
      }
      
      // Se content_url não foi passado mas produto_principal_url foi, usar ele
      if (!updateData.content_url && updateData.produto_principal_url) {
        updateData.content_url = updateData.produto_principal_url;
      }
      
      const { error } = await supabase
        .from("order_bumps")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      setOrderBumps((prev) =>
        prev.map((ob) => (ob.id === id ? { ...ob, ...updateData } : ob))
      );

      toast({
        title: "Order Bump atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar order bump:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o order bump.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteOrderBump = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.from("order_bumps").delete().eq("id", id);

      if (error) throw error;

      setOrderBumps((prev) => prev.filter((ob) => ob.id !== id));
      toast({
        title: "Order Bump removido",
        description: "O conteúdo premium foi removido com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao deletar order bump:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o order bump.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderBump = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("order_bumps")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;

      setOrderBumps((prev) =>
        prev.map((ob) => (ob.id === id ? { ...ob, is_active: isActive } : ob))
      );
    } catch (error: any) {
      console.error("Erro ao alternar order bump:", error);
    }
  };

  const reorderOrderBumps = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const reordered = [...orderBumps];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // Update display_order for all items
    const updated = reordered.map((ob, i) => ({ ...ob, display_order: i }));
    setOrderBumps(updated);

    try {
      // Batch update display_order in the database
      const updates = updated.map((ob) =>
        supabase
          .from("order_bumps")
          .update({ display_order: ob.display_order })
          .eq("id", ob.id)
      );
      await Promise.all(updates);
    } catch (error: any) {
      console.error("Erro ao reordenar order bumps:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a nova ordem.",
        variant: "destructive",
      });
      // Revert on error
      loadOrderBumps();
    }
  };

  return {
    orderBumps,
    loading,
    createOrderBump,
    updateOrderBump,
    deleteOrderBump,
    toggleOrderBump,
    reorderOrderBumps,
    reloadOrderBumps: loadOrderBumps,
    canAddMore: orderBumps.length < MAX_ORDER_BUMPS,
    maxOrderBumps: MAX_ORDER_BUMPS,
  };
}
