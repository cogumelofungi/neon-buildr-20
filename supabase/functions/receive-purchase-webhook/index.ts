// Force redeploy - v2.17.0 - Support nullable app_id with LEFT JOIN
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  decode as decodeBase64,
  encode as encodeBase64,
} from "https://deno.land/std@0.190.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from 'https://esm.sh/stripe@18.5.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const normalizeBase64Signature = (sig: string) => {
  let s = (sig || "").trim();
  // Alguns provedores prefixam (ex: sha256=...)
  s = s.replace(/^sha256=/i, "");
  // base64url -> base64
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  // padding
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  return s;
};

const timingSafeEqual = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
};

const normalizeSecretKey = (secret: string) => {
  let s = (secret || "").trim();
  // suportar formatos comuns
  if (s.toLowerCase().startsWith("hex:")) s = s.slice(4).trim();
  if (s.toLowerCase().startsWith("0x")) s = s.slice(2).trim();
  return s;
};

const isHexString = (value: string) => {
  const v = normalizeSecretKey(value);
  return v.length >= 8 && v.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(v);
};

const hexToBytes = (hex: string) => {
  const h = normalizeSecretKey(hex);
  const bytes = new Uint8Array(h.length / 2);
  for (let i = 0; i < h.length; i += 2) {
    bytes[i / 2] = parseInt(h.slice(i, i + 2), 16);
  }
  return bytes;
};

const signHmacSha256 = async (keyBytes: Uint8Array, messageBytes: Uint8Array) => {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, messageBytes.buffer as ArrayBuffer);
  return new Uint8Array(signature);
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 [VERSION] receive-purchase-webhook v2.19.0-KIWIFY-BRAIP-PERFECTPAY-FILTER");
    console.log("🔔 [WEBHOOK] Recebido em:", new Date().toISOString());

    // IMPORTANTE: Ler o body como BYTES primeiro para validação HMAC (sem re-encode)
    let rawBodyBytes: Uint8Array;
    let rawBody: string;
    let body: any;
    try {
      const rawBuffer = await req.arrayBuffer();
      rawBodyBytes = new Uint8Array(rawBuffer);
      rawBody = new TextDecoder().decode(rawBodyBytes);

      body = JSON.parse(rawBody);
      console.log("📦 [WEBHOOK] Body completo:", JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.warn("⚠️ [PARSE ERROR] Webhook não está em formato JSON válido");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON format",
          message: "Webhook ignorado: formato não suportado"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PASSO 1: Identificar plataforma
    const provider = identifyProvider(body);
    console.log("🏷️ [PROVIDER] Identificado:", provider);

    // 🎯 FILTRO PARA KIWIFY (processar apenas compras aprovadas)
    if (provider === "Kiwify") {
      const orderStatus = body.order_status || "";
      console.log("🟢 [KIWIFY] order_status recebido:", orderStatus);

      // Status válidos para processamento (pagamento confirmado)
      const VALID_STATUSES = ["paid", "completed", "approved"];
      
      if (!VALID_STATUSES.includes(orderStatus.toLowerCase())) {
        console.log("⏭️ [KIWIFY] Evento ignorado (pagamento não confirmado). order_status:", orderStatus);
        return new Response(
          JSON.stringify({
            success: true,
            ignored: true,
            order_status: orderStatus,
            message: "Evento não-final ignorado com sucesso. Apenas compras aprovadas/pagas são processadas.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      console.log("✅ [KIWIFY] Status válido para processamento:", orderStatus);
    }

    // 🎯 FILTRO PARA BRAIP (processar apenas vendas aprovadas/completas)
    if (provider === "Braip") {
      const braipStatus = (body.status || body.mat_status || "").toLowerCase();
      console.log("🎯 [BRAIP] Status recebido:", braipStatus);

      const VALID_STATUSES = ["aprovado", "approved", "completo", "completed", "pago", "paid"];
      
      if (!VALID_STATUSES.includes(braipStatus)) {
        console.log("⏭️ [BRAIP] Evento ignorado (status não-final):", braipStatus);
        return new Response(
          JSON.stringify({
            success: true,
            ignored: true,
            status: braipStatus,
            message: "Evento não-final ignorado com sucesso.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      console.log("✅ [BRAIP] Status válido para processamento:", braipStatus);
    }

    // 🎯 FILTRO PARA PERFECT PAY (processar apenas vendas aprovadas)
    if (provider === "Perfect Pay") {
      const ppStatus = (body.sale_status_enum || body.status || "").toLowerCase();
      console.log("🎯 [PERFECT PAY] Status recebido:", ppStatus);

      const VALID_STATUSES = ["approved", "completed", "paid", "aprovado", "completo"];
      
      if (!VALID_STATUSES.includes(ppStatus)) {
        console.log("⏭️ [PERFECT PAY] Evento ignorado (status não-final):", ppStatus);
        return new Response(
          JSON.stringify({
            success: true,
            ignored: true,
            status: ppStatus,
            message: "Evento não-final ignorado com sucesso.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      console.log("✅ [PERFECT PAY] Status válido para processamento:", ppStatus);
    }

    // 🎯 FILTRO PARA YAMPI (processar apenas vendas pagas/aprovadas)
    // IMPORTANTE: Precisa acontecer ANTES de normalizar, pois eventos como customer.created
    // não têm o mesmo formato e podem quebrar a normalização.
    if (provider === "Yampi") {
      const event = body?.event || "";
      console.log("🟣 [YAMPI] Evento recebido:", event);

      const VALID_EVENTS = ["order.paid", "order.approved"];
      if (!VALID_EVENTS.includes(event)) {
        console.log("⏭️ [YAMPI] Evento ignorado (não é pagamento confirmado):", event);
        return new Response(
          JSON.stringify({
            success: true,
            ignored: true,
            event,
            message:
              "Evento não-final ignorado com sucesso. Apenas order.paid e order.approved são processados.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      console.log("✅ [YAMPI] Evento válido para processamento:", event);
    }
    
    // 🧪 TRATAR WEBHOOK DE TESTE DA EDUZZ
    if (provider === "Eduzz" && body.event === "ping") {
      console.log("🧪 [EDUZZ] Webhook de teste (ping) recebido");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Webhook de teste recebido com sucesso",
          event: "ping"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PASSO 1.5: Filtrar eventos não-finais (Hotmart)
    if (provider === "Hotmart") {
      const event = body.event || "";
      const status = body.data?.purchase?.status || "";

      console.log("🎯 [HOTMART] Evento:", event, "| Status:", status);

      // Eventos que devemos IGNORAR (não são vendas finalizadas)
      const NON_FINAL_EVENTS = [
        "PURCHASE_WAITING_PAYMENT",
        "PURCHASE_BILLET_PRINTED",
        "PURCHASE_CREATED",
        "PURCHASE_REFUNDED",
        "PURCHASE_CANCELED",
        "PURCHASE_CHARGEBACK",
        "PURCHASE_DELAYED",
        "PURCHASE_PROTEST",
      ];

      if (NON_FINAL_EVENTS.includes(event)) {
        console.log("⏭️ [HOTMART] Evento ignorado (não-final):", event);
        return new Response(
          JSON.stringify({
            success: true,
            ignored: true,
            event,
            status,
            message: "Evento não-final ignorado com sucesso",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Eventos que PROCESSAMOS (vendas aprovadas)
      const FINAL_EVENTS = ["PURCHASE_COMPLETE", "PURCHASE_APPROVED"];

      if (!FINAL_EVENTS.includes(event)) {
        console.warn("⚠️ [HOTMART] Evento desconhecido:", event);
      }
    }

    // Filtro para Monetizze (processar apenas vendas finalizadas)
    if (provider === "Monetizze") {
      const tipoEvento = body.tipoEvento?.descricao || "";
      console.log("🎯 [MONETIZZE] Tipo de evento:", tipoEvento);

      // Processar APENAS vendas finalizadas/aprovadas
      if (tipoEvento !== "Finalizada / Aprovada") {
        console.log("⏭️ [MONETIZZE] Evento ignorado (não-final):", tipoEvento);
        return new Response(
          JSON.stringify({
            success: true,
            ignored: true,
            tipoEvento,
            message: "Evento não-final ignorado com sucesso",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // 🎯 FILTRO PARA EDUZZ (MyEduzz)
    if (provider === "Eduzz" && body.event?.startsWith("myeduzz.")) {
      const eventName = body.event;
      console.log("🎯 [EDUZZ] Evento recebido:", eventName);

      // Lista de eventos que devem ser processados
      const validEvents = [
        "myeduzz.invoice_paid",
      ];

      if (!validEvents.includes(eventName)) {
        console.log("⏭️ [EDUZZ] Evento ignorado (não-processável):", eventName);
        return new Response(
          JSON.stringify({
            success: true,
            ignored: true,
            event: eventName,
            message: "Evento não-processável ignorado com sucesso",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // Filtro para Ticto (processar apenas vendas aprovadas)
    // NOTA: Em PRODUÇÃO apenas eventos com status approved/paid/authorized são processados
    // Para TESTES, waiting_payment é aceito para validar a integração
    if (provider === "Ticto") {
      const status = body.status || "";
      console.log("🎯 [TICTO] Status do evento:", status);

      // Status válidos para processamento (inclui "authorized" que é usado quando o PIX é confirmado)
      const VALID_STATUSES = ["approved", "paid", "completed", "aprovado", "pago", "authorized"];
      // Status de teste (aceitar para validação)
      const TEST_STATUSES = ["waiting_payment"];
      
      const isValidStatus = VALID_STATUSES.includes(status.toLowerCase());
      const isTestStatus = TEST_STATUSES.includes(status.toLowerCase());
      
      if (!isValidStatus && !isTestStatus) {
        console.log("⏭️ [TICTO] Evento ignorado (status não-final):", status);
        return new Response(
          JSON.stringify({
            success: true,
            ignored: true,
            status,
            message: "Evento não-final ignorado com sucesso",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      
      if (isTestStatus) {
        console.log("🧪 [TICTO] Evento de teste detectado (waiting_payment) - processando para validação");
      }
    }

    // PASSO 2: Normalizar dados
    const normalizedData = await normalizeWebhookData(provider, body);
    console.log("✅ [NORMALIZED] Dados processados:", normalizedData);

    // PASSO 3: Conectar ao Supabase com Service Role
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 🎁 PASSO 3.5: PRIMEIRO verificar se existe um ORDER BUMP independente com tokens próprios
    let isOrderBumpOnly = false;
    let orderBumpWithTokens: any = null;
    
    console.log("🎁 [ORDER BUMP FIRST] Verificando se existe order bump com tokens próprios...");
    const { data: orderBumpCheck, error: obCheckError } = await supabase
      .from("order_bumps")
      .select(`
        id, 
        app_id, 
        label, 
        app_link,
        default_language,
        hottok,
        postback_key,
        webhook_token,
        stripe_api_key,
        api_token,
        client_id,
        client_secret,
        basic_token,
        account_id,
        store_slug,
        yampi_secret_key
      `)
      .eq("product_id", normalizedData?.productId)
      .eq("provider", provider)
      .eq("is_active", true)
      .maybeSingle();

    if (!obCheckError && orderBumpCheck) {
      // Verificar se o order bump tem tokens de integração próprios
      const hasOwnTokens = !!(
        orderBumpCheck.hottok ||
        orderBumpCheck.postback_key ||
        orderBumpCheck.webhook_token ||
        orderBumpCheck.stripe_api_key ||
        orderBumpCheck.api_token ||
        orderBumpCheck.client_id ||
        orderBumpCheck.yampi_secret_key
      );

      if (hasOwnTokens) {
        console.log("✅ [ORDER BUMP FIRST] Order bump encontrado COM tokens próprios - processando independentemente");
        isOrderBumpOnly = true;
        orderBumpWithTokens = orderBumpCheck;
      } else {
        console.log("ℹ️ [ORDER BUMP FIRST] Order bump encontrado MAS sem tokens próprios - continua fluxo normal");
      }
    } else {
      console.log("ℹ️ [ORDER BUMP FIRST] Nenhum order bump encontrado para este product_id/provider");
    }

    // PASSO 4: Buscar produto no banco (somente se não for order bump independente)
    let product: any = null;
    
    if (!isOrderBumpOnly) {
      const { data: productRaw, error: productError } = await supabase
        .from("products")
        .select(
          `
          id,
          app_id,
          app_link,
          hottok,
          postback_key,
          webhook_token,
          stripe_api_key,
          paypal_client_id,
          paypal_secret,
          cartpanda_bearer_token,
          cartpanda_store_slug,
          default_language,
          apps(
            nome,
            slug
          )
          `
        )
        .eq("product_id", normalizedData?.productId)
        .eq("provider", provider)
        .maybeSingle();

      if (productError) {
        console.error("❌ [ERROR] Erro ao buscar produto:", productError);
        throw productError;
      }

      product = productRaw;

      // 🔐 FALLBACK: Se Stripe e produto não encontrado, tentar buscar por email
      if (!product && provider === 'Stripe' && normalizedData?.buyerEmail) {
        console.log('🔍 [STRIPE] Produto não encontrado. Buscando stripe_api_key por email...');
        
        const { data: stripeProducts } = await supabase
          .from('products')
          .select('stripe_api_key, product_id')
          .eq('provider', 'Stripe')
          .not('stripe_api_key', 'is', null)
          .limit(1)
          .maybeSingle();
        
        if (stripeProducts?.stripe_api_key) {
          console.log('✅ [STRIPE] Chave API encontrada. Buscando product_id via Stripe API...');
          
          try {
            const Stripe = (await import('https://esm.sh/stripe@18.5.0')).default;
            const stripe = new Stripe(stripeProducts.stripe_api_key, { apiVersion: '2023-10-16' });
            
            const sessionId = normalizedData?.transactionId;
            const fullSession = await stripe.checkout.sessions.retrieve(
              sessionId,
              { expand: ['line_items.data.price.product'] }
            );
            
            if (fullSession.line_items?.data?.[0]?.price?.product) {
              const productData = fullSession.line_items.data[0].price.product;
              const realProductId = typeof productData === 'string' ? productData : productData.id;
              
              console.log('✅ [STRIPE] Product ID real obtido:', realProductId);
              
              // Atualizar normalizedData
              if (normalizedData) normalizedData.productId = realProductId;
              
              // Re-buscar produto com o ID correto (LEFT JOIN para suportar app_id NULL)
              const { data: realProduct } = await supabase
                .from('products')
                .select(
                  `
                  id,
                  app_id,
                  app_link,
                  hottok,
                  postback_key,
                  webhook_token,
                  stripe_api_key,
                  paypal_client_id,
                  paypal_secret,
                  cartpanda_bearer_token,
                  cartpanda_store_slug,
                  default_language,
                  apps(
                    nome,
                    slug
                  )
                  `
                )
                .eq('product_id', realProductId)
                .eq('provider', 'Stripe')
                .maybeSingle();
              
              if (realProduct) {
                product = realProduct;
                console.log('✅ [STRIPE] Produto encontrado após busca via API');
              }
            }
          } catch (stripeError) {
            console.error('❌ [STRIPE] Erro ao buscar via API:', stripeError);
          }
        }
      }

      // 🧪 FALLBACK para testes Kiwify
      if (!product && isKiwifyTestPayload(provider, body)) {
        console.log("🧪 [TEST] Teste Kiwify detectado. Usando fallback...");

        const fallbackProductId = Deno.env.get("KIWIFY_TEST_PRODUCT_ID");

        if (!fallbackProductId) {
          throw new Error("KIWIFY_TEST_PRODUCT_ID não configurado no Supabase Secrets");
        }

        console.log("🔁 [FALLBACK] Buscando produto com ID:", fallbackProductId);

        const { data: fallbackProduct, error: fallbackError } = await supabase
          .from("products")
          .select(
            `
            id,
            app_id,
            app_link,
            hottok,
            postback_key,
            webhook_token,
            stripe_api_key,
            paypal_client_id,
            paypal_secret,
            cartpanda_bearer_token,
            cartpanda_store_slug,
            default_language,
            apps(
              nome,
              slug
            )
            `
          )
          .eq("product_id", fallbackProductId)
          .eq("provider", "Kiwify")
          .maybeSingle();

        if (fallbackError || !fallbackProduct) {
          console.error("❌ [FALLBACK] Produto fallback não encontrado:", fallbackProductId);
          throw new Error(`Produto fallback não encontrado: ${fallbackProductId}`);
        }

        console.log("✅ [FALLBACK] Produto fallback carregado:", {
          id: fallbackProduct.id,
          app_id: fallbackProduct.app_id,
        });

        product = fallbackProduct;
      }
    }

    // Se é ORDER BUMP ONLY, criar um objeto product "virtual" com os tokens do order bump
    if (isOrderBumpOnly && orderBumpWithTokens) {
      console.log("🎁 [ORDER BUMP ONLY] Criando produto virtual a partir do order bump");
      product = {
        id: `ob_${orderBumpWithTokens.id}`, // ID virtual
        app_id: orderBumpWithTokens.app_id,
        app_link: orderBumpWithTokens.app_link,
        hottok: orderBumpWithTokens.hottok,
        postback_key: orderBumpWithTokens.postback_key,
        webhook_token: orderBumpWithTokens.webhook_token,
        stripe_api_key: orderBumpWithTokens.stripe_api_key,
        cartpanda_bearer_token: orderBumpWithTokens.api_token, // api_token = cartpanda_bearer_token
        cartpanda_store_slug: orderBumpWithTokens.store_slug,
        default_language: orderBumpWithTokens.default_language || "pt-br",
        apps: null, // Sem app vinculado diretamente
        _isOrderBumpVirtual: true, // Flag para identificar
        _orderBumpId: orderBumpWithTokens.id,
        _orderBumpLabel: orderBumpWithTokens.label,
      };
    }

    // Se ainda não tem produto (compra real sem cadastro), falha
    if (!product) {
      console.error("❌ [ERROR] Produto não encontrado:", {
        productId: normalizedData?.productId,
        provider,
      });
      throw new Error(`Produto não encontrado: ${normalizedData?.productId} (${provider})`);
    }

    // Suportar app_id NULL - apps pode ser null quando não há app associado
    const appData = product.apps 
      ? (Array.isArray(product.apps) ? product.apps[0] : product.apps)
      : null;

    // Então usar appData?.nome e appData?.slug quando disponível

    console.log("📦 [PRODUCT] Encontrado:", {
      id: product.id,
      app_id: product.app_id,
      app_name: appData?.nome || "(sem app vinculado)",
      app_link: product.app_link,
    });

    // ✅ CORREÇÃO: Sobrescrever idioma com default_language do produto
      if (normalizedData && product?.default_language) {
        normalizedData.language = product.default_language;
        console.log(`🌐 [LANGUAGE] Idioma atualizado: ${normalizedData.language}`);
      }

      // VALIDAÇÃO DO HOTTOK KEY (Hotmart)
      if (provider === "Hotmart" && product?.hottok) {
      const receivedHottok = req.headers.get("hottok") || req.headers.get("x-hotmart-hottok");
      
      if (!receivedHottok) {
        console.error("❌ [HOTMART] Hottok não enviado no header!");
        return new Response(JSON.stringify({ error: "Hottok header missing" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (receivedHottok !== product.hottok) {
        console.error("❌ [HOTMART] Hottok inválido!");
        console.log("🔐 Esperado:", product.hottok.substring(0, 10) + "...");
        console.log("🔐 Recebido:", receivedHottok.substring(0, 10) + "...");
        return new Response(JSON.stringify({ error: "Invalid hottok" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      console.log("✅ [HOTMART] Hottok válido");
    }

    // VALIDAÇÃO DO POSTBACK KEY (Monetizze)
    if (provider === "Monetizze" && product?.postback_key) {
      const receivedKey = body.key || body.chave_unica;
    
      if (!receivedKey) {
        console.error("❌ [MONETIZZE] Postback key não enviado no body!");
        return new Response(
          JSON.stringify({ error: "Postback key missing in webhook body" }), 
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    
      if (receivedKey !== product.postback_key) {
        console.error("❌ [MONETIZZE] Postback key inválido!");
        console.log("🔐 Esperado:", product.postback_key.substring(0, 10) + "...");
        console.log("🔐 Recebido:", receivedKey.substring(0, 10) + "...");
        return new Response(
          JSON.stringify({ error: "Invalid postback key" }), 
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    
      console.log("✅ [MONETIZZE] Postback key válido");
    }
    // 🟢 FIM DO BLOCO DE VALIDAÇÃO DO MONETIZZE

    // VALIDAÇÃO DA CHAVE DE ACESSO (Eduzz) - APENAS FORMATO LEGADO
    // MyEduzz não envia chave de validação nos webhooks
    if (provider === "Eduzz" && product?.postback_key && !body.event?.startsWith("myeduzz.")) {
      const receivedKey = body.key;
    
      if (!receivedKey) {
        console.error("❌ [EDUZZ] Chave de acesso não enviada no body!");
        return new Response(
          JSON.stringify({ error: "Eduzz access key missing in webhook body" }), 
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    
      if (receivedKey !== product.postback_key) {
        console.error("❌ [EDUZZ] Chave de acesso inválida!");
        console.log("🔐 Esperado:", product.postback_key.substring(0, 10) + "...");
        console.log("🔐 Recebido:", receivedKey.substring(0, 10) + "...");
        return new Response(
          JSON.stringify({ error: "Invalid Eduzz access key" }), 
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    
      console.log("✅ [EDUZZ] Chave de acesso válida (formato legado)");
    } else if (provider === "Eduzz" && body.event?.startsWith("myeduzz.")) {
      console.log("ℹ️ [EDUZZ] MyEduzz webhook - validação de chave não aplicável");
    }

    // VALIDAÇÃO DO TOKEN (Ticto)
    if (provider === "Ticto" && product?.postback_key) {
      // Ticto pode enviar o token no header ou no body
      const receivedToken = req.headers.get("x-ticto-token") || body.token;
    
      if (!receivedToken) {
        console.error("❌ [TICTO] Token não enviado!");
        return new Response(
          JSON.stringify({ error: "Ticto token missing" }), 
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    
      if (receivedToken !== product.postback_key) {
        console.error("❌ [TICTO] Token inválido!");
        console.log("🔐 Esperado:", product.postback_key.substring(0, 10) + "...");
        console.log("🔐 Recebido:", receivedToken.substring(0, 10) + "...");
        return new Response(
          JSON.stringify({ error: "Invalid Ticto token" }), 
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    
      console.log("✅ [TICTO] Token válido");
    }

    // VALIDAÇÃO YAMPI - HMAC-SHA256 no header X-Yampi-Hmac-SHA256
    if (provider === "Yampi" && product?.postback_key) {
      const receivedSignatureRaw =
        req.headers.get("x-yampi-hmac-sha256") ||
        req.headers.get("X-Yampi-Hmac-SHA256");
      
      if (!receivedSignatureRaw) {
        console.error("❌ [YAMPI] Header X-Yampi-Hmac-SHA256 não enviado!");
        return new Response(
          JSON.stringify({ error: "Yampi signature header missing" }), 
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const secret = normalizeSecretKey(product.postback_key || "");
      const receivedSignature = normalizeBase64Signature(receivedSignatureRaw);

      let receivedBytes: Uint8Array;
      try {
        receivedBytes = decodeBase64(receivedSignature);
      } catch (_e) {
        console.error("❌ [YAMPI] Assinatura recebida não é base64 válida");
        return new Response(
          JSON.stringify({ error: "Invalid Yampi signature encoding" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // A Yampi usa json_encode($body) para calcular a assinatura
      // Isso significa que precisamos comparar com o JSON stringificado,
      // NÃO com o body bruto (que pode ter formatação diferente)
      const encoder = new TextEncoder();
      const utf8KeyBytes = encoder.encode(secret);

      // Tentativas de payload (a Yampi usa PHP json_encode que pode ter formatação variada)
      const payloadsToTry = [
        rawBodyBytes, // 1. Body exato recebido
        encoder.encode(JSON.stringify(body)), // 2. JSON.stringify sem espaços
        encoder.encode(JSON.stringify(body, null, 2)), // 3. Com indentação (menos provável)
      ];

      let matched = false;
      let usedPayloadIdx = -1;
      let calculatedBytes: Uint8Array = new Uint8Array();

      for (let i = 0; i < payloadsToTry.length; i++) {
        const sig = await signHmacSha256(utf8KeyBytes, payloadsToTry[i]);
        if (timingSafeEqual(receivedBytes, sig)) {
          matched = true;
          usedPayloadIdx = i;
          calculatedBytes = sig;
          break;
        }
        // Guardar última tentativa para log
        if (i === 0) calculatedBytes = sig;
      }

      // Se não deu match com UTF-8 key, tentar com HEX key (se for formato hex)
      if (!matched && isHexString(secret)) {
        const hexKeyBytes = hexToBytes(secret);
        for (let i = 0; i < payloadsToTry.length; i++) {
          const sig = await signHmacSha256(hexKeyBytes, payloadsToTry[i]);
          if (timingSafeEqual(receivedBytes, sig)) {
            matched = true;
            usedPayloadIdx = i + 10; // +10 para indicar hex mode
            calculatedBytes = sig;
            break;
          }
        }
      }

      if (!matched) {
        const calculatedSignature = encodeBase64(calculatedBytes.buffer as ArrayBuffer);
        console.error("❌ [YAMPI] Assinatura HMAC inválida!");
        console.log("🔐 Esperado (rawBody):", calculatedSignature.substring(0, 20) + "...");
        console.log(
          "🔐 Recebido:",
          (receivedSignatureRaw || "").trim().substring(0, 20) + "...",
        );
        // Log adicional para debug
        console.log("🔎 [YAMPI] rawBody length:", rawBodyBytes.length);
        console.log("🔎 [YAMPI] JSON.stringify length:", JSON.stringify(body).length);
        return new Response(
          JSON.stringify({ error: "Invalid Yampi signature" }), 
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    
      console.log(`✅ [YAMPI] Assinatura HMAC válida (payload #${usedPayloadIdx})`);
    } else if (provider === "Yampi" && !product?.postback_key) {
      console.log("ℹ️ [YAMPI] Chave secreta não configurada, pulando validação HMAC");
    }

    // VALIDAÇÃO STRIPE - Webhook Signing Secret
    if (provider === "Stripe") {
      const stripeSignature = req.headers.get('stripe-signature');
      
      if (!stripeSignature) {
        console.error('❌ [STRIPE] Stripe-Signature header ausente');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Stripe signature header missing' 
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (!product.webhook_token) {
        console.error('❌ [STRIPE] Webhook Signing Secret não configurado no produto');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Webhook signing secret not configured' 
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('✅ [STRIPE] Webhook Signing Secret presente e configurado');
    }

    // PASSO 5: Verificar se compra já existe (evitar duplicatas)
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("transaction_id", normalizedData?.transactionId)
      .maybeSingle();

    if (existingPurchase) {
      console.log("⚠️ [DUPLICATE] Compra já processada:", existingPurchase.id);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Compra já processada anteriormente",
          purchaseId: existingPurchase.id,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // PASSO 6: Salvar compra (apenas se NÃO for order bump independente)
    if (!normalizedData) {
      console.error("❌ [ERROR] Dados normalizados não encontrados");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to normalize webhook data",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let purchase: any = null;
    
    // Para order bumps independentes, também salvar na tabela purchases
    // para que o "Login por E-mail de Compra" funcione corretamente
    if (product._isOrderBumpVirtual) {
      console.log("🎁 [ORDER BUMP] Salvando compra virtual para order bump independente");
      
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          product_id: product._orderBumpProductId || product._orderBumpId, // Usar product_id do order bump
          app_id: product.app_id, // app_id vinculado ao order bump
          buyer_name: normalizedData.buyerName,
          buyer_email: normalizedData.buyerEmail,
          buyer_language: product.default_language || "pt-br",
          transaction_id: normalizedData.transactionId,
          provider: provider,
          price: normalizedData.price,
          status: "completed",
        })
        .select()
        .single();

      if (purchaseError) {
        console.warn("⚠️ [ORDER BUMP] Erro ao salvar compra (não crítico):", purchaseError);
        // Criar purchase virtual como fallback
        purchase = {
          id: `virtual_${Date.now()}`,
          _isVirtual: true,
        };
      } else {
        purchase = purchaseData;
        console.log("💾 [ORDER BUMP] Compra salva com sucesso:", purchase.id);
      }
    } else {
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          product_id: product.id,
          app_id: product.app_id,
          buyer_name: normalizedData.buyerName,
          buyer_email: normalizedData.buyerEmail,
          buyer_language: product.default_language || "pt-br",
          transaction_id: normalizedData.transactionId,
          provider: provider,
          price: normalizedData.price,
          status: "completed",
        })
        .select()
        .single();

      if (purchaseError) {
        console.error("❌ [ERROR] Erro ao salvar compra:", purchaseError);
        throw purchaseError;
      }

      purchase = purchaseData;
      console.log("💾 [PURCHASE] Salva com sucesso:", purchase.id);
    }

    // PASSO 6.5: Processar ORDER BUMP e gerar código de acesso
    console.log("🎁 [ORDER BUMP] Processando order bump...");
    try {
      // Se for order bump independente, já temos o order bump
      if (product._isOrderBumpVirtual && product._orderBumpId) {
        console.log(`🎁 [ORDER BUMP ONLY] Processando order bump independente: ${product._orderBumpLabel}`);
        
        // Gerar código único
        const { data: codeResult } = await supabase.rpc("generate_access_code");
        const accessCode = codeResult || `MB-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        
        // Salvar o código de acesso (purchase_id pode ser null para order bumps independentes)
        const { error: insertError } = await supabase
          .from("order_bump_access_codes")
          .insert({
            order_bump_id: product._orderBumpId,
            purchase_id: null, // Não há purchase real
            buyer_email: normalizedData.buyerEmail,
            access_code: accessCode,
          });

        if (insertError) {
          console.error("⚠️ [ORDER BUMP] Erro ao salvar código:", insertError);
        } else {
          console.log(`✅ [ORDER BUMP] Código gerado: ${accessCode} para "${product._orderBumpLabel}"`);
          
          // Enviar email com código de acesso
          try {
            await supabase.functions.invoke("send-order-bump-code", {
              body: {
                buyerName: normalizedData.buyerName,
                buyerEmail: normalizedData.buyerEmail,
                language: product.default_language || "pt-br",
                orderBumpLabel: product._orderBumpLabel,
                accessCode: accessCode,
                appLink: product.app_link || null,
              },
            });
            console.log(`📧 [ORDER BUMP] Email com código enviado para ${normalizedData.buyerEmail}`);
          } catch (emailErr) {
            console.warn("⚠️ [ORDER BUMP] Erro ao enviar email (não crítico):", emailErr);
          }
        }
      } else {
        // Fluxo normal: buscar order bumps vinculados ao produto
        const { data: orderBumps, error: obError } = await supabase
          .from("order_bumps")
          .select("id, app_id, label, app_link, default_language")
          .eq("product_id", normalizedData.productId)
          .eq("provider", provider)
          .eq("is_active", true);

        if (obError) {
          console.warn("⚠️ [ORDER BUMP] Erro ao verificar:", obError.message);
        } else if (orderBumps && orderBumps.length > 0) {
          console.log(`🎁 [ORDER BUMP] Encontrado(s) ${orderBumps.length} order bump(s) para este produto`);
          
          for (const orderBump of orderBumps) {
            // Gerar código único usando a função do banco
            const { data: codeResult } = await supabase.rpc("generate_access_code");
            const accessCode = codeResult || `MB-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            
            // Salvar o código de acesso
            const { error: insertError } = await supabase
              .from("order_bump_access_codes")
              .insert({
                order_bump_id: orderBump.id,
                purchase_id: purchase._isVirtual ? null : purchase.id,
                buyer_email: normalizedData.buyerEmail,
                access_code: accessCode,
              });

            if (insertError) {
              console.error("⚠️ [ORDER BUMP] Erro ao salvar código:", insertError);
            } else {
              console.log(`✅ [ORDER BUMP] Código gerado: ${accessCode} para "${orderBump.label}"`);
              
              // Enviar email com código de acesso do order bump
              try {
                await supabase.functions.invoke("send-order-bump-code", {
                  body: {
                    buyerName: normalizedData.buyerName,
                    buyerEmail: normalizedData.buyerEmail,
                    language: orderBump.default_language || product.default_language || "pt-br",
                    orderBumpLabel: orderBump.label,
                    accessCode: accessCode,
                    appLink: orderBump.app_link || null,
                  },
                });
                console.log(`📧 [ORDER BUMP] Email com código enviado para ${normalizedData.buyerEmail}`);
              } catch (emailErr) {
                console.warn("⚠️ [ORDER BUMP] Erro ao enviar email (não crítico):", emailErr);
              }
            }
          }
        } else {
          console.log("ℹ️ [ORDER BUMP] Nenhum order bump configurado para este produto/provider");
        }
      }
    } catch (obErr) {
      console.warn("⚠️ [ORDER BUMP] Erro no processamento (não crítico):", obErr);
    }

    // Se for order bump independente, retornar sucesso aqui (não precisa enviar email de acesso normal)
    if (product._isOrderBumpVirtual) {
      console.log("✅ [ORDER BUMP ONLY] Processamento concluído com sucesso");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Order bump processado com sucesso",
          orderBumpId: product._orderBumpId,
          orderBumpLabel: product._orderBumpLabel,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // PASSO 7: Enviar email de acesso
    const emailLanguage = product.default_language || "pt-br";
    
    // Nome do app: prioridade
    // 1. Se tem app vinculado diretamente → usar appData.nome
    // 2. Se não, buscar pelo mapeamento de domínio customizado
    // 3. Fallback: usar o hostname da URL
    let appName = appData?.nome;
    
    if (!appName && product.app_link) {
      try {
        const appLinkUrl = new URL(product.app_link);
        const hostname = appLinkUrl.hostname.replace('www.', '');
        const path = appLinkUrl.pathname || '/';
        
        console.log("🔍 [DOMAIN] Buscando mapeamento para:", { hostname, path });
        
        // Buscar domínio customizado verificado
        const { data: customDomain } = await supabase
          .from('custom_domains')
          .select('id')
          .eq('domain', hostname)
          .eq('is_verified', true)
          .maybeSingle();
        
        if (customDomain) {
          // Buscar mapeamento do path (prioriza path específico, depois raiz)
          const { data: mapping } = await supabase
            .from('domain_app_mappings')
            .select('app_id, apps(nome)')
            .eq('custom_domain_id', customDomain.id)
            .eq('path', path === '/' ? '/' : path)
            .maybeSingle();
          
          // Se não encontrou no path específico, busca na raiz
          const finalMapping = mapping || (path !== '/' ? (await supabase
            .from('domain_app_mappings')
            .select('app_id, apps(nome)')
            .eq('custom_domain_id', customDomain.id)
            .eq('path', '/')
            .maybeSingle()).data : null);
          
          if (finalMapping?.apps) {
            const mappedApp = Array.isArray(finalMapping.apps) ? finalMapping.apps[0] : finalMapping.apps;
            appName = mappedApp?.nome;
            console.log("✅ [DOMAIN] Nome do app encontrado via mapeamento:", appName);
          }
        }
        
        // Fallback para hostname se não encontrou mapeamento
        if (!appName) {
          appName = hostname;
          console.log("ℹ️ [DOMAIN] Usando hostname como fallback:", appName);
        }
      } catch (urlError) {
        console.error("⚠️ [DOMAIN] Erro ao processar URL:", urlError);
        appName = 'Seu Produto';
      }
    }
    
    appName = appName || 'Seu Produto';
    
    console.log("📧 [EMAIL] Dados para envio:", {
      buyerName: normalizedData?.buyerName,
      buyerEmail: normalizedData?.buyerEmail,
      language: emailLanguage, // ✅ Mostra o idioma REAL usado no e-mail
      appName: appName,
      appLink: product.app_link,
      purchaseId: purchase.id,
      provider
    });
    
    const { data: emailResult, error: emailError } = await supabase.functions.invoke("send-access-email", {
      body: {
        buyerName: normalizedData?.buyerName,
        buyerEmail: normalizedData?.buyerEmail,
        language: product.default_language || "pt-br",
        appName: appName,
        appLink: product.app_link,
        purchaseId: purchase.id,
      },
    });

    if (emailError) {
      console.error("⚠️ [EMAIL] Erro ao enviar (não crítico):", emailError);
      console.error("⚠️ [EMAIL] Detalhes do erro:", JSON.stringify(emailError, null, 2));
      // Não falha a compra se o email der erro
    } else {
      console.log("✅ [EMAIL] Enviado com sucesso:", emailResult);
    }

    // PASSO 8: Adicionar contato ao Brevo (se configurado)
    console.log("📬 [BREVO] Verificando configuração para evento de compra...");
    try {
      const { data: brevoSetting } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'brevo_config')
        .maybeSingle();

      if (brevoSetting?.value) {
        const brevoConfig = JSON.parse(brevoSetting.value);
        
        if (brevoConfig.api_key) {
          // Determinar qual lista usar: prioridade para evento específico, fallback para lista padrão
          let targetListId: string | null = null;
          let listSource = '';
          
          // Verificar se há lista específica para o evento de compra
          if (brevoConfig.purchase_events?.purchase && brevoConfig.purchase_events.purchase !== 'none') {
            targetListId = brevoConfig.purchase_events.purchase;
            listSource = 'evento "Compra Efetuada"';
          } else if (brevoConfig.list_id) {
            // Fallback para lista padrão
            targetListId = brevoConfig.list_id;
            listSource = 'lista padrão';
          }
          
          if (targetListId) {
            console.log(`📬 [BREVO] Usando ${listSource}, lista ID:`, targetListId);
            
            // Separar nome em primeiro nome e sobrenome
            const nameParts = (normalizedData?.buyerName || '').split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            const { data: brevoResult, error: brevoError } = await supabase.functions.invoke('brevo-api', {
              body: {
                action: 'add-contact',
                apiKey: brevoConfig.api_key,
                email: normalizedData?.buyerEmail,
                firstName: firstName,
                lastName: lastName,
                listIds: [parseInt(targetListId)]
              }
            });

            if (brevoError) {
              console.warn("⚠️ [BREVO] Erro ao adicionar contato (não crítico):", brevoError);
            } else {
              console.log("✅ [BREVO] Contato adicionado com sucesso:", brevoResult);
            }
          } else {
            console.log("ℹ️ [BREVO] Nenhuma lista configurada para compras");
          }
        } else {
          console.log("ℹ️ [BREVO] API key não configurada");
        }
      } else {
        console.log("ℹ️ [BREVO] Integração não configurada");
      }
    } catch (brevoErr) {
      console.warn("⚠️ [BREVO] Erro ao processar integração (não crítico):", brevoErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        purchaseId: purchase.id,
        message: "Compra processada e email enviado com sucesso",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("💥 [FATAL] Erro ao processar webhook:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString(),
        timestamp: new Date().toISOString(),
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

// ===== FUNÇÕES AUXILIARES =====

function identifyProvider(body: any): string {
  // Hotmart - Detecta por estrutura, não por evento específico
  // Verificar se product existe (id pode ser 0) e se há transaction
  if (body.data?.product !== undefined && body.data?.purchase?.transaction) {
    return "Hotmart";
  }

  // Kiwify
  if (body.Product?.product_id && body.Customer) {
    return "Kiwify";
  }

  // Eduzz - Detecta webhook de teste (ping), MyEduzz e formato antigo
  if (
    body.event === "ping" || 
    body.event?.startsWith("myeduzz.") || 
    (body.trans_cod && body.produto_codigo)
  ) {
    return "Eduzz";
  }

  // Monetizze
  if ((body.transaction && body.produto) || (body.chave_unica && body.produto && body.venda)) {
    return "Monetizze";
  }

  // YAMPI - Detectar por estrutura (merchant.alias + resource com customer/items)
  // Aceita QUALQUER evento da Yampi (filtro de evento válido é feito depois na função principal)
  // TAMBÉM aceita webhooks de TESTE que não têm merchant.alias mas têm estrutura característica
  const isYampiRealWebhook = body.merchant?.alias &&
    body.resource &&
    (body.resource?.customer?.data?.email || body.resource?.id) &&
    (body.event?.startsWith('order.') || body.event?.startsWith('customer.'));
  
  // Webhook de TESTE da Yampi: tem "test: true" ou estrutura resource.items.data com event order.*
  const isYampiTestWebhook = body.event?.startsWith('order.') &&
    body.resource?.items?.data?.length > 0 &&
    body.resource?.customer?.data?.email &&
    !body.merchant?.alias; // Sem merchant.alias = webhook de teste
  
  if (isYampiRealWebhook || isYampiTestWebhook) {
    console.log("🟣 [YAMPI] Formato detectado:", {
      merchant_alias: body.merchant?.alias || "(teste)",
      event: body.event,
      has_customer: !!body.resource?.customer?.data?.email,
      has_items: !!body.resource?.items?.data?.length,
      is_test: isYampiTestWebhook
    });
    return "Yampi";
  }

  // MUNDPAY - Formato específico com event_type começando com 'order.' e offers array
  if (
    body.event_type?.startsWith('order.') &&
    body.customer?.email &&
    body.offers?.length > 0 &&
    body.paymentDetail
  ) {
    console.log("💰 [MUNDPAY] Formato detectado:", {
      event_type: body.event_type,
      customer_email: body.customer.email,
      offers_count: body.offers.length,
      status: body.status
    });
    // Ignorar eventos que não são de pagamento confirmado
    if (body.event_type !== 'order.paid' && body.status !== 'paid') {
      console.log("ℹ️ [MUNDPAY] Evento ignorado (não é pagamento confirmado):", body.event_type);
      throw new Error(`Evento Mundpay ignorado: ${body.event_type}`);
    }
    return "Mundpay";
  }

  // Cart Panda - Múltiplos formatos possíveis (verificar APÓS Mundpay)
  if (
    (body.buyer?.email && body.product_id) ||
    (body.customer?.email && body.product_id) ||
    (body.customer?.email && body.product?.id) ||
    (body.event === 'order.paid' && body.order?.customer?.email) ||
    (body.event === 'order.paid' && body.customer?.email && !body.offers) ||
    (body.status === 'paid' && body.customer?.email && body.id && !body.offers)
  ) {
    console.log("🛒 [CART PANDA] Formato detectado:", {
      has_buyer: !!body.buyer,
      has_customer: !!body.customer,
      has_product_id: !!body.product_id,
      has_product: !!body.product,
      event: body.event,
      status: body.status
    });
    return "Cart Panda";
  }

  // Braip
  if (body.mat_codigo && body.prod_codigo) {
    return "Braip";
  }

  // Perfect Pay
  if (body.code && body.product?.code && body.customer?.email) {
    return "Perfect Pay";
  }

  // Ticto (Webhook 2.0) - Formato real com item, customer, order
  if (
    (body.item?.product_id && body.customer?.email && body.order?.hash) ||
    (body.id_transacao && body.id_produto) ||
    (body.transaction_id && body.product_id && body.customer?.email) ||
    (body.data?.transaction?.id && body.data?.product?.id) ||
    (body.token && body.item && body.customer)
  ) {
    console.log("🎫 [TICTO] Formato detectado:", {
      has_item: !!body.item,
      has_customer: !!body.customer,
      has_order: !!body.order,
      has_token: !!body.token,
      status: body.status,
      payment_method: body.payment_method
    });
    return "Ticto";
  }

  // AppMax
  if (body.transaction_id && body.product?.id) {
    return "AppMax";
  }

  // Pepper
  if (body.transaction?.id && body.product?.external_id) {
    return "Pepper";
  }

  // Cakto
  if (
    (body.event === 'order.approved' || 
     body.event === 'payment.confirmed' || 
     body.event === 'purchase_approved') &&
    (body.data?.customer?.email || body.customer?.email || body.client?.email) &&
    (body.data?.product?.id || body.product_id || body.product?.id)
  ) {
    return "Cakto";
  }

  // ✅ PAYPAL – identificar pelo event_type
  if (
    typeof body.event_type === "string" &&
    (
      body.event_type.startsWith("CHECKOUT.") ||   // CHECKOUT.ORDER.APPROVED / COMPLETED
      body.event_type.startsWith("PAYMENT.")      // PAYMENT.CAPTURE.COMPLETED / SALE.COMPLETED
    )
  ) {
    return "Paypal";
  }

  // Stripe Checkout
  if (body.type === 'checkout.session.completed' && body.object === 'event') {
    return "Stripe";
  }

  console.error("❌ [ERROR] Plataforma não identificada. Body:", JSON.stringify(body, null, 2));
  throw new Error("Plataforma não identificada. Verifique o formato do webhook.");
}

// ===== DETECTAR TESTE =====
function isKiwifyTestPayload(provider: string, body: any): boolean {
  if (provider !== "Kiwify") return false;

  // Kiwify Test Webhook sempre usa este email e nome de produto
  return body.Customer?.email === "johndoe@example.com" || body.Product?.product_name === "Example product";
}

async function normalizeWebhookData(provider: string, body: any) {
  switch (provider) {
    case "Hotmart": {
      // Normalizar idioma da Hotmart para formato padrão
      const hotmartLanguage = body.data?.buyer?.language?.toLowerCase();
      let normalizedLanguage = "pt-br"; // default
      
      if (hotmartLanguage === "en" || hotmartLanguage === "english") {
        normalizedLanguage = "en-us";
      } else if (hotmartLanguage === "es" || hotmartLanguage === "spanish" || hotmartLanguage === "español") {
        normalizedLanguage = "es";
      } else if (hotmartLanguage === "pt" || hotmartLanguage === "portuguese" || hotmartLanguage === "português") {
        normalizedLanguage = "pt-br";
      }
      
      console.log(`🌐 [HOTMART] Idioma convertido: ${hotmartLanguage} → ${normalizedLanguage}`);
      
      // Usar ucode se id for 0 ou inválido
      const productId = body.data.product.id > 0 
        ? body.data.product.id.toString() 
        : body.data.product.ucode || "0";
      
      console.log(`🔑 [HOTMART] Product ID extraído: ${productId} (original: ${body.data.product.id})`);
      
      return {
        productId: productId,
        buyerName: body.data.buyer.name || body.data.buyer.first_name || "Comprador",
        buyerEmail: body.data.buyer.email,
        language: normalizedLanguage,
        transactionId: body.data.purchase.transaction,
        price: parseFloat(body.data.purchase.price.value),
      };
    }

    case "Kiwify": {
      // Kiwify envia o valor em centavos em body.Commissions.charge_amount
      const kiwifyPrice = body.Commissions?.charge_amount
        ? Number(body.Commissions.charge_amount) / 100 // Converter centavos para reais
        : body.order_total
          ? parseFloat(body.order_total)
          : 0;

      return {
        productId: body.Product.product_id,
        buyerName: body.Customer.full_name,
        buyerEmail: body.Customer.email,
        language: "pt-br",
        transactionId: body.order_id,
        price: kiwifyPrice,
      };
    }

      case "Eduzz": {
        // Verificar se é formato MyEduzz (novo) ou formato antigo
        if (body.event?.startsWith("myeduzz.")) {
          // Formato MyEduzz (novo)
          console.log("🆕 [EDUZZ] Processando formato MyEduzz");
          
          // Pegar o primeiro item do array de produtos
          const firstItem = body.data.items?.[0];
          
          return {
            productId: firstItem?.productId || "unknown",
            buyerName: body.data.buyer?.name || "Comprador",
            buyerEmail: body.data.buyer?.email,
            language: "pt-br",
            transactionId: body.data.transaction?.id || body.data.id,
            price: parseFloat(body.data.price?.value || 0),
          };
        } else {
          // Formato antigo da Eduzz
          console.log("📜 [EDUZZ] Processando formato antigo");
          return {
            productId: body.produto_codigo.toString(),
            buyerName: body.cliente_nome,
            buyerEmail: body.cliente_email,
            language: "pt-br",
            transactionId: body.trans_cod,
            price: parseFloat(body.valor),
          };
        }
      }

    case "Monetizze":
      return {
        productId: body.produto.codigo.toString(),
        buyerName: body.comprador.nome,
        buyerEmail: body.comprador.email,
        language: "pt-br",
        // Suporta ambos os formatos: teste (body.transaction) e real (body.venda.codigo)
        transactionId: body.transaction || body.venda.codigo,
        price: parseFloat(body.venda.valor),
      };

    case "Cart Panda": {
      console.log('🛒 [CART PANDA] Normalizando dados do webhook');
      console.log('🛒 [CART PANDA] Body completo para análise:', JSON.stringify(body, null, 2));
      
      // Detectar se os dados estão em body.order ou diretamente no body
      const orderData = body.order || body;
      const customerData = orderData.buyer || orderData.customer || body.buyer || body.customer || {};
      
      // Product ID pode estar em line_items ou diretamente no body
      let productId = body.product_id || body.productId || orderData.product_id;
      if (!productId && orderData.line_items && orderData.line_items.length > 0) {
        productId = orderData.line_items[0].product_id;
      }
      
      // Order ID
      const orderId = orderData.id || body.order_id || body.id || body.orderId || body.transaction_id;
      
      // Amount - verificar em múltiplos lugares
      const amount = orderData.total_price || orderData.amount || orderData.total || 
                     body.amount || body.total || body.value || body.price || 0;
      
      console.log('🛒 [CART PANDA] Dados extraídos:', {
        productId,
        customerEmail: customerData.email,
        orderId,
        amount
      });
      
      return {
        productId: productId?.toString() || "unknown",
        buyerName: customerData.name || customerData.full_name || 
                  (customerData.first_name && customerData.last_name 
                    ? `${customerData.first_name} ${customerData.last_name}` 
                    : customerData.first_name) || "Cliente Cart Panda",
        buyerEmail: customerData.email,
        language: "pt-br",
        transactionId: orderId?.toString() || "unknown",
        price: parseFloat(amount) || 0,
      };
    }

    case "Yampi": {
      console.log('🟣 [YAMPI] Normalizando dados do webhook');
      
      const customer = body.resource.customer.data;
      const items = body.resource.items.data;
      const firstItem = items[0];
      
      // Nome completo do cliente
      const buyerName = customer.name || 
                        customer.generic_name || 
                        (customer.first_name && customer.last_name 
                          ? `${customer.first_name} ${customer.last_name}` 
                          : customer.first_name) || "Cliente Yampi";
      
      // Product ID do primeiro item
      const productId = firstItem.product_id?.toString() || 
                        firstItem.sku?.data?.product_id?.toString() || 
                        "unknown";
      
      // Transaction ID do pedido
      const transactionId = body.resource.id?.toString() || 
                            body.resource.number?.toString() || 
                            "unknown";
      
      // Valor total
      const amount = body.resource.value_total || 
                     body.resource.buyer_value_total || 
                     firstItem.price || 0;
      
      console.log('🟣 [YAMPI] Dados extraídos:', {
        productId,
        buyerName,
        buyerEmail: customer.email,
        transactionId,
        amount
      });
      
      return {
        productId: productId,
        buyerName: buyerName,
        buyerEmail: customer.email,
        language: "pt-br",
        transactionId: transactionId,
        price: parseFloat(amount) || 0,
      };
    }

    case "Braip":
      return {
        productId: body.prod_codigo.toString(),
        buyerName: body.cliente_nome,
        buyerEmail: body.cliente_email,
        language: "pt-br",
        transactionId: body.mat_codigo,
        price: parseFloat(body.valor),
      };

    case "Perfect Pay":
      return {
        productId: body.product.code,
        buyerName: body.customer.full_name,
        buyerEmail: body.customer.email,
        language: "pt-br",
        transactionId: body.code,
        price: parseFloat(body.sale_amount),
      };

    case "Ticto": {
      console.log("🎫 [TICTO] Normalizando dados do webhook 2.0");
      
      // Formato principal Ticto 2.0: item, customer, order, token
      if (body.item && body.customer && body.order) {
        const productId = body.item.product_id || body.item.offer_id;
        const buyerName = body.customer.name || body.customer.nome || "Cliente Ticto";
        const buyerEmail = body.customer.email;
        const transactionId = body.order.hash;
        // Ticto envia valor em centavos (paid_amount)
        const price = (body.order.paid_amount || body.item.amount || 0) / 100;
        
        console.log("🎫 [TICTO] Dados extraídos (formato 2.0):", {
          productId,
          buyerName,
          buyerEmail,
          transactionId,
          price
        });
        
        return {
          productId: productId?.toString(),
          buyerName,
          buyerEmail,
          language: "pt-br",
          transactionId: transactionId?.toString(),
          price,
        };
      }
      
      // Fallback para formatos legados
      const data = body.data || body;
      const transaction = data.transaction || data;
      const product = data.product || data;
      const customer = data.customer || data;
      
      const productId = product.id_produto || product.product_id || product.id || body.id_produto;
      const buyerName = customer.nome_comprador || customer.name || customer.nome || body.nome_comprador || "Cliente Ticto";
      const buyerEmail = customer.email_comprador || customer.email || body.email_comprador;
      const transactionId = transaction.id_transacao || transaction.transaction_id || transaction.id || body.id_transacao;
      const price = parseFloat(transaction.valor_total || transaction.amount || transaction.value || body.valor_total || 0);
      
      console.log("🎫 [TICTO] Dados extraídos (formato legado):", {
        productId,
        buyerName,
        buyerEmail,
        transactionId,
        price
      });
      
      return {
        productId: productId?.toString(),
        buyerName,
        buyerEmail,
        language: "pt-br",
        transactionId: transactionId?.toString(),
        price,
      };
    }

    case "AppMax":
      return {
        productId: body.product.id,
        buyerName: body.customer.name,
        buyerEmail: body.customer.email,
        language: "pt-br",
        transactionId: body.transaction_id,
        price: parseFloat(body.amount),
      };

    case "Pepper":
      return {
        productId: body.product.external_id,
        buyerName: body.customer.name,
        buyerEmail: body.customer.email,
        language: "pt-br",
        transactionId: body.transaction.id,
        price: parseFloat(body.transaction.amount),
      };

      case "Stripe": {
      console.log('🔵 [STRIPE] Normalizando dados do checkout.session.completed');
      
      const sessionData = body.data?.object || body;
      
      // Prioridade: metadata.product_id > client_reference_id > line_items[0].price.product
      let stripeProductId = sessionData.metadata?.product_id || 
                            sessionData.client_reference_id;
      
      if (!stripeProductId && sessionData.line_items?.data?.[0]) {
        stripeProductId = sessionData.line_items.data[0].price?.product;
      }
            
      // Dados do comprador
      const buyerEmail = sessionData.customer_details?.email || 
                         sessionData.customer_email;
      const buyerName = sessionData.customer_details?.name || 
                        sessionData.shipping?.name || 
                        'Cliente Stripe';
      
      // Preço total (converter centavos para valor real)
      const amountTotal = sessionData.amount_total || 0;
      const price = amountTotal / 100; // Stripe usa centavos
      
      console.log('📊 [STRIPE] Dados extraídos:', {
        productId: stripeProductId,
        buyerEmail,
        buyerName,
        price,
        transactionId: sessionData.id
      });
      
      return {
        productId: stripeProductId,
        buyerName: buyerName,
        buyerEmail: buyerEmail,
        language: "pt-br",
        transactionId: sessionData.id,
        price: price
      };
      }

    case "Cakto": {
      console.log('🎂 [CAKTO] Normalizando dados do webhook');
      
      // ✅ A Cakto envia os dados dentro de body.data
      const caktoData = body.data || {};  // ← ADICIONAR ISTO
      const customerData = caktoData.customer || body.customer || body.client || {};
      const productData = caktoData.product || body.product || {};
      
      return {
        productId: caktoData.product?.id || body.product_id || productData.id || productData.code,
        buyerName: customerData.name || customerData.full_name || "Cliente Cakto",
        buyerEmail: customerData.email,
        language: "pt-br",
        transactionId: caktoData.id || body.order_id || body.transaction_id || body.id,
        price: parseFloat(caktoData.amount || body.amount || body.total || body.value || 0),
      };
    }

    case "Mundpay": {
      console.log('💰 [MUNDPAY] Normalizando dados do webhook');
      
      // Mundpay usa offers array para produtos
      const firstOffer = body.offers?.[0] || {};
      const customer = body.customer || {};
      
      // Product ID: usar o id da primeira oferta
      const productId = firstOffer.id || firstOffer.sku || "unknown";
      
      // Transaction ID: usar o id do pedido
      const transactionId = body.id || "unknown";
      
      // Valor: usar o amount do body (em centavos) ou da oferta
      const amount = parseInt(body.amount || firstOffer.total || firstOffer.price || 0);
      const price = amount / 100; // Mundpay envia em centavos
      
      console.log('💰 [MUNDPAY] Dados extraídos:', {
        productId,
        buyerName: customer.name,
        buyerEmail: customer.email,
        transactionId,
        price
      });
      
      return {
        productId: productId?.toString(),
        buyerName: customer.name || "Cliente Mundpay",
        buyerEmail: customer.email,
        language: "pt-br",
        transactionId: transactionId?.toString(),
        price: price,
      };
    }

    case "Paypal":
      console.log("💳 [PAYPAL] Normalizando dados do webhook");
    
      const resource = body.resource || {};
      const purchaseUnit = resource.purchase_units?.[0] || {};
      const payer = resource.payer || {};
    
      // ✅ aceita APPROVED e COMPLETED
      if (
        body.event_type === "CHECKOUT.ORDER.APPROVED" ||
        body.event_type === "CHECKOUT.ORDER.COMPLETED" ||
        body.event_type === "PAYMENT.CAPTURE.COMPLETED"
      ) {
        return {
          productId: purchaseUnit.custom_id || purchaseUnit.reference_id || "unknown",
          buyerName: `${payer.name?.given_name || ""} ${payer.name?.surname || ""}`.trim() || "Cliente PayPal",
          buyerEmail: payer.email_address || "",
          language: "pt-br",
          transactionId: resource.id || body.id,
          price: parseFloat(purchaseUnit.amount?.value || 0),
        };
      }
    
      console.error("❌ [PAYPAL] Evento ignorado:", body.event_type);
      throw new Error(`PayPal: Evento não processado: ${body.event_type}`);
  }
}
