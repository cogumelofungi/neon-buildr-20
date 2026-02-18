import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Range, Content-Type, Authorization',
  'Access-Control-Expose-Headers': 'Accept-Ranges, Content-Range, Content-Length, Content-Type',
};

const WHITELIST = [
  /supabase\.co\/(?:storage|cdn)/i,
  /storage\.googleapis\.com/i,
  /cdn\.supabase\.co/i,
];

function allowed(url: string): boolean {
  try {
    return WHITELIST.some(r => r.test(url));
  } catch {
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url).searchParams.get('url');

    if (!url) {
      return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!allowed(url)) {
      return new Response(JSON.stringify({ error: 'URL not allowed' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const forwardHeaders: Record<string, string> = {};
    const range = req.headers.get('range');
    if (range) {
      forwardHeaders['range'] = range;
    }

    const upstream = await fetch(url, {
      method: 'GET',
      headers: forwardHeaders,
      redirect: 'follow',
    });

    const outHeaders = new Headers(upstream.headers);
    outHeaders.set('Access-Control-Allow-Origin', '*');
    outHeaders.set('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Range, Content-Length, Content-Type');
    // Forçar Content-Type apenas se o upstream não enviar (evita sobrescrever octet-stream válido)
    if (!outHeaders.has('Content-Type') || outHeaders.get('Content-Type') === 'application/octet-stream') {
      outHeaders.set('Content-Type', 'application/pdf');
    }
    outHeaders.set('Content-Disposition', 'inline');
    outHeaders.set('X-Content-Type-Options', 'nosniff');
    outHeaders.set('Cache-Control', 'public, max-age=3600');
    outHeaders.delete('X-Frame-Options');

    return new Response(upstream.body, {
      status: upstream.status,
      headers: outHeaders,
    });
  } catch (error) {
    console.error('[pdf-proxy] Error:', error);
    return new Response(JSON.stringify({ error: 'Proxy error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
