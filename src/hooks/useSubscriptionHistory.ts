import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionHistory {
  hasEverSubscribed: boolean;
  isLoading: boolean;
}

export const useSubscriptionHistory = (): SubscriptionHistory => {
  const [hasEverSubscribed, setHasEverSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSubscriptionHistory = async () => {
      try {
        // First get the session to ensure we have a valid token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user || !session?.access_token) {
          if (mounted) {
            setHasEverSubscribed(false);
            setIsLoading(false);
          }
          return;
        }

        // Wait a bit for the session to be fully established
        await new Promise(resolve => setTimeout(resolve, 100));

        // Call the edge function - the supabase client will pass the token automatically
        const { data, error } = await supabase.functions.invoke('check-subscription-history');
        
        if (mounted) {
          if (error) {
            // Only log non-auth errors (auth errors are expected when session is refreshing)
            if (!error.message?.includes('401') && !error.message?.includes('Invalid token')) {
              console.error('Erro ao verificar histórico de assinatura:', error);
            }
            setHasEverSubscribed(false);
          } else {
            setHasEverSubscribed(data?.hasEverSubscribed || false);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar histórico de assinatura:', error);
        if (mounted) {
          setHasEverSubscribed(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkSubscriptionHistory();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkSubscriptionHistory();
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setHasEverSubscribed(false);
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    hasEverSubscribed,
    isLoading
  };
};
