
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@18.5.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REACTIVATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  logStep('Function started');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!supabaseUrl || !serviceRoleKey || !stripeKey) {
      logStep('Missing environment variables');
      throw new Error('Server configuration error - missing environment variables');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized - No valid authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized - Invalid or expired token');
    }

    logStep('User authenticated', { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Find Stripe customer by email
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    if (customers.data.length === 0) {
      throw new Error('Nenhuma assinatura encontrada para este usuário');
    }
    
    const customerId = customers.data[0].id;
    logStep('Found Stripe customer', { customerId });

    // Get subscriptions that are scheduled to cancel
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });

    const subscriptionsToReactivate = subscriptions.data.filter(
      (sub: { status: string; cancel_at_period_end: boolean }) => (sub.status === 'active' || sub.status === 'trialing') && sub.cancel_at_period_end
    );

    if (subscriptionsToReactivate.length === 0) {
      throw new Error('Nenhuma assinatura pendente de cancelamento encontrada');
    }

    logStep(`Found ${subscriptionsToReactivate.length} subscription(s) to reactivate`);

    // Reactivate by removing cancel_at_period_end
    const reactivatedSubscriptions = [];
    for (const subscription of subscriptionsToReactivate) {
      logStep(`Reactivating subscription: ${subscription.id}`);
      
      const reactivatedSub = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: false
      });
      
      reactivatedSubscriptions.push({
        id: reactivatedSub.id,
        status: reactivatedSub.status,
        cancel_at_period_end: reactivatedSub.cancel_at_period_end
      });
      
      logStep(`Subscription ${subscription.id} reactivated successfully`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Assinatura reativada com sucesso!',
        reactivated_subscriptions: reactivatedSubscriptions
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logStep('ERROR', { message: errorMessage });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
})
