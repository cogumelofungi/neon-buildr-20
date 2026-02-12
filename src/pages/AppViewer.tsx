import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import WhatsAppButtonUser from "@/components/WhatsAppButtonUser";
import OrderBumpsSection from "@/components/OrderBumpsSection";
import AppLoginGate, { getLoginSession } from "@/components/AppLoginGate";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { Smartphone, Eye, Download, X, CheckCircle2 } from "lucide-react";
import { getCustomDomainAppSlug, isCustomDomainContext } from "@/utils/customDomainDetection";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ThemeRenderer } from "@/components/ThemeRenderer";
import { PdfViewer } from "@/components/PdfViewer";
import { InternalPdfViewer } from "@/components/InternalPdfViewer";
import DeactivatedApp from "@/components/DeactivatedApp";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import ModernSplashScreen from "@/components/ModernSplashScreen";
import { usePdfViewerSetting } from "@/hooks/usePdfViewerSetting";
import { AdobePdfViewer } from "@/components/AdobePdfViewer";
import { EmbedPdfViewer } from "@/components/EmbedPdfViewer";
import AudioPlayerDialog from "@/components/AudioPlayerDialog";
import { 
  detectDevice, 
  isPWAInstalled, 
  markPWAAsInstalled, 
  logPWADebugInfo 
} from "@/utils/pwaDetection";
import { useIsTabletOrMobile } from "@/hooks/use-mobile";

interface PublishedApp {
  id: string;
  nome: string;
  descricao?: string;
  cor: string;
  slug: string;
  allow_pdf_download?: boolean;
  require_login?: boolean;
  template?: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal' | 'exclusive' | 'units' | 'members' | 'flow' | 'shop' | 'academy';
  app_theme?: 'light' | 'dark';
  icone_url?: string;
  capa_url?: string;
  produto_principal_url?: string;
  bonus1_url?: string;
  bonus2_url?: string;
  bonus3_url?: string;
  bonus4_url?: string;
  bonus5_url?: string;
  bonus6_url?: string;
  bonus7_url?: string;
  bonus8_url?: string;
  bonus9_url?: string;
  bonus10_url?: string;
  bonus11_url?: string;
  bonus12_url?: string;
  bonus13_url?: string;
  bonus14_url?: string;
  bonus15_url?: string;
  bonus16_url?: string;
  bonus17_url?: string;
  bonus18_url?: string;
  bonus19_url?: string;
  main_product_label?: string;
  main_product_description?: string;
  bonuses_label?: string;
  bonus1_label?: string;
  bonus2_label?: string;
  bonus3_label?: string;
  bonus4_label?: string;
  bonus5_label?: string;
  bonus6_label?: string;
  bonus7_label?: string;
  bonus8_label?: string;
  bonus9_label?: string;
  bonus10_label?: string;
  bonus11_label?: string;
  bonus12_label?: string;
  bonus13_label?: string;
  bonus14_label?: string;
  bonus15_label?: string;
  bonus16_label?: string;
  bonus17_label?: string;
  bonus18_label?: string;
  bonus19_label?: string;
  view_button_label?: string;
  bonus1_thumbnail?: string;
  bonus2_thumbnail?: string;
  bonus3_thumbnail?: string;
  bonus4_thumbnail?: string;
  bonus1_color?: string;
  bonus2_color?: string;
  bonus3_color?: string;
  bonus4_color?: string;
  bonus5_color?: string;
  bonus6_color?: string;
  bonus7_color?: string;
  bonus8_color?: string;
  bonus9_color?: string;
  mainProductThumbnail?: string;
  theme_config?: any;
  notification_enabled?: boolean;
  notification_title?: string;
  notification_message?: string;
  notification_image?: string;
  notification_link?: string;
  notification_button_color?: string;
  notification_icon?: string;
  whatsapp_enabled?: boolean;
  whatsapp_phone?: string;
  whatsapp_message?: string;
  whatsapp_position?: string;
  whatsapp_button_color?: string;
  whatsapp_button_text?: string;
  whatsapp_show_text?: boolean;
  whatsapp_icon_size?: "small" | "medium" | "large";
  video_course_enabled?: boolean;
  video_modules?: any;
}

// Mapeia o background real que cada template usa no ThemeRenderer
// Deve corresponder EXATAMENTE ao backgroundColor usado em cada renderXxxTemplate()
const getTemplateBackground = (template: string, theme: string, themeConfigBg?: string): string => {
  const isLight = theme === 'light';
  
  // Templates que usam themeConfig.colors.background (dinâmico)
  const usesThemeConfigBg = ['classic', 'showcase', 'modern', 'minimal'];
  if (usesThemeConfigBg.includes(template) && themeConfigBg) {
    if (isLight) {
      const lightFallbacks: Record<string, string> = {
        classic: '#f3f4f6', corporate: '#e5e7eb', showcase: '#ffffff',
        modern: '#ffffff', minimal: '#ffffff',
      };
      return lightFallbacks[template] || '#f3f4f6';
    }
    return themeConfigBg;
  }

  // Templates com backgrounds hardcoded
  if (isLight) {
    const lightBgs: Record<string, string> = {
      classic: '#f3f4f6', corporate: '#e5e7eb', showcase: '#ffffff',
      modern: '#ffffff', minimal: '#ffffff', exclusive: '#ffffff',
      units: '#E8E3F0', members: '#f8f9fa', flow: '#f5f3ff',
      shop: '#f5f5f5', academy: '#ffffff',
    };
    return lightBgs[template] || '#f3f4f6';
  }
  const darkBgs: Record<string, string> = {
    classic: '#1a1a1a', corporate: '#1f2937', showcase: '#0f0f23',
    modern: '#0f172a', minimal: '#ffffff', exclusive: '#0f172a',
    units: '#1a1625', members: '#1a1625', flow: '#0f0a1f',
    shop: '#000000', academy: '#000000',
  };
  return darkBgs[template] || '#1a1a1a';
};

const AppViewer = () => {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  
  // Determinar o slug: usar do URL ou do domínio customizado
  const slug = useMemo(() => {
    // IMPORTANTE:
    // Em domínio customizado, o pathname (ex: /assinatura2) NÃO é o slug do app.
    // Portanto, sempre priorizamos o slug injetado pelo Worker.
    if (isCustomDomainContext()) {
      const customSlug = getCustomDomainAppSlug();
      console.log('[AppViewer] Usando slug do domínio customizado:', customSlug);
      return customSlug || undefined;
    }

    // Fora de domínio customizado, seguimos o comportamento normal: /:slug
    return urlSlug || undefined;
  }, [urlSlug]);
  
  const { t } = useLanguage();
  const { toast } = useToast();
  const { pdfViewer, adobeClientId, closeButtonColor, controlsColor, headerBgColor, controlsBarColor } = usePdfViewerSetting();
  
  // Custom styles for PDF viewers
  const pdfCustomStyles = {
    closeButtonColor,
    controlsColor,
    headerBgColor,
    controlsBarColor
  };
  const isTabletOrMobile = useIsTabletOrMobile();
  const [app, setApp] = useState<PublishedApp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioTitle, setAudioTitle] = useState<string>("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [userPlanLimits, setUserPlanLimits] = useState<number>(10);
  const [isUserActive, setIsUserActive] = useState<boolean | null>(null);
  const [deviceInfo] = useState(() => detectDevice());
  const [showModernSplash, setShowModernSplash] = useState(false);
  const [splashReady, setSplashReady] = useState(false);
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
  const [ownerHasProfessionalPlan, setOwnerHasProfessionalPlan] = useState(false);
  const [isLoginVerified, setIsLoginVerified] = useState(false);
  const [premiumCardIcon, setPremiumCardIcon] = useState("gift");

  // Detectar se está em modo PWA standalone
  const [isStandalone] = useState(() => {
    // iOS usa navigator.standalone, outros usam display-mode
    const isIOSStandalone = (navigator as any).standalone === true;
    const isDisplayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
    return isIOSStandalone || isDisplayModeStandalone;
  });

  // Dados em cache para splash screen rápido no PWA
  const [cachedAppInfo] = useState<{
    nome: string;
    icone_url?: string;
    cor: string;
    app_theme?: 'light' | 'dark';
  } | null>(() => {
    if (!isStandalone || !slug) return null;
    try {
      const cached = localStorage.getItem(`pwa_app_cache_${slug}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // iOS PWA: Salvar slug e garantir redirecionamento correto
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isIOSStandalone = (navigator as any).standalone === true;
    
    if (slug) {
      // Sempre salvar o slug atual quando estiver visualizando um app
      // Isso garante que mesmo antes de adicionar à tela inicial, o slug esteja salvo
      localStorage.setItem('ios_pwa_last_slug', slug);
      localStorage.setItem('pwa_current_app_slug', slug);
      console.log('[PWA iOS] Slug salvo para PWA:', slug);
    }
    
    if (isIOS && isIOSStandalone) {
      // Verificar se a URL atual é a correta
      const currentPath = window.location.pathname;
      
      // Se estamos na raiz ou em outra rota que não é um slug válido
      if (currentPath === '/' || currentPath === '/index.html' || currentPath === '') {
        // Verificar se há um slug salvo no localStorage
        const savedSlug = localStorage.getItem('ios_pwa_last_slug') || localStorage.getItem('pwa_current_app_slug');
        if (savedSlug) {
          console.log('[PWA iOS] Redirecionando para o app salvo:', savedSlug);
          window.location.replace(`/${savedSlug}`);
          return;
        }
      }
    }
  }, [slug]);

  // Mostrar splash moderno imediatamente para PWA instalado
  useEffect(() => {
    if (isStandalone && !splashReady && (cachedAppInfo || app)) {
      setSplashReady(true);
      setShowModernSplash(true);
    }
  }, [isStandalone, splashReady, cachedAppInfo, app]);

  useEffect(() => {
    const loadApp = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);
        
        // Adicionar cache-busting com timestamp para evitar problemas de cache
        const cacheKey = `app_${slug}_${Date.now()}`;
        
        console.log(`[AppViewer] Carregando app com slug: ${slug}`);
        
        // Primeiro, buscar app publicado (sem expor api_token)
        const safeColumns = 'id, nome, descricao, cor, slug, status, user_id, created_at, updated_at, views, downloads, icone_url, capa_url, produto_principal_url, link_personalizado, template, app_theme, theme_config, allow_pdf_download, main_product_label, main_product_description, view_button_label, bonuses_label, require_login, video_course_enabled, video_modules, notification_enabled, notification_title, notification_text, notification_message, notification_icon, notification_image, notification_link, notification_button_color, whatsapp_enabled, whatsapp_phone, whatsapp_message, whatsapp_button_text, whatsapp_button_color, whatsapp_position, whatsapp_icon_size, whatsapp_show_text, bonus1_url, bonus1_label, bonus2_url, bonus2_label, bonus3_url, bonus3_label, bonus4_url, bonus4_label, bonus5_url, bonus5_label, bonus6_url, bonus6_label, bonus7_url, bonus7_label, bonus8_url, bonus8_label, bonus9_url, bonus9_label, bonus10_url, bonus10_label, bonus11_url, bonus11_label, bonus12_url, bonus12_label, bonus13_url, bonus13_label, bonus14_url, bonus14_label, bonus15_url, bonus15_label, bonus16_url, bonus16_label, bonus17_url, bonus17_label, bonus18_url, bonus18_label, bonus19_url, bonus19_label';
        
        const { data: appData, error } = await supabase
          .from('apps')
          .select(safeColumns)
          .eq('slug', slug)
          .eq('status', 'publicado')
          .maybeSingle();

        console.log(`[AppViewer] Resposta da busca do app:`, { appData, error });

        if (error) {
          console.error('Error loading app:', error);
          toast({
            title: t("app.error"),
            description: `${t("app.error_loading")} ${error.message}`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (!appData) {
          console.warn(`[AppViewer] App não encontrado para slug: ${slug}`);
          
          toast({
            title: t("app.not_found"),
            description: t("app.not_found_desc"),
            variant: "destructive",
          });
          setApp(null);
          setIsLoading(false);
          return;
        }

        // Depois, verificar status do usuário proprietário e plano
        // IMPORTANTE: em apps publicados (rota pública), RLS pode bloquear leitura de user_status.
        // Então calculamos um limite mínimo baseado nos bônus existentes para não “cortar” no bônus 9.
        const existingBonusesCount = [
          appData.bonus1_url,
          appData.bonus2_url,
          appData.bonus3_url,
          appData.bonus4_url,
          appData.bonus5_url,
          appData.bonus6_url,
          appData.bonus7_url,
          appData.bonus8_url,
          appData.bonus9_url,
          appData.bonus10_url,
          appData.bonus11_url,
          appData.bonus12_url,
          appData.bonus13_url,
          appData.bonus14_url,
          appData.bonus15_url,
          appData.bonus16_url,
          appData.bonus17_url,
          appData.bonus18_url,
          appData.bonus19_url,
        ].filter(Boolean).length;
        
        // Limite baseado nos bônus que existem (+ 1 para o produto principal)
        const bonusBasedLimit = Math.min(21, existingBonusesCount + 1);
        setUserPlanLimits(bonusBasedLimit);
        console.log(`[AppViewer] Bônus encontrados: ${existingBonusesCount}, limite inicial: ${bonusBasedLimit}`);

        // Depois, verificar status do usuário proprietário e plano
        // IMPORTANTE: em rota pública, RLS bloqueia leitura direta de user_status.
        // Por isso, usamos uma Edge Function com service role.
        type OwnerStatusData = { is_active: boolean; planName: string };

        const { data: ownerStatus, error: ownerError } = await supabase.functions.invoke<OwnerStatusData>(
          'get-app-owner-status',
          { body: { slug } }
        );

        if (ownerError) {
          console.error('[AppViewer] Error checking owner status via Edge Function:', ownerError);
          // Em caso de erro inesperado, mantém comportamento anterior: não derrubar o app por instabilidade.
          setIsUserActive(true);
        } else {
          const userActive = ownerStatus?.is_active ?? true;
          setIsUserActive(userActive);
          console.log(`[AppViewer] Status do usuário (edge): ${userActive}`);

          const planName = ownerStatus?.planName || '';
          const hasProfessionalAccess = planName === 'Profissional' || planName === 'Empresarial' || planName === 'Consultório';
          setOwnerHasProfessionalPlan(hasProfessionalAccess);

          // Definir limite de bônus baseado no plano
          let planBasedLimit = 11; // Padrão: 10 bônus + 1 produto principal (Essencial)
          if (planName === 'Empresarial' || planName === 'Consultório') {
            planBasedLimit = 21; // 20 bônus + 1 produto principal
          } else if (planName === 'Profissional') {
            planBasedLimit = 16; // 15 bônus + 1 produto principal
          }

          // IMPORTANTE: Usar o MAIOR valor entre o limite do plano e os bônus existentes
          // Isso garante que todos os bônus já salvos sejam exibidos
          const finalLimit = Math.max(bonusBasedLimit, planBasedLimit);
          setUserPlanLimits(finalLimit);

          console.log(`[AppViewer] Plano (edge): ${planName}, limite do plano: ${planBasedLimit}, limite final: ${finalLimit}`);
        }

        // Buscar configuração do WhatsApp de suporte (admin)
        const { data: whatsappData } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('key', 'whatsapp_config')
          .maybeSingle();
        
        if (whatsappData?.value) {
          try {
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
              console.log('[AppViewer] WhatsApp de suporte configurado:', config);
            }
          } catch (e) {
            console.error('[AppViewer] Erro ao parsear config do WhatsApp de suporte:', e);
          }
        }

        // Buscar configuração do ícone do card premium
        const { data: iconData } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('key', `premium_card_icon_${appData.id}`)
          .maybeSingle();
        
        if (iconData?.value) {
          setPremiumCardIcon(iconData.value);
        }

        console.log(`[AppViewer] App carregado com sucesso:`, appData);
        console.log(`[AppViewer] require_login:`, appData.require_login);

        // Type-safe template validation with fallback
        const validatedApp: PublishedApp = {
          ...appData,
          template: (['classic', 'corporate', 'showcase', 'modern', 'minimal', 'exclusive', 'units', 'members', 'flow', 'shop', 'academy'].includes(appData.template)) 
            ? appData.template as 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal' | 'exclusive' | 'units' | 'members' | 'flow' | 'shop' | 'academy'
            : 'classic' as const,
            app_theme: (['light', 'dark'].includes(appData.app_theme))
            ? appData.app_theme as 'light' | 'dark'
            : 'dark' as const,
          whatsapp_icon_size: (['small', 'medium', 'large'].includes(appData.whatsapp_icon_size))
            ? appData.whatsapp_icon_size as 'small' | 'medium' | 'large'
            : 'medium' as const,
          // Garantir que campos críticos não sejam undefined
          nome: appData.nome || 'App sem nome',
          cor: appData.cor || '#4783F6',
          slug: appData.slug || slug,
          require_login: appData.require_login || false
        };

        setApp(validatedApp);

        // Cache app info para splash screen rápido no PWA
        try {
          localStorage.setItem(`pwa_app_cache_${slug}`, JSON.stringify({
            nome: validatedApp.nome,
            icone_url: validatedApp.icone_url,
            cor: validatedApp.cor,
            app_theme: validatedApp.app_theme
          }));
        } catch (e) {
          console.warn('[PWA] Erro ao salvar cache do app:', e);
        }
        
        // Gerar manifest.json dinâmico
        generateManifest(validatedApp);
        
        // Registrar service worker
        registerServiceWorker();
        
        // Setup PWA install prompt - agora inicializado no mount

        console.log(`[AppViewer] App configurado com sucesso para visualização`);
        
      } catch (error) {
        console.error('Erro ao carregar app:', error);
        
        toast({
          title: t("app.unexpected_error"),
          description: t("app.unexpected_error_desc"),
          variant: "destructive",
        });
        
        setApp(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadApp();
  }, [slug, toast]); // Adicionado toast como dependência

  // IMPORTANTE: Capturar o evento beforeinstallprompt IMEDIATAMENTE no mount
  // para evitar que o mini-infobar nativo do Chrome apareça
  useEffect(() => {
    const handleEarlyBeforeInstallPrompt = (e: any) => {
      console.log('[PWA] beforeinstallprompt capturado CEDO - prevenindo mini-infobar nativo');
      e.preventDefault();
      e.stopImmediatePropagation();
      setDeferredPrompt(e);
    };

    // Adicionar listener imediatamente com capture para pegar antes de qualquer outro
    window.addEventListener('beforeinstallprompt', handleEarlyBeforeInstallPrompt, { capture: true });
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleEarlyBeforeInstallPrompt, { capture: true });
    };
  }, []);

  // Verificar sessão de login existente quando app carrega
  // IMPORTANTE: Este hook deve ficar ANTES de qualquer return condicional
  useEffect(() => {
    // Só executar quando o app já carregou
    if (!app) return;
    
    if (app.require_login && app.id) {
      const existingSession = getLoginSession(app.id);
      if (existingSession) {
        console.log('[AppViewer] Sessão de login existente encontrada');
        setIsLoginVerified(true);
      } else {
        console.log('[AppViewer] Nenhuma sessão encontrada, requer login');
        setIsLoginVerified(false);
      }
    } else {
      // Se não requer login, marca como verificado
      console.log('[AppViewer] App não requer login');
      setIsLoginVerified(true);
    }
  }, [app]);

  // Configurar lógica do banner PWA após o app carregar
  useEffect(() => {
    if (app) {
      setupPWAInstallPrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app]);

  const setupPWAInstallPrompt = () => {
    const currentAppId = window.location.pathname;
    
    // Log de debug completo
    logPWADebugInfo(deviceInfo, currentAppId);
    
    // Verificar se já está instalado
    const installed = isPWAInstalled(currentAppId);
    setIsAppInstalled(installed);
    
    if (installed) {
      console.log('[PWA] App já está instalado');
      setShowInstallBanner(false);
      return;
    }

    // Se já temos o deferredPrompt (capturado no useEffect early), mostrar banner
    if (deferredPrompt && !isPWAInstalled(currentAppId)) {
      setShowInstallBanner(true);
      console.log('[PWA] Banner de instalação habilitado (prompt já capturado)');
    }

    const handleAppInstalled = () => {
      console.log('[PWA] App instalado com sucesso');
      setIsAppInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      
      markPWAAsInstalled(currentAppId);
      
      // Definir rota padrão para abrir o PWA sempre no app publicado
      try {
        if (app?.slug) {
          localStorage.setItem('pwaDefaultRoute', `/${app.slug}/`);
        }
      } catch (e) {
        console.warn('[PWA] Não foi possível salvar pwaDefaultRoute', e);
      }
      
      toast({
        title: "✅ App Instalado!",
        description: "O aplicativo foi adicionado à sua tela inicial.",
      });
    };

    // Listener para quando o app é instalado
    window.addEventListener('appinstalled', handleAppInstalled);

    // Listener para mudanças no display mode
    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      if (standaloneMediaQuery.matches) {
        handleAppInstalled();
      }
    };
    standaloneMediaQuery.addEventListener('change', handleDisplayModeChange);

    // Mostrar banner para todos os dispositivos compatíveis
    const bannerTimeout = setTimeout(() => {
      const installed = isPWAInstalled(currentAppId);
      console.log('[PWA] Banner timeout check:', {
        currentAppId,
        installed,
        hasDeferredPrompt: !!deferredPrompt,
        deviceInfo: {
          isIOS: deviceInfo.isIOS,
          isAndroid: deviceInfo.isAndroid,
          isChrome: deviceInfo.isChrome,
          isFirefox: deviceInfo.isFirefox,
          isSafari: deviceInfo.isSafari,
          supportsInstallPrompt: deviceInfo.supportsInstallPrompt,
        }
      });
      
      if (!installed) {
        // Desktop: sempre mostrar banner (vai ter instalação direta se tiver prompt)
        if (!deviceInfo.isIOS && !deviceInfo.isAndroid) {
          console.log('[PWA] Desktop - mostrando banner');
          setShowInstallBanner(true);
        }
        // Android Chrome: mostrar mesmo se não capturou o prompt
        else if (deviceInfo.isAndroid && deviceInfo.isChrome) {
          console.log('[PWA] Android Chrome - mostrando banner');
          setShowInstallBanner(true);
        }
        // Outros dispositivos/navegadores que precisam de instruções
        else if (deviceInfo.supportsInstallPrompt || deviceInfo.isIOS || deviceInfo.isFirefox || deviceInfo.isAndroid) {
          console.log('[PWA] Mostrando banner em dispositivo compatível');
          setShowInstallBanner(true);
        } else {
          console.log('[PWA] Nenhuma condição atendida para mostrar banner');
        }
      } else {
        console.log('[PWA] App já instalado, não mostrando banner');
      }
    }, deviceInfo.isAndroid && deviceInfo.isChrome ? 1500 : 2000);

    return () => {
      clearTimeout(bannerTimeout);
      window.removeEventListener('appinstalled', handleAppInstalled);
      standaloneMediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  };

  const handleInstallApp = async () => {
    console.log(`[PWA] Tentativa de instalação iniciada. Prompt disponível: ${!!deferredPrompt}`);
    
    if (!deferredPrompt) {
      console.warn('[PWA] Prompt não capturado - verifique se o app atende os critérios de instalabilidade');
      toast({
        title: t("app.install_error"),
        description: t("app.install_error_desc"),
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('[PWA] Executando prompt de instalação');
      await deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] Escolha do usuário:', outcome);
      
      if (outcome === 'accepted') {
        const currentAppId = window.location.pathname;
        markPWAAsInstalled(currentAppId);
        
        setShowInstallBanner(false);
        setIsAppInstalled(true);
        
        toast({
          title: t("app.installed"),
          description: t("app.installed_desc"),
        });
      } else {
        toast({
          title: t("app.install_cancelled"),
          description: t("app.install_cancelled_desc"),
        });
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('[PWA] Erro ao instalar:', error);
      toast({
        title: t("app.install_error"),
        description: t("app.install_try_again"),
        variant: "destructive",
      });
    }
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    
    // Reexibir banner após 24 horas
    try {
      const dismissTime = Date.now();
      localStorage.setItem('pwaBannerDismissed', dismissTime.toString());
      
      setTimeout(() => {
        const currentAppId = window.location.pathname;
        if (!isPWAInstalled(currentAppId)) {
          setShowInstallBanner(true);
        }
      }, 24 * 60 * 60 * 1000); // 24 horas
    } catch (e) {
      console.warn('[PWA] Erro ao salvar dismissTime:', e);
    }
  };

  const generateManifest = (appData: PublishedApp) => {
    const baseUrl = window.location.origin;
    const appPath = `/${appData.slug}`;
    const fullStartUrl = `${baseUrl}${appPath}/`;
    const appScope = `${baseUrl}${appPath}/`; // Escopo único por app para permitir instalações independentes
    
    // Usar tema do app para splash screen otimizada
    const isDarkTheme = appData.app_theme === 'dark';
    const splashBgColor = isDarkTheme ? '#0f0f0f' : '#fafafa';
    
    // Gerar URL absoluta para o ícone (necessário para Android)
    const iconUrl = appData.icone_url || `${window.location.origin}/icons/pwa-192.png`;
    const icon512Url = appData.icone_url || `${window.location.origin}/icons/pwa-512.png`;
    
    // ID único baseado no slug para diferenciar apps no navegador
    const uniqueAppId = `migrabook-${appData.slug}`;
    
    const manifest = {
      id: uniqueAppId, // ID único por app
      name: appData.nome,
      short_name: appData.nome.length > 12 ? appData.nome.substring(0, 12) : appData.nome,
      description: appData.descricao || `${appData.nome} - Progressive Web App`,
      start_url: fullStartUrl, // URL absoluta para iOS
      display: "standalone",
      display_override: ["standalone", "minimal-ui"],
      background_color: splashBgColor,
      theme_color: appData.cor,
      orientation: "portrait",
      scope: appScope, // Escopo único por app para instalações independentes
      categories: ["productivity", "utilities"],
      prefer_related_applications: false,
      icons: [
        {
          src: iconUrl,
          sizes: "192x192",
          type: "image/png",
          purpose: "any"
        },
        {
          src: iconUrl,
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable"
        },
        {
          src: icon512Url, 
          sizes: "512x512",
          type: "image/png",
          purpose: "any"
        },
        {
          src: icon512Url, 
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable"
        }
      ],
      // Nota: Screenshots removidos pois causam exibição estranha no prompt de instalação
      // O Chrome Android exibe o screenshot como preview grande, o que não fica bom
    };

    // Criar blob do manifest e registrar
    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(manifestBlob);
    
    // Atualizar/criar link do manifest
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.setAttribute('rel', 'manifest');
      document.head.appendChild(manifestLink);
    }
    manifestLink.setAttribute('href', manifestURL);

    console.log('[PWA] Manifest gerado:', manifest);

    // Persistir rota padrão do PWA
    try {
      localStorage.setItem('pwaDefaultRoute', fullStartUrl);
    } catch (e) {
      console.warn('[PWA] Erro ao salvar pwaDefaultRoute', e);
    }

    // Atualizar meta tags
    updateMetaTags(appData, fullStartUrl);
  };

  const updateMetaTags = (appData: PublishedApp, fullStartUrl?: string) => {
    const isDarkTheme = appData.app_theme === 'dark';
    const splashBgColor = isDarkTheme ? '#0a0a0a' : '#ffffff';
    
    // Theme color
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute('content', appData.cor);

    // Apple mobile web app start URL (específico para iOS)
    if (fullStartUrl) {
      let appleStartUrl = document.querySelector('meta[name="apple-mobile-web-app-start-url"]');
      if (!appleStartUrl) {
        appleStartUrl = document.createElement('meta');
        appleStartUrl.setAttribute('name', 'apple-mobile-web-app-start-url');
        document.head.appendChild(appleStartUrl);
      }
      appleStartUrl.setAttribute('content', fullStartUrl);
    }

    // Apple mobile web app capable
    let appleMobileWebAppCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!appleMobileWebAppCapable) {
      appleMobileWebAppCapable = document.createElement('meta');
      appleMobileWebAppCapable.setAttribute('name', 'apple-mobile-web-app-capable');
      document.head.appendChild(appleMobileWebAppCapable);
    }
    appleMobileWebAppCapable.setAttribute('content', 'yes');

    // Apple mobile web app status bar style
    let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleStatusBar) {
      appleStatusBar = document.createElement('meta');
      appleStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      document.head.appendChild(appleStatusBar);
    }
    appleStatusBar.setAttribute('content', isDarkTheme ? 'black' : 'default');

    // Apple mobile web app title
    let appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (!appleTitle) {
      appleTitle = document.createElement('meta');
      appleTitle.setAttribute('name', 'apple-mobile-web-app-title');
      document.head.appendChild(appleTitle);
    }
    appleTitle.setAttribute('content', appData.nome);

    // Apple touch icon
    let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.setAttribute('rel', 'apple-touch-icon');
      document.head.appendChild(appleTouchIcon);
    }
    appleTouchIcon.setAttribute('href', appData.icone_url || '/icons/apple-touch-icon.png');

    // Application name
    let applicationName = document.querySelector('meta[name="application-name"]');
    if (!applicationName) {
      applicationName = document.createElement('meta');
      applicationName.setAttribute('name', 'application-name');
      document.head.appendChild(applicationName);
    }
    applicationName.setAttribute('content', appData.nome);

    // Mobile web app capable (padrão)
    let mobileWebAppCapable = document.querySelector('meta[name="mobile-web-app-capable"]');
    if (!mobileWebAppCapable) {
      mobileWebAppCapable = document.createElement('meta');
      mobileWebAppCapable.setAttribute('name', 'mobile-web-app-capable');
      document.head.appendChild(mobileWebAppCapable);
    }
    mobileWebAppCapable.setAttribute('content', 'yes');

    // Title
    document.title = appData.nome;

    console.log('[PWA] Meta tags atualizadas com splash screen otimizada');
  };

  const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        // Remover service workers antigos que usavam o escopo /app/
        registrations.forEach(registration => {
          if (registration.scope.includes('/app/')) {
            registration.unregister();
            console.log('[PWA] Service worker antigo removido:', registration.scope);
          }
        });
      });
      
      // Registrar service worker específico para apps publicados
      navigator.serviceWorker.register('/sw-app.js', {
        scope: '/'
      }).then(registration => {
        console.log('[PWA] Service Worker registrado com sucesso');
        console.log('[PWA] Scope:', registration.scope);
        
        // Verificar atualizações
        registration.update();
        
        // Listener para atualizações
        registration.addEventListener('updatefound', () => {
          console.log('[PWA] Atualização de Service Worker encontrada');
        });
      }).catch(error => {
        console.error('[PWA] Falha ao registrar Service Worker:', error);
      });
    }
  };

  const handleViewPdf = (url: string, title: string) => {
    // Verificar se é um arquivo MP3
    const isAudio = url.toLowerCase().endsWith('.mp3') || url.includes('audio/');
    
    if (isAudio) {
      setAudioUrl(url);
      setAudioTitle(title);
    } else {
      setPdfUrl(url);
      setPdfTitle(title);
    }
  };

  const handleViewAudio = (url: string, title: string) => {
    setAudioUrl(url);
    setAudioTitle(title);
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: t("app.download_started"),
        description: t("app.download_started_desc").replace("{filename}", filename),
      });
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: t("app.download_error"),
        description: t("app.download_error_desc"),
        variant: "destructive",
      });
    }
  };

  // Mapear dados para o formato esperado pelo ThemeRenderer
  const mapAppDataForRenderer = (app: PublishedApp) => {
    // Parse theme_config to get thumbnails and backgrounds
    const themeConfig = typeof app.theme_config === 'string' 
      ? JSON.parse(app.theme_config) 
      : app.theme_config || {};
    
    return {
      nome: app.nome,
      nomeColor: themeConfig.appNameColor || null,
      descricao: app.descricao,
      descricaoColor: themeConfig.appDescriptionColor || null,
      cor: app.cor,
      icone_url: app.icone_url,
      capa_url: app.capa_url,
      produto_principal_url: app.produto_principal_url,
      main_product_label: app.main_product_label,
      main_product_description: app.main_product_description,
      bonuses_label: app.bonuses_label,
      bonus1_url: app.bonus1_url,
      bonus1_label: app.bonus1_label,
      bonus1_thumbnail: themeConfig.bonus1Thumbnail || null,
      bonus1_color: app.bonus1_color,
      bonus1Background: themeConfig.bonus1Background || null,
      bonus2_url: app.bonus2_url,
      bonus2_label: app.bonus2_label,
      bonus2_thumbnail: themeConfig.bonus2Thumbnail || null,
      bonus2_color: app.bonus2_color,
      bonus2Background: themeConfig.bonus2Background || null,
      bonus3_url: app.bonus3_url,
      bonus3_label: app.bonus3_label,
      bonus3_thumbnail: themeConfig.bonus3Thumbnail || null,
      bonus3_color: app.bonus3_color,
      bonus3Background: themeConfig.bonus3Background || null,
      bonus4_url: app.bonus4_url,
      bonus4_label: app.bonus4_label,
      bonus4_thumbnail: themeConfig.bonus4Thumbnail || null,
      bonus4_color: app.bonus4_color,
      bonus4Background: themeConfig.bonus4Background || null,
      bonus5_url: app.bonus5_url,
      bonus5_label: app.bonus5_label,
      bonus5_thumbnail: themeConfig.bonus5Thumbnail || null,
      bonus5_color: app.bonus5_color,
      bonus5Background: themeConfig.bonus5Background || null,
      bonus6_url: app.bonus6_url,
      bonus6_label: app.bonus6_label,
      bonus6_thumbnail: themeConfig.bonus6Thumbnail || null,
      bonus6_color: app.bonus6_color,
      bonus6Background: themeConfig.bonus6Background || null,
      bonus7_url: app.bonus7_url,
      bonus7_label: app.bonus7_label,
      bonus7_thumbnail: themeConfig.bonus7Thumbnail || null,
      bonus7_color: app.bonus7_color,
      bonus7Background: themeConfig.bonus7Background || null,
      bonus8_url: app.bonus8_url,
      bonus8_label: app.bonus8_label,
      bonus8_thumbnail: themeConfig.bonus8Thumbnail || null,
      bonus8_color: app.bonus8_color,
      bonus8Background: themeConfig.bonus8Background || null,
      bonus9_url: app.bonus9_url,
      bonus9_label: app.bonus9_label,
      bonus9_thumbnail: themeConfig.bonus9Thumbnail || null,
      bonus9_color: app.bonus9_color,
      bonus9Background: themeConfig.bonus9Background || null,
      bonus10_url: app.bonus10_url,
      bonus10_label: app.bonus10_label,
      bonus10_thumbnail: themeConfig.bonus10Thumbnail || null,
      bonus10Background: themeConfig.bonus10Background || null,
      bonus11_url: app.bonus11_url,
      bonus11_label: app.bonus11_label,
      bonus11_thumbnail: themeConfig.bonus11Thumbnail || null,
      bonus11Background: themeConfig.bonus11Background || null,
      bonus12_url: app.bonus12_url,
      bonus12_label: app.bonus12_label,
      bonus12_thumbnail: themeConfig.bonus12Thumbnail || null,
      bonus12Background: themeConfig.bonus12Background || null,
      bonus13_url: app.bonus13_url,
      bonus13_label: app.bonus13_label,
      bonus13_thumbnail: themeConfig.bonus13Thumbnail || null,
      bonus13Background: themeConfig.bonus13Background || null,
      bonus14_url: app.bonus14_url,
      bonus14_label: app.bonus14_label,
      bonus14_thumbnail: themeConfig.bonus14Thumbnail || null,
      bonus14Background: themeConfig.bonus14Background || null,
      bonus15_url: app.bonus15_url,
      bonus15_label: app.bonus15_label,
      bonus15_thumbnail: themeConfig.bonus15Thumbnail || null,
      bonus15Background: themeConfig.bonus15Background || null,
      bonus16_url: app.bonus16_url,
      bonus16_label: app.bonus16_label,
      bonus16_thumbnail: themeConfig.bonus16Thumbnail || null,
      bonus16Background: themeConfig.bonus16Background || null,
      bonus17_url: app.bonus17_url,
      bonus17_label: app.bonus17_label,
      bonus17_thumbnail: themeConfig.bonus17Thumbnail || null,
      bonus17Background: themeConfig.bonus17Background || null,
      bonus18_url: app.bonus18_url,
      bonus18_label: app.bonus18_label,
      bonus18_thumbnail: themeConfig.bonus18Thumbnail || null,
      bonus18Background: themeConfig.bonus18Background || null,
      bonus19_url: app.bonus19_url,
      bonus19_label: app.bonus19_label,
      bonus19_thumbnail: themeConfig.bonus19Thumbnail || null,
      bonus19Background: themeConfig.bonus19Background || null,
      viewButtonLabel: app.view_button_label || '',
      mainProductThumbnail: themeConfig.mainProductThumbnail || null,
      mainProductBackground: themeConfig.mainProductBackground || null,
      allow_pdf_download: app.allow_pdf_download,
      showAppIcon: themeConfig.showAppIcon ?? true,
      membersHeaderSize: themeConfig.membersHeaderSize || 'large',
      showcaseTextPosition: themeConfig.showcaseTextPosition || 'bottom',
      shopRemoveCardBorder: themeConfig.shopRemoveCardBorder ?? false,
      membersShowCardBorder: themeConfig.membersShowCardBorder ?? false,
      flowShowCardBorder: themeConfig.flowShowCardBorder ?? false,
      trainingLogo: themeConfig.trainingLogo || null,
      training1Cover: themeConfig.training1Cover || null,
      training2Cover: themeConfig.training2Cover || null,
      training3Cover: themeConfig.training3Cover || null,
      training4Cover: themeConfig.training4Cover || null,
      videoCourseEnabled: app.video_course_enabled || false,
      videoCourseTitle: app.video_modules ? (JSON.parse(app.video_modules as string)?.title || '') : '',
      videoCourseDescription: app.video_modules ? (JSON.parse(app.video_modules as string)?.description || '') : '',
      videoCourseButtonText: app.video_modules ? (JSON.parse(app.video_modules as string)?.buttonText || 'Assistir Aulas') : 'Assistir Aulas',
      videoCourseImage: app.video_modules ? (JSON.parse(app.video_modules as string)?.image || null) : null,
      videoCourseBackground: app.video_modules ? (JSON.parse(app.video_modules as string)?.background || null) : null,
      videoModules: app.video_modules ? (JSON.parse(app.video_modules as string)?.modules || []) : [],
      uploadModulesEnabled: themeConfig.uploadModulesEnabled || false,
      uploadModules: themeConfig.uploadModules || [],
    };
  };

  // Se está carregando E em modo PWA standalone, o splash screen já está sendo exibido
  // Não mostrar tela de loading genérica para evitar múltiplas telas
  if (isLoading && !isStandalone) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0F1117' }}
      >
        <p className="text-white/60 text-sm">{t("common.loading")}</p>
      </div>
    );
  }

  // Para PWA standalone enquanto carrega, não renderizar nada (splash está visível)
  if (isLoading && isStandalone) {
    return null;
  }

  // Se o usuário proprietário não está ativo, mostrar tela de app desativado
  if (isUserActive === false && app) {
    return (
      <DeactivatedApp 
        appName={app.nome}
        appColor={app.cor}
      />
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-app-text mb-2">{t("appviewer.notfound.title")}</h1>
          <p className="text-app-muted mb-4">{t("appviewer.notfound.message")}</p>
          <p className="text-sm text-app-muted mb-6">
            {t("appviewer.notfound.help")}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t("common.try_again")}
          </button>
        </div>
      </div>
    );
  }

  // Renderização do conteúdo principal do app
  const renderAppContent = () => {
    const themeConfig = typeof app.theme_config === 'string' 
      ? JSON.parse(app.theme_config) 
      : app.theme_config || {};
    
    return (
      <>
        <ThemeRenderer
          template={app.template || 'classic'}
          appData={mapAppDataForRenderer(app)}
          appTheme={app.app_theme || 'dark'}
          userPlanLimits={userPlanLimits}
          isPreview={false}
          onViewPdf={handleViewPdf}
          onDownload={handleDownload}
          notificationEnabled={app.notification_enabled ?? false}
          notificationTitle={app.notification_title || ''}
          notificationMessage={app.notification_message || ''}
          notificationImage={app.notification_image || ''}
          notificationLink={app.notification_link || ''}
          notificationButtonText={themeConfig?.notificationButtonText || ''}
          notificationButtonColor={app.notification_button_color || '#f97316'}
          notificationIcon={app.notification_icon || 'gift'}
        />

      {/* Order Bumps Section - Conteúdos Premium */}
      <OrderBumpsSection
        appId={app.id}
        appSlug={app.slug}
        primaryColor={app.cor}
        premiumIcon={premiumCardIcon}
        appTheme={app.app_theme as 'dark' | 'light' || 'dark'}
        appTemplate={app.template || 'classic'}
        backgroundColor={getTemplateBackground(app.template || 'classic', app.app_theme || 'dark', themeConfig?.colors?.background)}
      />

      {/* WhatsApp Button do app - dentro do mockup no desktop */}
      <WhatsAppButtonUser 
        config={app ? {
          enabled: app.whatsapp_enabled || false,
          phone: app.whatsapp_phone || '',
          message: app.whatsapp_message || 'Olá! Vim através do app.',
          position: (app.whatsapp_position as 'bottom-right' | 'bottom-left') || 'bottom-right',
          buttonColor: app.whatsapp_button_color || '#25D366',
          buttonText: app.whatsapp_button_text || 'Fale Conosco',
          showText: app.whatsapp_show_text !== true,
          iconSize: app.whatsapp_icon_size || "medium",
        } : undefined}
      />

      {/* WhatsApp de Suporte (Admin) - apenas para usuários com plano Profissional ou superior */}
      {ownerHasProfessionalPlan && supportWhatsappConfig && supportWhatsappConfig.enabled && (
        <WhatsAppButtonUser 
          config={supportWhatsappConfig}
        />
      )}
      </>
    );
  };

  // Dados para o splash screen (usa cache se app não carregou ainda)
  const splashData = app || cachedAppInfo;

  // Se o app requer login e o usuário ainda não foi verificado
  const requiresLoginGate = app?.require_login && !isLoginVerified;

  // Se precisa de login, mostrar tela de login
  if (requiresLoginGate && app) {
    return (
      <AppLoginGate
        appId={app.id}
        appSlug={app.slug}
        appName={app.nome}
        appIcon={app.icone_url}
        appColor={app.cor}
        appTheme={app.app_theme || 'dark'}
        onSuccess={() => setIsLoginVerified(true)}
      />
    );
  }

  return (
    <>
      {/* Modern Splash Screen for PWA - usa dados em cache durante carregamento */}
      {showModernSplash && splashData && (
        <ModernSplashScreen
          appName={splashData.nome}
          appIcon={splashData.icone_url}
          appColor={splashData.cor}
          appTheme={splashData.app_theme || 'dark'}
          onComplete={() => setShowModernSplash(false)}
        />
      )}

      {/* Desktop: Mockup de celular | Mobile/Tablet: Tela cheia */}
      {isTabletOrMobile ? (
        renderAppContent()
      ) : (
        <div 
          className="h-screen flex items-center justify-center py-4 overflow-hidden"
          style={{ 
            backgroundColor: app.app_theme === 'dark' ? '#0a0a0a' : '#f5f5f5'
          }}
        >
          <div className="desktop-phone-mockup">
            <div className="desktop-phone-screen">
              {renderAppContent()}
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Banner */}
      {console.log('[PWA] Render check:', { showInstallBanner, isAppInstalled, hasApp: !!app })}
      {showInstallBanner && !isAppInstalled && (
        <PWAInstallBanner
          onInstall={handleInstallApp}
          onDismiss={handleDismissBanner}
          hasPrompt={!!deferredPrompt}
          appIcon={app.icone_url}
          appName={app.nome}
        />
      )}

      {/* PDF Viewer - Renderiza baseado na configuração do admin */}
      {pdfUrl && pdfViewer === 'react-pdf' && (
        <InternalPdfViewer
          pdfUrl={pdfUrl}
          title={pdfTitle}
          isOpen={!!pdfUrl}
          onClose={() => setPdfUrl(null)}
          allowDownload={app.allow_pdf_download === true}
          onDownload={handleDownload}
          customStyles={pdfCustomStyles}
        />
      )}
      
      {pdfUrl && pdfViewer === 'google-docs' && (
        <PdfViewer
          pdfUrl={pdfUrl}
          title={pdfTitle}
          isOpen={!!pdfUrl}
          onClose={() => setPdfUrl(null)}
          allowDownload={app.allow_pdf_download === true}
          onDownload={handleDownload}
        />
      )}

      {pdfUrl && pdfViewer === 'adobe-embed' && (
        <div className="fixed inset-0 z-50">
          <button 
            onClick={() => setPdfUrl(null)}
            className="absolute top-4 right-4 z-[60] p-2 rounded-full bg-black/70 hover:bg-black/90 text-white shadow-lg border border-white/20"
            style={{ color: closeButtonColor }}
          >
            <X className="w-6 h-6" />
          </button>
          <AdobePdfViewer 
            url={pdfUrl} 
            fileName={pdfTitle}
            allowDownload={app.allow_pdf_download === true}
            clientId={adobeClientId}
          />
        </div>
      )}

      {pdfUrl && pdfViewer === 'embedpdf' && (
        <div className="fixed inset-0 z-50" style={{ backgroundColor: headerBgColor || '#000000' }}>
          <button 
            onClick={() => setPdfUrl(null)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full hover:bg-white/20"
            style={{ 
              backgroundColor: `${controlsBarColor || '#000000'}40`,
              color: closeButtonColor || '#ffffff'
            }}
          >
            <X className="w-6 h-6" />
          </button>
          <EmbedPdfViewer 
            url={pdfUrl}
            allowDownload={app.allow_pdf_download === true}
            customStyles={pdfCustomStyles}
          />
        </div>
      )}

      {/* Audio Player Dialog for MP3 files */}
      <AudioPlayerDialog
        open={!!audioUrl}
        onOpenChange={(open) => {
          if (!open) {
            setAudioUrl(null);
            setAudioTitle("");
          }
        }}
        audioUrl={audioUrl || ""}
        title={audioTitle}
        allowDownload={app.allow_pdf_download === true}
        onDownload={handleDownload}
      />
    </>
  );
};

export default AppViewer;
