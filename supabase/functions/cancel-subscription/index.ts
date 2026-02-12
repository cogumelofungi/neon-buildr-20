import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@18.5.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  logStep('Function started');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!supabaseUrl || !serviceRoleKey || !stripeKey) {
      logStep('Missing environment variables', { supabaseUrl: !!supabaseUrl, serviceRoleKey: !!serviceRoleKey, stripeKey: !!stripeKey });
      throw new Error('Server configuration error - missing environment variables');
    }
    logStep('Environment variables verified');

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get and validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logStep('No authorization header or invalid format');
      throw new Error('Unauthorized - No valid authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    logStep('Validating user token...');

    // Validate the user token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      logStep('Token validation failed', { error: userError?.message });
      throw new Error('Unauthorized - Invalid or expired token');
    }

    logStep('User authenticated', { userId: user.id, email: user.email });

    // Initialize Stripe with latest API version
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Find Stripe customer by email (most reliable method)
    logStep('Looking up Stripe customer by email...');
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    if (customers.data.length === 0) {
      logStep('No Stripe customer found', { email: user.email });
      throw new Error('Nenhuma assinatura encontrada para este usuário');
    }
    
    const customer = customers.data[0];
    const customerId = customer.id;
    logStep('Found Stripe customer', { customerId });

    // Get active AND trialing subscriptions (both are valid active subscriptions)
    const activeSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 10,
    });

    const trialingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'trialing',
      limit: 10,
    });

    // Combine both lists
    const allSubscriptions = [...activeSubscriptions.data, ...trialingSubscriptions.data];

    if (allSubscriptions.length === 0) {
      logStep('No active or trialing subscriptions found');
      throw new Error('Nenhuma assinatura ativa encontrada para cancelar');
    }

    logStep(`Found ${allSubscriptions.length} subscription(s) to cancel`);

    // Cancel all subscriptions at period end
    const cancelledSubscriptions = [];
    for (const subscription of allSubscriptions) {
      logStep(`Cancelling subscription: ${subscription.id}`, { status: subscription.status });
      
      const cancelledSub = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true
      });
      
      const periodEnd = cancelledSub.current_period_end 
        ? new Date(cancelledSub.current_period_end * 1000).toISOString()
        : null;
      
      cancelledSubscriptions.push({
        id: cancelledSub.id,
        cancel_at_period_end: cancelledSub.cancel_at_period_end,
        current_period_end: periodEnd
      });
      
      logStep(`Subscription ${subscription.id} scheduled for cancellation`, {
        cancel_at_period_end: cancelledSub.cancel_at_period_end,
        period_end: periodEnd
      });
    }

    logStep('All subscriptions cancelled successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Assinatura cancelada com sucesso. Você manterá acesso até o final do período pago.',
        cancelled_subscriptions: cancelledSubscriptions
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
