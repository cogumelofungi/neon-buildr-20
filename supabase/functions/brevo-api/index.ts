import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

// Função para buscar todas as páginas de resultados
async function fetchAllPages(
  baseUrl: string, 
  headers: HeadersInit, 
  limit: number = 50
): Promise<any[]> {
  let allResults: any[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}limit=${limit}&offset=${offset}`;
    console.log(`Fetching page: ${url}`);
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle different response formats
    let pageResults: any[] = [];
    if (Array.isArray(data)) {
      pageResults = data;
    } else if (data.lists) {
      pageResults = data.lists;
    } else if (data.contacts) {
      pageResults = data.contacts;
    } else if (data.senders) {
      pageResults = data.senders;
    }
    
    allResults = allResults.concat(pageResults);
    
    const count = data.count || pageResults.length;
    console.log(`Fetched ${pageResults.length} items. Total count: ${count}`);
    
    hasMore = pageResults.length === limit;
    offset += limit;
    
    // Safety limit
    if (offset > 1000) break;
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
    const { action, apiKey, ...params } = await req.json()

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API Key is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const baseUrl = 'https://api.brevo.com/v3';
    const headers: HeadersInit = {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    switch (action) {
      case 'test-connection': {
        console.log('Testing Brevo connection...');
        const response = await fetch(`${baseUrl}/account`, { headers });
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Brevo connection test failed:', data);
          return new Response(
            JSON.stringify({ 
              error: data.message || 'Failed to connect to Brevo',
              code: 'CONNECTION_FAILED'
            }),
            { 
              status: response.status, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        console.log('Brevo connection successful:', data.email);
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: {
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              companyName: data.companyName
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'get-lists': {
        console.log('Fetching Brevo lists...');
        try {
          const lists = await fetchAllPages(`${baseUrl}/contacts/lists`, headers);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              data: { lists }
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error: any) {
          console.error('Error fetching lists:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }

      case 'get-senders': {
        console.log('Fetching Brevo senders...');
        try {
          const response = await fetch(`${baseUrl}/senders`, { headers });
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch senders');
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              data: { senders: data.senders || [] }
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error: any) {
          console.error('Error fetching senders:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }

      case 'get-email-campaigns': {
        console.log('Fetching Brevo email campaigns...');
        try {
          const response = await fetch(`${baseUrl}/emailCampaigns?type=classic&status=sent&limit=50`, { headers });
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch campaigns');
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              data: { campaigns: data.campaigns || [] }
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error: any) {
          console.error('Error fetching campaigns:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }

      case 'add-contact': {
        console.log('Adding contact to Brevo...');
        const { email, firstName, lastName, phone, listIds, attributes } = params;
        
        if (!email) {
          return new Response(
            JSON.stringify({ error: 'Email is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const contactData: any = {
          email,
          updateEnabled: true
        };

        if (listIds && listIds.length > 0) {
          contactData.listIds = listIds;
        }

        // Build attributes object
        const contactAttributes: any = {};
        if (firstName) contactAttributes.FIRSTNAME = firstName;
        if (lastName) contactAttributes.LASTNAME = lastName;
        if (phone) contactAttributes.SMS = phone;
        if (attributes) Object.assign(contactAttributes, attributes);
        
        if (Object.keys(contactAttributes).length > 0) {
          contactData.attributes = contactAttributes;
        }

        console.log('Contact data:', JSON.stringify(contactData));

        const response = await fetch(`${baseUrl}/contacts`, {
          method: 'POST',
          headers,
          body: JSON.stringify(contactData)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          console.error('Error adding contact:', data);
          return new Response(
            JSON.stringify({ 
              error: data.message || 'Failed to add contact',
              code: data.code
            }),
            { 
              status: response.status, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        console.log('Contact added successfully:', data);
        return new Response(
          JSON.stringify({ 
            success: true, 
            data
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'send-transactional-email': {
        console.log('Sending transactional email via Brevo...');
        const { sender, to, subject, htmlContent, textContent, templateId } = params;
        
        const emailData: any = {
          sender,
          to,
          subject
        };

        if (templateId) {
          emailData.templateId = templateId;
        } else {
          emailData.htmlContent = htmlContent;
          if (textContent) emailData.textContent = textContent;
        }

        const response = await fetch(`${baseUrl}/smtp/email`, {
          method: 'POST',
          headers,
          body: JSON.stringify(emailData)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          console.error('Error sending email:', data);
          return new Response(
            JSON.stringify({ 
              error: data.message || 'Failed to send email',
              code: data.code
            }),
            { 
              status: response.status, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        console.log('Email sent successfully:', data);
        return new Response(
          JSON.stringify({ 
            success: true, 
            data
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('Error in Brevo API function:', error);
    
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
    );
  }
})
