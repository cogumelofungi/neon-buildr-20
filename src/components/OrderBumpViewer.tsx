import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, ImageIcon, ChevronRight, X } from "lucide-react";
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
  bonus1_label?: string;
  bonus2_label?: string;
  bonus3_label?: string;
  bonus4_label?: string;
  bonus5_label?: string;
  bonus6_label?: string;
  bonus7_label?: string;
  bonus8_label?: string;
  bonus9_label?: string;
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

  // Collect bonuses
  const bonuses = [
    { url: orderBump.bonus1_url, label: orderBump.bonus1_label },
    { url: orderBump.bonus2_url, label: orderBump.bonus2_label },
    { url: orderBump.bonus3_url, label: orderBump.bonus3_label },
    { url: orderBump.bonus4_url, label: orderBump.bonus4_label },
    { url: orderBump.bonus5_url, label: orderBump.bonus5_label },
    { url: orderBump.bonus6_url, label: orderBump.bonus6_label },
    { url: orderBump.bonus7_url, label: orderBump.bonus7_label },
    { url: orderBump.bonus8_url, label: orderBump.bonus8_label },
    { url: orderBump.bonus9_url, label: orderBump.bonus9_label },
  ].filter(b => b.url);

  // All products for grid templates
  const allProducts = [
    { url: orderBump.produto_principal_url, label: orderBump.main_product_label || "Produto Principal" },
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
                {appDescription && <p className="text-xs mt-0.5" style={{ color: appDescriptionColor }}>{appDescription}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4">
          {orderBump.produto_principal_url && (
            <div className="rounded-xl p-4" style={{ backgroundColor: cardBg }}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}20` }}>
                  <ImageIcon className="w-5 h-5 opacity-30" style={{ color: "#A3C1FB" }} />
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
              </div>
            </div>
          )}

          {bonuses.length > 0 && (
            <div className="space-y-2">
              {orderBump.bonuses_label && <h5 className="font-medium text-sm" style={{ color: textColor }}>{orderBump.bonuses_label}</h5>}
              {bonuses.map((bonus, i) => (
                <div key={i} className="rounded-lg p-3 flex items-center justify-between" style={{ backgroundColor: bonusCardBg }}>
                  <div className="flex items-center space-x-2 min-w-0 mr-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}20` }}>
                      <ImageIcon className="w-3 h-3 opacity-30" style={{ color: "#A3C1FB" }} />
                    </div>
                    <span className="text-sm" style={{ color: bonusTextColor }}>{bonus.label || `Bônus ${i + 1}`}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" style={{ backgroundColor: buttonBg, color: buttonText }} onClick={() => handleOpenContent(bonus.url!, bonus.label || "")}>
                      <Eye className="w-3 h-3 mr-1" />{orderBump.view_button_label || "Ver"}
                    </Button>
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
    const bgColor = isDark ? "#0f0f23" : "#f5f3ff";
    const textColor = isDark ? "#ffffff" : "#111827";

    return (
      <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
        <BackButton className="absolute top-4 left-4 z-20" />
        
        {/* Header */}
        <div className={`px-6 pb-6 text-center ${
          showcaseTextPosition === "top" ? "pt-16" : showcaseTextPosition === "middle" ? "pt-32" : "pt-16"
        }`}>
          {showAppIcon && (
            <div className="w-20 h-20 rounded-2xl mx-auto mb-3 overflow-hidden" style={{ backgroundColor: primaryColor }}>
              {orderBump.icone_url ? <img src={orderBump.icone_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 m-auto mt-4 opacity-50" style={{ color: "#A3C1FB" }} />}
            </div>
          )}
          <h1 className="text-xl font-bold mb-1" style={{ color: appNameColor }}>{appName}</h1>
          {appDescription && <p className="text-sm mt-1" style={{ color: appDescriptionColor }}>{appDescription}</p>}
        </div>

        {/* Products */}
        <div className="px-4 pb-6 space-y-3">
          {orderBump.produto_principal_url && (
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-6 text-center">
              <div className="w-20 h-20 rounded-2xl mx-auto mb-3 overflow-hidden" style={{ backgroundColor: primaryColor }}>
                <ImageIcon className="w-12 h-12 m-auto mt-4 opacity-50" style={{ color: "#A3C1FB" }} />
              </div>
              <h4 className="font-bold text-sm mb-3" style={{ color: textColor }}>{orderBump.main_product_label || "Produto Principal"}</h4>
              <div className="flex space-x-2 justify-center">
                <button className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }} onClick={() => handleOpenContent(orderBump.produto_principal_url!, "")}>
                  {orderBump.view_button_label || "Ver"}
                </button>
              </div>
            </div>
          )}

          {bonuses.map((bonus, i) => (
            <div key={i} className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 border border-purple-400/20 rounded-xl p-3 flex items-center">
              <div className="w-12 h-12 rounded-xl overflow-hidden mr-3" style={{ backgroundColor: `${primaryColor}40` }}>
                <ImageIcon className="w-8 h-8 m-auto mt-2 opacity-30" style={{ color: "#A3C1FB" }} />
              </div>
              <span className="flex-1 font-medium text-sm" style={{ color: textColor }}>{bonus.label || `Bônus ${i + 1}`}</span>
              <div className="flex space-x-2">
                <button className="hover:opacity-70" style={{ color: primaryColor }} onClick={() => handleOpenContent(bonus.url!, "")}><Eye className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
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
            <div className="w-20 h-20 rounded-2xl mx-auto mb-4 overflow-hidden" style={{ backgroundColor: primaryColor }}>
              {orderBump.icone_url ? <img src={orderBump.icone_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 m-auto mt-5" style={{ color: "#A3C1FB" }} />}
            </div>
            <h1 className="text-2xl font-light mb-2" style={{ color: textColor }}>{appName}</h1>
            {orderBump.main_product_description && (
              <p className="text-sm" style={{ color: mutedColor }}>{orderBump.main_product_description}</p>
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
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mr-3" style={{ backgroundColor: `${primaryColor}20` }}>
                  <ImageIcon className="w-6 h-6 opacity-50" style={{ color: "#A3C1FB" }} />
                </div>
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="font-medium text-sm mb-0.5 break-words" style={{ color: textColor }}>
                    {orderBump.main_product_label || "Produto Principal"}
                  </h3>
                </div>
                <button
                  className="p-2 transition-all duration-200 hover:scale-110 flex-shrink-0"
                  style={{ color: primaryColor }}
                  onClick={() => handleOpenContent(orderBump.produto_principal_url!, orderBump.main_product_label || "")}
                >
                  <Eye className="w-5 h-5" />
                </button>
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
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mr-3" style={{ backgroundColor: `${primaryColor}15` }}>
                        <ImageIcon className="w-5 h-5 opacity-30" style={{ color: "#A3C1FB" }} />
                      </div>
                      <div className="flex-1 min-w-0 mr-2">
                        <span className="font-medium text-sm block break-words" style={{ color: isDark ? "#d1d5db" : "#111827" }}>
                          {bonus.label || `Bônus ${i + 1}`}
                        </span>
                      </div>
                      <button
                        className="p-2 transition-all duration-200 hover:scale-110 flex-shrink-0"
                        style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                        onClick={() => handleOpenContent(bonus.url!, bonus.label || "")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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
            <h1 className="text-2xl font-bold text-white">{appName}</h1>
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
                  <ImageIcon className="w-6 h-6 opacity-50" style={{ color: "#A3C1FB" }} />
                </div>
                <span className="font-medium text-base text-left" style={{ color: cardTextColor }}>{product.label || `Item ${i + 1}`}</span>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: primaryColor }} />
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ===================== MEMBERS TEMPLATE =====================
  const renderMembersTemplate = () => {
    const bgColor = isDark ? "#0f172a" : "#ffffff";
    const textColor = isDark ? "#f8fafc" : "#1e293b";
    const defaultBonusColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899", "#6366f1"];
    const getBonusColor = (i: number) => obThemeConfig[`bonus${i + 1}Color`] || defaultBonusColors[i % defaultBonusColors.length];

    // Apply membersHeaderSize
    const headerHeights: Record<string, string> = { small: "240px", medium: "300px", large: "340px" };
    const headerHeight = headerHeights[membersHeaderSize] || "340px";

    return (
      <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
        <BackButton className="absolute top-4 left-4 z-20" />
        
        {/* Header with configurable height */}
        {orderBump.capa_url ? (
          <div
            className="w-full relative"
            style={{
              height: headerHeight,
              backgroundImage: `url(${orderBump.capa_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <h1 className="text-3xl font-bold mb-2" style={{ color: appNameColor }}>{appName}</h1>
              {appDescription && <p className="text-sm" style={{ color: appDescriptionColor }}>{appDescription}</p>}
            </div>
          </div>
        ) : (
          <div className="px-6 pt-16 pb-6 text-center">
            <h1 className="text-3xl font-bold mb-2" style={{ color: appNameColor }}>{appName}</h1>
            {appDescription && <p className="text-sm" style={{ color: appDescriptionColor }}>{appDescription}</p>}
          </div>
        )}

        {/* Main Product */}
        {orderBump.produto_principal_url && (
          <div className="px-6 mb-4 mt-4">
            <div
              className={`rounded-2xl p-6 pr-12 flex items-center justify-between shadow-lg relative overflow-visible cursor-pointer hover:scale-[1.02] transition-transform ${membersShowCardBorder ? 'border-2' : ''}`}
              style={{ 
                backgroundColor: primaryColor, 
                minHeight: "120px",
                borderColor: membersShowCardBorder ? (primaryColor || '#4783F6') : undefined,
              }}
              onClick={() => handleOpenContent(orderBump.produto_principal_url!, orderBump.main_product_label || "")}
            >
              <div className="flex-1 pr-4">
                <h3 className="text-white text-xl font-semibold mb-1">{orderBump.main_product_label || "Produto Principal"}</h3>
              </div>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg" style={{ border: "3px solid #ffffff" }}>
                <ImageIcon className="w-10 h-10" style={{ color: "#A3C1FB" }} />
              </div>
            </div>
          </div>
        )}

        {/* Bonuses */}
        {bonuses.length > 0 && orderBump.bonuses_label && (
          <div className="px-6 mt-6 mb-3">
            <h2 className="text-lg font-semibold" style={{ color: textColor }}>{orderBump.bonuses_label}</h2>
          </div>
        )}
        <div className="px-6 pb-6 space-y-3">
          {bonuses.map((bonus, i) => (
            <div
              key={i}
              className={`relative rounded-xl flex items-center shadow-md cursor-pointer hover:scale-[1.02] transition-transform overflow-visible ${membersShowCardBorder ? 'border-2' : ''}`}
              style={{ 
                backgroundColor: getBonusColor(i), 
                minHeight: "60px", 
                paddingLeft: "16px", 
                paddingRight: "70px", 
                paddingTop: "12px", 
                paddingBottom: "12px",
                borderColor: membersShowCardBorder ? (primaryColor || '#4783F6') : undefined,
              }}
              onClick={() => handleOpenContent(bonus.url!, bonus.label || "")}
            >
              <h3 className="text-white text-base font-semibold">{bonus.label || `Bônus ${i + 1}`}</h3>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg" style={{ border: "3px solid #ffffff" }}>
                <ImageIcon className="w-7 h-7" style={{ color: "#A3C1FB" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ===================== FLOW TEMPLATE =====================
  const renderFlowTemplate = () => {
    const bgColor = isDark ? "#0f0a1f" : "#f5f3ff";
    const textColor = isDark ? "#ffffff" : "#1f2937";

    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: bgColor }}>
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

          {/* Header */}
          <div className="mt-auto pt-24 pb-6">
            <h1 className="text-3xl font-bold mb-2" style={{ color: textColor }}>{appName}</h1>
          </div>

          {/* Products */}
          <div className="space-y-2 pb-6">
            {allProducts.map((product, i) => (
              <button
                key={i}
                onClick={() => handleOpenContent(product.url!, product.label || "")}
                className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all hover:scale-[1.01] ${flowShowCardBorder ? 'border-2' : ''}`}
                style={{ 
                  backgroundColor: isDark ? "rgba(30, 20, 50, 0.8)" : "rgba(255, 255, 255, 0.9)", 
                  border: flowShowCardBorder 
                    ? `2px solid ${primaryColor || '#4783F6'}` 
                    : (isDark ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid rgba(139, 92, 246, 0.2)"),
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)` }}>
                    <ImageIcon className="w-5 h-5 m-auto mt-2.5 opacity-50" style={{ color: "#A3C1FB" }} />
                  </div>
                  <span className="font-medium text-sm" style={{ color: textColor }}>{product.label || `Item ${i + 1}`}</span>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: isDark ? "#a855f7" : "#7c3aed" }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ===================== SHOP TEMPLATE =====================
  const renderShopTemplate = () => {
    const bgColor = isDark ? "#059669" : "#d1fae5";
    const textColor = isDark ? "#ffffff" : "#065f46";

    return (
      <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
        <BackButton className="absolute top-4 left-4 z-20" />
        
        {/* Header */}
        <div className="px-6 pt-16 pb-6 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden" style={{ backgroundColor: "#10b981" }}>
            {orderBump.icone_url ? <img src={orderBump.icone_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 m-auto mt-4" style={{ color: "#A3C1FB" }} />}
          </div>
          <h1 className="text-2xl font-bold" style={{ color: textColor }}>{appName}</h1>
        </div>

        {/* Products Grid */}
        <div className="px-4 pb-6 grid grid-cols-2 gap-3">
          {allProducts.map((product, i) => (
            <button
              key={i}
              onClick={() => handleOpenContent(product.url!, product.label || "")}
              className={`rounded-2xl p-4 text-center transition-all hover:scale-[1.02] ${shopRemoveCardBorder ? "" : "border-2"}`}
              style={{ 
                backgroundColor: isDark ? "#047857" : "#ffffff",
                borderColor: shopRemoveCardBorder ? "transparent" : (primaryColor || "#10b981"),
              }}
            >
              <div className="w-16 h-16 rounded-xl mx-auto mb-2 overflow-hidden" style={{ backgroundColor: "#10b98120" }}>
                <ImageIcon className="w-8 h-8 m-auto mt-4 opacity-30" style={{ color: "#A3C1FB" }} />
              </div>
              <span className="text-sm font-medium block" style={{ color: textColor }}>{product.label || `Item ${i + 1}`}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ===================== ACADEMY TEMPLATE =====================
  const renderAcademyTemplate = () => {
    const bgColor = isDark ? "#0a0a0a" : "#fafafa";
    const cardBg = isDark ? "#1a1a1a" : "#ffffff";
    const textColor = isDark ? "#ffffff" : "#111827";
    const mutedColor = isDark ? "#9ca3af" : "#6b7280";

    return (
      <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
        <BackButton className="absolute top-4 left-4 z-20" />

        {/* Header */}
        <div className="px-4 pt-16 pb-4">
          <h1 className="text-2xl font-bold" style={{ color: textColor }}>{appName}</h1>
        </div>

        {/* Products Grid */}
        <div className="px-4 pb-6 grid grid-cols-2 gap-3">
          {allProducts.map((product, i) => (
            <button
              key={i}
              onClick={() => handleOpenContent(product.url!, product.label || "")}
              className="rounded-xl overflow-hidden transition-all hover:scale-[1.02]"
              style={{ backgroundColor: cardBg }}
            >
              <div className="aspect-video relative overflow-hidden" style={{ backgroundColor: i === 0 ? primaryColor : `${primaryColor}80` }}>
                <ImageIcon className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" style={{ color: "#A3C1FB" }} />
              </div>
              <div className="p-3">
                <span className="text-sm font-medium block" style={{ color: textColor }}>{product.label || `Item ${i + 1}`}</span>
                <span className="text-xs" style={{ color: mutedColor }}>Disponível</span>
              </div>
            </button>
          ))}
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
      <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
        {/* Top Navigation Bar */}
        <div
          className="border-b px-4 py-3"
          style={{ backgroundColor: navBg, borderColor }}
        >
          <div className="flex items-center space-x-3">
            <BackButton className="!bg-transparent !w-auto !h-auto" />
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
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm break-words leading-tight" style={{ color: textColor }}>
                {appName}
              </h3>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="flex-1 p-6 max-w-4xl mx-auto">
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
                  <ImageIcon className="w-10 h-10 opacity-50" style={{ color: "#A3C1FB" }} />
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
                </div>
              </div>
            </div>
          )}

          {/* Bonus Section Label */}
          {bonuses.length > 0 && orderBump.bonuses_label && (
            <h5 className="font-semibold text-sm mb-4" style={{ color: textColor }}>
              {orderBump.bonuses_label}
            </h5>
          )}

          {/* Bonus Cards Grid */}
          <div className="grid grid-cols-1 gap-4">
            {bonuses.map((bonus, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 shadow-md flex items-center justify-between relative overflow-hidden"
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
                <div className="flex items-center space-x-3 min-w-0 relative z-10">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <ImageIcon className="w-5 h-5 opacity-30" style={{ color: "#A3C1FB" }} />
                  </div>
                  <span className="font-medium text-sm" style={{ color: textColor }}>
                    {bonus.label || `Bônus ${i + 1}`}
                  </span>
                </div>
                <div className="flex items-center space-x-2 relative z-10">
                  <button
                    className="p-2 rounded-lg transition-all hover:opacity-80"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                    onClick={() => handleOpenContent(bonus.url!, bonus.label || "")}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Minimal and Exclusive use classic style
  const renderMinimalTemplate = renderClassicTemplate;
  const renderExclusiveTemplate = renderClassicTemplate;

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
    <div className="min-h-screen flex flex-col">
      {renderContent()}

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
