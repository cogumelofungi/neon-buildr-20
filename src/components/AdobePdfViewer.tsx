import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdobePdfViewerProps {
  url: string;
  fileName?: string;
  allowDownload?: boolean;
  clientId?: string;
}

export const AdobePdfViewer = ({ 
  url, 
  fileName = 'document.pdf', 
  allowDownload = false,
  clientId 
}: AdobePdfViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!clientId) {
      setError('Adobe Client ID não configurado');
      setIsLoading(false);
      return;
    }

    const loadAdobeViewer = async () => {
      try {
        // Check if script already loaded
        const existingScript = document.querySelector('script[src*="dc-view-sdk"]');
        
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = 'https://acrobatservices.adobe.com/view-sdk/viewer.js';
          script.async = true;
          document.head.appendChild(script);
          
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Falha ao carregar Adobe SDK'));
          });
        }

        // Wait for Adobe DC View to be ready
        const waitForAdobe = () => {
          return new Promise<void>((resolve) => {
            const checkAdobe = () => {
              const win = window as any;
              if (win.AdobeDC) {
                resolve();
              } else {
                document.addEventListener('adobe_dc_view_sdk.ready', () => resolve(), { once: true });
                setTimeout(checkAdobe, 100);
              }
            };
            checkAdobe();
          });
        };

        await waitForAdobe();

        const win = window as any;
        if (win.AdobeDC && viewerRef.current) {
          const adobeDCView = new win.AdobeDC.View({
            clientId: clientId,
            divId: 'adobe-pdf-viewer'
          });

          adobeDCView.previewFile({
            content: { location: { url: url } },
            metaData: { fileName: fileName }
          }, {
            embedMode: 'FULL_WINDOW',
            showDownloadPDF: allowDownload,
            showPrintPDF: false,
            showAnnotationTools: false,
            showBookmarks: false,
            showThumbnails: false,
            showFullScreen: true,
            defaultViewMode: 'FIT_WIDTH'
          });

          setIsLoading(false);
        }
      } catch (err) {
        console.error('Adobe PDF Viewer error:', err);
        setError('Erro ao carregar visualizador Adobe');
        setIsLoading(false);
      }
    };

    loadAdobeViewer();
  }, [url, fileName, allowDownload, clientId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black/95 text-white p-8">
        <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Configuração Necessária</h3>
        <p className="text-gray-400 text-center mb-6 max-w-md">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.open('https://developer.adobe.com/console', '_blank')}
          className="gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Obter Adobe Client ID
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      <div 
        id="adobe-pdf-viewer" 
        ref={viewerRef} 
        className="w-full h-full [&_iframe]:!m-0 [&_iframe]:!p-0 [&_div]:!m-0"
        style={{ margin: 0, padding: 0 }}
      />
    </div>
  );
};

export default AdobePdfViewer;
