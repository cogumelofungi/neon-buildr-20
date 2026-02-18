# Cloudflare Worker para Proxy de Webhooks

Este documento explica como configurar um Cloudflare Worker para proxiar webhooks para o Supabase Edge Functions, permitindo usar URLs personalizadas como `webhook.migrabook.app`.

## Código do Worker

Crie um novo Cloudflare Worker chamado `migrabook-webhook-proxy` e cole este código:

```javascript
export default {
  async fetch(request, env) {
    // Apenas aceitar POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);
    
    // URL de destino (Supabase Edge Function)
    const targetUrl = 'https://jboartixfhvifdecdufq.supabase.co/functions/v1/receive-purchase-webhook';
    
    try {
      // Clonar o request e encaminhar para o Supabase
      const body = await request.text();
      
      // Criar headers para encaminhar
      const headers = new Headers();
      
      // Copiar headers relevantes do request original
      const headersToForward = [
        'content-type',
        'x-yampi-hmac-sha256',
        'hottok',
        'x-hotmart-hottok',
        'x-ticto-token',
        'stripe-signature',
        'authorization',
        'user-agent'
      ];
      
      for (const header of headersToForward) {
        const value = request.headers.get(header);
        if (value) {
          headers.set(header, value);
        }
      }
      
      // Se não tiver content-type, definir como application/json
      if (!headers.has('content-type')) {
        headers.set('content-type', 'application/json');
      }
      
      // Log para debug (remover em produção se necessário)
      console.log(`[WEBHOOK PROXY] Forwarding to ${targetUrl}`);
      console.log(`[WEBHOOK PROXY] Headers:`, Object.fromEntries(headers));
      
      // Fazer a requisição para o Supabase
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body
      });
      
      // Retornar a resposta do Supabase
      const responseBody = await response.text();
      
      return new Response(responseBody, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'X-Proxy-By': 'migrabook-webhook-proxy'
        }
      });
      
    } catch (error) {
      console.error('[WEBHOOK PROXY] Error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Proxy error', 
          message: error.message 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
};
```

## Configuração no Cloudflare

### 1. Criar o Worker

1. Acesse o Cloudflare Dashboard
2. Vá para **Workers & Pages**
3. Clique em **Create Worker**
4. Nomeie como `migrabook-webhook-proxy`
5. Cole o código acima
6. Clique em **Deploy**

### 2. Configurar o Domínio Customizado

1. No Worker criado, vá para **Settings** > **Triggers**
2. Em **Custom Domains**, clique em **Add Custom Domain**
3. Digite `webhook.migrabook.app`
4. Confirme a adição

### 3. Verificar DNS

Certifique-se de que o domínio `webhook.migrabook.app` está apontando para o Worker:

- **Tipo**: CNAME
- **Nome**: webhook
- **Conteúdo**: `migrabook-webhook-proxy.{seu-subdomain}.workers.dev`
- **Proxy**: Ativo (nuvem laranja)

Ou alternativamente, use um registro do tipo Worker Route no painel do Cloudflare.

## Como Funciona

1. Plataforma (Yampi, Hotmart, etc.) envia webhook para `https://webhook.migrabook.app`
2. Cloudflare Worker recebe a requisição
3. Worker encaminha para `https://jboartixfhvifdecdufq.supabase.co/functions/v1/receive-purchase-webhook`
4. Supabase processa o webhook
5. Resposta é retornada para a plataforma

## Vantagens

- **URL limpa**: `webhook.migrabook.app` em vez do link do Supabase
- **Branding**: URL personalizada para os clientes
- **Centralização**: Todas as plataformas usam o mesmo endpoint
- **Logs**: Cloudflare registra todas as requisições

## Testando

Após configurar, você pode testar com curl:

```bash
curl -X POST https://webhook.migrabook.app \
  -H "Content-Type: application/json" \
  -d '{"event":"test","merchant":{"alias":"migrabook"}}'
```

Você deve receber uma resposta do Supabase (pode ser erro de plataforma não identificada, mas confirma que o proxy está funcionando).

## Eventos Suportados por Plataforma

### Yampi
- ✅ `order.paid` - Pedido pago (PROCESSA)
- ✅ `order.approved` - Pedido aprovado (PROCESSA)
- ⏭️ `order.created` - Pedido criado (IGNORA)
- ⏭️ `customer.created` - Cliente criado (IGNORA)
- ⏭️ Outros eventos (IGNORA)

### Hotmart
- ✅ `PURCHASE_COMPLETE` - Compra completa (PROCESSA)
- ✅ `PURCHASE_APPROVED` - Compra aprovada (PROCESSA)
- ⏭️ `PURCHASE_WAITING_PAYMENT` - Aguardando pagamento (IGNORA)
- ⏭️ Outros eventos não-finais (IGNORA)

### Outras plataformas
Cada plataforma tem seus eventos específicos configurados no código do `receive-purchase-webhook`.
