import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DomainVerificationRequest {
  domain: string;
  app_id: string;
  provider?: string;
  nameservers?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Não autorizado');
    }

    const body: DomainVerificationRequest = await req.json();
    const { domain, app_id, provider, nameservers } = body;

    // Validar domínio
    if (!domain || !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/i.test(domain)) {
      throw new Error('Domínio inválido');
    }

    // Verificar se o usuário tem permissão para esta app
    const { data: app, error: appError } = await supabase
      .from('apps')
      .select('id, user_id')
      .eq('id', app_id)
      .eq('user_id', user.id)
      .single();

    if (appError || !app) {
      throw new Error('App não encontrada ou sem permissão');
    }

    // Verificar se o Worker Route está respondendo
    let dnsVerified = false;
    try {
      const testUrl = `https://${domain}/`;
      console.log('Testando Worker Route:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        redirect: 'manual',
        headers: {
          'User-Agent': 'Migrabook-Verifier/1.0'
        }
      });
      
      // Verificar se o Worker adicionou o header customizado
      const customHeader = response.headers.get('X-Custom-Domain');
      
      // Se tiver o header OU se o status for 200/301/302, considera verificado
      dnsVerified = (customHeader === domain) || 
                     response.status === 200 || 
                     response.status === 301 || 
                     response.status === 302;
      
      console.log('Verificação DNS:', {
        domain,
        status: response.status,
        customHeader,
        verified: dnsVerified
      });
      
    } catch (error) {
      console.error('Erro ao verificar Worker Route:', error);
      dnsVerified = false;
    }

    // Inserir ou atualizar domínio
    const { data: customDomain, error: domainError } = await supabase
      .from('custom_domains')
      .upsert({
        user_id: user.id,
        app_id: app_id,
        domain: domain.toLowerCase(),
        status: dnsVerified ? 'verifying' : 'pending',
        dns_verified: dnsVerified,
        dns_verified_at: dnsVerified ? new Date().toISOString() : null,
        last_dns_check: new Date().toISOString(),
        provider: provider || null,
        nameservers: nameservers ? JSON.stringify(nameservers) : null,
        ssl_status: dnsVerified ? 'provisioning' : 'pending'
      }, { onConflict: 'domain' })
      .select()
      .single();

    if (domainError) {
      console.error('Erro ao salvar domínio:', domainError);
      throw new Error('Erro ao salvar domínio: ' + domainError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        domain: customDomain,
        dns_status: {
          verified: dnsVerified
        },
        message: dnsVerified 
          ? 'DNS verificado! Aguardando provisionamento de SSL...'
          : 'Domínio registrado. Configure os registros DNS e tente novamente.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro na verificação:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Função auxiliar para verificar registro A via DNS-over-HTTPS
async function verifyARecord(domain: string, expectedIp: string): Promise<boolean> {
  try {
    const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`;
    const response = await fetch(url, {
      headers: { 'accept': 'application/dns-json' }
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    if (!data.Answer || data.Answer.length === 0) return false;
    
    return data.Answer.some((record: any) => record.data === expectedIp);
  } catch (error) {
    console.error(`Erro ao verificar DNS de ${domain}:`, error);
    return false;
  }
}
