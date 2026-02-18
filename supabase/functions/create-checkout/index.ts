import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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

    // Create a Supabase client using the service role key for auth validation
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { planId, billingCycle = "monthly" } = await req.json();
    if (!planId) throw new Error("Plan ID is required");
    logStep("Request parsed", { planId, billingCycle });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Map plan IDs to Stripe price IDs - MUST be defined before use
    const planPriceMapping: Record<string, { monthly: string; yearly: string }> = {
      "8851ac57-8aa3-450b-8fda-c13f1f064efa": {
        monthly: "price_1SifoHCOewOtyI3vUMi5UcaW",
        yearly: "price_1SifrZCOewOtyI3vG4E3qXuw",
      }, // Essencial
      "2e93cc7a-5800-4bf3-8a18-7a1cffbe521c": {
        monthly: "price_1SifpOCOewOtyI3v7PLp3sX9",
        yearly: "price_1SifsoCOewOtyI3vXY0A45J2",
      }, // Profissional
      "21c9894c-279a-4152-bc18-65309448f5cf": {
        monthly: "price_1SifplCOewOtyI3vLkqHMKf0",
        yearly: "price_1SiftlCOewOtyI3vTFFNoeJ7",
      }, // Empresarial
    };

    // Check if a Stripe customer already exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });

      // VERIFICAR se já tem assinatura ativa - se sim, REDIRECIONAR para portal
      const existingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
      });

      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "trialing",
      });

      const allActiveSubscriptions = [...existingSubscriptions.data, ...trialingSubscriptions.data];

      if (allActiveSubscriptions.length > 0) {
        // Verificar se o usuário está tentando assinar o MESMO plano
        const currentSubscription = allActiveSubscriptions[0];
        const currentPriceId = currentSubscription.items.data[0]?.price.id;

        // Determinar o price ID que o usuário quer assinar
        const planPrices = planPriceMapping[planId];
        if (!planPrices) {
          throw new Error(`No Stripe price found for plan ID: ${planId}`);
        }
        const targetPriceId = billingCycle === "yearly" ? planPrices.yearly : planPrices.monthly;

        logStep("Comparing prices", { currentPriceId, targetPriceId, planId, billingCycle });

        // Se é o MESMO plano, redirecionar para o portal (gerenciar assinatura)
        if (currentPriceId === targetPriceId) {
          logStep("User trying to subscribe to SAME plan - redirecting to portal", {
            currentPriceId,
            subscriptionId: currentSubscription.id,
          });

          const origin = req.headers.get("origin") || "https://migrabook.app";
          const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${origin}/pricing`,
          });

          logStep("Customer portal session created", { url: portalSession.url });

          return new Response(
            JSON.stringify({
              url: portalSession.url,
              redirectToPortal: true,
              message: "User already has this plan - redirecting to portal to manage",
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        }

        // Plano DIFERENTE - permitir upgrade/downgrade via novo checkout
        // O cancelamento do plano anterior acontecerá no webhook após checkout.session.completed
        logStep("User upgrading/downgrading to DIFFERENT plan - proceeding with checkout", {
          currentPriceId,
          targetPriceId,
          currentSubscriptionId: currentSubscription.id,
        });
      } else {
        logStep("No active subscriptions found, proceeding with checkout");
      }
    } else {
      logStep("No existing customer found, will create new one in checkout");
    }

    // NÃO CANCELAMOS assinaturas aqui - isso será feito pelo webhook após checkout.session.completed
    // Isso evita o bug de cancelamento prematuro

    const planPrices = planPriceMapping[planId];
    if (!planPrices) {
      throw new Error(`No Stripe price found for plan ID: ${planId}`);
    }

    const stripePriceId = billingCycle === "yearly" ? planPrices.yearly : planPrices.monthly;
    logStep("Mapped plan to Stripe price", { planId, billingCycle, stripePriceId });

    // Create the checkout session
    const origin = req.headers.get("origin") || "https://migrabook.app";

    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        billing_cycle: billingCycle,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
