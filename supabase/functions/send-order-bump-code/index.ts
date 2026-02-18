import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const emailTemplates = {
  "pt-br": {
    subject: (accessCode: string) => `Parabéns pela compra! Seu código de acesso: ${accessCode}`,
    html: (buyerName: string, orderBumpLabel: string, accessCode: string, appLink: string | null) => `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                Para liberar o conteúdo <strong>${orderBumpLabel}</strong> dentro do app, é simples:
              </p>
              
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 0;">
                <strong>1. Copie o código</strong>
              </p>
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                Selecione o código abaixo e copie
              </p>
              <p style="font-size: 18px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                <strong style="font-family: monospace; letter-spacing: 2px;">${accessCode}</strong>
              </p>
              
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 0;">
                <strong>2. Acesse o aplicativo</strong>
              </p>
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                ${appLink ? `Clique no link abaixo para abrir o app.<br><a href="${appLink}" style="color: #4f46e5; text-decoration: none;"><strong>Acessar App &gt;&gt;</strong></a>` : 'Acesse o app que você já possui.'}
              </p>
              
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 0;">
                <strong>3. Insira o código e pronto</strong>
              </p>
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 30px;">
                Dentro do app, cole o código no campo de desbloqueio
              </p>
              
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                Bom uso!
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                Equipe MigraBook
              </p>
              
            </div>
          </div>
        </body>
      </html>
    `,
  },

  "en-us": {
    subject: (accessCode: string) => `Congratulations on your purchase! Your access code: ${accessCode}`,
    html: (buyerName: string, orderBumpLabel: string, accessCode: string, appLink: string | null) => `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                To unlock the content <strong>${orderBumpLabel}</strong> inside the app, it's simple:
              </p>
              
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 0;">
                <strong>1. Copy the code</strong>
              </p>
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                Select the code below and copy it
              </p>
              <p style="font-size: 18px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                <strong style="font-family: monospace; letter-spacing: 2px;">${accessCode}</strong>
              </p>
              
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 0;">
                <strong>2. Access the app</strong>
              </p>
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                ${appLink ? `Click the link below to open the app.<br><a href="${appLink}" style="color: #4f46e5; text-decoration: none;"><strong>Access App &gt;&gt;</strong></a>` : 'Access the app you already own.'}
              </p>
              
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 0;">
                <strong>3. Enter the code and you're done</strong>
              </p>
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 30px;">
                Inside the app, paste the code in the unlock field
              </p>
              
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                Enjoy!
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                MigraBook Team
              </p>
              
            </div>
          </div>
        </body>
      </html>
    `,
  },

  es: {
    subject: (accessCode: string) => `Felicidades por tu compra! Tu código de acceso: ${accessCode}`,
    html: (buyerName: string, orderBumpLabel: string, accessCode: string, appLink: string | null) => `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                Para liberar el contenido <strong>${orderBumpLabel}</strong> dentro de la app, es sencillo:
              </p>
              
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 0;">
                <strong>1. Copia el código</strong>
              </p>
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                Selecciona el código de abajo y cópialo
              </p>
              <p style="font-size: 18px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                <strong style="font-family: monospace; letter-spacing: 2px;">${accessCode}</strong>
              </p>
              
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 0;">
                <strong>2. Accede a la aplicación</strong>
              </p>
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                ${appLink ? `Haz clic en el enlace de abajo para abrir la app.<br><a href="${appLink}" style="color: #4f46e5; text-decoration: none;"><strong>Acceder App &gt;&gt;</strong></a>` : 'Accede a la app que ya tienes.'}
              </p>
              
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 0;">
                <strong>3. Ingresa el código y listo</strong>
              </p>
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 30px;">
                Dentro de la app, pega el código en el campo de desbloqueo
              </p>
              
              <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 20px;">
                Buen uso!
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                Equipo MigraBook
              </p>
              
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
    console.log("📧 [ORDER BUMP EMAIL] Iniciando processamento...");

    const { buyerName, buyerEmail, language, orderBumpLabel, accessCode, appLink } = await req.json();

    console.log("📧 [ORDER BUMP EMAIL] Dados recebidos:", {
      buyerName,
      buyerEmail,
      language,
      orderBumpLabel,
      accessCode,
      appLink,
    });

    // Validar dados obrigatórios
    if (!buyerName || !buyerEmail || !orderBumpLabel || !accessCode) {
      throw new Error("Dados obrigatórios ausentes");
    }

    // Selecionar template baseado no idioma
    const selectedLanguage = ["pt-br", "en-us", "es"].includes(language) ? language : "pt-br";
    const template = emailTemplates[selectedLanguage as keyof typeof emailTemplates];

    console.log("🌐 [ORDER BUMP EMAIL] Idioma selecionado:", selectedLanguage);
    console.log("🔗 [ORDER BUMP EMAIL] Link do app:", appLink || "(não configurado)");

    // Enviar email via Resend
    const { data, error } = await resend.emails.send({
      from: "MigraBook <acesso@migrabook.app>",
      to: [buyerEmail],
      subject: template.subject(accessCode),
      html: template.html(buyerName, orderBumpLabel, accessCode, appLink || null),
      tags: [
        { name: "category", value: "order-bump-code" },
        { name: "language", value: selectedLanguage },
      ],
    });

    if (error) {
      console.error("❌ [ORDER BUMP EMAIL] Erro do Resend:", error);
      throw error;
    }

    console.log("✅ [ORDER BUMP EMAIL] Enviado com sucesso:", {
      emailId: data?.id,
      to: buyerEmail,
      accessCode,
      hasAppLink: !!appLink,
    });

    return new Response(
      JSON.stringify({
        success: true,
        emailId: data?.id,
        message: "Email com código enviado com sucesso",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("💥 [ORDER BUMP EMAIL] Erro fatal:", {
      message: error.message,
      stack: error.stack,
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
