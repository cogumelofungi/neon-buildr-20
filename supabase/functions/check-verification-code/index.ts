import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CheckVerificationCodeRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email }: CheckVerificationCodeRequest = await req.json();

    console.log(`[CHECK-VERIFICATION-CODE] Checking for valid code for email: ${email}`);

    // Buscar código válido (não usado e não expirado)
    const now = new Date().toISOString();
    
    const { data: verificationCode, error: fetchError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("email", email)
      .eq("is_used", false)
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("[CHECK-VERIFICATION-CODE] Error fetching code:", fetchError);
      throw fetchError;
    }

    if (verificationCode) {
      console.log(`[CHECK-VERIFICATION-CODE] Valid code found for email: ${email}`);
      return new Response(
        JSON.stringify({ 
          hasValidCode: true,
          expiresAt: verificationCode.expires_at
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`[CHECK-VERIFICATION-CODE] No valid code found for email: ${email}`);
    return new Response(
      JSON.stringify({ 
        hasValidCode: false
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[CHECK-VERIFICATION-CODE] Error:", error);
    return new Response(
      JSON.stringify({ 
        hasValidCode: false,
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
