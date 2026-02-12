import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Validar token do usuário autenticado
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Cliente para validar o usuário
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("Token inválido:", claimsError);
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    // 2. Receber body
    const { verification_code } = await req.json();

    if (!verification_code || typeof verification_code !== "string") {
      return new Response(
        JSON.stringify({ error: "verification_code obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Usar service role para buscar e atualizar
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar domínio pelo verification_code
    const { data: domains, error: searchError } = await adminClient
      .from("custom_domains")
      .select("*")
      .eq("verification_code", verification_code.trim())
      .limit(1);

    if (searchError) {
      console.error("Erro ao buscar domínio:", searchError);
      throw searchError;
    }

    if (!domains || domains.length === 0) {
      return new Response(
        JSON.stringify({ error: "Token de verificação inválido" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const domain = domains[0];

    // Verificar se já está vinculado a outro usuário
    if (domain.user_id && domain.user_id !== userId && domain.is_verified) {
      return new Response(
        JSON.stringify({ error: "Domínio já vinculado a outra conta" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Atualizar o domínio usando service role (ignora RLS)
    const { data: updated, error: updateError } = await adminClient
      .from("custom_domains")
      .update({
        user_id: userId,
        is_verified: true,
        dns_verified: true,
        status: "active",
      })
      .eq("id", domain.id)
      .select()
      .single();

    if (updateError) {
      console.error("Erro ao atualizar domínio:", updateError);
      throw updateError;
    }

    console.log(`Domínio ${domain.domain} vinculado ao usuário ${userEmail}`);

    return new Response(
      JSON.stringify({
        success: true,
        domain: {
          id: updated.id,
          domain: updated.domain,
          verification_code: updated.verification_code,
          is_verified: updated.is_verified,
          status: updated.status,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro em claim-domain:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
