import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Globe, ArrowLeft, ArrowRight, Check, ChevronDown, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFeatureAccess, getRequiredPlan } from "@/hooks/useFeatureAccess";
import PremiumOverlay from "@/components/ui/premium-overlay";

interface CustomDomainDialogProps {
  children: React.ReactNode;
}

const CustomDomainDialog = ({ children }: CustomDomainDialogProps) => {
  const { hasCustomDomain } = useFeatureAccess();
  const [currentStep, setCurrentStep] = useState(1);
  const [domain, setDomain] = useState("");
  const [isCloudflareDetected, setIsCloudflareDetected] = useState(false);
  const [isRecordAdded, setIsRecordAdded] = useState(false);
  const [isSubdomainOpen, setIsSubdomainOpen] = useState(false);
  const [isTxtOpen, setIsTxtOpen] = useState(false);

  const handleDomainChange = (value: string) => {
    setDomain(value);
    // Simular detecção do Cloudflare (em uma implementação real, seria uma consulta DNS)
    setIsCloudflareDetected(value.includes("cloudflare") || value.endsWith(".com"));
  };

  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleManualConnection = () => {
    setCurrentStep(4);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Tela 1 - Introdução/Escolha
  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Usar um domínio personalizado</h2>
        <p className="text-muted-foreground">Transmita profissionalismo com um domínio personalizado</p>
      </div>

      <Card className="cursor-pointer border-2 border-primary/20 bg-primary/5 hover:border-primary/40 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary"></div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Use seu próprio domínio</h3>
              <p className="text-sm text-muted-foreground">Conecte seu domínio de terceiros</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="text-center text-sm text-muted-foreground space-y-2 px-4">
          <p>Você precisa fazer login no seu provedor de domínio para atualizar seus registros de DNS.</p>
          <p>Não podemos fazer essas alterações por você, mas podemos te ajudar com um passo a passo.</p>
          <a 
            href="#" 
            className="text-primary hover:text-primary/80 underline font-medium inline-flex items-center gap-1 transition-colors"
          >
            Ver os passos
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleContinue} className="bg-primary hover:bg-primary/90">
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Tela 2 - Inserir domínio
  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Use seu próprio domínio</h2>
        <p className="text-muted-foreground">Você tem um domínio de outro provedor? Conecte esse domínio.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Input
            placeholder="Ex.: example.com"
            value={domain}
            onChange={(e) => handleDomainChange(e.target.value)}
            className="text-center text-lg h-12"
          />
        </div>

        {isCloudflareDetected && domain && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Cloudflare detectado!</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                Podemos conectar automaticamente seu domínio.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={!domain}
          className="bg-primary hover:bg-primary/90"
        >
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Tela 3 - Conexão automática
  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Conexão Automática</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Parece que o domínio <strong>{domain}</strong> está registrado no provedor Cloudflare. 
            Boas notícias! Com o Cloudflare, seu domínio pode ser conectado automaticamente.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={handleContinue}
          className="w-full h-12 bg-primary hover:bg-primary/90"
          size="lg"
        >
          Fazer login e conectar automaticamente
        </Button>
        
        <div className="text-center">
          <button
            onClick={handleManualConnection}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Ou conectar de forma manual
          </button>
        </div>
      </div>

      <div className="flex justify-start">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    </div>
  );

  // Tela 4 - Configuração DNS
  const renderStep4 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Acesse o site do seu provedor de domínio</h2>
        <p className="text-muted-foreground">Na página de configurações de DNS, atualize seus registros seguindo estes passos.</p>
      </div>

      <div className="space-y-4">
        {/* Registro A principal */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="space-y-3">
              <h3 className="font-medium text-foreground">Adicionar registro A</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-muted-foreground">Nome/host:</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded">@</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("@")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground">Valor/Direciona a:</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded">103.169.142.0</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("103.169.142.0")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                variant={isRecordAdded ? "secondary" : "default"}
                onClick={() => setIsRecordAdded(!isRecordAdded)}
                className="w-full"
              >
                {isRecordAdded ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Registro adicionado
                  </>
                ) : (
                  "Registro adicionado"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Registro A para subdomínio */}
        <Collapsible open={isSubdomainOpen} onOpenChange={setIsSubdomainOpen}>
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Registro A para subdomínio</h3>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isSubdomainOpen && "rotate-180")} />
                </div>
              </CardContent>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Nome/host:</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="bg-muted px-2 py-1 rounded">www</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("www")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Valor/Direciona a:</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="bg-muted px-2 py-1 rounded">103.169.142.0</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("103.169.142.0")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Registro TXT */}
        <Collapsible open={isTxtOpen} onOpenChange={setIsTxtOpen}>
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Registro TXT para verificar titularidade</h3>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isTxtOpen && "rotate-180")} />
                </div>
              </CardContent>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Nome/host:</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="bg-muted px-2 py-1 rounded">@</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("@")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Valor:</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="bg-muted px-2 py-1 rounded text-xs">lovable-verify=abc123def456</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("lovable-verify=abc123def456")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="flex justify-start">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <PremiumOverlay
          isBlocked={!hasCustomDomain}
          title="Domínio Personalizado"
          description="Configure seu próprio domínio para transmitir mais profissionalismo"
          requiredPlan={getRequiredPlan('hasCustomDomain')}
          variant="overlay"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Domínio Personalizado</span>
              </div>
              <div className="text-sm text-muted-foreground font-normal">
                {currentStep}/4
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {/* Progress bar */}
          <div className="w-full bg-muted h-2 rounded-full mb-6">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>

          {renderCurrentStep()}
        </PremiumOverlay>
      </DialogContent>
    </Dialog>
  );
};

export default CustomDomainDialog;