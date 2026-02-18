import { useState, useEffect, useRef } from "react";
import { Download, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isStorageUrl, pdfProxyUrl } from "@/lib/pdf";

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
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const blobRef = useRef<string | null>(null);

  const controlsColor = customStyles?.controlsColor || "#ffffff";
  const controlsBarColor = customStyles?.controlsBarColor || "#000000";

  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);

  // Detectar tamanho da tela para overlays responsivos
  const [screenType, setScreenType] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    const updateScreenType = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenType("mobile");
      else if (width < 1024) setScreenType("tablet");
      else setScreenType("desktop");
    };
    updateScreenType();
    window.addEventListener("resize", updateScreenType);
    return () => window.removeEventListener("resize", updateScreenType);
  }, []);

  // Configuração dos overlays que cobrem botões indesejados do PDF.js
  const rightOverlayWidth = { mobile: "65px", tablet: "140px", desktop: "130px" };
  const leftOverlayWidth = { mobile: "0px", tablet: "0px", desktop: "0px" };
  const overlayHeight = { mobile: "30px", tablet: "36px", desktop: "32px" };

  const fetchPdfAsBlob = async (pdfUrl: string) => {
    setIsLoading(true);
    setError(null);

    // Revoke previous blob URL
    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = null;
      setBlobUrl(null);
    }

    try {
      // iOS: usar URL direta; outros: usar proxy para contornar CORS
      const fetchUrl = isIOS
        ? pdfUrl
        : isStorageUrl(pdfUrl)
        ? pdfProxyUrl(pdfUrl)
        : pdfUrl;

      console.log("[EmbedPdfViewer] Fetching PDF as blob from:", fetchUrl);

      const response = await fetch(fetchUrl, { method: "GET", cache: "no-store" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        throw new Error("Resposta inválida: recebido HTML em vez de PDF");
      }

      const blob = await response.blob();
      if (blob.size === 0) throw new Error("Arquivo vazio");

      // Força MIME application/pdf para o PDF.js reconhecer
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const objectUrl = URL.createObjectURL(pdfBlob);
      blobRef.current = objectUrl;
      setBlobUrl(objectUrl);
    } catch (err: any) {
      console.error("[EmbedPdfViewer] Error loading PDF:", err);
      setError(err?.message || "Erro ao carregar o PDF");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!url) return;
    fetchPdfAsBlob(url);
    return () => {
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Usar blob URL diretamente — o PDF.js externo (cdnjs) rejeita blob URLs de outra origem
  const iframeSrc = blobUrl ?? null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = blobUrl || url;
    link.download = url.split("/").pop()?.split("?")[0] || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRetry = () => fetchPdfAsBlob(url);

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
              disabled={!blobUrl}
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
        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleRetry} variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Tentar novamente
                </Button>
                <Button onClick={() => window.open(url, "_blank")} variant="outline" size="sm">
                  Abrir em nova aba
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* PDF iframe com PDF.js viewer original */}
        {iframeSrc && !error && (
          <div className="relative w-full h-full">
            {/* Overlay direito — cobre: impressora, salvar, dropdown */}
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
            {/* Overlay esquerdo — cobre: botão abrir arquivo */}
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
              key={iframeSrc}
              src={iframeSrc}
              className="w-full h-full border-0"
              title="PDF Viewer"
              {...(isAndroid
                ? { sandbox: "allow-same-origin allow-scripts allow-popups allow-forms" }
                : {})}
              referrerPolicy="no-referrer-when-downgrade"
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "white",
                border: "none",
                outline: "none",
                ...(isIOS && {
                  transform: "translateZ(0)",
                  WebkitOverflowScrolling: "touch",
                } as React.CSSProperties),
                ...(isAndroid && {
                  touchAction: "manipulation",
                } as React.CSSProperties),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmbedPdfViewer;
