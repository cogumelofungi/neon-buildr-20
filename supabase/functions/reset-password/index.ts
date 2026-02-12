import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  email: string;
  token: string;
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

    const { email, token, newPassword }: ResetPasswordRequest = await req.json();

    const normalizedEmail = (email || "").toLowerCase().trim();
    const normalizedToken = (token || "").trim();
    console.log(`[RESET-PASSWORD] Resetting password for: ${normalizedEmail}`);
    console.log(`[RESET-PASSWORD] Token: ${normalizedToken.substring(0, 8)}...`);

    // Buscar token válido na tabela password_reset_tokens
    // 1) Tentativa padrão (email + token)
    // 2) Fallback: apenas token (evita falha caso o email da URL esteja diferente)
    // 3) Fallback legado: pending_users (links antigos antes da migração)
    let tokenRow: any | null = null;
    let tokenSource: "password_reset_tokens" | "pending_users" = "password_reset_tokens";

    const { data: byEmailAndToken, error: byEmailAndTokenError } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("token", normalizedToken)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (byEmailAndTokenError) {
      console.error("[RESET-PASSWORD] Error fetching token (email+token):", byEmailAndTokenError);
    }

    tokenRow = byEmailAndToken ?? null;

    if (!tokenRow) {
      const { data: byTokenOnly, error: byTokenOnlyError } = await supabase
        .from("password_reset_tokens")
        .select("*")
        .eq("token", normalizedToken)
        .is("used_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (byTokenOnlyError) {
        console.error("[RESET-PASSWORD] Error fetching token (token-only):", byTokenOnlyError);
      }

      tokenRow = byTokenOnly ?? null;
    }

    // Fallback legado: tokens salvos em pending_users (antes da tabela password_reset_tokens)
    if (!tokenRow) {
      const { data: legacyRow, error: legacyError } = await supabase
        .from("pending_users")
        .select("*")
        .eq("email", normalizedEmail)
        .eq("token", normalizedToken)
        .eq("plan_name", "password_reset")
        .is("used_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (legacyError) {
        console.error("[RESET-PASSWORD] Error fetching legacy token (pending_users):", legacyError);
      }

      if (legacyRow) {
        tokenRow = legacyRow;
        tokenSource = "pending_users";
      }
    }

    if (!tokenRow) {
      console.error("[RESET-PASSWORD] Token not found or already used");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Link inválido ou já utilizado. Solicite um novo link de redefinição.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verificar se expirou
    const now = new Date();
    const expiresAt = new Date(tokenRow.expires_at);
    
    console.log(`[RESET-PASSWORD] Now: ${now.toISOString()}, Expires: ${expiresAt.toISOString()}`);
    
    if (now > expiresAt) {
      console.error("[RESET-PASSWORD] Token expired");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Link expirado. Solicite um novo link de redefinição." 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Se o token veio do fallback token-only, usamos o email salvo no token como fonte de verdade
    const effectiveEmail = (tokenRow.email || normalizedEmail).toLowerCase().trim();

    // Buscar usuário pelo email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    
    if (userError) {
      console.error("[RESET-PASSWORD] Error listing users:", userError);
      throw userError;
    }

    const user = userData.users.find(u => u.email?.toLowerCase() === effectiveEmail);
    
    if (!user) {
      console.error("[RESET-PASSWORD] User not found for email:", effectiveEmail);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Usuário não encontrado." 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`[RESET-PASSWORD] Updating password for user_id: ${user.id}`);

    // Atualizar senha do usuário (respeitando as regras do Supabase)
    const { error: updateUserError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateUserError) {
      // Não marcar token como usado se falhar
      const msg = (updateUserError as any)?.message || "Erro ao atualizar senha";
      console.error("[RESET-PASSWORD] Error updating password:", updateUserError);

      // Mensagem amigável para o caso mais comum
      if (msg.toLowerCase().includes("weak") || msg.toLowerCase().includes("pwned") || msg.toLowerCase().includes("least 8")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Senha muito fraca. Use pelo menos 8 caracteres e evite senhas comuns.",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: msg,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Marcar token como usado APÓS atualizar a senha
    const usedAtValue = new Date().toISOString();
    const { error: updateTokenError } = await supabase
      .from(tokenSource)
      .update({ used_at: usedAtValue })
      .eq("id", tokenRow.id);

    if (updateTokenError) {
      console.error("[RESET-PASSWORD] Error updating token:", updateTokenError);
      // Continuar mesmo com erro, pois a senha já foi atualizada
    }

    console.log("[RESET-PASSWORD] Password updated successfully");

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
    console.error("[RESET-PASSWORD] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Erro interno do servidor"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
