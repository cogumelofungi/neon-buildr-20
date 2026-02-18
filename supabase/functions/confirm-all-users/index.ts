import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONFIRM-ALL-USERS] ${step}${detailsStr}`);
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting confirmation of all unconfirmed users");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Listar todos os usuários
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
      perPage: 1000, // Ajustar conforme necessário
    });

    if (listError) {
      logStep("Error listing users", { error: listError.message });
      throw listError;
    }

    const users = usersData.users || [];
    logStep(`Found ${users.length} total users`);

    // Filtrar usuários não confirmados
    const unconfirmedUsers = users.filter(user => !user.email_confirmed_at);
    logStep(`Found ${unconfirmedUsers.length} unconfirmed users`);

    if (unconfirmedUsers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No unconfirmed users found",
          confirmed: 0,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    let confirmedCount = 0;
    const errors: { email: string; error: string }[] = [];

    // Confirmar cada usuário
    for (const user of unconfirmedUsers) {
      try {
        logStep(`Confirming user`, { email: user.email, id: user.id });
        
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          { email_confirm: true }
        );

        if (updateError) {
          logStep(`Error confirming user`, { email: user.email, error: updateError.message });
          errors.push({ email: user.email || user.id, error: updateError.message });
        } else {
          confirmedCount++;
          logStep(`User confirmed`, { email: user.email });
        }
      } catch (err: any) {
        logStep(`Exception confirming user`, { email: user.email, error: err.message });
        errors.push({ email: user.email || user.id, error: err.message });
      }
    }

    logStep(`Confirmation complete`, { confirmed: confirmedCount, errors: errors.length });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Confirmed ${confirmedCount} of ${unconfirmedUsers.length} users`,
        confirmed: confirmedCount,
        total: unconfirmedUsers.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
