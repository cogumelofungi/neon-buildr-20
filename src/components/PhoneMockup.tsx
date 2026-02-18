import { ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect, useMemo } from "react";
import { usePremiumTemplates } from "@/hooks/usePremiumTemplates";
import { Button } from "@/components/ui/button";
import { ThemeRenderer } from "@/components/ThemeRenderer";
import { useCustomTemplates } from "@/hooks/useCustomTemplates";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useNavigate } from "react-router-dom";
import WhatsAppButtonUser from "@/components/WhatsAppButtonUser";

interface PhoneMockupProps {
  appName?: string;
  appNameColor?: string;
  appDescription?: string;
  appDescriptionColor?: string;
  appColor?: string;
  appTheme?: 'light' | 'dark';
  appIcon?: string;
  appCover?: string;
  mainProductLabel?: string;
  mainProductDescription?: string;
  mainProductThumbnail?: string;
  bonusesLabel?: string;
  bonus1Label?: string;
  bonus1Thumbnail?: string;
  bonus1Color?: string;
  bonus2Label?: string;
  bonus2Thumbnail?: string;
  bonus2Color?: string;
  bonus3Label?: string;
  bonus3Thumbnail?: string;
  bonus3Color?: string;
  bonus4Label?: string;
  bonus4Thumbnail?: string;
  bonus4Color?: string;
  bonus5Label?: string;
  bonus5Thumbnail?: string;
  bonus5Color?: string;
  bonus6Label?: string;
  bonus6Thumbnail?: string;
  bonus6Color?: string;
  bonus7Label?: string;
  bonus7Thumbnail?: string;
  bonus7Color?: string;
  bonus8Label?: string;
  bonus8Thumbnail?: string;
  bonus8Color?: string;
  bonus9Label?: string;
  bonus9Thumbnail?: string;
  bonus9Color?: string;
  template?: "classic" | "corporate" | "showcase" | "modern" | "minimal" | "exclusive" | "units" | "members" | "flow" | "shop" | "academy";
  onTemplateChange?: (
    template: "classic" | "corporate" | "showcase" | "modern" | "minimal" | "exclusive" | "units" | "members" | "flow" | "shop" | "academy"
  ) => void;
  notificationEnabled?: boolean;
  notificationTitle?: string;
  notificationMessage?: string;
  notificationImage?: string;
  notificationLink?: string;
  notificationButtonText?: string;
  notificationButtonColor?: string;
  notificationIcon?: string;
  viewButtonLabel?: string;
  whatsappEnabled?: boolean;
  whatsappPhone?: string;
  whatsappMessage?: string;
  whatsappPosition?: "bottom-right" | "bottom-left";
  whatsappButtonColor?: string;
  whatsappButtonText?: string;
  whatsappShowText?: boolean;
  whatsappIconSize?: "small" | "medium" | "large";
  membersHeaderSize?: "small" | "medium" | "large";
  trainingLogo?: string;
  training1Cover?: string;
  training2Cover?: string;
  training3Cover?: string;
  training4Cover?: string;
  showAppIcon?: boolean;
  // Corporate template backgrounds
  mainProductBackground?: string;
  bonus1Background?: string;
  bonus2Background?: string;
  bonus3Background?: string;
  bonus4Background?: string;
  bonus5Background?: string;
  bonus6Background?: string;
  bonus7Background?: string;
  bonus8Background?: string;
  bonus9Background?: string;
  showcaseTextPosition?: 'bottom' | 'middle' | 'top';
  shopRemoveCardBorder?: boolean;
  membersShowCardBorder?: boolean;
  flowShowCardBorder?: boolean;
  videoCourseEnabled?: boolean;
  videoCourseTitle?: string;
  videoCourseDescription?: string;
  videoCourseButtonText?: string;
  videoCourseImage?: string;
  videoCourseBackground?: string;
  videoModules?: { id: string; title: string; videos: { id: string; title: string; youtubeUrl: string }[] }[];
  uploadModulesEnabled?: boolean;
  uploadModules?: { id: string; title: string; items: string[] }[];
}

const PhoneMockup = ({
  appName = "",
  appNameColor = "#ffffff",
  appDescription = "",
  appDescriptionColor = "#ffffff",
  appColor = "#4783F6",
  appTheme = "dark",
  appIcon,
  appCover,
  mainProductLabel,
  mainProductDescription,
  mainProductThumbnail,
  bonusesLabel,
  bonus1Label,
  bonus1Thumbnail,
  bonus1Color = "#3b82f6",
  bonus2Label,
  bonus2Thumbnail,
  bonus2Color = "#10b981",
  bonus3Label,
  bonus3Thumbnail,
  bonus3Color = "#f97316",
  bonus4Label,
  bonus4Thumbnail,
  bonus4Color = "#f59e0b",
  bonus5Label,
  bonus5Thumbnail,
  bonus5Color = "#14b8a6",
  bonus6Label,
  bonus6Thumbnail,
  bonus6Color = "#8b5cf6",
  bonus7Label,
  bonus7Thumbnail,
  bonus7Color = "#ec4899",
  bonus8Label,
  bonus8Thumbnail,
  bonus8Color = "#06b6d4",
  bonus9Label,
  bonus9Thumbnail,
  bonus9Color = "#84cc16",
  template = "classic",
  onTemplateChange,
  notificationEnabled = false,
  notificationTitle = "",
  notificationMessage = "",
  notificationImage = "",
  notificationLink = "",
  notificationButtonText = "",
  notificationButtonColor = "#ff0000",
  notificationIcon = "gift",
  viewButtonLabel,
  whatsappEnabled = false,
  whatsappPhone = "",
  whatsappMessage,
  whatsappPosition = "bottom-right",
  whatsappButtonColor = "#25D366",
  whatsappButtonText,
  whatsappShowText = true,
  whatsappIconSize = "medium",
  membersHeaderSize = "large",
  trainingLogo,
  training1Cover,
  training2Cover,
  training3Cover,
  training4Cover,
  showAppIcon = true,
  mainProductBackground,
  bonus1Background,
  bonus2Background,
  bonus3Background,
  bonus4Background,
  bonus5Background,
  bonus6Background,
  bonus7Background,
  bonus8Background,
  bonus9Background,
  showcaseTextPosition = 'bottom',
  shopRemoveCardBorder = false,
  membersShowCardBorder = false,
  flowShowCardBorder = false,
  videoCourseEnabled = false,
  videoCourseTitle,
  videoCourseDescription,
  videoCourseButtonText,
  videoCourseImage,
  videoCourseBackground,
  videoModules = [],
  uploadModulesEnabled = false,
  uploadModules = [],
}: PhoneMockupProps) => {
  const { t } = useLanguage();
  const { isTemplateAllowed, hasProfessionalAccess, hasEnterpriseAccess } = usePremiumTemplates();
  
  // Sem fallbacks - campos vazios devem aparecer vazios na preview
  const defaultWhatsappMessage = whatsappMessage || t("phonemockup.default.whatsappMessage");
  const defaultWhatsappButtonText = whatsappButtonText || t("phonemockup.default.whatsappButtonText");
  const { customTemplates } = useCustomTemplates();
  const { maxProducts } = usePlanLimits();
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    navigate("/pricing");
  };

  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);

  const defaultTemplates = useMemo(
    () => [
      {
        id: "classic",
        name: "Classic",
        description: t("template.classic.description"),
        isPremium: false,
        isEnterpriseOnly: false,
        requiredPlan: "free",
        type: "default" as const,
      },
      {
        id: "corporate",
        name: "Corporate",
        description: t("template.corporate.description"),
        isPremium: true,
        isEnterpriseOnly: false,
        requiredPlan: "professional",
        type: "default" as const,
      },
      {
        id: "showcase",
        name: "Showcase",
        description: t("template.showcase.description"),
        isPremium: true,
        isEnterpriseOnly: false,
        requiredPlan: "professional",
        type: "default" as const,
      },
      {
        id: "modern",
        name: "Modern",
        description: t("template.modern.description"),
        isPremium: true,
        isEnterpriseOnly: false,
        requiredPlan: "professional",
        type: "default" as const,
      },
      {
        id: "exclusive",
        name: "Exclusive",
        description: t("template.exclusive.description"),
        isPremium: true,
        isEnterpriseOnly: false,
        requiredPlan: "professional",
        type: "default" as const,
      },
      {
        id: "units",
        name: "Units",
        description: "Template estilo unidades com cards numerados",
        isPremium: true,
        isEnterpriseOnly: true,
        requiredPlan: "enterprise",
        type: "default" as const,
      },
      {
        id: "members",
        name: "Members",
        description: "Template estilo área de membros com hero e cards",
        isPremium: true,
        isEnterpriseOnly: true,
        requiredPlan: "enterprise",
        type: "default" as const,
      },
      {
        id: "flow",
        name: "Flow",
        description: "Template moderno com barra de progresso e módulos em grid",
        isPremium: true,
        isEnterpriseOnly: true,
        requiredPlan: "enterprise",
        type: "default" as const,
      },
      {
        id: "shop",
        name: "Shop",
        description: "Template tipo loja com produtos em grid e ícones de cadeado",
        isPremium: true,
        isEnterpriseOnly: true,
        requiredPlan: "enterprise",
        type: "default" as const,
      },
      {
        id: "academy",
        name: "Academy",
        description: "Template tipo academia com carrossel em destaque e módulos",
        isPremium: true,
        isEnterpriseOnly: true,
        requiredPlan: "enterprise",
        type: "default" as const,
      },
    ],
    [t]
  );

  const customTemplateItems = customTemplates.map((ct) => ({
    id: ct.id,
    name: ct.name,
    description: ct.description,
    isPremium: ct.isPremium,
    isEnterpriseOnly: ct.isPremium, // Custom templates são sempre enterprise
    requiredPlan: ct.isPremium ? "enterprise" : "free",
    type: "custom" as const,
    customTemplate: ct,
  }));

  const allTemplates = useMemo(
    () => [...defaultTemplates, ...customTemplateItems],
    [defaultTemplates, customTemplateItems]
  );

  useEffect(() => {
    const index = allTemplates.findIndex((t) => t.id === template);
    if (index !== -1 && currentTemplateIndex !== index) {
      setCurrentTemplateIndex(index);
    }
  }, [template]);

  const handlePrevTemplate = () => {
    const newIndex =
      currentTemplateIndex > 0
        ? currentTemplateIndex - 1
        : allTemplates.length - 1;
    setCurrentTemplateIndex(newIndex);
    const newTemplate = allTemplates[newIndex];

    if (onTemplateChange && isTemplateAllowed(newTemplate.id)) {
      onTemplateChange(newTemplate.id as any);
    }
  };

  const handleNextTemplate = () => {
    const newIndex =
      currentTemplateIndex < allTemplates.length - 1
        ? currentTemplateIndex + 1
        : 0;
    setCurrentTemplateIndex(newIndex);
    const newTemplate = allTemplates[newIndex];

    if (onTemplateChange && isTemplateAllowed(newTemplate.id)) {
      onTemplateChange(newTemplate.id as any);
    }
  };

  const currentTemplate = allTemplates[currentTemplateIndex];

  let effectiveTemplate:
    | "classic"
    | "corporate"
    | "showcase"
    | "modern"
    | "minimal"
    | "exclusive"
    | "units"
    | "members"
    | "flow"
    | "shop"
    | "academy";
  let effectiveColor = appColor;
  let effectiveThemeConfig = null;

  if (currentTemplate.type === "custom") {
    effectiveTemplate = currentTemplate.customTemplate!.template;
    effectiveColor =
      currentTemplate.customTemplate!.colors?.primary || appColor;
    effectiveThemeConfig = currentTemplate.customTemplate;
  } else {
    effectiveTemplate = currentTemplate.id as
      | "classic"
      | "corporate"
      | "showcase"
      | "modern"
      | "minimal"
      | "exclusive"
      | "units"
      | "members"
      | "flow"
      | "shop"
      | "academy";
  }

  const appData = {
    nome: appName || "",
    nomeColor: appNameColor,
    descricao: appDescription || "",
    descricaoColor: appDescriptionColor,
    cor: effectiveColor,
    icone_url: appIcon,
    capa_url: appCover,
    produto_principal_url: "dummy-url",
    main_product_label: mainProductLabel || "",
    main_product_description: mainProductDescription || "",
    bonuses_label: bonusesLabel || "",
    bonus1_url: "dummy-url",
    bonus1_label: bonus1Label || "",
    bonus1_thumbnail: bonus1Thumbnail,
    bonus1_color: bonus1Color,
    bonus2_url: "dummy-url",
    bonus2_label: bonus2Label || "",
    bonus2_thumbnail: bonus2Thumbnail,
    bonus2_color: bonus2Color,
    bonus3_url: "dummy-url",
    bonus3_label: bonus3Label || "",
    bonus3_thumbnail: bonus3Thumbnail,
    bonus3_color: bonus3Color,
    bonus4_url: "dummy-url",
    bonus4_label: bonus4Label || "",
    bonus4_thumbnail: bonus4Thumbnail,
    bonus4_color: bonus4Color,
    bonus5_url: "dummy-url",
    bonus5_label: bonus5Label || "",
    bonus5_thumbnail: bonus5Thumbnail,
    bonus5_color: bonus5Color,
    bonus6_url: "dummy-url",
    bonus6_label: bonus6Label || "",
    bonus6_thumbnail: bonus6Thumbnail,
    bonus6_color: bonus6Color,
    bonus7_url: "dummy-url",
    bonus7_label: bonus7Label || "",
    bonus7_thumbnail: bonus7Thumbnail,
    bonus7_color: bonus7Color,
    bonus8_url: "dummy-url",
    bonus8_label: bonus8Label || "",
    bonus8_thumbnail: bonus8Thumbnail,
    bonus8_color: bonus8Color,
    bonus9_url: "dummy-url",
    bonus9_label: bonus9Label || "",
    bonus9_thumbnail: bonus9Thumbnail,
    bonus9_color: bonus9Color,
    mainProductThumbnail: mainProductThumbnail,
    allow_pdf_download: false,
    viewButtonLabel: viewButtonLabel || "",
    membersHeaderSize,
    trainingLogo,
    training1Cover,
    training2Cover,
    training3Cover,
    training4Cover,
    showAppIcon,
    // Corporate template backgrounds
    mainProductBackground,
    bonus1Background,
    bonus2Background,
    bonus3Background,
    bonus4Background,
    bonus5Background,
    bonus6Background,
    bonus7Background,
    bonus8Background,
    bonus9Background,
    showcaseTextPosition,
    shopRemoveCardBorder,
    membersShowCardBorder,
    flowShowCardBorder,
    videoCourseEnabled,
    videoCourseTitle: videoCourseTitle || "",
    videoCourseDescription: videoCourseDescription || "",
    videoCourseButtonText: videoCourseButtonText || "",
    videoCourseImage,
    videoCourseBackground,
    videoModules,
    uploadModulesEnabled,
    uploadModules,
  };

  return (
    <div className="flex justify-center relative">
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-40 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm border-border/50 hover:bg-background shadow-lg"
        onClick={handlePrevTemplate}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-40 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm border-border/50 hover:bg-background shadow-lg"
        onClick={handleNextTemplate}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="phone-mockup">
        <div className="phone-screen relative">
          <div className="relative w-full h-full max-w-[280px] mx-auto">
            <div
              className="w-full h-full rounded-[2.5rem] overflow-hidden"
              style={{ backgroundColor: "#1a1a1a" }}
            >
              <ThemeRenderer
                template={effectiveTemplate}
                appData={appData}
                appTheme={appTheme}
                userPlanLimits={maxProducts}
                isPreview={true}
                customTheme={effectiveThemeConfig}
                notificationEnabled={notificationEnabled}
                notificationTitle={notificationTitle}
                notificationMessage={notificationMessage}
                notificationImage={notificationImage}
                notificationLink={notificationLink}
                notificationButtonText={notificationButtonText}
                notificationButtonColor={notificationButtonColor}
                notificationIcon={notificationIcon}
              />
            </div>
          </div>

          {!isTemplateAllowed(currentTemplate.id) && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-[2.5rem] z-30 flex items-center justify-center">
              <div className="bg-black/80 rounded-xl p-6 mx-6 text-center border border-orange-500/30 max-w-xs">
                <Crown className="w-10 h-10 text-orange-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold text-lg mb-2">
                  {currentTemplate.name}
                </h3>
                <p className="text-white/70 text-sm mb-4">
                  {currentTemplate.description}
                </p>
                <button
                  onClick={handleUpgradeClick}
                  className="bg-orange-500/20 text-orange-300 px-4 py-2 rounded-full text-sm font-medium
                             hover:bg-orange-500/30 transition-all duration-200 cursor-pointer
                             hover:scale-105 active:scale-95"
                >
                  {currentTemplate.isEnterpriseOnly 
                    ? t("premium.templates.upgrade") 
                    : t("premium.plan.profissional") + " →"}
                </button>
                <p className="text-white/60 text-xs mt-3">
                  {currentTemplate.isEnterpriseOnly 
                    ? t("premium.templates.message")
                    : "Upgrade para o Plano Profissional"}
                </p>
              </div>
            </div>
          )}

          {/* WhatsApp Button Preview (agora DENTRO do phone-screen) */}
          {whatsappEnabled && (
            <WhatsAppButtonUser
              isPreview={true}
              config={{
                enabled: whatsappEnabled,
                phone: whatsappPhone,
                message: defaultWhatsappMessage,
                position: whatsappPosition,
                buttonColor: whatsappButtonColor,
                buttonText: defaultWhatsappButtonText,
                showText: whatsappShowText,
                iconSize: whatsappIconSize,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
