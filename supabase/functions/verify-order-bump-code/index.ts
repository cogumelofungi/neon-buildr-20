import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, orderBumpId } = await req.json();

    console.log("🔐 [ORDER BUMP] Verificando código:", { code, orderBumpId });

    if (!code || !orderBumpId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Código e orderBumpId são obrigatórios",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar o código de acesso com todos os dados do order bump
    const { data: accessCode, error: codeError } = await supabase
      .from("order_bump_access_codes")
      .select(`
        *,
        order_bumps!inner(*)
      `)
      .eq("access_code", code.toUpperCase())
      .eq("order_bump_id", orderBumpId)
      .single();

    if (codeError || !accessCode) {
      console.log("❌ [ORDER BUMP] Código não encontrado:", codeError?.message);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Código de acesso inválido",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se o order bump está ativo
    if (!accessCode.order_bumps?.is_active) {
      console.log("❌ [ORDER BUMP] Order bump inativo");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Este conteúdo não está mais disponível",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se o código já foi usado
    if (accessCode.is_used) {
      // Se já foi usado, ainda permitir acesso (o código é do mesmo usuário)
      console.log("ℹ️ [ORDER BUMP] Código já utilizado, permitindo acesso novamente");
      return new Response(
        JSON.stringify({
          success: true,
          orderBump: accessCode.order_bumps,
          message: "Conteúdo liberado",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Marcar código como usado
    const { error: updateError } = await supabase
      .from("order_bump_access_codes")
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
      })
      .eq("id", accessCode.id);

    if (updateError) {
      console.error("⚠️ [ORDER BUMP] Erro ao marcar código como usado:", updateError);
      // Continuar mesmo com erro - não bloquear o usuário
    }

    console.log("✅ [ORDER BUMP] Código validado com sucesso:", {
      codeId: accessCode.id,
      orderBumpId,
      buyerEmail: accessCode.buyer_email,
    });

    return new Response(
      JSON.stringify({
        success: true,
        orderBump: accessCode.order_bumps,
        message: "Conteúdo desbloqueado com sucesso!",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("💥 [ORDER BUMP] Erro:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Erro ao verificar código",
        error: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
