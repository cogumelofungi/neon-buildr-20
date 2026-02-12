import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Função para gerar token único
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Função para salvar histórico de assinatura
async function saveSubscriptionHistory(
  supabaseClient: any,
  data: {
    user_id: string;
    user_email: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    previous_plan_id?: string;
    previous_plan_name?: string;
    previous_status?: string;
    new_plan_id?: string;
    new_plan_name?: string;
    new_status?: string;
    event_type: string;
    event_source: string;
    stripe_event_id?: string;
    raw_data?: any;
  }
) {
  try {
    const { error } = await supabaseClient
      .from("subscription_history")
      .insert({
        user_id: data.user_id,
        user_email: data.user_email,
        stripe_customer_id: data.stripe_customer_id,
        stripe_subscription_id: data.stripe_subscription_id,
        previous_plan_id: data.previous_plan_id,
        previous_plan_name: data.previous_plan_name,
        previous_status: data.previous_status,
        new_plan_id: data.new_plan_id,
        new_plan_name: data.new_plan_name,
        new_status: data.new_status,
        event_type: data.event_type,
        event_source: data.event_source,
        stripe_event_id: data.stripe_event_id,
        raw_data: data.raw_data,
      });

    if (error) {
      logStep("ERROR saving subscription history", { error });
    } else {
      logStep("Subscription history saved", { event_type: data.event_type, user_email: data.user_email });
    }
  } catch (err) {
    logStep("ERROR in saveSubscriptionHistory", { error: err instanceof Error ? err.message : String(err) });
  }
}

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    logStep("ERROR: Missing signature or webhook secret");
    return new Response("Webhook signature or secret missing", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    logStep("Webhook event received", { type: event.type, eventId: event.id });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Mapeamento de Price IDs para Plan IDs
    const planMapping: Record<string, { id: string, name: string }> = {
      // Planos mensais ATIVOS (Sif...) - Links de pagamento atuais
      "price_1SifoHCOewOtyI3vUMi5UcaW": { id: "8851ac57-8aa3-450b-8fda-c13f1f064efa", name: "Essencial" },
      "price_1SifpOCOewOtyI3v7PLp3sX9": { id: "2e93cc7a-5800-4bf3-8a18-7a1cffbe521c", name: "Profissional" },
      "price_1SifplCOewOtyI3vLkqHMKf0": { id: "21c9894c-279a-4152-bc18-65309448f5cf", name: "Empresarial" },
      // Planos anuais ATIVOS (Sif...)
      "price_1SifrZCOewOtyI3vG4E3qXuw": { id: "8851ac57-8aa3-450b-8fda-c13f1f064efa", name: "Essencial" },
      "price_1SifsoCOewOtyI3vXY0A45J2": { id: "2e93cc7a-5800-4bf3-8a18-7a1cffbe521c", name: "Profissional" },
      "price_1SiftlCOewOtyI3vTFFNoeJ7": { id: "21c9894c-279a-4152-bc18-65309448f5cf", name: "Empresarial" },
      // Plano Consultório (exclusivo /acesso) - Mensal e Anual
      "price_1SihnSCOewOtyI3vTlYicHsD": { id: "c8e4d5f2-9a3b-4e1c-8f0d-2a5b6c7d8e9f", name: "Consultório" }, // Mensal
      "price_1Sij3gCOewOtyI3vrKoRdF2j": { id: "c8e4d5f2-9a3b-4e1c-8f0d-2a5b6c7d8e9f", name: "Consultório" }, // Anual
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

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed - START", { 
          sessionId: session.id, 
          mode: session.mode,
          subscription: session.subscription,
          customer_email: session.customer_email,
          customer_details_email: (session.customer_details as any)?.email
        });

        if (session.mode === "subscription" && session.subscription) {
          logStep("Processing subscription mode");
          
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          logStep("Subscription retrieved", { subscriptionId: subscription.id, status: subscription.status });

          const priceId = subscription.items.data[0].price.id;
          const customerEmail = session.customer_email || (session.customer_details as any)?.email;
          const customerId = session.customer as string;

          logStep("Extracted data", { 
            priceId, 
            customerEmail, 
            customerId,
            subscriptionId: subscription.id 
          });

          if (!customerEmail) {
            logStep("ERROR: No customer email found - cannot process");
            break;
          }

          // Verificar se o usuário já existe no Supabase Auth
          logStep("Checking if user exists in Auth");
          const { data: userData, error: listUsersError } = await supabaseClient.auth.admin.listUsers();
          
          if (listUsersError) {
            logStep("ERROR listing users", { error: listUsersError });
          }
          
          const existingUser = userData?.users?.find((u) => u.email === customerEmail);
          logStep("User search result", { 
            exists: !!existingUser, 
            userId: existingUser?.id,
            totalUsers: userData?.users?.length 
          });

          const mappedPlan = planMapping[priceId];
          logStep("Plan mapping", { priceId, mappedPlan, mappedPlanFound: !!mappedPlan });

          if (existingUser) {
            // USUÁRIO EXISTENTE: Atualizar plano diretamente
            logStep("Existing user found, updating plan", { userId: existingUser.id, email: customerEmail });

            // Buscar status atual para histórico
            const { data: currentStatus } = await supabaseClient
              .from("user_status")
              .select("plan_id, stripe_subscription_id")
              .eq("user_id", existingUser.id)
              .single();

            let previousPlanName = "Usuário existente";
            if (currentStatus?.plan_id) {
              const { data: prevPlan } = await supabaseClient
                .from("plans")
                .select("name")
                .eq("id", currentStatus.plan_id)
                .single();
              previousPlanName = prevPlan?.name || "Desconhecido";
            }

            // Se tinha assinatura anterior diferente, cancelar
            if (currentStatus?.stripe_subscription_id && 
                currentStatus.stripe_subscription_id !== subscription.id) {
              try {
                logStep("Cancelling previous subscription", {
                  oldSubscriptionId: currentStatus.stripe_subscription_id
                });
                await stripe.subscriptions.cancel(currentStatus.stripe_subscription_id, {
                  prorate: true,
                });
              } catch (cancelError) {
                logStep("WARNING: Could not cancel previous subscription", {
                  error: cancelError instanceof Error ? cancelError.message : String(cancelError)
                });
              }
            }

            if (mappedPlan) {
              const { error } = await supabaseClient
                .from("user_status")
                .upsert({
                  user_id: existingUser.id,
                  plan_id: mappedPlan.id,
                  is_active: true,
                  stripe_customer_id: customerId,
                  stripe_subscription_id: subscription.id,
                  last_renewal_date: new Date().toISOString(),
                  payment_method: 'stripe',
                  bypass_stripe_check: false,
                }, { onConflict: 'user_id' });

              if (error) {
                logStep("ERROR upserting user_status", { error });
              } else {
                logStep("User plan updated successfully", { 
                  userId: existingUser.id, 
                  planName: mappedPlan.name 
                });

                // Salvar no histórico
                await saveSubscriptionHistory(supabaseClient, {
                  user_id: existingUser.id,
                  user_email: customerEmail || '',
                  stripe_customer_id: customerId,
                  stripe_subscription_id: subscription.id,
                  previous_plan_id: currentStatus?.plan_id,
                  previous_plan_name: previousPlanName,
                  previous_status: currentStatus ? 'active' : 'new',
                  new_plan_id: mappedPlan.id,
                  new_plan_name: mappedPlan.name,
                  new_status: subscription.status,
                  event_type: 'subscribe',
                  event_source: 'webhook',
                  stripe_event_id: event.id,
                  raw_data: { session, subscription }
                });
              }
            }
          } else {
            // NOVO USUÁRIO: Criar pending_user e enviar email
            // Extrair nome e telefone do checkout
            const customerName = (session.customer_details as any)?.name || null;
            const customerPhone = (session.customer_details as any)?.phone || null;
            
            logStep("NEW USER FLOW - Creating pending registration", { 
              email: customerEmail,
              customerId,
              subscriptionId: subscription.id,
              planId: mappedPlan?.id,
              planName: mappedPlan?.name,
              customerName,
              customerPhone
            });

            const token = generateToken();
            logStep("Token generated", { tokenLength: token.length });

            // Inserir na tabela pending_users
            const pendingUserData = {
              email: customerEmail,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              plan_id: mappedPlan?.id,
              plan_name: mappedPlan?.name || "Plano",
              token,
              expires_at: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(), // Never expires (100 years)
              full_name: customerName,
              phone: customerPhone,
            };
            logStep("Attempting to insert pending_user", pendingUserData);

            const { data: insertedData, error: insertError } = await supabaseClient
              .from("pending_users")
              .upsert(pendingUserData, { 
                onConflict: 'email',
                ignoreDuplicates: false 
              })
              .select();

            logStep("Upsert result", { insertedData, insertError });

            if (insertError) {
              logStep("ERROR inserting pending_user", { error: insertError, code: insertError.code, details: insertError.details });
            } else {
              logStep("Pending user created", { email: customerEmail, planName: mappedPlan?.name });

              // Enviar email para criar senha
              try {
                const siteUrl = Deno.env.get("SITE_URL") || "https://migrabook.app";
                const emailResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-password-setup-email`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                  },
                  body: JSON.stringify({
                    email: customerEmail,
                    planName: mappedPlan?.name || "Plano",
                    token,
                  }),
                });

                if (emailResponse.ok) {
                  logStep("Password setup email sent successfully", { email: customerEmail });
                } else {
                  const emailError = await emailResponse.text();
                  logStep("ERROR sending password setup email", { error: emailError });
                }
              } catch (emailErr) {
                logStep("ERROR calling send-password-setup-email", { 
                  error: emailErr instanceof Error ? emailErr.message : String(emailErr) 
                });
              }
            }
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated/created", { subscriptionId: subscription.id, status: subscription.status });

        const priceId = subscription.items.data[0].price.id;
        const customer = await stripe.customers.retrieve(subscription.customer as string);

        if ("email" in customer && customer.email) {
          const { data: userData } = await supabaseClient.auth.admin.listUsers();
          const user = userData.users.find((u) => u.email === customer.email);

          if (user) {
            // Buscar status atual para histórico
            const { data: currentStatus } = await supabaseClient
              .from("user_status")
              .select("plan_id")
              .eq("user_id", user.id)
              .single();

            let previousPlanName = "Desconhecido";
            if (currentStatus?.plan_id) {
              const { data: prevPlan } = await supabaseClient
                .from("plans")
                .select("name")
                .eq("id", currentStatus.plan_id)
                .single();
              previousPlanName = prevPlan?.name || "Desconhecido";
            }

            const mappedPlan = planMapping[priceId];
            
            // ATIVO: Se assinatura está ativa ou em trial, manter conta ativa
            if (mappedPlan && (subscription.status === "active" || subscription.status === "trialing")) {
              const { data, error } = await supabaseClient
                .from("user_status")
                .upsert({
                  user_id: user.id,
                  plan_id: mappedPlan.id,
                  is_active: true,
                  stripe_customer_id: subscription.customer as string,
                  stripe_subscription_id: subscription.id,
                  last_renewal_date: new Date().toISOString(),
                  payment_method: 'stripe',
                  bypass_stripe_check: false,
                }, { onConflict: 'user_id' })
                .select()
                .single();

              if (error) {
                logStep("ERROR upserting user_status in subscription event", { error, userId: user.id });
              } else {
                logStep("User plan updated via subscription event", {
                  userId: user.id,
                  planId: mappedPlan.id,
                  planName: mappedPlan.name,
                  customerId: subscription.customer,
                  subscriptionId: subscription.id,
                  status: subscription.status,
                  upsertData: data
                });

                // Salvar no histórico
                await saveSubscriptionHistory(supabaseClient, {
                  user_id: user.id,
                  user_email: customer.email,
                  stripe_customer_id: subscription.customer as string,
                  stripe_subscription_id: subscription.id,
                  previous_plan_id: currentStatus?.plan_id,
                  previous_plan_name: previousPlanName,
                  previous_status: currentStatus ? 'active' : 'new',
                  new_plan_id: mappedPlan.id,
                  new_plan_name: mappedPlan.name,
                  new_status: subscription.status,
                  event_type: event.type === 'customer.subscription.created' ? 'subscribe' : 'update',
                  event_source: 'webhook',
                  stripe_event_id: event.id,
                  raw_data: { subscription }
                });
              }
            }
            // VENCIDA/NÃO PAGO: Desativar a conta quando o pagamento falha
            else if (subscription.status === "past_due" || subscription.status === "unpaid") {
              logStep("Subscription payment failed - deactivating account", {
                userId: user.id,
                email: customer.email,
                status: subscription.status
              });

              // Buscar o plano "Gratuito"
              const { data: freePlan } = await supabaseClient
                .from("plans")
                .select("id, name")
                .eq("name", "Gratuito")
                .single();

              const { error } = await supabaseClient
                .from("user_status")
                .upsert({
                  user_id: user.id,
                  plan_id: freePlan?.id || null,
                  is_active: false, // DESATIVAR A CONTA
                  stripe_customer_id: subscription.customer as string,
                  stripe_subscription_id: subscription.id,
                  payment_method: 'stripe',
                  bypass_stripe_check: false
                }, { onConflict: 'user_id' });

              if (error) {
                logStep("ERROR deactivating user for payment failure", { error, userId: user.id });
              } else {
                logStep("User account DEACTIVATED due to payment failure", { 
                  userId: user.id, 
                  email: customer.email,
                  status: subscription.status 
                });

                // Salvar no histórico
                await saveSubscriptionHistory(supabaseClient, {
                  user_id: user.id,
                  user_email: customer.email,
                  stripe_customer_id: subscription.customer as string,
                  stripe_subscription_id: subscription.id,
                  previous_plan_id: currentStatus?.plan_id,
                  previous_plan_name: previousPlanName,
                  previous_status: 'active',
                  new_plan_id: freePlan?.id,
                  new_plan_name: freePlan?.name || 'Gratuito',
                  new_status: subscription.status,
                  event_type: 'payment_failed',
                  event_source: 'webhook',
                  stripe_event_id: event.id,
                  raw_data: { subscription }
                });
              }
            }
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id });

        // Verificar se há outras assinaturas ativas/trialing antes de resetar para Gratuito
        const otherSubscriptions = await stripe.subscriptions.list({
          customer: subscription.customer as string,
        });
        
        const hasActiveOrTrialing = otherSubscriptions.data.some(
          (s: { id: string; status: string }) => s.id !== subscription.id && (s.status === 'active' || s.status === 'trialing')
        );
        
        if (hasActiveOrTrialing) {
          logStep("Subscription cancelled but user has other active/trialing subscriptions", {
            cancelledSubscriptionId: subscription.id,
          });
          break;
        }

        const customer = await stripe.customers.retrieve(subscription.customer as string);

        if ("email" in customer && customer.email) {
          const { data: userData } = await supabaseClient.auth.admin.listUsers();
          const user = userData.users.find((u) => u.email === customer.email);

          if (user) {
            // Buscar status atual para histórico
            const { data: currentStatus } = await supabaseClient
              .from("user_status")
              .select("plan_id, stripe_subscription_id")
              .eq("user_id", user.id)
              .single();

            // Verificar se a assinatura sendo deletada é a atual
            if (currentStatus?.stripe_subscription_id && 
                currentStatus.stripe_subscription_id !== subscription.id) {
              logStep("Subscription deleted is NOT the current subscription - ignoring", {
                deletedSubscriptionId: subscription.id,
                currentSubscriptionId: currentStatus.stripe_subscription_id
              });
              break;
            }

            let previousPlanName = "Desconhecido";
            if (currentStatus?.plan_id) {
              const { data: prevPlan } = await supabaseClient
                .from("plans")
                .select("name")
                .eq("id", currentStatus.plan_id)
                .single();
              previousPlanName = prevPlan?.name || "Desconhecido";
            }

            // Buscar o plano "Gratuito"
            const { data: freePlan } = await supabaseClient
              .from("plans")
              .select("id, name")
              .eq("name", "Gratuito")
              .single();

            const { error } = await supabaseClient
              .from("user_status")
              .upsert({
                user_id: user.id,
                plan_id: freePlan?.id || null,
                is_active: false, // DESATIVAR conta quando assinatura é cancelada
                stripe_customer_id: null,
                stripe_subscription_id: null,
                payment_method: null,
                bypass_stripe_check: false
              }, { onConflict: 'user_id' });

            if (error) {
              logStep("ERROR upserting user_status in subscription deletion", { error, userId: user.id });
            } else {
              logStep("User moved to free plan", { userId: user.id, planId: freePlan?.id });

              // Salvar no histórico
              await saveSubscriptionHistory(supabaseClient, {
                user_id: user.id,
                user_email: customer.email,
                stripe_customer_id: subscription.customer as string,
                stripe_subscription_id: subscription.id,
                previous_plan_id: currentStatus?.plan_id,
                previous_plan_name: previousPlanName,
                previous_status: 'active',
                new_plan_id: freePlan?.id,
                new_plan_name: freePlan?.name || 'Gratuito',
                new_status: 'cancelled',
                event_type: 'cancel',
                event_source: 'webhook',
                stripe_event_id: event.id,
                raw_data: { subscription }
              });

              // BREVO: Adicionar contato à lista de cancelamentos (se configurado)
              try {
                logStep("Checking Brevo config for subscription cancellation...");
                const { data: brevoSetting } = await supabaseClient
                  .from('admin_settings')
                  .select('value')
                  .eq('key', 'brevo_config')
                  .maybeSingle();

                if (brevoSetting?.value) {
                  const brevoConfig = JSON.parse(brevoSetting.value);
                  
                  if (brevoConfig.api_key && brevoConfig.purchase_events?.subscriptionCancel && 
                      brevoConfig.purchase_events.subscriptionCancel !== 'none') {
                    
                    const targetListId = brevoConfig.purchase_events.subscriptionCancel;
                    logStep("Adding contact to Brevo cancellation list", { listId: targetListId, email: customer.email });
                    
                    const nameParts = (user.user_metadata?.full_name || user.user_metadata?.display_name || '').split(' ');
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';
                    
                    const { error: brevoError } = await supabaseClient.functions.invoke('brevo-api', {
                      body: {
                        action: 'add-contact',
                        apiKey: brevoConfig.api_key,
                        email: customer.email,
                        firstName: firstName,
                        lastName: lastName,
                        listIds: [parseInt(targetListId)]
                      }
                    });

                    if (brevoError) {
                      logStep("WARNING: Brevo contact add failed (non-critical)", { error: brevoError });
                    } else {
                      logStep("Brevo contact added to cancellation list successfully");
                    }
                  } else {
                    logStep("No Brevo cancellation list configured");
                  }
                }
              } catch (brevoErr) {
                logStep("WARNING: Brevo integration error (non-critical)", { 
                  error: brevoErr instanceof Error ? brevoErr.message : String(brevoErr) 
                });
              }
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice payment failed", { 
          invoiceId: invoice.id, 
          subscriptionId: invoice.subscription,
          customerId: invoice.customer 
        });

        // Somente processar se for uma fatura de assinatura
        if (invoice.subscription && invoice.customer) {
          const customer = await stripe.customers.retrieve(invoice.customer as string);
          
          if ("email" in customer && customer.email) {
            const { data: userData } = await supabaseClient.auth.admin.listUsers();
            const user = userData.users.find((u) => u.email === customer.email);

            if (user) {
              logStep("Deactivating account due to failed invoice payment", {
                userId: user.id,
                email: customer.email
              });

              // Buscar status atual para histórico
              const { data: currentStatus } = await supabaseClient
                .from("user_status")
                .select("plan_id")
                .eq("user_id", user.id)
                .single();

              let previousPlanName = "Desconhecido";
              if (currentStatus?.plan_id) {
                const { data: prevPlan } = await supabaseClient
                  .from("plans")
                  .select("name")
                  .eq("id", currentStatus.plan_id)
                  .single();
                previousPlanName = prevPlan?.name || "Desconhecido";
              }

              // Buscar o plano "Gratuito"
              const { data: freePlan } = await supabaseClient
                .from("plans")
                .select("id, name")
                .eq("name", "Gratuito")
                .single();

              const { error } = await supabaseClient
                .from("user_status")
                .upsert({
                  user_id: user.id,
                  plan_id: freePlan?.id || null,
                  is_active: false, // DESATIVAR A CONTA
                  stripe_customer_id: invoice.customer as string,
                  stripe_subscription_id: invoice.subscription as string,
                  payment_method: 'stripe',
                  bypass_stripe_check: false
                }, { onConflict: 'user_id' });

              if (error) {
                logStep("ERROR deactivating user for invoice payment failure", { error, userId: user.id });
              } else {
                logStep("User account DEACTIVATED due to invoice payment failure", { 
                  userId: user.id, 
                  email: customer.email 
                });

                // Salvar no histórico
                await saveSubscriptionHistory(supabaseClient, {
                  user_id: user.id,
                  user_email: customer.email,
                  stripe_customer_id: invoice.customer as string,
                  stripe_subscription_id: invoice.subscription as string,
                  previous_plan_id: currentStatus?.plan_id,
                  previous_plan_name: previousPlanName,
                  previous_status: 'active',
                  new_plan_id: freePlan?.id,
                  new_plan_name: freePlan?.name || 'Gratuito',
                  new_status: 'payment_failed',
                  event_type: 'invoice_payment_failed',
                  event_source: 'webhook',
                  stripe_event_id: event.id,
                  raw_data: { invoice }
                });
              }
            } else {
              logStep("User not found in Supabase for invoice payment failure", { email: customer.email });
            }
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        logStep("Charge refunded", { chargeId: charge.id, customerId: charge.customer });

        if (charge.customer) {
          const customer = await stripe.customers.retrieve(charge.customer as string);
          
          if ("email" in customer && customer.email) {
            logStep("Refund for customer", { email: customer.email });

            // BREVO: Adicionar contato à lista de reembolsos (se configurado)
            try {
              logStep("Checking Brevo config for refund...");
              const { data: brevoSetting } = await supabaseClient
                .from('admin_settings')
                .select('value')
                .eq('key', 'brevo_config')
                .maybeSingle();

              if (brevoSetting?.value) {
                const brevoConfig = JSON.parse(brevoSetting.value);
                
                if (brevoConfig.api_key && brevoConfig.purchase_events?.refund && 
                    brevoConfig.purchase_events.refund !== 'none') {
                  
                  const targetListId = brevoConfig.purchase_events.refund;
                  logStep("Adding contact to Brevo refund list", { listId: targetListId, email: customer.email });
                  
                  const customerName = customer.name || '';
                  const nameParts = customerName.split(' ');
                  const firstName = nameParts[0] || '';
                  const lastName = nameParts.slice(1).join(' ') || '';
                  
                  const { error: brevoError } = await supabaseClient.functions.invoke('brevo-api', {
                    body: {
                      action: 'add-contact',
                      apiKey: brevoConfig.api_key,
                      email: customer.email,
                      firstName: firstName,
                      lastName: lastName,
                      listIds: [parseInt(targetListId)]
                    }
                  });

                  if (brevoError) {
                    logStep("WARNING: Brevo contact add failed (non-critical)", { error: brevoError });
                  } else {
                    logStep("Brevo contact added to refund list successfully");
                  }
                } else {
                  logStep("No Brevo refund list configured");
                }
              }
            } catch (brevoErr) {
              logStep("WARNING: Brevo integration error (non-critical)", { 
                error: brevoErr instanceof Error ? brevoErr.message : String(brevoErr) 
              });
            }
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logStep("ERROR processing webhook", { error: errorMessage });
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }
});
