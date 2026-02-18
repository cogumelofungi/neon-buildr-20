import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const emailTemplates = {
  "pt-br": {
    subject: (appName: string) => `Seu acesso ao app ${appName}`,
    html: (buyerName: string, appName: string, appLink: string) => `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4f46e5; font-size: 32px; margin: 0 0 10px 0;">Olá ${buyerName}!</h1>
              </div>
              
              <p style="font-size: 18px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                Obrigado pela sua compra do app <strong style="color: #4f46e5;">${appName}</strong></p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #6b7280; margin-bottom: 30px;">
                Aqui está o seu acesso:
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${appLink}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                          color: white;
                          padding: 18px 40px;
                          text-decoration: none;
                          border-radius: 12px;
                          font-weight: bold;
                          font-size: 18px;
                          display: inline-block;
                          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                          transition: transform 0.2s;">
                  Clique aqui para abrir o app
                </a>
              </div>
              
              <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
                          border-left: 4px solid #4f46e5; 
                          padding: 20px; 
                          border-radius: 8px; 
                          margin: 30px 0;">
                <p style="margin: 0; font-size: 15px; color: #1f2937; line-height: 1.6;">
                  <strong>Dica Importante:</strong> Salve este link nos seus favoritos do navegador ou adicione à tela inicial do seu celular para acessar sempre que quiser!
                </p>
              </div>
              
              <div style="background: #fef3c7; 
                          border-left: 4px solid #f59e0b; 
                          padding: 16px; 
                          border-radius: 8px; 
                          margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>Acesse de qualquer dispositivo:</strong> Este link funciona no computador, tablet e celular!
                </p>
              </div>
              
              <hr style="border: none; border-top: 2px solid #e5e7eb; margin: 40px 0;">
              
              <div style="text-align: center;">
                <p style="font-size: 14px; color: #9ca3af; margin: 10px 0;">
                  <strong style="color: #6b7280;">MigraBook</strong><br>
                  Clique aqui para abrir o app
                </p>
                <p style="font-size: 12px; color: #d1d5db; margin: 5px 0;">
                  © 2026 MigraBook. Todos os direitos reservados.
                </p>
              </div>
              
            </div>
          </div>
        </body>
      </html>
    `,
  },

  "en-us": {
    subject: (appName: string) => `Your access to app ${appName}`,
    html: (buyerName: string, appName: string, appLink: string) => `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4f46e5; font-size: 32px; margin: 0 0 10px 0;">Hello ${buyerName}!</h1>
              </div>
              
              <p style="font-size: 18px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                Thank you for purchasing <strong style="color: #4f46e5;">${appName}</strong>
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #6b7280; margin-bottom: 30px;">
                Here is your access:
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${appLink}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                          color: white;
                          padding: 18px 40px;
                          text-decoration: none;
                          border-radius: 12px;
                          font-weight: bold;
                          font-size: 18px;
                          display: inline-block;
                          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);">
                  Click here to open the app
                </a>
              </div>
              
              <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
                          border-left: 4px solid #4f46e5; 
                          padding: 20px; 
                          border-radius: 8px; 
                          margin: 30px 0;">
                <p style="margin: 0; font-size: 15px; color: #1f2937; line-height: 1.6;">
                  <strong>Important Tip:</strong> Save this link to your browser bookmarks or add it to your phone's home screen for easy access anytime!
                </p>
              </div>
              
              <div style="background: #fef3c7; 
                          border-left: 4px solid #f59e0b; 
                          padding: 16px; 
                          border-radius: 8px; 
                          margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>Access from any device:</strong> This link works on computer, tablet, and mobile!
                </p>
              </div>
              
              <hr style="border: none; border-top: 2px solid #e5e7eb; margin: 40px 0;">
              
              <div style="text-align: center;">
                <p style="font-size: 14px; color: #9ca3af; margin: 10px 0;">
                  <strong style="color: #6b7280;">MigraBook</strong><br>
                  Click here to open the app
                </p>
                <p style="font-size: 12px; color: #d1d5db; margin: 5px 0;">
                  © 2026 MigraBook. All rights reserved.
                </p>
              </div>
              
            </div>
          </div>
        </body>
      </html>
    `,
  },

  es: {
    subject: (appName: string) => `Tu acceso a app ${appName}`,
    html: (buyerName: string, appName: string, appLink: string) => `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4f46e5; font-size: 32px; margin: 0 0 10px 0;">¡Hola ${buyerName}!</h1>
              </div>
              
              <p style="font-size: 18px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                Gracias por tu compra de <strong style="color: #4f46e5;">${appName}</strong>
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #6b7280; margin-bottom: 30px;">
                Aquí está tu acceso:
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${appLink}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                          color: white;
                          padding: 18px 40px;
                          text-decoration: none;
                          border-radius: 12px;
                          font-weight: bold;
                          font-size: 18px;
                          display: inline-block;
                          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);">
                  Haz clic aquí para abrir la app
                </a>
              </div>
              
              <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
                          border-left: 4px solid #4f46e5; 
                          padding: 20px; 
                          border-radius: 8px; 
                          margin: 30px 0;">
                <p style="margin: 0; font-size: 15px; color: #1f2937; line-height: 1.6;">
                  <strong>Consejo Importante:</strong> ¡Guarda este enlace en los favoritos de tu navegador o añádelo a la pantalla de inicio de tu móvil para acceder siempre que quieras!
                </p>
              </div>
              
              <div style="background: #fef3c7; 
                          border-left: 4px solid #f59e0b; 
                          padding: 16px; 
                          border-radius: 8px; 
                          margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>Accede desde cualquier dispositivo:</strong> ¡Este enlace funciona en computadora, tablet y móvil!
                </p>
              </div>
              
              <hr style="border: none; border-top: 2px solid #e5e7eb; margin: 40px 0;">
              
              <div style="text-align: center;">
                <p style="font-size: 14px; color: #9ca3af; margin: 10px 0;">
                  <strong style="color: #6b7280;">MigraBook</strong><br>
                  Haz clic aquí para abrir la app
                </p>
                <p style="font-size: 12px; color: #d1d5db; margin: 5px 0;">
                  © 2026 MigraBook. Todos los derechos reservados.
                </p>
              </div>
              
            </div>
          </div>
        </body>
      </html>
    `,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📧 [EMAIL] Iniciando processamento...");

    const { buyerName, buyerEmail, language, appName, appLink, purchaseId } = await req.json();

    console.log("📧 [EMAIL] Dados recebidos:", {
      buyerName,
      buyerEmail,
      language,
      appName,
      appLink: appLink.substring(0, 30) + "...",
      purchaseId,
    });

    // Validar dados obrigatórios
    if (!buyerName || !buyerEmail || !appName || !appLink) {
      throw new Error("Dados obrigatórios ausentes: buyerName, buyerEmail, appName ou appLink");
    }

    // Selecionar template baseado no idioma
    const selectedLanguage = ["pt-br", "en-us", "es"].includes(language) ? language : "pt-br";
    const template = emailTemplates[selectedLanguage as keyof typeof emailTemplates];

    console.log("🌐 [EMAIL] Idioma selecionado:", selectedLanguage);

    // Enviar email via Resend
    const { data, error } = await resend.emails.send({
      from: "MigraBook <acesso@migrabook.app>",
      to: [buyerEmail],
      subject: template.subject(appName),
      html: template.html(buyerName, appName, appLink),
      tags: [
        { name: "category", value: "access-email" },
        { name: "language", value: selectedLanguage },
        { name: "purchase_id", value: purchaseId || "unknown" },
      ],
    });

    if (error) {
      console.error("❌ [EMAIL] Erro do Resend:", error);
      throw error;
    }

    console.log("✅ [EMAIL] Enviado com sucesso:", {
      emailId: data?.id,
      to: buyerEmail,
      subject: template.subject(appName),
    });

    return new Response(
      JSON.stringify({
        success: true,
        emailId: data?.id,
        message: "Email enviado com sucesso",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("💥 [EMAIL] Erro fatal:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString(),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
