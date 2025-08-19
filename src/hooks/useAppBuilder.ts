import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  file?: File;
}

export interface AppBuilderData {
  id?: string;
  appName: string;
  appDescription: string;
  appColor: string;
  customLink: string;
  customDomain: string;
  allowPdfDownload: boolean;
  template: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal';
  appIcon?: UploadedFile;
  appCover?: UploadedFile;
  mainProduct?: UploadedFile;
  mainProductThumbnail?: UploadedFile;
  bonus1?: UploadedFile;
  bonus1Thumbnail?: UploadedFile;
  bonus2?: UploadedFile;
  bonus2Thumbnail?: UploadedFile;
  bonus3?: UploadedFile;
  bonus3Thumbnail?: UploadedFile;
  bonus4?: UploadedFile;
  bonus4Thumbnail?: UploadedFile;
  bonus5?: UploadedFile;
  bonus5Thumbnail?: UploadedFile;
  bonus6?: UploadedFile;
  bonus6Thumbnail?: UploadedFile;
  bonus7?: UploadedFile;
  bonus7Thumbnail?: UploadedFile;
  // Textos personalizáveis
  mainProductLabel: string;
  mainProductDescription: string;
  bonusesLabel: string;
  bonus1Label: string;
  bonus2Label: string;
  bonus3Label: string;
  bonus4Label: string;
  bonus5Label: string;
  bonus6Label: string;
  bonus7Label: string;
}

const defaultAppData: AppBuilderData = {
  appName: '',
  appDescription: '',
  appColor: '#4783F6',
  customLink: '',
  customDomain: '',
  allowPdfDownload: true,
  template: 'classic',
  // Textos padrão
  mainProductLabel: 'PRODUTO PRINCIPAL',
  mainProductDescription: 'Disponível para download',
  bonusesLabel: 'BÔNUS EXCLUSIVOS',
  bonus1Label: 'Bônus 1',
  bonus2Label: 'Bônus 2',
  bonus3Label: 'Bônus 3',
  bonus4Label: 'Bônus 4',
  bonus5Label: 'Bônus 5',
  bonus6Label: 'Bônus 6',
  bonus7Label: 'Bônus 7',
};

export const useAppBuilder = () => {
  const [appData, setAppData] = useState<AppBuilderData>(defaultAppData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  // Auto-save para rascunho
  const saveAsDraft = useCallback(async (data: AppBuilderData) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      setIsSaving(true);

      const draftData = {
        user_id: user.id,
        nome: data.appName,
        descricao: data.appDescription,
        cor: data.appColor,
        link_personalizado: data.customLink,
        allow_pdf_download: data.allowPdfDownload,
        template: data.template,
        icone_url: data.appIcon?.url,
        capa_url: data.appCover?.url,
        produto_principal_url: data.mainProduct?.url,
        bonus1_url: data.bonus1?.url,
        bonus2_url: data.bonus2?.url,
        bonus3_url: data.bonus3?.url,
        bonus4_url: data.bonus4?.url,
        bonus5_url: data.bonus5?.url,
        bonus6_url: data.bonus6?.url,
        bonus7_url: data.bonus7?.url,
        main_product_label: data.mainProductLabel,
        main_product_description: data.mainProductDescription,
        bonuses_label: data.bonusesLabel,
        bonus1_label: data.bonus1Label,
        bonus2_label: data.bonus2Label,
        bonus3_label: data.bonus3Label,
        bonus4_label: data.bonus4Label,
        bonus5_label: data.bonus5Label,
        bonus6_label: data.bonus6Label,
        bonus7_label: data.bonus7Label,
      };

      if (data.id) {
        const { error } = await supabase
          .from('draft_apps')
          .update(draftData)
          .eq('id', data.id);

        if (error) throw error;
      } else {
        const { data: newDraft, error } = await supabase
          .from('draft_apps')
          .insert(draftData)
          .select()
          .single();

        if (error) throw error;
        
        setAppData(prev => ({ ...prev, id: newDraft.id }));
      }
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Upload de arquivo
  const uploadFile = useCallback(async (file: File, type: string): Promise<string> => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Usuário não autenticado');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('app-assets')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('app-assets')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }, []);

  // Validar slug único com debounce
  const validateSlug = useCallback(async (slug: string): Promise<boolean> => {
    if (!slug.trim()) return true;
    
    const { data, error } = await supabase
      .from('apps')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Erro ao validar slug:', error);
      return false;
    }

    return !data; // true se slug disponível (não existe)
  }, []);

  // Atualizar dados do app
  const updateAppData = useCallback((field: keyof AppBuilderData, value: any) => {
    setAppData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-save com debounce
      setTimeout(() => {
        saveAsDraft(newData);
      }, 1000);
      
      return newData;
    });
  }, [saveAsDraft]);

  // Upload de arquivo e atualização
  const handleFileUpload = useCallback(async (
    field: keyof AppBuilderData,
    file: File,
    type: string
  ) => {
    try {
      setIsLoading(true);
      const url = await uploadFile(file, type);
      
      const uploadedFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        url,
        file
      };

      updateAppData(field, uploadedFile);

      toast({
        title: "Upload realizado com sucesso!",
        description: `${file.name} foi carregado.`,
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload do arquivo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [uploadFile, updateAppData, toast]);

  // Reset dos dados
  const resetApp = useCallback(async () => {
    try {
      setAppData(defaultAppData);
      
      // Limpar rascunho do banco se existir
      if (appData.id) {
        const { error } = await supabase
          .from('draft_apps')
          .delete()
          .eq('id', appData.id);

        if (error) throw error;
      }

      toast({
        title: "App resetado",
        description: "Todos os dados foram limpos.",
      });
    } catch (error) {
      console.error('Erro ao resetar:', error);
      toast({
        title: "Erro ao resetar",
        description: "Não foi possível resetar o app.",
        variant: "destructive",
      });
    }
  }, [appData.id, toast]);

  // Publicar app
  const publishApp = useCallback(async (): Promise<string | null> => {
    try {
      setIsPublishing(true);
      
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Usuário não autenticado');

      // Validar campos obrigatórios
      if (!appData.appName.trim()) {
        throw new Error('Nome do app é obrigatório');
      }
      if (!appData.appColor) {
        throw new Error('Cor do app é obrigatória');
      }

      // Verificar limite de apps antes de publicar
      const { data: userStatus, error: userError } = await supabase
        .from('user_status')
        .select(`
          plans (
            name,
            app_limit
          )
        `)
        .eq('user_id', user.id)
        .single();

      const plan = userStatus?.plans || { name: 'Empresarial', app_limit: 10 };

      // Contar apps publicados do usuário
      const { data: existingApps, error: countError } = await supabase
        .from('apps')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'publicado');

      if (countError) throw countError;

      const currentAppsCount = existingApps?.length || 0;

      // Verificar se é uma republicação (por slug personalizado)
      let republicationApp = null;
      if (appData.customLink.trim()) {
        const { data } = await supabase
          .from('apps')
          .select('slug, user_id')
          .eq('slug', appData.customLink.trim())
          .eq('user_id', user.id)
          .maybeSingle();
        republicationApp = data;
      }

      // Se não é republicação e atingiu o limite, bloquear
      if (!republicationApp && currentAppsCount >= plan.app_limit) {
        throw new Error(`LIMIT_REACHED:${plan.name}:${currentAppsCount}:${plan.app_limit}`);
      }

      let finalSlug = '';
      
      if (republicationApp) {
        // Republicar mantendo o mesmo slug
        finalSlug = republicationApp.slug;
      } else {
        // Verificar se o slug personalizado está disponível
        if (appData.customLink.trim()) {
          const isSlugAvailable = await validateSlug(appData.customLink);
          if (!isSlugAvailable) {
            throw new Error('Este link já existe, escolha outro.');
          }
          finalSlug = appData.customLink.trim();
        } else {
          // Gerar slug único para novo app
          const { data: slugData, error: slugError } = await supabase
            .rpc('generate_unique_slug', {
              base_slug: appData.customLink,
              app_name: appData.appName
            });

          if (slugError) throw slugError;
          finalSlug = slugData;
        }
      }

      const appPublicData = {
        user_id: user.id,
        nome: appData.appName,
        descricao: appData.appDescription,
        slug: finalSlug,
        cor: appData.appColor,
        link_personalizado: appData.customLink,
        allow_pdf_download: appData.allowPdfDownload,
        template: appData.template,
        icone_url: appData.appIcon?.url,
        capa_url: appData.appCover?.url,
        produto_principal_url: appData.mainProduct?.url,
        bonus1_url: appData.bonus1?.url,
        bonus2_url: appData.bonus2?.url,
        bonus3_url: appData.bonus3?.url,
        bonus4_url: appData.bonus4?.url,
        bonus5_url: appData.bonus5?.url,
        bonus6_url: appData.bonus6?.url,
        bonus7_url: appData.bonus7?.url,
        main_product_label: appData.mainProductLabel,
        main_product_description: appData.mainProductDescription,
        bonuses_label: appData.bonusesLabel,
        bonus1_label: appData.bonus1Label,
        bonus2_label: appData.bonus2Label,
        bonus3_label: appData.bonus3Label,
        bonus4_label: appData.bonus4Label,
        bonus5_label: appData.bonus5Label,
        bonus6_label: appData.bonus6Label,
        bonus7_label: appData.bonus7Label,
        status: 'publicado'
      };

      if (republicationApp) {
        // Atualizar app existente
        const { error: updateError } = await supabase
          .from('apps')
          .update(appPublicData)
          .eq('user_id', user.id)
          .eq('slug', finalSlug);

        if (updateError) throw updateError;
      } else {
        // Inserir novo app
        const { error: insertError } = await supabase
          .from('apps')
          .insert(appPublicData);

        if (insertError) throw insertError;
      }

      // Limpar rascunho após publicação
      if (appData.id) {
        await supabase
          .from('draft_apps')
          .delete()
          .eq('id', appData.id);
      }

      // Usar o domínio base especificado
      const baseUrl = 'https://preview--neon-buildr-86.lovable.app';
      const appUrl = `${baseUrl}/app/${finalSlug}`;
      
      toast({
        title: "App publicado com sucesso!",
        description: `Seu app está disponível em: ${appUrl}`,
      });

      return appUrl;
    } catch (error: any) {
      console.error('Erro ao publicar:', error);
      
      let errorMessage = "Não foi possível publicar o app.";
      
      if (error.message?.includes('LIMIT_REACHED:')) {
        const [, planName, currentCount, maxCount] = error.message.split(':');
        errorMessage = `LIMIT_REACHED:${planName}:${currentCount}:${maxCount}`;
      } else if (error.message?.includes('duplicate key value violates unique constraint')) {
        errorMessage = "Este link já existe, escolha outro.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao publicar",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsPublishing(false);
    }
  }, [appData, toast, validateSlug]);

  // Carregar rascunho existente
  const loadDraft = useCallback(async () => {
    try {
      setIsLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data: draft, error } = await supabase
        .from('draft_apps')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (draft) {
        setAppData({
          id: draft.id,
          appName: draft.nome,
          appDescription: (draft as any).descricao || 'PLR Products',
          appColor: draft.cor,
          customLink: draft.link_personalizado || '',
          customDomain: '',
          allowPdfDownload: (draft as any).allow_pdf_download ?? true,
          template: (draft as any).template || 'classic',
          mainProductLabel: (draft as any).main_product_label || 'PRODUTO PRINCIPAL',
          mainProductDescription: (draft as any).main_product_description || 'Disponível para download',
          bonusesLabel: (draft as any).bonuses_label || 'BÔNUS EXCLUSIVOS',
          bonus1Label: (draft as any).bonus1_label || 'Bônus 1',
          bonus2Label: (draft as any).bonus2_label || 'Bônus 2',
          bonus3Label: (draft as any).bonus3_label || 'Bônus 3',
          bonus4Label: (draft as any).bonus4_label || 'Bônus 4',
          bonus5Label: (draft as any).bonus5_label || 'Bônus 5',
          bonus6Label: (draft as any).bonus6_label || 'Bônus 6',
          bonus7Label: (draft as any).bonus7_label || 'Bônus 7',
          appIcon: draft.icone_url ? {
            id: 'icon',
            name: 'icon',
            url: draft.icone_url
          } : undefined,
          appCover: draft.capa_url ? {
            id: 'cover',
            name: 'cover',
            url: draft.capa_url
          } : undefined,
          mainProduct: draft.produto_principal_url ? {
            id: 'main',
            name: 'main',
            url: draft.produto_principal_url
          } : undefined,
          // As thumbnails ficam apenas em memória para pré-visualização
          mainProductThumbnail: undefined,
          bonus1: draft.bonus1_url ? {
            id: 'bonus1',
            name: 'bonus1',
            url: draft.bonus1_url
          } : undefined,
          bonus1Thumbnail: undefined,
          bonus2: draft.bonus2_url ? {
            id: 'bonus2',
            name: 'bonus2',
            url: draft.bonus2_url
          } : undefined,
          bonus2Thumbnail: undefined,
          bonus3: draft.bonus3_url ? {
            id: 'bonus3',
            name: 'bonus3',
            url: draft.bonus3_url
          } : undefined,
          bonus3Thumbnail: undefined,
          bonus4: draft.bonus4_url ? {
            id: 'bonus4',
            name: 'bonus4',
            url: draft.bonus4_url
          } : undefined,
          bonus4Thumbnail: undefined,
          bonus5: (draft as any).bonus5_url ? {
            id: 'bonus5',
            name: 'bonus5',
            url: (draft as any).bonus5_url
          } : undefined,
          bonus5Thumbnail: undefined,
          bonus6: (draft as any).bonus6_url ? {
            id: 'bonus6',
            name: 'bonus6',
            url: (draft as any).bonus6_url
          } : undefined,
          bonus6Thumbnail: undefined,
          bonus7: (draft as any).bonus7_url ? {
            id: 'bonus7',
            name: 'bonus7',
            url: (draft as any).bonus7_url
          } : undefined,
          bonus7Thumbnail: undefined,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar rascunho:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar rascunho na inicialização
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  return {
    appData,
    isLoading,
    isSaving,
    isPublishing,
    updateAppData,
    handleFileUpload,
    resetApp,
    publishApp,
    loadDraft,
    validateSlug
  };
};