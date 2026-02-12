import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-STRIPE-SUBSCRIPTION-STATUS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    // Verificar se é admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user?.id)
      .eq('role', 'admin')
      .single();
    
    if (!roleData) throw new Error("Unauthorized: Admin access required");
    logStep("Admin verified");

    const { subscription_ids } = await req.json();
    if (!subscription_ids || !Array.isArray(subscription_ids)) {
      throw new Error("subscription_ids array is required");
    }
    logStep("Subscription IDs received", { count: subscription_ids.length });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const results: Record<string, { status: string; cancel_at_period_end: boolean; current_period_end: number | null }> = {};
    
    // Buscar status de cada assinatura diretamente da Stripe
    for (const subId of subscription_ids) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subId);
        results[subId] = {
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: subscription.current_period_end
        };
        logStep("Subscription fetched", { subId, status: subscription.status });
      } catch (err) {
        logStep("Error fetching subscription", { subId, error: err instanceof Error ? err.message : String(err) });
        results[subId] = {
          status: 'unknown',
          cancel_at_period_end: false,
          current_period_end: null
        };
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
