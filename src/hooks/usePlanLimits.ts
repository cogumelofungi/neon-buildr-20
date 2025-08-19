import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlanLimits {
  maxProducts: number;
  planName: string;
  isLoading: boolean;
}

export const usePlanLimits = (): PlanLimits => {
  const [limits, setLimits] = useState<PlanLimits>({
    maxProducts: 8, // Default to Empresarial
    planName: 'Empresarial',
    isLoading: true
  });

  useEffect(() => {
    fetchPlanLimits();
  }, []);

  const fetchPlanLimits = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setLimits(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const { data: userStatus, error } = await supabase
        .from('user_status')
        .select(`
          plans (
            name,
            app_limit
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar plano do usuário:', error);
      }

      const planName = userStatus?.plans?.name || 'Empresarial';
      
      // Determine product limits based on plan
      let maxProducts = 8; // Default to Empresarial
      switch (planName) {
        case 'Essencial':
          maxProducts = 3; // Principal + Bônus 1 e 2
          break;
        case 'Profissional':
          maxProducts = 5; // Principal + Bônus 1 a 4
          break;
        case 'Empresarial':
          maxProducts = 8; // Principal + Bônus 1 a 7
          break;
        default:
          maxProducts = 8;
          break;
      }

      setLimits({
        maxProducts,
        planName,
        isLoading: false
      });

    } catch (error) {
      console.error('Erro ao buscar limites do plano:', error);
      setLimits(prev => ({ ...prev, isLoading: false }));
    }
  };

  return limits;
};