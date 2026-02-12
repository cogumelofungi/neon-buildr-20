import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[BREVO-NEW-REGISTRATION] ${step}${detailsStr}`);
};

// Mapa de planos para suas chaves de configuração
const planKeyMap: Record<string, string> = {
  'essencial': 'newRegistrationEssencial',
  'profissional': 'newRegistrationProfissional',
  'empresarial': 'newRegistrationEmpresarial',
  'consultorio': 'newRegistrationConsultorio',
  'consultório': 'newRegistrationConsultorio'
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, fullName, planId } = await req.json();

    if (!email) {
      logStep("Missing email");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Processing new registration", { email, fullName, planId });

    // Buscar configuração do Brevo
    const { data: brevoSetting, error: settingsError } = await supabaseClient
      .from('admin_settings')
      .select('value')
      .eq('key', 'brevo_config')
      .maybeSingle();

    if (settingsError) {
      logStep("Error fetching Brevo config", { error: settingsError.message });
      return new Response(
        JSON.stringify({ success: false, message: "Error fetching Brevo config" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!brevoSetting?.value) {
      logStep("No Brevo config found");
      return new Response(
        JSON.stringify({ success: false, message: "No Brevo config" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const brevoConfig = JSON.parse(brevoSetting.value);
    logStep("Brevo config loaded", { 
      hasApiKey: !!brevoConfig.api_key,
      newRegistrationList: brevoConfig.purchase_events?.newRegistration,
      planId
    });

    // Determinar a lista correta baseada no plano
    let targetListId: string | null = null;

    // Primeiro, tentar encontrar a lista específica do plano
    if (planId && brevoConfig.purchase_events) {
      const planKey = planKeyMap[planId.toLowerCase()];
      if (planKey) {
        const planSpecificList = brevoConfig.purchase_events[planKey];
        if (planSpecificList && planSpecificList !== 'none' && planSpecificList !== '') {
          targetListId = planSpecificList;
          logStep("Using plan-specific list", { planId, planKey, listId: targetListId });
        }
      }
    }

    // Fallback para a lista padrão se não encontrou lista específica do plano
    if (!targetListId) {
      const defaultList = brevoConfig.purchase_events?.newRegistration;
      if (defaultList && defaultList !== 'none' && defaultList !== '') {
        targetListId = defaultList;
        logStep("Using default registration list", { listId: targetListId });
      }
    }

    // Verificar se alguma lista foi configurada
    if (!brevoConfig.api_key || !targetListId) {
      logStep("New registration list not configured", { hasApiKey: !!brevoConfig.api_key, targetListId });
      return new Response(
        JSON.stringify({ success: false, message: "New registration list not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Adding contact to Brevo list", { listId: targetListId, email, planId });

    // Separar nome e sobrenome
    const nameParts = (fullName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Chamar a função brevo-api para adicionar o contato
    const { data: brevoResult, error: brevoError } = await supabaseClient.functions.invoke('brevo-api', {
      body: {
        action: 'add-contact',
        apiKey: brevoConfig.api_key,
        email: email,
        firstName: firstName,
        lastName: lastName,
        listIds: [parseInt(targetListId)],
        attributes: {
          PLANO: planId || 'unknown'
        }
      }
    });

    if (brevoError) {
      logStep("Brevo API error", { error: brevoError.message });
      return new Response(
        JSON.stringify({ success: false, message: "Brevo API error" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Contact added to Brevo successfully", { result: brevoResult, listId: targetListId, planId });

    return new Response(
      JSON.stringify({ success: true, message: "Contact added to Brevo", listId: targetListId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    logStep("Error in function", { error: error instanceof Error ? error.message : String(error) });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});