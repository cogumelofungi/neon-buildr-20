import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { Smartphone, Eye, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface PublishedApp {
  id: string;
  nome: string;
  descricao?: string;
  cor: string;
  slug: string;
  allow_pdf_download?: boolean;
  template?: 'classic' | 'corporate' | 'showcase';
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
}

const AppViewer = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [app, setApp] = useState<PublishedApp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [userPlanLimits, setUserPlanLimits] = useState<number>(8);

  useEffect(() => {
    const loadApp = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);
        
        const { data: appData, error } = await supabase
          .from('apps')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'publicado')
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar app:', error);
          throw error;
        }

        if (!appData) {
          setApp(null);
          return;
        }

        // Fetch user plan limits for the app owner
        try {
          const { data: userStatus } = await supabase
            .from('user_status')
            .select(`
              plans (
                name,
                app_limit
              )
            `)
            .eq('user_id', appData.user_id)
            .maybeSingle();

          const planName = userStatus?.plans?.name || 'Empresarial';
          let maxProducts = 8;
          switch (planName) {
            case 'Essencial':
              maxProducts = 3;
              break;
            case 'Profissional':
              maxProducts = 5;
              break;
            case 'Empresarial':
              maxProducts = 8;
              break;
            default:
              maxProducts = 8;
              break;
          }
          setUserPlanLimits(maxProducts);
        } catch (error) {
          console.error('Erro ao buscar plano do usuário:', error);
          setUserPlanLimits(8); // Default to max
        }

        setApp(appData);
        
        // Gerar manifest.json dinâmico
        generateManifest(appData);
        
        // Registrar service worker
        registerServiceWorker();
        
        // Setup PWA install prompt
        setupPWAInstallPrompt();
        
      } catch (error) {
        console.error('Erro ao carregar app:', error);
        setApp(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadApp();
  }, [slug]);

  const setupPWAInstallPrompt = () => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    
    setDeferredPrompt(null);
  };

  const generateManifest = (appData: PublishedApp) => {
    const manifest = {
      name: appData.nome,
      short_name: appData.nome,
      description: appData.descricao || "PLR Products",
      start_url: `/app/${appData.slug}`,
      display: "standalone",
      background_color: appData.cor,
      theme_color: appData.cor,
      icons: [
        {
          src: appData.icone_url || "/placeholder.svg",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: appData.icone_url || "/placeholder.svg", 
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };

    // Criar e inserir o link do manifest
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (existingManifest) {
      existingManifest.remove();
    }

    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = manifestUrl;
    document.head.appendChild(link);

    // Atualizar meta tags para PWA
    updateMetaTags(appData);
  };

  const updateMetaTags = (appData: PublishedApp) => {
    // Theme color
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute('content', appData.cor);

    // Apple touch icon
    let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.setAttribute('rel', 'apple-touch-icon');
      document.head.appendChild(appleTouchIcon);
    }
    appleTouchIcon.setAttribute('href', appData.icone_url || '/placeholder.svg');

    // Title
    document.title = appData.nome;
  };

  const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(error => {
        console.log('Service Worker registration failed:', error);
      });
    }
  };

  const handleViewPdf = (url: string, title: string) => {
    setPdfUrl(url);
    setPdfTitle(title);
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
        title: "Download iniciado",
        description: `${filename} está sendo baixado.`,
      });
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o arquivo.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-app-text mb-2">App não encontrado</h1>
          <p className="text-app-muted">Este app não existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900" style={{ backgroundColor: '#1a1a1a' }}>
        {/* App Cover/Header */}
        <div 
          className="h-48 relative"
          style={{
            background: app.capa_url 
              ? `url(${app.capa_url}) center/cover` 
              : `linear-gradient(135deg, ${app.cor}, ${app.cor}88)`
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute bottom-6 left-6 flex items-center space-x-4">
            {/* App Icon */}
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg overflow-hidden border-2 border-black"
              style={{ backgroundColor: app.cor }}
            >
              {app.icone_url ? (
                <img src={app.icone_url} alt="App Icon" className="w-full h-full object-cover" />
              ) : (
                <Smartphone className="w-8 h-8 text-white" />
              )}
            </div>
            
            {/* App Info */}
            <div>
              <h1 className="text-white font-bold text-2xl">{app.nome}</h1>
              <p className="text-white/80">{app.descricao || "PLR Products"}</p>
            </div>
          </div>
        </div>

        {/* Install App Button */}
        {showInstallButton && (
          <div className="fixed top-4 right-4 z-50">
            <Button
              onClick={handleInstallApp}
              style={{ backgroundColor: app.cor }}
              className="shadow-lg"
            >
              Instalar App
            </Button>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 space-y-6">
          {/* Template-based Main Product */}
          {app.produto_principal_url && (
            <div className={`rounded-xl p-6 ${
              app.template === 'corporate' 
                ? 'bg-gray-900 border border-gray-700' 
                : app.template === 'showcase'
                ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30'
                : 'bg-gray-800'
            }`}>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">PDF</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">{app.main_product_label || "PRODUTO PRINCIPAL"}</h3>
                  <p className="text-gray-400">{app.main_product_description || "Disponível para download"}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                {app.allow_pdf_download !== false && (
                  <Button 
                    className="flex-1"
                    style={{ backgroundColor: app.cor }}
                    onClick={() => handleDownload(app.produto_principal_url!, 'produto-principal.pdf')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
                <Button 
                  variant={app.allow_pdf_download === false ? "default" : "outline"}
                  style={app.allow_pdf_download === false ? { backgroundColor: app.cor } : undefined}
                  className={`flex items-center space-x-2 ${app.allow_pdf_download === false ? 'flex-1' : ''}`}
                  onClick={() => handleViewPdf(app.produto_principal_url!, app.main_product_label || "PRODUTO PRINCIPAL")}
                >
                  <Eye className="w-4 h-4" />
                  {app.allow_pdf_download === false ? 'Visualizar PDF' : ''}
                </Button>
              </div>
            </div>
          )}

          {/* Template-based Bonus Items */}
          {userPlanLimits > 1 && (
            <div className="space-y-4">
              <h4 className={`font-semibold text-lg ${
                app.template === 'corporate' ? 'text-gray-200' 
                : app.template === 'showcase' ? 'text-white font-bold' 
                : 'text-white'
              }`}>{app.bonuses_label || "BÔNUS EXCLUSIVOS"}</h4>
              {[
                { url: app.bonus1_url, label: app.bonus1_label || "Bônus 1" },
                { url: app.bonus2_url, label: app.bonus2_label || "Bônus 2" },
                { url: app.bonus3_url, label: app.bonus3_label || "Bônus 3" },
                { url: app.bonus4_url, label: app.bonus4_label || "Bônus 4" },
                { url: app.bonus5_url, label: app.bonus5_label || "Bônus 5" },
                { url: app.bonus6_url, label: app.bonus6_label || "Bônus 6" },
                { url: app.bonus7_url, label: app.bonus7_label || "Bônus 7" }
              ].filter((bonus, index) => {
                // Only show bonuses allowed by the user's plan
                return index < (userPlanLimits - 1) && bonus.url;
              }).map((bonus, index) => (
                <div key={index} className={`rounded-lg p-4 flex items-center justify-between ${
                  app.template === 'corporate' 
                    ? 'bg-gray-900/70 border border-gray-600/50' 
                    : app.template === 'showcase'
                    ? 'bg-gradient-to-r from-purple-800/30 to-pink-800/30 border border-purple-400/20'
                    : 'bg-gray-800/50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/20 rounded flex items-center justify-center">
                      <span className="text-accent">🎁</span>
                    </div>
                    <span className="text-gray-300">{bonus.label}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={app.allow_pdf_download === false ? "default" : "outline"}
                      style={app.allow_pdf_download === false ? { backgroundColor: app.cor } : undefined}
                      className={app.allow_pdf_download === false ? 'flex-1' : ''}
                      onClick={() => handleViewPdf(bonus.url!, bonus.label)}
                    >
                      <Eye className="w-3 h-3" />
                      {app.allow_pdf_download === false ? 'Ver PDF' : ''}
                    </Button>
                    {app.allow_pdf_download !== false && (
                      <Button
                        size="sm"
                        style={{ backgroundColor: app.cor }}
                        onClick={() => handleDownload(bonus.url!, `bonus-${index + 1}.pdf`)}
                      >
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

      {/* PDF Viewer Modal */}
      <Dialog open={!!pdfUrl} onOpenChange={() => setPdfUrl(null)}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] max-h-[90vh] p-0 bg-background">
          <DialogHeader className="p-4 border-b bg-background">
            <DialogTitle className="flex items-center justify-between text-foreground">
              <span className="truncate">{pdfTitle}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPdfUrl(null)}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-background">
            {pdfUrl && (
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&page=1&view=FitH`}
                className="w-full h-full border-0 bg-white"
                title={pdfTitle}
                allow="fullscreen"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppViewer;