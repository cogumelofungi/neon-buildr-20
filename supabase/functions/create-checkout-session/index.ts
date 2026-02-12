import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT-SESSION] ${step}${detailsStr}`);
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

    // Parse request body - não requer autenticação pois é chamado após signup
    const { planId, billingCycle = "monthly", customerName, customerEmail, customerPhone } = await req.json();
    
    if (!planId) throw new Error("Plan ID is required");
    if (!customerEmail) throw new Error("Customer email is required");
    if (!customerName) throw new Error("Customer name is required");
    
    logStep("Request parsed", { planId, billingCycle, customerEmail, customerName, hasPhone: !!customerPhone });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Mapeamento de planos para Price IDs do Stripe
    const planPriceMapping: Record<string, { monthly: string; annual: string }> = {
      essencial: {
        monthly: "price_1SifoHCOewOtyI3vUMi5UcaW",
        annual: "price_1SifrZCOewOtyI3vG4E3qXuw",
      },
      profissional: {
        monthly: "price_1SifpOCOewOtyI3v7PLp3sX9",
        annual: "price_1SifsoCOewOtyI3vXY0A45J2",
      },
      empresarial: {
        monthly: "price_1SifplCOewOtyI3vLkqHMKf0",
        annual: "price_1SiftlCOewOtyI3vTFFNoeJ7",
      },
      consultorio: {
        monthly: "price_1RVqJNCOewOtyI3v0cW5t5p2",
        annual: "price_1RVqJzCOewOtyI3vx7GEkzMN",
      },
    };

    const planPrices = planPriceMapping[planId];
    if (!planPrices) {
      throw new Error(`No Stripe price found for plan ID: ${planId}`);
    }

    const stripePriceId = billingCycle === "annual" ? planPrices.annual : planPrices.monthly;
    logStep("Mapped plan to Stripe price", { planId, billingCycle, stripePriceId });

    // Verificar se já existe um customer com este email
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId: string | undefined;
    let isNewCustomer = true;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      isNewCustomer = false;
      logStep("Found existing Stripe customer", { customerId });

      // Atualizar dados do cliente existente
      await stripe.customers.update(customerId, {
        name: customerName,
        phone: customerPhone || undefined,
      });
      logStep("Updated existing customer data");
    } else {
      // Criar novo customer com todos os dados
      const newCustomer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        phone: customerPhone || undefined,
        metadata: {
          source: "planos_page",
        },
      });
      customerId = newCustomer.id;
      logStep("Created new Stripe customer", { customerId });
    }

    const origin = req.headers.get("origin") || "https://migrabook.app";

    // Criar Checkout Session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/finalizada-assinatura-completa?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/assinatura`,
      // Coleta de telefone
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        plan_id: planId,
        billing_cycle: billingCycle,
        source: "planos_page",
      },
      subscription_data: {
        metadata: {
          plan_id: planId,
        },
      },
      // Dados do cliente já preenchidos
      customer_update: {
        name: "auto",
        address: "auto",
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url,
      customerId,
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout-session", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
