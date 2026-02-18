import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION-HISTORY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      logStep("No authorization header");
      return new Response(JSON.stringify({ 
        error: "Unauthorized", 
        hasEverSubscribed: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    
    // Criar cliente Supabase com o header de auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    logStep("Validating token with getUser");
    
    // Use getUser for JWT validation
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData?.user) {
      logStep("Token validation failed", { error: userError?.message });
      return new Response(JSON.stringify({ 
        error: "Invalid token", 
        hasEverSubscribed: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const userId = userData.user.id;
    const userEmail = userData.user.email;
    
    if (!userEmail) {
      logStep("Email not found in user data");
      return new Response(JSON.stringify({ 
        error: "Email not available", 
        hasEverSubscribed: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    logStep("User authenticated", { userId, email: userEmail });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, user never subscribed");
      return new Response(JSON.stringify({ hasEverSubscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Verificar histórico completo de assinaturas (ativas e canceladas)
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 100, // Buscar todas as assinaturas do cliente
    });
    
    const hasEverSubscribed = subscriptions.data.length > 0;
    logStep("Subscription history checked", { 
      hasEverSubscribed, 
      totalSubscriptions: subscriptions.data.length,
      statuses: subscriptions.data.map((sub: any) => sub.status)
    });

    return new Response(JSON.stringify({
      hasEverSubscribed
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription-history", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: errorMessage,
      hasEverSubscribed: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
