import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-PASSWORD-SETUP-EMAIL] ${step}${detailsStr}`);
};

interface PasswordSetupEmailRequest {
  email: string;
  planName: string;
  token: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { email, planName, token }: PasswordSetupEmailRequest = await req.json();
    
    if (!email || !token) {
      throw new Error("Email and token are required");
    }

    logStep("Sending password setup email", { email, planName });

    // Remove trailing slash from SITE_URL to avoid double slashes
    const siteUrl = (Deno.env.get("SITE_URL") || "https://migrabook.app").replace(/\/$/, '');
    const setupLink = `${siteUrl}/configurar-senha?token=${token}&email=${encodeURIComponent(email)}`;
    
    logStep("Generated setup link", { siteUrl, setupLink });

    const emailResponse = await resend.emails.send({
      from: "MigraBook <noreply@migrabook.app>",
      to: [email],
      subject: "Configure sua senha para acessar o MigraBook",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h1 style="color: #2563eb; font-size: 24px; font-weight: bold; margin: 0 0 24px 0;">Configure sua senha</h1>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Sua assinatura do plano <strong style="color: #2563eb;">${planName}</strong> foi confirmada com sucesso.
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Para acessar sua conta, clique no botão abaixo e crie sua senha:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${setupLink}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Configurar Senha
                </a>
              </div>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 20px;">
                Após criar sua senha, você já será direcionado ao painel do MigraBook.
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 30px;">
                Atenciosamente,<br>
                <strong>Equipe MigraBook</strong>
              </p>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 24px;">
                P.S. Se você não reconhece este acesso, pode ignorar este email.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                © 2026 MigraBook. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    logStep("Email sent successfully", { emailResponse });

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
