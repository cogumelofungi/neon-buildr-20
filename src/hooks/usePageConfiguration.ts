import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ElementStyles {
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  lineHeight?: string;
  letterSpacing?: string;
  content?: string;        // Conteúdo de texto editável
  responsive?: {
    desktop?: Record<string, string>;
    tablet?: Record<string, string>;
    mobile?: Record<string, string>;
  };
}

interface PageConfig {
  [elementId: string]: ElementStyles;
}

export const usePageConfiguration = (pageName: string) => {
  const queryClient = useQueryClient();

  // 📖 Buscar configurações salvas do Supabase
  const { data: config, isLoading } = useQuery({
    queryKey: ['page-config', pageName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_configurations')
        .select('*')
        .eq('page_name', pageName)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao carregar configurações:', error);
        return {};
      }
      
      return (data?.styles as PageConfig) || {};
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // 💾 Salvar configurações no Supabase
  const { mutateAsync: saveConfiguration, isPending: isSaving } = useMutation({
    mutationFn: async (styles: PageConfig) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('page_configurations')
        .upsert({
          page_name: pageName,
          styles: styles as any,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_name'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-config', pageName] });
      toast.success('✅ Configurações salvas para todos os usuários!');
    },
    onError: (error) => {
      console.error('Erro ao salvar:', error);
      toast.error('❌ Erro ao salvar configurações');
    }
  });

  // 🔄 Recarregar configurações do servidor
  const reloadConfiguration = async () => {
    await queryClient.invalidateQueries({ queryKey: ['page-config', pageName] });
  };

  return {
    config: config || {},
    isLoading,
    isSaving,
    saveConfiguration,
    reloadConfiguration
  };
};
