import "https://deno.land/x/xhr@0.1.0/mod.ts";
// Force redeploy - v2.4.0 - CART PANDA STORE-SLUG ADICIONADO
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FUNCTION_VERSION = 'v2.4.0'; // Cart Panda com store-slug
console.log(`🚀 [INIT] Function version: ${FUNCTION_VERSION}`);

// Configurações das APIs das plataformas
const PLATFORM_CONFIGS = {
  'Kiwify': {
    baseUrl: 'https://public-api.kiwify.com.br/v1',
    endpoint: (productId: string) => `/products/${productId}`,
    authHeader: (token: string, accountId?: string) => {
    const headers: Record<string, string> = { 'Authorization': `Bearer ${token}` };
    if (accountId) headers['x-kiwify-account-id'] = accountId;
    return headers;
  }
  },
  'Perfect Pay': {
    baseUrl: 'https://perfectpay.com.br',  // URL base (não usada)
    endpoint: (productId: string) => `/checkout/${productId}`,  // Não usada
    authHeader: (token: string) => ({ 'x-api-key': token })  // Não usada
  },
  'Monetizze': {
    baseUrl: 'https://api.monetizze.com.br/v1',
    endpoint: (productId: string) => `/products/${productId}`,
    authHeader: (token: string) => ({ 'Authorization': `Bearer ${token}` })
  },
  'Cart Panda': {
    baseUrl: 'https://accounts.cartpanda.com/api/v3',
    endpoint: (productId: string, storeSlug?: string) => `/${storeSlug}/products/${productId}`,
    authHeader: (token: string) => ({ 'Authorization': `Bearer ${token}` })
  },
  'Braip': {
    baseUrl: 'https://api.braip.com/public/v1',
    endpoint: (productId: string) => `/products/${productId}`,
    authHeader: (token: string) => ({ 'x-api-key': token })
  },
  'Hotmart': {
    baseUrl: 'https://developers.hotmart.com',
    endpoint: (productId: string) => `/payments/api/v1/sales/history?product_id=${productId}&max_results=1`,
    authHeader: (token: string) => ({ 'Authorization': `Bearer ${token}` })
  },
  'Eduzz': {
    baseUrl: 'https://api.eduzz.com',
    endpoint: (productId: string) => `/myeduzz/v1/products/${productId}`,
    authHeader: (token: string) => ({ 'Authorization': `Bearer ${token}` })
  }
};

// Função para obter access_token via OAuth (Kiwify)
async function getKiwifyAccessToken(clientId: string, clientSecret: string, accountId: string): Promise<string> {
  console.log('🔐 Gerando access_token via OAuth...');
  
  const tokenUrl = 'https://public-api.kiwify.com.br/v1/oauth/token';
  
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'products'
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-kiwify-account-id': accountId
    },
    body: body.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Erro ao gerar token:', response.status, errorText);
    throw new Error(`Falha ao gerar access_token: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ Access token gerado com sucesso');
  return data.access_token;
}

// Função para obter access_token via OAuth (Hotmart)
async function getHotmartAccessToken(clientId: string, clientSecret: string, basicToken: string): Promise<string> {
  console.log('🔐 [HOTMART] Gerando access_token via OAuth...');
  
  const tokenUrl = `https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`;
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicToken}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [HOTMART] Erro ao gerar token:', response.status, errorText);
    throw new Error(`Falha ao gerar access_token Hotmart: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ [HOTMART] Access token gerado com sucesso');
  return data.access_token;
}

// Função para obter access_token via OAuth (Eduzz)
async function getEduzzAccessToken(clientId: string, clientSecret: string): Promise<string> {
  console.log('🔐 [EDUZZ] Gerando access_token via OAuth...');
  
  const tokenUrl = 'https://accounts-api.eduzz.com/oauth/token';
  
  const body = JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials'
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: body
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [EDUZZ] Erro ao gerar token:', response.status, errorText);
    throw new Error(`Falha ao gerar access_token Eduzz: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ [EDUZZ] Access token gerado com sucesso');
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    
    // Mapear campos específicos do PayPal para campos genéricos
    const client_id = requestBody.client_id || requestBody.paypal_client_id;
    const client_secret = requestBody.client_secret || requestBody.paypal_secret;
    
    const {
      platform,
      product_id,
      api_token,
      webhook_token,
      basic_token,
      account_id,
      store_slug,
      cartpanda_bearer_token,
      cartpanda_store_slug
    } = requestBody;
    
    console.log('📦 [REQUEST] Body completo recebido:', JSON.stringify(requestBody, null, 2));

  const bodyRaw = { 
  platform, 
  product_id, 
  api_token, 
  webhook_token,
  client_id,
  client_secret,
  basic_token,
  account_id,
  store_slug,
  cartpanda_bearer_token,
  cartpanda_store_slug
};
console.log('📦 [RAW BODY]:', JSON.stringify(bodyRaw, null, 2));
console.log('🔍 Validando produto:', { platform, product_id });
console.log('🔍 [VALIDATE] Params:', { 
  platform, 
  product_id, 
  has_api_token: !!api_token,
  has_webhook_token: !!webhook_token,
  has_client_id: !!client_id,
  has_client_secret: !!client_secret,
  has_account_id: !!account_id,
  has_basic_token: !!basic_token,
  has_cartpanda_bearer_token: !!cartpanda_bearer_token,
  has_cartpanda_store_slug: !!cartpanda_store_slug
});

// Validar parâmetros básicos
if (!platform || !product_id) {
  return new Response(
    JSON.stringify({
      valid: false,
      error: "Parâmetros inválidos: platform e product_id são obrigatórios",
    }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

// Validação específica por plataforma
if (platform === 'Kiwify') {
  const hasToken = !!api_token;
  const hasCredentials = !!(client_id && client_secret);
  
  if (!hasToken && !hasCredentials) {
    return new Response(
      JSON.stringify({
        valid: false,
        error: "Kiwify requer api_token OU (client_id + client_secret)",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  
  if (!account_id) {
    return new Response(
      JSON.stringify({
        valid: false,
        error: "Kiwify requer account_id",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
} else if (platform === 'Hotmart') {
  const hasToken = !!api_token;
  const hasCredentials = !!(client_id && client_secret && basic_token);
  
  if (!hasToken && !hasCredentials) {
    return new Response(
      JSON.stringify({
        valid: false,
        error: "Hotmart requer api_token OU (client_id + client_secret + basic_token)",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
} else if (platform === 'Eduzz') {
  const hasToken = !!api_token;
  const hasCredentials = !!(client_id && client_secret);
  
  if (!hasToken && !hasCredentials) {
    return new Response(
      JSON.stringify({
        valid: false,
        error: "Eduzz requer api_token OU (client_id + client_secret)",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  // ⚡ Stripe: Validação via webhook_token
  } else if (platform === 'Stripe') {
    console.log('🔍 [STRIPE] Verificando webhook_token...');
    console.log('🔍 [STRIPE] webhook_token recebido:', webhook_token ? 'SIM' : 'NÃO');
    
    // ✅ Exigir webhook_token
    if (!webhook_token || webhook_token.trim() === '') {
      console.error('❌ [STRIPE] Webhook Signing Secret ausente ou vazio!');
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Webhook Signing Secret do Stripe é obrigatório' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // ✅ Validar formato do Stripe Webhook Signing Secret
    if (!webhook_token.startsWith('whsec_')) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Webhook Signing Secret inválido (deve começar com "whsec_")' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // ✅ Stripe não tem API pública para validar produtos com signing secret
    // A validação real será feita quando o webhook chegar
    console.log('✅ [STRIPE] Webhook Signing Secret validado (formato OK)');
    console.log(`📦 [STRIPE] Product ID: ${product_id}`);
    console.log(`🔐 [STRIPE] Secret salvado: ${webhook_token.substring(0, 12)}...`);
    
    return new Response(JSON.stringify({ 
      valid: true, 
      product: {
        name: `Produto Stripe - ${product_id}`,
        status: 'active',
        platform: 'Stripe'
      }
    }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
    
} else if (platform !== 'Perfect Pay' && platform !== 'Cart Panda' && platform !== 'Stripe' && platform !== 'Cakto' && platform !== 'Paypal') {
  // Outras plataformas: apenas api_token
  if (!api_token) {
    return new Response(
      JSON.stringify({
        valid: false,
        error: "Token API é obrigatório",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}

    // ⚡ Perfect Pay: Validação (não tem API pública)
    if (platform === 'Perfect Pay') {
      console.log('🔍 [PERFECT PAY] Verificando webhook_token...');
      console.log('🔍 [PERFECT PAY] webhook_token recebido:', webhook_token ? 'SIM' : 'NÃO');
      console.log('🔍 [PERFECT PAY] webhook_token valor:', webhook_token);
      
      // ✅ Exigir webhook_token
      if (!webhook_token || webhook_token.trim() === '') {
        console.error('❌ [PERFECT PAY] Token de webhook ausente ou vazio!');
        return new Response(JSON.stringify({ 
          valid: false, 
          error: 'Token de Webhook da Perfect Pay é obrigatório' 
        }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
      }
      
      // ✅ Validar formato do token
      if (!webhook_token.match(/^[a-f0-9]{32}$/i)) {
        return new Response(JSON.stringify({ 
          valid: false, 
          error: 'Token de Webhook inválido (deve ter 32 caracteres hexadecimais)' 
        }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
      }
      
      // ✅ Perfect Pay não tem API pública - validação será feita no webhook
      console.log('✅ [PERFECT PAY] Webhook token validado (formato OK)');
      console.log(`📦 [PERFECT PAY] Product ID: ${product_id}`);
      console.log(`🔐 [PERFECT PAY] Token salvado: ${webhook_token.substring(0, 8)}...`);
      
      return new Response(JSON.stringify({ 
        valid: true, 
        product: {
        name: `Produto Perfect Pay - ${product_id}`,
        status: 'active',
        platform: 'Perfect Pay'
      }
      }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // ⚡ Cakto: Validação via webhook_token
    else if (platform === 'Cakto') {
    console.log('🔍 [CAKTO] Verificando webhook_token...');
    console.log('🔍 [CAKTO] webhook_token recebido:', webhook_token ? 'SIM' : 'NÃO');
    console.log('🔍 [CAKTO] webhook_token valor:', webhook_token);
    
    // ✅ Exigir webhook_token
    if (!webhook_token || webhook_token.trim() === '') {
      console.error('❌ [CAKTO] Chave secreta do webhook ausente ou vazia!');
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Chave Secreta do Webhook da Cakto é obrigatória' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // ✅ Validar formato do token (UUID v4)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!webhook_token.match(uuidRegex)) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Chave Secreta do Webhook inválida (deve ser um UUID válido)' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // ✅ Cakto não tem API pública - validação será feita no webhook
    console.log('✅ [CAKTO] Webhook token validado (formato OK)');
    console.log(`📦 [CAKTO] Product ID: ${product_id}`);
    console.log(`🔐 [CAKTO] Token salvado: ${webhook_token.substring(0, 8)}...`);
    
    return new Response(JSON.stringify({ 
      valid: true, 
      product: {
        name: `Produto Cakto - ${product_id}`,
        status: 'active',
        platform: 'Cakto'
      }
    }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
    
    // ⚡ PayPal: Validação via OAuth
    else if (platform === 'Paypal') {
      console.log('🔍 [PAYPAL] Iniciando validação de credenciais...');
      
      // ✅ Validar presença das credenciais
      if (!client_id || !client_secret) {
        console.error('❌ [PAYPAL] Client ID e Secret ausentes!');
        return new Response(JSON.stringify({ 
          valid: false, 
          error: 'PayPal: Client ID e Client Secret são obrigatórios' 
        }), { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
      
      console.log(`🔐 [PAYPAL] Client ID: ${client_id.substring(0, 8)}...`);
      console.log(`🔐 [PAYPAL] Secret: ${client_secret.substring(0, 8)}...`);
      
      // ✅ Testar autenticação com PayPal OAuth
      const authUrl = 'https://api-m.sandbox.paypal.com/v1/oauth2/token';
      const authString = btoa(`${client_id}:${client_secret}`);
      
      try {
        console.log('🔑 [PAYPAL] Testando autenticação...');
        
        const authResponse = await fetch(authUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials'
        });
        
        if (!authResponse.ok) {
          const errorText = await authResponse.text();
          console.error('❌ [PAYPAL] Erro na autenticação:', errorText);
          
          return new Response(JSON.stringify({ 
            valid: false, 
            error: 'PayPal: Credenciais inválidas. Verifique o Client ID e Secret no painel do PayPal.' 
          }), { 
            status: 200, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          });
        }
        
        const authData = await authResponse.json();
        console.log('✅ [PAYPAL] Autenticação bem-sucedida!');
        console.log(`🎟️ [PAYPAL] Access Token gerado: ${authData.access_token.substring(0, 20)}...`);
        
        // ✅ PayPal autenticado com sucesso
        return new Response(JSON.stringify({ 
          valid: true, 
          product: {
            name: `Produto PayPal - ${product_id}`,
            status: 'active',
            platform: 'Paypal'
          }
        }), { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
        
      } catch (error: any) {
        console.error('❌ [PAYPAL] Erro ao conectar com PayPal:', error.message);
        return new Response(JSON.stringify({ 
          valid: false, 
          error: `PayPal: Erro ao conectar com a API - ${error.message}` 
        }), { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
    }

  // ⚡ Cart Panda: Validação com store_slug
  else if (platform === 'Cart Panda') {
    console.log('🔍 [CART PANDA] Iniciando validação...');
    
    // ✅ Usar os campos específicos do Cart Panda
    const bearerToken = cartpanda_bearer_token || api_token;
    const storeSlugValue = cartpanda_store_slug || store_slug || account_id;
    
    if (!storeSlugValue) {
      console.error('❌ [CART PANDA] Store Slug não fornecido!');
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Store Slug é obrigatório para Cart Panda. Informe o subdomínio da sua loja (ex: minhaloja se sua URL é minhaloja.mycartpanda.com)' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
  
  if (!bearerToken) {
    console.error('❌ [CART PANDA] Bearer Token não fornecido!');
    return new Response(JSON.stringify({ 
      valid: false, 
      error: 'Bearer Token é obrigatório para Cart Panda' 
    }), { 
      status: 400, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
  
  console.log(`🏪 [CART PANDA] Store Slug: ${storeSlugValue}`);
  console.log(`🔐 [CART PANDA] Token: ${bearerToken.substring(0, 8)}...`);
  
  // Construir URL da API
  const config = PLATFORM_CONFIGS['Cart Panda'];
  const apiUrl = `${config.baseUrl}${config.endpoint(product_id, storeSlugValue)}`;
  console.log('📡 [CART PANDA] Chamando API:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        ...config.authHeader(bearerToken),  // ✅ Usar bearerToken
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📥 [CART PANDA] Status HTTP: ${response.status}`);
    
    if (response.status === 404) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: `Produto "${product_id}" não encontrado no Cart Panda. Verifique se o ID está correto e se o produto está ativo.` 
      }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    if (response.status === 401) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Bearer Token inválido ou expirado. Gere um novo token no painel Cart Panda.' 
      }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    if (response.status === 403) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Sem permissão para acessar este produto. Verifique se o token tem as permissões corretas.' 
      }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [CART PANDA] Erro na API:`, errorText);
      return new Response(JSON.stringify({ 
        valid: false, 
        error: `Erro ao validar produto no Cart Panda: ${response.statusText}` 
      }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Sucesso!
    const productData = await response.json();
    console.log('✅ [CART PANDA] Produto validado com sucesso!');
    
    return new Response(JSON.stringify({ 
      valid: true, 
      product: {
        id: product_id,
        name: productData.name || productData.title || `Produto Cart Panda - ${product_id}`,
        status: productData.status || 'active',
        platform: 'Cart Panda'
      }
    }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
    
  } catch (error: any) {
    console.error('❌ [CART PANDA] Erro na requisição:', error.message);
    return new Response(JSON.stringify({ 
      valid: false, 
      error: `Erro ao conectar com Cart Panda: ${error.message}` 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
}
    
    // Verificar se a plataforma é suportada
    const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
    if (!config) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `Plataforma "${platform}" não suportada para validação via API` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
// Se precisar gerar token via OAuth
let finalToken = api_token;

if (!api_token) {
  try {
    if (platform === 'Kiwify' && client_id && client_secret && account_id) {
      finalToken = await getKiwifyAccessToken(client_id, client_secret, account_id);
      console.log('✅ [OAUTH] Token Kiwify gerado com sucesso');
    } else if (platform === 'Hotmart' && client_id && client_secret && basic_token) {
      finalToken = await getHotmartAccessToken(client_id, client_secret, basic_token);
      console.log('✅ [OAUTH] Token Hotmart gerado com sucesso');
    } else if (platform === 'Eduzz' && client_id && client_secret) {
      finalToken = await getEduzzAccessToken(client_id, client_secret);
      console.log('✅ [OAUTH] Token Eduzz gerado com sucesso');
    }
  } catch (error: any) {
    console.error(`❌ [OAUTH] Falha ao gerar token para ${platform}:`, error.message);
    return new Response(
      JSON.stringify({
        valid: false,
        error: `Erro ao gerar access_token para ${platform}: ${error.message}. Verifique suas credenciais.`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}

    // Fazer requisição à API da plataforma
    const url = `${config.baseUrl}${config.endpoint(product_id)}`;
    const headers = {
      "Content-Type": "application/json",
      ...config.authHeader(finalToken, account_id),
    };

    console.log('📡 Chamando API:', url);

    const response = await fetch(url, { headers });

    if (response.status === 404) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `Produto "${product_id}" não encontrado na plataforma ${platform}` 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (response.status === 401) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Token API inválido ou expirado' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!response.ok) {
      // Tratamento especial de erros para Hotmart
      if (platform === 'Hotmart') {
        let errorMsg = '';
        
        switch(response.status) {
          case 400:
            errorMsg = 'Product ID inválido ou mal formatado';
            break;
          case 401:
            errorMsg = 'Token de acesso inválido ou expirado';
            break;
          case 403:
            errorMsg = 'Sem permissão para acessar este produto';
            break;
          default:
            errorMsg = `Erro ${response.status}: ${response.statusText}`;
        }
        
        console.error(`❌ [HOTMART] ${errorMsg}`);
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: `Hotmart: ${errorMsg}` 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Erro na API da ${platform}: ${response.statusText}`);
    }

    // Ler o corpo da resposta como texto primeiro
    const rawBody = await response.text();
    console.log(`🔍 [${platform}] Status HTTP:`, response.status);
    console.log(`🔍 [${platform}] Body (primeiros 200 chars):`, rawBody.substring(0, 200));
    
    // Se o corpo estiver vazio (204 ou resposta vazia)
    if (!rawBody || rawBody.trim() === '') {
      console.log(`✅ [${platform}] Resposta vazia - considerando produto válido`);
      return new Response(
        JSON.stringify({ 
          valid: true, 
          product: {
            name: `Produto ${platform}`,
            status: 'active'
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Tentar fazer parse do JSON
    let productData;
    try {
      productData = JSON.parse(rawBody);
    } catch (parseError) {
      console.error(`❌ [${platform}] Erro ao fazer parse do JSON:`, parseError);
      console.log(`🔍 [${platform}] Raw body que falhou:`, rawBody);
      
      // Se for Hotmart e falhou o parse, ainda considerar válido
      if (platform === 'Hotmart') {
        console.log('⚠️ [HOTMART] Parse falhou mas considerando válido por ter retornado 200');
        return new Response(
          JSON.stringify({ 
            valid: true, 
            product: {
              name: 'Produto Hotmart',
              status: 'active'
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Para outras plataformas, retornar erro
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `Resposta inválida da API ${platform}` 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validação especial para Hotmart
    if (platform === 'Hotmart') {
      console.log('🔍 [HOTMART] Resposta da API:', JSON.stringify(productData, null, 2));
      
      // Hotmart pode retornar:
      // 1. { items: [...] } no histórico de vendas
      // 2. Objeto vazio {} se o produto existe mas não tem vendas
      // 3. Array vazio [] 
      
      const hasItems = productData?.items && Array.isArray(productData.items);
      const isEmptyObject = productData && typeof productData === 'object' && Object.keys(productData).length === 0;
      const isEmptyArray = Array.isArray(productData) && productData.length === 0;
      
      // Se recebeu qualquer resposta estruturada da API, o produto existe
      if (hasItems || isEmptyObject || isEmptyArray || (productData && typeof productData === 'object')) {
        console.log('✅ [HOTMART] Produto validado com sucesso');
        
        const productName = productData?.items?.[0]?.product?.name || 
                           productData?.product?.name || 
                           productData?.name ||
                           'Produto Hotmart';
        
        return new Response(
          JSON.stringify({ 
            valid: true, 
            product: {
              name: productName,
              status: 'active',
              platform: 'Hotmart'
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('⚠️ [HOTMART] Resposta inesperada:', productData);
    }
    
    console.log('✅ Produto validado:', productData);

    return new Response(
      JSON.stringify({ 
        valid: true, 
        product: {
          name: productData.name || productData.title || 'Produto sem nome',
          status: productData.status || 'active'
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erro na validação:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
