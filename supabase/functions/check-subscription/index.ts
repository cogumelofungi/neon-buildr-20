import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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
      return new Response(JSON.stringify({ 
        error: "Unauthorized",
        subscribed: false,
        planName: "Gratuito"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    logStep("Authorization header found");

    // Cliente Supabase para validar JWT (signing keys) via getClaims
    // IMPORTANT: use ANON_KEY (padrão recomendado pela Supabase) e verify_jwt=false no config.toml
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    // Cliente com SERVICE_ROLE para operações de banco
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    logStep("Validating token with getUser");
    
    // Usar getUser para validar o token JWT
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
    
    if (userError || !userData?.user) {
      logStep("Token validation failed", { error: userError?.message });
      return new Response(JSON.stringify({ 
        error: "Invalid token",
        subscribed: false,
        planName: "Gratuito"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    if (!userData.user.id || !userData.user.email) {
      logStep("Missing user info", { userId: userData.user.id });
      return new Response(JSON.stringify({ 
        error: "Invalid user data",
        subscribed: false,
        planName: "Gratuito"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    // Create user object for compatibility with rest of the code
    const user = { id: userData.user.id, email: userData.user.email };
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Buscar configuração do usuário
    const { data: userStatus } = await supabaseClient
      .from("user_status")
      .select("bypass_stripe_check, plan_id, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    let customers;
    try {
      customers = await stripe.customers.list({ email: user.email, limit: 1 });
    } catch (stripeError) {
      const errorMsg = stripeError instanceof Error ? stripeError.message : String(stripeError);
      logStep("ERROR fetching Stripe customers", { error: errorMsg, email: user.email });

      // Retornar resposta válida mesmo com erro no Stripe
      return new Response(
        JSON.stringify({
          subscribed: false,
          planName: "Gratuito",
          error: "Erro ao consultar Stripe",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    if (customers.data.length === 0) {
      logStep("No customer found");

      // ✅ NOVO: Verificar se é plano manual antes de resetar
      if (userStatus?.bypass_stripe_check === true) {
        logStep("User has manual plan (bypass_stripe_check=true), preserving plan_id");
        return new Response(
          JSON.stringify({
            subscribed: false,
            planName: "Plano Manual",
            bypass: true,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }

      logStep("Updating unsubscribed state");
      // Usuário sem customer no Stripe = usuário novo, manter ativo
      // Update user status to free plan
      const { data, error } = await supabaseClient
        .from("user_status")
        .upsert(
          {
            user_id: user.id,
            plan_id: null,
            is_active: true,
          },
          { onConflict: "user_id" },
        )
        .select()
        .single();

      if (error) {
        logStep("ERROR upserting user_status (no customer)", { error, userId: user.id });
      }

      return new Response(JSON.stringify({ subscribed: false, planName: "Gratuito" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      // IMPORTANT: trialing não entra em status:"active" e isso estava zerando o plano indevidamente.
      status: "all",
      limit: 10,
    });

    const getEndTimestamp = (sub: any): number | null => {
      const candidates = [
        { key: "current_period_end", value: sub?.current_period_end },
        { key: "cancel_at", value: sub?.cancel_at },
        { key: "trial_end", value: sub?.trial_end },
        { key: "ended_at", value: sub?.ended_at },
      ];

      for (const c of candidates) {
        if (typeof c.value === "number" && !isNaN(c.value)) return c.value;
        if (typeof c.value === "string") {
          const parsed = parseInt(c.value, 10);
          if (!isNaN(parsed)) return parsed;
        }
      }
      return null;
    };

    // Queremos considerar assinaturas ativas/trialing e também canceladas com tempo restante
    const nowSeconds = Math.floor(Date.now() / 1000);
    const eligibleSubscription =
      subscriptions.data.find((s: any) => s.status === "active" || s.status === "trialing") ??
      subscriptions.data
        .filter((s: any) => s.status === "canceled" && (getEndTimestamp(s) ?? 0) > nowSeconds)
        .sort((a: any, b: any) => (getEndTimestamp(b) ?? 0) - (getEndTimestamp(a) ?? 0))[0];

    const hasActiveSub = !!eligibleSubscription;
    let planId = null;
    let planName = "Gratuito";
    let productId = null;
    let subscriptionEnd = null;

    let cancelAtPeriodEnd = false;
    if (hasActiveSub) {
      const subscription: any = eligibleSubscription!;
      logStep("Initial subscription from list", {
        id: subscription.id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
      });

      // Alguns retornos do .list podem vir incompletos dependendo de versão/cache;
      // para garantir, buscamos a assinatura completa.
      let fullSubscription: any = subscription;
      try {
        fullSubscription = await stripe.subscriptions.retrieve(subscription.id, {
          expand: ['latest_invoice'],
        });
        logStep("Full subscription retrieved", { 
          id: fullSubscription.id,
          status: fullSubscription.status,
          billing_cycle_anchor: fullSubscription.billing_cycle_anchor,
          trial_end: fullSubscription.trial_end,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        logStep("WARNING retrieving full subscription", { message: msg, subscriptionId: subscription.id });
      }

      // Calculate subscription end based on available data
      // For trialing subscriptions, use trial_end
      // For active subscriptions, calculate from billing_cycle_anchor and plan interval
      let endTs: number | null = null;
      
      if (fullSubscription.status === 'trialing' && fullSubscription.trial_end) {
        endTs = fullSubscription.trial_end;
        logStep("Using trial_end for subscription period", { trial_end: endTs });
      } else if (fullSubscription.billing_cycle_anchor) {
        // Get the plan interval from the subscription items
        const planInterval = fullSubscription.items?.data?.[0]?.price?.recurring?.interval;
        const planIntervalCount = fullSubscription.items?.data?.[0]?.price?.recurring?.interval_count || 1;
        
        // Calculate the next billing date based on anchor and interval
        const anchorDate = new Date(fullSubscription.billing_cycle_anchor * 1000);
        const now = new Date();
        let nextBillingDate = new Date(anchorDate);
        
        // Find the next billing date that's in the future
        while (nextBillingDate <= now) {
          if (planInterval === 'year') {
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + planIntervalCount);
          } else if (planInterval === 'month') {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + planIntervalCount);
          } else if (planInterval === 'week') {
            nextBillingDate.setDate(nextBillingDate.getDate() + (7 * planIntervalCount));
          } else if (planInterval === 'day') {
            nextBillingDate.setDate(nextBillingDate.getDate() + planIntervalCount);
          } else {
            // Default to monthly if interval is unknown
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          }
        }
        
        endTs = Math.floor(nextBillingDate.getTime() / 1000);
        logStep("Calculated next billing date", { 
          billing_cycle_anchor: fullSubscription.billing_cycle_anchor,
          planInterval,
          planIntervalCount,
          nextBillingDate: nextBillingDate.toISOString(),
          endTs,
        });
      }
      
      // Fallback to getEndTimestamp helper for other fields
      if (!endTs) {
        endTs = getEndTimestamp(fullSubscription);
        logStep("Using fallback getEndTimestamp", { endTs });
      }
      
      logStep("Subscription end candidates", {
        status: fullSubscription.status,
        billing_cycle_anchor: fullSubscription.billing_cycle_anchor ?? "undefined",
        cancel_at: fullSubscription.cancel_at ?? "undefined",
        trial_end: fullSubscription.trial_end ?? "undefined",
        ended_at: fullSubscription.ended_at ?? "undefined",
        chosen: endTs ?? "null",
      });

      if (endTs && !isNaN(endTs)) {
        subscriptionEnd = new Date(endTs * 1000).toISOString();
      }

      cancelAtPeriodEnd = fullSubscription.cancel_at_period_end || false;
      logStep("Eligible subscription found", {
        subscriptionId: fullSubscription.id,
        status: fullSubscription.status,
        endDate: subscriptionEnd,
        cancelAtPeriodEnd,
      });

      // Get the product ID from subscription
      productId = subscription.items.data[0].price.product;

      // Get the price ID and map to our plan
      const priceId = subscription.items.data[0].price.id;
      const planMapping: Record<string, { id: string; name: string }> = {
        // Planos mensais ATIVOS (Sif...) - Links de pagamento atuais
        "price_1SifoHCOewOtyI3vUMi5UcaW": { id: "8851ac57-8aa3-450b-8fda-c13f1f064efa", name: "Essencial" },
        "price_1SifpOCOewOtyI3v7PLp3sX9": { id: "2e93cc7a-5800-4bf3-8a18-7a1cffbe521c", name: "Profissional" },
        "price_1SifplCOewOtyI3vLkqHMKf0": { id: "21c9894c-279a-4152-bc18-65309448f5cf", name: "Empresarial" },
        // Planos anuais ATIVOS (Sif...)
        "price_1SifrZCOewOtyI3vG4E3qXuw": { id: "8851ac57-8aa3-450b-8fda-c13f1f064efa", name: "Essencial" },
        "price_1SifsoCOewOtyI3vXY0A45J2": { id: "2e93cc7a-5800-4bf3-8a18-7a1cffbe521c", name: "Profissional" },
        "price_1SiftlCOewOtyI3vTFFNoeJ7": { id: "21c9894c-279a-4152-bc18-65309448f5cf", name: "Empresarial" },
        // Plano Consultório (exclusivo /acesso)
        "price_1SihnSCOewOtyI3vTlYicHsD": { id: "c8e4d5f2-9a3b-4e1c-8f0d-2a5b6c7d8e9f", name: "Consultório" },
        // Planos mensais LEGADO (SQ...)
        "price_1SQxxOCOewOtyI3v53iLWgw8": { id: "8851ac57-8aa3-450b-8fda-c13f1f064efa", name: "Essencial" },
        "price_1SQxxyCOewOtyI3vK2be5NSW": { id: "2e93cc7a-5800-4bf3-8a18-7a1cffbe521c", name: "Profissional" },
        "price_1SQxyaCOewOtyI3vhMe4J5ik": { id: "21c9894c-279a-4152-bc18-65309448f5cf", name: "Empresarial" },
        // Planos anuais LEGADO (SQ...)
        "price_1SQy01COewOtyI3vfuLw79bw": { id: "8851ac57-8aa3-450b-8fda-c13f1f064efa", name: "Essencial" },
        "price_1SQy0fCOewOtyI3vZTMf40Ld": { id: "2e93cc7a-5800-4bf3-8a18-7a1cffbe521c", name: "Profissional" },
        "price_1SQy1dCOewOtyI3vcI7fGLeu": { id: "21c9894c-279a-4152-bc18-65309448f5cf", name: "Empresarial" },
        // Planos mensais LEGADO (SI...)
        "price_1SI9dtCOewOtyI3vhaD2nUDq": { id: "8851ac57-8aa3-450b-8fda-c13f1f064efa", name: "Essencial" },
        "price_1SI9eCCOewOtyI3v9yPp5RgT": { id: "2e93cc7a-5800-4bf3-8a18-7a1cffbe521c", name: "Profissional" },
        "price_1SI9eRCOewOtyI3v6Xh74Dw9": { id: "21c9894c-279a-4152-bc18-65309448f5cf", name: "Empresarial" },
        // Planos anuais LEGADO (S9...)
        "price_1S9Dt9COewOtyI3voL5pMweg": { id: "8851ac57-8aa3-450b-8fda-c13f1f064efa", name: "Essencial" },
        "price_1S9DtuCOewOtyI3vZjroZmSA": { id: "2e93cc7a-5800-4bf3-8a18-7a1cffbe521c", name: "Profissional" },
        "price_1S9DuXCOewOtyI3vPhYIn62j": { id: "21c9894c-279a-4152-bc18-65309448f5cf", name: "Empresarial" },
      };

      const mappedPlan = planMapping[priceId];
      if (mappedPlan) {
        planId = mappedPlan.id;
        planName = mappedPlan.name;
        logStep("Determined subscription plan", { planId, planName, productId });

        // Update user status in Supabase with ALL Stripe data
        const { data, error } = await supabaseClient
          .from("user_status")
          .upsert(
            {
              user_id: user.id,
              plan_id: planId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              payment_method: "stripe",
              bypass_stripe_check: false,
              is_active: true,
            },
            { onConflict: "user_id" },
          )
          .select()
          .single();

        if (error) {
          logStep("ERROR upserting user_status (active subscription)", { error, userId: user.id, planId });
        } else {
          logStep("Successfully updated user_status with Stripe data", { customerId, subscriptionId: subscription.id });
        }
      } else {
        // NOVO: fallback quando price_id não está mapeado
        logStep("WARNING: price_id not found in mapping", { priceId, productId });
        planName = "Plano Desconhecido";
        // Não atualizar user_status se não souber qual plano é
      }
    } else {
      logStep("No active/trialing subscription found", {
        statuses: subscriptions.data.map((s: { status: string }) => s.status),
      });

      // ✅ NOVO: Verificar se é plano manual antes de resetar
      if (userStatus?.bypass_stripe_check === true) {
        logStep("User has manual plan (bypass_stripe_check=true), preserving plan_id");
        return new Response(
          JSON.stringify({
            subscribed: false,
            planName: "Plano Manual",
            bypass: true,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }

      // Verificar se há assinaturas canceladas (status: "canceled") sem tempo restante
      // Isso indica que a assinatura foi cancelada e o período expirou
      const hasCancelledSubscriptions = subscriptions.data.some(
        (s: { status: string }) => s.status === "canceled"
      );

      // Update user status to free plan
      // IMPORTANTE: Se houver assinaturas canceladas, DESATIVAR a conta (is_active: false)
      const { data, error } = await supabaseClient
        .from("user_status")
        .upsert(
          {
            user_id: user.id,
            plan_id: null,
            is_active: hasCancelledSubscriptions ? false : true, // Desativar se cancelado
          },
          { onConflict: "user_id" },
        )
        .select()
        .single();

      if (error) {
        logStep("ERROR upserting user_status (no active subscription)", { error, userId: user.id });
      } else if (hasCancelledSubscriptions) {
        logStep("User account DEACTIVATED - subscription cancelled and expired", { userId: user.id });
      }
    }

    return new Response(
      JSON.stringify({
        subscribed: hasActiveSub,
        planName: planName,
        product_id: productId,
        subscription_end: subscriptionEnd,
        cancel_at_period_end: cancelAtPeriodEnd,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
