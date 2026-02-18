import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { record } = await req.json();
    const userId = record.id;
    const userEmail = record.email;

    console.log(`[SEND-CUSTOM-EMAIL] Processing for user: ${userId} (${userEmail})`);

    // ============================================================
    // IMPORTANTE: E-mail de verificação com código NÃO é mais enviado
    // A conta é confirmada automaticamente via create-user edge function
    // que usa email_confirm: true na API Admin do Supabase.
    // 
    // Mantendo esta função apenas para logging e compatibilidade
    // com o Database Webhook existente.
    // ============================================================

    // Verificar se o usuário foi criado via create-user (conta já confirmada)
    // Usuários criados via create-user já tem email confirmado automaticamente
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError) {
      console.log(`[SEND-CUSTOM-EMAIL] Error fetching user: ${authError.message}`);
    }

    // Se o email já está confirmado, não precisa enviar código de verificação
    if (authUser?.user?.email_confirmed_at) {
      console.log(`[SEND-CUSTOM-EMAIL] User ${userEmail} already has confirmed email, skipping verification email`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          skipped: true,
          reason: "User email already confirmed - no verification code needed"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verificar se o usuário veio do fluxo Stripe (existe em pending_users)
    const { data: pendingUser } = await supabase
      .from("pending_users")
      .select("id")
      .eq("email", userEmail)
      .maybeSingle();

    if (pendingUser) {
      console.log(`[SEND-CUSTOM-EMAIL] User ${userEmail} came from Stripe flow, skipping verification email`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          skipped: true,
          reason: "User from Stripe flow - already received password setup email"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Se chegou aqui, é um caso legado - log e retorna sem enviar
    console.log(`[SEND-CUSTOM-EMAIL] Legacy case for ${userEmail} - verification emails are no longer sent`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        skipped: true,
        reason: "Verification code emails are deprecated - accounts are auto-confirmed"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("[SEND-CUSTOM-EMAIL] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
