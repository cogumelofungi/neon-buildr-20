import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendPasswordResetLinkRequest {
  email: string;
  redirectUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, redirectUrl }: SendPasswordResetLinkRequest = await req.json();

    console.log(`[SEND-PASSWORD-RESET-LINK] Sending link to: ${email}`);

    // Buscar usuário pelo email usando listUsers com filtro
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    
    if (userError) {
      console.error("[SEND-PASSWORD-RESET-LINK] Error listing users:", userError);
      throw userError;
    }

    // Busca case-insensitive
    const user = userData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.error("[SEND-PASSWORD-RESET-LINK] User not found for email:", email);
      return new Response(
        JSON.stringify({ 
          success: false, 
          errorCode: "user_not_found"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("[SEND-PASSWORD-RESET-LINK] User found:", user.id);

    // Gerar token único para reset
    const resetToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expira em 1 hora

    console.log(`[SEND-PASSWORD-RESET-LINK] Generated token: ${resetToken.substring(0, 8)}...`);

    // Salvar token na nova tabela password_reset_tokens (evita conflito de UNIQUE email em pending_users)
    const normalizedEmail = email.toLowerCase().trim();

    // Inserir novo token (múltiplos tokens válidos por até 1h permitem links atrasados funcionarem)
    const { error: tokenError } = await supabase
      .from("password_reset_tokens")
      .insert({
        email: normalizedEmail,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error("[SEND-PASSWORD-RESET-LINK] Error saving token:", tokenError);
      throw tokenError;
    }

    // Buscar nome do usuário
    const fullName = user.user_metadata?.full_name || "Usuário";

    // Construir URL de reset - sempre usar o domínio personalizado do MigraBook
    const baseUrl = "https://migrabook.app";
    const resetLink = `${baseUrl}/redefinir-senha?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // Enviar email via Resend
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .header h1 { color: #667eea; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 10px; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: #ffffff !important; 
              text-decoration: none; 
              padding: 16px 32px; 
              border-radius: 8px; 
              font-weight: bold; 
              font-size: 16px;
            }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .note { background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MigraBook</h1>
            </div>
            <div class="content">
              <h2>Olá, ${fullName}!</h2>
              <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
              <p>Clique no botão abaixo para criar uma nova senha:</p>
              
              <div class="button-container">
                <a href="${resetLink}" class="button" style="color: #ffffff;">
                  Redefinir Minha Senha
                </a>
              </div>
              
              <div class="note">
                <p style="margin: 0;"><strong>⏰ Este link expira em 1 hora.</strong></p>
                <p style="margin: 10px 0 0 0;">Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanecerá inalterada.</p>
              </div>
              
              <p style="margin-top: 20px;">Atenciosamente,<br>
              <strong>Equipe MigraBook</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 MigraBook. Todos os direitos reservados.</p>
              <p style="font-size: 11px; color: #999;">
                Se o botão não funcionar, copie e cole este link no navegador:<br>
                <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "MigraBook <suporte@migrabook.app>",
      to: [email],
      subject: "Redefinir sua senha - MigraBook",
      html: emailHtml,
    });

    if (emailError) {
      console.error("[SEND-PASSWORD-RESET-LINK] Error sending email:", emailError);
      throw emailError;
    }

    console.log("[SEND-PASSWORD-RESET-LINK] Email sent successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Link de redefinição enviado com sucesso!"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[SEND-PASSWORD-RESET-LINK] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        errorCode: "server_error",
        error: error.message
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
