import { useState, useEffect } from "react";
import { X, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface InternalPdfViewerProps {
  pdfUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  allowDownload?: boolean;
  onDownload?: (url: string, filename: string) => void;
  customStyles?: {
    closeButtonColor?: string;
    controlsColor?: string;
    headerBgColor?: string;
    controlsBarColor?: string;
  };
}

export const InternalPdfViewer = ({
  pdfUrl,
  title,
  isOpen,
  onClose,
  allowDownload = true,
  onDownload,
  customStyles,
}: InternalPdfViewerProps) => {
  // Custom style colors with defaults
  const closeButtonColor = customStyles?.closeButtonColor || undefined;
  const controlsColor = customStyles?.controlsColor || undefined;
  const headerBgColor = customStyles?.headerBgColor || undefined;

  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detectar tipo de dispositivo e navegador para otimizações específicas
  const userAgent = navigator.userAgent;
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafariIOS = isIOS && /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent);
  const isChromeIOS = isIOS && /CriOS/i.test(userAgent);
  const isFirefoxIOS = isIOS && /FxiOS/i.test(userAgent);
  const isOperaIOS = isIOS && (/OPR\//i.test(userAgent) || /Opera/i.test(userAgent));
  const isEdgeIOS = isIOS && /EdgiOS/i.test(userAgent);
  const isEdgeAndroid = isAndroid && /EdgA/i.test(userAgent);
  const isChromeAndroid = isAndroid && /Chrome/i.test(userAgent) && !/EdgA/.test(userAgent);
  const isFirefoxAndroid = isAndroid && /Firefox/i.test(userAgent);
  const isOperaAndroid = isAndroid && (/OPR\//i.test(userAgent) || /Opera/i.test(userAgent));
  const isDesktopDevice = !isAndroid && !isIOS;

  // Detectar tamanho da tela para overlays responsivos
  const [screenType, setScreenType] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    const updateScreenType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenType("mobile");
      } else if (width < 1024) {
        setScreenType("tablet");
      } else {
        setScreenType("desktop");
      }
    };

    updateScreenType();
    window.addEventListener("resize", updateScreenType);
    return () => window.removeEventListener("resize", updateScreenType);
  }, []);

  // ============================================
  // CONFIGURAÇÃO DOS OVERLAYS - AJUSTE AQUI
  // ============================================
  // Overlay DIREITO (cobre: impressora, salvar, dropdown)
  const rightOverlayWidth = {
    mobile: "120px", // Largura no mobile (< 768px)
    tablet: "130px", // Largura no tablet (768px - 1023px)
    desktop: "240px", // Largura no desktop (>= 1024px)
  };

  // Overlay ESQUERDO (cobre: botão abrir arquivo)
  const leftOverlayWidth = {
    mobile: "40px", // Largura no mobile
    tablet: "37px", // Largura no tablet
    desktop: "34px", // Largura no desktop
  };

  // Altura dos overlays
  const overlayHeight = {
    mobile: "40px",
    tablet: "36px",
    desktop: "32px",
  };
  // ============================================

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsLoading(true);
      setError(null);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, pdfUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Erro ao carregar o PDF");
  };

  const handleDownload = () => {
    if (onDownload) {
      const filename = `${title.replace(/\s+/g, "_").toLowerCase()}.pdf`;
      onDownload(pdfUrl, filename);
    }
  };

  const openInNewTab = () => {
    window.open(pdfUrl, "_blank");
  };

  // Mozilla PDF.js Viewer
  const getPdfViewerUrl = () => {
    const viewerUrl = "https://mozilla.github.io/pdf.js/web/viewer.html";
    const params = new URLSearchParams({
      file: pdfUrl,
    });
    return `${viewerUrl}?${params.toString()}`;
  };

  const iframeSrc = getPdfViewerUrl();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 z-10 backdrop-blur-sm border-b border-border"
        style={{ backgroundColor: headerBgColor ? `${headerBgColor}e6` : undefined }}
      >
        <div className={`flex items-center justify-between ${isMobile ? "p-3" : "p-4"}`}>
          <div className="flex-1 min-w-0">
            <h2
              className={`font-semibold truncate ${isMobile ? "text-base" : "text-lg"}`}
              style={{ color: controlsColor }}
            >
              {title}
            </h2>
          </div>

          <div className={`flex items-center ${isMobile ? "gap-1 ml-2" : "gap-2 ml-4"}`}>
            {/* Download */}
            {allowDownload && onDownload && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="p-2"
                title="Download"
                style={{ color: controlsColor }}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}

            {/* Close */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
              title="Fechar"
              style={{ color: closeButtonColor }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div
        className={`absolute inset-0 ${isMobile ? "pt-14" : "pt-16"}`}
        style={{
          backgroundColor: "#f5f5f5",
          // iOS: permitir scroll vertical, sem horizontal
          ...(isIOS && {
            overflowX: "hidden",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            height: "100vh",
            width: "100vw",
          }),
          // Android: otimizações para manter no app
          ...(isAndroid && {
            overflow: "hidden",
            touchAction: "manipulation",
          }),
        }}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="bg-background border border-border rounded-lg p-6 flex items-center gap-3 shadow-lg">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Carregando PDF...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center h-full p-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md text-center">
              <p className="text-destructive mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                  Recarregar página
                </Button>
                <Button onClick={openInNewTab} variant="outline" size="sm">
                  Abrir em nova aba
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Iframe */}
        {!error && (
          <div className="relative w-full h-full">
            {/* Overlays to cover specific toolbar buttons (print, save, dropdown) */}
            {/* Right side overlay - covers print, download, and secondary toolbar toggle */}
            <div
              className="absolute z-10 pointer-events-auto"
              style={{
                top: 0,
                right: 0,
                width: rightOverlayWidth[screenType],
                height: overlayHeight[screenType],
                backgroundColor: "#323639",
              }}
            />
            {/* Left side overlay - covers open file button */}
            <div
              className="absolute z-10 pointer-events-auto"
              style={{
                top: 0,
                left: 0,
                width: leftOverlayWidth[screenType],
                height: overlayHeight[screenType],
                backgroundColor: "#323639",
              }}
            />
            <iframe
              src={iframeSrc}
              className="w-full h-full border-0"
              title={title}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              {...(isMobile
                ? {
                    sandbox: "allow-same-origin allow-scripts allow-popups allow-forms",
                  }
                : {})}
              referrerPolicy="no-referrer-when-downgrade"
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "white",
                border: "none",
                outline: "none",
                // Otimizações específicas para Safari iOS
                ...(isSafariIOS && {
                  transform: "translateZ(0)",
                  WebkitOverflowScrolling: "touch",
                  objectFit: "contain",
                  maxWidth: "100vw",
                  overflow: "auto",
                }),
                // Otimizações específicas para outros iOS
                ...(isIOS &&
                  !isSafariIOS && {
                    transform: "translateZ(0)",
                    objectFit: "contain",
                  }),
                // Otimizações específicas para Edge iOS
                ...(isEdgeIOS && {
                  transform: "translateZ(0)",
                  WebkitOverflowScrolling: "touch",
                  objectFit: "contain",
                }),
                // Otimizações específicas para Edge Android
                ...(isEdgeAndroid && {
                  touchAction: "pan-y pinch-zoom",
                  WebkitUserSelect: "none",
                  userSelect: "none",
                }),
                // Otimizações específicas para Chrome Android
                ...(isChromeAndroid && {
                  touchAction: "pan-y pinch-zoom",
                  WebkitUserSelect: "none",
                  userSelect: "none",
                }),
                // Otimizações para outros Android
                ...(isAndroid &&
                  !isChromeAndroid && {
                    touchAction: "manipulation",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                  }),
                // Desktop: sem restrições especiais
                ...(isDesktopDevice && {
                  overflow: "auto",
                }),
              }}
              // Atributos específicos para Android para manter no app
              {...(isAndroid && {
                "data-turbo": "false",
                "data-turbo-track": "false",
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
};
