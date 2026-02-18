import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let domain = url.searchParams.get("domain");
    const path = url.searchParams.get("path") || "/";
    
    if (!domain) {
      return new Response(JSON.stringify({
        found: false,
        error: "Domain parameter is required"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Remove www. prefix
    if (domain.startsWith("www.")) {
      domain = domain.replace("www.", "");
    }
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Buscar domínio verificado
    const { data: domainData, error: domainError } = await supabase
      .from("custom_domains")
      .select("*")
      .eq("domain", domain)
      .eq("is_verified", true)
      .limit(1);

    if (domainError || !domainData || domainData.length === 0) {
      return new Response(JSON.stringify({
        found: false,
        error: "Domain not found or not verified"
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const customDomain = domainData[0];

    // Buscar mapeamento para o path específico
    const { data: mapping, error: mappingError } = await supabase
      .from("domain_app_mappings")
      .select("*, apps(slug, nome)")
      .eq("custom_domain_id", customDomain.id)
      .eq("path", path)
      .limit(1);

    // Helper para extrair slug do app_link
    const extractSlugFromAppLink = (appLink: string): string | null => {
      try {
        const appUrl = new URL(appLink);
        const pathParts = appUrl.pathname.split('/').filter(Boolean);
        return pathParts[0] || null;
      } catch {
        // Se não for URL válida, retornar o próprio valor
        return appLink?.replace(/^\//, '') || null;
      }
    };

    // Se encontrou mapeamento específico para o path
    if (mapping && mapping.length > 0) {
      const appSlug = (mapping[0] as any).apps?.slug || extractSlugFromAppLink(mapping[0].app_link);
      
      return new Response(JSON.stringify({
        found: true,
        domain: customDomain.domain,
        path: mapping[0].path,
        app_id: mapping[0].app_id,
        app_link: mapping[0].app_link,
        app_slug: appSlug,
        redirect_to: mapping[0].app_link,
        favicon_url: customDomain.favicon_url || null
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Se o path não é raiz e não tem mapeamento, NÃO fazer fallback para raiz
    // Cada path deve ter seu próprio mapeamento explícito
    // Retornar no_mapping para que o Worker mostre 404
    if (path !== "/") {
      return new Response(JSON.stringify({
        found: true,
        domain: customDomain.domain,
        path: path,
        error: "No mapping found for this path",
        no_mapping: true,
        favicon_url: customDomain.favicon_url || null
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Fallback para o app_link legado na tabela custom_domains
    if (customDomain.app_link) {
      const appSlug = extractSlugFromAppLink(customDomain.app_link);
      
      return new Response(JSON.stringify({
        found: true,
        domain: customDomain.domain,
        app_link: customDomain.app_link,
        app_slug: appSlug,
        redirect_to: customDomain.app_link,
        legacy: true,
        favicon_url: customDomain.favicon_url || null
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Nenhum mapeamento encontrado
    return new Response(JSON.stringify({
      found: true,
      domain: customDomain.domain,
      error: "No app mapping found for this path",
      no_mapping: true
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
