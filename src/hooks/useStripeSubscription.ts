import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

// Map Stripe product IDs to plan names
const PRODUCT_TO_PLAN_MAP: Record<string, string> = {
  // Produtos mensais
  prod_TEctgrdydKRczO: "Essencial",
  prod_TEcuHzJm2kwhJj: "Profissional",
  prod_TEcuMMmfjfg9AK: "Empresarial",
  // Produtos anuais
  prod_T5Og881LqMVtsi: "Essencial",
  prod_T5OhcLItHWJR7r: "Profissional",
  prod_T5OhFwLIPzYWLN: "Empresarial",
};

interface SubscriptionStatus {
  subscribed: boolean;
  planName: string;
  subscription_end: string | null;
  cancel_at_period_end: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useStripeSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    planName: "Gratuito",
    subscription_end: null,
    cancel_at_period_end: false,
    isLoading: true,
    error: null,
  });
  const { user } = useAuthContext();

  const checkSubscription = async () => {
    if (!user) {
      setStatus((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    // ✅ Verificar sessão antes de chamar a função
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.access_token) {
      console.warn("[useStripeSubscription] Sessão não encontrada");
      setStatus((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    // ✅ Verificar se é plano manual antes de chamar check-subscription
    const { data: userStatus } = await supabase
      .from("user_status")
      .select("bypass_stripe_check")
      .eq("user_id", user.id)
      .maybeSingle();

    if (userStatus?.bypass_stripe_check === true) {
      console.log("⚠️ [useStripeSubscription] Plano manual detectado, não verificando Stripe");
      setStatus({
        subscribed: false,
        planName: "Plano Manual",
        subscription_end: null,
        cancel_at_period_end: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      setStatus((prev) => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      const planName = data.product_id ? PRODUCT_TO_PLAN_MAP[data.product_id] || "Gratuito" : "Gratuito";

      setStatus({
        subscribed: data.subscribed || false,
        planName,
        subscription_end: data.subscription_end || null,
        cancel_at_period_end: data.cancel_at_period_end || false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  };

  const openCustomerPortal = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
    }
  };

  const reactivateSubscription = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session?.access_token) {
        return { success: false, error: "Sessão expirada" };
      }

      const { data, error } = await supabase.functions.invoke("reactivate-subscription", {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || "Erro ao reativar assinatura" };
      }

      // Refresh subscription status
      await checkSubscription();
      
      return { success: true };
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  // Auto-refresh subscription status every minute (só para usuários Stripe)
  useEffect(() => {
    if (!user) return;

    const checkIfManual = async () => {
      const { data } = await supabase
        .from("user_status")
        .select("bypass_stripe_check")
        .eq("user_id", user.id)
        .maybeSingle();

      // Só configura auto-refresh se NÃO for plano manual
      if (data?.bypass_stripe_check !== true) {
        const interval = setInterval(checkSubscription, 60000);
        return () => clearInterval(interval);
      }
    };

    checkIfManual();
  }, [user]);

  return {
    ...status,
    refresh: checkSubscription,
    openCustomerPortal,
    reactivateSubscription,
  };
};
