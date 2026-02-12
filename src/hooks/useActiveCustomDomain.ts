import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActiveDomain {
  id: string;
  domain: string;
  verification_code: string;
}

/**
 * Hook para verificar se o usuário tem um domínio personalizado ativo
 */
export const useActiveCustomDomain = () => {
  const [activeDomain, setActiveDomain] = useState<ActiveDomain | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActiveDomain = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setActiveDomain(null);
          setIsLoading(false);
          return;
        }

        const { data: domains, error } = await supabase
          .from("custom_domains")
          .select("id, domain, verification_code")
          .eq("user_id", user.id)
          .eq("is_verified", true)
          .limit(1);

        if (error) {
          console.error("Erro ao buscar domínio ativo:", error);
          setActiveDomain(null);
        } else if (domains && domains.length > 0) {
          setActiveDomain(domains[0]);
        } else {
          setActiveDomain(null);
        }
      } catch (error) {
        console.error("Erro ao verificar domínio ativo:", error);
        setActiveDomain(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadActiveDomain();
  }, []);

  return {
    activeDomain,
    hasActiveDomain: !!activeDomain,
    isLoading
  };
};
