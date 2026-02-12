import { ThemeConfig, THEME_PRESETS } from "@/types/theme";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Download,
  Smartphone,
  Gift,
  X,
  Bell,
  Star,
  Sparkles,
  Zap,
  Trophy,
  Heart,
  Award,
  ChevronRight,
  ChevronLeft,
  Calendar,
  ImageIcon,
  Play,
  Upload,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { getAppTranslation } from "@/hooks/useAppLanguage";
import VideoPlayerDialog from "@/components/VideoPlayerDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExpandableDescription from "@/components/ExpandableDescription";

interface AppData {
  nome: string;
  nomeColor?: string;
  descricao?: string;
  descricaoColor?: string;
  cor: string;
  icone_url?: string;
  capa_url?: string;
  produto_principal_url?: string;
  main_product_label?: string;
  main_product_description?: string;
  bonuses_label?: string;
  bonus1_url?: string;
  bonus1_label?: string;
  bonus1_thumbnail?: string;
  bonus1_color?: string;
  bonus2_url?: string;
  bonus2_label?: string;
  bonus2_thumbnail?: string;
  bonus2_color?: string;
  bonus3_url?: string;
  bonus3_label?: string;
  bonus3_thumbnail?: string;
  bonus3_color?: string;
  bonus4_url?: string;
  bonus4_label?: string;
  bonus4_thumbnail?: string;
  bonus4_color?: string;
  bonus5_url?: string;
  bonus5_label?: string;
  bonus5_thumbnail?: string;
  bonus5_color?: string;
  bonus6_url?: string;
  bonus6_label?: string;
  bonus6_thumbnail?: string;
  bonus6_color?: string;
  bonus7_url?: string;
  bonus7_label?: string;
  bonus7_thumbnail?: string;
  bonus7_color?: string;
  bonus8_url?: string;
  bonus8_label?: string;
  bonus8_thumbnail?: string;
  bonus8_color?: string;
  bonus9_url?: string;
  bonus9_label?: string;
  bonus9_thumbnail?: string;
  bonus9_color?: string;
  bonus10_url?: string;
  bonus10_label?: string;
  bonus10_thumbnail?: string;
  bonus10_color?: string;
  bonus11_url?: string;
  bonus11_label?: string;
  bonus11_thumbnail?: string;
  bonus11_color?: string;
  bonus12_url?: string;
  bonus12_label?: string;
  bonus12_thumbnail?: string;
  bonus12_color?: string;
  bonus13_url?: string;
  bonus13_label?: string;
  bonus13_thumbnail?: string;
  bonus13_color?: string;
  bonus14_url?: string;
  bonus14_label?: string;
  bonus14_thumbnail?: string;
  bonus14_color?: string;
  bonus15_url?: string;
  bonus15_label?: string;
  bonus15_thumbnail?: string;
  bonus15_color?: string;
  bonus16_url?: string;
  bonus16_label?: string;
  bonus16_thumbnail?: string;
  bonus16_color?: string;
  bonus17_url?: string;
  bonus17_label?: string;
  bonus17_thumbnail?: string;
  bonus17_color?: string;
  bonus18_url?: string;
  bonus18_label?: string;
  bonus18_thumbnail?: string;
  bonus18_color?: string;
  bonus19_url?: string;
  bonus19_label?: string;
  bonus19_thumbnail?: string;
  bonus19_color?: string;
  allow_pdf_download?: boolean;
  mainProductThumbnail?: string;
  viewButtonLabel?: string;
  membersHeaderSize?: "small" | "medium" | "large";
  showAppIcon?: boolean;
  showcaseTextPosition?: "bottom" | "middle" | "top";
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
  // Shop template
  shopRemoveCardBorder?: boolean;
  // Members template
  membersShowCardBorder?: boolean;
  // Flow template
  flowShowCardBorder?: boolean;
  // Video Course
  videoCourseEnabled?: boolean;
  videoModules?: {
    id: string;
    title: string;
    videos: {
      id: string;
      title: string;
      youtubeUrl: string;
    }[];
  }[];
  videoCourseTitle?: string;
  videoCourseDescription?: string;
  videoCourseButtonText?: string;
  videoCourseImage?: string;
  videoCourseBackground?: string;
  // Upload Modules
  uploadModulesEnabled?: boolean;
  uploadModules?: {
    id: string;
    title: string;
    items: string[];
  }[];
}

interface ThemeRendererProps {
  template:
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
  appData: AppData;
  appTheme?: "light" | "dark";
  userPlanLimits?: number;
  onViewPdf?: (url: string, title: string) => void;
  onDownload?: (url: string, filename: string) => void;
  onTemplateChange?: (
    template:
      | "classic"
      | "corporate"
      | "showcase"
      | "modern"
      | "minimal"
      | "exclusive"
      | "units"
      | "flow"
      | "shop"
      | "academy",
  ) => void;
  isPreview?: boolean;
  customTheme?: any; // Allow custom theme overrides
  notificationEnabled?: boolean;
  notificationTitle?: string;
  notificationMessage?: string;
  notificationImage?: string;
  notificationLink?: string;
  notificationButtonText?: string;
  notificationButtonColor?: string;
  notificationIcon?: string;
  appLanguage?: "pt" | "en" | "es"; // Idioma salvo do app (para apps publicados)
}

const ThemeRenderer = ({
  template,
  appData,
  appTheme = "dark",
  userPlanLimits = 8,
  onViewPdf,
  onDownload,
  onTemplateChange,
  isPreview = false,
  customTheme,
  notificationEnabled = false,
  notificationTitle = "",
  notificationMessage = "",
  notificationImage = "",
  notificationLink = "",
  notificationButtonText = "",
  notificationButtonColor = "#f97316",
  notificationIcon = "gift",
  appLanguage,
}: ThemeRendererProps) => {
  const [currentTime, setCurrentTime] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [trainingAutoplay, setTrainingAutoplay] = useState(true);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
  const [isModulesDialogOpen, setIsModulesDialogOpen] = useState(false);
  
  // Se appLanguage foi passado (app publicado), usa ele; 
  // Se não foi passado mas isPreview=false (app publicado sem idioma salvo), usa "pt" por padrão
  // Caso contrário (preview/editor) usa o hook global
  const { t: globalT } = useLanguage();
  const t = useMemo(() => {
    if (appLanguage) {
      return getAppTranslation(appLanguage);
    }
    // Para apps publicados sem idioma salvo, usar português como padrão
    if (!isPreview) {
      return getAppTranslation("pt");
    }
    return globalT;
  }, [appLanguage, globalT, isPreview]);

  // Helper function: returns the value if filled, otherwise empty string (no placeholders)
  const getLabel = useMemo(() => {
    return (value: string | undefined, _placeholderKey?: string): string => {
      // If user filled in a value, show it; otherwise show nothing
      if (value && value.trim() !== "") {
        return value;
      }
      // Always return empty string when field is empty (no placeholders in preview or published)
      return "";
    };
  }, []);

  // Get theme config from preset or use custom theme
  const themeConfig = customTheme || THEME_PRESETS[template];

  // State for expanded/collapsed upload modules in viewer
  const [expandedUploadModules, setExpandedUploadModules] = useState<Record<string, boolean>>({});

  const toggleUploadModule = (moduleId: string) => {
    setExpandedUploadModules(prev => ({ ...prev, [moduleId]: !(prev[moduleId] ?? true) }));
  };

  // Helper: Build all bonuses array
  const allBonuses = useMemo(() => {
    return Array.from({ length: 19 }, (_, i) => {
      const n = i + 1;
      return {
        slotId: `bonus${n}`,
        url: (appData as any)[`bonus${n}_url`],
        label: (appData as any)[`bonus${n}_label`],
        thumbnail: (appData as any)[`bonus${n}_thumbnail`],
        background: (appData as any)[`bonus${n}Background`],
        color: (appData as any)[`bonus${n}_color`],
        bonusIndex: n,
      };
    });
  }, [appData]);

  // Helper: Check if upload modules are active and have modules
  const hasUploadModules = appData.uploadModulesEnabled && appData.uploadModules && appData.uploadModules.length > 0;

  useEffect(() => {
    if (isPreview) {
      const updateTime = () => {
        const now = new Date();
        const brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000); // GMT-3
        const hours = brasiliaTime.getUTCHours().toString().padStart(2, "0");
        const minutes = brasiliaTime.getUTCMinutes().toString().padStart(2, "0");
        setCurrentTime(`${hours}:${minutes}`);
      };

      updateTime();
      const interval = setInterval(updateTime, 60000); // Atualiza a cada minuto
      return () => clearInterval(interval);
    } else {
      setCurrentTime("9:41");
    }
  }, [isPreview]);

  // Auto-play para o carrossel do Academy template
  useEffect(() => {
    if (template !== "academy" || !trainingAutoplay) return;

    const featuredProductsCount = [
      (appData as any).training1Cover,
      (appData as any).training2Cover,
      (appData as any).training3Cover,
      (appData as any).training4Cover,
    ].filter(Boolean).length;

    if (featuredProductsCount <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProductsCount);
    }, 4000);

    return () => clearInterval(timer);
  }, [
    template,
    trainingAutoplay,
    (appData as any).training1Cover,
    (appData as any).training2Cover,
    (appData as any).training3Cover,
    (appData as any).training4Cover,
  ]);

  // Scroll suave quando currentSlide mudar
  useEffect(() => {
    if (template === "academy" && carouselRef.current) {
      const container = carouselRef.current;
      const slideWidth = container.scrollWidth / container.children[0].children.length;
      container.scrollTo({
        left: currentSlide * slideWidth,
        behavior: "smooth",
      });
    }
  }, [currentSlide, template]);

  // Reset slide quando mudar de template
  useEffect(() => {
    setCurrentSlide(0);
  }, [template]);

  const handleViewPdf = (url: string, title: string) => {
    if (onViewPdf) {
      onViewPdf(url, title);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    if (onDownload) {
      onDownload(url, filename);
    }
  };

  // Reusable bonus card renderer for classic template
  const renderClassicBonusCard = (bonus: { url?: string; label?: string; thumbnail?: string; bonusIndex: number }, index: number) => (
    <div
      key={index}
      className="rounded-lg p-3 flex items-center justify-between"
      style={{ backgroundColor: appTheme === "light" ? "#f9fafb" : "rgba(31, 41, 55, 0.5)" }}
    >
      <div className="flex items-center space-x-2 min-w-0 overflow-hidden mr-2">
        <div
          className="w-6 h-6 rounded flex items-center justify-center overflow-hidden relative shrink-0"
          style={{ backgroundColor: `${appData.cor}20` }}
        >
          {bonus.thumbnail ? (
            <img src={bonus.thumbnail} alt={`${bonus.label} thumbnail`} className="w-full h-full object-cover" />
          ) : isPreview ? (
            <ImageIcon className="w-3 h-3 opacity-30" style={{ color: "#A3C1FB" }} />
          ) : null}
        </div>
        <span className="text-sm break-words flex-1" style={{ color: appTheme === "light" ? "#374151" : "#d1d5db" }}>
          {getLabel(bonus.label, `phonemockup.default.bonus${bonus.bonusIndex}Label`)}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          style={{ 
            backgroundColor: appTheme === "light" ? "#e5e7eb" : "rgba(255, 255, 255, 0.2)", 
            color: appTheme === "light" ? "#374151" : "white" 
          }}
          className="hover:opacity-80 transition-all"
          onClick={() => handleViewPdf(bonus.url!, bonus.label || '')}
        >
          <Eye className="w-3 h-3 mr-0" />
          <span>{appData.viewButtonLabel || t("phone.view")}</span>
        </Button>
        {appData.allow_pdf_download && (
          <Button
            size="sm"
            variant="ghost"
            style={{ 
              backgroundColor: appTheme === "light" ? "#e5e7eb" : "rgba(255, 255, 255, 0.2)", 
              color: appTheme === "light" ? "#374151" : "white" 
            }}
            className="hover:opacity-80 transition-all px-2"
            onClick={() => handleDownload(bonus.url!, `${bonus.label || 'bonus'}.pdf`)}
          >
            <Download className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );

  // Render upload modules with collapsible sections
  const renderUploadModules = (
    bonuses: { slotId: string; url?: string; label?: string; thumbnail?: string; background?: string; color?: string; bonusIndex: number }[],
    renderCard: (bonus: any, index: number) => React.ReactNode
  ) => {
    if (!hasUploadModules) return null;

    return (
      <div className="space-y-3">
        {appData.uploadModules!.map((module) => {
          const moduleBonuses = module.items
            .map(slotId => {
              if (slotId === 'main') return null; // main product rendered separately
              return bonuses.find(b => b.slotId === slotId);
            })
            .filter(Boolean)
            .filter(b => b!.url);

          if (moduleBonuses.length === 0) return null;

          const isExpanded = expandedUploadModules[module.id] ?? true;

          return (
            <div key={module.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: appTheme === "light" ? "#ffffff" : "#1f2937" }}>
              <button
                onClick={() => toggleUploadModule(module.id)}
                className="w-full flex items-center justify-between p-3 transition-colors"
                style={{ backgroundColor: appTheme === "light" ? "#f3f4f6" : "rgba(55, 65, 81, 0.5)" }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${appData.cor}30` }}
                  >
                    <svg className="w-3.5 h-3.5" style={{ color: appData.cor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium" style={{ color: appTheme === "light" ? "#111827" : "#ffffff" }}>
                    {module.title}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${appData.cor}20`, color: appData.cor }}>
                    {moduleBonuses.length}
                  </span>
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  style={{ color: appTheme === "light" ? "#6b7280" : "#9ca3af" }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isExpanded && (
                <div className="p-2 space-y-1">
                  {moduleBonuses.map((bonus, idx) => renderCard(bonus, idx))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderStatusBar = () => {
    // Só mostra a barra de status na pré-visualização
    if (!isPreview) return null;

    return (
      <div
        className="flex justify-between items-center px-4 py-2 text-xs"
        style={{ color: appTheme === "light" ? "#111827" : "#ffffff" }}
      >
        <span>{currentTime}</span>
        <div className="flex space-x-1">
          <div
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: appTheme === "light" ? "#111827" : "#ffffff" }}
          ></div>
          <div
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: appTheme === "light" ? "#111827" : "#ffffff" }}
          ></div>
          <div
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: appTheme === "light" ? "#111827" : "#ffffff" }}
          ></div>
        </div>
        <span>100%</span>
      </div>
    );
  };

  // Função para renderizar o ícone selecionado
  const renderNotificationIcon = () => {
    const iconProps = { className: "w-5 h-5 text-orange-400" };

    switch (notificationIcon) {
      case "bell":
        return <Bell {...iconProps} />;
      case "star":
        return <Star {...iconProps} />;
      case "sparkles":
        return <Sparkles {...iconProps} />;
      case "zap":
        return <Zap {...iconProps} />;
      case "trophy":
        return <Trophy {...iconProps} />;
      case "heart":
        return <Heart {...iconProps} />;
      case "award":
        return <Award {...iconProps} />;
      case "gift":
      default:
        return <Gift {...iconProps} />;
    }
  };

  const renderNotificationDialog = () => (
    <Dialog open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
      <DialogContent className="max-w-sm bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{notificationTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Imagem (se existir) */}
          {notificationImage && (
            <div className="w-full rounded-lg overflow-hidden">
              <img src={notificationImage} alt="Notificação" className="w-full h-auto object-contain max-h-64" />
            </div>
          )}

          {/* Mensagem */}
          <p className="text-gray-300 text-sm leading-relaxed">{notificationMessage}</p>

          {/* Botão de ação (se existir link) */}
          {notificationLink && (
            <a
              href={notificationLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: notificationButtonColor }}
              className="block w-full py-2 px-4 text-white text-center rounded-lg font-medium transition-all hover:opacity-90"
            >
              {notificationButtonText || t("notifications.default_button_text")}
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderClassicTemplate = () => (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: appTheme === "light" ? "#f3f4f6" : themeConfig.colors.background,
      }}
    >
      {renderStatusBar()}

      {/* Notificação como ícone de presente */}
      {notificationEnabled && (
        <div className="px-4 py-3 bg-orange-500/10 border-b border-orange-500/20 flex items-center justify-center relative z-10">
          <button
            type="button"
            onClick={() => setIsNotificationOpen(true)}
            className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="relative">
              {renderNotificationIcon()}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                1
              </span>
            </div>
            <span className="text-orange-300 text-sm font-medium">{t("notifications.new_notification")}</span>
          </button>
        </div>
      )}

      {/* App Cover/Header */}
      <div className="px-4 pt-4">
        <div
          className="h-32 relative rounded-2xl overflow-hidden"
          style={{
            background: appData.capa_url
              ? `url(${appData.capa_url}) center/cover`
              : `linear-gradient(135deg, ${appData.cor}40, ${appData.cor}20)`,
          }}
        >
          {isPreview && !appData.capa_url && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="w-16 h-16 opacity-20" style={{ color: "#A3C1FB" }} />
            </div>
          )}
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center space-x-3">
            {appData.showAppIcon !== false && (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden border-2 border-black shrink-0"
                style={{ backgroundColor: appData.cor }}
              >
                {appData.icone_url ? (
                  <img src={appData.icone_url} alt="App Icon" className="w-full h-full object-cover" />
                ) : isPreview ? (
                  <ImageIcon className="w-6 h-6 opacity-50" style={{ color: "#A3C1FB" }} />
                ) : null}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg break-words leading-tight" style={{ color: appData.nomeColor || (appTheme === "light" ? "#111827" : "#ffffff") }}>
                {appData.nome}
              </h3>
              {appData.descricao && (
                <ExpandableDescription
                  text={appData.descricao}
                  color={appData.descricaoColor || (appTheme === "light" ? "#4b5563" : "rgba(255, 255, 255, 0.8)")}
                  maxLength={50}
                  title={appData.nome}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 space-y-4">
        {/* Video Course Block - Duplicated Main Product Structure */}
        {appData.videoCourseEnabled && (
          <div className="rounded-xl p-4" style={{ backgroundColor: appTheme === "light" ? "#ffffff" : "#1f2937" }}>
            <div className="flex items-center space-x-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden relative shrink-0"
                style={{ backgroundColor: `${appData.cor}20` }}
              >
                {appData.videoCourseImage ? (
                  <img
                    src={appData.videoCourseImage}
                    alt="Course thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : isPreview ? (
                  <ImageIcon className="w-5 h-5 opacity-30" style={{ color: "#A3C1FB" }} />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                {appData.videoCourseTitle && (
                  <h4 className="font-medium text-sm break-words" style={{ color: appTheme === "light" ? "#111827" : "#ffffff" }}>
                    {appData.videoCourseTitle}
                  </h4>
                )}
                {appData.videoCourseDescription && (
                  <ExpandableDescription
                    text={appData.videoCourseDescription}
                    color={appTheme === "light" ? "#6b7280" : "#9ca3af"}
                    maxLength={50}
                    className="text-xs"
                    title={appData.videoCourseTitle || ""}
                  />
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                className="flex-1 hover:opacity-90 transition-all"
                style={{ backgroundColor: appData.cor, color: "white" }}
                onClick={() => setIsModulesDialogOpen(true)}
              >
                <Play className="w-4 h-4 mr-2" />
                <span>{appData.videoCourseButtonText || 'Assistir Aulas'}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Main Product */}
        {appData.produto_principal_url && (
          <div className="rounded-xl p-4" style={{ backgroundColor: appTheme === "light" ? "#ffffff" : "#1f2937" }}>
            <div className="flex items-center space-x-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden relative shrink-0"
                style={{ backgroundColor: `${appData.cor}20` }}
              >
                {appData.mainProductThumbnail ? (
                  <img
                    src={appData.mainProductThumbnail}
                    alt="Product thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : isPreview ? (
                  <ImageIcon className="w-5 h-5 opacity-30" style={{ color: "#A3C1FB" }} />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm break-words" style={{ color: appTheme === "light" ? "#111827" : "#ffffff" }}>
                  {getLabel(appData.main_product_label, "phonemockup.default.mainProductLabel")}
                </h4>
                {appData.main_product_description && (
                  <ExpandableDescription
                    text={appData.main_product_description}
                    color={appTheme === "light" ? "#6b7280" : "#9ca3af"}
                    maxLength={50}
                    className="text-xs"
                    title={appData.main_product_label || ""}
                  />
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                className="flex-1 hover:opacity-90 transition-all"
                style={{ backgroundColor: appData.cor, color: "white" }}
                onClick={() => handleViewPdf(appData.produto_principal_url!, appData.main_product_label || "")}
              >
                <Eye className="w-4 h-4 mr-0" />
                <span>{appData.viewButtonLabel || t("phone.view.pdf")}</span>
              </Button>
              {appData.allow_pdf_download && (
                <Button
                  className="hover:opacity-90 transition-all"
                  style={{ backgroundColor: appData.cor, color: "white" }}
                  onClick={() => handleDownload(appData.produto_principal_url!, `${appData.main_product_label || 'produto'}.pdf`)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Bonuses */}
        {userPlanLimits > 1 && (
          <div className="space-y-2">
            {!hasUploadModules && appData.bonuses_label && (
              <h5 className="font-medium text-sm" style={{ color: appTheme === "light" ? "#111827" : "#ffffff" }}>
                {appData.bonuses_label}
              </h5>
            )}
            {hasUploadModules ? (
              renderUploadModules(allBonuses, renderClassicBonusCard)
            ) : (
              allBonuses
                .filter((bonus, index) => index < userPlanLimits - 1 && bonus.url)
                .map((bonus, index) => renderClassicBonusCard(bonus, index))
            )}
          </div>
        )}
      </div>

      {/* Dialog de Notificação */}
      {renderNotificationDialog()}
    </div>
  );

  const renderCorporateTemplate = () => (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: appTheme === "light" ? "#f3f4f6" : themeConfig.colors.background,
      }}
    >
      {renderStatusBar()}

      {/* Notificação como ícone de presente */}
      {notificationEnabled && (
        <div className="px-4 py-3 bg-orange-500/10 border-b border-orange-500/20 flex items-center justify-center relative z-10">
          <button
            type="button"
            onClick={() => setIsNotificationOpen(true)}
            className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="relative">
              {renderNotificationIcon()}
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                1
              </span>
            </div>
            <span className="text-orange-300 text-sm font-medium">{t("notifications.new_notification")}</span>
          </button>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div
        className="border-b px-4 py-3"
        style={{
          backgroundColor: appTheme === "light" ? "#ffffff" : "#1f2937",
          borderColor: appTheme === "light" ? "#e5e7eb" : "#374151",
        }}
      >
        <div className="flex items-center space-x-3">
          {appData.showAppIcon !== false && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0"
              style={{ backgroundColor: appData.cor }}
            >
              {appData.icone_url ? (
                <img src={appData.icone_url} alt="App Icon" className="w-full h-full object-cover" />
              ) : isPreview ? (
                <ImageIcon className="w-4 h-4" style={{ color: "#A3C1FB" }} />
              ) : null}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm break-words leading-tight" style={{ color: appData.nomeColor || (appTheme === "light" ? "#111827" : "#ffffff") }}>
              {appData.nome}
            </h3>
            {appData.descricao && (
              <ExpandableDescription
                text={appData.descricao}
                color={appData.descricaoColor || (appTheme === "light" ? "#6b7280" : "#9ca3af")}
                maxLength={50}
                className="text-xs"
                title={appData.nome}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div
        className="flex-1 p-6 max-w-4xl mx-auto"
        style={{ backgroundColor: appTheme === "light" ? "#e5e7eb" : "#1f2937" }}
      >
        {/* Video Course Block */}
        {appData.videoCourseEnabled && (
          <div
            className="border rounded-lg p-6 mb-6 shadow-lg relative overflow-hidden"
            style={{
              backgroundColor: appTheme === "light" ? "#ffffff" : "#111827",
              borderColor: appTheme === "light" ? "#d1d5db" : "#374151",
            }}
          >
            {appData.videoCourseBackground ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${appData.videoCourseBackground})`,
                  opacity: appTheme === "light" ? 0.35 : 0.15,
                }}
              />
            ) : isPreview ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-20 h-20" style={{ color: "#A3C1FB", opacity: 0.1 }} />
              </div>
            ) : null}
            
            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden shadow-lg"
                style={{ backgroundColor: appData.cor }}
              >
                {appData.videoCourseImage ? (
                  <img src={appData.videoCourseImage} alt="Course" className="w-full h-full object-cover" />
                ) : isPreview ? (
                  <ImageIcon className="w-10 h-10 opacity-50" style={{ color: "#A3C1FB" }} />
                ) : null}
              </div>
              <div className="space-y-1">
                {appData.videoCourseTitle && (
                  <h4 className="font-bold text-lg" style={{ color: appTheme === "light" ? "#111827" : "#ffffff" }}>
                    {appData.videoCourseTitle}
                  </h4>
                )}
                {appData.videoCourseDescription && (
                  <ExpandableDescription
                    text={appData.videoCourseDescription}
                    color={appTheme === "light" ? "#6b7280" : "#9ca3af"}
                    maxLength={50}
                    title={appData.videoCourseTitle || ""}
                  />
                )}
              </div>
              <button
                onClick={() => setIsModulesDialogOpen(true)}
                className="px-6 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 shadow-md"
                style={{ backgroundColor: appData.cor }}
              >
                {appData.videoCourseButtonText || 'Assistir Aulas'}
              </button>
            </div>
          </div>
        )}

        {/* Main Product Card - Centralized and Enhanced */}
        {appData.produto_principal_url && (
          <div
            className="border rounded-lg p-6 mb-6 shadow-lg relative overflow-hidden"
            style={{
              backgroundColor: appTheme === "light" ? "#ffffff" : "#111827",
              borderColor: appTheme === "light" ? "#d1d5db" : "#374151",
            }}
          >
            {appData.mainProductBackground ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${appData.mainProductBackground})`,
                  opacity: appTheme === "light" ? 0.35 : 0.15,
                }}
              />
            ) : isPreview ? (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: appTheme === "light" ? "#f3f4f6" : "#111827" }}
              >
                <ImageIcon className="w-16 h-16" style={{ color: appTheme === "light" ? "#d1d5db" : "#374151" }} />
              </div>
            ) : null}
            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden shadow-lg"
                style={{ backgroundColor: appData.cor }}
              >
                {appData.mainProductThumbnail ? (
                  <img
                    src={appData.mainProductThumbnail}
                    alt="Product thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : isPreview ? (
                  <ImageIcon className="w-10 h-10 opacity-50" style={{ color: "#A3C1FB" }} />
                ) : null}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg" style={{ color: appTheme === "light" ? "#111827" : "#ffffff" }}>
                  {getLabel(appData.main_product_label, "phonemockup.default.mainProductLabel")}
                </h4>
                {appData.main_product_description && (
                  <ExpandableDescription
                    text={appData.main_product_description}
                    color={appTheme === "light" ? "#6b7280" : "#9ca3af"}
                    maxLength={50}
                    title={appData.main_product_label || ""}
                  />
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  className="px-6 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 shadow-md"
                  style={{ backgroundColor: appData.cor }}
                  onClick={() => handleViewPdf(appData.produto_principal_url!, appData.main_product_label || "")}
                >
                  {appData.viewButtonLabel || t("phone.view.pdf")}
                </button>
                {appData.allow_pdf_download && (
                  <button
                    className="px-3 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 shadow-md"
                    style={{ backgroundColor: appData.cor }}
                    onClick={() => handleDownload(appData.produto_principal_url!, `${appData.main_product_label || 'produto'}.pdf`)}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bonus Grid - Symmetrical Layout */}
        {userPlanLimits > 1 && (
          <div className="space-y-4">
            <div className="text-center">
              {appData.bonuses_label && (
                <h5 className="text-gray-200 font-bold text-lg mb-2">{appData.bonuses_label}</h5>
              )}
              <div className="w-16 h-0.5 bg-gray-600 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { url: appData.bonus1_url, label: appData.bonus1_label, thumbnail: appData.bonus1_thumbnail, background: appData.bonus1Background, bonusIndex: 1 },
                { url: appData.bonus2_url, label: appData.bonus2_label, thumbnail: appData.bonus2_thumbnail, background: appData.bonus2Background, bonusIndex: 2 },
                { url: appData.bonus3_url, label: appData.bonus3_label, thumbnail: appData.bonus3_thumbnail, background: appData.bonus3Background, bonusIndex: 3 },
                { url: appData.bonus4_url, label: appData.bonus4_label, thumbnail: appData.bonus4_thumbnail, background: appData.bonus4Background, bonusIndex: 4 },
                { url: appData.bonus5_url, label: appData.bonus5_label, thumbnail: appData.bonus5_thumbnail, background: appData.bonus5Background, bonusIndex: 5 },
                { url: appData.bonus6_url, label: appData.bonus6_label, thumbnail: appData.bonus6_thumbnail, background: appData.bonus6Background, bonusIndex: 6 },
                { url: appData.bonus7_url, label: appData.bonus7_label, thumbnail: appData.bonus7_thumbnail, background: appData.bonus7Background, bonusIndex: 7 },
                { url: appData.bonus8_url, label: appData.bonus8_label, thumbnail: appData.bonus8_thumbnail, background: appData.bonus8Background, bonusIndex: 8 },
                { url: appData.bonus9_url, label: appData.bonus9_label, thumbnail: appData.bonus9_thumbnail, background: appData.bonus9Background, bonusIndex: 9 },
                { url: appData.bonus10_url, label: appData.bonus10_label, thumbnail: appData.bonus10_thumbnail, background: (appData as any).bonus10Background, bonusIndex: 10 },
                { url: appData.bonus11_url, label: appData.bonus11_label, thumbnail: appData.bonus11_thumbnail, background: (appData as any).bonus11Background, bonusIndex: 11 },
                { url: appData.bonus12_url, label: appData.bonus12_label, thumbnail: appData.bonus12_thumbnail, background: (appData as any).bonus12Background, bonusIndex: 12 },
                { url: appData.bonus13_url, label: appData.bonus13_label, thumbnail: appData.bonus13_thumbnail, background: (appData as any).bonus13Background, bonusIndex: 13 },
                { url: appData.bonus14_url, label: appData.bonus14_label, thumbnail: appData.bonus14_thumbnail, background: (appData as any).bonus14Background, bonusIndex: 14 },
                { url: appData.bonus15_url, label: appData.bonus15_label, thumbnail: appData.bonus15_thumbnail, background: (appData as any).bonus15Background, bonusIndex: 15 },
                { url: appData.bonus16_url, label: appData.bonus16_label, thumbnail: appData.bonus16_thumbnail, background: (appData as any).bonus16Background, bonusIndex: 16 },
                { url: appData.bonus17_url, label: appData.bonus17_label, thumbnail: appData.bonus17_thumbnail, background: (appData as any).bonus17Background, bonusIndex: 17 },
                { url: appData.bonus18_url, label: appData.bonus18_label, thumbnail: appData.bonus18_thumbnail, background: (appData as any).bonus18Background, bonusIndex: 18 },
                { url: appData.bonus19_url, label: appData.bonus19_label, thumbnail: appData.bonus19_thumbnail, background: (appData as any).bonus19Background, bonusIndex: 19 },
              ]
                .filter((bonus, index) => index < userPlanLimits - 1 && bonus.url)
                .map((bonus, index) => (
                    <div key={index} className="bg-gray-900 border border-gray-600/50 rounded-lg p-4 hover:border-gray-500/50 transition-all shadow-md relative overflow-hidden">
                      {bonus.background ? (
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bonus.background})`, opacity: appTheme === "light" ? 0.35 : 0.15 }} />
                      ) : isPreview ? (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: appTheme === "light" ? "#f3f4f6" : "#111827" }}>
                          <ImageIcon className="w-12 h-12" style={{ color: appTheme === "light" ? "#d1d5db" : "#374151" }} />
                        </div>
                      ) : null}
                      <div className="flex flex-col items-center text-center space-y-3 relative z-10">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden shadow-sm" style={{ backgroundColor: `${appData.cor}20` }}>
                          {bonus.thumbnail ? (
                            <img src={bonus.thumbnail} alt={`${bonus.label} thumbnail`} className="w-full h-full object-cover" />
                          ) : isPreview ? (
                            <ImageIcon className="w-6 h-6 opacity-30" style={{ color: "#A3C1FB" }} />
                          ) : null}
                        </div>
                        <div>
                          <span className="text-gray-200 text-sm font-medium block">{getLabel(bonus.label, `phonemockup.default.bonus${bonus.bonusIndex}Label`)}</span>
                        </div>
                        <div className="flex space-x-2 w-full justify-center">
                          <button className="text-sm px-6 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90 shadow-md" style={{ backgroundColor: appData.cor }} onClick={() => handleViewPdf(bonus.url!, bonus.label)}>
                            {appData.viewButtonLabel || t("phone.view")}
                          </button>
                          {appData.allow_pdf_download && (
                            <button className="text-sm px-3 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90 shadow-md" style={{ backgroundColor: appData.cor }} onClick={() => handleDownload(bonus.url!, `${bonus.label || 'bonus'}.pdf`)}>
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        )}
      </div>

      {/* Dialog de Notificação */}
      {renderNotificationDialog()}
    </div>
  );

  const renderShowcaseTemplate = () => (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: appTheme === "light" ? "#ffffff" : themeConfig.colors.background,
      }}
    >
      {/* Notificação como ícone de presente */}
      {notificationEnabled && (
        <div className="px-4 py-3 bg-orange-500/10 border-b border-orange-500/20 flex items-center justify-center relative z-10">
          <button
            type="button"
            onClick={() => setIsNotificationOpen(true)}
            className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="relative">
              {renderNotificationIcon()}
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                1
              </span>
            </div>
            <span className="text-orange-300 text-sm font-medium">{t("notifications.new_notification")}</span>
          </button>
        </div>
      )}

      {/* Full Cover Header */}
      <div
        className="h-40 relative"
        style={{
          background: appData.capa_url
            ? `url(${appData.capa_url}) center/cover`
            : `linear-gradient(135deg, ${appData.cor}, ${appData.cor}88)`,
        }}
      >
        {/* Placeholder de imagem de fundo quando não há capa */}
        {isPreview && !appData.capa_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-16 h-16" style={{ color: "#A3C1FB", opacity: 0.3 }} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>

        {/* Status Bar Overlay - só na pré-visualização */}
        {isPreview && (
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-2 text-xs text-white/90">
            <span>{currentTime}</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white/90 rounded-full"></div>
              <div className="w-1 h-1 bg-white/90 rounded-full"></div>
              <div className="w-1 h-1 bg-white/90 rounded-full"></div>
            </div>
            <span>100%</span>
          </div>
        )}

        {/* Centered App Info */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 text-center ${
            appData.showcaseTextPosition === "top"
              ? "top-12"
              : appData.showcaseTextPosition === "middle"
                ? "top-[58%] -translate-y-1/2"
                : "bottom-4"
          }`}
        >
          {appData.showAppIcon !== false && (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl overflow-hidden border-2 border-white/20 mx-auto mb-2"
              style={{ backgroundColor: appData.cor }}
            >
              {appData.icone_url ? (
                <img src={appData.icone_url} alt="App Icon" className="w-full h-full object-cover" />
              ) : isPreview ? (
                <ImageIcon className="w-6 h-6" style={{ color: "#A3C1FB" }} />
              ) : null}
            </div>
          )}
          <h3 className="font-bold text-lg" style={{ color: appData.nomeColor || "#ffffff" }}>
            {appData.nome}
          </h3>
          {appData.descricao && (
            <ExpandableDescription
              text={appData.descricao}
              color={appData.descricaoColor || (appTheme === "light" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.8)")}
              maxLength={50}
              title={appData.nome}
            />
          )}
        </div>
      </div>

      {/* Content Cards */}
      <div
        className="flex-1 p-4 space-y-4"
        style={{
          background:
            appTheme === "light"
              ? "linear-gradient(to bottom, #f3f4f6, #e5e7eb)"
              : "linear-gradient(to bottom, rgba(88, 28, 135, 0.2), #000000)",
        }}
      >
        {/* Video Course Block */}
        {appData.videoCourseEnabled && (
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-6 text-center relative overflow-hidden">
            {appData.videoCourseBackground ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${appData.videoCourseBackground})`,
                  opacity: appTheme === "light" ? 0.35 : 0.15,
                }}
              />
            ) : isPreview ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-20 h-20 text-white/10" />
              </div>
            ) : null}
            
            <div className="relative z-10">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden mx-auto mb-3"
                style={{ backgroundColor: appData.cor }}
              >
                {appData.videoCourseImage ? (
                  <img src={appData.videoCourseImage} alt="Course" className="w-full h-full object-cover" />
                ) : isPreview ? (
                  <ImageIcon className="w-12 h-12 opacity-50" style={{ color: "#A3C1FB" }} />
                ) : null}
              </div>
              {appData.videoCourseTitle && (
                <h4 className="font-bold text-sm mb-1" style={{ color: appTheme === "light" ? "#111827" : "#ffffff" }}>
                  {appData.videoCourseTitle}
                </h4>
              )}
              {appData.videoCourseDescription && (
                <div className="mb-3">
                  <ExpandableDescription
                    text={appData.videoCourseDescription}
                    color={appTheme === "light" ? "#6b7280" : "rgba(255, 255, 255, 0.7)"}
                    maxLength={50}
                    className="text-xs"
                    title={appData.videoCourseTitle || ""}
                  />
                </div>
              )}
              <button
                className="px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${appData.cor}, ${appData.cor}dd)`,
                  boxShadow: `0 4px 15px ${appData.cor}30`,
                }}
                onClick={() => setIsModulesDialogOpen(true)}
              >
                {appData.videoCourseButtonText || 'Assistir Aulas'}
              </button>
            </div>
          </div>
        )}

        {/* Featured Product - Large Visual Card */}
        {appData.produto_principal_url && (
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-6 text-center relative overflow-hidden">
            {/* Background Image */}
            {appData.mainProductBackground ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${appData.mainProductBackground})`,
                  opacity: appTheme === "light" ? 0.35 : 0.15,
                }}
              />
            ) : isPreview ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-20 h-20 text-white/10" />
              </div>
            ) : null}

            <div className="relative z-10">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden mx-auto mb-3"
                style={{ backgroundColor: appData.cor }}
              >
                {appData.mainProductThumbnail ? (
                  <img
                    src={appData.mainProductThumbnail}
                    alt="Product thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : isPreview ? (
                  <ImageIcon className="w-12 h-12 opacity-50" style={{ color: "#A3C1FB" }} />
                ) : null}
              </div>
              <h4 className="font-bold text-sm mb-1" style={{ color: appTheme === "light" ? "#111827" : "#ffffff" }}>
                {getLabel(appData.main_product_label, "phonemockup.default.mainProductLabel")}
              </h4>
              {appData.main_product_description && (
                <div className="mb-3">
                  <ExpandableDescription
                    text={appData.main_product_description}
                    color={appTheme === "light" ? "#6b7280" : "rgba(255, 255, 255, 0.7)"}
                    maxLength={50}
                    className="text-xs"
                    title={appData.main_product_label || ""}
                  />
                </div>
              )}
              <div className="flex space-x-2 justify-center">
                <button
                  className="px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${appData.cor}, ${appData.cor}dd)`,
                    boxShadow: `0 4px 15px ${appData.cor}30`,
                  }}
                  onClick={() => handleViewPdf(appData.produto_principal_url!, appData.main_product_label || "")}
                >
                  {appData.viewButtonLabel || t("phone.view.pdf")}
                </button>
                {appData.allow_pdf_download && (
                  <button
                    className="px-3 py-2 rounded-xl text-white text-sm font-bold shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${appData.cor}, ${appData.cor}dd)`,
                      boxShadow: `0 4px 15px ${appData.cor}30`,
                    }}
                    onClick={() => handleDownload(appData.produto_principal_url!, `${appData.main_product_label || 'produto'}.pdf`)}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bonus Showcase */}
        {userPlanLimits > 1 && (
          <div className="space-y-3">
            {appData.bonuses_label && (
              <h5
                className="font-bold text-sm text-center"
                style={{ color: appTheme === "light" ? "#111827" : "#ffffff" }}
              >
                {getLabel(appData.bonuses_label, "phonemockup.default.bonusesLabel")}
              </h5>
            )}
            {[
              {
                url: appData.bonus1_url,
                label: appData.bonus1_label,
                thumbnail: appData.bonus1_thumbnail,
                background: appData.bonus1Background,
              },
              {
                url: appData.bonus2_url,
                label: appData.bonus2_label,
                thumbnail: appData.bonus2_thumbnail,
                background: appData.bonus2Background,
              },
              {
                url: appData.bonus3_url,
                label: appData.bonus3_label,
                thumbnail: appData.bonus3_thumbnail,
                background: appData.bonus3Background,
              },
              {
                url: appData.bonus4_url,
                label: appData.bonus4_label,
                thumbnail: appData.bonus4_thumbnail,
                background: appData.bonus4Background,
              },
              {
                url: appData.bonus5_url,
                label: appData.bonus5_label,
                thumbnail: appData.bonus5_thumbnail,
                background: appData.bonus5Background,
              },
              {
                url: appData.bonus6_url,
                label: appData.bonus6_label,
                thumbnail: appData.bonus6_thumbnail,
                background: appData.bonus6Background,
              },
              {
                url: appData.bonus7_url,
                label: appData.bonus7_label,
                thumbnail: appData.bonus7_thumbnail,
                background: appData.bonus7Background,
              },
              {
                url: appData.bonus8_url,
                label: appData.bonus8_label,
                thumbnail: appData.bonus8_thumbnail,
                background: appData.bonus8Background,
              },
              {
                url: appData.bonus9_url,
                label: appData.bonus9_label,
                thumbnail: appData.bonus9_thumbnail,
                background: appData.bonus9Background,
              },
              {
                url: appData.bonus10_url,
                label: appData.bonus10_label,
                thumbnail: appData.bonus10_thumbnail,
                background: (appData as any).bonus10Background,
              },
              {
                url: appData.bonus11_url,
                label: appData.bonus11_label,
                thumbnail: appData.bonus11_thumbnail,
                background: (appData as any).bonus11Background,
              },
              {
                url: appData.bonus12_url,
                label: appData.bonus12_label,
                thumbnail: appData.bonus12_thumbnail,
                background: (appData as any).bonus12Background,
              },
              {
                url: appData.bonus13_url,
                label: appData.bonus13_label,
                thumbnail: appData.bonus13_thumbnail,
                background: (appData as any).bonus13Background,
              },
              {
                url: appData.bonus14_url,
                label: appData.bonus14_label,
                thumbnail: appData.bonus14_thumbnail,
                background: (appData as any).bonus14Background,
              },
              {
                url: appData.bonus15_url,
                label: appData.bonus15_label,
                thumbnail: appData.bonus15_thumbnail,
                background: (appData as any).bonus15Background,
              },
              {
                url: appData.bonus16_url,
                label: appData.bonus16_label,
                thumbnail: appData.bonus16_thumbnail,
                background: (appData as any).bonus16Background,
              },
              {
                url: appData.bonus17_url,
                label: appData.bonus17_label,
                thumbnail: appData.bonus17_thumbnail,
                background: (appData as any).bonus17Background,
              },
              {
                url: appData.bonus18_url,
                label: appData.bonus18_label,
                thumbnail: appData.bonus18_thumbnail,
                background: (appData as any).bonus18Background,
              },
              {
                url: appData.bonus19_url,
                label: appData.bonus19_label,
                thumbnail: appData.bonus19_thumbnail,
                background: (appData as any).bonus19Background,
              },
            ]
              .filter((bonus, index) => {
                return index < userPlanLimits - 1 && bonus.url;
              })
              .map((bonus, index) => {
                const backgroundUrl = bonus.background;

                return (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 border border-purple-400/20 rounded-xl p-3 relative overflow-hidden"
                  >
                    {/* Background Image */}
                    {backgroundUrl ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${backgroundUrl})`,
                          opacity: appTheme === "light" ? 0.35 : 0.15,
                        }}
                      />
                    ) : isPreview ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-white/10" />
                      </div>
                    ) : null}

                    <div className="flex items-center space-x-3 relative z-10">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: `${appData.cor}40` }}
                      >
                        {bonus.thumbnail ? (
                          <img
                            src={bonus.thumbnail}
                            alt={`${bonus.label} thumbnail`}
                            className="w-full h-full object-cover"
                          />
                        ) : isPreview ? (
                          <ImageIcon className="w-8 h-8 opacity-30" style={{ color: "#A3C1FB" }} />
                        ) : null}
                      </div>
                      <div className="flex-1 flex items-center">
                        <span
                          className="font-medium text-sm block"
                          style={{ color: appTheme === "light" ? "#111827" : "#ffffff" }}
                        >
                          {getLabel(bonus.label, `phonemockup.default.bonus${index + 1}Label`)}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="hover:opacity-70 transition-opacity"
                          style={{ color: appData.cor || themeConfig.colors.primary }}
                          onClick={() => handleViewPdf(bonus.url!, bonus.label)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {appData.allow_pdf_download && (
                          <button
                            className="hover:opacity-70 transition-opacity"
                            style={{ color: appData.cor || themeConfig.colors.primary }}
                            onClick={() => handleDownload(bonus.url!, `${bonus.label || 'bonus'}.pdf`)}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Dialog de Notificação */}
      {renderNotificationDialog()}
    </div>
  );

  const renderModernTemplate = () => (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: appTheme === "light" ? "#ffffff" : themeConfig.colors.background,
      }}
    >
      {renderStatusBar()}

      {/* Notificação como ícone de presente */}
      {notificationEnabled && (
        <div className="px-4 py-3 bg-orange-500/10 border-b border-orange-500/20 flex items-center justify-center relative z-10">
          <button
            type="button"
            onClick={() => setIsNotificationOpen(true)}
            className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="relative">
              {renderNotificationIcon()}
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                1
              </span>
            </div>
            <span className="text-orange-300 text-sm font-medium">{t("notifications.new_notification")}</span>
          </button>
        </div>
      )}

      {/* Minimalist header with cover */}
      <div
        className="relative px-6 py-8 text-center border-b overflow-hidden"
        style={{ borderColor: appTheme === "light" ? "#e5e7eb" : "#1f2937" }}
      >
        {/* Background cover image */}
        {appData.capa_url ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${appData.capa_url})` }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  appTheme === "light"
                    ? "linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.85))"
                    : "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7))",
              }}
            />
          </>
        ) : isPreview ? (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <ImageIcon className="w-20 h-20" style={{ color: "#A3C1FB" }} />
          </div>
        ) : null}

        {/* Content */}
        <div className="relative z-10">
          {appData.showAppIcon !== false && (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: appData.cor }}
            >
              {appData.icone_url ? (
                <img src={appData.icone_url} alt="App Icon" className="w-full h-full object-cover rounded-2xl" />
              ) : isPreview ? (
                <ImageIcon className="w-10 h-10" style={{ color: "#A3C1FB" }} />
              ) : null}
            </div>
          )}
          <h1 className="text-2xl font-light mb-2" style={{ color: appData.nomeColor || (appTheme === "light" ? "#111827" : "#ffffff") }}>
            {appData.nome}
          </h1>
          {appData.descricao && (
            <ExpandableDescription
              text={appData.descricao}
              color={appData.descricaoColor || (appTheme === "light" ? "#6b7280" : "#e5e7eb")}
              maxLength={50}
              title={appData.nome}
            />
          )}
        </div>
      </div>

      <div className="px-4 py-8 space-y-4">
        {/* Video Course Block */}
        {appData.videoCourseEnabled && (
          <div
            key="modern-video-course"
            className="backdrop-blur-sm border rounded-2xl overflow-hidden hover:opacity-90"
            style={{
              backgroundColor: appTheme === "light" ? "rgba(243, 244, 246, 0.5)" : "rgba(17, 24, 39, 0.5)",
              borderColor: appTheme === "light" ? "#e5e7eb" : "#1f2937",
              transition: "opacity 0.3s",
            }}
          >
            <div className="flex items-center p-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mr-3"
                style={{ backgroundColor: `${appData.cor}20` }}
              >
                {appData.videoCourseImage ? (
                  <img
                    src={appData.videoCourseImage}
                    alt="Course thumbnail"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : isPreview ? (
                  <ImageIcon className="w-6 h-6 opacity-50" style={{ color: "#A3C1FB" }} />
                ) : null}
              </div>
              <div className="flex-1 min-w-0 mr-2">
                {appData.videoCourseTitle && (
                  <h3
                    className="font-medium text-sm mb-0.5 break-words"
                    style={{ color: appTheme === "light" ? "#111827" : "#ffffff" }}
                  >
                    {appData.videoCourseTitle}
                  </h3>
                )}
                {appData.videoCourseDescription && (
                  <ExpandableDescription
                    text={appData.videoCourseDescription}
                    color={appTheme === "light" ? "#6b7280" : "rgba(255,255,255,0.6)"}
                    maxLength={50}
                    className="text-xs"
                    title={appData.videoCourseTitle || ""}
                  />
                )}
              </div>
              <button
                className="p-2 transition-all duration-200 hover:scale-110 flex-shrink-0"
                style={{
                  color: appData.cor,
                }}
                onClick={() => setIsModulesDialogOpen(true)}
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main product with modern card */}
        {appData.produto_principal_url && (
          <div
            key="modern-main-product"
            className="backdrop-blur-sm border rounded-2xl overflow-hidden hover:opacity-90"
            style={{
              backgroundColor: appTheme === "light" ? "rgba(243, 244, 246, 0.5)" : "rgba(17, 24, 39, 0.5)",
              borderColor: appTheme === "light" ? "#e5e7eb" : "#1f2937",
              transition: "opacity 0.3s",
            }}
          >
            <div className="flex items-center p-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mr-3"
                style={{ backgroundColor: `${appData.cor}20` }}
              >
                {appData.mainProductThumbnail ? (
                  <img
                    src={appData.mainProductThumbnail}
                    alt="Product thumbnail"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : isPreview ? (
                  <ImageIcon className="w-6 h-6 opacity-50" style={{ color: "#A3C1FB" }} />
                ) : null}
              </div>
              <div className="flex-1 min-w-0 mr-2">
                <h3
                  className="font-medium text-sm mb-0.5 break-words"
                  style={{ color: appTheme === "light" ? "#111827" : "#ffffff" }}
                >
                  {getLabel(appData.main_product_label, "phonemockup.default.mainProductLabel")}
                </h3>
                {appData.main_product_description && (
                  <ExpandableDescription
                    text={appData.main_product_description}
                    color={appTheme === "light" ? "#6b7280" : "rgba(255,255,255,0.6)"}
                    maxLength={50}
                    className="text-xs"
                    title={appData.main_product_label || ""}
                  />
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="p-2 transition-all duration-200 hover:scale-110 flex-shrink-0"
                  style={{
                    color: appData.cor,
                  }}
                  onClick={() => handleViewPdf(appData.produto_principal_url!, appData.main_product_label || "")}
                >
                  <Eye className="w-5 h-5" />
                </button>
                {appData.allow_pdf_download && (
                  <button
                    className="p-2 transition-all duration-200 hover:scale-110 flex-shrink-0"
                    style={{
                      color: appData.cor,
                    }}
                    onClick={() => handleDownload(appData.produto_principal_url!, `${appData.main_product_label || 'produto'}.pdf`)}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bonuses with modern styling */}
        {userPlanLimits > 1 && (
          <div className="space-y-3">
            {appData.bonuses_label && (
              <h4 className="font-light text-base px-1" style={{ color: appTheme === "light" ? "#111827" : "#ffffff" }}>
                {appData.bonuses_label}
              </h4>
            )}
            <div className="space-y-3">
              {[
                {
                  url: appData.bonus1_url,
                  label: appData.bonus1_label,
                  thumbnail: appData.bonus1_thumbnail,
                },
                {
                  url: appData.bonus2_url,
                  label: appData.bonus2_label,
                  thumbnail: appData.bonus2_thumbnail,
                },
                {
                  url: appData.bonus3_url,
                  label: appData.bonus3_label,
                  thumbnail: appData.bonus3_thumbnail,
                },
                {
                  url: appData.bonus4_url,
                  label: appData.bonus4_label,
                  thumbnail: appData.bonus4_thumbnail,
                },
                {
                  url: appData.bonus5_url,
                  label: appData.bonus5_label,
                  thumbnail: appData.bonus5_thumbnail,
                },
                {
                  url: appData.bonus6_url,
                  label: appData.bonus6_label,
                  thumbnail: appData.bonus6_thumbnail,
                },
                {
                  url: appData.bonus7_url,
                  label: appData.bonus7_label,
                  thumbnail: appData.bonus7_thumbnail,
                },
                {
                  url: appData.bonus8_url,
                  label: appData.bonus8_label,
                  thumbnail: appData.bonus8_thumbnail,
                },
                {
                  url: appData.bonus9_url,
                  label: appData.bonus9_label,
                  thumbnail: appData.bonus9_thumbnail,
                },
                {
                  url: appData.bonus10_url,
                  label: appData.bonus10_label,
                  thumbnail: appData.bonus10_thumbnail,
                },
                {
                  url: appData.bonus11_url,
                  label: appData.bonus11_label,
                  thumbnail: appData.bonus11_thumbnail,
                },
                {
                  url: appData.bonus12_url,
                  label: appData.bonus12_label,
                  thumbnail: appData.bonus12_thumbnail,
                },
                {
                  url: appData.bonus13_url,
                  label: appData.bonus13_label,
                  thumbnail: appData.bonus13_thumbnail,
                },
                {
                  url: appData.bonus14_url,
                  label: appData.bonus14_label,
                  thumbnail: appData.bonus14_thumbnail,
                },
                {
                  url: appData.bonus15_url,
                  label: appData.bonus15_label,
                  thumbnail: appData.bonus15_thumbnail,
                },
                {
                  url: appData.bonus16_url,
                  label: appData.bonus16_label,
                  thumbnail: appData.bonus16_thumbnail,
                },
                {
                  url: appData.bonus17_url,
                  label: appData.bonus17_label,
                  thumbnail: appData.bonus17_thumbnail,
                },
                {
                  url: appData.bonus18_url,
                  label: appData.bonus18_label,
                  thumbnail: appData.bonus18_thumbnail,
                },
                {
                  url: appData.bonus19_url,
                  label: appData.bonus19_label,
                  thumbnail: appData.bonus19_thumbnail,
                },
              ]
                .filter((bonus, index) => {
                  return index < userPlanLimits - 1 && bonus.url;
                })
                .map((bonus, index) => (
                  <div
                    key={`modern-bonus-${index}`}
                    className="border rounded-2xl overflow-hidden hover:opacity-90"
                    style={{
                      backgroundColor: appTheme === "light" ? "rgba(243, 244, 246, 0.3)" : "rgba(17, 24, 39, 0.3)",
                      borderColor: appTheme === "light" ? "#e5e7eb" : "#1f2937",
                      transition: "opacity 0.3s",
                    }}
                  >
                    <div className="flex items-center p-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mr-3"
                        style={{ backgroundColor: `${appData.cor}15` }}
                      >
                        {bonus.thumbnail ? (
                          <img
                            src={bonus.thumbnail}
                            alt={`${bonus.label} thumbnail`}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : isPreview ? (
                          <ImageIcon className="w-5 h-5 opacity-30" style={{ color: "#A3C1FB" }} />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0 mr-2">
                        <span
                          className="font-medium text-sm block break-words"
                          style={{ color: appTheme === "light" ? "#111827" : "#d1d5db" }}
                        >
                          {getLabel(bonus.label, `phonemockup.default.bonus${index + 1}Label`)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-2 transition-all duration-200 hover:scale-110 flex-shrink-0"
                          style={{
                            color: appTheme === "light" ? "#6b7280" : "#9ca3af",
                          }}
                          onClick={() => handleViewPdf(bonus.url!, bonus.label)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {appData.allow_pdf_download && (
                          <button
                            className="p-2 transition-all duration-200 hover:scale-110 flex-shrink-0"
                            style={{
                              color: appTheme === "light" ? "#6b7280" : "#9ca3af",
                            }}
                            onClick={() => handleDownload(bonus.url!, `${bonus.label || 'bonus'}.pdf`)}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Dialog de Notificação */}
      {renderNotificationDialog()}
    </div>
  );

  const renderMinimalTemplate = () => (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: appTheme === "light" ? "#ffffff" : themeConfig.colors.background,
        color: appTheme === "light" ? "#111827" : themeConfig.colors.text,
      }}
    >
      {/* Notificação como ícone de presente */}
      {notificationEnabled && (
        <div className="px-4 py-3 bg-orange-500/10 border-b border-orange-500/20 flex items-center justify-center relative z-10">
          <button
            type="button"
            onClick={() => setIsNotificationOpen(true)}
            className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="relative">
              {renderNotificationIcon()}
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                1
              </span>
            </div>
            <span className="text-orange-500 text-sm font-medium">{t("notifications.new_notification")}</span>
          </button>
        </div>
      )}

      {/* Clean header */}
      <div className="px-8 py-12 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ backgroundColor: appData.cor }}
        >
          {appData.icone_url ? (
            <img src={appData.icone_url} alt="App Icon" className="w-full h-full object-cover rounded-full" />
          ) : isPreview ? (
            <ImageIcon className="w-8 h-8" style={{ color: "#A3C1FB" }} />
          ) : null}
        </div>
        <h1
          className="text-3xl font-light mb-3"
          style={{ color: appData.nomeColor || (appTheme === "light" ? "#111827" : themeConfig.colors.text) }}
        >
          {appData.nome}
        </h1>
        {appData.descricao && (
          <ExpandableDescription
            text={appData.descricao}
            color={appData.descricaoColor || (appTheme === "light" ? "#6b7280" : themeConfig.colors.textSecondary)}
            maxLength={50}
            title={appData.nome}
          />
        )}
      </div>

      <div className="px-8 pb-12 space-y-8">
        {/* Clean main product */}
        {appData.produto_principal_url && (
          <div
            className="border rounded-xl p-6"
            style={{ borderColor: appTheme === "light" ? "#e5e7eb" : `${themeConfig.colors.surface}40` }}
          >
            <h3
              className="font-medium text-xl mb-2"
              style={{ color: appTheme === "light" ? "#111827" : themeConfig.colors.text }}
            >
              {getLabel(appData.main_product_label, "phonemockup.default.mainProductLabel")}
            </h3>
            {appData.main_product_description && (
              <div className="mb-6">
                <ExpandableDescription
                  text={appData.main_product_description}
                  color={appTheme === "light" ? "#6b7280" : themeConfig.colors.textSecondary}
                  maxLength={50}
                  title={appData.main_product_label || ""}
                />
              </div>
            )}
            {!appData.main_product_description && <div className="mb-6" />}
            <div className="flex space-x-3">
              <button
                className="px-8 py-3 rounded-lg text-white font-medium transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: appData.cor }}
                onClick={() => handleViewPdf(appData.produto_principal_url!, appData.main_product_label || "")}
              >
                {appData.viewButtonLabel || t("phone.view.pdf")}
              </button>
              {appData.allow_pdf_download && (
                <button
                  className="px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: appData.cor }}
                  onClick={() => handleDownload(appData.produto_principal_url!, `${appData.main_product_label || 'produto'}.pdf`)}
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Clean bonuses */}
        {userPlanLimits > 1 && (
          <div className="space-y-4">
            {appData.bonuses_label && (
              <h4
                className="font-light text-xl"
                style={{ color: appTheme === "light" ? "#111827" : themeConfig.colors.text }}
              >
                {appData.bonuses_label}
              </h4>
            )}
            <div className="space-y-3">
              {[
                {
                  url: appData.bonus1_url,
                  label: appData.bonus1_label,
                  thumbnail: appData.bonus1_thumbnail,
                },
                {
                  url: appData.bonus2_url,
                  label: appData.bonus2_label,
                  thumbnail: appData.bonus2_thumbnail,
                },
                {
                  url: appData.bonus3_url,
                  label: appData.bonus3_label,
                  thumbnail: appData.bonus3_thumbnail,
                },
                {
                  url: appData.bonus4_url,
                  label: appData.bonus4_label,
                  thumbnail: appData.bonus4_thumbnail,
                },
                {
                  url: appData.bonus5_url,
                  label: appData.bonus5_label,
                  thumbnail: appData.bonus5_thumbnail,
                },
                {
                  url: appData.bonus6_url,
                  label: appData.bonus6_label,
                  thumbnail: appData.bonus6_thumbnail,
                },
                {
                  url: appData.bonus7_url,
                  label: appData.bonus7_label,
                  thumbnail: appData.bonus7_thumbnail,
                },
                {
                  url: appData.bonus8_url,
                  label: appData.bonus8_label,
                  thumbnail: appData.bonus8_thumbnail,
                },
                {
                  url: appData.bonus9_url,
                  label: appData.bonus9_label,
                  thumbnail: appData.bonus9_thumbnail,
                },
                {
                  url: appData.bonus10_url,
                  label: appData.bonus10_label,
                  thumbnail: appData.bonus10_thumbnail,
                },
                {
                  url: appData.bonus11_url,
                  label: appData.bonus11_label,
                  thumbnail: appData.bonus11_thumbnail,
                },
                {
                  url: appData.bonus12_url,
                  label: appData.bonus12_label,
                  thumbnail: appData.bonus12_thumbnail,
                },
                {
                  url: appData.bonus13_url,
                  label: appData.bonus13_label,
                  thumbnail: appData.bonus13_thumbnail,
                },
                {
                  url: appData.bonus14_url,
                  label: appData.bonus14_label,
                  thumbnail: appData.bonus14_thumbnail,
                },
                {
                  url: appData.bonus15_url,
                  label: appData.bonus15_label,
                  thumbnail: appData.bonus15_thumbnail,
                },
                {
                  url: appData.bonus16_url,
                  label: appData.bonus16_label,
                  thumbnail: appData.bonus16_thumbnail,
                },
                {
                  url: appData.bonus17_url,
                  label: appData.bonus17_label,
                  thumbnail: appData.bonus17_thumbnail,
                },
                {
                  url: appData.bonus18_url,
                  label: appData.bonus18_label,
                  thumbnail: appData.bonus18_thumbnail,
                },
                {
                  url: appData.bonus19_url,
                  label: appData.bonus19_label,
                  thumbnail: appData.bonus19_thumbnail,
                },
              ]
                .filter((bonus, index) => {
                  return index < userPlanLimits - 1 && bonus.url;
                })
                .map((bonus, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 flex items-center justify-between"
                    style={{ borderColor: `${themeConfig.colors.surface}40` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${appData.cor}15` }}
                      >
                        {bonus.thumbnail ? (
                          <img
                            src={bonus.thumbnail}
                            alt={`${bonus.label} thumbnail`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : isPreview ? (
                          <ImageIcon className="w-6 h-6 opacity-30" style={{ color: "#A3C1FB" }} />
                        ) : null}
                      </div>
                      <span className="text-sm" style={{ color: appTheme === "light" ? "#111827" : themeConfig.colors.text }}>
                        {getLabel(bonus.label, `phonemockup.default.bonus${index + 1}Label`)}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="p-2 rounded-lg transition-colors hover:bg-white/10"
                        style={{ color: themeConfig.colors.textSecondary }}
                        onClick={() => handleViewPdf(bonus.url!, bonus.label)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {appData.allow_pdf_download && (
                        <button
                          className="p-2 rounded-lg transition-colors hover:bg-white/10"
                          style={{ color: themeConfig.colors.textSecondary }}
                          onClick={() => handleDownload(bonus.url!, `${bonus.label || 'bonus'}.pdf`)}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Dialog de Notificação */}
      {renderNotificationDialog()}
    </div>
  );

  const renderUnitsTemplate = () => {
    const isDarkMode = appTheme === "dark";
    const bgColor = isDarkMode ? "#1a1625" : "#E8E3F0";
    const cardBg = isDarkMode ? "rgba(45, 36, 56, 0.8)" : "rgba(255, 255, 255, 0.9)";
    const cardTextColor = isDarkMode ? "#FFFFFF" : "#1F2937";

    const allProducts = [
      {
        label: getLabel(appData.main_product_label, "phonemockup.default.mainProductLabel"),
        thumbnail: appData.mainProductThumbnail,
        color: appData.cor,
        url: appData.produto_principal_url,
      },
      ...Array.from({ length: userPlanLimits }, (_, i) => {
        const bonusNum = i + 1;
        return {
          label: getLabel((appData as any)[`bonus${bonusNum}_label`], `phonemockup.default.bonus${bonusNum}Label`),
          thumbnail: (appData as any)[`bonus${bonusNum}_thumbnail`],
          color: (appData as any)[`bonus${bonusNum}_color`] || appData.cor,
          url: (appData as any)[`bonus${bonusNum}_url`],
        };
      }).filter((b) => b.url),
    ];

    return (
      <div className="min-h-screen relative" style={{ backgroundColor: bgColor }}>
        <div className="w-full max-w-md mx-auto">
        {/* Notificação */}
        {notificationEnabled && (
          <div
            className="px-4 py-3 border-b flex items-center justify-center relative z-10"
            style={{
              backgroundColor: "rgba(249, 115, 22, 0.1)",
              borderColor: "rgba(249, 115, 22, 0.2)",
            }}
          >
            <button
              type="button"
              onClick={() => setIsNotificationOpen(true)}
              className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="relative">
                {renderNotificationIcon()}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  1
                </span>
              </div>
              <span className="text-orange-300 text-sm font-medium">{t("notifications.new_notification")}</span>
            </button>
          </div>
        )}

        {/* Top Section with rounded bottom-right corner only */}
        <div>
          <div
            className="rounded-br-[32px] overflow-hidden relative"
            style={{
              background: `linear-gradient(135deg, ${appData.cor || "#5B8DEF"} 0%, ${appData.cor ? `${appData.cor}dd` : "#4A7DE0"} 100%)`,
            }}
          >
            {/* App Cover Image as Background */}
            {appData.capa_url ? (
              <>
                <img src={appData.capa_url} alt="App Cover" className="absolute inset-0 w-full h-full object-cover" />
                {/* Gradient overlay on image */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to bottom, transparent 0%, ${appData.cor || "#5B8DEF"}dd 100%)`,
                  }}
                />
              </>
            ) : isPreview ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-24 h-24" style={{ color: "#A3C1FB", opacity: 0.3 }} />
              </div>
            ) : null}

            {/* Title and Description */}
            <div className="px-6 pt-6 pb-8 relative z-10">
              <h1 className="text-2xl font-bold mb-2" style={{ color: appData.nomeColor || "#ffffff" }}>{appData.nome || "MAIN UNITS"}</h1>
              {appData.descricao && (
                <ExpandableDescription
                  text={appData.descricao}
                  color={appData.descricaoColor || "rgba(255, 255, 255, 0.9)"}
                  maxLength={50}
                  title={appData.nome}
                />
              )}
            </div>
          </div>
        </div>

        {/* Units List */}
        <div className="px-4 pt-6 pb-6 space-y-3">
          {/* Video Course Block */}
          {appData.videoCourseEnabled && (
            <button
              onClick={() => setIsModulesDialogOpen(true)}
              className="w-full p-4 rounded-2xl flex items-center justify-between transition-all hover:shadow-lg hover:scale-[1.02]"
              style={{
                backgroundColor: cardBg,
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${appData.cor || "#5B8DEF"} 0%, ${appData.cor ? `${appData.cor}dd` : "#4A7DE0"} 100%)`,
                  }}
                >
                  {appData.videoCourseImage ? (
                    <img src={appData.videoCourseImage} alt="Course" className="w-full h-full object-cover" />
                  ) : isPreview ? (
                    <ImageIcon className="w-6 h-6" style={{ color: "#A3C1FB", opacity: 0.5 }} />
                  ) : null}
                </div>
              {appData.videoCourseTitle && (
                  <span className="font-medium text-base flex-1 text-left" style={{ color: cardTextColor }}>
                    {appData.videoCourseTitle}
                  </span>
                )}
              </div>
              <svg
                className="w-5 h-5 flex-shrink-0"
                style={{ color: cardTextColor, opacity: 0.5 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {allProducts.map((product, index) => (
            <button
              key={index}
              onClick={() => !isPreview && product.url && handleViewPdf(product.url, product.label)}
              className="w-full p-4 rounded-2xl flex items-center justify-between transition-all hover:shadow-lg hover:scale-[1.02]"
              style={{
                backgroundColor: cardBg,
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="flex items-center gap-3">
                {product.thumbnail ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/20">
                    <img src={product.thumbnail} alt={product.label} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${appData.cor || "#5B8DEF"} 0%, ${appData.cor ? `${appData.cor}dd` : "#4A7DE0"} 100%)`,
                    }}
                  >
                    <ImageIcon className="w-6 h-6" style={{ color: "#A3C1FB", opacity: 0.5 }} />
                  </div>
                )}
                <span className="font-medium text-base flex-1 text-left" style={{ color: cardTextColor }}>
                  {product.label}
                </span>
              </div>
              <svg
                className="w-5 h-5 flex-shrink-0"
                style={{ color: cardTextColor, opacity: 0.5 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Dialog de Notificação */}
        {renderNotificationDialog()}
        </div>
      </div>
    );
  };

  const renderMembersTemplate = () => {
    const allProducts = [
      {
        label: getLabel(appData.main_product_label, "phonemockup.default.mainProductLabel"),
        thumbnail: appData.mainProductThumbnail,
        color: appData.cor,
        url: appData.produto_principal_url,
      },
      ...Array.from({ length: userPlanLimits }, (_, i) => {
        const bonusNum = i + 1;
        return {
          label: getLabel((appData as any)[`bonus${bonusNum}_label`], `phonemockup.default.bonus${bonusNum}Label`),
          thumbnail: (appData as any)[`bonus${bonusNum}_thumbnail`],
          color: (appData as any)[`bonus${bonusNum}_color`] || appData.cor,
          url: (appData as any)[`bonus${bonusNum}_url`],
        };
      }).filter((b) => b.url),
    ];

    const headerHeights = {
      small: "240px",
      medium: "300px",
      large: "340px",
    };

    const headerSize = appData.membersHeaderSize || "large";
    const headerHeight = headerHeights[headerSize as keyof typeof headerHeights];

    return (
      <div
        className="min-h-screen w-full"
        style={{
          backgroundColor: appTheme === "light" ? "#f8f9fa" : "#1a1625",
        }}
      >
        <div className="w-full max-w-md mx-auto">
        {/* Notificação */}
        {notificationEnabled && (
          <div
            className="px-4 py-3 border-b flex items-center justify-center relative z-10"
            style={{
              backgroundColor: "rgba(249, 115, 22, 0.1)",
              borderColor: "rgba(249, 115, 22, 0.2)",
            }}
          >
            <button
              type="button"
              onClick={() => setIsNotificationOpen(true)}
              className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="relative">
                {renderNotificationIcon()}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  1
                </span>
              </div>
              <span className="text-orange-300 text-sm font-medium">{t("notifications.new_notification")}</span>
            </button>
          </div>
        )}

        {/* Imagem de capa no topo com texto sobreposto */}
        <div
          className="w-full relative"
          style={{
            height: headerHeight,
            backgroundImage: appData.capa_url ? `url(${appData.capa_url})` : undefined,
            backgroundColor: appData.capa_url ? undefined : (appTheme === "light" ? "#7c3aed" : "#7c3aed"),
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {isPreview && !appData.capa_url && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
              <ImageIcon className="w-24 h-24" style={{ color: "#A3C1FB", opacity: 0.3 }} />
            </div>
          )}
          {/* Degradê escurecendo de baixo pra cima */}
          <div 
            className="absolute inset-0"
            style={{
              background: appTheme === "light" 
                ? "linear-gradient(to top, rgba(248, 249, 250, 1) 0%, rgba(248, 249, 250, 0.7) 50%, transparent 100%)"
                : "linear-gradient(to top, rgba(26, 22, 37, 1) 0%, rgba(26, 22, 37, 0.7) 50%, transparent 100%)"
            }}
          ></div>

          {/* Área de texto centralizado sobre a imagem */}
          <div className="absolute inset-0 flex flex-col items-center justify-end text-center pb-8 px-5">
            {/* Título */}
            <h1 
              className="text-3xl font-bold mb-2" 
              style={{ color: appData.nomeColor || (appTheme === "light" ? "#000000" : "#ffffff") }}
            >
              {appData.nome || "SUA MARCA"}
            </h1>

            {/* Descrição */}
            {appData.descricao ? (
              <div className="max-w-[260px]">
                <ExpandableDescription
                  text={appData.descricao}
                  color={appData.descricaoColor || (appTheme === "light" ? "#374151" : "#ffffff")}
                  maxLength={50}
                  title={appData.nome}
                />
              </div>
            ) : (
              <p 
                className="text-sm opacity-90 max-w-[260px]" 
                style={{ color: appData.descricaoColor || (appTheme === "light" ? "#374151" : "#ffffff") }}
              >
                Acesse todo o conteúdo exclusivo disponível para você
              </p>
            )}
          </div>
        </div>

        {/* Grid de Cards */}
        <div className="px-5 py-6">
          <div className="w-full grid grid-cols-2 gap-2.5">
            {/* Video Course Block */}
            {appData.videoCourseEnabled && (
              <button
                onClick={() => setIsModulesDialogOpen(true)}
                className={`aspect-[4/5] rounded-xl overflow-hidden backdrop-blur-sm hover:scale-[1.02] transition-transform relative ${appData.membersShowCardBorder ? 'border-2' : ''}`}
                style={{
                  backgroundImage: appData.videoCourseBackground ? `url(${appData.videoCourseBackground})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: appTheme === "light" ? "rgba(124, 58, 237, 0.1)" : "rgba(255, 255, 255, 0.1)",
                  borderColor: appData.membersShowCardBorder ? (appData.cor || '#4783F6') : undefined,
                }}
              >
                {isPreview && !appData.videoCourseBackground && (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: appTheme === "light" 
                        ? "linear-gradient(to bottom right, rgba(124, 58, 237, 0.3), rgba(236, 72, 153, 0.3))"
                        : "linear-gradient(to bottom right, rgba(124, 58, 237, 0.6), rgba(236, 72, 153, 0.6))"
                    }}
                  >
                    <ImageIcon className="w-16 h-16" style={{ color: "#A3C1FB", opacity: 0.3 }} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center p-2.5">
                  {(appData.videoCourseTitle || isPreview) && (
                    <span className="text-sm font-medium text-white text-center">
                      {getLabel(appData.videoCourseTitle, "phonemockup.default.videoCourseTitle")}
                    </span>
                  )}
                </div>
              </button>
            )}

            {allProducts.slice(0, 6).map((product, index) => (
              <button
                key={index}
                onClick={() => !isPreview && product.url && handleViewPdf(product.url, product.label)}
                className={`aspect-[4/5] rounded-xl overflow-hidden backdrop-blur-sm hover:scale-[1.02] transition-transform relative ${appData.membersShowCardBorder ? 'border-2' : ''}`}
                style={{
                  backgroundImage: product.thumbnail ? `url(${product.thumbnail})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: product.thumbnail ? undefined : (appTheme === "light" ? "rgba(124, 58, 237, 0.1)" : "rgba(255, 255, 255, 0.1)"),
                  borderColor: appData.membersShowCardBorder ? (appData.cor || '#4783F6') : undefined,
                }}
              >
                {isPreview && !product.thumbnail && (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: appTheme === "light" 
                        ? "linear-gradient(to bottom right, rgba(124, 58, 237, 0.3), rgba(236, 72, 153, 0.3))"
                        : "linear-gradient(to bottom right, rgba(124, 58, 237, 0.6), rgba(236, 72, 153, 0.6))"
                    }}
                  >
                    <ImageIcon className="w-16 h-16" style={{ color: "#A3C1FB", opacity: 0.3 }} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center p-2.5">
                  <span className="text-sm font-medium text-white text-center">{product.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dialog de Notificação */}
        {renderNotificationDialog()}
        </div>
      </div>
    );
  };

  const renderExclusiveTemplate = () => {
    const defaultBonusColors = [
      "#3b82f6", // blue
      "#10b981", // green
      "#f97316", // orange
      "#f59e0b", // amber
      "#14b8a6", // teal
      "#8b5cf6", // purple
      "#ec4899", // pink
      "#06b6d4", // cyan
      "#84cc16", // lime
    ];

    const bonuses = [
      {
        url: appData.bonus1_url,
        label: appData.bonus1_label,
        thumbnail: appData.bonus1_thumbnail,
        color: appData.bonus1_color || defaultBonusColors[0],
      },
      {
        url: appData.bonus2_url,
        label: appData.bonus2_label,
        thumbnail: appData.bonus2_thumbnail,
        color: appData.bonus2_color || defaultBonusColors[1],
      },
      {
        url: appData.bonus3_url,
        label: appData.bonus3_label,
        thumbnail: appData.bonus3_thumbnail,
        color: appData.bonus3_color || defaultBonusColors[2],
      },
      {
        url: appData.bonus4_url,
        label: appData.bonus4_label,
        thumbnail: appData.bonus4_thumbnail,
        color: appData.bonus4_color || defaultBonusColors[3],
      },
      {
        url: appData.bonus5_url,
        label: appData.bonus5_label,
        thumbnail: appData.bonus5_thumbnail,
        color: appData.bonus5_color || defaultBonusColors[4],
      },
      {
        url: appData.bonus6_url,
        label: appData.bonus6_label,
        thumbnail: appData.bonus6_thumbnail,
        color: appData.bonus6_color || defaultBonusColors[5],
      },
      {
        url: appData.bonus7_url,
        label: appData.bonus7_label,
        thumbnail: appData.bonus7_thumbnail,
        color: appData.bonus7_color || defaultBonusColors[6],
      },
      {
        url: appData.bonus8_url,
        label: appData.bonus8_label,
        thumbnail: appData.bonus8_thumbnail,
        color: appData.bonus8_color || defaultBonusColors[7],
      },
      {
        url: appData.bonus9_url,
        label: appData.bonus9_label,
        thumbnail: appData.bonus9_thumbnail,
        color: appData.bonus9_color || defaultBonusColors[8],
      },
      {
        url: appData.bonus10_url,
        label: appData.bonus10_label,
        thumbnail: appData.bonus10_thumbnail,
        color: appData.bonus10_color || defaultBonusColors[9 % defaultBonusColors.length],
      },
      {
        url: appData.bonus11_url,
        label: appData.bonus11_label,
        thumbnail: appData.bonus11_thumbnail,
        color: appData.bonus11_color || defaultBonusColors[10 % defaultBonusColors.length],
      },
      {
        url: appData.bonus12_url,
        label: appData.bonus12_label,
        thumbnail: appData.bonus12_thumbnail,
        color: appData.bonus12_color || defaultBonusColors[11 % defaultBonusColors.length],
      },
      {
        url: appData.bonus13_url,
        label: appData.bonus13_label,
        thumbnail: appData.bonus13_thumbnail,
        color: appData.bonus13_color || defaultBonusColors[12 % defaultBonusColors.length],
      },
      {
        url: appData.bonus14_url,
        label: appData.bonus14_label,
        thumbnail: appData.bonus14_thumbnail,
        color: appData.bonus14_color || defaultBonusColors[13 % defaultBonusColors.length],
      },
      {
        url: appData.bonus15_url,
        label: appData.bonus15_label,
        thumbnail: appData.bonus15_thumbnail,
        color: appData.bonus15_color || defaultBonusColors[14 % defaultBonusColors.length],
      },
      {
        url: appData.bonus16_url,
        label: appData.bonus16_label,
        thumbnail: appData.bonus16_thumbnail,
        color: appData.bonus16_color || defaultBonusColors[15 % defaultBonusColors.length],
      },
      {
        url: appData.bonus17_url,
        label: appData.bonus17_label,
        thumbnail: appData.bonus17_thumbnail,
        color: appData.bonus17_color || defaultBonusColors[16 % defaultBonusColors.length],
      },
      {
        url: appData.bonus18_url,
        label: appData.bonus18_label,
        thumbnail: appData.bonus18_thumbnail,
        color: appData.bonus18_color || defaultBonusColors[17 % defaultBonusColors.length],
      },
      {
        url: appData.bonus19_url,
        label: appData.bonus19_label,
        thumbnail: appData.bonus19_thumbnail,
        color: appData.bonus19_color || defaultBonusColors[18 % defaultBonusColors.length],
      },
    ].filter((bonus) => bonus.url);

    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: appTheme === "light" ? "#ffffff" : "#0f172a",
        }}
      >
        <div className="w-full max-w-md mx-auto">
        {renderStatusBar()}

        {/* Notificação */}
        {notificationEnabled && (
          <div
            className="px-4 py-3 border-b flex items-center justify-center relative z-10"
            style={{
              backgroundColor: appTheme === "light" ? "rgba(249, 115, 22, 0.1)" : "rgba(249, 115, 22, 0.1)",
              borderColor: appTheme === "light" ? "rgba(249, 115, 22, 0.2)" : "rgba(249, 115, 22, 0.2)",
            }}
          >
            <button
              type="button"
              onClick={() => setIsNotificationOpen(true)}
              className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="relative">
                {renderNotificationIcon()}
                <span
                  className="absolute -top-1 -right-1 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                  style={{
                    backgroundColor: "#ef4444",
                    color: "#ffffff",
                  }}
                >
                  1
                </span>
              </div>
              <span className="text-sm font-medium" style={{ color: appTheme === "light" ? "#f97316" : "#fb923c" }}>
                {t("notifications.new_notification")}
              </span>
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="px-6 pt-8 pb-6 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: appData.nomeColor || (appTheme === "light" ? "#1e293b" : "#f8fafc") }}>
            {appData.nome}
          </h1>
          {appData.descricao && (
            <ExpandableDescription
              text={appData.descricao}
              color={appData.descricaoColor || (appTheme === "light" ? "#64748b" : "#94a3b8")}
              maxLength={50}
              className="text-base"
              title={appData.nome}
            />
          )}
        </div>

        {/* Video Course Block */}
        {appData.videoCourseEnabled && (
          <div className="px-6 mb-4">
            <div
              className="rounded-2xl p-6 pr-12 flex items-center justify-between shadow-lg relative overflow-visible cursor-pointer hover:scale-[1.02] transition-transform"
              style={{
                backgroundColor: appData.cor,
                minHeight: "120px",
              }}
              onClick={() => setIsModulesDialogOpen(true)}
            >
              <div className="flex-1 pr-4">
                {appData.videoCourseTitle && (
                  <h3 className="text-white text-xl font-semibold mb-1">
                    {appData.videoCourseTitle}
                  </h3>
                )}
                {appData.videoCourseDescription && (
                  <ExpandableDescription
                    text={appData.videoCourseDescription}
                    color="rgba(255, 255, 255, 0.9)"
                    maxLength={50}
                    title={appData.videoCourseTitle || ""}
                  />
                )}
              </div>
              <div
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden"
                style={{
                  border: "3px solid #ffffff",
                }}
              >
                {appData.videoCourseImage ? (
                  <img src={appData.videoCourseImage} alt="Course" className="w-full h-full object-cover" />
                ) : isPreview ? (
                  <ImageIcon className="w-10 h-10" style={{ color: "#A3C1FB" }} />
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Main Product - if exists */}
        {appData.produto_principal_url && (
          <div className="px-6 mb-4">
            <div
              className="rounded-2xl p-6 pr-12 flex items-center justify-between shadow-lg relative overflow-visible cursor-pointer hover:scale-[1.02] transition-transform"
              style={{
                backgroundColor: appData.cor,
                minHeight: "120px",
              }}
              onClick={() => handleViewPdf(appData.produto_principal_url!, appData.main_product_label || "")}
            >
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-white text-xl font-semibold mb-1">
                    {getLabel(appData.main_product_label, "phonemockup.default.mainProductLabel")}
                  </h3>
                  {appData.allow_pdf_download && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(appData.produto_principal_url!, `${appData.main_product_label || 'produto'}.pdf`);
                      }}
                      className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
                {appData.main_product_description && (
                  <ExpandableDescription
                    text={appData.main_product_description}
                    color="rgba(255, 255, 255, 0.9)"
                    maxLength={50}
                    title={appData.main_product_label || ""}
                  />
                )}
              </div>
              <div
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden"
                style={{
                  border: "3px solid #ffffff",
                }}
              >
                {appData.mainProductThumbnail ? (
                  <img src={appData.mainProductThumbnail} alt="Product" className="w-full h-full object-cover" />
                ) : isPreview ? (
                  <ImageIcon className="w-10 h-10" style={{ color: "#A3C1FB" }} />
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Bonuses Label */}
        {bonuses.length > 0 && appData.bonuses_label && (
          <div className="px-6 mt-6 mb-3">
            <h2 className="text-lg font-semibold" style={{ color: appTheme === "light" ? "#1e293b" : "#f8fafc" }}>
              {appData.bonuses_label}
            </h2>
          </div>
        )}

        {/* Bonuses Grid */}
        <div className="px-6 pb-6 space-y-3">
          {bonuses.map((bonus, index) => (
            <div
              key={index}
              className="relative rounded-xl flex items-center shadow-md cursor-pointer hover:scale-[1.02] transition-transform overflow-visible"
              style={{
                backgroundColor: bonus.color,
                minHeight: "60px",
                paddingLeft: "16px",
                paddingRight: "70px",
                paddingTop: "12px",
                paddingBottom: "12px",
              }}
              onClick={() => bonus.url && handleViewPdf(bonus.url, bonus.label || "")}
            >
              <div className="flex-1 flex items-center gap-2">
                <h3 className="text-white text-base font-semibold">{getLabel(bonus.label, `phonemockup.default.bonus${index + 1}Label`)}</h3>
                {appData.allow_pdf_download && bonus.url && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(bonus.url!, `${bonus.label || 'bonus'}.pdf`);
                    }}
                    className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <Download className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
              <div
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg"
                style={{
                  border: "3px solid #ffffff",
                }}
              >
                {bonus.thumbnail ? (
                  <img
                    src={bonus.thumbnail}
                    alt={bonus.label || ""}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : isPreview ? (
                  <ImageIcon className="w-7 h-7" style={{ color: "#A3C1FB" }} />
                ) : null}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    );
  };

  const renderFlowTemplate = () => {
    const isDarkMode = appTheme === "dark";
    const bgColor = isDarkMode ? "#0f0a1f" : "#f5f3ff";
    const textColor = isDarkMode ? "#ffffff" : "#1f2937";
    const subtitleColor = isDarkMode ? "#c4b5fd" : "#6b7280";
    const progressActiveColor = isDarkMode ? "#a855f7" : "#7c3aed";
    const progressInactiveColor = isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)";

    // Build all products array and filter based on preview mode
    const allProductsRaw = [
      {
        label: getLabel(appData.main_product_label, "phonemockup.default.mainProductLabel"),
        thumbnail: appData.mainProductThumbnail,
        url: appData.produto_principal_url,
      },
      ...Array.from({ length: userPlanLimits }, (_, i) => {
        const bonusNum = i + 1;
        return {
          label: getLabel((appData as any)[`bonus${bonusNum}_label`], `phonemockup.default.bonus${bonusNum}Label`),
          thumbnail: (appData as any)[`bonus${bonusNum}_thumbnail`],
          url: (appData as any)[`bonus${bonusNum}_url`],
        };
      }),
    ];

    // In preview mode, show all slots for UI demonstration
    // In published app, only show products that have been uploaded (have URL)
    const allProducts = isPreview 
      ? allProductsRaw 
      : allProductsRaw.filter(product => product.url);

    return (
      <div
        className="h-full w-full relative overflow-hidden"
        style={{
          backgroundColor: bgColor,
        }}
      >
        <div className="w-full max-w-md mx-auto h-full overflow-auto">
        {/* Notificação */}
        {notificationEnabled && (
          <div
            className="absolute top-0 left-0 right-0 z-20 px-4 py-3 border-b flex items-center justify-center"
            style={{
              backgroundColor: "rgba(249, 115, 22, 0.1)",
              borderColor: "rgba(249, 115, 22, 0.2)",
            }}
          >
            <button
              type="button"
              onClick={() => setIsNotificationOpen(true)}
              className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="relative">
                {renderNotificationIcon()}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  1
                </span>
              </div>
              <span className="text-orange-300 text-sm font-medium">{t("notifications.new_notification")}</span>
            </button>
          </div>
        )}

        {/* Imagem de capa com degradê de baixo para cima */}
        <div
          className="absolute top-0 left-0 right-0 h-[45%]"
          style={{
            backgroundImage: appData.capa_url
              ? `url(${appData.capa_url})`
              : isDarkMode
                ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)"
                : "linear-gradient(135deg, #a78bfa 0%, #c4b5fd 50%, #f5d0fe 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Placeholder quando não há imagem de capa */}
          {isPreview && !appData.capa_url && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="w-24 h-24" style={{ color: "#A3C1FB", opacity: isDarkMode ? 0.3 : 0.5 }} />
            </div>
          )}

          {/* Degradê de baixo para cima mais escuro para dar disfarce */}
          <div
            className="absolute inset-0"
            style={{
              background: isDarkMode
                ? "linear-gradient(to top, #0f0a1f 0%, rgba(15, 10, 31, 0.85) 40%, transparent 100%)"
                : "linear-gradient(to top, #f5f3ff 0%, rgba(245, 243, 255, 0.85) 40%, transparent 100%)",
            }}
          />
        </div>

        {/* Conteúdo */}
        <div className="relative h-full flex flex-col px-5 pt-6">
          {/* Logo/Ícone no topo esquerdo */}
          {appData.showAppIcon !== false && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center" style={{
                backgroundColor: appData.icone_url ? 'transparent' : (isDarkMode ? 'rgba(167, 139, 250, 0.2)' : 'rgba(124, 58, 237, 0.1)'),
                border: appData.icone_url ? 'none' : `2px dashed ${isDarkMode ? 'rgba(167, 139, 250, 0.4)' : 'rgba(124, 58, 237, 0.3)'}`
              }}>
                {appData.icone_url ? (
                  <img src={appData.icone_url} alt="Logo" className="w-full h-full object-cover" />
                ) : isPreview ? (
                  <ImageIcon className="w-5 h-5" style={{ color: isDarkMode ? '#a78bfa' : '#7c3aed', opacity: 0.6 }} />
                ) : null}
              </div>
            </div>
          )}

          {/* Título e Subtítulo */}
          <div className="mb-3">
            {appData.nome && (
              <h1 className="text-2xl font-bold mb-1" style={{ color: appData.nomeColor || textColor }}>
                {appData.nome}
              </h1>
            )}
            {appData.descricao && (
              <ExpandableDescription
                text={appData.descricao}
                color={appData.descricaoColor || subtitleColor}
                maxLength={50}
                title={appData.nome}
              />
            )}
          </div>

          {/* Cards de Módulos em Grid 2 colunas */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-2 gap-3 pb-6">
              {/* Video Course Block */}
              {appData.videoCourseEnabled && (
                <button
                  onClick={() => setIsModulesDialogOpen(true)}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform ${appData.flowShowCardBorder ? 'border-2' : ''}`}
                  style={{
                    backgroundImage: appData.videoCourseBackground
                      ? `url(${appData.videoCourseBackground})`
                      : isDarkMode
                        ? "linear-gradient(135deg, rgba(124, 58, 237, 0.4) 0%, rgba(168, 85, 247, 0.4) 100%)"
                        : "linear-gradient(135deg, rgba(167, 139, 250, 0.3) 0%, rgba(196, 181, 253, 0.3) 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderColor: appData.flowShowCardBorder ? (appData.cor || '#4783F6') : undefined,
                  }}
                >
                  {/* Placeholder - só mostra se não tiver imagem */}
                  {isPreview && !appData.videoCourseBackground && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-16 h-16" style={{ color: "#A3C1FB", opacity: isDarkMode ? 0.3 : 0.2 }} />
                    </div>
                  )}

                  {/* Gradiente overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: isDarkMode
                        ? "linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%)"
                        : "linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%)",
                    }}
                  />

                  {/* Título do card */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    {appData.videoCourseTitle && (
                      <h3 className="text-sm font-semibold text-white leading-tight">
                      {appData.videoCourseTitle}
                      </h3>
                    )}
                  </div>

                  {/* Ícone play ou indicador */}
                  <div
                    className="absolute top-3 right-3 w-6 h-6 rounded-full backdrop-blur-sm flex items-center justify-center"
                    style={{
                      backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <Eye className="w-3 h-3 text-white" />
                  </div>
                </button>
              )}

              {allProducts.slice(0, 6).map((product, index) => (
                <button
                  key={index}
                  onClick={() => !isPreview && product.url && handleViewPdf(product.url, product.label)}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform ${appData.flowShowCardBorder ? 'border-2' : ''}`}
                  style={{
                    backgroundImage: product.thumbnail
                      ? `url(${product.thumbnail})`
                      : isDarkMode
                        ? "linear-gradient(135deg, rgba(124, 58, 237, 0.4) 0%, rgba(168, 85, 247, 0.4) 100%)"
                        : "linear-gradient(135deg, rgba(167, 139, 250, 0.3) 0%, rgba(196, 181, 253, 0.3) 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderColor: appData.flowShowCardBorder ? (appData.cor || '#4783F6') : undefined,
                  }}
                >
                  {/* Placeholder quando não há imagem */}
                  {isPreview && !product.thumbnail && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-16 h-16" style={{ color: "#A3C1FB", opacity: isDarkMode ? 0.3 : 0.2 }} />
                    </div>
                  )}

                  {/* Gradiente overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: isDarkMode
                        ? "linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%)"
                        : "linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%)",
                    }}
                  />

                  {/* Título do card */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-sm font-semibold text-white leading-tight">{getLabel(product.label, index === 0 ? "phonemockup.default.mainProductLabel" : `phonemockup.default.bonus${index}Label`)}</h3>
                  </div>

                  {/* Ícone play ou indicador + download */}
                  <div className="absolute top-3 right-3 flex gap-1">
                    {appData.allow_pdf_download && product.url && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(product.url!, `${product.label || 'produto'}.pdf`);
                        }}
                        className="w-6 h-6 rounded-full backdrop-blur-sm flex items-center justify-center"
                        style={{
                          backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        <Download className="w-3 h-3 text-white" />
                      </button>
                    )}
                    <div
                      className="w-6 h-6 rounded-full backdrop-blur-sm flex items-center justify-center"
                      style={{
                        backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      <Eye className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </button>
                ))}
            </div>
          </div>
        </div>

        {/* Dialog de Notificação */}
        {renderNotificationDialog()}
        </div>
      </div>
    );
  };

  const renderShopTemplate = () => {
    const isDarkMode = appTheme === "dark";
    const bgColor = isDarkMode ? "#000000" : "#f5f5f5";
    const textColor = isDarkMode ? "#ffffff" : "#1f2937";
    const productTitleColor = isDarkMode ? "#ffffff" : "#111827";
    
    // Build all products array and filter based on preview mode
    const allProductsRaw = [
      {
        label: getLabel(appData.main_product_label, "phonemockup.default.mainProductLabel"),
        thumbnail: appData.mainProductThumbnail,
        url: appData.produto_principal_url,
      },
      ...Array.from({ length: userPlanLimits }, (_, i) => {
        const bonusNum = i + 1;
        return {
          label: getLabel((appData as any)[`bonus${bonusNum}_label`], `phonemockup.default.bonus${bonusNum}Label`),
          thumbnail: (appData as any)[`bonus${bonusNum}_thumbnail`],
          url: (appData as any)[`bonus${bonusNum}_url`],
        };
      }),
    ];

    // In preview mode, show all slots for UI demonstration
    // In published app, only show products that have been uploaded (have URL)
    const allProducts = isPreview 
      ? allProductsRaw 
      : allProductsRaw.filter(product => product.url);

    return (
      <div className="h-full w-full flex flex-col" style={{ backgroundColor: bgColor }}>
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
        {/* Notificação */}
        {notificationEnabled && (
          <div
            className="px-4 py-3 border-b flex items-center justify-center relative z-10"
            style={{
              backgroundColor: "rgba(249, 115, 22, 0.1)",
              borderColor: "rgba(249, 115, 22, 0.2)",
            }}
          >
            <button
              type="button"
              onClick={() => setIsNotificationOpen(true)}
              className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="relative">
                {renderNotificationIcon()}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  1
                </span>
              </div>
              <span className="text-orange-300 text-sm font-medium">{t("notifications.new_notification")}</span>
            </button>
          </div>
        )}

        {/* Header com imagem de capa */}
        <div
          className="relative h-[30%] min-h-[180px] flex flex-col items-center justify-center"
          style={{
            backgroundImage: appData.capa_url ? `url(${appData.capa_url})` : "none",
            backgroundColor: appData.capa_url ? "transparent" : appData.cor,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Placeholder quando não há imagem de capa */}
          {isPreview && !appData.capa_url && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="w-24 h-24" style={{ color: "#A3C1FB", opacity: 0.5 }} />
            </div>
          )}

          {/* Overlay escuro para melhor legibilidade */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Conteúdo do header */}
          <div className="relative z-10 text-center px-5">
            <h1 className="text-2xl font-bold mb-2" style={{ color: appData.nomeColor || "#ffffff" }}>{appData.nome || "Sua Loja"}</h1>
            {appData.descricao && (
              <ExpandableDescription
                text={appData.descricao}
                color={appData.descricaoColor || "rgba(255, 255, 255, 0.9)"}
                maxLength={50}
                className="text-center"
                title={appData.nome || "Sua Loja"}
              />
            )}
          </div>
        </div>

        {/* Seção de produtos */}
        <div className="flex-1 px-5 pt-6 pb-6 overflow-auto" style={{ backgroundColor: bgColor }}>
          {/* Grid de produtos */}
          <div className="grid grid-cols-2 gap-3 auto-rows-min pb-4">
            {/* Video Course Block */}
            {appData.videoCourseEnabled && (
              <div className="flex flex-col gap-1">
                {/* Título do curso acima do card */}
                {appData.videoCourseTitle && (
                  <h3 
                    className="text-sm font-semibold leading-tight line-clamp-2 text-center min-h-[2.5rem] flex items-center justify-center"
                    style={{ color: productTitleColor }}
                  >
                    {appData.videoCourseTitle}
                  </h3>
                )}

                <button
                  onClick={() => setIsModulesDialogOpen(true)}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden hover:scale-[1.02] transition-transform ${appData.shopRemoveCardBorder ? "" : "border-2"}`}
                  style={{
                    backgroundImage: appData.videoCourseBackground
                      ? `url(${appData.videoCourseBackground})`
                      : "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderColor: appData.shopRemoveCardBorder ? "transparent" : appData.cor || "#10b981",
                  }}
                >
                  {/* Placeholder - só mostra se não tiver imagem */}
                  {isPreview && !appData.videoCourseBackground && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-16 h-16" style={{ color: "#A3C1FB", opacity: 0.3 }} />
                    </div>
                  )}

                  {/* Overlay escuro */}
                  <div className="absolute inset-0 bg-black/40" />
                </button>
              </div>
            )}

            {allProducts.map((product, index) => (
              <div key={index} className="flex flex-col gap-1">
                {/* Título do produto acima do card */}
                <h3 
                  className="text-sm font-semibold leading-tight line-clamp-2 text-center min-h-[2.5rem] flex items-center justify-center"
                  style={{ color: productTitleColor }}
                >
                  {getLabel(product.label, index === 0 ? "phonemockup.default.mainProductLabel" : `phonemockup.default.bonus${index}Label`)}
                </h3>

                <button
                  onClick={() => !isPreview && product.url && handleViewPdf(product.url, product.label)}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden hover:scale-[1.02] transition-transform ${appData.shopRemoveCardBorder ? "" : "border-2"}`}
                  style={{
                    backgroundImage: product.thumbnail
                      ? `url(${product.thumbnail})`
                      : "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderColor: appData.shopRemoveCardBorder ? "transparent" : appData.cor || "#10b981",
                  }}
                >
                  {/* Placeholder quando não há imagem */}
                  {isPreview && !product.thumbnail && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-16 h-16" style={{ color: "#A3C1FB", opacity: 0.3 }} />
                    </div>
                  )}

                  {/* Overlay escuro */}
                  <div className="absolute inset-0 bg-black/40" />

                  {/* Ícones de ação */}
                  {appData.allow_pdf_download && product.url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(product.url!, `${product.label || 'produto'}.pdf`);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-white" />
                    </button>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dialog de Notificação */}
        {renderNotificationDialog()}
        </div>
      </div>
    );
  };

  const renderAcademyTemplate = () => {
    // Filtrar apenas produtos com thumbnail (para app publicado)
    // No preview, sempre mostrar todos os slots com placeholder
    const allCarouselSlots = [
      {
        thumbnail: (appData as any).training1Cover,
        url: appData.produto_principal_url,
      },
      {
        thumbnail: (appData as any).training2Cover,
        url: appData.bonus1_url,
      },
      {
        thumbnail: (appData as any).training3Cover,
        url: appData.bonus2_url,
      },
      {
        thumbnail: (appData as any).training4Cover,
        url: appData.bonus3_url,
      },
    ];

    // No preview, mostra todos os slots. No app publicado, mostra apenas os que têm imagem
    const featuredProducts = isPreview 
      ? allCarouselSlots 
      : allCarouselSlots.filter(product => product.thumbnail);

    // Build all products array and filter based on preview mode
    const allProductsRaw = [
      {
        label: getLabel(appData.main_product_label, "phonemockup.default.mainProductLabel"),
        thumbnail: appData.mainProductThumbnail,
        url: appData.produto_principal_url,
      },
      ...Array.from({ length: userPlanLimits - 1 }, (_, i) => {
        const bonusNum = i + 1;
        return {
          label: getLabel((appData as any)[`bonus${bonusNum}_label`], `phonemockup.default.bonus${bonusNum}Label`),
          thumbnail: (appData as any)[`bonus${bonusNum}_thumbnail`],
          url: (appData as any)[`bonus${bonusNum}_url`],
        };
      }),
    ];

    // In preview mode, show all slots for UI demonstration
    // In published app, only show products that have been uploaded (have URL)
    const allProducts = isPreview 
      ? allProductsRaw 
      : allProductsRaw.filter(product => product.url);

    const isDark = appTheme === "dark";

    return (
      <div className="h-full w-full overflow-auto" style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}>
        <div className="w-full max-w-md mx-auto pb-4">
        {/* Notificação */}
        {notificationEnabled && (
          <div
            className="px-4 py-3 border-b flex items-center justify-center relative z-10"
            style={{
              backgroundColor: "rgba(249, 115, 22, 0.1)",
              borderColor: "rgba(249, 115, 22, 0.2)",
            }}
          >
            <button
              type="button"
              onClick={() => setIsNotificationOpen(true)}
              className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="relative">
                {renderNotificationIcon()}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  1
                </span>
              </div>
              <span className="text-orange-300 text-sm font-medium">{t("notifications.new_notification")}</span>
            </button>
          </div>
        )}

        {/* App Icon/Logo - sempre mostra no topo quando não tem carrossel */}
        {featuredProducts.length === 0 && (
          <div className="px-5 pt-6 pb-2">
            {(appData as any).trainingLogo ? (
              <img src={(appData as any).trainingLogo} alt="Logo" className="h-10 w-auto object-contain" />
            ) : appData.icone_url ? (
              <img src={appData.icone_url} alt="Logo" className="h-10 w-auto object-contain" />
            ) : isPreview ? (
              <div className="flex items-center justify-start">
                <ImageIcon className="h-10 w-10" style={{ color: "#687B9F" }} />
              </div>
            ) : null}
          </div>
        )}

        {/* Carrossel em destaque - só mostra se houver imagens */}
        {featuredProducts.length > 0 && (
          <div className="px-5 pt-6 pb-4">
            <div className="mb-4">
              {(appData as any).trainingLogo ? (
                <img src={(appData as any).trainingLogo} alt="Logo" className="h-10 w-auto object-contain" />
              ) : appData.icone_url ? (
                <img src={appData.icone_url} alt="Logo" className="h-10 w-auto object-contain" />
              ) : isPreview ? (
                <div className="flex items-center justify-start">
                  <ImageIcon className="h-10 w-10" style={{ color: "#687B9F" }} />
                </div>
              ) : null}
            </div>

            {/* Carrossel */}
            <div className="relative">
              <div
                ref={(el) => {
                  if (el && carouselRef.current !== el) {
                    carouselRef.current = el;
                  }
                }}
                className="overflow-x-auto scrollbar-hide"
                onScroll={(e) => {
                  const scrollLeft = e.currentTarget.scrollLeft;
                  const width = e.currentTarget.offsetWidth;
                  const newSlide = Math.round(scrollLeft / width);
                  if (newSlide !== currentSlide) {
                    setCurrentSlide(newSlide);
                  }
                }}
              >
                <div className="flex">
                  {featuredProducts.map((product, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                      <button
                        onClick={() => !isPreview && product.url && handleViewPdf(product.url, "")}
                        className="w-full relative aspect-[16/10] rounded overflow-hidden"
                        style={{
                          backgroundImage: product.thumbnail ? `url(${product.thumbnail})` : "none",
                          backgroundColor: product.thumbnail ? "transparent" : isDark ? "#1f2937" : "#f3f4f6",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        {isPreview && !product.thumbnail && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ImageIcon className="w-24 h-24" style={{ color: "#687B9F" }} />
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indicadores de paginação */}
              {featuredProducts.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {featuredProducts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className="w-2 h-2 rounded-full transition-all"
                      style={{
                        backgroundColor:
                          currentSlide === index
                            ? isDark
                              ? "#ffffff"
                              : "#000000"
                            : isDark
                              ? "rgba(255, 255, 255, 0.3)"
                              : "rgba(0, 0, 0, 0.3)",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Seção de módulos/aulas */}
        <div className="px-5 pb-6">
          <h2
            className="text-base font-bold mb-1 tracking-wide"
            style={{ color: appData.nomeColor || (isDark ? "#ffffff" : "#000000") }}
          >
            {appData.nome || "Série de Boas-Vindas e Nivelamento"}
          </h2>
          {appData.descricao && (
            <div className="mb-4">
              <ExpandableDescription
                text={appData.descricao}
                color={appData.descricaoColor || (isDark ? "#d1d5db" : "#4b5563")}
                maxLength={50}
                title={appData.nome}
              />
            </div>
          )}
          {!appData.descricao && <div className="mb-4" />}

          {/* Grid 2 colunas */}
          <div className="grid grid-cols-2 gap-3">
            {/* Video Course Block */}
            {appData.videoCourseEnabled && (
              <button
                onClick={() => setIsModulesDialogOpen(true)}
                className="relative aspect-[3/4] rounded overflow-hidden hover:scale-[1.02] transition-transform"
                style={{
                  backgroundImage: appData.videoCourseBackground
                    ? `url(${appData.videoCourseBackground})`
                    : "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Placeholder - só mostra se não tiver imagem */}
                {isPreview && !appData.videoCourseBackground && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16" style={{ color: "#A3C1FB" }} />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Texto na parte inferior */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  {appData.videoCourseTitle && (
                    <h3
                      className="text-lg font-bold leading-tight"
                      style={{ color: appData.cor || "#ef4444" }}
                    >
                      {appData.videoCourseTitle}
                    </h3>
                  )}
                </div>
              </button>
            )}

            {allProducts.map((product, index) => (
              <button
                key={index}
                onClick={() => !isPreview && product.url && handleViewPdf(product.url, product.label)}
                className="relative aspect-[3/4] rounded overflow-hidden hover:scale-[1.02] transition-transform"
                style={{
                  backgroundImage: product.thumbnail
                    ? `url(${product.thumbnail})`
                    : "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Placeholder quando não há thumbnail */}
                {isPreview && !product.thumbnail && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16" style={{ color: "#A3C1FB" }} />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Texto na parte inferior */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3
                    className="text-lg font-bold leading-tight break-words"
                    style={{ color: appData.cor || "#ef4444" }}
                  >
                    {getLabel(product.label, index === 0 ? "phonemockup.default.mainProductLabel" : `phonemockup.default.bonus${index}Label`)}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dialog de Notificação */}
        {renderNotificationDialog()}
        </div>
      </div>
    );
  };

  // Render based on template
  // Renderizar o template apropriado com o dialog
  const renderContent = () => {
    switch (template) {
      case "corporate":
        return renderCorporateTemplate();
      case "showcase":
        return renderShowcaseTemplate();
      case "modern":
        return renderModernTemplate();
      case "minimal":
        return renderMinimalTemplate();
      case "exclusive":
        return renderExclusiveTemplate();
      case "units":
        return renderUnitsTemplate();
      case "members":
        return renderMembersTemplate();
      case "flow":
        return renderFlowTemplate();
      case "shop":
        return renderShopTemplate();
      case "academy":
        return renderAcademyTemplate();
      default:
        return renderClassicTemplate();
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: appTheme === "light" ? "#ffffff" : "#111827",
        color: appTheme === "light" ? "#111827" : "#ffffff",
      }}
    >
      {renderContent()}

      {/* Video Player Dialog */}
      {selectedVideo && (
        <VideoPlayerDialog
          open={!!selectedVideo}
          onOpenChange={(open) => !open && setSelectedVideo(null)}
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
        />
      )}

      {/* Modules Dialog */}
      <Dialog open={isModulesDialogOpen} onOpenChange={setIsModulesDialogOpen}>
        <DialogContent 
          className="max-w-2xl w-[calc(100%-2rem)] rounded-2xl border" 
          style={{ 
            backgroundColor: appTheme === "light" ? "#ffffff" : "#1f2937",
            borderColor: appTheme === "light" ? "#e5e7eb" : "#374151"
          }}
        >
          {appData.videoCourseTitle && (
            <DialogTitle
              className="text-xl font-bold mb-4"
              style={{ color: appTheme === "light" ? "#111827" : "#ffffff" }}
            >
              {appData.videoCourseTitle}
            </DialogTitle>
          )}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {appData.videoModules &&
              appData.videoModules.map((module) => (
                <div key={module.id} className="space-y-2">
                  <h3
                    className="font-semibold text-base px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: appData.cor || "#4783F6",
                      color: "#ffffff",
                    }}
                  >
                    {module.title}
                  </h3>
                  <div className="space-y-1 pl-2">
                    {module.videos.map(
                      (video) =>
                        video.youtubeUrl && (
                          <button
                            key={video.id}
                            onClick={() => {
                              setSelectedVideo({ url: video.youtubeUrl, title: video.title });
                              setIsModulesDialogOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm"
                            style={{
                              backgroundColor: appTheme === "light" ? "#f9fafb" : "#374151",
                              color: appTheme === "light" ? "#111827" : "#ffffff",
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: appData.cor || "#4783F6" }}
                            >
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                            <span className="flex-1">{video.title}</span>
                          </button>
                        ),
                    )}
                  </div>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog - renderizado no nível superior para garantir que funcione fora de containers com overflow */}
      {renderNotificationDialog()}
    </div>
  );
};

export { ThemeRenderer };
