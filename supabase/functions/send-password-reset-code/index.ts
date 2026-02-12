import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendPasswordResetCodeRequest {
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

    const { email }: SendPasswordResetCodeRequest = await req.json();

    console.log(`[SEND-PASSWORD-RESET] Sending code to: ${email}`);

    // Buscar usuário pelo email usando listUsers com filtro
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    
    if (userError) {
      console.error("[SEND-PASSWORD-RESET] Error listing users:", userError);
      throw userError;
    }

    // Busca case-insensitive
    const user = userData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.error("[SEND-PASSWORD-RESET] User not found for email:", email);
      // Retornar 200 com errorCode para o frontend tratar
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

    console.log("[SEND-PASSWORD-RESET] User found:", user.id);

    // Gerar código de 5 dígitos
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Expira em 30 minutos

    console.log(`[SEND-PASSWORD-RESET] Generated code: ${verificationCode}`);

    // Salvar código na tabela verification_codes (email normalizado)
    const normalizedEmail = email.toLowerCase().trim();
    const { error: codeError } = await supabase
      .from("verification_codes")
      .insert({
        user_id: user.id,
        email: normalizedEmail,
        code: verificationCode,
        expires_at: expiresAt.toISOString(),
        is_used: false,
      });

    if (codeError) {
      console.error("[SEND-PASSWORD-RESET] Error saving code:", codeError);
      throw codeError;
    }

    // Buscar nome do usuário
    const fullName = user.user_metadata?.full_name || "Usuário";

    // Enviar email via Resend
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Recuperação de Senha</h1>
            </div>
            <div class="content">
              <h2>Olá, ${fullName}!</h2>
              <p>Recebemos uma solicitação para redefinir a senha da sua conta. Utilize o código abaixo para continuar:</p>
              
              <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Código de Recuperação</p>
                <h1 style="margin: 0; font-size: 42px; letter-spacing: 8px; color: #667eea; font-weight: bold;">${verificationCode}</h1>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Válido por 30 minutos</p>
              </div>
              
              <p><strong>Importante:</strong> Este código expira em 30 minutos e só pode ser usado uma vez.</p>
              
              <p><strong>Não solicitou esta recuperação?</strong><br>
              Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanecerá inalterada.</p>
              
              <p>Atenciosamente,<br>
              <strong>Equipe MigraBook</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 MigraBook. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "MigraBook <suporte@migrabook.app>",
      to: [email],
      subject: "Código de Recuperação de Senha - MigraBook",
      html: emailHtml,
    });

    if (emailError) {
      console.error("[SEND-PASSWORD-RESET] Error sending email:", emailError);
      throw emailError;
    }

    console.log("[SEND-PASSWORD-RESET] Email sent successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Código enviado com sucesso!",
        userId: user.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[SEND-PASSWORD-RESET] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        errorCode: "server_error"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
