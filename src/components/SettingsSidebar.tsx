import { useLanguage } from "@/hooks/useLanguage";
import { generateUniqueSlug } from "@/utils/generateUniqueSlug";
import PremiumOverlay from "@/components/ui/premium-overlay";
import { Settings, Globe, Bell, Plug, FolderUp, MessageCircle, Link2, CalendarDays, CheckCircle2, DollarSign } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import CustomizationPanel from "@/components/CustomizationPanel";
import CustomDomainDialog from "@/components/CustomDomainDialog";
import IntegrationsPanel from "@/components/IntegrationsPanel";
import NotificationSettings from "@/components/NotificationSettings";
import WhatsAppSettings from "@/components/WhatsAppSettings";
import AppointmentSettings from "@/components/AppointmentSettings";
import OrderBumpsPanel from "@/components/admin/OrderBumpsPanel";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useFeatureAccess, getRequiredPlan } from "@/hooks/useFeatureAccess";
import { useToast } from "@/hooks/use-toast";
import { useIsTabletOrMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HelpCircle, Download, Upload, Crown } from "lucide-react";
import { useActiveCustomDomain } from "@/hooks/useActiveCustomDomain";
interface SettingsSidebarProps {
  appBuilder: any;
  onSidebarChange?: (isOpen: boolean) => void;
}
type SectionType = "import" | "settings" | "domain" | "notification" | "integrations" | "whatsapp" | "appointments" | "orderbumps" | null;
const SettingsSidebar = ({
  appBuilder,
  onSidebarChange
}: SettingsSidebarProps) => {
  const [activeSection, setActiveSection] = useState<SectionType>(null);
  const isTabletOrMobile = useIsTabletOrMobile();
  const {
    t
  } = useLanguage();
  const [whatsappConfig, setWhatsappConfig] = useState<{
    phone?: string;
  } | null>(null);

  // Estados e hooks para importação
  const [importData, setImportData] = useState({
    json: "",
    appId: ""
  });
  const [isImporting, setIsImporting] = useState(false);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();
  const {
    maxProducts,
    planName,
    isLoading: planLoading
  } = usePlanLimits();
  const {
    hasAppImport,
    hasWhatsAppSupport,
    hasCustomDomain,
    hasAppointments,
    hasIntegrations
  } = useFeatureAccess();

  // Verificar se o usuário tem domínio personalizado ativo
  const {
    hasActiveDomain,
    activeDomain,
    isLoading: domainLoading
  } = useActiveCustomDomain();

  // Carregar configuração do WhatsApp
  const loadWhatsAppConfig = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("admin_settings").select("value").eq("key", "whatsapp_config").maybeSingle();
      if (data?.value) {
        const config = JSON.parse(data.value);
        setWhatsappConfig(config);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações do WhatsApp:", error);
    }
  };

  // Carregar config quando o componente montar ou quando abrir a seção de domínio
  useEffect(() => {
    if (activeSection === "domain") {
      loadWhatsAppConfig();
    }
  }, [activeSection]);
  const handleIconClick = (section: SectionType) => {
    const newSection = activeSection === section ? null : section;
    setActiveSection(newSection);
    onSidebarChange?.(newSection !== null);
  };
  const handleClose = () => {
    setActiveSection(null);
    onSidebarChange?.(false);
  };

  // 1️⃣ Função para importar por ID
  const handleImportById = async () => {
    if (!importData.appId.trim()) return;
    if (planName === "Essencial") {
      toast({
        title: t("toast.feature.unavailable.title"),
        description: t("toast.feature.unavailable.description"),
        variant: "destructive"
      });
      return;
    }
    setIsImporting(true);
    try {
      const {
        data: {
          user: currentUser
        }
      } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Usuário não logado");
      const {
        data: app,
        error
      } = await supabase.from("apps").select("*").eq("id", importData.appId.trim()).single();
      if (error) throw error;
      if (!app) {
        toast({
          title: t("upload.app.notfound.title"),
          description: t("upload.app.notfound.description"),
          variant: "destructive"
        });
        return;
      }
      if (app.user_id !== currentUser.id) {
        toast({
          title: t("upload.access.denied.title"),
          description: t("upload.access.denied.description"),
          variant: "destructive"
        });
        return;
      }
      const originalSlug = app.link_personalizado || app.slug || '';
      const uniqueSlug = originalSlug ? await generateUniqueSlug(originalSlug) : '';

      const importedData = {
        appName: app.nome || t("upload.default.appname"),
        appDescription: app.descricao || t("upload.default.description"),
        appColor: app.cor || "#4783F6",
        customLink: uniqueSlug,
        customDomain: '',
        allowPdfDownload: false,
        template: app.template || "classic",
        themeConfig: app.theme_config,
        appIcon: app.icone_url ? {
          id: "icon",
          name: "icon",
          url: app.icone_url
        } : undefined,
        appCover: app.capa_url ? {
          id: "cover",
          name: "cover",
          url: app.capa_url
        } : undefined,
        mainProduct: app.produto_principal_url ? {
          id: "main",
          name: "main",
          url: app.produto_principal_url
        } : undefined,
        bonus1: app.bonus1_url ? {
          id: "bonus1",
          name: "bonus1",
          url: app.bonus1_url
        } : undefined,
        bonus2: app.bonus2_url ? {
          id: "bonus2",
          name: "bonus2",
          url: app.bonus2_url
        } : undefined,
        bonus3: app.bonus3_url ? {
          id: "bonus3",
          name: "bonus3",
          url: app.bonus3_url
        } : undefined,
        bonus4: app.bonus4_url ? {
          id: "bonus4",
          name: "bonus4",
          url: app.bonus4_url
        } : undefined,
        bonus5: (app as any).bonus5_url ? {
          id: "bonus5",
          name: "bonus5",
          url: (app as any).bonus5_url
        } : undefined,
        bonus6: (app as any).bonus6_url ? {
          id: "bonus6",
          name: "bonus6",
          url: (app as any).bonus6_url
        } : undefined,
        bonus7: (app as any).bonus7_url ? {
          id: "bonus7",
          name: "bonus7",
          url: (app as any).bonus7_url
        } : undefined,
        bonus8: (app as any).bonus8_url ? {
          id: "bonus8",
          name: "bonus8",
          url: (app as any).bonus8_url
        } : undefined,
        bonus9: (app as any).bonus9_url ? {
          id: "bonus9",
          name: "bonus9",
          url: (app as any).bonus9_url
        } : undefined,
        mainProductLabel: app.main_product_label || "",
        mainProductDescription: app.main_product_description || "",
        bonusesLabel: app.bonuses_label || "",
        bonus1Label: app.bonus1_label || "",
        bonus2Label: app.bonus2_label || "",
        bonus3Label: app.bonus3_label || "",
        bonus4Label: app.bonus4_label || "",
        bonus5Label: (app as any).bonus5_label || "",
        bonus6Label: (app as any).bonus6_label || "",
        bonus7Label: (app as any).bonus7_label || "",
        bonus8Label: (app as any).bonus8_label || "",
        bonus9Label: (app as any).bonus9_label || "",
        videoCourseEnabled: (app as any).video_course_enabled ?? false,
        videoModules: (app as any).video_modules ? (JSON.parse((app as any).video_modules)?.modules || []) : [],
        videoCourseTitle: (app as any).video_modules ? (JSON.parse((app as any).video_modules)?.title || 'Curso em Vídeo') : 'Curso em Vídeo',
        videoCourseDescription: (app as any).video_modules ? (JSON.parse((app as any).video_modules)?.description || 'Descrição do Curso') : 'Descrição do Curso',
        videoCourseButtonText: (app as any).video_modules ? (JSON.parse((app as any).video_modules)?.buttonText || 'Assistir Aulas') : 'Assistir Aulas',
        videoCourseImage: (app as any).video_modules ? (JSON.parse((app as any).video_modules)?.image ? { id: 'vc-img', name: 'vc-img', url: JSON.parse((app as any).video_modules).image } : undefined) : undefined,
        videoCourseBackground: (app as any).video_modules ? (JSON.parse((app as any).video_modules)?.background ? { id: 'vc-bg', name: 'vc-bg', url: JSON.parse((app as any).video_modules).background } : undefined) : undefined,
      };
      Object.entries(importedData).forEach(([key, value]) => {
        if (value !== undefined) {
          appBuilder.updateAppData(key as keyof typeof importedData, value);
        }
      });
      toast({
        title: t("toast.import.success.title"),
        description: t("toast.import.success.description").replace("{appName}", app.nome)
      });
      setImportData({
        json: "",
        appId: ""
      });
    } catch (error) {
      console.error("Erro ao importar app:", error);
      toast({
        title: t("toast.import.error.title"),
        description: t("toast.import.error.description"),
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  // 2️⃣ Função para exportar como JSON
  const exportAppAsJson = () => {
    const exportData = {
      appName: appBuilder.appData.appName,
      appDescription: appBuilder.appData.appDescription,
      appColor: appBuilder.appData.appColor,
      customLink: appBuilder.appData.customLink,
      customDomain: appBuilder.appData.customDomain,
      allowPdfDownload: appBuilder.appData.allowPdfDownload,
      template: appBuilder.appData.template,
      themeConfig: appBuilder.appData.themeConfig,
      appIcon: appBuilder.appData.appIcon,
      appCover: appBuilder.appData.appCover,
      mainProduct: appBuilder.appData.mainProduct,
      mainProductThumbnail: appBuilder.appData.mainProductThumbnail,
      bonus1: appBuilder.appData.bonus1,
      bonus1Thumbnail: appBuilder.appData.bonus1Thumbnail,
      bonus2: appBuilder.appData.bonus2,
      bonus2Thumbnail: appBuilder.appData.bonus2Thumbnail,
      bonus3: appBuilder.appData.bonus3,
      bonus3Thumbnail: appBuilder.appData.bonus3Thumbnail,
      bonus4: appBuilder.appData.bonus4,
      bonus4Thumbnail: appBuilder.appData.bonus4Thumbnail,
      bonus5: appBuilder.appData.bonus5,
      bonus5Thumbnail: appBuilder.appData.bonus5Thumbnail,
      bonus6: appBuilder.appData.bonus6,
      bonus6Thumbnail: appBuilder.appData.bonus6Thumbnail,
      bonus7: appBuilder.appData.bonus7,
      bonus7Thumbnail: appBuilder.appData.bonus7Thumbnail,
      bonus8: appBuilder.appData.bonus8,
      bonus8Thumbnail: appBuilder.appData.bonus8Thumbnail,
      bonus9: appBuilder.appData.bonus9,
      bonus9Thumbnail: appBuilder.appData.bonus9Thumbnail,
      mainProductLabel: appBuilder.appData.mainProductLabel,
      mainProductDescription: appBuilder.appData.mainProductDescription,
      bonusesLabel: appBuilder.appData.bonusesLabel,
      bonus1Label: appBuilder.appData.bonus1Label,
      bonus2Label: appBuilder.appData.bonus2Label,
      bonus3Label: appBuilder.appData.bonus3Label,
      bonus4Label: appBuilder.appData.bonus4Label,
      bonus5Label: appBuilder.appData.bonus5Label,
      bonus6Label: appBuilder.appData.bonus6Label,
      bonus7Label: appBuilder.appData.bonus7Label,
      bonus8Label: appBuilder.appData.bonus8Label,
      bonus9Label: appBuilder.appData.bonus9Label,
      videoCourseEnabled: appBuilder.appData.videoCourseEnabled,
      videoModules: appBuilder.appData.videoModules,
      videoCourseTitle: appBuilder.appData.videoCourseTitle,
      videoCourseDescription: appBuilder.appData.videoCourseDescription,
      videoCourseButtonText: appBuilder.appData.videoCourseButtonText,
      videoCourseImage: appBuilder.appData.videoCourseImage,
      videoCourseBackground: appBuilder.appData.videoCourseBackground,
      exportedAt: new Date().toISOString(),
      version: "2.0"
    };
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${appBuilder.appData.appName.replace(/[^a-zA-Z0-9]/g, "_")}_backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: t("toast.backup.success.title"),
      description: t("toast.backup.success.description")
    });
  };

  // 3️⃣ Função para selecionar arquivo JSON
  const handleJsonFileSelect = () => {
    if (planName === "Essencial") {
      toast({
        title: t("toast.feature.unavailable.title"),
        description: t("toast.feature.unavailable.description"),
        variant: "destructive"
      });
      return;
    }
    jsonFileInputRef.current?.click();
  };

  // 4️⃣ Função para processar arquivo JSON
  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        const jsonContent = e.target?.result as string;
        const jsonData = JSON.parse(jsonContent);
        if (!jsonData.appName && !jsonData.nome) {
          throw new Error("Formato JSON inválido");
        }

        const originalSlug = jsonData.customLink || jsonData.link_personalizado || '';
        const uniqueSlug = originalSlug ? await generateUniqueSlug(originalSlug) : '';

        const importedData = {
          appName: jsonData.appName || jsonData.nome || "Meu App",
          appDescription: jsonData.appDescription || jsonData.descricao || "Descrição do App",
          appColor: jsonData.appColor || jsonData.cor || "#4783F6",
          customLink: uniqueSlug,
          customDomain: '',
          allowPdfDownload: false,
          template: jsonData.template || "classic",
          themeConfig: jsonData.themeConfig || jsonData.theme_config,
          appIcon: jsonData.appIcon || (jsonData.icone_url ? {
            id: "icon",
            name: "icon",
            url: jsonData.icone_url
          } : undefined),
          appCover: jsonData.appCover || (jsonData.capa_url ? {
            id: "cover",
            name: "cover",
            url: jsonData.capa_url
          } : undefined),
          mainProduct: jsonData.mainProduct || (jsonData.produto_principal_url ? {
            id: "main",
            name: "main",
            url: jsonData.produto_principal_url
          } : undefined),
          mainProductThumbnail: jsonData.mainProductThumbnail,
          bonus1: jsonData.bonus1 || (jsonData.bonus1_url ? {
            id: "bonus1",
            name: "bonus1",
            url: jsonData.bonus1_url
          } : undefined),
          bonus1Thumbnail: jsonData.bonus1Thumbnail,
          bonus2: jsonData.bonus2 || (jsonData.bonus2_url ? {
            id: "bonus2",
            name: "bonus2",
            url: jsonData.bonus2_url
          } : undefined),
          bonus2Thumbnail: jsonData.bonus2Thumbnail,
          bonus3: jsonData.bonus3 || (jsonData.bonus3_url ? {
            id: "bonus3",
            name: "bonus3",
            url: jsonData.bonus3_url
          } : undefined),
          bonus3Thumbnail: jsonData.bonus3Thumbnail,
          bonus4: jsonData.bonus4 || (jsonData.bonus4_url ? {
            id: "bonus4",
            name: "bonus4",
            url: jsonData.bonus4_url
          } : undefined),
          bonus4Thumbnail: jsonData.bonus4Thumbnail,
          bonus5: jsonData.bonus5 || (jsonData.bonus5_url ? {
            id: "bonus5",
            name: "bonus5",
            url: jsonData.bonus5_url
          } : undefined),
          bonus5Thumbnail: jsonData.bonus5Thumbnail,
          bonus6: jsonData.bonus6 || (jsonData.bonus6_url ? {
            id: "bonus6",
            name: "bonus6",
            url: jsonData.bonus6_url
          } : undefined),
          bonus6Thumbnail: jsonData.bonus6Thumbnail,
          bonus7: jsonData.bonus7 || (jsonData.bonus7_url ? {
            id: "bonus7",
            name: "bonus7",
            url: jsonData.bonus7_url
          } : undefined),
          bonus7Thumbnail: jsonData.bonus7Thumbnail,
          bonus8: jsonData.bonus8 || (jsonData.bonus8_url ? {
            id: "bonus8",
            name: "bonus8",
            url: jsonData.bonus8_url
          } : undefined),
          bonus8Thumbnail: jsonData.bonus8Thumbnail,
          bonus9: jsonData.bonus9 || (jsonData.bonus9_url ? {
            id: "bonus9",
            name: "bonus9",
            url: jsonData.bonus9_url
          } : undefined),
          bonus9Thumbnail: jsonData.bonus9Thumbnail,
          mainProductLabel: jsonData.mainProductLabel || jsonData.main_product_label || "",
          mainProductDescription: jsonData.mainProductDescription || jsonData.main_product_description || "",
          bonusesLabel: jsonData.bonusesLabel || jsonData.bonuses_label || "",
          bonus1Label: jsonData.bonus1Label || jsonData.bonus1_label || "",
          bonus2Label: jsonData.bonus2Label || jsonData.bonus2_label || "",
          bonus3Label: jsonData.bonus3Label || jsonData.bonus3_label || "",
          bonus4Label: jsonData.bonus4Label || jsonData.bonus4_label || "",
          bonus5Label: jsonData.bonus5Label || jsonData.bonus5_label || "",
          bonus6Label: jsonData.bonus6Label || jsonData.bonus6_label || "",
          bonus7Label: jsonData.bonus7Label || jsonData.bonus7_label || "",
          bonus8Label: jsonData.bonus8Label || jsonData.bonus8_label || "",
          bonus9Label: jsonData.bonus9Label || jsonData.bonus9_label || "",
          videoCourseEnabled: jsonData.videoCourseEnabled ?? false,
          videoModules: jsonData.videoModules || [],
          videoCourseTitle: jsonData.videoCourseTitle || 'Curso em Vídeo',
          videoCourseDescription: jsonData.videoCourseDescription || 'Descrição do Curso',
          videoCourseButtonText: jsonData.videoCourseButtonText || 'Assistir Aulas',
          videoCourseImage: jsonData.videoCourseImage,
          videoCourseBackground: jsonData.videoCourseBackground
        };
        Object.entries(importedData).forEach(([key, value]) => {
          if (value !== undefined) {
            appBuilder.updateAppData(key as keyof typeof importedData, value);
          }
        });
        toast({
          title: t("toast.json.import.success.title"),
          description: t("toast.json.import.success.description")
        });
        setImportData({
          json: "",
          appId: ""
        });
      } catch (error) {
        console.error("Erro ao processar JSON:", error);
        toast({
          title: t("toast.json.error.title"),
          description: t("toast.json.error.description"),
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };
  const renderSectionContent = (inDialog: boolean) => {
    switch (activeSection) {
      case "settings":
        return <>
            {inDialog ? <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  {t("sidebar.customization.title")}
                </DialogTitle>
              </DialogHeader> : <div className="mb-1">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  {t("sidebar.customization.title")}
                </h2>
              </div>}
            <div className={`space-y-4 ${inDialog ? "pt-4" : "pt-1"}`}>
              <p className="text-sm text-muted-foreground">{t("sidebar.customization.description")}</p>
              <p className="text-sm">
                <span className="text-amber-500 font-medium">
                  Template:{" "}
                  {{
                  classic: "Classic",
                  corporate: "Corporate",
                  showcase: "Showcase",
                  modern: "Modern",
                  exclusive: "Exclusive",
                  units: "Units",
                  academy: "Academy",
                  flow: "Flow",
                  members: "Members",
                  shop: "Shop"
                }[appBuilder?.appData?.template || "classic"] || appBuilder?.appData?.template || "Classic"}
                </span>
              </p>
              <Separator />
              <CustomizationPanel appBuilder={appBuilder} />
            </div>
          </>;
      case "import":
        return <>
            {inDialog ? <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FolderUp className="h-5 w-5 text-amber-500" />
                  {t("sidebar.import.title")}
                </DialogTitle>
              </DialogHeader> : <div className="mb-1">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FolderUp className="h-5 w-5 text-amber-500" />
                  {t("sidebar.import.title")}
                </h2>
              </div>}
            <div className={`space-y-4 ${inDialog ? "pt-4" : "pt-1"}`}>
              <p className="text-sm text-muted-foreground">{t("sidebar.import.description")}</p>
              <Separator />
              {/* Envolver o conteúdo com PremiumOverlay */}
              <PremiumOverlay isBlocked={!hasAppImport} title={t("sidebar.import.title")} description={t("sidebar.import.description")} requiredPlan={getRequiredPlan("hasAppImport")}>
                {/* Conteúdo de Importação */}
                <Card className="bg-app-surface border-app-border p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-app-surface-hover rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                      <FolderUp className="w-5 h-5 sm:w-6 sm:h-6 text-app-muted" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
                        <h3 className="font-medium text-foreground text-center sm:text-left">
                          {t("sidebar.import.title")}
                        </h3>
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="mx-auto sm:mx-0 p-1 hover:bg-app-surface-hover rounded transition-colors">
                                <HelpCircle className="w-4 h-4 text-app-muted" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-app-surface border-app-border max-w-xs">
                              <p>{t("import.tooltip")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="json-import" className="text-sm text-app-muted">
                            {t("import.select.json")}
                          </Label>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex-1">
                                    <Button variant="outline" className="w-full border-app-border justify-center sm:justify-start text-sm" onClick={handleJsonFileSelect} disabled={isImporting || planName === "Essencial"}>
                                      <Upload className="w-4 h-4 mr-2" />
                                      {t("import.select.file")}
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                {planName === "Essencial" && <TooltipContent className="bg-app-surface border-app-border">
                                    <p>{t("import.premium.required")}</p>
                                  </TooltipContent>}
                              </Tooltip>
                            </TooltipProvider>
                            {(planName === "Profissional" || planName === "Empresarial") && <Button variant="outline" onClick={exportAppAsJson} className="w-full sm:w-auto border-app-border text-sm">
                                <Download className="w-4 h-4 mr-2" />
                                {t("import.backup")}
                              </Button>}
                            <input ref={jsonFileInputRef} type="file" accept=".json" className="hidden" onChange={handleJsonFileChange} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </PremiumOverlay>
            </div>
          </>;
      case "domain":
        return <>
            {inDialog ? <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-blue-500" />
                  {t("sidebar.domain.title")}
                </DialogTitle>
              </DialogHeader> : <div className="mb-1">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-blue-500" />
                  {t("sidebar.domain.title")}
                </h2>
              </div>}
            <PremiumOverlay isBlocked={!hasCustomDomain} title={t("sidebar.domain.title")} description={t("premium.exclusive.empresarial")} requiredPlan="premium.plan.empresarial">
              <div className={`space-y-4 ${inDialog ? "pt-4" : "pt-1"}`}>
                <p className="text-sm text-muted-foreground">{t("sidebar.domain.description")}</p>
                <Separator />

                <p className="text-sm text-muted-foreground">{t("sidebar.domain.why.title")}</p>

                {/* Botão WhatsApp para orientação */}
                <Button onClick={() => {
                window.open("https://wa.me/554420001762?text=Ol%C3%A1!%20Estou%20entrando%20em%20contato%20para%20solicitar%20a%20configura%C3%A7%C3%A3o%20do%20meu%20dom%C3%ADnio%20pr%C3%B3prio%20no%20MigraBook", "_blank", "noopener,noreferrer");
              }} size="lg" className="w-full gap-2 py-6">
                  <MessageCircle className="w-5 h-5" />
                  {t("domain.whatsapp.start")}
                </Button>

                <Separator />

                {/* Botão para configurar token do domínio */}
                <p className="text-sm text-muted-foreground">
                  {hasActiveDomain ? `Seu domínio ${activeDomain?.domain} está ativo. Gerencie os mapeamentos abaixo:` : "Já recebeu seu token de verificação? Configure seu domínio abaixo:"}
                </p>
                <CustomDomainDialog>
                  <Button variant="outline" className="w-full gap-2">
                    {hasActiveDomain ? <>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-green-500">Domínio Ativo</span>
                      </> : <>
                        <Globe className="w-4 h-4" />
                        Ativar Domínio
                      </>}
                  </Button>
                </CustomDomainDialog>
              </div>
            </PremiumOverlay>
          </>;
      case "notification":
        return <>
            {inDialog ? <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-500" />
                  {t("sidebar.notification.title")}
                </DialogTitle>
              </DialogHeader> : <div className="mb-1">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-500" />
                  {t("sidebar.notification.title")}
                </h2>
              </div>}
            <div className={`space-y-4 ${inDialog ? "pt-4" : "pt-1"}`}>
              <p className="text-sm text-muted-foreground">{t("sidebar.notification.description")}</p>
              <Separator />
              <NotificationSettings appBuilder={appBuilder} />
            </div>
          </>;
      case "integrations":
        return <>
            {inDialog ? <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plug className="h-5 w-5 text-purple-500" />
                  {t("sidebar.integrations.title")}
                </DialogTitle>
              </DialogHeader> : <div className="mb-1">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Plug className="h-5 w-5 text-purple-500" />
                  {t("sidebar.integrations.title")}
                </h2>
              </div>}
            <div className={`space-y-4 ${inDialog ? "pt-4" : "pt-1"}`}>
              <p className="text-sm text-muted-foreground">{t("sidebar.integrations.description")}</p>
              <Separator />
              <IntegrationsPanel />
            </div>
          </>;
      case "whatsapp":
        return <>
            {inDialog ? <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                  {t("sidebar.whatsapp.title")}
                </DialogTitle>
              </DialogHeader> : <div className="mb-1">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                  {t("sidebar.whatsapp.title")}
                </h2>
              </div>}
            <div className={`space-y-4 ${inDialog ? "pt-4" : "pt-1"}`}>
              <p className="text-sm text-muted-foreground">{t("sidebar.whatsapp.description")}</p>
              <Separator />
              <PremiumOverlay isBlocked={!hasWhatsAppSupport} title={t("sidebar.whatsapp.title")} description={t("sidebar.whatsapp.description")} requiredPlan={getRequiredPlan("hasWhatsAppSupport")}>
                <WhatsAppSettings appBuilder={appBuilder} />
              </PremiumOverlay>
            </div>
          </>;
      case "appointments":
        return <>
            {inDialog ? <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-teal-500" />
                  Agenda de Consultas
                </DialogTitle>
              </DialogHeader> : <div className="mb-1">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-teal-500" />
                  Agenda de Consultas
                </h2>
              </div>}
            <div className={`space-y-4 ${inDialog ? "pt-4" : "pt-1"}`}>
              <p className="text-sm text-muted-foreground">
                Gerencie os agendamentos de consultas dos seus clientes.
              </p>
              <Separator />
              {appBuilder?.appData?.id ? <AppointmentSettings appId={appBuilder.appData.id} /> : <p className="text-sm text-muted-foreground text-center py-4">
                  Publique seu app primeiro para gerenciar agendamentos.
                </p>}
            </div>
          </>;
      case "orderbumps":
        return <>
            {inDialog ? <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-pink-500" />
                  Order Bumps
                </DialogTitle>
              </DialogHeader> : <div className="mb-1">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-pink-500" />
                  Order Bumps
                </h2>
              </div>}
            <div className={`space-y-4 ${inDialog ? "pt-4" : "pt-1"}`}>
              <p className="text-sm text-muted-foreground">
                Ative vendas extras dentro do app e escale seu faturamento.
              </p>
              <Separator />
              <PremiumOverlay isBlocked={!hasIntegrations} title="Order Bumps" description="Configure conteúdos premium liberados por compra adicional" requiredPlan={getRequiredPlan("hasIntegrations")}>
                {appBuilder?.appData?.id ? <OrderBumpsPanel appId={appBuilder.appData.id} appTemplate={appBuilder.appData.template || 'classic'} appTheme={(appBuilder.appData.appTheme as 'dark' | 'light') || 'dark'} /> : <p className="text-sm text-muted-foreground text-center py-4">
                    Publique seu app primeiro para configurar order bumps.
                  </p>}
              </PremiumOverlay>
            </div>
          </>;
      default:
        return null;
    }
  };
  return <>
      {/* Desktop: Fixed Icons + Sidebar */}
      {!isTabletOrMobile && <>
          {/* Fixed Icons */}
          <TooltipProvider delayDuration={200}>
            <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
              {/* 1. Personalização do App */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => handleIconClick("settings")} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110", activeSection === "settings" ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-accent")}>
                    <Settings className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{t("sidebar.tooltip.customization")}</p>
                </TooltipContent>
              </Tooltip>

              {/* 2. WhatsApp Support */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => handleIconClick("whatsapp")} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110", activeSection === "whatsapp" ? "bg-green-500 text-white" : "bg-card border border-border hover:bg-accent")}>
                    <MessageCircle className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{t("sidebar.tooltip.whatsapp")}</p>
                </TooltipContent>
              </Tooltip>

              {/* 3. Notificação no App */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => handleIconClick("notification")} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110", activeSection === "notification" ? "bg-orange-500 text-white" : "bg-card border border-border hover:bg-accent")}>
                    <Bell className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{t("sidebar.tooltip.notification")}</p>
                </TooltipContent>
              </Tooltip>

              {/* 4. Integrações com Plataformas */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => handleIconClick("integrations")} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110", activeSection === "integrations" ? "bg-purple-500 text-white" : "bg-card border border-border hover:bg-accent")}>
                    <Plug className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{t("sidebar.tooltip.integrations")}</p>
                </TooltipContent>
              </Tooltip>

              {/* 5. Domínio Próprio */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => handleIconClick("domain")} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110", activeSection === "domain" ? "bg-blue-500 text-white" : "bg-card border border-border hover:bg-accent")}>
                    <Link2 className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{t("sidebar.tooltip.domain")}</p>
                </TooltipContent>
              </Tooltip>

              {/* 6. Order Bumps */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => handleIconClick("orderbumps")} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110", activeSection === "orderbumps" ? "bg-pink-500 text-white" : "bg-card border border-border hover:bg-accent")}>
                    <DollarSign className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Order Bumps</p>
                </TooltipContent>
              </Tooltip>

              {/* 7. Agenda de Consultas - EXCLUSIVO Plano Consultório */}
              {hasAppointments && <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => handleIconClick("appointments")} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110", activeSection === "appointments" ? "bg-teal-500 text-white" : "bg-card border border-border hover:bg-accent")}>
                      <CalendarDays className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Agenda de Consultas</p>
                  </TooltipContent>
                </Tooltip>}
            </div>
          </TooltipProvider>

          {/* Sidebar Panel */}
          {activeSection !== null && <div className="fixed left-20 w-[420px] bg-card border border-app-border z-40 animate-slide-in-right rounded-2xl overflow-hidden shadow-lg" style={{
        top: "calc(64px + 64px + 32px)",
        bottom: "32px"
      }}>
              <ScrollArea className="h-full px-6 py-6 pb-8">{renderSectionContent(false)}</ScrollArea>
            </div>}
        </>}

      {/* Tablet & Mobile: Horizontal Icons Bar + Dialog */}
      {isTabletOrMobile && <>
          {/* Barra Horizontal de Ícones */}
          <div className="w-full bg-card border-b border-app-border px-4 py-3">
            <TooltipProvider delayDuration={0}>
              <div className="flex items-center justify-center gap-3">
                {/* 1. Importar App */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => handleIconClick("import")} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110", activeSection === "import" ? "bg-amber-500 text-white" : "bg-card border border-border hover:bg-accent")}>
                      <FolderUp className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("sidebar.tooltip.import")}</p>
                  </TooltipContent>
                </Tooltip>

                {/* 2. WhatsApp Support */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => handleIconClick("whatsapp")} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110", activeSection === "whatsapp" ? "bg-green-500 text-white" : "bg-card border border-border hover:bg-accent")}>
                      <MessageCircle className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("sidebar.tooltip.whatsapp")}</p>
                  </TooltipContent>
                </Tooltip>

                {/* 3. Notificação no App */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => handleIconClick("notification")} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110", activeSection === "notification" ? "bg-orange-500 text-white" : "bg-card border border-border hover:bg-accent")}>
                      <Bell className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("sidebar.tooltip.notification")}</p>
                  </TooltipContent>
                </Tooltip>

                {/* 4. Integrações com Plataformas */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => handleIconClick("integrations")} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110", activeSection === "integrations" ? "bg-purple-500 text-white" : "bg-card border border-border hover:bg-accent")}>
                      <Plug className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("sidebar.tooltip.integrations")}</p>
                  </TooltipContent>
                </Tooltip>

                {/* 5. Domínio Próprio */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => handleIconClick("domain")} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110", activeSection === "domain" ? "bg-blue-500 text-white" : "bg-card border border-border hover:bg-accent")}>
                      <Link2 className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("sidebar.tooltip.domain")}</p>
                  </TooltipContent>
                </Tooltip>

                {/* 6. Order Bumps */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => handleIconClick("orderbumps")} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110", activeSection === "orderbumps" ? "bg-pink-500 text-white" : "bg-card border border-border hover:bg-accent")}>
                      <DollarSign className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Order Bumps</p>
                  </TooltipContent>
                </Tooltip>

                {/* 7. Agenda de Consultas - EXCLUSIVO Plano Consultório */}
                {hasAppointments && <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => handleIconClick("appointments")} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110", activeSection === "appointments" ? "bg-teal-500 text-white" : "bg-card border border-border hover:bg-accent")}>
                        <CalendarDays className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Agenda de Consultas</p>
                    </TooltipContent>
                  </Tooltip>}
              </div>
            </TooltipProvider>
          </div>

          {/* Dialog para cada seção */}
          <Dialog open={activeSection !== null} onOpenChange={open => !open && handleClose()}>
            <DialogContent className="max-w-[95vw] md:max-w-[600px] max-h-[85vh] overflow-y-auto">
              <ScrollArea className="h-full pr-4">{renderSectionContent(true)}</ScrollArea>
            </DialogContent>
          </Dialog>
        </>}
    </>;
};
export default SettingsSidebar;
