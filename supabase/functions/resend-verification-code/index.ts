import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResendVerificationCodeRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { email }: ResendVerificationCodeRequest = await req.json();

    console.log(`[RESEND-VERIFICATION-CODE] Resending code for email: ${email}`);

    // Buscar usuário pelo email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("[RESEND-VERIFICATION-CODE] Error listing users:", userError);
      throw userError;
    }

    const user = userData.users.find(u => u.email === email);
    
    if (!user) {
      console.error("[RESEND-VERIFICATION-CODE] User not found for email:", email);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Usuário não encontrado" 
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Invalidar códigos anteriores
    await supabase
      .from("verification_codes")
      .update({ is_used: true })
      .eq("email", email)
      .eq("is_used", false);

    // Gerar novo código de verificação de 5 dígitos
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Expira em 30 minutos

    console.log(`[RESEND-VERIFICATION-CODE] Generated new verification code for: ${email}`);

    // Salvar código na tabela verification_codes
    const { error: codeError } = await supabase
      .from("verification_codes")
      .insert({
        user_id: user.id,
        email: email,
        code: verificationCode,
        expires_at: expiresAt.toISOString(),
        is_used: false,
      });

    if (codeError) {
      console.error("[RESEND-VERIFICATION-CODE] Error saving verification code:", codeError);
      throw codeError;
    }

    // Buscar nome do usuário
    const userName = user.user_metadata?.full_name || user.user_metadata?.name || "Usuário";

    // Enviar email com o código
    const emailResponse = await resend.emails.send({
      from: "MigraBook <noreply@migrabook.com>",
      to: [email],
      subject: "Seu código de verificação - MigraBook",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <tr>
              <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #2054DE 0%, #1a45b8 100%);">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">MigraBook</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; font-weight: 600;">Olá, ${userName}!</h2>
                <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                  Você solicitou um novo código de verificação. Use o código abaixo para confirmar seu email:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <div style="display: inline-block; background: linear-gradient(135deg, #2054DE 0%, #1a45b8 100%); padding: 20px 40px; border-radius: 12px;">
                    <span style="font-size: 36px; font-weight: bold; color: #ffffff; letter-spacing: 8px;">${verificationCode}</span>
                  </div>
                </div>
                <p style="margin: 0 0 10px; color: #52525b; font-size: 14px; line-height: 1.6; text-align: center;">
                  Este código expira em <strong>30 minutos</strong>.
                </p>
                <p style="margin: 20px 0 0; color: #a1a1aa; font-size: 13px; line-height: 1.6;">
                  Se você não solicitou este código, ignore este email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px; background-color: #f4f4f5; text-align: center;">
                <p style="margin: 0; color: #71717a; font-size: 12px;">
                  © 2024 MigraBook. Todos os direitos reservados.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("[RESEND-VERIFICATION-CODE] Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Novo código enviado com sucesso!" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[RESEND-VERIFICATION-CODE] Error:", error);
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
