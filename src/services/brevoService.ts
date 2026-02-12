import { supabase } from '@/integrations/supabase/client';

export interface BrevoConfig {
  apiKey: string;
}

export interface BrevoList {
  id: number;
  name: string;
  totalBlacklisted?: number;
  totalSubscribers?: number;
}

export interface BrevoSender {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

export interface BrevoCampaign {
  id: number;
  name: string;
  subject: string;
  status: string;
}

export interface BrevoAccountInfo {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

export class BrevoService {
  private async callFunction(payload: any) {
    try {
      const { data, error } = await supabase.functions.invoke('brevo-api', {
        body: payload
      });

      if (error) {
        console.error('Supabase function error:', error);
        // Parse error message if it's JSON
        try {
          const errorData = typeof error.message === 'string' ? JSON.parse(error.message) : error;
          throw new Error(errorData.error || error.message || 'Connection failed');
        } catch {
          throw new Error(error.message || 'Connection failed');
        }
      }

      // Check if the response itself indicates an error
      if (data && data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error: any) {
      console.error('Error calling brevo-api:', error);
      throw new Error(error.message || 'Failed to connect to Brevo API');
    }
  }

  async testConnection(config: BrevoConfig): Promise<{ success: boolean; data?: BrevoAccountInfo; error?: string }> {
    try {
      const result = await this.callFunction({
        action: 'test-connection',
        apiKey: config.apiKey
      });
      return result;
    } catch (error: any) {
      return { success: false, error: error.message || 'Connection failed' };
    }
  }

  async getLists(config: BrevoConfig): Promise<BrevoList[]> {
    const result = await this.callFunction({
      action: 'get-lists',
      apiKey: config.apiKey
    });

    if (result.success && result.data?.lists) {
      return result.data.lists;
    }

    throw new Error(result.error || 'Failed to fetch lists');
  }

  async getSenders(config: BrevoConfig): Promise<BrevoSender[]> {
    const result = await this.callFunction({
      action: 'get-senders',
      apiKey: config.apiKey
    });

    if (result.success && result.data?.senders) {
      return result.data.senders;
    }

    throw new Error(result.error || 'Failed to fetch senders');
  }

  async getCampaigns(config: BrevoConfig): Promise<BrevoCampaign[]> {
    const result = await this.callFunction({
      action: 'get-email-campaigns',
      apiKey: config.apiKey
    });

    if (result.success && result.data?.campaigns) {
      return result.data.campaigns;
    }

    throw new Error(result.error || 'Failed to fetch campaigns');
  }

  async addContact(config: BrevoConfig, contactData: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    listIds?: number[];
    attributes?: Record<string, any>;
  }) {
    return this.callFunction({
      action: 'add-contact',
      apiKey: config.apiKey,
      ...contactData
    });
  }

  async sendTransactionalEmail(config: BrevoConfig, emailData: {
    sender: { name: string; email: string };
    to: Array<{ email: string; name?: string }>;
    subject: string;
    htmlContent?: string;
    textContent?: string;
    templateId?: number;
  }) {
    return this.callFunction({
      action: 'send-transactional-email',
      apiKey: config.apiKey,
      ...emailData
    });
  }
}

export const brevoService = new BrevoService();
