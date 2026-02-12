import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, Upload, Palette, Type, Image, Link, Globe, Layout, Lock, Crown, Bell, Gift, Star, Sparkles, Zap, Trophy, Heart, Award, X } from "lucide-react";
import { useAppBuilder } from "@/hooks/useAppBuilder";
import { useLanguage } from "@/hooks/useLanguage";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { usePremiumTemplates } from "@/hooks/usePremiumTemplates";
import { useFeatureAccess, getRequiredPlan } from "@/hooks/useFeatureAccess";
import { useActiveCustomDomain } from "@/hooks/useActiveCustomDomain";
import PremiumOverlay from "@/components/ui/premium-overlay";
import { getAppDomainForDisplay } from "@/config/domains";

interface CustomizationPanelProps {
  appBuilder: ReturnType<typeof useAppBuilder>;
}

const CustomizationPanel = ({ appBuilder }: CustomizationPanelProps) => {
  const { t } = useLanguage();
  const { maxProducts } = usePlanLimits();
  const { hasPremiumAccess, isLoading: premiumLoading } = usePremiumTemplates();
  const { hasCustomDomain, hasAppImport, hasAppNotifications, hasVideoCourse } = useFeatureAccess();
  const { hasActiveDomain, activeDomain } = useActiveCustomDomain();
  const appData = appBuilder?.appData || {
    appName: 'Meu App', 
    appNameColor: '#ffffff',
    appDescription: 'Descrição do App',
    appDescriptionColor: '#ffffff',
    appColor: '#4783F6',
    appTheme: 'dark' as 'light' | 'dark', 
    customLink: '', 
    customDomain: '',
    allowPdfDownload: false,
    template: 'classic' as 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal' | 'exclusive' | 'units' | 'academy' | 'flow' | 'members' | 'shop',
    videoCourseEnabled: false,
    videoModules: [],
    videoCourseTitle: 'Curso em Vídeo',
    videoCourseDescription: 'Descrição do Curso',
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
    bonus8: undefined,
    bonus8Thumbnail: undefined,
    bonus9: undefined,
    bonus9Thumbnail: undefined,
    mainProductLabel: 'Produto Principal',
    mainProductDescription: 'Descrição do Produto',
    bonusesLabel: 'Bônus',
    bonus1Label: 'Bônus 1',
    bonus2Label: 'Bônus 2',
    bonus3Label: 'Bônus 3',
    bonus4Label: 'Bônus 4',
    bonus5Label: 'Bônus 5',
    bonus6Label: 'Bônus 6',
    bonus7Label: 'Bônus 7',
    bonus8Label: 'Bônus 8',
    bonus9Label: 'Bônus 9',
    bonus1Color: '#3b82f6',
    bonus2Color: '#3b82f6',
    bonus3Color: '#3b82f6',
    bonus4Color: '#3b82f6',
    bonus5Color: '#3b82f6',
    bonus6Color: '#3b82f6',
    bonus7Color: '#3b82f6',
    bonus8Color: '#3b82f6',
    bonus9Color: '#3b82f6',
  viewButtonLabel: 'Ver',
  notificationEnabled: false,
  notificationTitle: '',
  notificationMessage: '',
  notificationImage: undefined,
  notificationLink: '',
  notificationButtonText: '',
  notificationButtonColor: '#FF0000',
  notificationIcon: 'gift',
  whatsappEnabled: false,
  whatsappPhone: '',
  whatsappMessage: '',
  whatsappPosition: 'bottom-right' as 'bottom-right' | 'bottom-left',
  whatsappButtonColor: '#25D366',
  whatsappButtonText: '',
  whatsappShowText: true,
  whatsappIconSize: 'medium' as 'small' | 'medium' | 'large',
  membersHeaderSize: 'large' as 'small' | 'medium' | 'large',
  trainingLogo: undefined,
  training1Cover: undefined,
  training2Cover: undefined,
  training3Cover: undefined,
  training4Cover: undefined,
  showAppIcon: true,
  showcaseTextPosition: 'bottom' as 'bottom' | 'middle' | 'top',
  mainProductBackground: undefined,
  bonus1Background: undefined,
  bonus2Background: undefined,
  bonus3Background: undefined,
  bonus4Background: undefined,
  bonus5Background: undefined,
  bonus6Background: undefined,
  bonus7Background: undefined,
  bonus8Background: undefined,
  bonus9Background: undefined,
  shopRemoveCardBorder: false,
  membersShowCardBorder: false,
  flowShowCardBorder: false
};
  const updateAppData = appBuilder?.updateAppData || (() => {});
  const handleFileUpload = appBuilder?.handleFileUpload || (() => Promise.resolve());
  const resetApp = appBuilder?.resetApp || (() => Promise.resolve());
  const isLoading = appBuilder?.isLoading || false;

  return (
    <Card className="bg-app-surface border-app-border p-4 sm:p-6 pb-6 sm:pb-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <h2 className="text-lg font-semibold text-foreground">{t("custom.title")}</h2>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 bg-app-surface-hover h-auto sm:h-10">
          <TabsTrigger value="general" className="data-[state=active]:bg-background h-10">{t("custom.tabs.general")}</TabsTrigger>
          <TabsTrigger value="labels" className="data-[state=active]:bg-background h-10">{t("custom.tabs.labels")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* Video Course Section */}
          <div className="border-b border-app-border pb-6">
            <PremiumOverlay
              isBlocked={!hasVideoCourse}
              title={t("premium.videoCourse.title")}
              description={t("premium.videoCourse.description")}
              requiredPlan={getRequiredPlan('hasVideoCourse')}
              variant="disabled"
            >
              <div className="flex items-center justify-between p-3 bg-app-surface rounded-lg border border-app-border mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col">
                    <Label className="text-sm text-foreground cursor-pointer">
                      {t("custom.videoCourse.title")}
                    </Label>
                    <p className="text-xs text-app-muted">{t("custom.videoCourse.description")}</p>
                  </div>
                </div>
                <Switch
                  checked={appData.videoCourseEnabled ?? false}
                  onCheckedChange={(checked) => updateAppData('videoCourseEnabled', checked)}
                  disabled={!hasVideoCourse}
                />
              </div>
            </PremiumOverlay>

            {appData.videoCourseEnabled && hasVideoCourse && (
              <>
                {/* Video Course Title and Description */}
                <div className="space-y-4 mb-4 p-4 bg-app-surface rounded-lg border border-app-border">
                  <div className="space-y-2">
                    <Label htmlFor="video-course-title" className="text-sm text-app-muted">
                      {t("custom.videoCourse.titleLabel")}
                    </Label>
                    <Input
                      id="video-course-title"
                      value={appData.videoCourseTitle || ''}
                      onChange={(e) => updateAppData('videoCourseTitle', e.target.value)}
                      placeholder={t("custom.videoCourse.titlePlaceholder")}
                      className="bg-app-surface-hover border-app-border focus:border-primary"
                    />
                  </div>
                  
                  {/* Video Course Description - Hidden for Members */}
                  {appData.template !== 'members' && (
                    <div className="space-y-2">
                      <Label htmlFor="video-course-description" className="text-sm text-app-muted">
                        {t("custom.videoCourse.descriptionLabel")}
                      </Label>
                      <Textarea
                        id="video-course-description"
                        value={appData.videoCourseDescription || ''}
                        onChange={(e) => updateAppData('videoCourseDescription', e.target.value)}
                        placeholder={t("custom.videoCourse.descriptionPlaceholder")}
                        className="bg-app-surface-hover border-app-border focus:border-primary min-h-[80px]"
                      />
                    </div>
                  )}

                  {/* Video Course Button Text - Hidden for Exclusive, Units, Members */}
                  {appData.template !== 'exclusive' && appData.template !== 'units' && appData.template !== 'members' && (
                    <div className="space-y-2">
                      <Label htmlFor="video-course-button-text" className="text-sm text-app-muted">
                        {t("custom.videoCourse.buttonTextLabel")}
                      </Label>
                      <Input
                        id="video-course-button-text"
                        value={appData.videoCourseButtonText || ''}
                        onChange={(e) => updateAppData('videoCourseButtonText', e.target.value)}
                        placeholder={t("custom.videoCourse.buttonTextPlaceholder")}
                        className="bg-app-surface-hover border-app-border focus:border-primary"
                      />
                    </div>
                  )}

                  {/* Video Course Image Upload - Hidden for Members, Flow, Shop, Academy */}
                  {!['members', 'flow', 'shop', 'academy'].includes(appData.template) && (
                    <div className="space-y-2">
                      <Label className="text-sm text-app-muted">{t("custom.videoCourse.iconLabel")}</Label>
                      <div className="upload-zone relative cursor-pointer hover:bg-app-surface-hover rounded-xl transition-colors">
                        <div className="flex flex-col items-center space-y-2 p-3">
                          <div className="w-full h-20 bg-app-surface-hover rounded-xl flex items-center justify-center overflow-hidden relative">
                            {appData.videoCourseImage ? (
                              <>
                                <img 
                                  src={appData.videoCourseImage.url} 
                                  alt="Ícone do Curso" 
                                  className="w-full h-full object-cover"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-1 right-1 h-5 w-5 bg-black/60 hover:bg-black/80 text-white z-10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    updateAppData('videoCourseImage', null);
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <Image className="w-6 h-6 text-app-muted" />
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-foreground">PNG ou JPG 512x512</p>
                            <p className="text-xs text-app-muted">Ícone do curso em vídeo</p>
                          </div>
                        </div>
                        <Input
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('videoCourseImage', file, 'video-course-img');
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Video Course Background Upload - Hidden for Classic, Modern, Exclusive, Units */}
                  {!['classic', 'modern', 'exclusive', 'units'].includes(appData.template as string) && (
                    <div className="space-y-2">
                      <Label className="text-sm text-app-muted">{t("custom.videoCourse.coverLabel")}</Label>
                      <div className="upload-zone relative cursor-pointer hover:bg-app-surface-hover rounded-xl transition-colors">
                        <div className="flex flex-col items-center space-y-2 p-3">
                          <div className="w-full h-20 bg-app-surface-hover rounded-xl flex items-center justify-center overflow-hidden relative">
                            {appData.videoCourseBackground ? (
                              <>
                                <img 
                                  src={appData.videoCourseBackground.url} 
                                  alt="Capa do Curso" 
                                  className="w-full h-full object-cover"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-1 right-1 h-5 w-5 bg-black/60 hover:bg-black/80 text-white z-10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    updateAppData('videoCourseBackground', null);
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <Image className="w-6 h-6 text-app-muted" />
                            )}
                          </div>
                          <div className="text-center">
                            {(() => {
                              const template = appData.template as string;
                              if (template === 'members') {
                                return (
                                  <>
                                    <p className="text-sm text-foreground">PNG ou JPG 800x1000</p>
                                    <p className="text-xs text-app-muted">Capa vertical 4:5</p>
                                  </>
                                );
                              }
                              if (template === 'shop') {
                                return (
                                  <>
                                    <p className="text-sm text-foreground">PNG ou JPG 800x600</p>
                                    <p className="text-xs text-app-muted">Capa horizontal 4:3</p>
                                  </>
                                );
                              }
                              if (template === 'flow' || template === 'academy') {
                                return (
                                  <>
                                    <p className="text-sm text-foreground">PNG ou JPG 600x800</p>
                                    <p className="text-xs text-app-muted">Capa vertical 3:4</p>
                                  </>
                                );
                              }
                              // Corporate e Showcase
                              return (
                                <>
                                  <p className="text-sm text-foreground">PNG ou JPG 1920x1080</p>
                                  <p className="text-xs text-app-muted">Fundo do curso em vídeo</p>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <Input
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('videoCourseBackground', file, 'video-course-bg');
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {appData.videoCourseEnabled && hasVideoCourse && (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const newModule = {
                      id: Date.now().toString(),
                      title: `Módulo ${(appData.videoModules?.length || 0) + 1}`,
                      videos: []
                    };
                    updateAppData('videoModules', [...(appData.videoModules || []), newModule]);
                  }}
                >
                  {t("custom.videoCourse.addModule")}
                </Button>

                {appData.videoModules?.map((module, moduleIndex) => (
                  <Card key={module.id} className="p-4 bg-app-surface border-app-border">
                    <div className="flex items-center justify-between mb-3">
                      <Input
                        value={module.title}
                        onChange={(e) => {
                          const newModules = [...appData.videoModules];
                          newModules[moduleIndex].title = e.target.value;
                          updateAppData('videoModules', newModules);
                        }}
                        placeholder={t("custom.videoCourse.moduleTitlePlaceholder")}
                        className="flex-1 mr-2"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newModules = appData.videoModules.filter((_, i) => i !== moduleIndex);
                          updateAppData('videoModules', newModules);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {module.videos.map((video, videoIndex) => (
                        <div key={video.id} className="flex space-x-2">
                          <Input
                            value={video.title}
                            onChange={(e) => {
                              const newModules = [...appData.videoModules];
                              newModules[moduleIndex].videos[videoIndex].title = e.target.value;
                              updateAppData('videoModules', newModules);
                            }}
                            placeholder={t("custom.videoCourse.videoTitlePlaceholder")}
                            className="flex-1"
                          />
                          <Input
                            value={video.youtubeUrl}
                            onChange={(e) => {
                              const newModules = [...appData.videoModules];
                              newModules[moduleIndex].videos[videoIndex].youtubeUrl = e.target.value;
                              updateAppData('videoModules', newModules);
                            }}
                            placeholder={t("custom.videoCourse.videoLinkPlaceholder")}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newModules = [...appData.videoModules];
                              newModules[moduleIndex].videos = newModules[moduleIndex].videos.filter((_, i) => i !== videoIndex);
                              updateAppData('videoModules', newModules);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const newModules = [...appData.videoModules];
                          newModules[moduleIndex].videos.push({
                            id: Date.now().toString(),
                            title: `Vídeo ${module.videos.length + 1}`,
                            youtubeUrl: ''
                          });
                          updateAppData('videoModules', newModules);
                        }}
                      >
                        {t("custom.videoCourse.addVideo")}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* App Name */}
          <div className="space-y-2">
            <Label htmlFor="app-name" className="flex items-center space-x-2 text-foreground">
              <Type className="w-4 h-4" />
              <span>{t("custom.name")}</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                id="app-name"
                value={appData.appName}
                onChange={(e) => updateAppData('appName', e.target.value)}
                placeholder={t("custom.name.placeholder")}
                className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
              />
              <div className="relative">
                <Input
                  type="color"
                  value={appData.appNameColor || '#ffffff'}
                  onChange={(e) => updateAppData('appNameColor', e.target.value)}
                  className="w-10 h-10 p-1 bg-app-surface-hover border-app-border cursor-pointer rounded-md"
                  title={t("custom.colors.textColor")}
                />
              </div>
            </div>
          </div>

          {/* App Description */}
          <div className="space-y-2">
            <Label htmlFor="app-description" className="flex items-center space-x-2 text-foreground">
              <Type className="w-4 h-4" />
              <span>{t("custom.description")}</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                id="app-description"
                value={appData.appDescription}
                onChange={(e) => updateAppData('appDescription', e.target.value)}
                placeholder={t("custom.description.placeholder")}
                className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
              />
              <div className="relative">
                <Input
                  type="color"
                  value={appData.appDescriptionColor || '#ffffff'}
                  onChange={(e) => updateAppData('appDescriptionColor', e.target.value)}
                  className="w-10 h-10 p-1 bg-app-surface-hover border-app-border cursor-pointer rounded-md"
                  title={t("custom.colors.textColor")}
                />
              </div>
            </div>
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

          {/* Theme Selector */}
          <div className="space-y-2">
            <Label htmlFor="app-theme" className="flex items-center space-x-2 text-foreground">
              <Palette className="w-4 h-4" />
              <span>{t("custom.theme")}</span>
            </Label>
            <Select value={appData.appTheme} onValueChange={(value: 'light' | 'dark') => updateAppData('appTheme', value)}>
              <SelectTrigger className="bg-app-surface-hover border-app-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">{t("custom.theme.dark")}</SelectItem>
                <SelectItem value="light">{t("custom.theme.light")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* App Icon Upload - Available for all templates (needed for PWA icon) */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2 text-foreground">
              <Upload className="w-4 h-4" />
              <span>{t("custom.icon")}</span>
            </Label>
            <div className="upload-zone relative cursor-pointer hover:bg-app-surface-hover rounded-xl transition-colors">
              <div className="flex flex-col items-center space-y-2 p-4">
                <div className="w-16 h-16 bg-app-surface-hover rounded-xl flex items-center justify-center relative">
                  {appData.appIcon ? (
                    <>
                      <img 
                        src={appData.appIcon.url} 
                        alt="App Icon" 
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 bg-black/60 hover:bg-black/80 text-white z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          updateAppData('appIcon', null);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </>
                  ) : appData.template === 'flow' ? (
                    <div className="w-12 h-12 rounded-lg bg-primary/20 border-2 border-dashed border-primary/50 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                  ) : (
                    <Upload className="w-6 h-6 text-app-muted" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-foreground">{t("custom.icon.dimensions")}</p>
                  <p className="text-xs text-app-muted">{t("custom.icon.background")}</p>
                </div>
              </div>
              <Input
                type="file"
                accept=".png,.jpg,.jpeg"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('appIcon', file, 'icon');
                }}
              />
            </div>
          </div>

          {/* Show App Icon - Only for Classic, Showcase, Modern, Corporate, Flow (already excludes Exclusive and Units) */}
          {(appData.template === 'classic' || appData.template === 'showcase' || appData.template === 'modern' || appData.template === 'corporate' || appData.template === 'flow') && (
            <div className="flex items-center justify-between p-3 bg-app-surface-hover rounded-lg">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-foreground" />
                <div>
                  <Label className="text-sm text-foreground cursor-pointer">
                    Exibir ícone do app
                  </Label>
                  <p className="text-xs text-app-muted">Mostrar/ocultar ícone na tela inicial</p>
                </div>
              </div>
              <Switch
                checked={appData.showAppIcon ?? true}
                onCheckedChange={(checked) => updateAppData('showAppIcon', checked)}
              />
            </div>
          )}

          {/* Showcase Text Position */}
          {appData.template === 'showcase' && !appData.showAppIcon && (
            <div className="space-y-2">
              <Label className="text-sm text-foreground">{t("custom.showcase.positionLabel")}</Label>
              <Select
                value={(appData as any).showcaseTextPosition || 'bottom'}
                onValueChange={(value: 'bottom' | 'middle' | 'top') => updateAppData('showcaseTextPosition', value)}
              >
                <SelectTrigger className="w-full bg-app-surface border-app-border">
                  <SelectValue placeholder={t("custom.showcase.positionPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom">{t("custom.showcase.position.bottom")}</SelectItem>
                  <SelectItem value="middle">{t("custom.showcase.position.middle")}</SelectItem>
                  <SelectItem value="top">{t("custom.showcase.position.top")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}


          {/* App Cover Upload - Hidden for Members, Corporate, Exclusive, Academy templates */}
          {appData.template !== 'members' && appData.template !== 'corporate' && appData.template !== 'exclusive' && appData.template !== 'academy' && (
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-foreground">
                <Image className="w-4 h-4" />
                <span>{t("custom.cover")}</span>
              </Label>
              <div className="upload-zone relative cursor-pointer hover:bg-app-surface-hover rounded-xl transition-colors">
                <div className="flex flex-col items-center space-y-2 p-4">
                  <div className="w-full h-24 bg-app-surface-hover rounded-xl flex items-center justify-center overflow-hidden relative">
                    {appData.appCover ? (
                      <>
                        <img 
                          src={appData.appCover.url} 
                          alt="App Cover" 
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-5 w-5 bg-black/60 hover:bg-black/80 text-white z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            updateAppData('appCover', null);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <Image className="w-8 h-8 text-app-muted" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-foreground">{t("phone.image.dimensions")}</p>
                    <p className="text-xs text-app-muted">{t("custom.cover.background")}</p>
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
          )}

          {/* Academy Template - Carousel Covers in General Tab */}
          {appData.template === 'academy' && (
            <>
              {/* Capa do App (Slide 1) */}
              <div className="space-y-2">
                <Label className="flex items-center space-x-2 text-foreground">
                  <Image className="w-4 h-4" />
                  <span>{t("custom.cover")}</span>
                </Label>
                <div className="upload-zone relative cursor-pointer hover:bg-app-surface-hover rounded-xl transition-colors">
                  <div className="flex flex-col items-center space-y-2 p-3">
                    <div className="w-full h-20 bg-app-surface-hover rounded-xl flex items-center justify-center overflow-hidden relative">
                      {appData.training1Cover ? (
                        <>
                          <img 
                            src={appData.training1Cover.url} 
                            alt="Capa do App" 
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-5 w-5 bg-black/60 hover:bg-black/80 text-white z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              updateAppData('training1Cover', null);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <Image className="w-6 h-6 text-app-muted" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-foreground">PNG ou JPG 600x800</p>
                      <p className="text-xs text-app-muted">Primeira imagem do carrossel</p>
                    </div>
                  </div>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('training1Cover', file, 'training-1-cover');
                    }}
                  />
                </div>
              </div>

              {/* Capas do Carrossel (Slides 2, 3, 4) */}
              <div className="space-y-4">
                <Label className="flex items-center space-x-2 text-foreground">
                  <Image className="w-4 h-4" />
                  <span>Capas do Carrossel</span>
                </Label>
                
                <div className="space-y-2">
                  <Label className="text-sm text-app-muted">Slide 2</Label>
                  <div className="upload-zone relative cursor-pointer hover:bg-app-surface-hover rounded-xl transition-colors">
                    <div className="flex flex-col items-center space-y-2 p-3">
                      <div className="w-full h-20 bg-app-surface-hover rounded-xl flex items-center justify-center overflow-hidden relative">
                        {appData.training2Cover ? (
                          <>
                            <img 
                              src={appData.training2Cover.url} 
                              alt="Slide 2" 
                              className="w-full h-full object-cover"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-5 w-5 bg-black/60 hover:bg-black/80 text-white z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                updateAppData('training2Cover', null);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <Image className="w-6 h-6 text-app-muted" />
                        )}
                      </div>
                    </div>
                    <Input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('training2Cover', file, 'training-2-cover');
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-app-muted">Slide 3</Label>
                  <div className="upload-zone relative cursor-pointer hover:bg-app-surface-hover rounded-xl transition-colors">
                    <div className="flex flex-col items-center space-y-2 p-3">
                      <div className="w-full h-20 bg-app-surface-hover rounded-xl flex items-center justify-center overflow-hidden relative">
                        {appData.training3Cover ? (
                          <>
                            <img 
                              src={appData.training3Cover.url} 
                              alt="Slide 3" 
                              className="w-full h-full object-cover"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-5 w-5 bg-black/60 hover:bg-black/80 text-white z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                updateAppData('training3Cover', null);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <Image className="w-6 h-6 text-app-muted" />
                        )}
                      </div>
                    </div>
                    <Input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('training3Cover', file, 'training-3-cover');
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-app-muted">Slide 4</Label>
                  <div className="upload-zone relative cursor-pointer hover:bg-app-surface-hover rounded-xl transition-colors">
                    <div className="flex flex-col items-center space-y-2 p-3">
                      <div className="w-full h-20 bg-app-surface-hover rounded-xl flex items-center justify-center overflow-hidden relative">
                        {appData.training4Cover ? (
                          <>
                            <img 
                              src={appData.training4Cover.url} 
                              alt="Slide 4" 
                              className="w-full h-full object-cover"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-5 w-5 bg-black/60 hover:bg-black/80 text-white z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                updateAppData('training4Cover', null);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <Image className="w-6 h-6 text-app-muted" />
                        )}
                      </div>
                    </div>
                    <Input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('training4Cover', file, 'training-4-cover');
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Custom Link */}
          <div className="space-y-2">
            <Label htmlFor="custom-link" className="flex items-center space-x-2 text-foreground">
              <Link className="w-4 h-4" />
              <span>{t("custom.link")}</span>
              {hasActiveDomain && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {t("custom.link.locked")}
                </span>
              )}
            </Label>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <span className="text-sm text-app-muted break-all">
                {hasActiveDomain ? `${activeDomain?.domain}/` : getAppDomainForDisplay()}
              </span>
              <Input
                id="custom-link"
                value={appData.customLink}
                onChange={(e) => updateAppData('customLink', e.target.value)}
                placeholder={t("custom.link.placeholder")}
                disabled={hasActiveDomain}
                className={`bg-app-surface-hover border-app-border focus:border-primary ${hasActiveDomain ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
            <p className="text-xs text-app-muted">
              {hasActiveDomain 
                ? t("custom.link.managed")
                : t("custom.link.help")
              }
            </p>
          </div>
        </TabsContent>

        <TabsContent value="labels" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* Main Product Label */}
          <div className="space-y-2">
            <Label htmlFor="main-product-label" className="flex items-center space-x-2 text-foreground">
              <Type className="w-4 h-4" />
              <span>{t("custom.main.title")}</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                id="main-product-label"
                value={appData.mainProductLabel}
                onChange={(e) => updateAppData('mainProductLabel', e.target.value)}
                placeholder={t('phone.main.title')}
                className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
              />
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 border-app-border hover:bg-app-surface-hover relative"
                  title={t("custom.thumbnail.title")}
                >
                  {appData.mainProductThumbnail ? (
                    <>
                      <img 
                        src={appData.mainProductThumbnail.url} 
                        alt="Miniatura Principal" 
                        className="w-6 h-6 rounded object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 bg-black/60 hover:bg-black/80 text-white z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          updateAppData('mainProductThumbnail', null);
                        }}
                      >
                        <X className="w-2.5 h-2.5" />
                      </Button>
                    </>
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
            <p className="text-xs text-app-muted">{t("custom.thumbnail.help")}</p>
          </div>

          {/* Main Product Description */}
          {appData.template !== 'units' && appData.template !== 'flow' && (
            <div className="space-y-2">
              <Label htmlFor="main-product-description" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.main.description")}</span>
              </Label>
              <Input
                id="main-product-description"
                type="text"
                value={appData.mainProductDescription}
                onChange={(e) => updateAppData('mainProductDescription', e.target.value)}
                placeholder={t('phone.main.description')}
                className="bg-app-surface-hover border-app-border focus:border-primary"
              />
            </div>
          )}

          {/* View Button Label - Hidden for Units, Flow, Modern */}
          {appData.template !== 'units' && appData.template !== 'flow' && appData.template !== 'modern' && (
            <div className="space-y-2">
              <Label htmlFor="view-button-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.view.button")}</span>
              </Label>
              <Input
                id="view-button-label"
                value={appData?.viewButtonLabel || ''}
                onChange={(e) => updateAppData('viewButtonLabel', e.target.value)}
                placeholder={appData.template === 'members' ? t("custom.members.clicksPlaceholder") : t("custom.view.button.placeholder")}
                className="bg-app-surface-hover border-app-border focus:border-primary"
              />
              <p className="text-xs text-app-muted">{t("custom.view.button.help")}</p>
            </div>
          )}

          {/* Members Header Size */}
          {appData.template === 'members' && (
            <div className="space-y-2">
              <Label htmlFor="members-header-size" className="flex items-center space-x-2 text-foreground">
                <Layout className="w-4 h-4" />
                <span>{t("custom.members.headerSizeLabel")}</span>
              </Label>
              <Select
                value={appData.membersHeaderSize || 'large'}
                onValueChange={(value) => updateAppData('membersHeaderSize', value)}
              >
                <SelectTrigger className="bg-app-surface-hover border-app-border">
                  <SelectValue placeholder={t("custom.members.headerSizePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">{t("custom.members.headerSize.small")}</SelectItem>
                  <SelectItem value="medium">{t("custom.members.headerSize.medium")}</SelectItem>
                  <SelectItem value="large">{t("custom.members.headerSize.large")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* App Cover Upload - Members Template Only (in Text & Labels tab) */}
          {appData.template === 'members' && (
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-foreground">
                <Image className="w-4 h-4" />
                <span>{t("custom.cover")}</span>
              </Label>
              <div className="upload-zone relative cursor-pointer hover:bg-app-surface-hover rounded-xl transition-colors">
                <div className="flex flex-col items-center space-y-2 p-4">
                  <div className="w-full h-24 bg-app-surface-hover rounded-xl flex items-center justify-center overflow-hidden relative">
                    {appData.appCover ? (
                      <>
                        <img 
                          src={appData.appCover.url} 
                          alt="App Cover" 
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-5 w-5 bg-black/60 hover:bg-black/80 text-white z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            updateAppData('appCover', null);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <Image className="w-8 h-8 text-app-muted" />
                    )}
                  </div>
                  <div className="text-center">
                    {(() => {
                      const headerSize = appData.membersHeaderSize || 'large';
                      if (headerSize === 'small') {
                        return (
                          <>
                            <p className="text-sm text-foreground">PNG ou JPG 1080x800</p>
                            <p className="text-xs text-app-muted">Capa do topo (pequeno)</p>
                          </>
                        );
                      }
                      if (headerSize === 'medium') {
                        return (
                          <>
                            <p className="text-sm text-foreground">PNG ou JPG 1080x1200</p>
                            <p className="text-xs text-app-muted">Capa do topo (médio)</p>
                          </>
                        );
                      }
                      return (
                        <>
                          <p className="text-sm text-foreground">PNG ou JPG 1080x1600</p>
                          <p className="text-xs text-app-muted">Capa do topo (grande)</p>
                        </>
                      );
                    })()}
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
          )}

          
          {/* Bonuses Label */}
          {maxProducts > 1 && appData.template !== 'units' && appData.template !== 'flow' && (
            <div className="space-y-2">
              <Label htmlFor="bonuses-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonuses.title")}</span>
              </Label>
              <Input
                id="bonuses-label"
                value={appData.bonusesLabel}
                onChange={(e) => updateAppData('bonusesLabel', e.target.value)}
                placeholder={t('phone.bonus.title')}
                className="bg-app-surface-hover border-app-border focus:border-primary"
              />
            </div>
          )}

          {/* Bonus 1 Label */}
          {maxProducts > 1 && (
            <div className="space-y-2">
              <Label htmlFor="bonus1-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 1</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus1-label"
                  value={appData.bonus1Label}
                  onChange={(e) => updateAppData('bonus1Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 1'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover relative"
                    title={t("custom.thumbnail.title")}
                  >
                    {appData.bonus1Thumbnail ? (
                      <>
                        <img 
                          src={appData.bonus1Thumbnail.url} 
                          alt={`${t("custom.bonus.thumbnail.alt")} 1`}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 bg-black/60 hover:bg-black/80 text-white z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            updateAppData('bonus1Thumbnail', null);
                          }}
                        >
                          <X className="w-2.5 h-2.5" />
                        </Button>
                      </>
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
                {appData.template === 'exclusive' && (
                  <Input
                    type="color"
                    value={appData.bonus1Color || '#3b82f6'}
                    onChange={(e) => updateAppData('bonus1Color', e.target.value)}
                    className="w-12 h-10 cursor-pointer p-1"
                    title={t("custom.colors.bonusColor")}
                  />
                )}
              </div>
            </div>
          )}

          {/* Bonus 2 Label */}
          {maxProducts > 2 && (
            <div className="space-y-2">
              <Label htmlFor="bonus2-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 2</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus2-label"
                  value={appData.bonus2Label}
                  onChange={(e) => updateAppData('bonus2Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 2'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title={t("custom.thumbnail.title")}
                  >
                    {appData.bonus2Thumbnail ? (
                      <img 
                        src={appData.bonus2Thumbnail.url} 
                        alt={`${t("custom.bonus.thumbnail.alt")} 2`}
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
                {appData.template === 'exclusive' && (
                  <Input
                    type="color"
                    value={appData.bonus2Color || '#10b981'}
                    onChange={(e) => updateAppData('bonus2Color', e.target.value)}
                    className="w-12 h-10 cursor-pointer p-1"
                    title={t("custom.colors.bonusColor")}
                  />
                )}
              </div>
            </div>
          )}

          {/* Bonus 3 Label */}
          {maxProducts > 3 && (
            <div className="space-y-2">
              <Label htmlFor="bonus3-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 3</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus3-label"
                  value={appData.bonus3Label}
                  onChange={(e) => updateAppData('bonus3Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 3'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title={t("custom.thumbnail.title")}
                  >
                    {appData.bonus3Thumbnail ? (
                      <img 
                        src={appData.bonus3Thumbnail.url} 
                        alt={`${t("custom.bonus.thumbnail.alt")} 3`}
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
                {appData.template === 'exclusive' && (
                  <Input
                    type="color"
                    value={appData.bonus3Color || '#f97316'}
                    onChange={(e) => updateAppData('bonus3Color', e.target.value)}
                    className="w-12 h-10 cursor-pointer p-1"
                    title={t("custom.colors.bonusColor")}
                  />
                )}
              </div>
            </div>
          )}

          {/* Bonus 4 Label */}
          {maxProducts > 4 && (
            <div className="space-y-2">
              <Label htmlFor="bonus4-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 4</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus4-label"
                  value={appData.bonus4Label}
                  onChange={(e) => updateAppData('bonus4Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 4'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title={t("custom.thumbnail.title")}
                  >
                    {appData.bonus4Thumbnail ? (
                      <img 
                        src={appData.bonus4Thumbnail.url} 
                        alt={`${t("custom.bonus.thumbnail.alt")} 4`}
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
                {appData.template === 'exclusive' && (
                  <Input
                    type="color"
                    value={appData.bonus4Color || '#f59e0b'}
                    onChange={(e) => updateAppData('bonus4Color', e.target.value)}
                    className="w-12 h-10 cursor-pointer p-1"
                    title={t("custom.colors.bonusColor")}
                  />
                )}
              </div>
            </div>
          )}

          {/* Bonus 5 Label */}
          {maxProducts > 5 && (
            <div className="space-y-2">
              <Label htmlFor="bonus5-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 5</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus5-label"
                  value={appData.bonus5Label}
                  onChange={(e) => updateAppData('bonus5Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 5'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title={t("custom.thumbnail.title")}
                  >
                    {appData.bonus5Thumbnail ? (
                      <img 
                        src={appData.bonus5Thumbnail.url} 
                        alt={`${t("custom.bonus.thumbnail.alt")} 5`}
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
                {appData.template === 'exclusive' && (
                  <Input
                    type="color"
                    value={appData.bonus5Color || '#14b8a6'}
                    onChange={(e) => updateAppData('bonus5Color', e.target.value)}
                    className="w-12 h-10 cursor-pointer p-1"
                    title={t("custom.colors.bonusColor")}
                  />
                )}
              </div>
            </div>
          )}

          {/* Bonus 6 Label */}
          {maxProducts > 6 && (
            <div className="space-y-2">
              <Label htmlFor="bonus6-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 6</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus6-label"
                  value={appData.bonus6Label}
                  onChange={(e) => updateAppData('bonus6Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 6'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title={t("custom.thumbnail.title")}
                  >
                    {appData.bonus6Thumbnail ? (
                      <img 
                        src={appData.bonus6Thumbnail.url} 
                        alt={`${t("custom.bonus.thumbnail.alt")} 6`}
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
                {appData.template === 'exclusive' && (
                  <Input
                    type="color"
                    value={appData.bonus6Color || '#8b5cf6'}
                    onChange={(e) => updateAppData('bonus6Color', e.target.value)}
                    className="w-12 h-10 cursor-pointer p-1"
                    title={t("custom.colors.bonusColor")}
                  />
                )}
              </div>
            </div>
          )}

          {/* Bonus 7 Label */}
          {maxProducts > 7 && (
            <div className="space-y-2">
              <Label htmlFor="bonus7-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 7</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus7-label"
                  value={appData.bonus7Label}
                  onChange={(e) => updateAppData('bonus7Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 7'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title={t("custom.thumbnail.title")}
                  >
                    {appData.bonus7Thumbnail ? (
                      <img 
                        src={appData.bonus7Thumbnail.url} 
                        alt={`${t("custom.bonus.thumbnail.alt")} 7`}
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
                {appData.template === 'exclusive' && (
                  <Input
                    type="color"
                    value={appData.bonus7Color || '#ec4899'}
                    onChange={(e) => updateAppData('bonus7Color', e.target.value)}
                    className="w-12 h-10 cursor-pointer p-1"
                    title={t("custom.colors.bonusColor")}
                  />
                )}
              </div>
            </div>
          )}

          {/* Bonus 8 Label */}
          {maxProducts > 8 && (
            <div className="space-y-2">
              <Label htmlFor="bonus8-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 8</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus8-label"
                  value={appData.bonus8Label}
                  onChange={(e) => updateAppData('bonus8Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 8'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title={t("custom.thumbnail.title")}
                  >
                    {appData.bonus8Thumbnail ? (
                      <img 
                        src={appData.bonus8Thumbnail.url} 
                        alt={`${t("custom.bonus.thumbnail.alt")} 8`}
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
                      if (file) handleFileUpload('bonus8Thumbnail', file, 'bonus8-thumbnail');
                    }}
                  />
                </div>
                {appData.template === 'exclusive' && (
                  <Input
                    type="color"
                    value={appData.bonus8Color || '#06b6d4'}
                    onChange={(e) => updateAppData('bonus8Color', e.target.value)}
                    className="w-12 h-10 cursor-pointer p-1"
                    title={t("custom.colors.bonusColor")}
                  />
                )}
              </div>
            </div>
          )}

          {/* Bonus 9 Label */}
          {maxProducts > 9 && (
            <div className="space-y-2">
              <Label htmlFor="bonus9-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 9</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus9-label"
                  value={appData.bonus9Label}
                  onChange={(e) => updateAppData('bonus9Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 9'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title={t("custom.thumbnail.title")}
                  >
                    {appData.bonus9Thumbnail ? (
                      <img 
                        src={appData.bonus9Thumbnail.url} 
                        alt={`${t("custom.bonus.thumbnail.alt")} 9`}
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
                      if (file) handleFileUpload('bonus9Thumbnail', file, 'bonus9-thumbnail');
                    }}
                  />
                </div>
                {appData.template === 'exclusive' && (
                  <Input
                    type="color"
                    value={appData.bonus9Color || '#84cc16'}
                    onChange={(e) => updateAppData('bonus9Color', e.target.value)}
                    className="w-12 h-10 cursor-pointer p-1"
                    title={t("custom.colors.bonusColor")}
                  />
                )}
              </div>
            </div>
          )}

          {/* Bonus 10-19 Labels with Thumbnails */}
          {maxProducts > 10 && (
            <div className="space-y-2">
              <Label htmlFor="bonus10-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 10</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus10-label"
                  value={(appData as any).bonus10Label || ''}
                  onChange={(e) => updateAppData('bonus10Label' as any, e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 10'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover relative"
                    title={t("custom.thumbnail.title")}
                  >
                    {(appData as any).bonus10Thumbnail ? (
                      <>
                        <img 
                          src={(appData as any).bonus10Thumbnail.url} 
                          alt={`${t("custom.bonus.thumbnail.alt")} 10`}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 bg-black/60 hover:bg-black/80 text-white z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            updateAppData('bonus10Thumbnail' as any, null);
                          }}
                        >
                          <X className="w-2.5 h-2.5" />
                        </Button>
                      </>
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
                      if (file) handleFileUpload('bonus10Thumbnail' as any, file, 'bonus10-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {maxProducts > 11 && (
            <div className="space-y-2">
              <Label htmlFor="bonus11-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 11</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus11-label"
                  value={(appData as any).bonus11Label || ''}
                  onChange={(e) => updateAppData('bonus11Label' as any, e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 11'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover relative"
                    title={t("custom.thumbnail.title")}
                  >
                    {(appData as any).bonus11Thumbnail ? (
                      <>
                        <img 
                          src={(appData as any).bonus11Thumbnail.url} 
                          alt={`${t("custom.bonus.thumbnail.alt")} 11`}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 bg-black/60 hover:bg-black/80 text-white z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            updateAppData('bonus11Thumbnail' as any, null);
                          }}
                        >
                          <X className="w-2.5 h-2.5" />
                        </Button>
                      </>
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
                      if (file) handleFileUpload('bonus11Thumbnail' as any, file, 'bonus11-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {maxProducts > 12 && (
            <div className="space-y-2">
              <Label htmlFor="bonus12-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 12</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus12-label"
                  value={(appData as any).bonus12Label || ''}
                  onChange={(e) => updateAppData('bonus12Label' as any, e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 12'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover relative"
                    title={t("custom.thumbnail.title")}
                  >
                    {(appData as any).bonus12Thumbnail ? (
                      <>
                        <img 
                          src={(appData as any).bonus12Thumbnail.url} 
                          alt={`${t("custom.bonus.thumbnail.alt")} 12`}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 bg-black/60 hover:bg-black/80 text-white z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            updateAppData('bonus12Thumbnail' as any, null);
                          }}
                        >
                          <X className="w-2.5 h-2.5" />
                        </Button>
                      </>
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
                      if (file) handleFileUpload('bonus12Thumbnail' as any, file, 'bonus12-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {maxProducts > 13 && (
            <div className="space-y-2">
              <Label htmlFor="bonus13-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 13</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus13-label"
                  value={(appData as any).bonus13Label || ''}
                  onChange={(e) => updateAppData('bonus13Label' as any, e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 13'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover relative"
                    title={t("custom.thumbnail.title")}
                  >
                    {(appData as any).bonus13Thumbnail ? (
                      <>
                        <img 
                          src={(appData as any).bonus13Thumbnail.url} 
                          alt={`${t("custom.bonus.thumbnail.alt")} 13`}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 bg-black/60 hover:bg-black/80 text-white z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            updateAppData('bonus13Thumbnail' as any, null);
                          }}
                        >
                          <X className="w-2.5 h-2.5" />
                        </Button>
                      </>
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
                      if (file) handleFileUpload('bonus13Thumbnail' as any, file, 'bonus13-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {maxProducts > 14 && (
            <div className="space-y-2">
              <Label htmlFor="bonus14-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 14</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus14-label"
                  value={(appData as any).bonus14Label || ''}
                  onChange={(e) => updateAppData('bonus14Label' as any, e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 14'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover relative"
                    title={t("custom.thumbnail.title")}
                  >
                    {(appData as any).bonus14Thumbnail ? (
                      <>
                        <img 
                          src={(appData as any).bonus14Thumbnail.url} 
                          alt={`${t("custom.bonus.thumbnail.alt")} 14`}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 bg-black/60 hover:bg-black/80 text-white z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            updateAppData('bonus14Thumbnail' as any, null);
                          }}
                        >
                          <X className="w-2.5 h-2.5" />
                        </Button>
                      </>
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
                      if (file) handleFileUpload('bonus14Thumbnail' as any, file, 'bonus14-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {maxProducts > 15 && (
            <div className="space-y-2">
              <Label htmlFor="bonus15-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 15</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus15-label"
                  value={(appData as any).bonus15Label || ''}
                  onChange={(e) => updateAppData('bonus15Label' as any, e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 15'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover relative"
                    title={t("custom.thumbnail.title")}
                  >
                    {(appData as any).bonus15Thumbnail ? (
                      <>
                        <img 
                          src={(appData as any).bonus15Thumbnail.url} 
                          alt={`${t("custom.bonus.thumbnail.alt")} 15`}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 bg-black/60 hover:bg-black/80 text-white z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            updateAppData('bonus15Thumbnail' as any, null);
                          }}
                        >
                          <X className="w-2.5 h-2.5" />
                        </Button>
                      </>
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
                      if (file) handleFileUpload('bonus15Thumbnail' as any, file, 'bonus15-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {maxProducts > 16 && (
            <div className="space-y-2">
              <Label htmlFor="bonus16-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 16</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus16-label"
                  value={(appData as any).bonus16Label || ''}
                  onChange={(e) => updateAppData('bonus16Label' as any, e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 16'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover relative"
                    title={t("custom.thumbnail.title")}
                  >
                    {(appData as any).bonus16Thumbnail ? (
                      <>
                        <img 
                          src={(appData as any).bonus16Thumbnail.url} 
                          alt={`${t("custom.bonus.thumbnail.alt")} 16`}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 bg-black/60 hover:bg-black/80 text-white z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            updateAppData('bonus16Thumbnail' as any, null);
                          }}
                        >
                          <X className="w-2.5 h-2.5" />
                        </Button>
                      </>
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
                      if (file) handleFileUpload('bonus16Thumbnail' as any, file, 'bonus16-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {maxProducts > 17 && (
            <div className="space-y-2">
              <Label htmlFor="bonus17-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 17</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus17-label"
                  value={(appData as any).bonus17Label || ''}
                  onChange={(e) => updateAppData('bonus17Label' as any, e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 17'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover relative"
                    title={t("custom.thumbnail.title")}
                  >
                    {(appData as any).bonus17Thumbnail ? (
                      <>
                        <img 
                          src={(appData as any).bonus17Thumbnail.url} 
                          alt={`${t("custom.bonus.thumbnail.alt")} 17`}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 bg-black/60 hover:bg-black/80 text-white z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            updateAppData('bonus17Thumbnail' as any, null);
                          }}
                        >
                          <X className="w-2.5 h-2.5" />
                        </Button>
                      </>
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
                      if (file) handleFileUpload('bonus17Thumbnail' as any, file, 'bonus17-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {maxProducts > 18 && (
            <div className="space-y-2">
              <Label htmlFor="bonus18-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 18</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus18-label"
                  value={(appData as any).bonus18Label || ''}
                  onChange={(e) => updateAppData('bonus18Label' as any, e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 18'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover relative"
                    title={t("custom.thumbnail.title")}
                  >
                    {(appData as any).bonus18Thumbnail ? (
                      <>
                        <img 
                          src={(appData as any).bonus18Thumbnail.url} 
                          alt={`${t("custom.bonus.thumbnail.alt")} 18`}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 bg-black/60 hover:bg-black/80 text-white z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            updateAppData('bonus18Thumbnail' as any, null);
                          }}
                        >
                          <X className="w-2.5 h-2.5" />
                        </Button>
                      </>
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
                      if (file) handleFileUpload('bonus18Thumbnail' as any, file, 'bonus18-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {maxProducts > 19 && (
            <div className="space-y-2">
              <Label htmlFor="bonus19-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 19</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus19-label"
                  value={(appData as any).bonus19Label || ''}
                  onChange={(e) => updateAppData('bonus19Label' as any, e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 19'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover relative"
                    title={t("custom.thumbnail.title")}
                  >
                    {(appData as any).bonus19Thumbnail ? (
                      <>
                        <img 
                          src={(appData as any).bonus19Thumbnail.url} 
                          alt={`${t("custom.bonus.thumbnail.alt")} 19`}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 bg-black/60 hover:bg-black/80 text-white z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            updateAppData('bonus19Thumbnail' as any, null);
                          }}
                        >
                          <X className="w-2.5 h-2.5" />
                        </Button>
                      </>
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
                      if (file) handleFileUpload('bonus19Thumbnail' as any, file, 'bonus19-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Shop Template - Remove Card Border */}
          {appData.template === 'shop' && (
            <div className="flex items-center justify-between p-3 bg-app-surface rounded-lg border border-app-border">
              <div className="flex items-center space-x-2">
                <div className="flex flex-col">
                  <Label className="text-sm text-foreground cursor-pointer">
                    Remover Contorno dos Cards
                  </Label>
                  <p className="text-xs text-app-muted">Ocultar bordas dos cards de produtos</p>
                </div>
              </div>
              <Switch
                checked={appData.shopRemoveCardBorder ?? false}
                onCheckedChange={(checked) => updateAppData('shopRemoveCardBorder', checked)}
              />
            </div>
          )}

          {/* Members Template - Show Card Border */}
          {appData.template === 'members' && (
            <div className="flex items-center justify-between p-3 bg-app-surface rounded-lg border border-app-border">
              <div className="flex items-center space-x-2">
                <div className="flex flex-col">
                  <Label className="text-sm text-foreground cursor-pointer">
                    Mostrar Contorno nos Cards
                  </Label>
                  <p className="text-xs text-app-muted">Adicionar bordas nos cards de produtos</p>
                </div>
              </div>
              <Switch
                checked={appData.membersShowCardBorder ?? false}
                onCheckedChange={(checked) => updateAppData('membersShowCardBorder', checked)}
              />
            </div>
          )}

          {/* Flow Template - Show Card Border */}
          {appData.template === 'flow' && (
            <div className="flex items-center justify-between p-3 bg-app-surface rounded-lg border border-app-border">
              <div className="flex items-center space-x-2">
                <div className="flex flex-col">
                  <Label className="text-sm text-foreground cursor-pointer">
                    Mostrar Contorno nos Cards
                  </Label>
                  <p className="text-xs text-app-muted">Adicionar bordas nos cards de produtos</p>
                </div>
              </div>
              <Switch
                checked={appData.flowShowCardBorder ?? false}
                onCheckedChange={(checked) => updateAppData('flowShowCardBorder', checked)}
              />
            </div>
          )}
          
          {/* Product Backgrounds for Corporate and Showcase Templates */}
          {(appData.template === 'corporate' || appData.template === 'showcase') && (
            <>
              <div className="pt-6 border-t border-app-border">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center space-x-2">
                  <Image className="w-4 h-4" />
                  <span>Fundos dos Produtos</span>
                </h3>
                
                {/* Main Product Background */}
                <div className="space-y-2 mb-4">
                  <Label className="text-sm text-app-muted">Fundo do Produto Principal</Label>
                  <div className="upload-zone relative cursor-pointer hover:bg-app-surface-hover rounded-xl transition-colors">
                    <div className="flex flex-col items-center space-y-2 p-3">
                      <div className="w-full h-20 bg-app-surface-hover rounded-xl flex items-center justify-center overflow-hidden relative">
                        {(appData as any).mainProductBackground ? (
                          <>
                            <img 
                              src={(appData as any).mainProductBackground.url} 
                              alt="Fundo Principal" 
                              className="w-full h-full object-cover"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-5 w-5 bg-black/60 hover:bg-black/80 text-white z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                updateAppData('mainProductBackground', null);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <Image className="w-6 h-6 text-app-muted" />
                        )}
                      </div>
                    </div>
                    <Input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('mainProductBackground', file, 'main-product-bg');
                      }}
                    />
                  </div>
                </div>
                
                {/* Bonus Backgrounds */}
                {maxProducts > 1 && (
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: maxProducts - 1 }, (_, i) => i + 1).map((num) => {
                      const fieldName = `bonus${num}Background` as keyof typeof appData;
                      const background = appData[fieldName];
                      
                      return (
                        <div key={num} className="space-y-2">
                          <Label className="text-xs text-app-muted">Fundo Bônus {num}</Label>
                          <div className="upload-zone relative cursor-pointer hover:bg-app-surface-hover rounded-lg transition-colors">
                            <div className="flex flex-col items-center p-2">
                              <div className="w-full h-14 bg-app-surface-hover rounded-lg flex items-center justify-center overflow-hidden relative">
                                {background ? (
                                  <>
                                    <img 
                                      src={(background as any).url} 
                                      alt={`Fundo Bônus ${num}`} 
                                      className="w-full h-full object-cover"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute top-0.5 right-0.5 h-4 w-4 bg-black/60 hover:bg-black/80 text-white z-10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        updateAppData(fieldName, null);
                                      }}
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </Button>
                                  </>
                                ) : (
                                  <Image className="w-4 h-4 text-app-muted" />
                                )}
                              </div>
                            </div>
                            <Input
                              type="file"
                              accept=".png,.jpg,.jpeg"
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(fieldName, file, `bonus${num}-bg`);
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CustomizationPanel;
