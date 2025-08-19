import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserPlan {
  hasPlan: boolean;
  planName: string | null;
  isLoading: boolean;
}

export const useUserPlan = (): UserPlan => {
  const { user } = useAuth();
  const [hasPlan, setHasPlan] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPlan();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserPlan = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_status')
        .select(`
          plan_id,
          plans (
            name
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar plano do usuário:', error);
        setHasPlan(false);
        setPlanName(null);
      } else {
        const hasValidPlan = data?.plan_id !== null;
        setHasPlan(hasValidPlan);
        setPlanName(hasValidPlan ? data.plans?.name || null : null);
      }
    } catch (error) {
      console.error('Erro ao buscar plano do usuário:', error);
      setHasPlan(false);
      setPlanName(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasPlan,
    planName,
    isLoading
  };
};