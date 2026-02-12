import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
// Função para buscar todas as páginas de resultados
async function fetchAllPages(
  baseUrl: string, 
  options: RequestInit, 
  dataKey: string
): Promise<any[]> {
  let allResults: any[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const url = `${baseUrl}?limit=${limit}&offset=${offset}`;
    console.log(`Fetching page: ${url}`);
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API Error');
    }
    
    const pageResults = data[dataKey] || [];
    allResults = allResults.concat(pageResults);
    
    const total = data.meta?.total || 0;
    console.log(`Fetched ${pageResults.length} items. Total available: ${total}`);
    
    hasMore = (offset + limit) < total;
    offset += limit;
  }
  
  console.log(`Total items fetched: ${allResults.length}`);
  return allResults;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, apiUrl, apiKey, ...params } = await req.json()

    if (!apiUrl || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'API URL and API Key are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate API URL format
    const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.api-us[0-9]+\.com$/
    if (!urlPattern.test(apiUrl)) {
      return new Response(
        JSON.stringify({ error: 'Invalid ActiveCampaign API URL format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let endpoint = ''
    let options: RequestInit = {
      headers: {
        'Api-Token': apiKey,
        'Content-Type': 'application/json',
      }
    }

    switch (action) {
      case 'test-connection':
        endpoint = `${apiUrl}/api/3/users/me`
        break
      
      case 'get-lists':
      case 'get-tags':
      case 'get-automations':
        // Estes casos serão tratados com paginação abaixo
        break
      
      case 'add-contact':
        endpoint = `${apiUrl}/api/3/contacts`
        options.method = 'POST'
        options.body = JSON.stringify({
          contact: {
            email: params.email,
            firstName: params.firstName,
            lastName: params.lastName,
            phone: params.phone,
          }
        })
        break
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    // Tratar casos que precisam de paginação
if (action === 'get-lists' || action === 'get-tags' || action === 'get-automations') {
  let baseEndpoint = '';
  let dataKey = '';
  
  if (action === 'get-lists') {
    baseEndpoint = `${apiUrl}/api/3/lists`;
    dataKey = 'lists';
  } else if (action === 'get-tags') {
    baseEndpoint = `${apiUrl}/api/3/tags`;
    dataKey = 'tags';
  } else if (action === 'get-automations') {
    baseEndpoint = `${apiUrl}/api/3/automations`;
    dataKey = 'automations';
  }
  
  try {
    const allData = await fetchAllPages(baseEndpoint, options, dataKey);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { [dataKey]: allData },
        isReal: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error fetching paginated data',
        code: 'PAGINATION_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

    console.log(`Making request to: ${endpoint}`)
    
    const response = await fetch(endpoint, options)
    const data = await response.json()

    if (!response.ok) {
      // Handle specific ActiveCampaign errors
      if (response.status === 403) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid API credentials. Please check your API URL and API Key.',
            code: 'INVALID_CREDENTIALS'
          }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            error: 'Authentication failed. Please verify your API Key.',
            code: 'AUTH_FAILED'
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          error: data.message || 'ActiveCampaign API error',
          code: 'API_ERROR',
          status: response.status
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        isReal: true // Flag to indicate this is real data
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in ActiveCampaign API function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
