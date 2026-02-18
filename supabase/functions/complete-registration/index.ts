import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[COMPLETE-REGISTRATION] ${step}${detailsStr}`);
};

interface CompleteRegistrationRequest {
  token: string;
  password: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { token, password }: CompleteRegistrationRequest = await req.json();

    if (!token || !password) {
      throw new Error("Token and password are required");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    logStep("Looking up pending user", { token });

    // Buscar o pending user pelo token
    const { data: pendingUser, error: lookupError } = await supabaseClient
      .from("pending_users")
      .select("*")
      .eq("token", token)
      .is("used_at", null)
      .single();

    if (lookupError || !pendingUser) {
      logStep("ERROR: Token not found or already used", { lookupError });
      throw new Error("Token inválido ou já utilizado");
    }

    // Verificar se o token expirou
    if (new Date(pendingUser.expires_at) < new Date()) {
      logStep("ERROR: Token expired", { expires_at: pendingUser.expires_at });
      throw new Error("Token expirado. Por favor, entre em contato com o suporte.");
    }

    logStep("Found pending user", { email: pendingUser.email, planName: pendingUser.plan_name });

    // Verificar se o usuário já existe no Supabase Auth
    const { data: existingUsers } = await supabaseClient.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === pendingUser.email);

    let userId: string;

    if (existingUser) {
      logStep("User already exists, updating password", { userId: existingUser.id });
      
      // Atualizar a senha do usuário existente
      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        existingUser.id,
        { password }
      );

      if (updateError) {
        logStep("ERROR updating password", { error: updateError.message });
        throw new Error("Erro ao atualizar senha: " + updateError.message);
      }

      userId = existingUser.id;
    } else {
      logStep("Creating new user in Supabase Auth");

      // Usar nome do pending_user ou fallback para parte do email
      const fullName = pendingUser.full_name || pendingUser.email.split("@")[0];

      // Criar o usuário no Supabase Auth SEM enviar email de confirmação
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email: pendingUser.email,
        password,
        email_confirm: true, // Marca como confirmado (não envia email)
        user_metadata: {
          full_name: fullName,
          phone: pendingUser.phone,
        }
      });

      if (createError) {
        logStep("ERROR creating user", { error: createError.message });
        throw new Error("Erro ao criar usuário: " + createError.message);
      }

      userId = newUser.user.id;
      logStep("User created successfully", { userId, fullName, phone: pendingUser.phone });

      // Atualizar o profile com nome e telefone
      const { error: profileError } = await supabaseClient
        .from("profiles")
        .upsert({
          id: userId,
          email: pendingUser.email,
          full_name: fullName,
          phone: pendingUser.phone,
        }, { onConflict: 'id' });

      if (profileError) {
        logStep("WARNING: Could not update profile", { error: profileError.message });
      } else {
        logStep("Profile updated with name and phone", { userId, fullName, phone: pendingUser.phone });
      }
    }

    // Atualizar user_status com o plano
    const { error: statusError } = await supabaseClient
      .from("user_status")
      .upsert({
        user_id: userId,
        plan_id: pendingUser.plan_id,
        is_active: true,
        stripe_customer_id: pendingUser.stripe_customer_id,
        stripe_subscription_id: pendingUser.stripe_subscription_id,
        last_renewal_date: new Date().toISOString(),
        payment_method: 'stripe',
        bypass_stripe_check: false,
      }, { onConflict: 'user_id' });

    if (statusError) {
      logStep("ERROR updating user_status", { error: statusError.message });
      throw new Error("Erro ao configurar plano: " + statusError.message);
    }

    logStep("User status updated", { userId, planId: pendingUser.plan_id });

    // Marcar o token como usado
    const { error: tokenError } = await supabaseClient
      .from("pending_users")
      .update({ used_at: new Date().toISOString() })
      .eq("id", pendingUser.id);

    if (tokenError) {
      logStep("WARNING: Could not mark token as used", { error: tokenError.message });
    }

    logStep("Registration completed successfully", { userId, email: pendingUser.email });

    // BREVO: Adicionar contato à lista de novos cadastros (se configurado)
    try {
      logStep("Checking Brevo config for new registration...");
      const { data: brevoSetting } = await supabaseClient
        .from('admin_settings')
        .select('value')
        .eq('key', 'brevo_config')
        .maybeSingle();

      if (brevoSetting?.value) {
        const brevoConfig = JSON.parse(brevoSetting.value);
        
        if (brevoConfig.api_key && brevoConfig.purchase_events?.newRegistration && 
            brevoConfig.purchase_events.newRegistration !== 'none') {
          
          const targetListId = brevoConfig.purchase_events.newRegistration;
          logStep("Adding contact to Brevo new registration list", { listId: targetListId, email: pendingUser.email });
          
          const fullName = pendingUser.full_name || pendingUser.email.split("@")[0];
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          const { error: brevoError } = await supabaseClient.functions.invoke('brevo-api', {
            body: {
              action: 'add-contact',
              apiKey: brevoConfig.api_key,
              email: pendingUser.email,
              firstName: firstName,
              lastName: lastName,
              listIds: [parseInt(targetListId)]
            }
          });

          if (brevoError) {
            logStep("WARNING: Brevo contact add failed (non-critical)", { error: brevoError });
          } else {
            logStep("Brevo contact added to new registration list successfully");
          }
        } else {
          logStep("No Brevo new registration list configured");
        }
      }
    } catch (brevoErr: any) {
      logStep("WARNING: Brevo integration error (non-critical)", { error: brevoErr?.message || String(brevoErr) });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email: pendingUser.email,
        planName: pendingUser.plan_name,
        message: "Conta criada com sucesso! Faça login para continuar."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
