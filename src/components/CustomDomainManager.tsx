import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Plus, Trash2, Check, Loader2, Key, Link as LinkIcon, Image } from "lucide-react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import PremiumOverlay from "@/components/ui/premium-overlay";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface App {
  id: string;
  nome: string;
  slug: string;
  status: string;
}

interface DomainMapping {
  id: string;
  path: string;
  app_id: string;
  app_link: string;
}

interface CustomDomain {
  id: string;
  domain: string;
  verification_code: string;
  is_verified: boolean;
  status: string;
  favicon_url: string | null;
}

interface CustomDomainManagerProps {
  children: React.ReactNode;
}

const CustomDomainManager = ({ children }: CustomDomainManagerProps) => {
  const { hasCustomDomain } = useFeatureAccess();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Estados do formulário
  const [tokenInput, setTokenInput] = useState("");
  const [activeDomain, setActiveDomain] = useState<CustomDomain | null>(null);
  const [userApps, setUserApps] = useState<App[]>([]);
  const [mappings, setMappings] = useState<DomainMapping[]>([]);
  
  // Estados para novo mapeamento
  const [newPath, setNewPath] = useState("");
  const [selectedAppId, setSelectedAppId] = useState("");
  
  // Estado para favicon
  const [faviconUrl, setFaviconUrl] = useState("");
  const [isSavingFavicon, setIsSavingFavicon] = useState(false);
  
  // Ref para controlar se o dialog foi aberto pelo usuário
  const userOpenedRef = React.useRef(false);

  // Carregar dados iniciais apenas uma vez quando o dialog abre
  useEffect(() => {
    if (isOpen && userOpenedRef.current) {
      setIsInitialLoading(true);
      Promise.all([loadUserApps(), loadUserDomain()]).finally(() => {
        setIsInitialLoading(false);
      });
    }
  }, [isOpen]);
  
  // Prevenir fechamento automático ao mudar de aba
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Não fazer nada - manter o estado atual
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadUserApps = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("apps")
        .select("id, nome, slug, status")
        .eq("user_id", user.id)
        .eq("status", "publicado");

      if (error) throw error;
      setUserApps(data || []);
    } catch (error) {
      console.error("Erro ao carregar apps:", error);
    }
  };

  const loadUserDomain = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: domains, error } = await supabase
        .from("custom_domains")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_verified", true)
        .limit(1);

      if (error) throw error;

      if (domains && domains.length > 0) {
        const domain = domains[0];
        setActiveDomain({
          id: domain.id,
          domain: domain.domain,
          verification_code: domain.verification_code,
          is_verified: domain.is_verified || false,
          status: domain.status,
          favicon_url: domain.favicon_url || null
        });
        setFaviconUrl(domain.favicon_url || "");
        loadMappings(domain.id);
      }
    } catch (error) {
      console.error("Erro ao carregar domínio:", error);
    }
  };

  const loadMappings = async (domainId: string) => {
    try {
      const { data, error } = await supabase
        .from("domain_app_mappings")
        .select("*")
        .eq("custom_domain_id", domainId)
        .order("path");

      if (error) throw error;
      setMappings(data || []);
    } catch (error) {
      console.error("Erro ao carregar mapeamentos:", error);
    }
  };

  const activateWithToken = async () => {
    if (!tokenInput.trim()) {
      toast({
        title: "Token obrigatório",
        description: "Digite o token de verificação do domínio",
        variant: "destructive"
      });
      return;
    }

    setIsActivating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado");

      // Chamar Edge Function com service role para fazer o claim
      const response = await fetch(
        "https://jboartixfhvifdecdufq.supabase.co/functions/v1/claim-domain",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ verification_code: tokenInput.trim() }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Erro ao ativar",
          description: result.error || "Não foi possível ativar o domínio",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Domínio ativado!",
        description: `O domínio ${result.domain.domain} foi vinculado à sua conta`
      });

      setActiveDomain({
        id: result.domain.id,
        domain: result.domain.domain,
        verification_code: result.domain.verification_code,
        is_verified: true,
        status: "active",
        favicon_url: result.domain.favicon_url || null
      });
      setFaviconUrl(result.domain.favicon_url || "");
      setTokenInput("");
      loadMappings(result.domain.id);

    } catch (error: any) {
      console.error("Erro ao ativar domínio:", error);
      toast({
        title: "Erro ao ativar",
        description: error.message || "Não foi possível ativar o domínio",
        variant: "destructive"
      });
    } finally {
      setIsActivating(false);
    }
  };

  const addMapping = async () => {
    if (!activeDomain || !selectedAppId) {
      toast({
        title: "Selecione um app",
        description: "Escolha um app para vincular ao domínio",
        variant: "destructive"
      });
      return;
    }

    const app = userApps.find(a => a.id === selectedAppId);
    if (!app) return;

    // Formatar path
    let path = newPath.trim() || "/";
    if (path !== "/" && !path.startsWith("/")) {
      path = "/" + path;
    }
    // Remover barras finais
    if (path !== "/" && path.endsWith("/")) {
      path = path.slice(0, -1);
    }

    // Verificar se path já existe
    if (mappings.some(m => m.path === path)) {
      toast({
        title: "Path já existe",
        description: `O path "${path}" já está mapeado para outro app`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // O path do domínio é INDEPENDENTE do slug do app
      // Isso permite usar paths como /assinatura, /pricing sem conflitos
      const appLink = `https://migrabook.app/${app.slug}`;

      const { error } = await supabase
        .from("domain_app_mappings")
        .insert({
          custom_domain_id: activeDomain.id,
          path,
          app_id: selectedAppId,
          app_link: appLink
        });

      if (error) throw error;

      toast({
        title: "Mapeamento criado!",
        description: `${activeDomain.domain}${path} → ${app.nome}`
      });

      setNewPath("");
      setSelectedAppId("");
      loadMappings(activeDomain.id);

    } catch (error: any) {
      console.error("Erro ao criar mapeamento:", error);
      toast({
        title: "Erro ao criar mapeamento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMapping = async (mappingId: string) => {
    try {
      const { error } = await supabase
        .from("domain_app_mappings")
        .delete()
        .eq("id", mappingId);

      if (error) throw error;

      toast({
        title: "Mapeamento removido"
      });

      setMappings(prev => prev.filter(m => m.id !== mappingId));
    } catch (error: any) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getAppName = (appId: string) => {
    const app = userApps.find(a => a.id === appId);
    return app?.nome || "App desconhecido";
  };

  const saveFavicon = async () => {
    if (!activeDomain) return;
    
    setIsSavingFavicon(true);
    try {
      const { error } = await supabase
        .from("custom_domains")
        .update({ favicon_url: faviconUrl.trim() || null })
        .eq("id", activeDomain.id);

      if (error) throw error;

      setActiveDomain(prev => prev ? { ...prev, favicon_url: faviconUrl.trim() || null } : null);
      
      toast({
        title: "Favicon salvo!",
        description: "O favicon será exibido no seu domínio personalizado"
      });
    } catch (error: any) {
      console.error("Erro ao salvar favicon:", error);
      toast({
        title: "Erro ao salvar favicon",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSavingFavicon(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      userOpenedRef.current = true;
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <PremiumOverlay
          isBlocked={!hasCustomDomain}
          title="Domínio Personalizado"
          description="Use seu próprio domínio para seus apps"
          requiredPlan="Pro"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Globe className="w-6 h-6" />
              Domínio Personalizado
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Loading inicial */}
            {isInitialLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {/* Seção 1: Ativação por Token */}
            {!isInitialLoading && !activeDomain && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-medium">
                  <Key className="w-5 h-5" />
                  Ativar Domínio
                </div>
                <p className="text-sm text-muted-foreground">
                  Digite o token de verificação fornecido pelo suporte para vincular seu domínio.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Cole o token de verificação aqui"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={activateWithToken} 
                    disabled={isActivating || !tokenInput.trim()}
                  >
                    {isActivating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Ativar
                  </Button>
                </div>
              </div>
            )}

            {/* Seção 2: Domínio Ativo */}
            {!isInitialLoading && activeDomain && (
              <>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      <span className="font-medium">{activeDomain.domain}</span>
                    </div>
                    <Badge variant="default" className="bg-green-500">
                      Ativo
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Token: {activeDomain.verification_code}
                  </p>
                </div>

                <Separator />

                {/* Seção 3: Mapeamentos existentes */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <LinkIcon className="w-5 h-5" />
                    Mapeamentos de Apps
                  </div>

                  {mappings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum app vinculado ainda. Adicione um mapeamento abaixo.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {mappings.map((mapping) => (
                        <div 
                          key={mapping.id}
                          className="flex items-center justify-between bg-background border rounded-lg p-3"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {activeDomain.domain}{mapping.path}
                              </code>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-medium">{getAppName(mapping.app_id)}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMapping(mapping.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Seção 3.5: Favicon do Domínio */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <Image className="w-5 h-5" />
                    Favicon do Domínio
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Defina o favicon que aparecerá quando acessarem seu domínio personalizado.
                  </p>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>URL do Favicon</Label>
                      <Input
                        placeholder="https://exemplo.com/favicon.ico"
                        value={faviconUrl}
                        onChange={(e) => setFaviconUrl(e.target.value)}
                      />
                    </div>
                    {faviconUrl && (
                      <div className="h-10 w-10 border rounded flex items-center justify-center bg-muted">
                        <img 
                          src={faviconUrl} 
                          alt="Preview" 
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <Button 
                      onClick={saveFavicon}
                      disabled={isSavingFavicon}
                      size="default"
                    >
                      {isSavingFavicon ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Salvar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use uma URL de imagem .ico, .png ou .svg. Recomendado: 32x32px ou 64x64px.
                  </p>
                </div>

                <Separator />

                {/* Seção 4: Adicionar novo mapeamento */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <Plus className="w-5 h-5" />
                    Adicionar Mapeamento
                  </div>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Path (opcional)</Label>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">{activeDomain.domain}</span>
                          <Input
                            placeholder="/"
                            value={newPath}
                            onChange={(e) => setNewPath(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Deixe vazio para a raiz do domínio
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>App</Label>
                        <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um app" />
                          </SelectTrigger>
                          <SelectContent>
                            {userApps.map((app) => (
                              <SelectItem key={app.id} value={app.id}>
                                {app.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {userApps.length === 0 && (
                          <p className="text-xs text-destructive">
                            Você precisa ter apps publicados
                          </p>
                        )}
                      </div>
                    </div>

                    <Button 
                      onClick={addMapping}
                      disabled={isLoading || !selectedAppId}
                      className="w-full"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Adicionar Mapeamento
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </PremiumOverlay>
      </DialogContent>
    </Dialog>
  );
};

export default CustomDomainManager;
