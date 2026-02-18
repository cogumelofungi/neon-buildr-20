import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPasswordResetRequest {
  email: string;
  code: string;
  newPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, code, newPassword }: VerifyPasswordResetRequest = await req.json();

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[VERIFY-PASSWORD-RESET] Verifying code for: ${normalizedEmail}`);
    console.log(`[VERIFY-PASSWORD-RESET] Code received: ${code}`);

    // Buscar código válido usando ilike para case-insensitive
    const { data: verificationCodes, error: fetchError } = await supabase
      .from("verification_codes")
      .select("*")
      .ilike("email", normalizedEmail)
      .eq("code", code)
      .eq("is_used", false)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("[VERIFY-PASSWORD-RESET] Error fetching code:", fetchError);
      throw fetchError;
    }

    console.log(`[VERIFY-PASSWORD-RESET] Found codes:`, verificationCodes?.length || 0);

    const verificationCode = verificationCodes?.[0];

    if (!verificationCode) {
      console.error("[VERIFY-PASSWORD-RESET] Code not found or already used");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Código inválido ou já utilizado" 
        }),
        {
          status: 200, // Return 200 so Supabase client can parse the response body
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verificar se expirou
    const now = new Date();
    const expiresAt = new Date(verificationCode.expires_at);
    
    console.log(`[VERIFY-PASSWORD-RESET] Now: ${now.toISOString()}, Expires: ${expiresAt.toISOString()}`);
    
    if (now > expiresAt) {
      console.error("[VERIFY-PASSWORD-RESET] Code expired");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Código expirado. Solicite um novo código." 
        }),
        {
          status: 200, // Return 200 so Supabase client can parse the response body
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
      console.error("[VERIFY-PASSWORD-RESET] Error updating code:", updateError);
      throw updateError;
    }

    console.log(`[VERIFY-PASSWORD-RESET] Updating password for user_id: ${verificationCode.user_id}`);

    // Atualizar senha do usuário
    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      verificationCode.user_id,
      { password: newPassword }
    );

    if (passwordError) {
      console.error("[VERIFY-PASSWORD-RESET] Error updating password:", passwordError);
      
      // Tratar erro de senha fraca especificamente
      if (passwordError.message?.includes("weak") || passwordError.message?.includes("easy to guess")) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Senha muito fraca. Use uma senha mais forte com letras, números e símbolos."
          }),
          {
            status: 200, // Return 200 so Supabase client can parse the response body
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      throw passwordError;
    }

    console.log("[VERIFY-PASSWORD-RESET] Password updated successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Senha alterada com sucesso!" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[VERIFY-PASSWORD-RESET] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Erro interno do servidor"
      }),
      {
        // IMPORTANTE: sempre retornar 200 para que o frontend consiga ler o JSON
        // e para evitar o "Runtime error" do monitoramento quando houver erro de validação.
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
