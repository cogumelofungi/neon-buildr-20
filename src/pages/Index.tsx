import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import UploadSection from "@/components/UploadSection";
import PhoneMockup from "@/components/PhoneMockup";
import PublishButton from "@/components/PublishButton";
import SettingsSidebar from "@/components/SettingsSidebar";
import CustomizationPanel from "@/components/CustomizationPanel";
import WhatsAppButtonUser from "@/components/WhatsAppButtonUser";
import AcademyFloatingButton from "@/components/AcademyFloatingButton";
import { useAppBuilder } from "@/hooks/useAppBuilder";
import { useLanguage } from "@/hooks/useLanguage";
import { useIsTabletOrMobile } from "@/hooks/use-mobile";
import { useToast } from "@/components/ui/use-toast";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const appBuilder = useAppBuilder();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isTabletOrMobile = useIsTabletOrMobile();
  const { hasWhatsAppSupport } = useFeatureAccess();

  // iOS PWA: Redirecionar para o app salvo se estiver em modo standalone
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isIOSStandalone = (navigator as any).standalone === true;
    
    if (isIOS && isIOSStandalone) {
      const savedSlug = localStorage.getItem('ios_pwa_last_slug') || localStorage.getItem('pwa_current_app_slug');
      if (savedSlug) {
        console.log('[PWA iOS] Index: Redirecionando para o app salvo:', savedSlug);
        window.location.replace(`/${savedSlug}`);
        return;
      }
    }
  }, []);
  const [supportWhatsappConfig, setSupportWhatsappConfig] = useState<{
    enabled: boolean;
    phone: string;
    message: string;
    position: "bottom-right" | "bottom-left";
    buttonColor: string;
    buttonText: string;
    showText: boolean;
    iconSize?: "small" | "medium" | "large";
  } | null>(null);

  // Carregar configuração do WhatsApp de suporte do admin
  useEffect(() => {
    const loadWhatsAppConfig = async () => {
      if (!hasWhatsAppSupport) return;
      
      try {
        const { data: whatsappData } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('key', 'whatsapp_config')
          .maybeSingle();
        
        if (whatsappData?.value) {
          const config = JSON.parse(whatsappData.value);
          if (config.enabled) {
            setSupportWhatsappConfig({
              enabled: config.enabled,
              phone: config.phone || '',
              message: config.message || 'Olá! Preciso de suporte.',
              position: config.position || 'bottom-right',
              buttonColor: config.buttonColor || '#25D366',
              buttonText: config.buttonText || 'Suporte',
              showText: config.showText ?? true,
              iconSize: config.iconSize || 'medium',
            });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar config do WhatsApp de suporte:', error);
      }
    };

    loadWhatsAppConfig();
  }, [hasWhatsAppSupport]);

  useEffect(() => {
    const handleLoadAppForEdit = (event: CustomEvent) => {
      const appData = event.detail;
      
      // Parse theme_config first
      const parsedThemeConfig = typeof appData.theme_config === 'string' ? JSON.parse(appData.theme_config) : appData.theme_config;
      
      // Mapear dados do app para o formato do appBuilder
      const mappedData = {
        id: appData.id, // IMPORTANTE: Passar o ID do app para configurações como Order Bumps
        publishedSlug: appData.status === 'publicado' ? (appData.slug || appData.link_personalizado || '') : undefined,
        appName: appData.nome || "",
        appDescription: appData.descricao || "",
        appColor: appData.cor || "#4783F6",
        template: appData.template || "classic",
        // Link personalizado (slug)
        customLink: appData.slug || appData.link_personalizado || "",
        customDomain: appData.custom_domain || "",
        allowPdfDownload: appData.allow_pdf_download !== false,
        mainProductLabel: appData.main_product_label || "",
        mainProductDescription: appData.main_product_description || "",
        bonusesLabel: appData.bonuses_label || "",
        bonus1Label: appData.bonus1_label || "",
        bonus2Label: appData.bonus2_label || "",
        bonus3Label: appData.bonus3_label || "",
        bonus4Label: appData.bonus4_label || "",
        bonus5Label: appData.bonus5_label || "",
        bonus6Label: appData.bonus6_label || "",
        bonus7Label: appData.bonus7_label || "",
        bonus8Label: appData.bonus8_label || "",
        bonus9Label: appData.bonus9_label || "",
        bonus10Label: appData.bonus10_label || "",
        bonus11Label: appData.bonus11_label || "",
        bonus12Label: appData.bonus12_label || "",
        bonus13Label: appData.bonus13_label || "",
        bonus14Label: appData.bonus14_label || "",
        bonus15Label: appData.bonus15_label || "",
        bonus16Label: appData.bonus16_label || "",
        bonus17Label: appData.bonus17_label || "",
        bonus18Label: appData.bonus18_label || "",
        bonus19Label: appData.bonus19_label || "",
        viewButtonLabel: appData.view_button_label || "",
        themeConfig: parsedThemeConfig,
        // Sistema de notificações
        notificationEnabled: appData.notification_enabled || false,
        notificationTitle: appData.notification_title || "",
        notificationMessage: appData.notification_message || "",
        notificationImage: appData.notification_image ? { id: 'notification-img', name: 'Notification Image', url: appData.notification_image, file: null } : undefined,
        notificationLink: appData.notification_link || "",
        notificationButtonColor: appData.notification_button_color || "#f97316",
        notificationIcon: appData.notification_icon || "gift",

        // Sistema de WhatsApp
        whatsappEnabled: appData.whatsapp_enabled || false,
        whatsappPhone: appData.whatsapp_phone || '',
        whatsappMessage: appData.whatsapp_message || 'Olá! Vim através do app.',
        whatsappPosition: appData.whatsapp_position || 'bottom-right',
        whatsappButtonColor: appData.whatsapp_button_color || '#25D366',
        whatsappButtonText: appData.whatsapp_button_text || 'Fale Conosco',
        whatsappShowText: appData.whatsapp_show_text !== false,
        whatsappIconSize: appData.whatsapp_icon_size || 'medium',

        // Arquivos e imagens
        appIcon: appData.icone_url ? { id: 'icon', name: 'Ícone', url: appData.icone_url, file: null } : null,
        appCover: appData.capa_url ? { id: 'cover', name: 'Capa', url: appData.capa_url, file: null } : null,
        // Produtos (PDFs)
        mainProduct: appData.produto_principal_url ? { id: 'main', name: 'Produto Principal', url: appData.produto_principal_url, file: null } : null,
        bonus1: appData.bonus1_url ? { id: 'bonus1', name: 'Bônus 1', url: appData.bonus1_url, file: null } : null,
        bonus2: appData.bonus2_url ? { id: 'bonus2', name: 'Bônus 2', url: appData.bonus2_url, file: null } : null,
        bonus3: appData.bonus3_url ? { id: 'bonus3', name: 'Bônus 3', url: appData.bonus3_url, file: null } : null,
        bonus4: appData.bonus4_url ? { id: 'bonus4', name: 'Bônus 4', url: appData.bonus4_url, file: null } : null,
        bonus5: appData.bonus5_url ? { id: 'bonus5', name: 'Bônus 5', url: appData.bonus5_url, file: null } : null,
        bonus6: appData.bonus6_url ? { id: 'bonus6', name: 'Bônus 6', url: appData.bonus6_url, file: null } : null,
        bonus7: appData.bonus7_url ? { id: 'bonus7', name: 'Bônus 7', url: appData.bonus7_url, file: null } : null,
        bonus8: appData.bonus8_url ? { id: 'bonus8', name: 'Bônus 8', url: appData.bonus8_url, file: null } : null,
        bonus9: appData.bonus9_url ? { id: 'bonus9', name: 'Bônus 9', url: appData.bonus9_url, file: null } : null,
        bonus10: appData.bonus10_url ? { id: 'bonus10', name: 'Bônus 10', url: appData.bonus10_url, file: null } : null,
        bonus11: appData.bonus11_url ? { id: 'bonus11', name: 'Bônus 11', url: appData.bonus11_url, file: null } : null,
        bonus12: appData.bonus12_url ? { id: 'bonus12', name: 'Bônus 12', url: appData.bonus12_url, file: null } : null,
        bonus13: appData.bonus13_url ? { id: 'bonus13', name: 'Bônus 13', url: appData.bonus13_url, file: null } : null,
        bonus14: appData.bonus14_url ? { id: 'bonus14', name: 'Bônus 14', url: appData.bonus14_url, file: null } : null,
        bonus15: appData.bonus15_url ? { id: 'bonus15', name: 'Bônus 15', url: appData.bonus15_url, file: null } : null,
        bonus16: appData.bonus16_url ? { id: 'bonus16', name: 'Bônus 16', url: appData.bonus16_url, file: null } : null,
        bonus17: appData.bonus17_url ? { id: 'bonus17', name: 'Bônus 17', url: appData.bonus17_url, file: null } : null,
        bonus18: appData.bonus18_url ? { id: 'bonus18', name: 'Bônus 18', url: appData.bonus18_url, file: null } : null,
        bonus19: appData.bonus19_url ? { id: 'bonus19', name: 'Bônus 19', url: appData.bonus19_url, file: null } : null,
        // Thumbnails from theme_config
        mainProductThumbnail: parsedThemeConfig?.mainProductThumbnail 
          ? { id: 'main-thumb', name: 'Thumbnail Principal', url: parsedThemeConfig.mainProductThumbnail, file: null } 
          : null,
        bonus1Thumbnail: parsedThemeConfig?.bonus1Thumbnail ? { id: 'bonus1-thumb', name: 'Thumbnail Bônus 1', url: parsedThemeConfig.bonus1Thumbnail, file: null } : null,
        bonus2Thumbnail: parsedThemeConfig?.bonus2Thumbnail ? { id: 'bonus2-thumb', name: 'Thumbnail Bônus 2', url: parsedThemeConfig.bonus2Thumbnail, file: null } : null,
        bonus3Thumbnail: parsedThemeConfig?.bonus3Thumbnail ? { id: 'bonus3-thumb', name: 'Thumbnail Bônus 3', url: parsedThemeConfig.bonus3Thumbnail, file: null } : null,
        bonus4Thumbnail: parsedThemeConfig?.bonus4Thumbnail ? { id: 'bonus4-thumb', name: 'Thumbnail Bônus 4', url: parsedThemeConfig.bonus4Thumbnail, file: null } : null,
        bonus5Thumbnail: parsedThemeConfig?.bonus5Thumbnail ? { id: 'bonus5-thumb', name: 'Thumbnail Bônus 5', url: parsedThemeConfig.bonus5Thumbnail, file: null } : null,
        bonus6Thumbnail: parsedThemeConfig?.bonus6Thumbnail ? { id: 'bonus6-thumb', name: 'Thumbnail Bônus 6', url: parsedThemeConfig.bonus6Thumbnail, file: null } : null,
        bonus7Thumbnail: parsedThemeConfig?.bonus7Thumbnail ? { id: 'bonus7-thumb', name: 'Thumbnail Bônus 7', url: parsedThemeConfig.bonus7Thumbnail, file: null } : null,
        bonus8Thumbnail: parsedThemeConfig?.bonus8Thumbnail ? { id: 'bonus8-thumb', name: 'Thumbnail Bônus 8', url: parsedThemeConfig.bonus8Thumbnail, file: null } : null,
        bonus9Thumbnail: parsedThemeConfig?.bonus9Thumbnail ? { id: 'bonus9-thumb', name: 'Thumbnail Bônus 9', url: parsedThemeConfig.bonus9Thumbnail, file: null } : null,
        bonus10Thumbnail: parsedThemeConfig?.bonus10Thumbnail ? { id: 'bonus10-thumb', name: 'Thumbnail Bônus 10', url: parsedThemeConfig.bonus10Thumbnail, file: null } : null,
        bonus11Thumbnail: parsedThemeConfig?.bonus11Thumbnail ? { id: 'bonus11-thumb', name: 'Thumbnail Bônus 11', url: parsedThemeConfig.bonus11Thumbnail, file: null } : null,
        bonus12Thumbnail: parsedThemeConfig?.bonus12Thumbnail ? { id: 'bonus12-thumb', name: 'Thumbnail Bônus 12', url: parsedThemeConfig.bonus12Thumbnail, file: null } : null,
        bonus13Thumbnail: parsedThemeConfig?.bonus13Thumbnail ? { id: 'bonus13-thumb', name: 'Thumbnail Bônus 13', url: parsedThemeConfig.bonus13Thumbnail, file: null } : null,
        bonus14Thumbnail: parsedThemeConfig?.bonus14Thumbnail ? { id: 'bonus14-thumb', name: 'Thumbnail Bônus 14', url: parsedThemeConfig.bonus14Thumbnail, file: null } : null,
        bonus15Thumbnail: parsedThemeConfig?.bonus15Thumbnail ? { id: 'bonus15-thumb', name: 'Thumbnail Bônus 15', url: parsedThemeConfig.bonus15Thumbnail, file: null } : null,
        bonus16Thumbnail: parsedThemeConfig?.bonus16Thumbnail ? { id: 'bonus16-thumb', name: 'Thumbnail Bônus 16', url: parsedThemeConfig.bonus16Thumbnail, file: null } : null,
        bonus17Thumbnail: parsedThemeConfig?.bonus17Thumbnail ? { id: 'bonus17-thumb', name: 'Thumbnail Bônus 17', url: parsedThemeConfig.bonus17Thumbnail, file: null } : null,
        bonus18Thumbnail: parsedThemeConfig?.bonus18Thumbnail ? { id: 'bonus18-thumb', name: 'Thumbnail Bônus 18', url: parsedThemeConfig.bonus18Thumbnail, file: null } : null,
        bonus19Thumbnail: parsedThemeConfig?.bonus19Thumbnail ? { id: 'bonus19-thumb', name: 'Thumbnail Bônus 19', url: parsedThemeConfig.bonus19Thumbnail, file: null } : null,
        // Product Backgrounds from theme_config
        mainProductBackground: parsedThemeConfig?.mainProductBackground ? { id: 'main-bg', name: 'Fundo Principal', url: parsedThemeConfig.mainProductBackground, file: null } : null,
        bonus1Background: parsedThemeConfig?.bonus1Background ? { id: 'bonus1-bg', name: 'Fundo Bônus 1', url: parsedThemeConfig.bonus1Background, file: null } : null,
        bonus2Background: parsedThemeConfig?.bonus2Background ? { id: 'bonus2-bg', name: 'Fundo Bônus 2', url: parsedThemeConfig.bonus2Background, file: null } : null,
        bonus3Background: parsedThemeConfig?.bonus3Background ? { id: 'bonus3-bg', name: 'Fundo Bônus 3', url: parsedThemeConfig.bonus3Background, file: null } : null,
        bonus4Background: parsedThemeConfig?.bonus4Background ? { id: 'bonus4-bg', name: 'Fundo Bônus 4', url: parsedThemeConfig.bonus4Background, file: null } : null,
        bonus5Background: parsedThemeConfig?.bonus5Background ? { id: 'bonus5-bg', name: 'Fundo Bônus 5', url: parsedThemeConfig.bonus5Background, file: null } : null,
        bonus6Background: parsedThemeConfig?.bonus6Background ? { id: 'bonus6-bg', name: 'Fundo Bônus 6', url: parsedThemeConfig.bonus6Background, file: null } : null,
        bonus7Background: parsedThemeConfig?.bonus7Background ? { id: 'bonus7-bg', name: 'Fundo Bônus 7', url: parsedThemeConfig.bonus7Background, file: null } : null,
        bonus8Background: parsedThemeConfig?.bonus8Background ? { id: 'bonus8-bg', name: 'Fundo Bônus 8', url: parsedThemeConfig.bonus8Background, file: null } : null,
        bonus9Background: parsedThemeConfig?.bonus9Background ? { id: 'bonus9-bg', name: 'Fundo Bônus 9', url: parsedThemeConfig.bonus9Background, file: null } : null,
        bonus10Background: parsedThemeConfig?.bonus10Background ? { id: 'bonus10-bg', name: 'Fundo Bônus 10', url: parsedThemeConfig.bonus10Background, file: null } : null,
        bonus11Background: parsedThemeConfig?.bonus11Background ? { id: 'bonus11-bg', name: 'Fundo Bônus 11', url: parsedThemeConfig.bonus11Background, file: null } : null,
        bonus12Background: parsedThemeConfig?.bonus12Background ? { id: 'bonus12-bg', name: 'Fundo Bônus 12', url: parsedThemeConfig.bonus12Background, file: null } : null,
        bonus13Background: parsedThemeConfig?.bonus13Background ? { id: 'bonus13-bg', name: 'Fundo Bônus 13', url: parsedThemeConfig.bonus13Background, file: null } : null,
        bonus14Background: parsedThemeConfig?.bonus14Background ? { id: 'bonus14-bg', name: 'Fundo Bônus 14', url: parsedThemeConfig.bonus14Background, file: null } : null,
        bonus15Background: parsedThemeConfig?.bonus15Background ? { id: 'bonus15-bg', name: 'Fundo Bônus 15', url: parsedThemeConfig.bonus15Background, file: null } : null,
        bonus16Background: parsedThemeConfig?.bonus16Background ? { id: 'bonus16-bg', name: 'Fundo Bônus 16', url: parsedThemeConfig.bonus16Background, file: null } : null,
        bonus17Background: parsedThemeConfig?.bonus17Background ? { id: 'bonus17-bg', name: 'Fundo Bônus 17', url: parsedThemeConfig.bonus17Background, file: null } : null,
        bonus18Background: parsedThemeConfig?.bonus18Background ? { id: 'bonus18-bg', name: 'Fundo Bônus 18', url: parsedThemeConfig.bonus18Background, file: null } : null,
        bonus19Background: parsedThemeConfig?.bonus19Background ? { id: 'bonus19-bg', name: 'Fundo Bônus 19', url: parsedThemeConfig.bonus19Background, file: null } : null,
        // Academy template
        trainingLogo: parsedThemeConfig?.trainingLogo ? { id: 'training-logo', name: 'Logo Academy', url: parsedThemeConfig.trainingLogo, file: null } : null,
        training1Cover: parsedThemeConfig?.training1Cover ? { id: 'training1-cover', name: 'Capa Academy 1', url: parsedThemeConfig.training1Cover, file: null } : null,
        training2Cover: parsedThemeConfig?.training2Cover ? { id: 'training2-cover', name: 'Capa Academy 2', url: parsedThemeConfig.training2Cover, file: null } : null,
        training3Cover: parsedThemeConfig?.training3Cover ? { id: 'training3-cover', name: 'Capa Academy 3', url: parsedThemeConfig.training3Cover, file: null } : null,
        training4Cover: parsedThemeConfig?.training4Cover ? { id: 'training4-cover', name: 'Capa Academy 4', url: parsedThemeConfig.training4Cover, file: null } : null,
        // Template Members settings
        membersHeaderSize: parsedThemeConfig?.membersHeaderSize || 'large',
        membersShowCardBorder: parsedThemeConfig?.membersShowCardBorder ?? false,
        // Template Shop settings
        shopRemoveCardBorder: parsedThemeConfig?.shopRemoveCardBorder ?? false,
        // Template Flow settings
        flowShowCardBorder: parsedThemeConfig?.flowShowCardBorder ?? false,
        // Template Showcase settings
        showcaseTextPosition: parsedThemeConfig?.showcaseTextPosition || 'bottom',
        // Template Classic settings
        showAppIcon: parsedThemeConfig?.showAppIcon ?? true,
        // App Theme
        appTheme: appData.app_theme || 'dark',
        // App name/description colors
        appNameColor: parsedThemeConfig?.appNameColor || '#ffffff',
        appDescriptionColor: parsedThemeConfig?.appDescriptionColor || '#ffffff',
        // Video Course
        videoCourseEnabled: appData.video_course_enabled || false,
        videoModules: appData.video_modules ? (typeof appData.video_modules === 'string' ? JSON.parse(appData.video_modules)?.modules || JSON.parse(appData.video_modules) : appData.video_modules.modules || appData.video_modules) : [],
        videoCourseTitle: appData.video_modules ? (typeof appData.video_modules === 'string' ? JSON.parse(appData.video_modules)?.title || 'Curso em Vídeo' : appData.video_modules.title || 'Curso em Vídeo') : 'Curso em Vídeo',
        videoCourseDescription: appData.video_modules ? (typeof appData.video_modules === 'string' ? JSON.parse(appData.video_modules)?.description || 'Descrição do Curso' : appData.video_modules.description || 'Descrição do Curso') : 'Descrição do Curso',
        videoCourseButtonText: appData.video_modules ? (typeof appData.video_modules === 'string' ? JSON.parse(appData.video_modules)?.buttonText || 'Assistir Aulas' : appData.video_modules.buttonText || 'Assistir Aulas') : 'Assistir Aulas',
        videoCourseImage: appData.video_modules && (typeof appData.video_modules === 'string' ? JSON.parse(appData.video_modules)?.image : appData.video_modules.image) ? { id: 'video-course-img', name: 'Ícone Curso', url: typeof appData.video_modules === 'string' ? JSON.parse(appData.video_modules).image : appData.video_modules.image, file: null } : null,
        videoCourseBackground: appData.video_modules && (typeof appData.video_modules === 'string' ? JSON.parse(appData.video_modules)?.background : appData.video_modules.background) ? { id: 'video-course-bg', name: 'Capa Curso', url: typeof appData.video_modules === 'string' ? JSON.parse(appData.video_modules).background : appData.video_modules.background, file: null } : null,
      };

      // Carregar dados no app builder
      Object.entries(mappedData).forEach(([key, value]) => {
        // Importante: permitir `null` para limpar campos (ex: remover bônus)
        if (value !== undefined) {
          appBuilder.updateAppData(key as any, value);
        }
      });

      toast({
        title: t("index.app_loaded_success"),
        description: t("index.app_loaded_description").replace("{appName}", appData.nome),
      });
    };

    window.addEventListener('loadAppForEdit', handleLoadAppForEdit as any);
    
    return () => {
      window.removeEventListener('loadAppForEdit', handleLoadAppForEdit as any);
    };
  }, [appBuilder, toast]);

  return (
    <div className="min-h-screen bg-app-bg">
      <Header onResetApp={appBuilder.resetApp} />
      
      {/* Barra de ícones FIXA no mobile/tablet */}
      {isTabletOrMobile && (
        <div className="sticky top-16 -mt-px z-50 bg-app-bg border-t border-app-border">
          <SettingsSidebar appBuilder={appBuilder} onSidebarChange={setIsSidebarOpen} />
        </div>
      )}
      
      {/* Progress Bar (NÃO FIXA) */}
      <div className={isTabletOrMobile ? "pt-16 pb-2" : "pt-16 pb-4"}>
        <ProgressBar appBuilder={appBuilder} />
      </div>
    
      {/* SettingsSidebar para desktop */}
      {!isTabletOrMobile && (
        <SettingsSidebar appBuilder={appBuilder} onSidebarChange={setIsSidebarOpen} />
      )}

      {/* Main Content */}
      <main 
        className={`mx-auto px-6 transition-all duration-300 ${
          isTabletOrMobile ? 'py-4' : 'py-8'
        }`}
        style={{
          maxWidth: '1280px',
          marginLeft: (!isTabletOrMobile && isSidebarOpen) ? '500px' : 'auto'
        }}
      >
        {/* Layout Mobile/Tablet - Sequência vertical */}
        {isTabletOrMobile ? (
          <div className="space-y-6">
            {/* 1. Pré-visualização do app */}
            <div className="bg-app-surface border border-app-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
                {t("preview.title")}
              </h2>
              <PhoneMockup
                appName={appBuilder.appData.appName}
                appNameColor={appBuilder.appData.appNameColor}
                appDescription={appBuilder.appData.appDescription}
                appDescriptionColor={appBuilder.appData.appDescriptionColor}
                appColor={appBuilder.appData.appColor}
                appTheme={appBuilder.appData.appTheme}
                appIcon={appBuilder.appData.appIcon?.url}
                appCover={appBuilder.appData.appCover?.url}
                mainProductLabel={appBuilder.appData.mainProductLabel}
                mainProductDescription={appBuilder.appData.mainProductDescription}
                mainProductThumbnail={appBuilder.appData.mainProductThumbnail?.url}
                bonusesLabel={appBuilder.appData.bonusesLabel}
                bonus1Label={appBuilder.appData.bonus1Label}
                bonus1Thumbnail={appBuilder.appData.bonus1Thumbnail?.url}
                bonus1Color={appBuilder.appData.bonus1Color}
                bonus2Label={appBuilder.appData.bonus2Label}
                bonus2Thumbnail={appBuilder.appData.bonus2Thumbnail?.url}
                bonus2Color={appBuilder.appData.bonus2Color}
                bonus3Label={appBuilder.appData.bonus3Label}
                bonus3Thumbnail={appBuilder.appData.bonus3Thumbnail?.url}
                bonus3Color={appBuilder.appData.bonus3Color}
                bonus4Label={appBuilder.appData.bonus4Label}
                bonus4Thumbnail={appBuilder.appData.bonus4Thumbnail?.url}
                bonus4Color={appBuilder.appData.bonus4Color}
                bonus5Label={appBuilder.appData.bonus5Label}
                bonus5Thumbnail={appBuilder.appData.bonus5Thumbnail?.url}
                bonus5Color={appBuilder.appData.bonus5Color}
                bonus6Label={appBuilder.appData.bonus6Label}
                bonus6Thumbnail={appBuilder.appData.bonus6Thumbnail?.url}
                bonus6Color={appBuilder.appData.bonus6Color}
                bonus7Label={appBuilder.appData.bonus7Label}
                bonus7Thumbnail={appBuilder.appData.bonus7Thumbnail?.url}
                bonus7Color={appBuilder.appData.bonus7Color}
                bonus8Label={appBuilder.appData.bonus8Label}
                bonus8Thumbnail={appBuilder.appData.bonus8Thumbnail?.url}
                bonus8Color={appBuilder.appData.bonus8Color}
                bonus9Label={appBuilder.appData.bonus9Label}
                bonus9Thumbnail={appBuilder.appData.bonus9Thumbnail?.url}
                bonus9Color={appBuilder.appData.bonus9Color}
                template={appBuilder.appData.template}
                onTemplateChange={(template) => appBuilder.updateAppData('template', template)}
                notificationEnabled={appBuilder.appData.notificationEnabled}
                notificationTitle={appBuilder.appData.notificationTitle}
                notificationMessage={appBuilder.appData.notificationMessage}
                notificationImage={appBuilder.appData.notificationImage?.url}
                notificationLink={appBuilder.appData.notificationLink}
                notificationButtonText={appBuilder.appData.notificationButtonText}
                notificationButtonColor={appBuilder.appData.notificationButtonColor}
                notificationIcon={appBuilder.appData.notificationIcon}
                viewButtonLabel={appBuilder.appData.viewButtonLabel}
                whatsappEnabled={appBuilder.appData.whatsappEnabled}
                whatsappPhone={appBuilder.appData.whatsappPhone}
                whatsappMessage={appBuilder.appData.whatsappMessage}
                whatsappPosition={appBuilder.appData.whatsappPosition}
                whatsappButtonColor={appBuilder.appData.whatsappButtonColor}
                whatsappButtonText={appBuilder.appData.whatsappButtonText}
                whatsappShowText={appBuilder.appData.whatsappShowText}
                whatsappIconSize={appBuilder.appData.whatsappIconSize}
                membersHeaderSize={appBuilder.appData.membersHeaderSize}
                showAppIcon={appBuilder.appData.showAppIcon}
                mainProductBackground={appBuilder.appData.mainProductBackground?.url}
                bonus1Background={appBuilder.appData.bonus1Background?.url}
                bonus2Background={appBuilder.appData.bonus2Background?.url}
                bonus3Background={appBuilder.appData.bonus3Background?.url}
                bonus4Background={appBuilder.appData.bonus4Background?.url}
                bonus5Background={appBuilder.appData.bonus5Background?.url}
                bonus6Background={appBuilder.appData.bonus6Background?.url}
                bonus7Background={appBuilder.appData.bonus7Background?.url}
                bonus8Background={appBuilder.appData.bonus8Background?.url}
                bonus9Background={appBuilder.appData.bonus9Background?.url}
                showcaseTextPosition={appBuilder.appData.showcaseTextPosition}
                shopRemoveCardBorder={appBuilder.appData.shopRemoveCardBorder}
                membersShowCardBorder={appBuilder.appData.membersShowCardBorder}
                flowShowCardBorder={appBuilder.appData.flowShowCardBorder}
                videoCourseEnabled={appBuilder.appData.videoCourseEnabled}
                videoCourseTitle={appBuilder.appData.videoCourseTitle}
                videoCourseDescription={appBuilder.appData.videoCourseDescription}
                videoCourseButtonText={appBuilder.appData.videoCourseButtonText}
                videoCourseImage={appBuilder.appData.videoCourseImage?.url}
                videoCourseBackground={appBuilder.appData.videoCourseBackground?.url}
                videoModules={appBuilder.appData.videoModules}
                uploadModulesEnabled={appBuilder.appData.uploadModulesEnabled}
                uploadModules={appBuilder.appData.uploadModules}
              />
            </div>
      
            {/* 2. Upload de produtos */}
            <UploadSection appBuilder={appBuilder} />
      
            {/* 3. Personalização do app */}
            <div className="bg-app-surface border border-app-border rounded-xl p-6">
              <CustomizationPanel appBuilder={appBuilder} />
            </div>
      
            {/* 4. Publicar app */}
            <PublishButton appBuilder={appBuilder} />
          </div>
        ) : (
          /* Layout Desktop - Grid de 2 colunas (mantém como está) */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Upload */}
            <div className="space-y-6">
              <UploadSection appBuilder={appBuilder} />
            </div>
      
            {/* Right Column - Preview */}
            <div className="space-y-6">
              {/* Phone Preview */}
              <div className="bg-app-surface border border-app-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
                  {t("preview.title")}
                </h2>
                <PhoneMockup
                  appName={appBuilder.appData.appName}
                  appNameColor={appBuilder.appData.appNameColor}
                  appDescription={appBuilder.appData.appDescription}
                  appDescriptionColor={appBuilder.appData.appDescriptionColor}
                  appColor={appBuilder.appData.appColor}
                  appTheme={appBuilder.appData.appTheme}
                  appIcon={appBuilder.appData.appIcon?.url}
                  appCover={appBuilder.appData.appCover?.url}
                  mainProductLabel={appBuilder.appData.mainProductLabel}
                  mainProductDescription={appBuilder.appData.mainProductDescription}
                  mainProductThumbnail={appBuilder.appData.mainProductThumbnail?.url}
                  bonusesLabel={appBuilder.appData.bonusesLabel}
                  bonus1Label={appBuilder.appData.bonus1Label}
                  bonus1Thumbnail={appBuilder.appData.bonus1Thumbnail?.url}
                  bonus1Color={appBuilder.appData.bonus1Color}
                  bonus2Label={appBuilder.appData.bonus2Label}
                  bonus2Thumbnail={appBuilder.appData.bonus2Thumbnail?.url}
                  bonus2Color={appBuilder.appData.bonus2Color}
                  bonus3Label={appBuilder.appData.bonus3Label}
                  bonus3Thumbnail={appBuilder.appData.bonus3Thumbnail?.url}
                  bonus3Color={appBuilder.appData.bonus3Color}
                  bonus4Label={appBuilder.appData.bonus4Label}
                  bonus4Thumbnail={appBuilder.appData.bonus4Thumbnail?.url}
                  bonus4Color={appBuilder.appData.bonus4Color}
                  bonus5Label={appBuilder.appData.bonus5Label}
                  bonus5Thumbnail={appBuilder.appData.bonus5Thumbnail?.url}
                  bonus5Color={appBuilder.appData.bonus5Color}
                  bonus6Label={appBuilder.appData.bonus6Label}
                  bonus6Thumbnail={appBuilder.appData.bonus6Thumbnail?.url}
                  bonus6Color={appBuilder.appData.bonus6Color}
                  bonus7Label={appBuilder.appData.bonus7Label}
                  bonus7Thumbnail={appBuilder.appData.bonus7Thumbnail?.url}
                  bonus7Color={appBuilder.appData.bonus7Color}
                  bonus8Label={appBuilder.appData.bonus8Label}
                  bonus8Thumbnail={appBuilder.appData.bonus8Thumbnail?.url}
                  bonus8Color={appBuilder.appData.bonus8Color}
                  bonus9Label={appBuilder.appData.bonus9Label}
                  bonus9Thumbnail={appBuilder.appData.bonus9Thumbnail?.url}
                  bonus9Color={appBuilder.appData.bonus9Color}
                  template={appBuilder.appData.template}
                  onTemplateChange={(template) => appBuilder.updateAppData('template', template)}
                  notificationEnabled={appBuilder.appData.notificationEnabled}
                  notificationTitle={appBuilder.appData.notificationTitle}
                  notificationMessage={appBuilder.appData.notificationMessage}
                  notificationImage={appBuilder.appData.notificationImage?.url}
                  notificationLink={appBuilder.appData.notificationLink}
                  notificationButtonText={appBuilder.appData.notificationButtonText}
                  notificationButtonColor={appBuilder.appData.notificationButtonColor}
                  notificationIcon={appBuilder.appData.notificationIcon}
                  viewButtonLabel={appBuilder.appData.viewButtonLabel}
                  whatsappEnabled={appBuilder.appData.whatsappEnabled}
                  whatsappPhone={appBuilder.appData.whatsappPhone}
                  whatsappMessage={appBuilder.appData.whatsappMessage}
                  whatsappPosition={appBuilder.appData.whatsappPosition}
                  whatsappButtonColor={appBuilder.appData.whatsappButtonColor}
                  whatsappButtonText={appBuilder.appData.whatsappButtonText}
                  whatsappShowText={appBuilder.appData.whatsappShowText}
                  whatsappIconSize={appBuilder.appData.whatsappIconSize}
                  membersHeaderSize={appBuilder.appData.membersHeaderSize}
                  trainingLogo={appBuilder.appData.trainingLogo?.url}
                  training1Cover={appBuilder.appData.training1Cover?.url}
                  training2Cover={appBuilder.appData.training2Cover?.url}
                  training3Cover={appBuilder.appData.training3Cover?.url}
                  training4Cover={appBuilder.appData.training4Cover?.url}
                  showAppIcon={appBuilder.appData.showAppIcon}
                  mainProductBackground={appBuilder.appData.mainProductBackground?.url}
                  bonus1Background={appBuilder.appData.bonus1Background?.url}
                  bonus2Background={appBuilder.appData.bonus2Background?.url}
                  bonus3Background={appBuilder.appData.bonus3Background?.url}
                  bonus4Background={appBuilder.appData.bonus4Background?.url}
                  bonus5Background={appBuilder.appData.bonus5Background?.url}
                  bonus6Background={appBuilder.appData.bonus6Background?.url}
                  bonus7Background={appBuilder.appData.bonus7Background?.url}
                  bonus8Background={appBuilder.appData.bonus8Background?.url}
                bonus9Background={appBuilder.appData.bonus9Background?.url}
                showcaseTextPosition={appBuilder.appData.showcaseTextPosition}
                shopRemoveCardBorder={appBuilder.appData.shopRemoveCardBorder}
                membersShowCardBorder={appBuilder.appData.membersShowCardBorder}
                flowShowCardBorder={appBuilder.appData.flowShowCardBorder}
                videoCourseEnabled={appBuilder.appData.videoCourseEnabled}
            videoCourseTitle={appBuilder.appData.videoCourseTitle}
            videoCourseDescription={appBuilder.appData.videoCourseDescription}
            videoCourseButtonText={appBuilder.appData.videoCourseButtonText}
            videoCourseImage={appBuilder.appData.videoCourseImage?.url}
            videoCourseBackground={appBuilder.appData.videoCourseBackground?.url}
            videoModules={appBuilder.appData.videoModules}
            uploadModulesEnabled={appBuilder.appData.uploadModulesEnabled}
            uploadModules={appBuilder.appData.uploadModules}
              />
              </div>
              
              {/* Publish Button */}
              <PublishButton appBuilder={appBuilder} />
            </div>
          </div>
        )}
      </main>

      {/* Academy Floating Button */}
      <AcademyFloatingButton />

      {/* WhatsApp Button de Suporte (apenas para planos Profissional/Empresarial) */}
      {hasWhatsAppSupport && supportWhatsappConfig && supportWhatsappConfig.enabled && (
        <WhatsAppButtonUser config={supportWhatsappConfig} />
      )}
    </div>
  );
};

export default Index;
