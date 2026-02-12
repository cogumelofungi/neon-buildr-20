import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-CANCELLED] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing environment variables");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    // Parse request body for optional email filter
    let targetEmail: string | null = null;
    try {
      const body = await req.json();
      targetEmail = body?.email || null;
    } catch {
      // No body or invalid JSON - process all users
    }

    // Buscar todos os usuários ativos (com ou sem stripe_customer_id)
    let query = supabase
      .from("user_status")
      .select("user_id, stripe_customer_id, stripe_subscription_id, plan_id, bypass_stripe_check")
      .eq("is_active", true);

    const { data: activeUsers, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Error fetching users: ${fetchError.message}`);
    }

    logStep("Found active users", { count: activeUsers?.length || 0, targetEmail });

    // Get user emails from auth.users via RPC
    const { data: usersWithEmail, error: emailError } = await supabase
      .rpc('get_users_with_metadata');

    if (emailError) {
      logStep("Warning: Could not fetch user emails", { error: emailError.message });
    }

    // Create a map of user_id to email
    const userEmailMap = new Map<string, string>();
    if (usersWithEmail) {
      for (const u of usersWithEmail) {
        userEmailMap.set(u.id, u.email);
      }
    }

    const deactivatedUsers: { userId: string; email: string }[] = [];
    const skippedUsers: { userId: string; email: string; reason: string }[] = [];
    const errors: string[] = [];

    for (const userStatus of activeUsers || []) {
      const userEmail = userEmailMap.get(userStatus.user_id) || 'unknown';

      // Se um email específico foi fornecido, processar apenas esse
      if (targetEmail && userEmail.toLowerCase() !== targetEmail.toLowerCase()) {
        continue;
      }

      try {
        // Pular usuários com bypass_stripe_check (planos manuais)
        if (userStatus.bypass_stripe_check === true) {
          skippedUsers.push({ 
            userId: userStatus.user_id, 
            email: userEmail, 
            reason: 'bypass_stripe_check=true (plano manual)' 
          });
          continue;
        }

        let customerId = userStatus.stripe_customer_id;

        // Se não tem stripe_customer_id, buscar pelo email no Stripe
        if (!customerId && userEmail && userEmail !== 'unknown') {
          const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
            logStep("Found Stripe customer by email", { email: userEmail, customerId });
            
            // Atualizar o stripe_customer_id no banco
            await supabase
              .from("user_status")
              .update({ stripe_customer_id: customerId })
              .eq("user_id", userStatus.user_id);
          }
        }

        // Se ainda não tem customer no Stripe, pular (usuário nunca assinou)
        if (!customerId) {
          skippedUsers.push({ 
            userId: userStatus.user_id, 
            email: userEmail, 
            reason: 'No Stripe customer found' 
          });
          continue;
        }

        // Buscar assinaturas do cliente no Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "all",
          limit: 10,
        });

        logStep("Checking subscriptions", { 
          email: userEmail, 
          customerId,
          subscriptions: subscriptions.data.map((s: Stripe.Subscription) => ({ 
            id: s.id, 
            status: s.status,
            current_period_end: s.current_period_end,
            cancel_at: s.cancel_at,
            ended_at: s.ended_at
          }))
        });

        // Verificar se há alguma assinatura ativa ou trialing
        const hasActiveSubscription = subscriptions.data.some(
          (s: Stripe.Subscription) => s.status === "active" || s.status === "trialing"
        );

        // Se tem assinatura ativa, pular
        if (hasActiveSubscription) {
          skippedUsers.push({ 
            userId: userStatus.user_id, 
            email: userEmail, 
            reason: 'Has active/trialing subscription' 
          });
          continue;
        }

        // Verificar se há assinaturas com pagamento vencido (past_due) ou não pago (unpaid)
        const hasPaymentIssue = subscriptions.data.some(
          (s: Stripe.Subscription) => s.status === "past_due" || s.status === "unpaid"
        );

        // Se tem pagamento vencido ou não pago, DESATIVAR imediatamente
        if (hasPaymentIssue) {
          logStep("Deactivating user due to payment issue (past_due/unpaid)", { 
            userId: userStatus.user_id,
            email: userEmail,
            customerId,
            subscriptions: subscriptions.data.map((s: Stripe.Subscription) => ({ id: s.id, status: s.status }))
          });

          const { error: updateError } = await supabase
            .from("user_status")
            .update({ 
              is_active: false
            })
            .eq("user_id", userStatus.user_id);

          if (updateError) {
            errors.push(`Failed to deactivate ${userEmail} (payment issue): ${updateError.message}`);
          } else {
            deactivatedUsers.push({ userId: userStatus.user_id, email: userEmail });
          }
          continue;
        }

        // Verificar se há assinaturas canceladas com tempo restante
        const nowSeconds = Math.floor(Date.now() / 1000);
        const hasCancelledWithTimeRemaining = subscriptions.data.some(
          (s: Stripe.Subscription) => {
            if (s.status !== "canceled") return false;
            const endTs = s.current_period_end || s.cancel_at || s.ended_at;
            return endTs && endTs > nowSeconds;
          }
        );

        // Se tem cancelada com tempo restante, pular
        if (hasCancelledWithTimeRemaining) {
          skippedUsers.push({ 
            userId: userStatus.user_id, 
            email: userEmail, 
            reason: 'Cancelled but has time remaining' 
          });
          continue;
        }

        // Verificar se tem assinaturas canceladas sem tempo restante
        const hasCancelledExpired = subscriptions.data.some(
          (s: Stripe.Subscription) => {
            if (s.status !== "canceled") return false;
            const endTs = s.current_period_end || s.cancel_at || s.ended_at;
            return !endTs || endTs <= nowSeconds;
          }
        );

        // Se tem cancelada expirada, DESATIVAR
        if (hasCancelledExpired) {
          logStep("Deactivating user due to cancelled subscription (expired)", { 
            userId: userStatus.user_id,
            email: userEmail,
            customerId,
            subscriptions: subscriptions.data.map((s: Stripe.Subscription) => ({ id: s.id, status: s.status }))
          });

          const { error: updateError } = await supabase
            .from("user_status")
            .update({ 
              is_active: false,
              plan_id: null,
              stripe_subscription_id: null
            })
            .eq("user_id", userStatus.user_id);

          if (updateError) {
            errors.push(`Failed to deactivate ${userEmail} (cancelled): ${updateError.message}`);
          } else {
            deactivatedUsers.push({ userId: userStatus.user_id, email: userEmail });
          }
          continue;
        }

        // Verificar se tem alguma assinatura (se não tem nenhuma, usuário nunca assinou via Stripe)
        if (subscriptions.data.length === 0) {
          skippedUsers.push({ 
            userId: userStatus.user_id, 
            email: userEmail, 
            reason: 'No subscriptions in Stripe' 
          });
          continue;
        }

        // Se chegou aqui: tem assinaturas no Stripe, mas status desconhecido
        skippedUsers.push({ 
          userId: userStatus.user_id, 
          email: userEmail, 
          reason: `Unknown subscription status: ${subscriptions.data.map((s: Stripe.Subscription) => s.status).join(', ')}`
        });
      } catch (stripeError) {
        const msg = stripeError instanceof Error ? stripeError.message : String(stripeError);
        errors.push(`Stripe error for ${userEmail}: ${msg}`);
      }
    }

    logStep("Sync completed", { 
      deactivatedCount: deactivatedUsers.length,
      skippedCount: skippedUsers.length,
      errorCount: errors.length 
    });

    return new Response(
      JSON.stringify({
        success: true,
        deactivated_users: deactivatedUsers,
        deactivated_count: deactivatedUsers.length,
        skipped_users: skippedUsers,
        skipped_count: skippedUsers.length,
        errors: errors,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
