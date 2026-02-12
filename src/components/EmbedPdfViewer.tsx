import { useState, useEffect } from "react";
import { Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmbedPdfViewerProps {
  url: string;
  allowDownload?: boolean;
  onClose?: () => void;
  customStyles?: {
    closeButtonColor?: string;
    controlsColor?: string;
    headerBgColor?: string;
    controlsBarColor?: string;
  };
}

export const EmbedPdfViewer = ({ url, allowDownload = true, customStyles }: EmbedPdfViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default colors
  const controlsColor = customStyles?.controlsColor || "#ffffff";
  const controlsBarColor = customStyles?.controlsBarColor || "#000000";

  // Detectar tipo de dispositivo e navegador
  const userAgent = navigator.userAgent;
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);

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
    mobile: "65px", // Largura no mobile (< 768px)
    tablet: "140px", // Largura no tablet (768px - 1023px)
    desktop: "130px", // Largura no desktop (>= 1024px)
  };

  // Overlay ESQUERDO (cobre: botão abrir arquivo)
  const leftOverlayWidth = {
    mobile: "0px", // Largura no mobile
    tablet: "0px", // Largura no tablet
    desktop: "0px", // Largura no desktop
  };

  // Altura dos overlays
  const overlayHeight = {
    mobile: "30px",
    tablet: "36px",
    desktop: "32px",
  };
  // ============================================
  const isMobile = isAndroid || isIOS;

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [url]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Erro ao carregar o PDF");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mozilla PDF.js Viewer
  const getPdfViewerUrl = () => {
    const viewerUrl = "https://mozilla.github.io/pdf.js/web/viewer.html";
    const params = new URLSearchParams({
      file: url,
    });
    return `${viewerUrl}?${params.toString()}`;
  };

  const iframeSrc = getPdfViewerUrl();

  return (
    <div className="relative w-full h-full flex flex-col bg-black">
      {/* Controls Bar - Só exibe se allowDownload for true */}
      {allowDownload && (
        <div
          className="flex items-center justify-between p-2 border-b"
          style={{
            backgroundColor: controlsBarColor,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="p-2 hover:bg-white/10"
              style={{ color: controlsColor }}
              title="Download"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* PDF Content */}
      <div className="flex-1 relative bg-gray-100">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="bg-background border border-border rounded-lg p-6 flex items-center gap-3 shadow-lg">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white">Carregando PDF...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                  Recarregar
                </Button>
                <Button onClick={() => window.open(url, "_blank")} variant="outline" size="sm">
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
                backgroundColor: "#F9F9FA",
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
                backgroundColor: "#F9F9FA",
              }}
            />
            <iframe
              src={iframeSrc}
              className="w-full h-full border-0"
              title="PDF Viewer"
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
                // Otimizações para iOS
                ...(isIOS && {
                  transform: "translateZ(0)",
                  WebkitOverflowScrolling: "touch",
                  objectFit: "contain",
                }),
                // Otimizações para Android
                ...(isAndroid && {
                  touchAction: "manipulation",
                  WebkitUserSelect: "none",
                  userSelect: "none",
                }),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmbedPdfViewer;
