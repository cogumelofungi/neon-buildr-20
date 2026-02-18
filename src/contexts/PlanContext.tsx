import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
interface PlanRefreshResult {
  hasPlan: boolean;
  hasActivePlan: boolean;
  planName: string | null;
}

interface UserPlanContextValue {
  hasPlan: boolean;
  hasActivePlan: boolean;
  planName: string | null;
  isLoading: boolean;
  refresh: (explicitUserId?: string) => Promise<PlanRefreshResult>;
}

const PlanContext = createContext<UserPlanContextValue>({
  hasPlan: false,
  hasActivePlan: false,
  planName: null,
  isLoading: true,
  refresh: async (_explicitUserId?: string) => ({ hasPlan: false, hasActivePlan: false, planName: null }),
});

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const [hasPlan, setHasPlan] = useState(false);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Evita flicker de loading quando o Supabase renova token (user ref muda, id igual)
  const lastUserIdRef = useRef<string | null>(null);
  const hasLoadedForUserRef = useRef(false);

  const fetchUserPlan = useCallback(async (explicitUserId?: string): Promise<PlanRefreshResult> => {
    const defaultResult: PlanRefreshResult = { hasPlan: false, hasActivePlan: false, planName: null };
    const effectiveUserId = explicitUserId || user?.id;
    
    if (!effectiveUserId) {
      setHasPlan(false);
      setHasActivePlan(false);
      setPlanName(null);
      setIsLoading(false);

      lastUserIdRef.current = null;
      hasLoadedForUserRef.current = false;
      return defaultResult;
    }

    const isUserChanged = lastUserIdRef.current !== effectiveUserId;
    // Se explicitUserId foi passado, tratamos como refresh “explícito” e mostramos loading.
    const shouldShowLoading = !!explicitUserId || isUserChanged || !hasLoadedForUserRef.current;

    if (isUserChanged) {
      lastUserIdRef.current = effectiveUserId;
      hasLoadedForUserRef.current = false;
    }

    // Só mostramos loading no carregamento inicial; refresh de rotina roda em background.
    if (shouldShowLoading) {
      setIsLoading(true);
    }
    try {
      const { data: rawData, error } = await supabase
        .from('user_status')
        .select(`
          plan_id,
          bypass_stripe_check,
          stripe_customer_id,
          stripe_subscription_id,
          plans (
            name,
            price
          )
        `)
        .eq('user_id', effectiveUserId)
        .maybeSingle();

      let data = rawData;

      console.log('🔍 [PlanContext] Raw data from user_status:', JSON.stringify(data, null, 2));

      // Se existe assinatura Stripe mas plan_id veio vazio (ex.: bug anterior que zerava no trialing),
      // tenta revalidar no Stripe 1x para restaurar o plano.
      if (!data?.plan_id && data?.stripe_subscription_id && data?.bypass_stripe_check !== true) {
        try {
          console.log('⚠️ [PlanContext] Plano vazio mas Stripe subscription presente. Revalidando no Stripe...');
          await supabase.functions.invoke('check-subscription');

          const { data: refreshedData } = await supabase
            .from('user_status')
            .select(`
              plan_id,
              bypass_stripe_check,
              stripe_customer_id,
              stripe_subscription_id,
              plans (
                name,
                price
              )
            `)
            .eq('user_id', effectiveUserId)
            .maybeSingle();

          data = refreshedData ?? data;
          console.log('🔄 [PlanContext] Data after Stripe revalidation:', JSON.stringify(data, null, 2));
        } catch (revalidateError) {
          console.warn('⚠️ [PlanContext] Falha ao revalidar Stripe:', revalidateError);
        }
      }

      console.log('🔍 [PlanContext] Raw data from user_status:', JSON.stringify(data, null, 2));
      
      if (error) {
        console.error('❌ [PlanContext] Erro ao buscar plano:', error);
        setHasPlan(false);
        setHasActivePlan(false);
        setPlanName(null);
        return defaultResult;
      } else {
        // Se tem plan_id, tem plano (mesmo que plans seja null)
        const hasValidPlan = !!data?.plan_id;
        const currentPlanName = data?.plans?.name || null;
        
        // Buscar nome do plano diretamente se plans for null
        let finalPlanName = currentPlanName;
        if (!finalPlanName && data?.plan_id) {
          console.log('⚠️ [PlanContext] Relação plans null, buscando nome do plano...');
          // Buscar diretamente da tabela plans
          const { data: planData } = await supabase
            .from('plans')
            .select('name')
            .eq('id', data.plan_id)
            .single();
          finalPlanName = planData?.name || null;
          console.log('📌 [PlanContext] Nome do plano encontrado:', finalPlanName);
        }
        
        const isActive = hasValidPlan && finalPlanName !== 'Gratuito';
      
        console.log('✅ [PlanContext] Setting plan state:', {
          hasValidPlan,
          planName: finalPlanName,
          isActivePlan: isActive,
          plan_id: data?.plan_id,
          bypass_stripe_check: data?.bypass_stripe_check
        });
      
        setHasPlan(hasValidPlan);
        setHasActivePlan(isActive);
        setPlanName(finalPlanName);
        
        return { hasPlan: hasValidPlan, hasActivePlan: isActive, planName: finalPlanName };
      }
    } catch (err) {
      console.error('Erro ao buscar plano do usuário (context):', err);
      setHasPlan(false);
      setHasActivePlan(false);
      setPlanName(null);
      return defaultResult;
    } finally {
      hasLoadedForUserRef.current = true;
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    // Always refresh when user id changes
    fetchUserPlan();
  }, [fetchUserPlan]);

  const value: UserPlanContextValue = {
    hasPlan,
    hasActivePlan,
    planName,
    isLoading,
    refresh: fetchUserPlan,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};

export const usePlanContext = () => useContext(PlanContext);
