import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomDomain {
  id: string;
  domain: string;
  status: 'pending' | 'verifying' | 'active' | 'failed' | 'suspended';
  dns_verified: boolean;
  ssl_status: 'pending' | 'provisioning' | 'active' | 'failed' | 'expired';
  created_at: string;
}

export const useCustomDomain = (appId?: string) => {
  const [customDomain, setCustomDomain] = useState<CustomDomain | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!appId) {
      setIsLoading(false);
      return;
    }

    fetchCustomDomain();
  }, [appId]);

  const fetchCustomDomain = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_domains')
        .select('*')
        .eq('app_id', appId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar domínio:', error);
      }

      if (data) {
        setCustomDomain({
          ...data,
          status: (['active', 'pending', 'verifying', 'failed', 'suspended'].includes(data.status))
            ? data.status as 'active' | 'pending' | 'verifying' | 'failed' | 'suspended'
            : 'pending' as const,
          ssl_status: data.ssl_status && ['pending', 'provisioning', 'active', 'failed', 'expired'].includes(data.ssl_status)
            ? data.ssl_status as 'pending' | 'provisioning' | 'active' | 'failed' | 'expired'
            : null
        });
      } else {
        setCustomDomain(null);
      }
    } catch (error) {
      console.error('Erro ao buscar domínio personalizado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('custom_domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;

      toast({
        title: "Domínio removido",
        description: "O domínio personalizado foi removido com sucesso"
      });

      setCustomDomain(null);
    } catch (error) {
      toast({
        title: "Erro ao remover domínio",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    customDomain,
    isLoading,
    refetch: fetchCustomDomain,
    removeDomain
  };
};
