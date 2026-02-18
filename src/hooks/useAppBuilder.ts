import { appDataSchema } from '@/schemas/appValidation';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { ThemeConfig, THEME_PRESETS } from '@/types/theme';
import { getAppUrl } from '@/config/domains';
import { pdfValidationSchema, imageValidationSchema, mp3ValidationSchema } from '@/schemas/appValidation';
import { isValidSlug, RESERVED_SLUGS, normalizeSlug } from '@/utils/slugValidation';

export interface UploadFileResult {
  url: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  file?: File;
}

export interface VideoModule {
  id: string;
  title: string;
  videos: {
    id: string;
    title: string;
    youtubeUrl: string;
  }[];
}

export interface UploadModule {
  id: string;
  title: string;
  items: string[]; // Slot IDs: "main", "bonus1", "bonus2", etc.
}

export interface AppBuilderData {
  id?: string;
  publishedSlug?: string; // Slug do app publicado para detectar republicação
  appName: string;
  appNameColor: string;
  appDescription: string;
  appDescriptionColor: string;
  appColor: string;
  appTheme: 'light' | 'dark';
  customLink: string;
  customDomain: string;
  allowPdfDownload: boolean;
  template: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal' | 'exclusive' | 'units' | 'academy' | 'flow' | 'members';
  themeConfig?: ThemeConfig;
  
  // Video Course
  videoCourseEnabled: boolean;
  videoModules: VideoModule[];
  videoCourseTitle: string;
  videoCourseDescription: string;
  videoCourseButtonText: string;
  videoCourseImage?: UploadedFile;
  videoCourseBackground?: UploadedFile;
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
  bonus8?: UploadedFile;
  bonus8Thumbnail?: UploadedFile;
  bonus9?: UploadedFile;
  bonus9Thumbnail?: UploadedFile;
  bonus10?: UploadedFile;
  bonus10Thumbnail?: UploadedFile;
  bonus11?: UploadedFile;
  bonus11Thumbnail?: UploadedFile;
  bonus12?: UploadedFile;
  bonus12Thumbnail?: UploadedFile;
  bonus13?: UploadedFile;
  bonus13Thumbnail?: UploadedFile;
  bonus14?: UploadedFile;
  bonus14Thumbnail?: UploadedFile;
  bonus15?: UploadedFile;
  bonus15Thumbnail?: UploadedFile;
  bonus16?: UploadedFile;
  bonus16Thumbnail?: UploadedFile;
  bonus17?: UploadedFile;
  bonus17Thumbnail?: UploadedFile;
  bonus18?: UploadedFile;
  bonus18Thumbnail?: UploadedFile;
  bonus19?: UploadedFile;
  bonus19Thumbnail?: UploadedFile;
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
  bonus8Label: string;
  bonus9Label: string;
  bonus10Label: string;
  bonus11Label: string;
  bonus12Label: string;
  bonus13Label: string;
  bonus14Label: string;
  bonus15Label: string;
  bonus16Label: string;
  bonus17Label: string;
  bonus18Label: string;
  bonus19Label: string;
  // Cores dos bônus (para template Exclusive)
  bonus1Color: string;
  bonus2Color: string;
  bonus3Color: string;
  bonus4Color: string;
  bonus5Color: string;
  bonus6Color: string;
  bonus7Color: string;
  bonus8Color: string;
  bonus9Color: string;
  bonus10Color: string;
  bonus11Color: string;
  bonus12Color: string;
  bonus13Color: string;
  bonus14Color: string;
  bonus15Color: string;
  bonus16Color: string;
  bonus17Color: string;
  bonus18Color: string;
  bonus19Color: string;
  // Botão de visualização
  viewButtonLabel: string;
  // Sistema de notificações
  notificationEnabled: boolean;
  notificationTitle: string;
  notificationMessage: string;
  notificationImage?: UploadedFile;
  notificationLink: string;
  notificationButtonText: string;
  notificationButtonColor: string;
  notificationIcon: string;
  
  // Sistema de WhatsApp
  whatsappEnabled: boolean;
  whatsappPhone: string;
  whatsappMessage: string;
  whatsappPosition: 'bottom-right' | 'bottom-left';
  whatsappButtonColor: string;
  whatsappButtonText: string;
  whatsappShowText: boolean;
  whatsappIconSize: 'small' | 'medium' | 'large';
  
  // Template Members
  membersHeaderSize: 'small' | 'medium' | 'large';
  
  // Template Academy
  trainingLogo?: UploadedFile;
  training1Cover?: UploadedFile;
  training2Cover?: UploadedFile;
  training3Cover?: UploadedFile;
  training4Cover?: UploadedFile;
  
  // Template Classic
  showAppIcon: boolean;
  
  // Template Showcase
  showcaseTextPosition: 'bottom' | 'middle' | 'top';
  
  // Template Corporate - Product Backgrounds
  mainProductBackground?: UploadedFile;
  bonus1Background?: UploadedFile;
  bonus2Background?: UploadedFile;
  bonus3Background?: UploadedFile;
  bonus4Background?: UploadedFile;
  bonus5Background?: UploadedFile;
  bonus6Background?: UploadedFile;
  bonus7Background?: UploadedFile;
  bonus8Background?: UploadedFile;
  bonus9Background?: UploadedFile;
  bonus10Background?: UploadedFile;
  bonus11Background?: UploadedFile;
  bonus12Background?: UploadedFile;
  bonus13Background?: UploadedFile;
  bonus14Background?: UploadedFile;
  bonus15Background?: UploadedFile;
  bonus16Background?: UploadedFile;
  bonus17Background?: UploadedFile;
  bonus18Background?: UploadedFile;
  bonus19Background?: UploadedFile;
  
  // Template Shop
  shopRemoveCardBorder: boolean;
  
  // Template Members
  membersShowCardBorder: boolean;
  
  // Template Flow
  flowShowCardBorder: boolean;
  
  // Upload Modules
  uploadModulesEnabled: boolean;
  uploadModules: UploadModule[];
}

const defaultAppData: AppBuilderData = {
  appName: 'Meu App',
  appNameColor: '#ffffff',
  appDescription: 'Descrição do App',
  appDescriptionColor: '#ffffff',
  appColor: '#4783F6',
  appTheme: 'dark',
  customLink: '',
  customDomain: '',
  allowPdfDownload: false,
  template: 'classic',
  themeConfig: THEME_PRESETS.classic,
  // Textos padrão vazios - placeholders são apenas para orientação na UI
  mainProductLabel: '',
  mainProductDescription: '',
  bonusesLabel: '',
  bonus1Label: '',
  bonus2Label: '',
  bonus3Label: '',
  bonus4Label: '',
  bonus5Label: '',
  bonus6Label: '',
  bonus7Label: '',
  bonus8Label: '',
  bonus9Label: '',
  bonus10Label: '',
  bonus11Label: '',
  bonus12Label: '',
  bonus13Label: '',
  bonus14Label: '',
  bonus15Label: '',
  bonus16Label: '',
  bonus17Label: '',
  bonus18Label: '',
  bonus19Label: '',
  // Cores dos bônus (template Exclusive)
  bonus1Color: '#3b82f6',
  bonus2Color: '#10b981',
  bonus3Color: '#f97316',
  bonus4Color: '#f59e0b',
  bonus5Color: '#14b8a6',
  bonus6Color: '#8b5cf6',
  bonus7Color: '#ec4899',
  bonus8Color: '#06b6d4',
  bonus9Color: '#84cc16',
  bonus10Color: '#ef4444',
  bonus11Color: '#22c55e',
  bonus12Color: '#a855f7',
  bonus13Color: '#eab308',
  bonus14Color: '#0ea5e9',
  bonus15Color: '#f43f5e',
  bonus16Color: '#6366f1',
  bonus17Color: '#14b8a6',
  bonus18Color: '#d946ef',
  bonus19Color: '#fb923c',
  // Botão padrão
  viewButtonLabel: 'Ver',
  // Notificação
  notificationEnabled: false,
  notificationTitle: '',
  notificationMessage: '',
  notificationImage: undefined,
  notificationLink: '',
  notificationButtonText: '',
  notificationButtonColor: '#f97316',
  notificationIcon: 'gift',

  // WhatsApp padrão
  whatsappEnabled: false,
  whatsappPhone: '',
  whatsappMessage: 'Olá! Vim através do app.',
  whatsappPosition: 'bottom-right',
  whatsappButtonColor: '#25D366',
  whatsappButtonText: 'Fale Conosco',
  whatsappShowText: true,
  whatsappIconSize: 'medium',
  
  // Template Members
  membersHeaderSize: 'large',
  
  // Template Classic
  showAppIcon: true,
  
  // Template Showcase
  showcaseTextPosition: 'bottom',
  
  // Template Shop
  shopRemoveCardBorder: false,
  
  // Template Members
  membersShowCardBorder: false,
  
  // Template Flow
  flowShowCardBorder: false,
  
  // Upload Modules
  uploadModulesEnabled: false,
  uploadModules: [],
  
  // Video Course
  videoCourseEnabled: false,
  videoModules: [],
  videoCourseTitle: 'Curso em Vídeo',
  videoCourseDescription: 'Descrição do Curso',
  videoCourseButtonText: 'Assistir Aulas',
  videoCourseImage: undefined,
  videoCourseBackground: undefined,
};

export const useAppBuilder = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  // Mapeamento de todos os valores padrão em cada idioma para detectar quando atualizar
  const allDefaultValues = {
    appName: ['Nome do App', 'App Name', 'Nombre de la App'],
    appDescription: ['Descrição do App', 'App Description', 'Descripción de la App'],
    mainProductLabel: ['Produto Principal', 'Main Product', 'Producto Principal'],
    mainProductDescription: ['Descrição do Produto', 'Product Description', 'Descripción del Producto'],
    bonusesLabel: ['Bônus', 'Bonuses', 'Bonos'],
    bonus1Label: ['Bônus 1', 'Bonus 1', 'Bono 1'],
    bonus2Label: ['Bônus 2', 'Bonus 2', 'Bono 2'],
    bonus3Label: ['Bônus 3', 'Bonus 3', 'Bono 3'],
    bonus4Label: ['Bônus 4', 'Bonus 4', 'Bono 4'],
    bonus5Label: ['Bônus 5', 'Bonus 5', 'Bono 5'],
    bonus6Label: ['Bônus 6', 'Bonus 6', 'Bono 6'],
    bonus7Label: ['Bônus 7', 'Bonus 7', 'Bono 7'],
    bonus8Label: ['Bônus 8', 'Bonus 8', 'Bono 8'],
    bonus9Label: ['Bônus 9', 'Bonus 9', 'Bono 9'],
    viewButtonLabel: ['Ver', 'View', 'Ver'],
    whatsappMessage: ['Olá! Vim através do app.', 'Hello! I came through the app.', '¡Hola! Vine a través de la app.'],
    whatsappButtonText: ['Fale Conosco', 'Contact Us', 'Contáctanos'],
    videoCourseTitle: ['Curso em Vídeo', 'Video Course', 'Curso en Vídeo'],
    videoCourseDescription: ['Descrição do Curso', 'Course Description', 'Descripción del Curso'],
    videoCourseButtonText: ['Assistir Aulas', 'Watch Classes', 'Ver Clases'],
  };

  // Função para verificar se um valor é um valor padrão de qualquer idioma
  const isDefaultValue = useCallback((field: keyof typeof allDefaultValues, value: string): boolean => {
    return allDefaultValues[field]?.includes(value) || false;
  }, []);

  const getDefaultAppData = useCallback((): AppBuilderData => ({
    appName: t('phonemockup.default.appName'),
    appNameColor: '#ffffff',
    appDescription: t('phonemockup.default.appDescription'),
    appDescriptionColor: '#ffffff',
    appColor: '#4783F6',
    appTheme: 'dark',
    customLink: '',
    customDomain: '',
    allowPdfDownload: false,
    template: 'classic',
    themeConfig: THEME_PRESETS.classic,
    // Textos padrão preenchidos
    mainProductLabel: t('phonemockup.default.mainProductLabel'),
    mainProductDescription: t('phonemockup.default.mainProductDescription'),
    bonusesLabel: t('phonemockup.default.bonusesLabel'),
    bonus1Label: t('phonemockup.default.bonus1Label'),
    bonus2Label: t('phonemockup.default.bonus2Label'),
    bonus3Label: t('phonemockup.default.bonus3Label'),
    bonus4Label: t('phonemockup.default.bonus4Label'),
    bonus5Label: t('custom.bonus.name') + ' 5',
    bonus6Label: t('custom.bonus.name') + ' 6',
    bonus7Label: t('custom.bonus.name') + ' 7',
    bonus8Label: t('custom.bonus.name') + ' 8',
    bonus9Label: t('custom.bonus.name') + ' 9',
    bonus10Label: t('custom.bonus.name') + ' 10',
    bonus11Label: t('custom.bonus.name') + ' 11',
    bonus12Label: t('custom.bonus.name') + ' 12',
    bonus13Label: t('custom.bonus.name') + ' 13',
    bonus14Label: t('custom.bonus.name') + ' 14',
    bonus15Label: t('custom.bonus.name') + ' 15',
    bonus16Label: t('custom.bonus.name') + ' 16',
    bonus17Label: t('custom.bonus.name') + ' 17',
    bonus18Label: t('custom.bonus.name') + ' 18',
    bonus19Label: t('custom.bonus.name') + ' 19',
    // Cores dos bônus (template Exclusive)
    bonus1Color: '#3b82f6',
    bonus2Color: '#10b981',
    bonus3Color: '#f97316',
    bonus4Color: '#f59e0b',
    bonus5Color: '#14b8a6',
    bonus6Color: '#8b5cf6',
    bonus7Color: '#ec4899',
    bonus8Color: '#06b6d4',
    bonus9Color: '#84cc16',
    bonus10Color: '#ef4444',
    bonus11Color: '#22c55e',
    bonus12Color: '#a855f7',
    bonus13Color: '#eab308',
    bonus14Color: '#0ea5e9',
    bonus15Color: '#f43f5e',
    bonus16Color: '#6366f1',
    bonus17Color: '#14b8a6',
    bonus18Color: '#d946ef',
    bonus19Color: '#fb923c',
    // Botão padrão
    viewButtonLabel: t('phonemockup.default.viewButtonLabel'),
    // Notificação
    notificationEnabled: false,
    notificationTitle: '',
    notificationMessage: '',
    notificationImage: undefined,
    notificationLink: '',
    notificationButtonText: '',
    notificationButtonColor: '#f97316',
    notificationIcon: 'gift',

    // WhatsApp padrão
    whatsappEnabled: false,
    whatsappPhone: '',
    whatsappMessage: t('phonemockup.default.whatsappMessage'),
    whatsappPosition: 'bottom-right',
    whatsappButtonColor: '#25D366',
    whatsappButtonText: t('phonemockup.default.whatsappButtonText'),
    whatsappShowText: true,
    whatsappIconSize: 'medium',
    
    // Template Members
    membersHeaderSize: 'large',
    
    // Template Classic
    showAppIcon: true,
    
    // Template Showcase
    showcaseTextPosition: 'bottom' as const,
    
    // Template Shop
    shopRemoveCardBorder: false,
    
    // Template Members
    membersShowCardBorder: false,
    
    // Template Flow
    flowShowCardBorder: false,
    
    // Video Course
    videoCourseEnabled: false,
    videoModules: [],
    videoCourseTitle: t('custom.videoCourse.titlePlaceholder'),
    videoCourseDescription: t('custom.videoCourse.descriptionPlaceholder'),
    videoCourseButtonText: t('custom.videoCourse.buttonTextPlaceholder'),
    videoCourseImage: undefined,
    videoCourseBackground: undefined,
    // Upload Modules
    uploadModulesEnabled: false,
    uploadModules: [],
  }), [t]);

  const [appData, setAppData] = useState<AppBuilderData>(() => getDefaultAppData());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Atualiza os valores padrão quando o idioma muda
  useEffect(() => {
    setAppData(prev => {
      const updates: Partial<AppBuilderData> = {};
      
      // Verifica cada campo que pode ter valor padrão e atualiza se necessário
      if (isDefaultValue('appName', prev.appName)) {
        updates.appName = t('phonemockup.default.appName');
      }
      if (isDefaultValue('appDescription', prev.appDescription)) {
        updates.appDescription = t('phonemockup.default.appDescription');
      }
      if (isDefaultValue('mainProductLabel', prev.mainProductLabel)) {
        updates.mainProductLabel = t('phonemockup.default.mainProductLabel');
      }
      if (isDefaultValue('mainProductDescription', prev.mainProductDescription)) {
        updates.mainProductDescription = t('phonemockup.default.mainProductDescription');
      }
      if (isDefaultValue('bonusesLabel', prev.bonusesLabel)) {
        updates.bonusesLabel = t('phonemockup.default.bonusesLabel');
      }
      if (isDefaultValue('bonus1Label', prev.bonus1Label)) {
        updates.bonus1Label = t('phonemockup.default.bonus1Label');
      }
      if (isDefaultValue('bonus2Label', prev.bonus2Label)) {
        updates.bonus2Label = t('phonemockup.default.bonus2Label');
      }
      if (isDefaultValue('bonus3Label', prev.bonus3Label)) {
        updates.bonus3Label = t('phonemockup.default.bonus3Label');
      }
      if (isDefaultValue('bonus4Label', prev.bonus4Label)) {
        updates.bonus4Label = t('phonemockup.default.bonus4Label');
      }
      if (isDefaultValue('bonus5Label', prev.bonus5Label)) {
        updates.bonus5Label = t('custom.bonus.name') + ' 5';
      }
      if (isDefaultValue('bonus6Label', prev.bonus6Label)) {
        updates.bonus6Label = t('custom.bonus.name') + ' 6';
      }
      if (isDefaultValue('bonus7Label', prev.bonus7Label)) {
        updates.bonus7Label = t('custom.bonus.name') + ' 7';
      }
      if (isDefaultValue('bonus8Label', prev.bonus8Label)) {
        updates.bonus8Label = t('custom.bonus.name') + ' 8';
      }
      if (isDefaultValue('bonus9Label', prev.bonus9Label)) {
        updates.bonus9Label = t('custom.bonus.name') + ' 9';
      }
      if (isDefaultValue('viewButtonLabel', prev.viewButtonLabel)) {
        updates.viewButtonLabel = t('phonemockup.default.viewButtonLabel');
      }
      if (isDefaultValue('whatsappMessage', prev.whatsappMessage)) {
        updates.whatsappMessage = t('phonemockup.default.whatsappMessage');
      }
      if (isDefaultValue('whatsappButtonText', prev.whatsappButtonText)) {
        updates.whatsappButtonText = t('phonemockup.default.whatsappButtonText');
      }
      if (isDefaultValue('videoCourseTitle', prev.videoCourseTitle)) {
        updates.videoCourseTitle = t('custom.videoCourse.titlePlaceholder');
      }
      if (isDefaultValue('videoCourseDescription', prev.videoCourseDescription)) {
        updates.videoCourseDescription = t('custom.videoCourse.descriptionPlaceholder');
      }
      if (isDefaultValue('videoCourseButtonText', prev.videoCourseButtonText)) {
        updates.videoCourseButtonText = t('custom.videoCourse.buttonTextPlaceholder');
      }
      
      // Só atualiza se houver mudanças
      if (Object.keys(updates).length > 0) {
        return { ...prev, ...updates };
      }
      return prev;
    });
  }, [language, t, isDefaultValue]);

  // Auto-save - NÃO salva no banco se o app é publicado (alterações só efetivam ao republicar)
  const saveAsDraft = useCallback(async (data: AppBuilderData) => {
    try {
      // Se o app já está publicado, não salvar no banco - manter apenas em memória
      // As alterações serão persistidas quando o usuário clicar em "Publicar"
      if (data.publishedSlug) {
        console.log('[saveAsDraft] App publicado - alterações mantidas apenas em memória');
        return;
      }

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      setIsSaving(true);

      const appPayload: Record<string, any> = {
        user_id: user.id,
        nome: data.appName,
        slug: data.customLink || `draft-${Date.now()}`,
        descricao: data.appDescription,
        cor: data.appColor,
        app_theme: data.appTheme,
        link_personalizado: data.customLink,
        allow_pdf_download: data.allowPdfDownload,
        template: data.template,
        icone_url: data.appIcon?.url ?? null,
        capa_url: data.appCover?.url ?? null,
        produto_principal_url: data.mainProduct?.url ?? null,
        bonus1_url: data.bonus1?.url ?? null,
        bonus2_url: data.bonus2?.url ?? null,
        bonus3_url: data.bonus3?.url ?? null,
        bonus4_url: data.bonus4?.url ?? null,
        bonus5_url: data.bonus5?.url ?? null,
        bonus6_url: data.bonus6?.url ?? null,
        bonus7_url: data.bonus7?.url ?? null,
        bonus8_url: data.bonus8?.url ?? null,
        bonus9_url: data.bonus9?.url ?? null,
        bonus10_url: data.bonus10?.url ?? null,
        bonus11_url: data.bonus11?.url ?? null,
        bonus12_url: data.bonus12?.url ?? null,
        bonus13_url: data.bonus13?.url ?? null,
        bonus14_url: data.bonus14?.url ?? null,
        bonus15_url: data.bonus15?.url ?? null,
        bonus16_url: data.bonus16?.url ?? null,
        bonus17_url: data.bonus17?.url ?? null,
        bonus18_url: data.bonus18?.url ?? null,
        bonus19_url: data.bonus19?.url ?? null,
        bonuses_label: data.bonusesLabel,
        bonus1_label: data.bonus1Label,
        bonus2_label: data.bonus2Label,
        bonus3_label: data.bonus3Label,
        bonus4_label: data.bonus4Label,
        bonus5_label: data.bonus5Label,
        bonus6_label: data.bonus6Label,
        bonus7_label: data.bonus7Label,
        bonus8_label: data.bonus8Label,
        bonus9_label: data.bonus9Label,
        bonus10_label: data.bonus10Label,
        bonus11_label: data.bonus11Label,
        bonus12_label: data.bonus12Label,
        bonus13_label: data.bonus13Label,
        bonus14_label: data.bonus14Label,
        bonus15_label: data.bonus15Label,
        bonus16_label: data.bonus16Label,
        bonus17_label: data.bonus17Label,
        bonus18_label: data.bonus18Label,
        bonus19_label: data.bonus19Label,
        view_button_label: (data.viewButtonLabel && data.viewButtonLabel.trim().length > 0) ? data.viewButtonLabel.trim() : null,
        notification_enabled: data.notificationEnabled,
        notification_title: data.notificationTitle,
        notification_message: data.notificationMessage,
        notification_image: data.notificationImage?.url,
        notification_link: data.notificationLink,
        notification_button_color: data.notificationButtonColor,
        notification_icon: data.notificationIcon,
        whatsapp_enabled: data.whatsappEnabled,
        whatsapp_phone: data.whatsappPhone,
        whatsapp_message: data.whatsappMessage,
        whatsapp_position: data.whatsappPosition,
        whatsapp_button_color: data.whatsappButtonColor,
        whatsapp_button_text: data.whatsappButtonText,
        whatsapp_show_text: data.whatsappShowText,
        whatsapp_icon_size: data.whatsappIconSize,
        video_course_enabled: data.videoCourseEnabled,
        video_modules: JSON.stringify({
          title: data.videoCourseTitle,
          description: data.videoCourseDescription,
          buttonText: data.videoCourseButtonText,
          image: data.videoCourseImage?.url || null,
          background: data.videoCourseBackground?.url || null,
          modules: data.videoModules
        }),
        main_product_label: data.mainProductLabel,
        main_product_description: data.mainProductDescription,
        theme_config: JSON.stringify({
          ...data.themeConfig,
          appNameColor: data.appNameColor,
          appDescriptionColor: data.appDescriptionColor,
          showcaseTextPosition: data.showcaseTextPosition,
          showAppIcon: data.showAppIcon,
          membersHeaderSize: data.membersHeaderSize,
          shopRemoveCardBorder: data.shopRemoveCardBorder,
          membersShowCardBorder: data.membersShowCardBorder,
          flowShowCardBorder: data.flowShowCardBorder,
          mainProductThumbnail: data.mainProductThumbnail?.url ?? null,
          mainProductBackground: data.mainProductBackground?.url ?? null,
          bonus1Thumbnail: data.bonus1Thumbnail?.url ?? null,
          bonus1Background: data.bonus1Background?.url ?? null,
          bonus2Thumbnail: data.bonus2Thumbnail?.url ?? null,
          bonus2Background: data.bonus2Background?.url ?? null,
          bonus3Thumbnail: data.bonus3Thumbnail?.url ?? null,
          bonus3Background: data.bonus3Background?.url ?? null,
          bonus4Thumbnail: data.bonus4Thumbnail?.url ?? null,
          bonus4Background: data.bonus4Background?.url ?? null,
          bonus5Thumbnail: data.bonus5Thumbnail?.url ?? null,
          bonus5Background: data.bonus5Background?.url ?? null,
          bonus6Thumbnail: data.bonus6Thumbnail?.url ?? null,
          bonus6Background: data.bonus6Background?.url ?? null,
          bonus7Thumbnail: data.bonus7Thumbnail?.url ?? null,
          bonus7Background: data.bonus7Background?.url ?? null,
          bonus8Thumbnail: data.bonus8Thumbnail?.url ?? null,
          bonus8Background: data.bonus8Background?.url ?? null,
          bonus9Thumbnail: data.bonus9Thumbnail?.url ?? null,
          bonus9Background: data.bonus9Background?.url ?? null,
          bonus10Thumbnail: data.bonus10Thumbnail?.url ?? null,
          bonus10Background: data.bonus10Background?.url ?? null,
          bonus11Thumbnail: data.bonus11Thumbnail?.url ?? null,
          bonus11Background: data.bonus11Background?.url ?? null,
          bonus12Thumbnail: data.bonus12Thumbnail?.url ?? null,
          bonus12Background: data.bonus12Background?.url ?? null,
          bonus13Thumbnail: data.bonus13Thumbnail?.url ?? null,
          bonus13Background: data.bonus13Background?.url ?? null,
          bonus14Thumbnail: data.bonus14Thumbnail?.url ?? null,
          bonus14Background: data.bonus14Background?.url ?? null,
          bonus15Thumbnail: data.bonus15Thumbnail?.url ?? null,
          bonus15Background: data.bonus15Background?.url ?? null,
          bonus16Thumbnail: data.bonus16Thumbnail?.url ?? null,
          bonus16Background: data.bonus16Background?.url ?? null,
          bonus17Thumbnail: data.bonus17Thumbnail?.url ?? null,
          bonus17Background: data.bonus17Background?.url ?? null,
          bonus18Thumbnail: data.bonus18Thumbnail?.url ?? null,
          bonus18Background: data.bonus18Background?.url ?? null,
          bonus19Thumbnail: data.bonus19Thumbnail?.url ?? null,
          bonus19Background: data.bonus19Background?.url ?? null,
          // Bonus colors (Exclusive template)
          bonus1Color: data.bonus1Color,
          bonus2Color: data.bonus2Color,
          bonus3Color: data.bonus3Color,
          bonus4Color: data.bonus4Color,
          bonus5Color: data.bonus5Color,
          bonus6Color: data.bonus6Color,
          bonus7Color: data.bonus7Color,
          bonus8Color: data.bonus8Color,
          bonus9Color: data.bonus9Color,
          bonus10Color: data.bonus10Color,
          bonus11Color: data.bonus11Color,
          bonus12Color: data.bonus12Color,
          bonus13Color: data.bonus13Color,
          bonus14Color: data.bonus14Color,
          bonus15Color: data.bonus15Color,
          bonus16Color: data.bonus16Color,
          bonus17Color: data.bonus17Color,
          bonus18Color: data.bonus18Color,
          bonus19Color: data.bonus19Color,
          trainingLogo: data.trainingLogo?.url,
          training1Cover: data.training1Cover?.url,
          training2Cover: data.training2Cover?.url,
          training3Cover: data.training3Cover?.url,
          training4Cover: data.training4Cover?.url,
          notificationButtonText: data.notificationButtonText,
          uploadModulesEnabled: data.uploadModulesEnabled,
          uploadModules: data.uploadModules,
        }),
      };

      if (data.id) {
        // App já existe: NÃO alterar o status - preservar o status atual (publicado ou draft)
        const { error } = await supabase
          .from('apps')
          .update(appPayload)
          .eq('id', data.id);

        if (error) throw error;
      } else {
        // App novo: definir como draft até ser publicado
        appPayload.status = 'draft';
        const { data: newApp, error } = await supabase
          .from('apps')
          .insert(appPayload as any)
          .select()
          .single();

        if (error) throw error;
        
        setAppData(prev => ({ ...prev, id: newApp.id }));
      }
    } catch (error) {
      console.error('Erro ao salvar app:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Upload de arquivo usando o novo serviço
  const uploadFile = useCallback(async (file: File, type: string, appId?: string): Promise<UploadFileResult> => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Usuário não autenticado');

    // Se é upload de PDF ou MP3 de produto, usar o serviço específico
    const isProductFile = (file.type === 'application/pdf' || file.type === 'audio/mpeg' || file.type === 'audio/mp3' || 
                          file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.mp3'));
    if (isProductFile && appId) {
      const { fileService } = await import('@/services/fileService');
      const result = await fileService.uploadProductFile({
        appId,
        slot: type,
        file
      });
      return {
        url: result.url,
      };
    }

    // Para outros tipos de arquivo (ícones, capas), usar o bucket original
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('app-assets')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('app-assets')
      .getPublicUrl(fileName);

    return { url: data.publicUrl };
  }, []);

  // Validar slug único com debounce
  const validateSlug = useCallback(async (slug: string): Promise<boolean> => {
    if (!slug.trim()) return true;
    
    // Verificar se não é uma palavra reservada
    if (!isValidSlug(slug)) {
      console.warn('Slug inválido ou reservado:', slug);
      return false;
    }
    
    // Verificar se o slug já existe no banco de dados
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

// Atualizar dados do app com validação
const updateAppData = useCallback((field: keyof AppBuilderData, value: any) => {
  setAppData(prev => {
    const newData = { ...prev, [field]: value };
    
    // Validar o campo específico
    try {
      const fieldSchema = appDataSchema.shape[field as keyof typeof appDataSchema.shape];
      if (fieldSchema) {
        fieldSchema.parse(value);
      }
    } catch (error: any) {
      // Mostrar erro de validação
      if (error.errors?.[0]) {
        toast({
          title: "Validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      // Mesmo com erro, atualiza o valor para permitir correção
    }
    
    return newData;
  });
}, [toast]);

  // Upload de arquivo e atualização
  const handleFileUpload = useCallback(async (
    field: keyof AppBuilderData,
    file: File,
    type: string
  ) => {
    try {
      setIsLoading(true);

      // Validar tipo de arquivo apropriado
      try {
        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

        // Alguns navegadores podem enviar file.type vazio; inferimos pelo sufixo.
        const normalizedType =
          file.type ||
          (fileExtension === '.pdf'
            ? 'application/pdf'
            : fileExtension === '.mp3'
              ? 'audio/mpeg'
              : fileExtension === '.png'
                ? 'image/png'
                : fileExtension === '.jpg' || fileExtension === '.jpeg'
                  ? 'image/jpeg'
                  : file.type);

        if (normalizedType === 'application/pdf') {
          // Para PDFs de produtos
          pdfValidationSchema.parse({
            type: normalizedType,
            size: file.size,
            name: file.name,
          });
        } else if (normalizedType === 'audio/mpeg' || normalizedType === 'audio/mp3') {
          // Para MP3s de produtos
          mp3ValidationSchema.parse({
            type: normalizedType as any,
            size: file.size,
            name: file.name,
          });
        } else if (normalizedType.startsWith('image/')) {
          // Para imagens (ícone, capa, thumbnails)
          imageValidationSchema.parse({
            type: normalizedType as any,
            size: file.size,
            name: file.name,
          });
        } else {
          throw new Error(t('validation.file.invalid_type'));
        }
      } catch (error: any) {
        // Tratamento específico para erros do Zod
        if (error.name === 'ZodError' && error.issues?.[0]) {
          const issue = error.issues[0];

          // Mapear código do erro para mensagem traduzida
          if (issue.code === 'too_big') {
            const isImage = (file.type || '').startsWith('image/') ||
              ['.png', '.jpg', '.jpeg'].includes(file.name.toLowerCase().substring(file.name.toLowerCase().lastIndexOf('.')));
            const key = isImage ? 'validation.image.too_big' : 'validation.pdf.too_big';
            throw new Error(t(key));
          } else if (issue.code === 'invalid_type' || issue.code === 'invalid_enum_value') {
            throw new Error(t('validation.file.invalid_type'));
          } else {
            throw new Error(t('validation.file.generic'));
          }
        }

        // Para outros tipos de erro, usar mensagem genérica ou a original
        throw new Error(error.message || t('validation.file.generic'));
      }

      const appId = appData.id || `draft-${Date.now()}`;
      const uploadResult = await uploadFile(file, type, appId);
      
      const uploadedFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        url: uploadResult.url,
        file
      };

      updateAppData(field, uploadedFile);

      // Persistir imediatamente uploads no rascunho (para não perder ao fechar/abrir)
      await saveAsDraft({
        ...appData,
        [field]: uploadedFile,
      });

      toast({
        title: t("toast.upload.success.title"),
        description: t("toast.upload.success.description").replace("{fileName}", file.name),
      });
      
      return {};
    } catch (error: any) {
      console.error('Erro no upload:', error);
      
      let errorMessage = error.message || "Não foi possível fazer o upload do arquivo.";
      
      // Adicionar botão "Tentar novamente" para alguns erros específicos
      if (errorMessage.includes('Tentar novamente')) {
        // Toast já tem a mensagem adequada
      }
      
      toast({
        title: t("toast.upload.error.title"),
        description: errorMessage || t("toast.upload.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [uploadFile, updateAppData, toast, appData, t, saveAsDraft]);

  // Reset dos dados (apenas limpa o formulário, NÃO deleta o app do banco)
  const resetApp = useCallback(async () => {
    try {
      // Apenas limpa os dados locais do formulário
      // Isso reseta para os valores default, incluindo publishedSlug: undefined
      setAppData(getDefaultAppData());
      
      // NÃO deletar nada do banco - o reset apenas limpa o formulário local
      // para permitir criar um novo app ou editar outro

      toast({
        title: "Formulário limpo",
        description: "O editor foi resetado. Seus apps publicados não foram afetados.",
      });
    } catch (error) {
      console.error('Erro ao resetar formulário:', error);
      toast({
        title: "Erro ao resetar",
        description: "Não foi possível limpar o formulário.",
        variant: "destructive",
      });
    }
  }, [toast, getDefaultAppData]);

  // Publicar app
  const publishApp = useCallback(async (): Promise<string | null> => {
    try {
      setIsPublishing(true);

      // Normalizar o customLink ANTES da validação (converte acentos, pontos, etc)
      const normalizedCustomLink = appData.customLink ? normalizeSlug(appData.customLink) : '';

      // Validar todos os dados antes de publicar
      try {
        appDataSchema.parse({
          appName: appData.appName,
          appDescription: appData.appDescription,
          appColor: appData.appColor,
          customLink: normalizedCustomLink, // Usar o link normalizado na validação
          customDomain: appData.customDomain,
          mainProductLabel: appData.mainProductLabel,
          mainProductDescription: appData.mainProductDescription,
          bonusesLabel: appData.bonusesLabel,
          bonus1Label: appData.bonus1Label,
          bonus2Label: appData.bonus2Label,
          bonus3Label: appData.bonus3Label,
          bonus4Label: appData.bonus4Label,
          bonus5Label: appData.bonus5Label,
          bonus6Label: appData.bonus6Label,
          bonus7Label: appData.bonus7Label,
          bonus8Label: appData.bonus8Label,
          bonus9Label: appData.bonus9Label,
          viewButtonLabel: appData.viewButtonLabel,
        });
      } catch (error: any) {
        if (error.errors?.[0]) {
          throw new Error(error.errors[0].message);
        }
        throw new Error('Dados inválidos. Verifique os campos.');
      }
      
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

      // Verificar se é uma republicação (usando publishedSlug ou customLink normalizado)
      let republicationApp = null;
      
      // Detectar se o usuário alterou intencionalmente o link personalizado
      // Se o customLink normalizado é diferente do publishedSlug, o usuário quer um novo link
      const userChangedCustomLink = appData.publishedSlug && 
                                     normalizedCustomLink && 
                                     normalizedCustomLink !== appData.publishedSlug;
      
      // Primeiro, verificar se temos um publishedSlug salvo (app já foi publicado antes nesta sessão)
      // MAS só considerar como republicação se o link NÃO foi alterado
      if (appData.publishedSlug && !userChangedCustomLink) {
        const { data } = await supabase
          .from('apps')
          .select('slug, user_id')
          .eq('slug', appData.publishedSlug)
          .eq('user_id', user.id)
          .maybeSingle();
        republicationApp = data;
      }
      
      // Se não encontrou pelo publishedSlug (ou link foi alterado), verificar pelo customLink normalizado
      if (!republicationApp && normalizedCustomLink && !userChangedCustomLink) {
        const { data } = await supabase
          .from('apps')
          .select('slug, user_id')
          .eq('slug', normalizedCustomLink)
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
        if (normalizedCustomLink) {
          // Verificar se é uma palavra reservada
          if (RESERVED_SLUGS.includes(normalizedCustomLink.toLowerCase())) {
            throw new Error('Este link é uma palavra reservada do sistema. Escolha outro.');
          }
          
          // Verificar se não é válido (formato)
          if (!isValidSlug(normalizedCustomLink)) {
            throw new Error('Link inválido. Use apenas letras minúsculas, números, hífens e underscores (3-50 caracteres).');
          }
          
          // Verificar se já existe no banco
          const isSlugAvailable = await validateSlug(normalizedCustomLink);
          if (!isSlugAvailable) {
            throw new Error('Este link já existe. Escolha outro.');
          }
          finalSlug = normalizedCustomLink;
        } else {
          // Gerar slug único para novo app
          const { data: slugData, error: slugError } = await supabase
            .rpc('generate_unique_slug', {
              base_name: appData.appName
            });

          if (slugError) throw slugError;
          finalSlug = slugData as string;
        }
      }

      const appPublicData = {
        user_id: user.id,
        nome: appData.appName,
        descricao: appData.appDescription,
        slug: finalSlug,
        cor: appData.appColor,
        app_theme: appData.appTheme,
        link_personalizado: normalizedCustomLink || null, // Salvar o link normalizado
        allow_pdf_download: appData.allowPdfDownload,
        template: appData.template,
        theme_config: JSON.stringify({
          ...appData.themeConfig,
          appNameColor: appData.appNameColor,
          appDescriptionColor: appData.appDescriptionColor,
          showcaseTextPosition: appData.showcaseTextPosition,
          showAppIcon: appData.showAppIcon,
          membersHeaderSize: appData.membersHeaderSize,
          shopRemoveCardBorder: appData.shopRemoveCardBorder,
          membersShowCardBorder: appData.membersShowCardBorder,
          flowShowCardBorder: appData.flowShowCardBorder,
          mainProductThumbnail: appData.mainProductThumbnail?.url ?? null,
          mainProductBackground: appData.mainProductBackground?.url ?? null,
          bonus1Thumbnail: appData.bonus1Thumbnail?.url ?? null,
          bonus1Background: appData.bonus1Background?.url ?? null,
          bonus2Thumbnail: appData.bonus2Thumbnail?.url ?? null,
          bonus2Background: appData.bonus2Background?.url ?? null,
          bonus3Thumbnail: appData.bonus3Thumbnail?.url ?? null,
          bonus3Background: appData.bonus3Background?.url ?? null,
          bonus4Thumbnail: appData.bonus4Thumbnail?.url ?? null,
          bonus4Background: appData.bonus4Background?.url ?? null,
          bonus5Thumbnail: appData.bonus5Thumbnail?.url ?? null,
          bonus5Background: appData.bonus5Background?.url ?? null,
          bonus6Thumbnail: appData.bonus6Thumbnail?.url ?? null,
          bonus6Background: appData.bonus6Background?.url ?? null,
          bonus7Thumbnail: appData.bonus7Thumbnail?.url ?? null,
          bonus7Background: appData.bonus7Background?.url ?? null,
          bonus8Thumbnail: appData.bonus8Thumbnail?.url ?? null,
          bonus8Background: appData.bonus8Background?.url ?? null,
          bonus9Thumbnail: appData.bonus9Thumbnail?.url ?? null,
          bonus9Background: appData.bonus9Background?.url ?? null,
          bonus10Thumbnail: appData.bonus10Thumbnail?.url ?? null,
          bonus10Background: appData.bonus10Background?.url ?? null,
          bonus11Thumbnail: appData.bonus11Thumbnail?.url ?? null,
          bonus11Background: appData.bonus11Background?.url ?? null,
          bonus12Thumbnail: appData.bonus12Thumbnail?.url ?? null,
          bonus12Background: appData.bonus12Background?.url ?? null,
          bonus13Thumbnail: appData.bonus13Thumbnail?.url ?? null,
          bonus13Background: appData.bonus13Background?.url ?? null,
          bonus14Thumbnail: appData.bonus14Thumbnail?.url ?? null,
          bonus14Background: appData.bonus14Background?.url ?? null,
          bonus15Thumbnail: appData.bonus15Thumbnail?.url ?? null,
          bonus15Background: appData.bonus15Background?.url ?? null,
          bonus16Thumbnail: appData.bonus16Thumbnail?.url ?? null,
          bonus16Background: appData.bonus16Background?.url ?? null,
          bonus17Thumbnail: appData.bonus17Thumbnail?.url ?? null,
          bonus17Background: appData.bonus17Background?.url ?? null,
          bonus18Thumbnail: appData.bonus18Thumbnail?.url ?? null,
          bonus18Background: appData.bonus18Background?.url ?? null,
          bonus19Thumbnail: appData.bonus19Thumbnail?.url ?? null,
          bonus19Background: appData.bonus19Background?.url ?? null,
          // Bonus colors (Exclusive template)
          bonus1Color: appData.bonus1Color,
          bonus2Color: appData.bonus2Color,
          bonus3Color: appData.bonus3Color,
          bonus4Color: appData.bonus4Color,
          bonus5Color: appData.bonus5Color,
          bonus6Color: appData.bonus6Color,
          bonus7Color: appData.bonus7Color,
          bonus8Color: appData.bonus8Color,
          bonus9Color: appData.bonus9Color,
          bonus10Color: appData.bonus10Color,
          bonus11Color: appData.bonus11Color,
          bonus12Color: appData.bonus12Color,
          bonus13Color: appData.bonus13Color,
          bonus14Color: appData.bonus14Color,
          bonus15Color: appData.bonus15Color,
          bonus16Color: appData.bonus16Color,
          bonus17Color: appData.bonus17Color,
          bonus18Color: appData.bonus18Color,
          bonus19Color: appData.bonus19Color,
          // Academy template covers
          trainingLogo: appData.trainingLogo?.url,
          training1Cover: appData.training1Cover?.url,
          training2Cover: appData.training2Cover?.url,
          training3Cover: appData.training3Cover?.url,
          training4Cover: appData.training4Cover?.url,
          // Notification button text
          notificationButtonText: appData.notificationButtonText,
          // Upload Modules
          uploadModulesEnabled: appData.uploadModulesEnabled,
          uploadModules: appData.uploadModules,
        }),
        icone_url: appData.appIcon?.url ?? null,
        capa_url: appData.appCover?.url ?? null,
        produto_principal_url: appData.mainProduct?.url ?? null,
        bonus1_url: appData.bonus1?.url ?? null,
        bonus2_url: appData.bonus2?.url ?? null,
        bonus3_url: appData.bonus3?.url ?? null,
        bonus4_url: appData.bonus4?.url ?? null,
        bonus5_url: appData.bonus5?.url ?? null,
        bonus6_url: appData.bonus6?.url ?? null,
        bonus7_url: appData.bonus7?.url ?? null,
        bonus8_url: appData.bonus8?.url ?? null,
        bonus9_url: appData.bonus9?.url ?? null,
        bonus10_url: appData.bonus10?.url ?? null,
        bonus11_url: appData.bonus11?.url ?? null,
        bonus12_url: appData.bonus12?.url ?? null,
        bonus13_url: appData.bonus13?.url ?? null,
        bonus14_url: appData.bonus14?.url ?? null,
        bonus15_url: appData.bonus15?.url ?? null,
        bonus16_url: appData.bonus16?.url ?? null,
        bonus17_url: appData.bonus17?.url ?? null,
        bonus18_url: appData.bonus18?.url ?? null,
        bonus19_url: appData.bonus19?.url ?? null,
        bonuses_label: appData.bonusesLabel,
        bonus1_label: appData.bonus1Label,
        bonus2_label: appData.bonus2Label,
        bonus3_label: appData.bonus3Label,
        bonus4_label: appData.bonus4Label,
        bonus5_label: appData.bonus5Label,
        bonus6_label: appData.bonus6Label,
        bonus7_label: appData.bonus7Label,
        bonus8_label: appData.bonus8Label,
        bonus9_label: appData.bonus9Label,
        bonus10_label: appData.bonus10Label,
        bonus11_label: appData.bonus11Label,
        bonus12_label: appData.bonus12Label,
        bonus13_label: appData.bonus13Label,
        bonus14_label: appData.bonus14Label,
        bonus15_label: appData.bonus15Label,
        bonus16_label: appData.bonus16Label,
        bonus17_label: appData.bonus17Label,
        bonus18_label: appData.bonus18Label,
        bonus19_label: appData.bonus19Label,
        view_button_label: (appData.viewButtonLabel && appData.viewButtonLabel.trim().length > 0) ? appData.viewButtonLabel.trim() : null,
        notification_enabled: appData.notificationEnabled,
        notification_title: appData.notificationTitle,
        notification_message: appData.notificationMessage,
        notification_image: appData.notificationImage?.url,
        notification_link: appData.notificationLink,
        notification_button_color: appData.notificationButtonColor,
        notification_icon: appData.notificationIcon,
        whatsapp_enabled: appData.whatsappEnabled,
        whatsapp_phone: appData.whatsappPhone,
        whatsapp_message: appData.whatsappMessage,
        whatsapp_position: appData.whatsappPosition,
        whatsapp_button_color: appData.whatsappButtonColor,
        whatsapp_button_text: appData.whatsappButtonText,
        whatsapp_show_text: appData.whatsappShowText,
        whatsapp_icon_size: appData.whatsappIconSize,
        video_course_enabled: appData.videoCourseEnabled,
        video_modules: JSON.stringify({
          title: appData.videoCourseTitle,
          description: appData.videoCourseDescription,
          buttonText: appData.videoCourseButtonText,
          image: appData.videoCourseImage?.url || null,
          background: appData.videoCourseBackground?.url || null,
          modules: appData.videoModules
        }),
        main_product_label: appData.mainProductLabel,
        main_product_description: appData.mainProductDescription,
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

      // Limpar todos os rascunhos após publicação bem-sucedida
      await supabase
        .from('apps')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'draft');

      // Salvar o slug publicado no estado para futuras republicações
      setAppData(prev => ({
        ...prev,
        publishedSlug: finalSlug
      }));

      // Usar o domínio de produção para apps publicados
      const appUrl = getAppUrl(finalSlug);
      
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
        .from('apps')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (draft) {
        const appRow = draft as any;
        let parsedThemeConfig: any;
        try {
          parsedThemeConfig = appRow.theme_config ? JSON.parse(appRow.theme_config) : THEME_PRESETS[appRow.template || 'classic'];
        } catch (error) {
          console.error('Error parsing theme_config:', error);
          parsedThemeConfig = THEME_PRESETS[appRow.template || 'classic'];
        }
        
        setAppData({
          id: appRow.id,
          appName: appRow.nome,
          appNameColor: parsedThemeConfig?.appNameColor || '#ffffff',
          appDescription: appRow.descricao || 'Descrição do App',
          appDescriptionColor: parsedThemeConfig?.appDescriptionColor || '#ffffff',
          appColor: appRow.cor,
          appTheme: appRow.app_theme || 'dark',
          customLink: appRow.link_personalizado || '',
          customDomain: '',
          allowPdfDownload: appRow.allow_pdf_download ?? false,
          template: appRow.template || 'classic',
          themeConfig: parsedThemeConfig,
          mainProductLabel: appRow.main_product_label || 'PRODUTO PRINCIPAL',
          mainProductDescription: appRow.main_product_description || 'Disponível para download',
          bonusesLabel: appRow.bonuses_label || '',
          bonus1Label: appRow.bonus1_label || 'Bônus 1',
          bonus2Label: appRow.bonus2_label || 'Bônus 2',
          bonus3Label: appRow.bonus3_label || 'Bônus 3',
          bonus4Label: appRow.bonus4_label || 'Bônus 4',
          bonus5Label: appRow.bonus5_label || 'Bônus 5',
          bonus6Label: appRow.bonus6_label || 'Bônus 6',
          bonus7Label: appRow.bonus7_label || 'Bônus 7',
          bonus8Label: appRow.bonus8_label || 'Bônus 8',
          bonus9Label: appRow.bonus9_label || 'Bônus 9',
          bonus10Label: appRow.bonus10_label || 'Bônus 10',
          bonus11Label: appRow.bonus11_label || 'Bônus 11',
          bonus12Label: appRow.bonus12_label || 'Bônus 12',
          bonus13Label: appRow.bonus13_label || 'Bônus 13',
          bonus14Label: appRow.bonus14_label || 'Bônus 14',
          bonus15Label: appRow.bonus15_label || 'Bônus 15',
          bonus16Label: appRow.bonus16_label || 'Bônus 16',
          bonus17Label: appRow.bonus17_label || 'Bônus 17',
          bonus18Label: appRow.bonus18_label || 'Bônus 18',
          bonus19Label: appRow.bonus19_label || 'Bônus 19',
          viewButtonLabel: appRow.view_button_label || '',
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
          mainProductThumbnail: parsedThemeConfig?.mainProductThumbnail ? {
            id: 'main-thumbnail',
            name: 'main-thumbnail',
            url: parsedThemeConfig.mainProductThumbnail
          } : undefined,
          bonus1: draft.bonus1_url ? {
            id: 'bonus1',
            name: 'bonus1',
            url: draft.bonus1_url
          } : undefined,
          bonus1Thumbnail: parsedThemeConfig?.bonus1Thumbnail ? {
            id: 'bonus1-thumbnail',
            name: 'bonus1-thumbnail',
            url: parsedThemeConfig.bonus1Thumbnail
          } : undefined,
          bonus2: draft.bonus2_url ? {
            id: 'bonus2',
            name: 'bonus2',
            url: draft.bonus2_url
          } : undefined,
          bonus2Thumbnail: parsedThemeConfig?.bonus2Thumbnail ? {
            id: 'bonus2-thumbnail',
            name: 'bonus2-thumbnail',
            url: parsedThemeConfig.bonus2Thumbnail
          } : undefined,
          bonus3: draft.bonus3_url ? {
            id: 'bonus3',
            name: 'bonus3',
            url: draft.bonus3_url
          } : undefined,
          bonus3Thumbnail: parsedThemeConfig?.bonus3Thumbnail ? {
            id: 'bonus3-thumbnail',
            name: 'bonus3-thumbnail',
            url: parsedThemeConfig.bonus3Thumbnail
          } : undefined,
          bonus4: draft.bonus4_url ? {
            id: 'bonus4',
            name: 'bonus4',
            url: draft.bonus4_url
          } : undefined,
          bonus4Thumbnail: parsedThemeConfig?.bonus4Thumbnail ? {
            id: 'bonus4-thumbnail',
            name: 'bonus4-thumbnail',
            url: parsedThemeConfig.bonus4Thumbnail
          } : undefined,
          bonus5: (draft as any).bonus5_url ? {
            id: 'bonus5',
            name: 'bonus5',
            url: (draft as any).bonus5_url
          } : undefined,
          bonus5Thumbnail: parsedThemeConfig?.bonus5Thumbnail ? {
            id: 'bonus5-thumbnail',
            name: 'bonus5-thumbnail',
            url: parsedThemeConfig.bonus5Thumbnail
          } : undefined,
          bonus6: (draft as any).bonus6_url ? {
            id: 'bonus6',
            name: 'bonus6',
            url: (draft as any).bonus6_url
          } : undefined,
          bonus6Thumbnail: parsedThemeConfig?.bonus6Thumbnail ? {
            id: 'bonus6-thumbnail',
            name: 'bonus6-thumbnail',
            url: parsedThemeConfig.bonus6Thumbnail
          } : undefined,
          bonus7: (draft as any).bonus7_url ? {
            id: 'bonus7',
            name: 'bonus7',
            url: (draft as any).bonus7_url
          } : undefined,
          bonus7Thumbnail: parsedThemeConfig?.bonus7Thumbnail ? {
            id: 'bonus7-thumbnail',
            name: 'bonus7-thumbnail',
            url: parsedThemeConfig.bonus7Thumbnail
          } : undefined,
          bonus8: (draft as any).bonus8_url ? {
            id: 'bonus8',
            name: 'bonus8',
            url: (draft as any).bonus8_url
          } : undefined,
          bonus8Thumbnail: parsedThemeConfig?.bonus8Thumbnail ? {
            id: 'bonus8-thumbnail',
            name: 'bonus8-thumbnail',
            url: parsedThemeConfig.bonus8Thumbnail
          } : undefined,
          bonus9: (draft as any).bonus9_url ? {
            id: 'bonus9',
            name: 'bonus9',
            url: (draft as any).bonus9_url
          } : undefined,
          bonus9Thumbnail: parsedThemeConfig?.bonus9Thumbnail ? {
            id: 'bonus9-thumbnail',
            name: 'bonus9-thumbnail',
            url: parsedThemeConfig.bonus9Thumbnail
          } : undefined,
          bonus10: (draft as any).bonus10_url ? {
            id: 'bonus10',
            name: 'bonus10',
            url: (draft as any).bonus10_url
          } : undefined,
          bonus10Thumbnail: parsedThemeConfig?.bonus10Thumbnail ? {
            id: 'bonus10-thumbnail',
            name: 'bonus10-thumbnail',
            url: parsedThemeConfig.bonus10Thumbnail
          } : undefined,
          bonus11: (draft as any).bonus11_url ? {
            id: 'bonus11',
            name: 'bonus11',
            url: (draft as any).bonus11_url
          } : undefined,
          bonus11Thumbnail: parsedThemeConfig?.bonus11Thumbnail ? {
            id: 'bonus11-thumbnail',
            name: 'bonus11-thumbnail',
            url: parsedThemeConfig.bonus11Thumbnail
          } : undefined,
          bonus12: (draft as any).bonus12_url ? {
            id: 'bonus12',
            name: 'bonus12',
            url: (draft as any).bonus12_url
          } : undefined,
          bonus12Thumbnail: parsedThemeConfig?.bonus12Thumbnail ? {
            id: 'bonus12-thumbnail',
            name: 'bonus12-thumbnail',
            url: parsedThemeConfig.bonus12Thumbnail
          } : undefined,
          bonus13: (draft as any).bonus13_url ? {
            id: 'bonus13',
            name: 'bonus13',
            url: (draft as any).bonus13_url
          } : undefined,
          bonus13Thumbnail: parsedThemeConfig?.bonus13Thumbnail ? {
            id: 'bonus13-thumbnail',
            name: 'bonus13-thumbnail',
            url: parsedThemeConfig.bonus13Thumbnail
          } : undefined,
          bonus14: (draft as any).bonus14_url ? {
            id: 'bonus14',
            name: 'bonus14',
            url: (draft as any).bonus14_url
          } : undefined,
          bonus14Thumbnail: parsedThemeConfig?.bonus14Thumbnail ? {
            id: 'bonus14-thumbnail',
            name: 'bonus14-thumbnail',
            url: parsedThemeConfig.bonus14Thumbnail
          } : undefined,
          bonus15: (draft as any).bonus15_url ? {
            id: 'bonus15',
            name: 'bonus15',
            url: (draft as any).bonus15_url
          } : undefined,
          bonus15Thumbnail: parsedThemeConfig?.bonus15Thumbnail ? {
            id: 'bonus15-thumbnail',
            name: 'bonus15-thumbnail',
            url: parsedThemeConfig.bonus15Thumbnail
          } : undefined,
          bonus16: (draft as any).bonus16_url ? {
            id: 'bonus16',
            name: 'bonus16',
            url: (draft as any).bonus16_url
          } : undefined,
          bonus16Thumbnail: parsedThemeConfig?.bonus16Thumbnail ? {
            id: 'bonus16-thumbnail',
            name: 'bonus16-thumbnail',
            url: parsedThemeConfig.bonus16Thumbnail
          } : undefined,
          bonus17: (draft as any).bonus17_url ? {
            id: 'bonus17',
            name: 'bonus17',
            url: (draft as any).bonus17_url
          } : undefined,
          bonus17Thumbnail: parsedThemeConfig?.bonus17Thumbnail ? {
            id: 'bonus17-thumbnail',
            name: 'bonus17-thumbnail',
            url: parsedThemeConfig.bonus17Thumbnail
          } : undefined,
          bonus18: (draft as any).bonus18_url ? {
            id: 'bonus18',
            name: 'bonus18',
            url: (draft as any).bonus18_url
          } : undefined,
          bonus18Thumbnail: parsedThemeConfig?.bonus18Thumbnail ? {
            id: 'bonus18-thumbnail',
            name: 'bonus18-thumbnail',
            url: parsedThemeConfig.bonus18Thumbnail
          } : undefined,
          bonus19: (draft as any).bonus19_url ? {
            id: 'bonus19',
            name: 'bonus19',
            url: (draft as any).bonus19_url
          } : undefined,
          bonus19Thumbnail: parsedThemeConfig?.bonus19Thumbnail ? {
            id: 'bonus19-thumbnail',
            name: 'bonus19-thumbnail',
            url: parsedThemeConfig.bonus19Thumbnail
          } : undefined,
          // Cores dos bônus (template Exclusive) - load from theme_config
          bonus1Color: parsedThemeConfig?.bonus1Color || '#3b82f6',
          bonus2Color: parsedThemeConfig?.bonus2Color || '#10b981',
          bonus3Color: parsedThemeConfig?.bonus3Color || '#f97316',
          bonus4Color: parsedThemeConfig?.bonus4Color || '#f59e0b',
          bonus5Color: parsedThemeConfig?.bonus5Color || '#14b8a6',
          bonus6Color: parsedThemeConfig?.bonus6Color || '#8b5cf6',
          bonus7Color: parsedThemeConfig?.bonus7Color || '#ec4899',
          bonus8Color: parsedThemeConfig?.bonus8Color || '#06b6d4',
          bonus9Color: parsedThemeConfig?.bonus9Color || '#84cc16',
          bonus10Color: parsedThemeConfig?.bonus10Color || '#ef4444',
          bonus11Color: parsedThemeConfig?.bonus11Color || '#22c55e',
          bonus12Color: parsedThemeConfig?.bonus12Color || '#a855f7',
          bonus13Color: parsedThemeConfig?.bonus13Color || '#eab308',
          bonus14Color: parsedThemeConfig?.bonus14Color || '#0ea5e9',
          bonus15Color: parsedThemeConfig?.bonus15Color || '#f43f5e',
          bonus16Color: parsedThemeConfig?.bonus16Color || '#6366f1',
          bonus17Color: parsedThemeConfig?.bonus17Color || '#14b8a6',
          bonus18Color: parsedThemeConfig?.bonus18Color || '#d946ef',
          bonus19Color: parsedThemeConfig?.bonus19Color || '#fb923c',
          notificationEnabled: appRow.notification_enabled ?? false,
          notificationTitle: appRow.notification_title || '',
          notificationMessage: appRow.notification_message || '',
          notificationImage: appRow.notification_image ? {
            id: 'notification',
            name: 'notification',
            url: appRow.notification_image
          } : undefined,
          notificationLink: appRow.notification_link || '',
          notificationButtonText: parsedThemeConfig?.notificationButtonText || '',
          notificationButtonColor: appRow.notification_button_color || '#f97316',
          notificationIcon: appRow.notification_icon || 'gift',
          whatsappEnabled: appRow.whatsapp_enabled ?? false,
          whatsappPhone: appRow.whatsapp_phone || '',
          whatsappMessage: appRow.whatsapp_message || 'Olá! Vim através do app e gostaria de mais informações.',
          whatsappPosition: appRow.whatsapp_position || 'bottom-right',
          whatsappButtonColor: appRow.whatsapp_button_color || '#25D366',
          whatsappButtonText: appRow.whatsapp_button_text || 'Fale Conosco',
          whatsappShowText: appRow.whatsapp_show_text ?? true,
          whatsappIconSize: appRow.whatsapp_icon_size || 'medium',
          membersHeaderSize: parsedThemeConfig?.membersHeaderSize || 'large',
          showAppIcon: parsedThemeConfig?.showAppIcon ?? true,
          showcaseTextPosition: parsedThemeConfig?.showcaseTextPosition || 'bottom',
          // Product Backgrounds from theme_config
          mainProductBackground: parsedThemeConfig?.mainProductBackground ? {
            id: 'main-bg',
            name: 'main-bg',
            url: parsedThemeConfig.mainProductBackground
          } : undefined,
          bonus1Background: parsedThemeConfig?.bonus1Background ? {
            id: 'bonus1-bg',
            name: 'bonus1-bg',
            url: parsedThemeConfig.bonus1Background
          } : undefined,
          bonus2Background: parsedThemeConfig?.bonus2Background ? {
            id: 'bonus2-bg',
            name: 'bonus2-bg',
            url: parsedThemeConfig.bonus2Background
          } : undefined,
          bonus3Background: parsedThemeConfig?.bonus3Background ? {
            id: 'bonus3-bg',
            name: 'bonus3-bg',
            url: parsedThemeConfig.bonus3Background
          } : undefined,
          bonus4Background: parsedThemeConfig?.bonus4Background ? {
            id: 'bonus4-bg',
            name: 'bonus4-bg',
            url: parsedThemeConfig.bonus4Background
          } : undefined,
          bonus5Background: parsedThemeConfig?.bonus5Background ? {
            id: 'bonus5-bg',
            name: 'bonus5-bg',
            url: parsedThemeConfig.bonus5Background
          } : undefined,
          bonus6Background: parsedThemeConfig?.bonus6Background ? {
            id: 'bonus6-bg',
            name: 'bonus6-bg',
            url: parsedThemeConfig.bonus6Background
          } : undefined,
          bonus7Background: parsedThemeConfig?.bonus7Background ? {
            id: 'bonus7-bg',
            name: 'bonus7-bg',
            url: parsedThemeConfig.bonus7Background
          } : undefined,
          bonus8Background: parsedThemeConfig?.bonus8Background ? {
            id: 'bonus8-bg',
            name: 'bonus8-bg',
            url: parsedThemeConfig.bonus8Background
          } : undefined,
          bonus9Background: parsedThemeConfig?.bonus9Background ? {
            id: 'bonus9-bg',
            name: 'bonus9-bg',
            url: parsedThemeConfig.bonus9Background
          } : undefined,
          bonus10Background: parsedThemeConfig?.bonus10Background ? {
            id: 'bonus10-bg',
            name: 'bonus10-bg',
            url: parsedThemeConfig.bonus10Background
          } : undefined,
          bonus11Background: parsedThemeConfig?.bonus11Background ? {
            id: 'bonus11-bg',
            name: 'bonus11-bg',
            url: parsedThemeConfig.bonus11Background
          } : undefined,
          bonus12Background: parsedThemeConfig?.bonus12Background ? {
            id: 'bonus12-bg',
            name: 'bonus12-bg',
            url: parsedThemeConfig.bonus12Background
          } : undefined,
          bonus13Background: parsedThemeConfig?.bonus13Background ? {
            id: 'bonus13-bg',
            name: 'bonus13-bg',
            url: parsedThemeConfig.bonus13Background
          } : undefined,
          bonus14Background: parsedThemeConfig?.bonus14Background ? {
            id: 'bonus14-bg',
            name: 'bonus14-bg',
            url: parsedThemeConfig.bonus14Background
          } : undefined,
          bonus15Background: parsedThemeConfig?.bonus15Background ? {
            id: 'bonus15-bg',
            name: 'bonus15-bg',
            url: parsedThemeConfig.bonus15Background
          } : undefined,
          bonus16Background: parsedThemeConfig?.bonus16Background ? {
            id: 'bonus16-bg',
            name: 'bonus16-bg',
            url: parsedThemeConfig.bonus16Background
          } : undefined,
          bonus17Background: parsedThemeConfig?.bonus17Background ? {
            id: 'bonus17-bg',
            name: 'bonus17-bg',
            url: parsedThemeConfig.bonus17Background
          } : undefined,
          bonus18Background: parsedThemeConfig?.bonus18Background ? {
            id: 'bonus18-bg',
            name: 'bonus18-bg',
            url: parsedThemeConfig.bonus18Background
          } : undefined,
          bonus19Background: parsedThemeConfig?.bonus19Background ? {
            id: 'bonus19-bg',
            name: 'bonus19-bg',
            url: parsedThemeConfig.bonus19Background
          } : undefined,
          shopRemoveCardBorder: parsedThemeConfig?.shopRemoveCardBorder ?? false,
          membersShowCardBorder: parsedThemeConfig?.membersShowCardBorder ?? false,
          flowShowCardBorder: parsedThemeConfig?.flowShowCardBorder ?? false,
          videoCourseEnabled: appRow.video_course_enabled ?? false,
          videoModules: appRow.video_modules ? (JSON.parse(appRow.video_modules)?.modules || JSON.parse(appRow.video_modules)) : [],
          videoCourseTitle: appRow.video_modules ? (JSON.parse(appRow.video_modules)?.title || 'Curso em Vídeo') : 'Curso em Vídeo',
          videoCourseDescription: appRow.video_modules ? (JSON.parse(appRow.video_modules)?.description || 'Descrição do Curso') : 'Descrição do Curso',
          videoCourseButtonText: appRow.video_modules ? (JSON.parse(appRow.video_modules)?.buttonText || 'Assistir Aulas') : 'Assistir Aulas',
          videoCourseImage: appRow.video_modules && JSON.parse(appRow.video_modules)?.image ? {
            id: 'video-course-img',
            name: 'video-course-img',
            url: JSON.parse(appRow.video_modules).image
          } : undefined,
          videoCourseBackground: appRow.video_modules && JSON.parse(appRow.video_modules)?.background ? {
            id: 'video-course-bg',
            name: 'video-course-bg',
            url: JSON.parse(appRow.video_modules).background
          } : undefined,
          // Academy template covers
          trainingLogo: parsedThemeConfig?.trainingLogo ? {
            id: 'training-logo',
            name: 'training-logo',
            url: parsedThemeConfig.trainingLogo
          } : undefined,
          training1Cover: parsedThemeConfig?.training1Cover ? {
            id: 'training1-cover',
            name: 'training1-cover',
            url: parsedThemeConfig.training1Cover
          } : undefined,
          training2Cover: parsedThemeConfig?.training2Cover ? {
            id: 'training2-cover',
            name: 'training2-cover',
            url: parsedThemeConfig.training2Cover
          } : undefined,
          training3Cover: parsedThemeConfig?.training3Cover ? {
            id: 'training3-cover',
            name: 'training3-cover',
            url: parsedThemeConfig.training3Cover
          } : undefined,
          training4Cover: parsedThemeConfig?.training4Cover ? {
            id: 'training4-cover',
            name: 'training4-cover',
            url: parsedThemeConfig.training4Cover
          } : undefined,
          // Upload Modules
          uploadModulesEnabled: parsedThemeConfig?.uploadModulesEnabled ?? false,
          uploadModules: parsedThemeConfig?.uploadModules || [],
        });
      }
    } catch (error) {
      console.error('Erro ao carregar rascunho:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remover carregamento automático de rascunho - usuário deve iniciar do zero

  // Atualizar template e tema juntos
  const updateTemplate = useCallback((template: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal' | 'exclusive') => {
    const themeConfig = THEME_PRESETS[template];
    if (themeConfig) {
      // Manter a cor primária atual se existir
      const updatedThemeConfig = {
        ...themeConfig,
        colors: {
          ...themeConfig.colors,
          primary: appData.appColor || themeConfig.colors.primary
        }
      };
      
      setAppData(prev => ({
        ...prev,
        template,
        themeConfig: updatedThemeConfig
      }));
      
      // Não fazer auto-save automático
    }
  }, [saveAsDraft]); // Removido appData da dependência para evitar loop

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
    validateSlug,
    updateTemplate,
    saveAsDraft // Expor função para salvamento manual
  };
};
