import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, Loader2, Check, Copy, ExternalLink, Eye, FileText, Gift, Image, Palette, AlertTriangle, Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAppBuilder } from "@/hooks/useAppBuilder";
import { useLanguage } from "@/hooks/useLanguage";
import { useAppLimit } from "@/hooks/useAppLimit";
import { supabase } from "@/integrations/supabase/client";

interface PublishButtonProps {
  appBuilder: ReturnType<typeof useAppBuilder>;
}

const PublishButton = ({ appBuilder }: PublishButtonProps) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string>("");
  const [isRepublishing, setIsRepublishing] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentApps, maxApps, planName, canCreateApp, isLoading: limitLoading, refreshLimit } = useAppLimit();

  // Verificar se é uma republicação
  useEffect(() => {
    const checkRepublication = async () => {
      if (!appBuilder.appData.customLink.trim()) {
        setIsRepublishing(false);
        return;
      }

      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        const { data: existingApp } = await supabase
          .from('apps')
          .select('user_id')
          .eq('slug', appBuilder.appData.customLink.trim())
          .eq('user_id', user.id)
          .maybeSingle();

        setIsRepublishing(!!existingApp);
      } catch (error) {
        console.error('Erro ao verificar republicação:', error);
        setIsRepublishing(false);
      }
    };

    checkRepublication();
  }, [appBuilder.appData.customLink]);

  const handlePublishClick = async () => {
    // Verificar limite considerando se é atualização
    await refreshLimit(appBuilder.appData.customLink.trim());
    
    // Se é republicação, permitir sempre. Se não é, verificar limite
    if (!isRepublishing && !canCreateApp && !limitLoading) {
      setShowLimitDialog(true);
      return;
    }
    setShowReviewModal(true);
  };

  const handleConfirmPublish = async () => {
    setShowReviewModal(false);
    const url = await appBuilder.publishApp();
    if (url) {
      setPublishedUrl(url);
      setShowSuccessModal(true);
      refreshLimit(); // Atualizar contador após publicação
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publishedUrl);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleUpgrade = () => {
    window.open('/pricing', '_blank');
  };

  return (
    <>
      <Card className="bg-app-surface border-app-border p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Pronto para publicar?
            </h3>
            <p className="text-sm text-app-muted mb-4">
              Publique seu app e compartilhe com o mundo!
            </p>
          </div>

          {/* Informações do plano */}
          {!limitLoading && (
            <div className="flex items-center justify-between p-3 bg-app-surface-hover border border-app-border rounded-lg">
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Plano {planName}
                </span>
              </div>
              <span className="text-sm text-app-muted">
                {currentApps}/{maxApps} apps
              </span>
            </div>
          )}

          <Button
            onClick={handlePublishClick}
            disabled={appBuilder.isPublishing || !appBuilder.appData.appName || limitLoading}
            className="w-full btn-publish font-semibold py-3 h-12"
          >
            {appBuilder.isPublishing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Publicando...
              </>
            ) : limitLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verificando limite...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5 mr-2" />
                {isRepublishing ? "Publicar Novamente" : "Publicar App"}
              </>
            )}
          </Button>

          {appBuilder.isSaving && (
            <div className="flex items-center justify-center text-xs text-app-muted">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Salvando rascunho...
            </div>
          )}
        </div>
      </Card>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="bg-app-surface border-app-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-foreground">
              <Eye className="w-6 h-6 mr-2 text-primary" />
              Revisar App Antes de Publicar
            </DialogTitle>
            <DialogDescription className="text-app-muted">
              Verifique todas as informações antes de publicar seu app PLR.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-96 overflow-y-auto">
            {/* App Info */}
            <div className="bg-app-surface-hover rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Informações do App
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-app-muted">Nome:</span>
                  <span className="text-foreground font-medium">{appBuilder.appData.appName || "Não definido"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-app-muted">Descrição:</span>
                  <span className="text-foreground">{appBuilder.appData.appDescription}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-app-muted">Cor:</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded border border-app-border" 
                      style={{ backgroundColor: appBuilder.appData.appColor }}
                    ></div>
                    <span className="text-foreground">{appBuilder.appData.appColor}</span>
                  </div>
                </div>
                {appBuilder.appData.customLink && (
                  <div className="flex justify-between">
                    <span className="text-app-muted">Link personalizado:</span>
                    <span className="text-foreground">/{appBuilder.appData.customLink}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Uploads */}
            <div className="bg-app-surface-hover rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <Gift className="w-4 h-4 mr-2" />
                Produtos Carregados
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-app-muted">Produto Principal:</span>
                  <span className={`${appBuilder.appData.mainProduct?.url ? 'text-green-500' : 'text-red-500'}`}>
                    {appBuilder.appData.mainProduct?.url ? '✓ Carregado' : '✗ Não carregado'}
                  </span>
                </div>
                {[1, 2, 3, 4].map(num => {
                  const bonus = appBuilder.appData[`bonus${num}` as keyof typeof appBuilder.appData] as any;
                  return (
                    <div key={num} className="flex justify-between">
                      <span className="text-app-muted">Bônus {num}:</span>
                      <span className={`${bonus?.url ? 'text-green-500' : 'text-app-muted'}`}>
                        {bonus?.url ? '✓ Carregado' : '○ Opcional'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual Assets */}
            <div className="bg-app-surface-hover rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <Image className="w-4 h-4 mr-2" />
                Recursos Visuais
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-app-muted">Ícone do App:</span>
                  <span className={`${appBuilder.appData.appIcon?.url ? 'text-green-500' : 'text-app-muted'}`}>
                    {appBuilder.appData.appIcon?.url ? '✓ Carregado' : '○ Opcional'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-app-muted">Capa do App:</span>
                  <span className={`${appBuilder.appData.appCover?.url ? 'text-green-500' : 'text-app-muted'}`}>
                    {appBuilder.appData.appCover?.url ? '✓ Carregado' : '○ Opcional'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowReviewModal(false)}
              className="flex-1 border-app-border"
            >
              Voltar e Editar
            </Button>
            <Button 
              onClick={handleConfirmPublish}
              disabled={appBuilder.isPublishing || !appBuilder.appData.appName}
              className="flex-1 btn-publish"
            >
              {appBuilder.isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Confirmar e Publicar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-app-surface border-app-border">
          <DialogHeader>
            <DialogTitle className="flex items-center text-foreground">
              <Check className="w-6 h-6 mr-2 text-green-500" />
              App Publicado com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-app-muted">
              Seu app PLR está agora disponível e pode ser instalado como PWA.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-app-surface-hover rounded-lg p-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Link do seu app:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={publishedUrl}
                  readOnly
                  className="flex-1 bg-app-surface border border-app-border rounded-md px-3 py-2 text-sm text-foreground"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="border-app-border hover:bg-app-surface-hover"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(publishedUrl, '_blank')}
                  className="border-app-border hover:bg-app-surface-hover"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-gradient-neon/10 border border-primary/20 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">
                🎉 Próximos passos:
              </h4>
              <ul className="text-sm text-app-muted space-y-1">
                <li>• Compartilhe o link com seus clientes</li>
                <li>• O app pode ser instalado como PWA</li>
                <li>• Acompanhe downloads no painel</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de limite atingido */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="max-w-md bg-app-surface border-app-border">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Limite de Apps Atingido</span>
            </DialogTitle>
            <DialogDescription className="text-app-muted">
              Você atingiu o limite de {maxApps} apps do seu plano {planName}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Para criar mais apps, você precisa fazer upgrade do seu plano.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowLimitDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpgrade}
                className="flex-1 btn-publish"
              >
                <Crown className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PublishButton;