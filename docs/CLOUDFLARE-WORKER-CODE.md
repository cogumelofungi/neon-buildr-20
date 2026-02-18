# Código do Cloudflare Worker para Domínio Personalizado

Copie e cole este código no seu Cloudflare Worker `migrabook-domain-router`:

```javascript
// HTML da página de erro 404 no estilo MigraBook (dark, compacto, enquadrado)
const get404Page = (hostname, pathname) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 | ${hostname}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0b;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .container {
      width: 100%;
      max-width: 420px;
    }
    .card {
      background: #131316;
      border: 1px solid #1f1f23;
      border-radius: 12px;
      padding: 2rem;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #1f1f23;
    }
    .icon-box {
      width: 48px;
      height: 48px;
      background: #1f1f23;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-box svg {
      width: 24px;
      height: 24px;
      color: #71717a;
    }
    .header-text h1 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #fafafa;
      margin-bottom: 0.25rem;
    }
    .header-text p {
      font-size: 0.875rem;
      color: #71717a;
    }
    .info-box {
      background: #0a0a0b;
      border: 1px solid #1f1f23;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .info-row:not(:last-child) {
      margin-bottom: 0.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #1f1f23;
    }
    .info-label {
      font-size: 0.75rem;
      color: #52525b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .info-value {
      font-size: 0.875rem;
      color: #a1a1aa;
      font-family: ui-monospace, monospace;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .actions {
      display: flex;
      gap: 0.75rem;
    }
    .btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      text-decoration: none;
      border: none;
    }
    .btn svg {
      width: 16px;
      height: 16px;
    }
    .btn-primary {
      background: #fafafa;
      color: #0a0a0b;
    }
    .btn-primary:hover {
      background: #e4e4e7;
    }
    .btn-secondary {
      background: #1f1f23;
      color: #a1a1aa;
      border: 1px solid #27272a;
    }
    .btn-secondary:hover {
      background: #27272a;
      color: #fafafa;
    }
    .footer {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.75rem;
      color: #3f3f46;
    }
    .footer span {
      color: #52525b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="icon-box">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div class="header-text">
          <h1>Página não encontrada</h1>
          <p>Erro 404</p>
        </div>
      </div>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Domínio</span>
          <span class="info-value">${hostname}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Caminho</span>
          <span class="info-value">${pathname}</span>
        </div>
      </div>
      
      <div class="actions">
        <a href="/" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Início
        </a>
        <button onclick="history.back()" class="btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Voltar
        </button>
      </div>
    </div>
    
    <p class="footer">Powered by <span>MigraBook</span></p>
  </div>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const hostname = url.hostname;
    const pathname = url.pathname || "/";

    // NOTA: NÃO bloqueamos mais rotas reservadas aqui.
    // Em domínio customizado, QUALQUER path pode ser mapeado para um app,
    // pois o domínio é diferente do migrabook.app.
    // O React decide o que mostrar baseado no mapeamento do domain-lookup.

    try {
      // 1. Assets sempre do migrabook.app
      const isAsset = /(\.js$|\.css$|\.png$|\.jpg$|\.jpeg$|\.gif$|\.ico$|\.svg$|\.json$|\.woff2?$|\.ttf$|\/assets\/|\/sw)/.test(pathname);
      if (isAsset) {
        const assetUrl = `https://migrabook.app${pathname}${url.search}`;
        const assetResp = await fetch(assetUrl, { redirect: "manual" });
        const headers = new Headers(assetResp.headers);
        headers.set("X-Custom-Domain", hostname);
        return new Response(assetResp.body, { status: assetResp.status, headers });
      }

      // 2. Lookup com domain + path
      const lookupUrl =
        `${env.SUPABASE_URL}/functions/v1/domain-lookup` +
        `?domain=${encodeURIComponent(hostname)}` +
        `&path=${encodeURIComponent(pathname)}`;

      const lookupResp = await fetch(lookupUrl, {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        },
      });

      const data = await lookupResp.json();

      // 3. Se não encontrou domínio ou não tem app mapeado → 404 estilizado
      if (!data.found || (!data.app_link && !data.app_slug)) {
        return new Response(get404Page(hostname, pathname), {
          status: 404,
          headers: { 
            "Content-Type": "text/html; charset=utf-8", 
            "X-Custom-Domain": hostname 
          },
        });
      }

      // 4. Extrair o mapped_path e favicon do lookup
      const mappedPath = data.path || "/";
      const appSlug = data.app_slug || "";
      const faviconUrl = data.favicon_url || "";

      // 5. BLOQUEIO: Se mapeou "/" mas user pediu outra rota → 404 estilizado
      // EXCEÇÃO: Se o path solicitado tem um mapeamento específico, não bloquear
      if (mappedPath === "/" && pathname !== "/" && !data.fallback) {
        // Verificar se existe um mapeamento específico para este path
        // Se data.fallback é true, significa que não existe mapeamento específico
        // e estamos usando o fallback da raiz
        return new Response(get404Page(hostname, pathname), {
          status: 404,
          headers: { 
            "Content-Type": "text/html; charset=utf-8", 
            "X-Custom-Domain": hostname 
          },
        });
      }

      // 6. Buscar o index.html do migrabook.app e INJETAR meta tags
      const htmlResp = await fetch("https://migrabook.app/index.html", {
        headers: { "User-Agent": "Migrabook-Proxy/1.0" },
      });
      
      let htmlContent = await htmlResp.text();
      
      // 7. INJETAR meta tags para o React detectar o domínio customizado
      // Usamos o path SOLICITADO (pathname) para que o React saiba qual path foi acessado
      const metaTags = `
    <meta name="x-custom-domain" content="${hostname}">
    <meta name="x-custom-domain-slug" content="${appSlug}">
    <meta name="x-custom-domain-path" content="${pathname}">
    <meta name="x-custom-domain-mapped-path" content="${mappedPath}">
    <script>
      // Salvar no localStorage para persistência
      localStorage.setItem('__custom_domain__', '${hostname}');
      localStorage.setItem('__custom_domain_slug__', '${appSlug}');
      localStorage.setItem('__custom_domain_path__', '${pathname}');
      
      // Definir rota do PWA
      localStorage.setItem('pwaDefaultRoute', '/');
      localStorage.setItem('pwa_current_app_slug', '${appSlug}');
    </script>`;
      
      // Injetar antes do </head>
      htmlContent = htmlContent.replace('</head>', metaTags + '\n</head>');
      
      // 8. INJETAR favicon customizado se configurado
      if (faviconUrl) {
        // Remover favicons existentes
        htmlContent = htmlContent.replace(/<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*>/gi, '');
        
        // Injetar novo favicon
        const faviconTags = `
    <link rel="icon" href="${faviconUrl}" type="image/x-icon">
    <link rel="shortcut icon" href="${faviconUrl}">
    <link rel="apple-touch-icon" href="${faviconUrl}">`;
        
        htmlContent = htmlContent.replace('</head>', faviconTags + '\n</head>');
      }
      
      // 8. Retornar HTML modificado com headers anti-cache
      const headers = new Headers(htmlResp.headers);
      headers.set("X-Custom-Domain", hostname);
      headers.set("X-Custom-Domain-Slug", appSlug);
      headers.set("Content-Type", "text/html; charset=utf-8");
      headers.delete("Content-Length"); // Remover porque modificamos o conteúdo
      
      // IMPORTANTE: Headers anti-cache para garantir que mudanças de mapeamento
      // sejam refletidas imediatamente (evita servir app antigo após remap)
      headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
      headers.set("Pragma", "no-cache");
      headers.set("Expires", "0");
      
      return new Response(htmlContent, { 
        status: 200, 
        headers 
      });

    } catch (err) {
      return new Response(get404Page(hostname, pathname), {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  },
};
```

## Variáveis de Ambiente do Worker

Configure estas variáveis no Cloudflare Workers:

- `SUPABASE_URL`: `https://jboartixfhvifdecdufq.supabase.co`
- `SUPABASE_ANON_KEY`: `[sua anon key]`

## Como Funciona

1. **SEM Bloqueio de Rotas**: Qualquer path pode ser mapeado para um app em domínio customizado
2. **Lookup do Domínio**: Consulta o Supabase para verificar qual app está mapeado para o domínio + path
3. **Injeção de Meta Tags**: O Worker injeta meta tags no HTML para o React saber qual app renderizar
4. **Persistência**: Os dados são salvos no localStorage para funcionarem entre reloads
5. **Página 404 Personalizada**: Quando o path não tem mapeamento, mostra uma página bonita no estilo MigraBook

## Fluxo de Renderização

```
Usuário acessa: mrnino.com.br/login
        ↓
Worker consulta domain-lookup com domain=mrnino.com.br&path=/login
        ↓
domain-lookup retorna: { app_slug: "meu-app", path: "/login" }
        ↓
Worker busca index.html do migrabook.app
        ↓
Worker injeta meta tags com o slug
        ↓
React detecta meta tags via CustomDomainRouteWrapper
        ↓
React renderiza AppViewer com o slug correto (ignora rota /login do Migrabook)
```

## Página 404 Estilizada

A página de erro 404 inclui:
- Design dark minimalista (estilo MigraBook)
- Ícone de alerta
- Código de erro 404
- Informação do domínio e path que não foi encontrado
- Botão para ir à página inicial
- Link para voltar à página anterior
- Branding "Powered by MigraBook"

## IMPORTANTE: Atualize o Worker!

Você precisa copiar este novo código para o Cloudflare Worker `migrabook-domain-router` para que paths como `/login`, `/admin`, `/checkout` funcionem corretamente em domínios customizados.
