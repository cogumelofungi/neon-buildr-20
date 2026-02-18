import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMaintenanceMode = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkMaintenanceMode();

    // Escutar mudanças nas configurações em tempo real
    const channel = supabase
      .channel('admin_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_settings',
          filter: 'key=eq.maintenance_mode'
        },
        (payload) => {
          console.log('🔧 Configuração de manutenção atualizada:', payload);
          if (payload.new && 'value' in payload.new) {
            setIsMaintenanceMode((payload.new as any).value === 'true');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar modo de manutenção:', error);
        setIsMaintenanceMode(false);
      } else {
        setIsMaintenanceMode(data?.value === 'true');
      }
    } catch (error) {
      console.error('Erro ao verificar modo de manutenção:', error);
      setIsMaintenanceMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  return { isMaintenanceMode, isLoading };
};
