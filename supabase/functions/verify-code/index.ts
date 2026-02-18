import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyCodeRequest {
  email: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, code }: VerifyCodeRequest = await req.json();

    console.log(`[VERIFY-CODE] Verifying code for email: ${email}`);

    // Buscar código válido
    const { data: verificationCode, error: fetchError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("is_used", false)
      .single();

    if (fetchError || !verificationCode) {
      console.error("[VERIFY-CODE] Code not found or already used");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Código inválido ou já utilizado" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verificar se o código expirou
    const now = new Date();
    const expiresAt = new Date(verificationCode.expires_at);
    
    if (now > expiresAt) {
      console.error("[VERIFY-CODE] Code expired");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Código expirado. Solicite um novo código." 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Marcar código como usado
    const { error: updateError } = await supabase
      .from("verification_codes")
      .update({ is_used: true })
      .eq("id", verificationCode.id);

    if (updateError) {
      console.error("[VERIFY-CODE] Error updating code:", updateError);
      throw updateError;
    }

    // Confirmar email do usuário no Supabase Auth
    const { data: adminData, error: adminError } = await supabase.auth.admin.updateUserById(
      verificationCode.user_id,
      { email_confirm: true }
    );

    if (adminError) {
      console.error("[VERIFY-CODE] Error confirming email:", adminError);
      throw adminError;
    }

    console.log("[VERIFY-CODE] Email confirmed successfully for user:", verificationCode.user_id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Email confirmado com sucesso!" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[VERIFY-CODE] Error:", error);
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
