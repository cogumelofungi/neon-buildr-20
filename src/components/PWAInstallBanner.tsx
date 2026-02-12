import { useState, useEffect } from 'react';
import { X, Download, Monitor, Smartphone, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { detectDevice } from '@/utils/pwaDetection';
import { useLanguage } from '@/hooks/useLanguage';
import { usePWASettings, InstructionStep, DevicePWASettings, AndroidBrowser, IOSBrowser } from '@/hooks/usePWASettings';

interface PWAInstallBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
  hasPrompt: boolean;
  appIcon?: string;
  appName?: string;
}

export const PWAInstallBanner = ({ 
  onInstall, 
  onDismiss, 
  hasPrompt,
  appIcon,
  appName 
}: PWAInstallBannerProps) => {
  const { t } = useLanguage();
  const { settings, loading } = usePWASettings();
  const [device] = useState(() => detectDevice());
  const [showInstructions, setShowInstructions] = useState(false);
  
  const isDesktop = !device.isIOS && !device.isAndroid;
  const isAndroid = device.isAndroid;
  const isIOS = device.isIOS;

  // Detecta qual navegador Android está sendo usado
  const getAndroidBrowser = (): AndroidBrowser => {
    if (device.isChrome) return 'chrome';
    if (device.isFirefox) return 'firefox';
    if (device.isSamsung) return 'samsung';
    if (device.isOpera) return 'opera';
    if (device.isEdge) return 'edge';
    if (device.isBrave) return 'brave';
    return 'other';
  };

  // Detecta qual navegador iOS está sendo usado
  const getIOSBrowser = (): IOSBrowser => {
    if (device.isSafari) return 'safari';
    if (device.isChrome) return 'chrome';
    if (device.isFirefox) return 'firefox';
    if (device.isEdge) return 'edge';
    return 'other';
  };

  // Obtém configurações do dispositivo/navegador atual
  const getDeviceSettings = (): DevicePWASettings | null => {
    if (isDesktop) return settings.desktop;
    if (isAndroid) {
      const browser = getAndroidBrowser();
      return settings.android[browser];
    }
    if (isIOS) {
      const browser = getIOSBrowser();
      return settings.ios[browser];
    }
    return null;
  };

  const deviceSettings = getDeviceSettings();

  // Log debug para entender por que não aparece
  useEffect(() => {
    console.log('[PWABanner] Device info:', {
      isDesktop,
      isAndroid,
      isIOS,
      device,
    });
    console.log('[PWABanner] Settings loaded:', {
      loading,
      deviceSettings,
      hasPrompt,
    });
  }, [loading, deviceSettings, hasPrompt, isDesktop, isAndroid, isIOS, device]);

  // Verifica se deve mostrar baseado nas configurações
  const shouldShow = () => {
    if (!deviceSettings) {
      console.log('[PWABanner] shouldShow: false - no deviceSettings');
      return false;
    }
    const result = deviceSettings.enabled;
    console.log('[PWABanner] shouldShow:', result, 'enabled:', deviceSettings.enabled);
    return result;
  };

  // Desktop com prompt ou Android com prompt pode instalar diretamente
  // iOS nunca pode instalar diretamente
  const canInstallDirectly = hasPrompt && !isIOS;

  const handleInstallClick = () => {
    if (canInstallDirectly) {
      onInstall();
    } else {
      setShowInstructions(true);
    }
  };

  // Helper para obter texto customizado ou fallback
  const getText = (customText: string | undefined, fallbackKey: string) => {
    return customText?.trim() || t(fallbackKey);
  };

  // Obter instruções do dispositivo atual
  const getInstructions = (): InstructionStep[] => {
    return deviceSettings?.instructions || [];
  };

  // Obter ícone da plataforma
  const PlatformIcon = isIOS ? Apple : (isAndroid ? Smartphone : Monitor);

  // Renderiza as instruções de instalação
  const renderInstructions = () => {
    const steps = getInstructions();
    
    return (
      <div className="space-y-3">
        {steps.map((step: InstructionStep, index: number) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <span className="text-sm">{step.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return null;
  if (!shouldShow()) return null;

  // Tela de instruções detalhadas
  if (showInstructions) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center gap-3">
            {appIcon ? (
              <img 
                src={appIcon} 
                alt={appName || 'App'} 
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <PlatformIcon className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-base">
                {t('pwa.install.title')}
              </h3>
              <p className="text-xs text-muted-foreground">{appName || t("pwa.install.app")}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowInstructions(false);
                onDismiss();
              }}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Instruções */}
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              {t('pwa.install.follow')}
            </p>
            {renderInstructions()}
          </div>

          {/* Footer */}
          <div className="p-4 pt-0">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowInstructions(false);
                onDismiss();
              }}
            >
              {t('pwa.install.understood')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Banner inicial compacto
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-card border border-border rounded-2xl shadow-xl z-50 animate-in slide-in-from-bottom duration-300">
      <div className="p-4">
        <div className="flex items-center gap-3">
          {appIcon ? (
            <img 
              src={appIcon} 
              alt={appName || 'App'} 
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <PlatformIcon className="w-6 h-6 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {appName || getText(deviceSettings?.bannerTitle, 'pwa.install.app')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {getText(deviceSettings?.bannerSubtitle, 'pwa.install.tap')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-8 w-8 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-3">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {getText(deviceSettings?.installButtonText, 'pwa.install.now')}
          </Button>
        </div>
      </div>
    </div>
  );
};
