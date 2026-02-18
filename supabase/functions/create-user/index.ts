import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string | null;
  fullName: string;
  phone: string;
  preferredLanguage: string;
  planId?: string; // Plano selecionado (opcional)
  skipUserCreation?: boolean; // Se true, apenas registra na Brevo sem criar usuário
  // UTMs do Facebook
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  // Dados de rastreamento do Facebook (CAPI)
  fbp?: string;
  fbc?: string;
  externalId?: string;
  userAgent?: string;
}

// Mapa de planos para suas chaves de configuração
const planKeyMap: Record<string, string> = {
  'essencial': 'newRegistrationEssencial',
  'profissional': 'newRegistrationProfissional',
  'empresarial': 'newRegistrationEmpresarial',
  'consultorio': 'newRegistrationConsultorio',
  'consultório': 'newRegistrationConsultorio'
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase com Admin API
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { email, password, fullName, phone, preferredLanguage, planId, skipUserCreation, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, fbp, fbc, externalId, userAgent }: CreateUserRequest = await req.json();

    console.log(`[CREATE-USER] Request received: ${email}, fullName: "${fullName}", planId: ${planId || 'none'}, skipUserCreation: ${skipUserCreation}, hasUtms: ${!!(utmSource || utmMedium || utmCampaign)}, hasFbTracking: ${!!(fbp || fbc)}`);

    let userId: string | null = null;

    // Se skipUserCreation for true, pular a criação do usuário (apenas Brevo)
    if (!skipUserCreation && password) {
      // Criar usuário com email JÁ CONFIRMADO (sem necessidade de verificação)
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // ← Conta já confirmada automaticamente
        user_metadata: {
          full_name: fullName,
          phone: phone,
          preferred_language: preferredLanguage,
        },
      });

      if (createError) {
        console.error("[CREATE-USER] Error creating user:", createError);
        
        // Detectar código de erro específico
        let errorCode = 'unknown_error';
        if (createError.message?.includes('already been registered') || 
            createError.message?.includes('already exists')) {
          errorCode = 'email_exists';
        }
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: createError.message,
            errorCode
          }),
          {
            status: 200, // Retornar 200 para o JSON chegar ao frontend
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      userId = userData.user.id;
      console.log(`[CREATE-USER] User created successfully: ${userId}`);
    } else {
      console.log(`[CREATE-USER] Skipping user creation, will only register on Brevo`);
    }

    // BREVO: Novo Cadastro - não bloquear cadastro se falhar
    try {
      const { data: brevoSetting, error: brevoSettingError } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "brevo_config")
        .maybeSingle();

      if (brevoSettingError) {
        console.warn("[CREATE-USER] Brevo config fetch error (non-critical):", brevoSettingError);
      } else if (brevoSetting?.value) {
        const brevoConfig = JSON.parse(brevoSetting.value);
        
        // Determinar a lista correta baseada no plano
        let targetList: string | null = null;
        
        // Primeiro, tentar encontrar a lista específica do plano
        if (planId && brevoConfig?.purchase_events) {
          const planKey = planKeyMap[planId.toLowerCase()];
          if (planKey) {
            const planSpecificList = brevoConfig.purchase_events[planKey];
            if (planSpecificList && planSpecificList !== 'none' && planSpecificList !== '') {
              targetList = planSpecificList;
              console.log(`[CREATE-USER] Using plan-specific Brevo list for ${planId}:`, targetList);
            }
          }
        }
        
        // Fallback para a lista padrão se não encontrou lista específica do plano
        if (!targetList) {
          const defaultList = brevoConfig?.purchase_events?.newRegistration;
          if (defaultList && defaultList !== 'none' && defaultList !== '') {
            targetList = defaultList;
            console.log("[CREATE-USER] Using default Brevo newRegistration list:", targetList);
          }
        }

        if (brevoConfig?.api_key && targetList) {
          // Nome completo vai para o campo NOME (sem dividir)
          const nomeCompleto = (fullName || "").trim();
          
          console.log("[CREATE-USER] Name for Brevo:", { fullName, nomeCompleto });

          // Validar telefone: deve começar com + e ter pelo menos 10 dígitos
          const isValidPhone = phone && /^\+\d{10,}$/.test(phone.replace(/\s/g, ''));

          const attributes: Record<string, string> = {};
          if (nomeCompleto) attributes.NOME = nomeCompleto;
          if (isValidPhone) attributes.SMS = phone.replace(/\s/g, '');
          if (planId) attributes.PLANO = planId;
          
          // Adicionar UTMs do Facebook
          if (utmSource) attributes.LD_APP_UTM_SOURCE = utmSource;
          if (utmMedium) attributes.LD_APP_UTM_MEDIUM = utmMedium;
          if (utmCampaign) attributes.LD_APP_UTM_CAMPAIGN = utmCampaign;
          if (utmTerm) attributes.LD_APP_UTM_TERM = utmTerm;
          if (utmContent) attributes.LD_APP_UTM_CONTENT = utmContent;
          
          // Adicionar dados de rastreamento do Facebook (CAPI)
          if (fbp) attributes.FBP = fbp;
          if (fbc) attributes.FBC = fbc;
          if (externalId) attributes.EXTERNAL_ID = externalId;
          if (userAgent) attributes.USER_AGENT = userAgent;

          const contactData: any = {
            email,
            updateEnabled: true,
            listIds: [parseInt(String(targetList), 10)],
            attributes,
          };

          console.log("[CREATE-USER] Adding contact to Brevo list", {
            email,
            listId: targetList,
            planId: planId || 'none',
            nome: nomeCompleto,
            attributes,
          });

          const postToBrevo = async (payload: any) => {
            const resp = await fetch("https://api.brevo.com/v3/contacts", {
              method: "POST",
              headers: {
                accept: "application/json",
                "content-type": "application/json",
                "api-key": brevoConfig.api_key,
              },
              body: JSON.stringify(payload),
            });

            const json = await resp.json().catch(() => ({}));
            return { resp, json };
          };

          const { resp: brevoResp, json: brevoJson } = await postToBrevo(contactData);

        if (!brevoResp.ok) {
            const duplicateIdentifiers = brevoJson?.metadata?.duplicate_identifiers;
            const isDuplicateSms =
              brevoResp.status === 400 &&
              brevoJson?.code === "duplicate_parameter" &&
              Array.isArray(duplicateIdentifiers) &&
              duplicateIdentifiers.includes("SMS");

            // Check for invalid phone number error
            const isInvalidPhone =
              brevoResp.status === 400 &&
              (brevoJson?.code === "invalid_parameter" || brevoJson?.message?.toLowerCase().includes("phone"));

            const shouldRetryWithoutSms = (isDuplicateSms || isInvalidPhone) && contactData?.attributes?.SMS;

            if (shouldRetryWithoutSms) {
              console.warn(
                "[CREATE-USER] Brevo add-contact failed due to SMS issue; retrying without SMS attribute",
                { status: brevoResp.status, reason: isDuplicateSms ? "duplicate" : "invalid", email, listId: targetList, planId: planId || "none" }
              );

              const { SMS: _sms, ...attributesWithoutSms } = contactData.attributes;
              const retryPayload = { ...contactData, attributes: attributesWithoutSms };

              const { resp: retryResp, json: retryJson } = await postToBrevo(retryPayload);

              if (!retryResp.ok) {
                console.warn("[CREATE-USER] Brevo add-contact retry failed (non-critical)", {
                  status: retryResp.status,
                  body: retryJson,
                });
              } else {
                console.log("[CREATE-USER] Brevo add-contact success (retry without SMS)", retryJson);
              }
            } else {
              console.warn("[CREATE-USER] Brevo add-contact failed (non-critical)", {
                status: brevoResp.status,
                body: brevoJson,
              });
            }
          } else {
            console.log("[CREATE-USER] Brevo add-contact success", brevoJson);
          }
        } else {
          console.log("[CREATE-USER] Brevo newRegistration not configured or no list found for plan:", planId);
        }
      }
    } catch (brevoErr) {
      console.warn(
        "[CREATE-USER] Brevo integration error (non-critical):",
        brevoErr instanceof Error ? brevoErr.message : String(brevoErr)
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: userId,
        email: email,
        skipUserCreation: !!skipUserCreation,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[CREATE-USER] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
