import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, Gift, FolderUp, Download, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppBuilder } from "@/hooks/useAppBuilder";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useFeatureAccess, getRequiredPlan } from "@/hooks/useFeatureAccess";
import PremiumOverlay from "@/components/ui/premium-overlay";


interface UploadBlock {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fieldName: keyof ReturnType<typeof useAppBuilder>['appData'];
}

interface UploadSectionProps {
  appBuilder: ReturnType<typeof useAppBuilder>;
}

const UploadSection = ({ appBuilder }: UploadSectionProps) => {
  const { appData, handleFileUpload, isLoading, updateAppData } = appBuilder;
  const { t } = useLanguage();
  const [importData, setImportData] = useState({
    json: "",
    appId: "",
  });
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [userPlan, setUserPlan] = useState<string>('Empresarial');
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { maxProducts, planName } = usePlanLimits();
  const { hasAppImport } = useFeatureAccess();

  // Buscar plano do usuário
  useEffect(() => {
    const fetchUserPlan = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data: userStatus } = await supabase
        .from('user_status')
        .select(`
          plans (
            name
          )
        `)
        .eq('user_id', currentUser.id)
        .maybeSingle();

      const planName = Array.isArray(userStatus?.plans) 
        ? userStatus.plans[0]?.name 
        : userStatus?.plans?.name || 'Empresarial';
      
      setUserPlan(planName);
    };

    fetchUserPlan();
  }, []);

  const uploadBlocks: UploadBlock[] = [
    {
      id: "main",
      title: t("upload.main"),
      description: "Produto principal em PDF",
      icon: <FileText className="w-6 h-6" />,
      fieldName: "mainProduct",
    },
    {
      id: "bonus1",
      title: t("upload.bonus") + " 1",
      description: "Produto adicional em PDF",
      icon: <Gift className="w-6 h-6" />,
      fieldName: "bonus1",
    },
    {
      id: "bonus2",
      title: t("upload.bonus") + " 2", 
      description: "Produto adicional em PDF",
      icon: <Gift className="w-6 h-6" />,
      fieldName: "bonus2",
    },
    {
      id: "bonus3",
      title: t("upload.bonus") + " 3",
      description: "Produto adicional em PDF",
      icon: <Gift className="w-6 h-6" />,
      fieldName: "bonus3",
    },
    {
      id: "bonus4",
      title: t("upload.bonus") + " 4",
      description: "Produto adicional em PDF",
      icon: <Gift className="w-6 h-6" />,
      fieldName: "bonus4",
    },
    {
      id: "bonus5",
      title: t("upload.bonus") + " 5",
      description: "Produto adicional em PDF",
      icon: <Gift className="w-6 h-6" />,
      fieldName: "bonus5",
    },
    {
      id: "bonus6",
      title: t("upload.bonus") + " 6",
      description: "Produto adicional em PDF",
      icon: <Gift className="w-6 h-6" />,
      fieldName: "bonus6",
    },
    {
      id: "bonus7",
      title: t("upload.bonus") + " 7",
      description: "Produto adicional em PDF",
      icon: <Gift className="w-6 h-6" />,
      fieldName: "bonus7",
    },
  ];

  const handleFileSelect = async (blockId: string, fieldName: keyof ReturnType<typeof useAppBuilder>['appData'], file: File) => {
    setLoadingStates(prev => ({ ...prev, [blockId]: true }));
    try {
      await handleFileUpload(fieldName, file, blockId);
    } finally {
      setLoadingStates(prev => ({ ...prev, [blockId]: false }));
    }
  };

  const handleImportById = async () => {
    if (!importData.appId.trim()) return;
    
    if (userPlan === 'Essencial') {
      toast({
        title: "Recurso não disponível",
        description: "Importar app está disponível apenas nos planos Profissional e Empresarial.",
        variant: "destructive",
      });
      return;
    }
    
    setIsImporting(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Usuário não logado');

      const { data: app, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', importData.appId.trim())
        .single();

      if (error) throw error;
      
      if (!app) {
        toast({
          title: "App não encontrado",
          description: "Verifique se o ID está correto.",
          variant: "destructive",
        });
        return;
      }

      // Verificar se o usuário é o proprietário do app
      if (app.user_id !== currentUser.id) {
        toast({
          title: "Acesso negado",
          description: "Você só pode importar seus próprios apps.",
          variant: "destructive",
        });
        return;
      }

      // Preencher dados do app
      const importedData = {
        appName: app.nome || 'Meu App PLR',
        appDescription: 'PLR Products',
        appColor: app.cor || '#4783F6',
        customLink: app.link_personalizado || '',
        appIcon: app.icone_url ? { id: 'icon', name: 'icon', url: app.icone_url } : undefined,
        appCover: app.capa_url ? { id: 'cover', name: 'cover', url: app.capa_url } : undefined,
        mainProduct: app.produto_principal_url ? { id: 'main', name: 'main', url: app.produto_principal_url } : undefined,
        bonus1: app.bonus1_url ? { id: 'bonus1', name: 'bonus1', url: app.bonus1_url } : undefined,
        bonus2: app.bonus2_url ? { id: 'bonus2', name: 'bonus2', url: app.bonus2_url } : undefined,
        bonus3: app.bonus3_url ? { id: 'bonus3', name: 'bonus3', url: app.bonus3_url } : undefined,
        bonus4: app.bonus4_url ? { id: 'bonus4', name: 'bonus4', url: app.bonus4_url } : undefined,
        bonus5: (app as any).bonus5_url ? { id: 'bonus5', name: 'bonus5', url: (app as any).bonus5_url } : undefined,
        bonus6: (app as any).bonus6_url ? { id: 'bonus6', name: 'bonus6', url: (app as any).bonus6_url } : undefined,
        bonus7: (app as any).bonus7_url ? { id: 'bonus7', name: 'bonus7', url: (app as any).bonus7_url } : undefined,
      };

      // Atualizar todos os campos
      Object.entries(importedData).forEach(([key, value]) => {
        if (value !== undefined) {
          appBuilder.updateAppData(key as keyof typeof importedData, value);
        }
      });

      toast({
        title: "App importado com sucesso!",
        description: `Dados do app "${app.nome}" foram carregados.`,
      });

      setImportData({ json: "", appId: "" });
    } catch (error) {
      console.error('Erro ao importar app:', error);
      toast({
        title: "Erro ao importar",
        description: "Não foi possível importar o app. Verifique o ID.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const exportAppAsJson = () => {
    const exportData = {
      appName: appData.appName,
      appColor: appData.appColor,
      customLink: appData.customLink,
      appIcon: appData.appIcon,
      appCover: appData.appCover,
      mainProduct: appData.mainProduct,
      bonus1: appData.bonus1,
      bonus2: appData.bonus2,
      bonus3: appData.bonus3,
      bonus4: appData.bonus4,
      bonus5: appData.bonus5,
      bonus6: appData.bonus6,
      bonus7: appData.bonus7,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${appData.appName.replace(/[^a-zA-Z0-9]/g, '_')}_backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Backup criado!",
      description: "Arquivo JSON baixado com sucesso.",
    });
  };

  const handleJsonFileSelect = () => {
    if (userPlan === 'Essencial') {
      toast({
        title: "Recurso não disponível",
        description: "Importar app está disponível apenas nos planos Profissional e Empresarial.",
        variant: "destructive",
      });
      return;
    }
    jsonFileInputRef.current?.click();
  };

  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result as string;
        const jsonData = JSON.parse(jsonContent);
        
        // Validar estrutura do JSON
        if (!jsonData.appName && !jsonData.nome) {
          throw new Error("Formato JSON inválido");
        }

        // Preencher dados do app
        const importedData = {
          appName: jsonData.appName || jsonData.nome || 'Meu App PLR',
          appDescription: jsonData.appDescription || 'PLR Products',
          appColor: jsonData.appColor || jsonData.cor || '#4783F6',
          customLink: jsonData.customLink || jsonData.link_personalizado || '',
          appIcon: jsonData.appIcon || (jsonData.icone_url ? { id: 'icon', name: 'icon', url: jsonData.icone_url } : undefined),
          appCover: jsonData.appCover || (jsonData.capa_url ? { id: 'cover', name: 'cover', url: jsonData.capa_url } : undefined),
          mainProduct: jsonData.mainProduct || (jsonData.produto_principal_url ? { id: 'main', name: 'main', url: jsonData.produto_principal_url } : undefined),
          bonus1: jsonData.bonus1 || (jsonData.bonus1_url ? { id: 'bonus1', name: 'bonus1', url: jsonData.bonus1_url } : undefined),
        bonus2: jsonData.bonus2 || (jsonData.bonus2_url ? { id: 'bonus2', name: 'bonus2', url: jsonData.bonus2_url } : undefined),
        bonus3: jsonData.bonus3 || (jsonData.bonus3_url ? { id: 'bonus3', name: 'bonus3', url: jsonData.bonus3_url } : undefined),
        bonus4: jsonData.bonus4 || (jsonData.bonus4_url ? { id: 'bonus4', name: 'bonus4', url: jsonData.bonus4_url } : undefined),
        bonus5: jsonData.bonus5 || (jsonData.bonus5_url ? { id: 'bonus5', name: 'bonus5', url: jsonData.bonus5_url } : undefined),
        bonus6: jsonData.bonus6 || (jsonData.bonus6_url ? { id: 'bonus6', name: 'bonus6', url: jsonData.bonus6_url } : undefined),
        bonus7: jsonData.bonus7 || (jsonData.bonus7_url ? { id: 'bonus7', name: 'bonus7', url: jsonData.bonus7_url } : undefined),
        };

        // Atualizar todos os campos
        Object.entries(importedData).forEach(([key, value]) => {
          if (value !== undefined) {
            appBuilder.updateAppData(key as keyof typeof importedData, value);
          }
        });

        toast({
          title: "JSON importado com sucesso!",
          description: "Dados do arquivo foram carregados.",
        });

        setImportData({ json: "", appId: "" });
      } catch (error) {
        console.error('Erro ao processar JSON:', error);
        toast({
          title: "Erro no JSON",
          description: "Arquivo JSON inválido ou formato incompatível.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Upload Blocks */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {t("upload.title")}
        </h2>
        
        {uploadBlocks.filter((block, index) => {
          // Show main product (index 0) + allowed bonus products based on plan
          return index < maxProducts;
        }).map((block) => {
          const uploadedFile = appData[block.fieldName] as any;
          const hasFile = uploadedFile?.url;
          const isBlockLoading = loadingStates[block.id];
          
          return (
            <Card 
              key={block.id} 
              className={`bg-app-surface border-app-border p-4 transition-smooth ${
                hasFile ? 'border-primary/30 bg-primary/5' : 'hover:bg-app-surface-hover'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-smooth ${
                  hasFile ? 'bg-primary/20 text-primary' : 'bg-app-surface-hover text-app-muted'
                }`}>
                  {hasFile ? <Check className="w-6 h-6" /> : block.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{block.title}</h3>
                  <p className="text-sm text-app-muted">{block.description}</p>
                  {hasFile && (
                    <p className="text-xs text-primary mt-1">
                      ✓ {uploadedFile.name || 'Arquivo carregado'}
                    </p>
                  )}
                </div>

                <div className="upload-zone w-32 h-16 flex flex-col items-center justify-center relative cursor-pointer border-2 border-dashed border-app-border rounded-lg hover:border-primary/50 transition-smooth">
                  {isBlockLoading ? (
                    <div className="flex items-center justify-center">
                      <span className="text-xs text-app-muted">Enviando...</span>
                    </div>
                  ) : hasFile ? (
                    <div className="flex flex-col items-center text-primary">
                      <Check className="w-5 h-5 mb-1" />
                      <span className="text-xs">Enviado</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-app-muted mb-1" />
                      <span className="text-xs text-app-muted">{t("upload.send")}</span>
                    </>
                  )}
                  <Input
                    type="file"
                    accept=".pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    disabled={isBlockLoading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Validar se é PDF
                        if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
                          toast({
                            title: "Formato não suportado",
                            description: "Apenas arquivos PDF são aceitos.",
                            variant: "destructive",
                          });
                          return;
                        }
                        handleFileSelect(block.id, block.fieldName, file);
                      }
                    }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
        
        {/* PDF Download Control */}
        <div className="flex items-center space-x-2 mt-4 p-3 bg-app-surface-hover rounded-lg border border-app-border">
          <Checkbox
            id="allow-pdf-download"
            checked={appData.allowPdfDownload}
            onCheckedChange={(checked) => updateAppData('allowPdfDownload', checked)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label htmlFor="allow-pdf-download" className="text-sm text-foreground cursor-pointer">
            Permitir download do PDF
          </Label>
        </div>
      </div>

      {/* Import Existing App */}
      <PremiumOverlay
        isBlocked={!hasAppImport}
        title="Importação de Apps"
        description="Importe dados de apps existentes usando JSON ou ID"
        requiredPlan={getRequiredPlan('hasAppImport')}
        variant="overlay"
      >
        <Card className="bg-app-surface border-app-border p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-app-surface-hover rounded-lg flex items-center justify-center">
              <FolderUp className="w-6 h-6 text-app-muted" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <h3 className="font-medium text-foreground">{t("import.title")}</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <FolderUp className="w-4 h-4 text-app-muted" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-app-surface border-app-border">
                      <p className="max-w-xs">
                        Importe dados de um app previamente criado usando JSON ou ID do app. Disponível apenas nos planos Profissional e Empresarial.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="json-import" className="text-sm text-app-muted">
                    Selecione o JSON do app
                  </Label>
                  <div className="flex space-x-2 mt-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex-1">
                            <Button 
                              variant="outline" 
                              className="w-full border-app-border justify-start"
                              onClick={handleJsonFileSelect}
                              disabled={isImporting || userPlan === 'Essencial'}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Selecionar arquivo JSON
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {userPlan === 'Essencial' && (
                          <TooltipContent className="bg-app-surface border-app-border">
                            <p>Importar app está disponível apenas nos planos Profissional e Empresarial.</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                    {(userPlan === 'Profissional' || userPlan === 'Empresarial') && (
                      <Button 
                        variant="outline" 
                        onClick={exportAppAsJson}
                        className="border-app-border"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Backup
                      </Button>
                    )}
                    <input
                      ref={jsonFileInputRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleJsonFileChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="id-import" className="text-sm text-app-muted">
                    {t("import.id")}
                  </Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="id-import"
                      placeholder={t("import.id.placeholder")}
                      value={importData.appId}
                      onChange={(e) => setImportData(prev => ({ ...prev, appId: e.target.value }))}
                      className="bg-app-surface-hover border-app-border"
                      disabled={userPlan === 'Essencial'}
                    />
                    <Button 
                      size="sm" 
                      className="bg-gradient-neon"
                      disabled={!importData.appId.trim() || isImporting || userPlan === 'Essencial'}
                      onClick={handleImportById}
                    >
                      {isImporting ? "Importando..." : t("import.button")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </PremiumOverlay>
    </div>
  );
};

export default UploadSection;