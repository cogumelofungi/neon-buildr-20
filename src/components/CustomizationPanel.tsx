import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw, Upload, Palette, Type, Image, Link, Globe, Layout, Lock, Crown } from "lucide-react";
import { useAppBuilder } from "@/hooks/useAppBuilder";
import { useLanguage } from "@/hooks/useLanguage";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { usePremiumTemplates } from "@/hooks/usePremiumTemplates";
import { useFeatureAccess, getRequiredPlan } from "@/hooks/useFeatureAccess";
import CustomDomainDialog from "./CustomDomainDialog";
import PremiumOverlay from "@/components/ui/premium-overlay";

interface CustomizationPanelProps {
  appBuilder: ReturnType<typeof useAppBuilder>;
}

const CustomizationPanel = ({ appBuilder }: CustomizationPanelProps) => {
  const { t } = useLanguage();
  const { maxProducts } = usePlanLimits();
  const { hasPremiumAccess, isLoading: premiumLoading } = usePremiumTemplates();
  const { hasCustomDomain, hasAppImport } = useFeatureAccess();
  const appData = appBuilder?.appData || {
    appName: '', 
    appDescription: '',
    appColor: '#4783F6', 
    customLink: '', 
    customDomain: '',
    allowPdfDownload: true,
    template: 'classic' as 'classic' | 'corporate' | 'showcase',
    appIcon: undefined, 
    appCover: undefined,
    mainProduct: undefined,
    mainProductThumbnail: undefined,
    bonus1: undefined,
    bonus1Thumbnail: undefined,
    bonus2: undefined,
    bonus2Thumbnail: undefined,
    bonus3: undefined,
    bonus3Thumbnail: undefined,
    bonus4: undefined,
    bonus4Thumbnail: undefined,
    bonus5: undefined,
    bonus5Thumbnail: undefined,
    bonus6: undefined,
    bonus6Thumbnail: undefined,
    bonus7: undefined,
    bonus7Thumbnail: undefined,
    mainProductLabel: 'PRODUTO PRINCIPAL',
    mainProductDescription: 'Disponível para download',
    bonusesLabel: 'BÔNUS EXCLUSIVOS',
    bonus1Label: 'Bônus 1',
    bonus2Label: 'Bônus 2',
    bonus3Label: 'Bônus 3',
    bonus4Label: 'Bônus 4',
    bonus5Label: 'Bônus 5',
    bonus6Label: 'Bônus 6',
    bonus7Label: 'Bônus 7'
  };
  const updateAppData = appBuilder?.updateAppData || (() => {});
  const handleFileUpload = appBuilder?.handleFileUpload || (() => Promise.resolve());
  const resetApp = appBuilder?.resetApp || (() => Promise.resolve());
  const isLoading = appBuilder?.isLoading || false;

  return (
    <Card className="bg-app-surface border-app-border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{t("custom.title")}</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetApp}
          disabled={isLoading}
          className="border-app-border hover:bg-app-surface-hover"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {t("custom.reset")}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-app-surface-hover">
          <TabsTrigger value="general" className="data-[state=active]:bg-background">Geral</TabsTrigger>
          <TabsTrigger value="labels" className="data-[state=active]:bg-background">Textos e Rótulos</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          {/* App Name */}
          <div className="space-y-2">
            <Label htmlFor="app-name" className="flex items-center space-x-2 text-foreground">
              <Type className="w-4 h-4" />
              <span>{t("custom.name")}</span>
            </Label>
            <Input
              id="app-name"
              value={appData.appName}
              onChange={(e) => updateAppData('appName', e.target.value)}
              placeholder={t("custom.name.placeholder")}
              className="bg-app-surface-hover border-app-border focus:border-primary"
            />
          </div>

          {/* App Description */}
          <div className="space-y-2">
            <Label htmlFor="app-description" className="flex items-center space-x-2 text-foreground">
              <Type className="w-4 h-4" />
              <span>Descrição do App</span>
            </Label>
            <Input
              id="app-description"
              value={appData.appDescription}
              onChange={(e) => updateAppData('appDescription', e.target.value)}
              placeholder="Descrição que aparece no app..."
              className="bg-app-surface-hover border-app-border focus:border-primary"
            />
          </div>

          {/* App Color */}
          <div className="space-y-2">
            <Label htmlFor="app-color" className="flex items-center space-x-2 text-foreground">
              <Palette className="w-4 h-4" />
              <span>{t("custom.color")}</span>
            </Label>
            <div className="flex space-x-3">
              <Input
                id="app-color"
                type="color"
                value={appData.appColor}
                onChange={(e) => updateAppData('appColor', e.target.value)}
                className="w-16 h-10 bg-app-surface-hover border-app-border cursor-pointer"
              />
              <Input
                value={appData.appColor}
                onChange={(e) => updateAppData('appColor', e.target.value)}
                placeholder="#4783F6"
                className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
              />
            </div>
          </div>

          {/* App Icon Upload */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2 text-foreground">
              <Upload className="w-4 h-4" />
              <span>{t("custom.icon")}</span>
            </Label>
            <div className="upload-zone relative cursor-pointer hover:bg-app-surface-hover rounded-xl transition-colors">
              <div className="flex flex-col items-center space-y-2 p-4">
                <div className="w-16 h-16 bg-app-surface-hover rounded-xl flex items-center justify-center">
                  {appData.appIcon ? (
                    <img 
                      src={appData.appIcon.url} 
                      alt="App Icon" 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <Upload className="w-6 h-6 text-app-muted" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-foreground">PNG 512x512</p>
                  <p className="text-xs text-app-muted">Fundo transparente recomendado</p>
                </div>
              </div>
              <Input
                type="file"
                accept=".png"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('appIcon', file, 'icon');
                }}
              />
            </div>
          </div>

          {/* App Cover Upload */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2 text-foreground">
              <Image className="w-4 h-4" />
              <span>{t("custom.cover")}</span>
            </Label>
            <div className="upload-zone relative cursor-pointer hover:bg-app-surface-hover rounded-xl transition-colors">
              <div className="flex flex-col items-center space-y-2 p-4">
                <div className="w-full h-24 bg-app-surface-hover rounded-xl flex items-center justify-center overflow-hidden">
                  {appData.appCover ? (
                    <img 
                      src={appData.appCover.url} 
                      alt="App Cover" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-8 h-8 text-app-muted" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-foreground">PNG ou JPG 1920x1080</p>
                  <p className="text-xs text-app-muted">Imagem de fundo do app</p>
                </div>
              </div>
              <Input
                type="file"
                accept=".png,.jpg,.jpeg"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('appCover', file, 'cover');
                }}
              />
            </div>
          </div>

          {/* Custom Link */}
          <div className="space-y-2">
            <Label htmlFor="custom-link" className="flex items-center space-x-2 text-foreground">
              <Link className="w-4 h-4" />
              <span>{t("custom.link")}</span>
            </Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-app-muted">preview--neon-buildr-86.lovable.app/app/</span>
              <Input
                id="custom-link"
                value={appData.customLink}
                onChange={(e) => updateAppData('customLink', e.target.value)}
                placeholder={t("custom.link.placeholder")}
                className="bg-app-surface-hover border-app-border focus:border-primary"
              />
            </div>
            <p className="text-xs text-app-muted">
              {t("custom.link.help")}
            </p>
          </div>

          {/* Custom Domain */}
          <div className="space-y-3">
            <CustomDomainDialog>
              <Button 
                variant="ghost" 
                className="h-auto p-0 justify-start text-foreground"
              >
                <Globe className="w-4 h-4 mr-2" />
                <span className="underline">Domínio Próprio</span>
              </Button>
            </CustomDomainDialog>
          </div>
        </TabsContent>


        <TabsContent value="labels" className="space-y-6 mt-6">
          {/* Main Product Label */}
          <div className="space-y-2">
            <Label htmlFor="main-product-label" className="flex items-center space-x-2 text-foreground">
              <Type className="w-4 h-4" />
              <span>Título do Produto Principal</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                id="main-product-label"
                value={appData.mainProductLabel}
                onChange={(e) => updateAppData('mainProductLabel', e.target.value)}
                placeholder="PRODUTO PRINCIPAL"
                className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
              />
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                  title="Upload de miniatura PWA"
                >
                  {appData.mainProductThumbnail ? (
                    <img 
                      src={appData.mainProductThumbnail.url} 
                      alt="Miniatura Principal" 
                      className="w-6 h-6 rounded object-cover"
                    />
                  ) : (
                    <Image className="w-4 h-4 text-app-muted" />
                  )}
                </Button>
                <Input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('mainProductThumbnail', file, 'main-thumbnail');
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-app-muted">Clique no ícone para fazer upload da miniatura PWA (PNG/JPG 512x512)</p>
          </div>

          {/* Main Product Description */}
          <div className="space-y-2">
            <Label htmlFor="main-product-description" className="flex items-center space-x-2 text-foreground">
              <Type className="w-4 h-4" />
              <span>Descrição do Produto Principal</span>
            </Label>
            <Input
              id="main-product-description"
              type="text"
              value={appData.mainProductDescription}
              onChange={(e) => updateAppData('mainProductDescription', e.target.value)}
              placeholder="Disponível para download"
              className="bg-app-surface-hover border-app-border focus:border-primary"
            />
          </div>

          {/* Bonuses Label */}
          {maxProducts > 1 && (
            <div className="space-y-2">
              <Label htmlFor="bonuses-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>Título da Seção de Bônus</span>
              </Label>
              <Input
                id="bonuses-label"
                value={appData.bonusesLabel}
                onChange={(e) => updateAppData('bonusesLabel', e.target.value)}
                placeholder="BÔNUS EXCLUSIVOS"
                className="bg-app-surface-hover border-app-border focus:border-primary"
              />
            </div>
          )}

          {/* Bonus 1 Label */}
          {maxProducts > 1 && (
            <div className="space-y-2">
              <Label htmlFor="bonus1-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>Nome do Bônus 1</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus1-label"
                  value={appData.bonus1Label}
                  onChange={(e) => updateAppData('bonus1Label', e.target.value)}
                  placeholder="Bônus 1"
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title="Upload de miniatura PWA"
                  >
                    {appData.bonus1Thumbnail ? (
                      <img 
                        src={appData.bonus1Thumbnail.url} 
                        alt="Miniatura Bônus 1" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-app-muted" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('bonus1Thumbnail', file, 'bonus1-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bonus 2 Label */}
          {maxProducts > 2 && (
            <div className="space-y-2">
              <Label htmlFor="bonus2-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>Nome do Bônus 2</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus2-label"
                  value={appData.bonus2Label}
                  onChange={(e) => updateAppData('bonus2Label', e.target.value)}
                  placeholder="Bônus 2"
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title="Upload de miniatura PWA"
                  >
                    {appData.bonus2Thumbnail ? (
                      <img 
                        src={appData.bonus2Thumbnail.url} 
                        alt="Miniatura Bônus 2" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-app-muted" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('bonus2Thumbnail', file, 'bonus2-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bonus 3 Label */}
          {maxProducts > 3 && (
            <div className="space-y-2">
              <Label htmlFor="bonus3-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>Nome do Bônus 3</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus3-label"
                  value={appData.bonus3Label}
                  onChange={(e) => updateAppData('bonus3Label', e.target.value)}
                  placeholder="Bônus 3"
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title="Upload de miniatura PWA"
                  >
                    {appData.bonus3Thumbnail ? (
                      <img 
                        src={appData.bonus3Thumbnail.url} 
                        alt="Miniatura Bônus 3" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-app-muted" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('bonus3Thumbnail', file, 'bonus3-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bonus 4 Label */}
          {maxProducts > 4 && (
            <div className="space-y-2">
              <Label htmlFor="bonus4-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>Nome do Bônus 4</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus4-label"
                  value={appData.bonus4Label}
                  onChange={(e) => updateAppData('bonus4Label', e.target.value)}
                  placeholder="Bônus 4"
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title="Upload de miniatura PWA"
                  >
                    {appData.bonus4Thumbnail ? (
                      <img 
                        src={appData.bonus4Thumbnail.url} 
                        alt="Miniatura Bônus 4" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-app-muted" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('bonus4Thumbnail', file, 'bonus4-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bonus 5 Label */}
          {maxProducts > 5 && (
            <div className="space-y-2">
              <Label htmlFor="bonus5-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>Nome do Bônus 5</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus5-label"
                  value={appData.bonus5Label}
                  onChange={(e) => updateAppData('bonus5Label', e.target.value)}
                  placeholder="Bônus 5"
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title="Upload de miniatura PWA"
                  >
                    {appData.bonus5Thumbnail ? (
                      <img 
                        src={appData.bonus5Thumbnail.url} 
                        alt="Miniatura Bônus 5" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-app-muted" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('bonus5Thumbnail', file, 'bonus5-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bonus 6 Label */}
          {maxProducts > 6 && (
            <div className="space-y-2">
              <Label htmlFor="bonus6-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>Nome do Bônus 6</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus6-label"
                  value={appData.bonus6Label}
                  onChange={(e) => updateAppData('bonus6Label', e.target.value)}
                  placeholder="Bônus 6"
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title="Upload de miniatura PWA"
                  >
                    {appData.bonus6Thumbnail ? (
                      <img 
                        src={appData.bonus6Thumbnail.url} 
                        alt="Miniatura Bônus 6" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-app-muted" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('bonus6Thumbnail', file, 'bonus6-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bonus 7 Label */}
          {maxProducts > 7 && (
            <div className="space-y-2">
              <Label htmlFor="bonus7-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>Nome do Bônus 7</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus7-label"
                  value={appData.bonus7Label}
                  onChange={(e) => updateAppData('bonus7Label', e.target.value)}
                  placeholder="Bônus 7"
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title="Upload de miniatura PWA"
                  >
                    {appData.bonus7Thumbnail ? (
                      <img 
                        src={appData.bonus7Thumbnail.url} 
                        alt="Miniatura Bônus 7" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-app-muted" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('bonus7Thumbnail', file, 'bonus7-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CustomizationPanel;