import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionType {
  isStripeCustomer: boolean;
  isManualCustomer: boolean;
  stripeSubscriptionId: string | null;
  paymentMethod: 'stripe' | 'manual' | 'pix' | null;
  isLoading: boolean;
}

export const useSubscriptionType = () => {
  const { user } = useAuthContext();
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>({
    isStripeCustomer: false,
    isManualCustomer: false,
    stripeSubscriptionId: null,
    paymentMethod: null,
    isLoading: true
  });

  useEffect(() => {
    if (!user) {
      setSubscriptionType({
        isStripeCustomer: false,
        isManualCustomer: false,
        stripeSubscriptionId: null,
        paymentMethod: null,
        isLoading: false
      });
      return;
    }
    
    const fetchSubscriptionType = async () => {
      try {
        const { data, error } = await supabase
          .from('user_status')
          .select('stripe_subscription_id, stripe_customer_id, plan_id, payment_method, bypass_stripe_check')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        const typedData = data as any;
        // Priorizar stripe_customer_id como indicador de cliente Stripe
        const hasStripeCustomer = !!typedData?.stripe_customer_id;
        const hasBypass = typedData?.bypass_stripe_check === true;
        
        // Cliente Stripe: tem stripe_customer_id E não tem bypass explícito
        const isStripe = hasStripeCustomer && !hasBypass;
        
        // Cliente Manual: tem plano E (não tem stripe_customer_id OU tem bypass explícito)
        const isManual = !!(typedData?.plan_id && (!hasStripeCustomer || hasBypass));
        
        setSubscriptionType({
          isStripeCustomer: isStripe,
          isManualCustomer: isManual,
          stripeSubscriptionId: typedData?.stripe_subscription_id || null,
          paymentMethod: typedData?.payment_method || null,
          isLoading: false
        });
      } catch (error) {
        console.error('Erro ao buscar tipo de assinatura:', error);
        setSubscriptionType(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    fetchSubscriptionType();
  }, [user]);

  return subscriptionType;
};
