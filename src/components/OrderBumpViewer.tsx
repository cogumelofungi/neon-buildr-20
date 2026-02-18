import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, ImageIcon, ChevronRight, X, Download } from "lucide-react";
import { PdfViewer } from "@/components/PdfViewer";
import { InternalPdfViewer } from "@/components/InternalPdfViewer";
import { AdobePdfViewer } from "@/components/AdobePdfViewer";
import { EmbedPdfViewer } from "@/components/EmbedPdfViewer";
import { usePdfViewerSetting } from "@/hooks/usePdfViewerSetting";
import VideoPlayerDialog from "@/components/VideoPlayerDialog";
import AudioPlayerDialog from "@/components/AudioPlayerDialog";
import ExpandableDescription from "@/components/ExpandableDescription";
import { THEME_PRESETS } from "@/types/theme";
export interface OrderBumpData {
  id: string;
  nome?: string;
  label: string;
  cor?: string;
  icone_url?: string;
  capa_url?: string;
  template?: string;
  app_theme?: string;
  allow_pdf_download?: boolean;
  view_button_label?: string;
  theme_config?: any;
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
  main_product_label?: string;
  main_product_description?: string;
  bonuses_label?: string;
  main_product_thumbnail?: string;
  bonus1_label?: string;
  bonus1_thumbnail?: string;
  bonus2_label?: string;
  bonus2_thumbnail?: string;
  bonus3_label?: string;
  bonus3_thumbnail?: string;
  bonus4_label?: string;
  bonus4_thumbnail?: string;
  bonus5_label?: string;
  bonus5_thumbnail?: string;
  bonus6_label?: string;
  bonus6_thumbnail?: string;
  bonus7_label?: string;
  bonus7_thumbnail?: string;
  bonus8_label?: string;
  bonus8_thumbnail?: string;
  bonus9_label?: string;
  bonus9_thumbnail?: string;
  // Video Course
  video_course_enabled?: boolean;
  video_modules?: any[];
}

interface OrderBumpViewerProps {
  orderBump: OrderBumpData;
  onClose: () => void;
  appTemplate?: string;
  appTheme?: 'dark' | 'light';
}

export default function OrderBumpViewer({ orderBump, onClose, appTemplate, appTheme }: OrderBumpViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioTitle, setAudioTitle] = useState<string>("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const isScrollingProgrammatically = useRef(false);
  const [isModulesDialogOpen, setIsModulesDialogOpen] = useState(false);

  // Auto-play para o carrossel do Academy template
  useEffect(() => {
    const t = (appTemplate || "classic");
    if (t !== "academy") return;
    
    const covers = [
      orderBump.theme_config?.training1Cover,
      orderBump.theme_config?.training2Cover,
      orderBump.theme_config?.training3Cover,
      orderBump.theme_config?.training4Cover,
    ].filter(Boolean);

    if (covers.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % covers.length;
        if (carouselRef.current) {
          isScrollingProgrammatically.current = true;
          carouselRef.current.scrollTo({
            left: next * carouselRef.current.offsetWidth,
            behavior: 'smooth',
          });
          setTimeout(() => { isScrollingProgrammatically.current = false; }, 500);
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [appTemplate, orderBump.theme_config]);

  // Usa as mesmas configurações de PDF viewer do app principal
  const { pdfViewer, adobeClientId, closeButtonColor, controlsColor, headerBgColor, controlsBarColor } = usePdfViewerSetting();

  const primaryColor = orderBump.cor || "#4783F6";
  const isDark = (appTheme || orderBump.app_theme || "dark") !== "light";
  // Usa o template do app principal (passado via prop), não o do order bump
  const template = (appTemplate || "classic") as keyof typeof THEME_PRESETS;
  const themeConfig = THEME_PRESETS[template] || THEME_PRESETS.classic;
  
  // Extract new visual fields from order bump's theme_config
  const obThemeConfig = orderBump.theme_config || {};
  const appNameColor = obThemeConfig.appNameColor || "#ffffff";
  const appDescription = obThemeConfig.appDescription || "";
  const appDescriptionColor = obThemeConfig.appDescriptionColor || "#ffffff";
  const showAppIcon = obThemeConfig.showAppIcon ?? true;
  const showcaseTextPosition = obThemeConfig.showcaseTextPosition || "bottom";
  const membersHeaderSize = obThemeConfig.membersHeaderSize || "large";
  const shopRemoveCardBorder = obThemeConfig.shopRemoveCardBorder ?? false;
  const membersShowCardBorder = obThemeConfig.membersShowCardBorder ?? false;
  const flowShowCardBorder = obThemeConfig.flowShowCardBorder ?? false;

  // Video Course data
  const videoCourseEnabled = orderBump.video_course_enabled ?? false;
  const videoModules = orderBump.video_modules || [];
  const videoCourseTitle = obThemeConfig.videoCourseTitle || "Curso em Vídeo";
  const videoCourseDescription = obThemeConfig.videoCourseDescription || "";
  const videoCourseButtonText = obThemeConfig.videoCourseButtonText || "Assistir Aulas";
  const videoCourseImage = obThemeConfig.videoCourseImage || null;
  const videoCourseBackground = obThemeConfig.videoCourseBackground || null;

  // Collect bonuses
  const bonuses = [
    { url: orderBump.bonus1_url, label: orderBump.bonus1_label, thumbnail: orderBump.bonus1_thumbnail },
    { url: orderBump.bonus2_url, label: orderBump.bonus2_label, thumbnail: orderBump.bonus2_thumbnail },
    { url: orderBump.bonus3_url, label: orderBump.bonus3_label, thumbnail: orderBump.bonus3_thumbnail },
    { url: orderBump.bonus4_url, label: orderBump.bonus4_label, thumbnail: orderBump.bonus4_thumbnail },
    { url: orderBump.bonus5_url, label: orderBump.bonus5_label, thumbnail: orderBump.bonus5_thumbnail },
    { url: orderBump.bonus6_url, label: orderBump.bonus6_label, thumbnail: orderBump.bonus6_thumbnail },
    { url: orderBump.bonus7_url, label: orderBump.bonus7_label, thumbnail: orderBump.bonus7_thumbnail },
    { url: orderBump.bonus8_url, label: orderBump.bonus8_label, thumbnail: orderBump.bonus8_thumbnail },
    { url: orderBump.bonus9_url, label: orderBump.bonus9_label, thumbnail: orderBump.bonus9_thumbnail },
  ].filter(b => b.url);

  // All products for grid templates
  const allProducts = [
    { url: orderBump.produto_principal_url, label: orderBump.main_product_label || "Produto Principal", thumbnail: orderBump.main_product_thumbnail },
    ...bonuses,
  ].filter(p => p.url);

  const getContentType = (url: string): string => {
    const lower = url.toLowerCase();
    if (lower.includes(".pdf")) return "pdf";
    if (lower.includes(".mp4") || lower.includes(".webm") || lower.includes("youtube") || lower.includes("vimeo") || lower.includes("vturb")) return "video";
    if (lower.includes(".mp3") || lower.includes(".wav") || lower.includes(".ogg")) return "audio";
    return "link";
  };

  const handleOpenContent = (url: string, title: string) => {
    const type = getContentType(url);
    if (type === "pdf") {
      setPdfUrl(url);
      setPdfTitle(title);
    } else if (type === "video") {
      setVideoUrl(url);
      setVideoTitle(title);
    } else if (type === "audio") {
      setAudioUrl(url);
      setAudioTitle(title);
    } else {
      window.open(url, "_blank");
    }
  };


  const appName = orderBump.nome || orderBump.label;

  // Back button component
  const BackButton = ({ className = "" }: { className?: string }) => (
    <button
      onClick={onClose}
      className={`w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors ${className}`}
    >
      <ArrowLeft className="h-5 w-5 text-white" />
    </button>
  );

  // Video Course Block - shared across templates
  const renderVideoCourseBlock = (style: 'card' | 'button' = 'card') => {
    if (!videoCourseEnabled || videoModules.length === 0) return null;
    
    const textColor = isDark ? "#ffffff" : "#111827";
    const cardBg = isDark ? "#1f2937" : "#ffffff";
    const mutedColor = isDark ? "#9ca3af" : "#6b7280";

    if (style === 'button') {
      return (
        <button
          onClick={() => setIsModulesDialogOpen(true)}
          className="w-full rounded-xl p-4 text-left transition-all hover:scale-[1.02]"
          style={{ backgroundColor: cardBg }}
        >
          <div className="flex items-center space-x-3">
            {videoCourseImage && (
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                <img src={typeof videoCourseImage === 'string' ? videoCourseImage : videoCourseImage.url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm" style={{ color: textColor }}>{videoCourseTitle}</h4>
              {videoCourseDescription && (
                <p className="text-xs" style={{ color: mutedColor }}>{videoCourseDescription}</p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0" style={{ color: mutedColor }} />
          </div>
        </button>
      );
    }

    return (
      <div className="rounded-xl p-4" style={{ backgroundColor: cardBg }}>
        <div className="flex items-center space-x-3 mb-3">
          {videoCourseImage && (
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: `${primaryColor}20` }}>
              <img src={typeof videoCourseImage === 'string' ? videoCourseImage : videoCourseImage.url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm" style={{ color: textColor }}>{videoCourseTitle}</h4>
            {videoCourseDescription && (
              <p className="text-xs" style={{ color: mutedColor }}>{videoCourseDescription}</p>
            )}
          </div>
        </div>
        <Button
          className="w-full"
          style={{ backgroundColor: primaryColor, color: "white" }}
          onClick={() => setIsModulesDialogOpen(true)}
        >
          <Eye className="w-4 h-4 mr-1" />
          {videoCourseButtonText}
        </Button>
      </div>
    );
  };

  // Modules Dialog
  const renderModulesDialog = () => {
    if (!isModulesDialogOpen) return null;
    
    const bgColor = isDark ? "#111827" : "#f3f4f6";
    const textColor = isDark ? "#ffffff" : "#111827";
    const cardBg = isDark ? "#1f2937" : "#ffffff";
    const mutedColor = isDark ? "#9ca3af" : "#6b7280";

    return (
      <div className="fixed inset-0 z-[60] flex flex-col" style={{ backgroundColor: bgColor }}>
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <button
            onClick={() => setIsModulesDialogOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: textColor }} />
          </button>
          <h2 className="font-bold text-lg" style={{ color: textColor }}>{videoCourseTitle}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {videoModules.map((module: any) => (
            <div key={module.id} className="rounded-xl p-4" style={{ backgroundColor: cardBg }}>
              <h3 className="font-semibold text-sm mb-3" style={{ color: textColor }}>{module.title}</h3>
              <div className="space-y-2">
                {module.videos?.map((video: any, vi: number) => (
                  <button
                    key={video.id || vi}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:opacity-80 transition-opacity text-left"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                    onClick={() => {
                      if (video.youtubeUrl) {
                        setVideoUrl(video.youtubeUrl);
                        setVideoTitle(video.title || `Vídeo ${vi + 1}`);
                        setIsModulesDialogOpen(false);
                      }
                    }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}20` }}>
                      <Eye className="w-4 h-4" style={{ color: primaryColor }} />
                    </div>
                    <span className="text-sm flex-1" style={{ color: textColor }}>{video.title || `Vídeo ${vi + 1}`}</span>
                    <ChevronRight className="w-4 h-4" style={{ color: mutedColor }} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ===================== CLASSIC TEMPLATE =====================
  const renderClassicTemplate = () => {
    const bgColor = isDark ? "#111827" : "#f3f4f6";
    const cardBg = isDark ? "#1f2937" : "#ffffff";
    const bonusCardBg = isDark ? "rgba(31, 41, 55, 0.5)" : "#f9fafb";
    const textColor = isDark ? "#ffffff" : "#111827";
    const mutedColor = isDark ? "#9ca3af" : "#6b7280";
    const bonusTextColor = isDark ? "#d1d5db" : "#374151";
    const buttonBg = isDark ? "rgba(255, 255, 255, 0.2)" : "#e5e7eb";
    const buttonText = isDark ? "white" : "#374151";

    return (
      <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
        {/* Header */}
        <div className="px-4 pt-4">
          <div
            className="h-32 relative rounded-2xl overflow-hidden"
            style={{
              background: orderBump.capa_url
                ? `url(${orderBump.capa_url}) center/cover`
                : `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}20)`,
            }}
          >
            {!orderBump.capa_url && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-16 h-16 opacity-20" style={{ color: "#A3C1FB" }} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/30"></div>
            <BackButton className="absolute top-3 left-3 z-10" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center space-x-3">
              {showAppIcon && (
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden border-2 border-black shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  {orderBump.icone_url ? (
                    <img src={orderBump.icone_url} alt="Icon" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 opacity-50" style={{ color: "#A3C1FB" }} />
                  )}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg" style={{ color: appNameColor }}>{appName}</h3>
                {appDescription && (
                  <ExpandableDescription
                    text={appDescription}
                    color={appDescriptionColor}
                    maxLength={50}
                    title={appName}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4">
          {renderVideoCourseBlock()}
          {orderBump.produto_principal_url && (
            <div className="rounded-xl p-4" style={{ backgroundColor: cardBg }}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden" style={{ backgroundColor: `${primaryColor}20` }}>
                  {orderBump.main_product_thumbnail ? (
                    <img src={orderBump.main_product_thumbnail} alt="Product thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 opacity-30" style={{ color: "#A3C1FB" }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm" style={{ color: textColor }}>{orderBump.main_product_label || "Produto Principal"}</h4>
                  {orderBump.main_product_description && (
                    <ExpandableDescription text={orderBump.main_product_description} color={mutedColor} maxLength={50} className="text-xs" title="" />
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                <Button className="flex-1" style={{ backgroundColor: primaryColor, color: "white" }} onClick={() => handleOpenContent(orderBump.produto_principal_url!, orderBump.main_product_label || "")}>
                  <Eye className="w-4 h-4 mr-1" />
                  {orderBump.view_button_label || "Ver"}
                </Button>
                {orderBump.allow_pdf_download && (
                  <Button size="sm" variant="ghost" style={{ backgroundColor: buttonBg, color: buttonText }} onClick={() => { const a = document.createElement('a'); a.href = orderBump.produto_principal_url!; a.download = ''; a.target = '_blank'; a.click(); }}>
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {bonuses.length > 0 && (
            <div className="space-y-2">
              {orderBump.bonuses_label && <h5 className="font-medium text-sm" style={{ color: textColor }}>{orderBump.bonuses_label}</h5>}
              {bonuses.map((bonus, i) => (
                <div key={i} className="rounded-lg p-3 flex items-center justify-between" style={{ backgroundColor: bonusCardBg }}>
                  <div className="flex items-center space-x-2 min-w-0 mr-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 overflow-hidden" style={{ backgroundColor: `${primaryColor}20` }}>
                      {bonus.thumbnail ? (
                        <img src={bonus.thumbnail} alt={`${bonus.label} thumbnail`} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-3 h-3 opacity-30" style={{ color: "#A3C1FB" }} />
                      )}
                    </div>
                    <span className="text-sm" style={{ color: bonusTextColor }}>{bonus.label || `Bônus ${i + 1}`}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" style={{ backgroundColor: buttonBg, color: buttonText }} onClick={() => handleOpenContent(bonus.url!, bonus.label || "")}>
                      <Eye className="w-3 h-3 mr-1" />{orderBump.view_button_label || "Ver"}
                    </Button>
                    {orderBump.allow_pdf_download && (
                      <Button size="sm" variant="ghost" style={{ backgroundColor: buttonBg, color: buttonText }} className="px-2" onClick={() => { const a = document.createElement('a'); a.href = bonus.url!; a.download = ''; a.target = '_blank'; a.click(); }}>
                        <Download className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===================== SHOWCASE TEMPLATE =====================
  const renderShowcaseTemplate = () => {
    const textColor = isDark ? "#ffffff" : "#111827";

    return (
      <div className="min-h-screen" style={{ backgroundColor: isDark ? "#0f0f23" : "#ffffff" }}>
        <BackButton className="absolute top-4 left-4 z-20" />
        
        {/* Full Cover Header - matching ThemeRenderer */}
        <div
          className="h-40 relative"
          style={{
            background: orderBump.capa_url
              ? `url(${orderBump.capa_url}) center/cover`
              : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}88)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>

          {/* Centered App Info */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 text-center ${
              showcaseTextPosition === "top"
                ? "top-12"
                : showcaseTextPosition === "middle"
                  ? "top-[58%] -translate-y-1/2"
                  : "bottom-4"
            }`}
          >
            {showAppIcon && (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl overflow-hidden border-2 border-white/20 mx-auto mb-2"
                style={{ backgroundColor: primaryColor }}
              >
                {orderBump.icone_url ? (
                  <img src={orderBump.icone_url} alt="App Icon" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6" style={{ color: "#A3C1FB" }} />
                )}
              </div>
            )}
            <h3 className="font-bold text-lg" style={{ color: appNameColor }}>{appName}</h3>
            {appDescription && (
              <ExpandableDescription
                text={appDescription}
                color={appDescriptionColor}
                maxLength={50}
                title={appName}
              />
            )}
          </div>
        </div>

        {/* Content Cards - with gradient background matching ThemeRenderer */}
        <div
          className="flex-1 p-4 space-y-4"
          style={{
            background: isDark
              ? "linear-gradient(to bottom, rgba(88, 28, 135, 0.2), #000000)"
              : "linear-gradient(to bottom, #f3f4f6, #e5e7eb)",
          }}
        >
          {/* Featured Product - Large Visual Card */}
          {orderBump.produto_principal_url && (
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-6 text-center relative overflow-hidden">
              {obThemeConfig.mainProductBackground && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${obThemeConfig.mainProductBackground})`,
                    opacity: isDark ? 0.3 : 0.5,
                  }}
                />
              )}
              <div className="relative z-10">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden mx-auto mb-3"
                  style={{ backgroundColor: primaryColor }}
                >
                  {orderBump.main_product_thumbnail ? (
                    <img src={orderBump.main_product_thumbnail} alt="Product thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-12 h-12 opacity-50" style={{ color: "#A3C1FB" }} />
                  )}
                </div>
                <h4 className="font-bold text-sm mb-1" style={{ color: textColor }}>
                  {orderBump.main_product_label || "Produto Principal"}
                </h4>
                {orderBump.main_product_description && (
                  <div className="mb-3">
                    <ExpandableDescription
                      text={orderBump.main_product_description}
                      color={isDark ? "rgba(255, 255, 255, 0.7)" : "#6b7280"}
                      maxLength={50}
                      className="text-xs"
                      title={orderBump.main_product_label || ""}
                    />
                  </div>
                )}
                <div className="flex space-x-2 justify-center">
                  <button
                    className="px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                      boxShadow: `0 4px 15px ${primaryColor}30`,
                    }}
                    onClick={() => handleOpenContent(orderBump.produto_principal_url!, orderBump.main_product_label || "")}
                  >
                    {orderBump.view_button_label || "Ver"}
                  </button>
                  {orderBump.allow_pdf_download && (
                    <button
                      className="px-3 py-2 rounded-xl text-white text-sm font-bold shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                        boxShadow: `0 4px 15px ${primaryColor}30`,
                      }}
                      onClick={() => { const a = document.createElement('a'); a.href = orderBump.produto_principal_url!; a.download = ''; a.target = '_blank'; a.click(); }}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bonus Showcase */}
          {bonuses.length > 0 && (
            <div className="space-y-3">
              {orderBump.bonuses_label && (
                <h5 className="font-bold text-sm text-center" style={{ color: textColor }}>
                  {orderBump.bonuses_label}
                </h5>
              )}
              {bonuses.map((bonus, i) => (
                <div key={i} className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 border border-purple-400/20 rounded-xl p-3 relative overflow-hidden">
                  {obThemeConfig[`bonus${i + 1}Background`] && (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${obThemeConfig[`bonus${i + 1}Background`]})`,
                        opacity: isDark ? 0.3 : 0.5,
                      }}
                    />
                  )}
                  <div className="flex items-center space-x-3 relative z-10">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: `${primaryColor}40` }}
                    >
                      {bonus.thumbnail ? (
                        <img src={bonus.thumbnail} alt={`${bonus.label} thumbnail`} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 opacity-30" style={{ color: "#A3C1FB" }} />
                      )}
                    </div>
                    <div className="flex-1 flex items-center">
                      <span className="font-medium text-sm block" style={{ color: textColor }}>
                        {bonus.label || `Bônus ${i + 1}`}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="hover:opacity-70 transition-opacity"
                        style={{ color: primaryColor }}
                        onClick={() => handleOpenContent(bonus.url!, bonus.label || "")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {orderBump.allow_pdf_download && (
                        <button
                          className="hover:opacity-70 transition-opacity"
                          style={{ color: primaryColor }}
                          onClick={() => { const a = document.createElement('a'); a.href = bonus.url!; a.download = ''; a.target = '_blank'; a.click(); }}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===================== MODERN TEMPLATE =====================
  const renderModernTemplate = () => {
    const bgColor = isDark ? themeConfig.colors.background : "#ffffff";
    const textColor = isDark ? "#f1f5f9" : "#111827";
    const mutedColor = isDark ? "#64748b" : "#6b7280";
    const cardBg = isDark ? "rgba(17, 24, 39, 0.5)" : "rgba(243, 244, 246, 0.5)";
    const cardBorder = isDark ? "#1f2937" : "#e5e7eb";
    const bonusCardBg = isDark ? "rgba(17, 24, 39, 0.3)" : "rgba(243, 244, 246, 0.3)";

    return (
      <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
        <BackButton className="absolute top-4 left-4 z-20" />
        
        {/* Header - centered icon, name, description */}
        <div className="relative px-6 pt-16 pb-8 text-center border-b overflow-hidden" style={{ borderColor: cardBorder }}>
          {orderBump.capa_url && (
            <>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${orderBump.capa_url})` }} />
              <div className="absolute inset-0" style={{ background: isDark ? "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7))" : "linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.85))" }} />
            </>
          )}
          <div className="relative z-10">
            {showAppIcon && (
              <div className="w-20 h-20 rounded-2xl mx-auto mb-4 overflow-hidden" style={{ backgroundColor: primaryColor }}>
                {orderBump.icone_url ? <img src={orderBump.icone_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 m-auto mt-5" style={{ color: "#A3C1FB" }} />}
              </div>
            )}
            <h1 className="text-2xl font-light mb-2" style={{ color: appNameColor }}>{appName}</h1>
            {appDescription && (
              <p className="text-sm" style={{ color: appDescriptionColor }}>{appDescription}</p>
            )}
          </div>
        </div>

        {/* Products - horizontal card layout matching ThemeRenderer */}
        <div className="px-4 py-8 space-y-4">
          {orderBump.produto_principal_url && (
            <div
              className="backdrop-blur-sm border rounded-2xl overflow-hidden hover:opacity-90"
              style={{ backgroundColor: cardBg, borderColor: cardBorder, transition: "opacity 0.3s" }}
            >
              <div className="flex items-center p-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mr-3 overflow-hidden" style={{ backgroundColor: `${primaryColor}20` }}>
                  {orderBump.main_product_thumbnail ? (
                    <img src={orderBump.main_product_thumbnail} alt="Product thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 opacity-50" style={{ color: "#A3C1FB" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="font-medium text-sm mb-0.5 break-words" style={{ color: textColor }}>
                    {orderBump.main_product_label || "Produto Principal"}
                  </h3>
                  {orderBump.main_product_description && (
                    <p className="text-xs break-words" style={{ color: mutedColor }}>
                      {orderBump.main_product_description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    className="p-2 transition-all duration-200 hover:scale-110"
                    style={{ color: primaryColor }}
                    onClick={() => handleOpenContent(orderBump.produto_principal_url!, orderBump.main_product_label || "")}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {orderBump.allow_pdf_download && (
                    <button
                      className="p-2 transition-all duration-200 hover:scale-110"
                      style={{ color: mutedColor }}
                      onClick={() => { const a = document.createElement('a'); a.href = orderBump.produto_principal_url!; a.download = ''; a.target = '_blank'; a.click(); }}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {bonuses.length > 0 && (
            <div className="space-y-3">
              {orderBump.bonuses_label && (
                <h4 className="font-light text-base px-1" style={{ color: textColor }}>{orderBump.bonuses_label}</h4>
              )}
              <div className="space-y-3">
                {bonuses.map((bonus, i) => (
                  <div
                    key={i}
                    className="border rounded-2xl overflow-hidden hover:opacity-90"
                    style={{ backgroundColor: bonusCardBg, borderColor: cardBorder, transition: "opacity 0.3s" }}
                  >
                    <div className="flex items-center p-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mr-3 overflow-hidden" style={{ backgroundColor: `${primaryColor}15` }}>
                        {bonus.thumbnail ? (
                          <img src={bonus.thumbnail} alt={`${bonus.label} thumbnail`} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 opacity-30" style={{ color: "#A3C1FB" }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 mr-2">
                        <span className="font-medium text-sm block break-words" style={{ color: isDark ? "#d1d5db" : "#111827" }}>
                          {bonus.label || `Bônus ${i + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          className="p-2 transition-all duration-200 hover:scale-110"
                          style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                          onClick={() => handleOpenContent(bonus.url!, bonus.label || "")}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {orderBump.allow_pdf_download && (
                          <button
                            className="p-2 transition-all duration-200 hover:scale-110"
                            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                            onClick={() => { const a = document.createElement('a'); a.href = bonus.url!; a.download = ''; a.target = '_blank'; a.click(); }}
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
      </div>
    );
  };

  // ===================== UNITS TEMPLATE =====================
  const renderUnitsTemplate = () => {
    const bgColor = isDark ? "#1a1625" : "#E8E3F0";
    const cardBg = isDark ? "rgba(45, 36, 56, 0.8)" : "rgba(255, 255, 255, 0.9)";
    const cardTextColor = isDark ? "#FFFFFF" : "#1F2937";

    return (
      <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
        {/* Header */}
        <div className="rounded-br-[32px] overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)` }}>
          {orderBump.capa_url && (
            <>
              <img src={orderBump.capa_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 0%, ${primaryColor}dd 100%)` }} />
            </>
          )}
          <BackButton className="absolute top-4 left-4 z-20" />
          <div className="px-6 pt-16 pb-8 relative z-10">
            <h1 className="text-2xl font-bold" style={{ color: appNameColor }}>{appName}</h1>
            {appDescription && (
              <p className="text-sm mt-1" style={{ color: appDescriptionColor }}>{appDescription}</p>
            )}
          </div>
        </div>

        {/* Products List */}
        <div className="px-4 pt-6 pb-6 space-y-3">
          {allProducts.map((product, i) => (
            <button
              key={i}
              onClick={() => handleOpenContent(product.url!, product.label || "")}
              className="w-full p-4 rounded-2xl flex items-center justify-between transition-all hover:shadow-lg hover:scale-[1.02]"
              style={{ backgroundColor: cardBg, backdropFilter: "blur(10px)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)` }}>
                  {(i === 0 ? orderBump.main_product_thumbnail : (bonuses[i - 1]?.thumbnail)) ? (
                    <img src={(i === 0 ? orderBump.main_product_thumbnail : bonuses[i - 1]?.thumbnail)!} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 opacity-50" style={{ color: "#A3C1FB" }} />
                  )}
                </div>
                <span className="font-medium text-base text-left" style={{ color: cardTextColor }}>{product.label || `Item ${i + 1}`}</span>
              </div>
              <div className="flex items-center gap-1">
                {orderBump.allow_pdf_download && (
                  <button
                    className="p-1"
                    style={{ color: primaryColor }}
                    onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = product.url!; a.download = ''; a.target = '_blank'; a.click(); }}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <ChevronRight className="w-5 h-5" style={{ color: cardTextColor, opacity: 0.5 }} />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ===================== MEMBERS TEMPLATE =====================
  const renderMembersTemplate = () => {
    const bgColor = isDark ? "#1a1625" : "#f8f9fa";
    const textColor = isDark ? "#ffffff" : "#1e293b";

    // Apply membersHeaderSize
    const headerHeights: Record<string, string> = { small: "240px", medium: "300px", large: "340px" };
    const headerHeight = headerHeights[membersHeaderSize] || "340px";

    return (
      <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
        <BackButton className="absolute top-4 left-4 z-20" />
        
        {/* Header with configurable height - matching ThemeRenderer Members */}
        <div
          className="w-full relative"
          style={{
            height: headerHeight,
            backgroundImage: orderBump.capa_url ? `url(${orderBump.capa_url})` : undefined,
            backgroundColor: orderBump.capa_url ? undefined : "#7c3aed",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!orderBump.capa_url && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600" />
          )}
          {/* Gradient overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: isDark 
                ? "linear-gradient(to top, rgba(26, 22, 37, 1) 0%, rgba(26, 22, 37, 0.7) 50%, transparent 100%)"
                : "linear-gradient(to top, rgba(248, 249, 250, 1) 0%, rgba(248, 249, 250, 0.7) 50%, transparent 100%)"
            }}
          />

          {/* Centered text over image */}
          <div className="absolute inset-0 flex flex-col items-center justify-end text-center pb-8 px-5">
            {showAppIcon && orderBump.icone_url && (
              <div
                className="w-14 h-14 rounded-full overflow-hidden mb-3 border-2 border-white/30 shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <img src={orderBump.icone_url} alt="App Icon" className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="text-3xl font-bold mb-2" style={{ color: appNameColor }}>{appName}</h1>
            {appDescription && (
              <div className="max-w-[260px]">
                <ExpandableDescription
                  text={appDescription}
                  color={appDescriptionColor}
                  maxLength={50}
                  title={appName}
                />
              </div>
            )}
          </div>
        </div>

        {/* Grid of Cards - 2 columns matching ThemeRenderer Members */}
        <div className="px-5 py-6">
          <div className="w-full grid grid-cols-2 gap-2.5">
            {allProducts.map((product, i) => (
              <button
                key={i}
                onClick={() => handleOpenContent(product.url!, product.label || "")}
                className={`aspect-[4/5] rounded-xl overflow-hidden backdrop-blur-sm hover:scale-[1.02] transition-transform relative ${membersShowCardBorder ? 'border-2' : ''}`}
                style={{
                  backgroundImage: (i === 0 ? orderBump.main_product_thumbnail : bonuses[i - 1]?.thumbnail) ? `url(${i === 0 ? orderBump.main_product_thumbnail : bonuses[i - 1]?.thumbnail})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: (i === 0 ? orderBump.main_product_thumbnail : bonuses[i - 1]?.thumbnail) ? undefined : (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(124, 58, 237, 0.1)"),
                  borderColor: membersShowCardBorder ? (primaryColor || '#4783F6') : undefined,
                }}
              >
                {/* Download button */}
                {orderBump.allow_pdf_download && product.url && (
                  <div
                    className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors"
                    onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = product.url!; a.download = ''; a.target = '_blank'; a.click(); }}
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                {!(i === 0 ? orderBump.main_product_thumbnail : bonuses[i - 1]?.thumbnail) && (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: isDark 
                        ? "linear-gradient(to bottom right, rgba(124, 58, 237, 0.6), rgba(236, 72, 153, 0.6))"
                        : "linear-gradient(to bottom right, rgba(124, 58, 237, 0.3), rgba(236, 72, 153, 0.3))"
                    }}
                  >
                    <ImageIcon className="w-16 h-16" style={{ color: "#A3C1FB", opacity: 0.3 }} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center p-2.5">
                  <span className="text-sm font-medium text-white text-center">{product.label || `Item ${i + 1}`}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ===================== FLOW TEMPLATE =====================
  const renderFlowTemplate = () => {
    const bgColor = isDark ? "#0f0a1f" : "#f5f3ff";
    const textColor = isDark ? "#ffffff" : "#1f2937";
    const subtitleColor = isDark ? "#c4b5fd" : "#6b7280";

    return (
      <div className="min-h-screen relative overflow-hidden pb-6" style={{ backgroundColor: bgColor }}>
        {/* Background */}
        <div
          className="absolute top-0 left-0 right-0 h-[45%]"
          style={{
            backgroundImage: orderBump.capa_url ? `url(${orderBump.capa_url})` : isDark ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)" : "linear-gradient(135deg, #a78bfa 0%, #c4b5fd 50%, #f5d0fe 100%)",
            backgroundSize: "cover", backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0" style={{ background: isDark ? "linear-gradient(to top, #0f0a1f 0%, rgba(15, 10, 31, 0.85) 40%, transparent 100%)" : "linear-gradient(to top, #f5f3ff 0%, rgba(245, 243, 255, 0.85) 40%, transparent 100%)" }} />
        </div>

        <div className="relative h-full flex flex-col px-5 pt-6">
          <BackButton />

          {/* Logo/Icon */}
          {showAppIcon && orderBump.icone_url && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                <img src={orderBump.icone_url} alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Title and Description */}
          <div className="mb-3">
            <h1 className="text-2xl font-bold mb-1" style={{ color: appNameColor }}>{appName}</h1>
            {appDescription && (
              <ExpandableDescription
                text={appDescription}
                color={appDescriptionColor || subtitleColor}
                maxLength={50}
                title={appName}
              />
            )}
          </div>

          {/* Products Grid - 2 columns matching ThemeRenderer */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-2 gap-3 pb-6">
              {allProducts.map((product, i) => (
                <button
                  key={i}
                  onClick={() => handleOpenContent(product.url!, product.label || "")}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden outline-none focus:outline-none ${flowShowCardBorder ? 'border-2' : ''}`}
                  style={{
                    backgroundImage: (i === 0 ? orderBump.main_product_thumbnail : bonuses[i - 1]?.thumbnail)
                      ? `url(${i === 0 ? orderBump.main_product_thumbnail : bonuses[i - 1]?.thumbnail})`
                      : isDark
                        ? "linear-gradient(135deg, rgba(124, 58, 237, 0.4) 0%, rgba(168, 85, 247, 0.4) 100%)"
                        : "linear-gradient(135deg, rgba(167, 139, 250, 0.3) 0%, rgba(196, 181, 253, 0.3) 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderColor: flowShowCardBorder ? (primaryColor || '#4783F6') : undefined,
                  }}
                >
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: isDark
                        ? "linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%)"
                        : "linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%)",
                    }}
                  />

                  {/* Card title */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-sm font-semibold text-white leading-tight">{product.label || `Item ${i + 1}`}</h3>
                  </div>

                  {/* Icons */}
                  <div className="absolute top-3 right-3 flex gap-1">
                    {orderBump.allow_pdf_download && (
                      <div
                        className="w-6 h-6 rounded-full backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
                        style={{ backgroundColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)" }}
                        onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = product.url!; a.download = ''; a.target = '_blank'; a.click(); }}
                      >
                        <Download className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div
                      className="w-6 h-6 rounded-full backdrop-blur-sm flex items-center justify-center"
                      style={{ backgroundColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)" }}
                    >
                      <Eye className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===================== SHOP TEMPLATE =====================
  const renderShopTemplate = () => {
    const bgColor = isDark ? "#000000" : "#f5f5f5";
    const textColor = isDark ? "#ffffff" : "#1f2937";
    const productTitleColor = isDark ? "#ffffff" : "#111827";

    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: bgColor }}>
        <BackButton className="absolute top-4 left-4 z-20" />

        {/* Header com imagem de capa */}
        <div
          className="relative h-[30%] min-h-[180px] flex flex-col items-center justify-center"
          style={{
            backgroundImage: orderBump.capa_url ? `url(${orderBump.capa_url})` : "none",
            backgroundColor: orderBump.capa_url ? "transparent" : (primaryColor || "#10b981"),
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Placeholder quando não há imagem de capa */}
          {!orderBump.capa_url && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="w-24 h-24" style={{ color: "#A3C1FB", opacity: 0.5 }} />
            </div>
          )}

          {/* Overlay escuro para melhor legibilidade */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Conteúdo do header */}
          <div className="relative z-10 text-center px-5">
            <h1 className="text-2xl font-bold mb-2" style={{ color: appNameColor }}>{appName}</h1>
            {appDescription && (
              <ExpandableDescription
                text={appDescription}
                color={appDescriptionColor}
                maxLength={50}
                className="text-center"
                title={appName}
              />
            )}
          </div>
        </div>

        {/* Seção de produtos */}
        <div className="flex-1 px-5 pt-6 pb-6 overflow-auto" style={{ backgroundColor: bgColor }}>
          <div className="grid grid-cols-2 gap-3 auto-rows-min pb-4">
            {allProducts.map((product, index) => (
              <div key={index} className="flex flex-col gap-1">
                {/* Título do produto acima do card */}
                <h3
                  className="text-sm font-semibold leading-tight line-clamp-2 text-center min-h-[2.5rem] flex items-center justify-center"
                  style={{ color: productTitleColor }}
                >
                  {product.label || `Item ${index + 1}`}
                </h3>

                <button
                  onClick={() => handleOpenContent(product.url!, product.label || "")}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden hover:scale-[1.02] transition-transform ${shopRemoveCardBorder ? "" : "border-2"}`}
                  style={{
                    backgroundImage: (product as any).thumbnail
                      ? `url(${(product as any).thumbnail})`
                      : "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderColor: shopRemoveCardBorder ? "transparent" : (primaryColor || "#10b981"),
                  }}
                >
                  {/* Placeholder quando não há imagem */}
                  {!(product as any).thumbnail && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-16 h-16" style={{ color: "#A3C1FB", opacity: 0.3 }} />
                    </div>
                  )}

                  {/* Overlay escuro */}
                  <div className="absolute inset-0 bg-black/40" />

                  {/* Ícone de download */}
                  {orderBump.allow_pdf_download && product.url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(product.url!, '_blank');
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
      </div>
    );
  };

  // ===================== ACADEMY TEMPLATE =====================
  const renderAcademyTemplate = () => {
    const bgColor = isDark ? "#000000" : "#ffffff";
    const textColor = isDark ? "#ffffff" : "#000000";
    const descColor = isDark ? "#d1d5db" : "#4b5563";

    // Carousel covers from theme_config
    const carouselCovers = [
      obThemeConfig.training1Cover,
      obThemeConfig.training2Cover,
      obThemeConfig.training3Cover,
      obThemeConfig.training4Cover,
    ].filter(Boolean);

    return (
      <div className="min-h-screen overflow-auto" style={{ backgroundColor: bgColor }}>
        <BackButton className="absolute top-4 left-4 z-20" />

        {/* App Icon/Logo - respects showAppIcon setting */}
        {showAppIcon && (
          <div className="px-5 pt-14 pb-2">
            {orderBump.icone_url ? (
              <img src={orderBump.icone_url} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <div className="flex items-center justify-start">
                <ImageIcon className="h-10 w-10" style={{ color: "#687B9F" }} />
              </div>
            )}
          </div>
        )}

        {/* Carousel section */}
        {carouselCovers.length > 0 && (
          <div className="px-5 pb-4">
            <div className="relative">
              <div
                ref={carouselRef}
                className="overflow-x-auto scrollbar-hide"
                style={{ scrollSnapType: 'x mandatory' }}
                onScroll={(e) => {
                  if (isScrollingProgrammatically.current) return;
                  const scrollLeft = e.currentTarget.scrollLeft;
                  const width = e.currentTarget.offsetWidth;
                  const newSlide = Math.round(scrollLeft / width);
                  if (newSlide !== currentSlide && newSlide >= 0 && newSlide < carouselCovers.length) {
                    setCurrentSlide(newSlide);
                  }
                }}
              >
                <div className="flex">
                  {carouselCovers.map((cover, index) => (
                    <div key={index} className="w-full flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
                      <div
                        className="w-full relative aspect-[16/10] rounded overflow-hidden"
                        style={{
                          backgroundImage: `url(${cover})`,
                          backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {carouselCovers.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {carouselCovers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentSlide(index);
                        if (carouselRef.current) {
                          carouselRef.current.scrollTo({
                            left: index * carouselRef.current.offsetWidth,
                            behavior: 'smooth',
                          });
                        }
                      }}
                      className="w-2 h-2 rounded-full transition-all"
                      style={{
                        backgroundColor: currentSlide === index
                          ? (isDark ? "#ffffff" : "#000000")
                          : (isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"),
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
            style={{ color: appNameColor }}
          >
            {appName}
          </h2>
          {appDescription && (
            <div className="mb-4">
              <ExpandableDescription
                text={appDescription}
                color={appDescriptionColor || descColor}
                maxLength={50}
                title={appName}
              />
            </div>
          )}
          {!appDescription && <div className="mb-4" />}

          {/* Grid 2 colunas */}
          <div className="grid grid-cols-2 gap-3">
            {allProducts.map((product, index) => (
              <button
                key={index}
                onClick={() => handleOpenContent(product.url!, product.label || "")}
                className="relative aspect-[3/4] rounded overflow-hidden hover:scale-[1.02] transition-transform"
                style={{
                  backgroundImage: (product as any).thumbnail
                    ? `url(${(product as any).thumbnail})`
                    : "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Placeholder quando não há thumbnail */}
                {!(product as any).thumbnail && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16" style={{ color: "#A3C1FB" }} />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Download button */}
                {orderBump.allow_pdf_download && product.url && (
                  <div
                    className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors"
                    onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = product.url!; a.download = ''; a.target = '_blank'; a.click(); }}
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                {/* Texto na parte inferior */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3
                    className="text-lg font-bold leading-tight break-words"
                    style={{ color: primaryColor || "#ef4444" }}
                  >
                    {product.label || `Item ${index + 1}`}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ===================== CORPORATE TEMPLATE =====================
  const renderCorporateTemplate = () => {
    const bgColor = isDark ? "#1f2937" : "#e5e7eb";
    const navBg = isDark ? "#1f2937" : "#ffffff";
    const cardBg = isDark ? "#111827" : "#ffffff";
    const textColor = isDark ? "#ffffff" : "#111827";
    const mutedColor = isDark ? "#9ca3af" : "#6b7280";
    const borderColor = isDark ? "#374151" : "#d1d5db";

    return (
      <div className="min-h-full" style={{ backgroundColor: bgColor }}>
        {/* Top Navigation Bar */}
        <div
          className="border-b px-4 py-3"
          style={{ backgroundColor: navBg, borderColor }}
        >
          <div className="flex items-center space-x-3">
            <BackButton className="!bg-transparent !w-auto !h-auto" />
            {showAppIcon && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {orderBump.icone_url ? (
                  <img src={orderBump.icone_url} alt="Icon" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-4 h-4" style={{ color: "#A3C1FB" }} />
                )}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm break-words leading-tight" style={{ color: appNameColor }}>
                {appName}
              </h3>
              {appDescription && (
                <p className="text-xs break-words" style={{ color: appDescriptionColor }}>{appDescription}</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="px-6 pt-6 pb-2 max-w-4xl mx-auto">
          {/* Main Product Card - Centralized and Enhanced */}
          {orderBump.produto_principal_url && (
            <div
              className="border rounded-lg p-6 mb-6 shadow-lg relative overflow-hidden"
              style={{ backgroundColor: cardBg, borderColor }}
            >
              {orderBump.theme_config?.mainProductBackground ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${orderBump.theme_config.mainProductBackground})`,
                    opacity: isDark ? 0.15 : 0.35,
                  }}
                />
              ) : null}
              <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  {orderBump.main_product_thumbnail ? (
                    <img src={orderBump.main_product_thumbnail} alt="Product" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-10 h-10 opacity-50" style={{ color: "#A3C1FB" }} />
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-lg" style={{ color: textColor }}>
                    {orderBump.main_product_label || "Produto Principal"}
                  </h4>
                  {orderBump.main_product_description && (
                    <ExpandableDescription
                      text={orderBump.main_product_description}
                      color={mutedColor}
                      maxLength={50}
                      title={orderBump.main_product_label || ""}
                    />
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    className="px-6 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 shadow-md"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => handleOpenContent(orderBump.produto_principal_url!, orderBump.main_product_label || "")}
                  >
                    {orderBump.view_button_label || "Ver"}
                  </button>
                  {orderBump.allow_pdf_download && (
                    <button
                      className="px-3 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 shadow-md"
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => { const a = document.createElement('a'); a.href = orderBump.produto_principal_url!; a.download = ''; a.target = '_blank'; a.click(); }}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bonus Section Label */}
          {bonuses.length > 0 && orderBump.bonuses_label && (
            <div className="text-center mb-4">
              <h5 className="font-bold text-lg mb-2" style={{ color: isDark ? "#e5e7eb" : textColor }}>
                {orderBump.bonuses_label}
              </h5>
              <div className="w-16 h-0.5 mx-auto" style={{ backgroundColor: isDark ? "#4b5563" : "#d1d5db" }}></div>
            </div>
          )}

          {/* Bonus Cards Grid - Matching ThemeRenderer corporate layout */}
          <div className="grid grid-cols-1 gap-4">
            {bonuses.map((bonus, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 shadow-md relative overflow-hidden"
                style={{ backgroundColor: cardBg, borderColor }}
              >
                {orderBump.theme_config?.[`bonus${i + 1}Background`] ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${orderBump.theme_config[`bonus${i + 1}Background`]})`,
                      opacity: isDark ? 0.15 : 0.35,
                    }}
                  />
                ) : null}
                <div className="flex flex-col items-center text-center space-y-3 relative z-10">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden shadow-sm"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    {bonus.thumbnail ? (
                      <img src={bonus.thumbnail} alt={bonus.label || ''} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 opacity-30" style={{ color: "#A3C1FB" }} />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium block" style={{ color: isDark ? "#e5e7eb" : textColor }}>
                      {bonus.label || `Bônus ${i + 1}`}
                    </span>
                  </div>
                  <div className="flex space-x-2 w-full justify-center">
                    <button
                      className="text-sm px-6 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90 shadow-md"
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => handleOpenContent(bonus.url!, bonus.label || "")}
                    >
                      {orderBump.view_button_label || "Ver"}
                    </button>
                    {orderBump.allow_pdf_download && (
                      <button
                        className="text-sm px-3 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90 shadow-md"
                        style={{ backgroundColor: primaryColor }}
                        onClick={() => { const a = document.createElement('a'); a.href = bonus.url!; a.download = ''; a.target = '_blank'; a.click(); }}
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
      </div>
    );
  };

  // Minimal uses classic style
  const renderMinimalTemplate = renderClassicTemplate;

  // ===================== EXCLUSIVE TEMPLATE =====================
  const renderExclusiveTemplate = () => {
    const bgColor = isDark ? "#0f172a" : "#ffffff";
    const textColor = isDark ? "#f8fafc" : "#1e293b";
    const defaultBonusColors = [
      "#3b82f6", "#10b981", "#f97316", "#f59e0b", "#14b8a6",
      "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
    ];
    const getBonusColor = (i: number) => obThemeConfig[`bonus${i + 1}Color`] || defaultBonusColors[i % defaultBonusColors.length];

    return (
      <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
        <BackButton className="absolute top-4 left-4 z-20" />

        {/* Header Section */}
        <div className="px-6 pt-16 pb-6 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: appNameColor }}>{appName}</h1>
          {appDescription && <p className="text-base" style={{ color: appDescriptionColor }}>{appDescription}</p>}
        </div>

        {/* Main Product */}
        {orderBump.produto_principal_url && (
          <div className="px-6 mb-4">
            <div
              className="rounded-2xl p-6 pr-12 flex items-center justify-between shadow-lg relative overflow-visible cursor-pointer hover:scale-[1.02] transition-transform"
              style={{ backgroundColor: primaryColor, minHeight: "120px" }}
              onClick={() => handleOpenContent(orderBump.produto_principal_url!, orderBump.main_product_label || "")}
            >
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-white text-xl font-semibold mb-1">{orderBump.main_product_label || "Produto Principal"}</h3>
                  {orderBump.allow_pdf_download && (
                    <button
                      onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = orderBump.produto_principal_url!; a.download = ''; a.target = '_blank'; a.click(); }}
                      className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
                {orderBump.main_product_description && (
                  <ExpandableDescription text={orderBump.main_product_description} color="rgba(255, 255, 255, 0.9)" maxLength={50} title={orderBump.main_product_label || ""} />
                )}
              </div>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden" style={{ border: "3px solid #ffffff" }}>
                {orderBump.main_product_thumbnail ? (
                  <img src={orderBump.main_product_thumbnail} alt="Product" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-10 h-10" style={{ color: "#A3C1FB" }} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bonuses Label */}
        {bonuses.length > 0 && orderBump.bonuses_label && (
          <div className="px-6 mt-6 mb-3">
            <h2 className="text-lg font-semibold" style={{ color: textColor }}>{orderBump.bonuses_label}</h2>
          </div>
        )}

        {/* Bonuses */}
        <div className="px-6 pb-6 space-y-3">
          {bonuses.map((bonus, i) => (
            <div key={i} className="relative">
              <div
                className="relative rounded-xl flex items-center shadow-md cursor-pointer hover:scale-[1.02] transition-transform overflow-visible"
                style={{
                  backgroundColor: getBonusColor(i),
                  minHeight: "60px",
                  paddingLeft: "16px",
                  paddingRight: "70px",
                  paddingTop: "12px",
                  paddingBottom: "12px",
                }}
                onClick={() => handleOpenContent(bonus.url!, bonus.label || "")}
              >
                <div className="flex-1 flex items-center gap-2">
                  <h3 className="text-white text-base font-semibold">{bonus.label || `Bônus ${i + 1}`}</h3>
                  {orderBump.allow_pdf_download && (
                    <button
                      onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = bonus.url!; a.download = ''; a.target = '_blank'; a.click(); }}
                      className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                      <Download className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden" style={{ border: "3px solid #ffffff" }}>
                  {bonus.thumbnail ? (
                    <img src={bonus.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-7 h-7" style={{ color: "#A3C1FB" }} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Template router
  const renderContent = () => {
    switch (template) {
      case "showcase": return renderShowcaseTemplate();
      case "modern": return renderModernTemplate();
      case "units": return renderUnitsTemplate();
      case "members": return renderMembersTemplate();
      case "flow": return renderFlowTemplate();
      case "shop": return renderShopTemplate();
      case "academy": return renderAcademyTemplate();
      case "corporate": return renderCorporateTemplate();
      case "minimal": return renderMinimalTemplate();
      case "exclusive": return renderExclusiveTemplate();
      default: return renderClassicTemplate();
    }
  };

  return (
    <div className="flex flex-col">
      {renderContent()}
      {renderModulesDialog()}

      {/* PDF Viewer - Renderiza baseado na configuração do admin (mesmo do app principal) */}
      {pdfUrl && pdfViewer === "react-pdf" && (
        <InternalPdfViewer
          pdfUrl={pdfUrl}
          title={pdfTitle}
          isOpen={!!pdfUrl}
          onClose={() => setPdfUrl(null)}
          // No Order Bump, NUNCA mostramos toolbar/botão de download dentro do viewer.
          // O download (quando permitido) aparece somente ao lado do botão "Ver".
          allowDownload={false}
        />
      )}

      {pdfUrl && pdfViewer === "google-docs" && (
        <PdfViewer
          pdfUrl={pdfUrl}
          title={pdfTitle}
          isOpen={!!pdfUrl}
          onClose={() => setPdfUrl(null)}
          // No Order Bump, NUNCA mostramos toolbar/botão de download dentro do viewer.
          allowDownload={false}
        />
      )}

      {pdfUrl && pdfViewer === "adobe-embed" && (
        <div className="fixed inset-0 z-50">
          <button
            onClick={() => setPdfUrl(null)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            style={{ color: closeButtonColor || "#ffffff" }}
          >
            <X className="w-6 h-6" />
          </button>
          <AdobePdfViewer url={pdfUrl} fileName={pdfTitle} allowDownload={false} clientId={adobeClientId} />
        </div>
      )}

      {pdfUrl && pdfViewer === "embedpdf" && (
        <div className="fixed inset-0 z-50" style={{ backgroundColor: headerBgColor || "#000000" }}>
          <button
            onClick={() => setPdfUrl(null)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            style={{ color: closeButtonColor || "#ffffff" }}
          >
            <X className="w-6 h-6" />
          </button>
          <EmbedPdfViewer
            url={pdfUrl}
            // No Order Bump, NUNCA mostramos toolbar/botão de download dentro do viewer.
            allowDownload={false}
            customStyles={{
              closeButtonColor,
              controlsColor,
              headerBgColor,
              controlsBarColor,
            }}
          />
        </div>
      )}

      <VideoPlayerDialog open={!!videoUrl} onOpenChange={() => setVideoUrl(null)} videoUrl={videoUrl || ""} title={videoTitle} />
      <AudioPlayerDialog open={!!audioUrl} onOpenChange={() => setAudioUrl(null)} audioUrl={audioUrl || ""} title={audioTitle} />
    </div>
  );
}
