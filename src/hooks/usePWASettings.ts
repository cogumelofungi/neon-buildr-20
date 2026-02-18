import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InstructionStep {
  icon: string;
  text: string;
}

export interface DevicePWASettings {
  enabled: boolean;
  autoShowBanner: boolean;
  dismissPersistent: boolean;
  bannerTitle: string;
  bannerSubtitle: string;
  installButtonText: string;
  instructions: InstructionStep[];
}

export type AndroidBrowser = 'chrome' | 'firefox' | 'samsung' | 'opera' | 'edge' | 'brave' | 'other';
export type IOSBrowser = 'safari' | 'chrome' | 'firefox' | 'edge' | 'other';

export interface AndroidBrowserSettings {
  chrome: DevicePWASettings;
  firefox: DevicePWASettings;
  samsung: DevicePWASettings;
  opera: DevicePWASettings;
  edge: DevicePWASettings;
  brave: DevicePWASettings;
  other: DevicePWASettings;
}

export interface IOSBrowserSettings {
  safari: DevicePWASettings;
  chrome: DevicePWASettings;
  firefox: DevicePWASettings;
  edge: DevicePWASettings;
  other: DevicePWASettings;
}

export interface PWASettings {
  desktop: DevicePWASettings;
  android: AndroidBrowserSettings;
  ios: IOSBrowserSettings;
}

const defaultDesktopInstructions: InstructionStep[] = [
  { icon: '⋮', text: 'Clique no menu do navegador' },
  { icon: '📥', text: 'Instalar aplicativo' }
];

const defaultAndroidChromeInstructions: InstructionStep[] = [
  { icon: '⋮', text: 'Toque nos 3 pontos (menu)' },
  { icon: '📥', text: 'Adicionar à tela inicial' }
];

const defaultAndroidFirefoxInstructions: InstructionStep[] = [
  { icon: '⋮', text: 'Toque no menu' },
  { icon: '📥', text: 'Instalar ou Adicionar à tela inicial' }
];

const defaultAndroidSamsungInstructions: InstructionStep[] = [
  { icon: '☰', text: 'Toque no menu' },
  { icon: '➕', text: 'Adicionar página a → Tela inicial' }
];

const defaultAndroidOperaInstructions: InstructionStep[] = [
  { icon: '⋮', text: 'Toque no menu no canto superior' },
  { icon: '📥', text: 'Adicionar à → Tela inicial' }
];

const defaultAndroidEdgeInstructions: InstructionStep[] = [
  { icon: '⋯', text: 'Toque nos 3 pontos (menu)' },
  { icon: '📥', text: 'Adicionar ao telefone' }
];

const defaultAndroidBraveInstructions: InstructionStep[] = [
  { icon: '⋮', text: 'Toque no menu Brave' },
  { icon: '📥', text: 'Adicionar à tela inicial' }
];

const defaultAndroidOtherInstructions: InstructionStep[] = [
  { icon: '⋮', text: 'Abra o menu do navegador' },
  { icon: '📥', text: 'Adicionar à tela inicial' }
];

const defaultIOSSafariInstructions: InstructionStep[] = [
  { icon: '📤', text: 'Toque no botão Compartilhar' },
  { icon: '➕', text: 'Adicionar à Tela de Início' }
];

const defaultIOSChromeInstructions: InstructionStep[] = [
  { icon: '📤', text: 'Toque no botão Compartilhar' },
  { icon: '➕', text: 'Adicionar à Tela de Início' },
  { icon: '💡', text: 'Ou abra no Safari para melhor experiência' }
];

const defaultIOSFirefoxInstructions: InstructionStep[] = [
  { icon: '⋮', text: 'Toque no menu (3 pontos)' },
  { icon: '📤', text: 'Compartilhar' },
  { icon: '➕', text: 'Adicionar à Tela de Início' }
];

const defaultIOSEdgeInstructions: InstructionStep[] = [
  { icon: '⋯', text: 'Toque no menu (3 pontos)' },
  { icon: '📤', text: 'Compartilhar' },
  { icon: '➕', text: 'Adicionar à Tela de Início' }
];

const defaultIOSOtherInstructions: InstructionStep[] = [
  { icon: '📤', text: 'Procure o botão Compartilhar' },
  { icon: '➕', text: 'Adicionar à Tela de Início' },
  { icon: '💡', text: 'Recomendamos usar o Safari para melhor experiência' }
];

const createDefaultDeviceSettings = (instructions: InstructionStep[]): DevicePWASettings => ({
  enabled: true,
  autoShowBanner: true,
  dismissPersistent: false,
  bannerTitle: '',
  bannerSubtitle: '',
  installButtonText: '',
  instructions,
});

const createDefaultAndroidSettings = (): AndroidBrowserSettings => ({
  chrome: createDefaultDeviceSettings(defaultAndroidChromeInstructions),
  firefox: createDefaultDeviceSettings(defaultAndroidFirefoxInstructions),
  samsung: createDefaultDeviceSettings(defaultAndroidSamsungInstructions),
  opera: createDefaultDeviceSettings(defaultAndroidOperaInstructions),
  edge: createDefaultDeviceSettings(defaultAndroidEdgeInstructions),
  brave: createDefaultDeviceSettings(defaultAndroidBraveInstructions),
  other: createDefaultDeviceSettings(defaultAndroidOtherInstructions),
});

const createDefaultIOSSettings = (): IOSBrowserSettings => ({
  safari: createDefaultDeviceSettings(defaultIOSSafariInstructions),
  chrome: createDefaultDeviceSettings(defaultIOSChromeInstructions),
  firefox: createDefaultDeviceSettings(defaultIOSFirefoxInstructions),
  edge: createDefaultDeviceSettings(defaultIOSEdgeInstructions),
  other: createDefaultDeviceSettings(defaultIOSOtherInstructions),
});

const defaultSettings: PWASettings = {
  desktop: createDefaultDeviceSettings(defaultDesktopInstructions),
  android: createDefaultAndroidSettings(),
  ios: createDefaultIOSSettings(),
};

export const usePWASettings = () => {
  const [settings, setSettings] = useState<PWASettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'pwa_settings')
        .maybeSingle();

      if (error) {
        console.error('Error loading PWA settings:', error);
        setLoading(false);
        return;
      }

      if (data?.value) {
        const parsedValue = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        
        // Verificar se é o novo formato com navegadores Android
        if (parsedValue.android?.chrome) {
          // Handle iOS - check if it's the new browser-based structure
          const loadedIOS = parsedValue.ios?.safari 
            ? {
                safari: { ...defaultSettings.ios.safari, ...parsedValue.ios.safari },
                chrome: { ...defaultSettings.ios.chrome, ...parsedValue.ios.chrome },
                firefox: { ...defaultSettings.ios.firefox, ...parsedValue.ios.firefox },
                edge: { ...defaultSettings.ios.edge, ...parsedValue.ios.edge },
                other: { ...defaultSettings.ios.other, ...parsedValue.ios.other },
              }
            : createDefaultIOSSettings();

          setSettings({
            desktop: { ...defaultSettings.desktop, ...parsedValue.desktop },
            android: {
              chrome: { ...defaultSettings.android.chrome, ...parsedValue.android.chrome },
              firefox: { ...defaultSettings.android.firefox, ...parsedValue.android.firefox },
              samsung: { ...defaultSettings.android.samsung, ...parsedValue.android.samsung },
              opera: { ...defaultSettings.android.opera, ...parsedValue.android.opera },
              edge: { ...defaultSettings.android.edge, ...parsedValue.android.edge },
              brave: { ...defaultSettings.android.brave, ...parsedValue.android.brave },
              other: { ...defaultSettings.android.other, ...parsedValue.android.other },
            },
            ios: loadedIOS,
          });
        } else if (parsedValue.desktop) {
          // Formato anterior (android era DevicePWASettings simples)
          const oldAndroid = parsedValue.android || {};
          const migratedAndroid = createDefaultAndroidSettings();
          
          // Aplicar configurações antigas a todos os navegadores
          Object.keys(migratedAndroid).forEach(browser => {
            migratedAndroid[browser as AndroidBrowser] = {
              ...migratedAndroid[browser as AndroidBrowser],
              enabled: oldAndroid.enabled ?? true,
              autoShowBanner: oldAndroid.autoShowBanner ?? true,
              dismissPersistent: oldAndroid.dismissPersistent ?? false,
              bannerTitle: oldAndroid.bannerTitle ?? '',
              bannerSubtitle: oldAndroid.bannerSubtitle ?? '',
              installButtonText: oldAndroid.installButtonText ?? '',
            };
          });
          
          setSettings({
            desktop: { ...defaultSettings.desktop, ...parsedValue.desktop },
            android: migratedAndroid,
            ios: createDefaultIOSSettings(),
          });
        } else {
          // Formato muito antigo - migrar completamente
          const migratedDesktop: DevicePWASettings = {
            enabled: parsedValue.showOnDesktop ?? parsedValue.enabled ?? true,
            autoShowBanner: parsedValue.autoShowBanner ?? true,
            dismissPersistent: parsedValue.dismissPersistent ?? false,
            bannerTitle: parsedValue.bannerTitle ?? '',
            bannerSubtitle: parsedValue.bannerSubtitleDirect ?? '',
            installButtonText: parsedValue.installButtonText ?? '',
            instructions: parsedValue.desktopInstructions ?? defaultDesktopInstructions,
          };
          
          const migratedAndroid = createDefaultAndroidSettings();
          // Aplicar textos antigos a todos os navegadores
          Object.keys(migratedAndroid).forEach(browser => {
            migratedAndroid[browser as AndroidBrowser] = {
              ...migratedAndroid[browser as AndroidBrowser],
              enabled: parsedValue.showOnAndroid ?? parsedValue.enabled ?? true,
              bannerTitle: parsedValue.bannerTitle ?? '',
              bannerSubtitle: parsedValue.bannerSubtitleDirect ?? '',
              installButtonText: parsedValue.installButtonText ?? '',
            };
          });
          
          // Migrate old iOS settings to new browser-based structure
          const migratedIOS = createDefaultIOSSettings();
          const oldIOS = {
            enabled: parsedValue.showOnIOS ?? parsedValue.enabled ?? true,
            autoShowBanner: parsedValue.autoShowBanner ?? true,
            dismissPersistent: parsedValue.dismissPersistent ?? false,
            bannerTitle: parsedValue.bannerTitle ?? '',
            bannerSubtitle: parsedValue.bannerSubtitleDirect ?? '',
            installButtonText: parsedValue.installButtonText ?? '',
          };
          
          (Object.keys(migratedIOS) as IOSBrowser[]).forEach(browser => {
            migratedIOS[browser] = {
              ...migratedIOS[browser],
              ...oldIOS,
            };
          });
          
          setSettings({
            desktop: migratedDesktop,
            android: migratedAndroid,
            ios: migratedIOS,
          });
        }
      }
    } catch (error) {
      console.error('Error loading PWA settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refetch: loadSettings };
};
