import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Smartphone, Apple, Save, Chrome } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InstructionStep {
  icon: string;
  text: string;
}

interface DevicePWASettings {
  enabled: boolean;
  autoShowBanner: boolean;
  dismissPersistent: boolean;
  bannerTitle: string;
  bannerSubtitle: string;
  installButtonText: string;
  instructions: InstructionStep[];
}

type AndroidBrowser = 'chrome' | 'firefox' | 'samsung' | 'opera' | 'edge' | 'brave' | 'other';
type IOSBrowser = 'safari' | 'chrome' | 'firefox' | 'edge' | 'other';

interface AndroidBrowserSettings {
  chrome: DevicePWASettings;
  firefox: DevicePWASettings;
  samsung: DevicePWASettings;
  opera: DevicePWASettings;
  edge: DevicePWASettings;
  brave: DevicePWASettings;
  other: DevicePWASettings;
}

interface IOSBrowserSettings {
  safari: DevicePWASettings;
  chrome: DevicePWASettings;
  firefox: DevicePWASettings;
  edge: DevicePWASettings;
  other: DevicePWASettings;
}

interface PWASettings {
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

const androidBrowserInfo: Record<AndroidBrowser, { label: string; icon: string }> = {
  chrome: { label: 'Chrome', icon: '🌐' },
  firefox: { label: 'Firefox', icon: '🦊' },
  samsung: { label: 'Samsung Internet', icon: '🌐' },
  opera: { label: 'Opera', icon: '🔴' },
  edge: { label: 'Edge', icon: '🔵' },
  brave: { label: 'Brave', icon: '🦁' },
  other: { label: 'Outros', icon: '📱' },
};

const iosBrowserInfo: Record<IOSBrowser, { label: string; icon: string }> = {
  safari: { label: 'Safari', icon: '🧭' },
  chrome: { label: 'Chrome', icon: '🌐' },
  firefox: { label: 'Firefox', icon: '🦊' },
  edge: { label: 'Edge', icon: '🔵' },
  other: { label: 'Outros', icon: '📱' },
};

const PWASettingsPanel = () => {
  const { t } = useLanguage();
  
  const createDefaultSettings = (): PWASettings => ({
    desktop: createDefaultDeviceSettings(defaultDesktopInstructions),
    android: createDefaultAndroidSettings(),
    ios: createDefaultIOSSettings(),
  });

  const [settings, setSettings] = useState<PWASettings>(createDefaultSettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeAndroidBrowser, setActiveAndroidBrowser] = useState<AndroidBrowser>('chrome');
  const [activeIOSBrowser, setActiveIOSBrowser] = useState<IOSBrowser>('safari');

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
      }

      if (data?.value) {
        const parsedValue = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        
        if (parsedValue.android?.chrome) {
          // Handle iOS - check if it's the new browser-based structure
          const loadedIOS = parsedValue.ios?.safari 
            ? {
                safari: { ...createDefaultDeviceSettings(defaultIOSSafariInstructions), ...parsedValue.ios.safari },
                chrome: { ...createDefaultDeviceSettings(defaultIOSChromeInstructions), ...parsedValue.ios.chrome },
                firefox: { ...createDefaultDeviceSettings(defaultIOSFirefoxInstructions), ...parsedValue.ios.firefox },
                edge: { ...createDefaultDeviceSettings(defaultIOSEdgeInstructions), ...parsedValue.ios.edge },
                other: { ...createDefaultDeviceSettings(defaultIOSOtherInstructions), ...parsedValue.ios.other },
              }
            : createDefaultIOSSettings();

          setSettings({
            desktop: { ...createDefaultDeviceSettings(defaultDesktopInstructions), ...parsedValue.desktop },
            android: {
              chrome: { ...createDefaultDeviceSettings(defaultAndroidChromeInstructions), ...parsedValue.android.chrome },
              firefox: { ...createDefaultDeviceSettings(defaultAndroidFirefoxInstructions), ...parsedValue.android.firefox },
              samsung: { ...createDefaultDeviceSettings(defaultAndroidSamsungInstructions), ...parsedValue.android.samsung },
              opera: { ...createDefaultDeviceSettings(defaultAndroidOperaInstructions), ...parsedValue.android.opera },
              edge: { ...createDefaultDeviceSettings(defaultAndroidEdgeInstructions), ...parsedValue.android.edge },
              brave: { ...createDefaultDeviceSettings(defaultAndroidBraveInstructions), ...parsedValue.android.brave },
              other: { ...createDefaultDeviceSettings(defaultAndroidOtherInstructions), ...parsedValue.android.other },
            },
            ios: loadedIOS,
          });
        } else if (parsedValue.desktop) {
          const oldAndroid = parsedValue.android || {};
          const migratedAndroid = createDefaultAndroidSettings();
          
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
            desktop: { ...createDefaultDeviceSettings(defaultDesktopInstructions), ...parsedValue.desktop },
            android: migratedAndroid,
            ios: createDefaultIOSSettings(),
          });
        } else {
          setSettings(createDefaultSettings());
        }
      } else {
        setSettings(createDefaultSettings());
      }
    } catch (error) {
      console.error('Error loading PWA settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'pwa_settings',
          value: JSON.stringify(settings)
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      toast.success(t('admin.pwa.saved'));
    } catch (error) {
      console.error('Error saving PWA settings:', error);
      toast.error(t('admin.pwa.error'));
    } finally {
      setSaving(false);
    }
  };

  const updateDesktopSetting = <K extends keyof DevicePWASettings>(key: K, value: DevicePWASettings[K]) => {
    setSettings(prev => ({
      ...prev,
      desktop: { ...prev.desktop, [key]: value }
    }));
  };

  const updateAndroidBrowserSetting = <K extends keyof DevicePWASettings>(
    browser: AndroidBrowser,
    key: K,
    value: DevicePWASettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      android: {
        ...prev.android,
        [browser]: { ...prev.android[browser], [key]: value }
      }
    }));
  };

  const updateDesktopInstruction = (index: number, field: 'icon' | 'text', value: string) => {
    setSettings(prev => {
      const updated = [...prev.desktop.instructions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, desktop: { ...prev.desktop, instructions: updated } };
    });
  };

  const addDesktopInstruction = () => {
    setSettings(prev => ({
      ...prev,
      desktop: { ...prev.desktop, instructions: [...prev.desktop.instructions, { icon: '•', text: '' }] }
    }));
  };

  const removeDesktopInstruction = (index: number) => {
    if (settings.desktop.instructions.length > 1) {
      setSettings(prev => ({
        ...prev,
        desktop: { ...prev.desktop, instructions: prev.desktop.instructions.filter((_, i) => i !== index) }
      }));
    }
  };

  const resetDesktopInstructions = () => {
    setSettings(prev => ({
      ...prev,
      desktop: { ...prev.desktop, instructions: defaultDesktopInstructions }
    }));
  };

  const updateAndroidInstruction = (browser: AndroidBrowser, index: number, field: 'icon' | 'text', value: string) => {
    setSettings(prev => {
      const updated = [...prev.android[browser].instructions];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        android: {
          ...prev.android,
          [browser]: { ...prev.android[browser], instructions: updated }
        }
      };
    });
  };

  const addAndroidInstruction = (browser: AndroidBrowser) => {
    setSettings(prev => ({
      ...prev,
      android: {
        ...prev.android,
        [browser]: {
          ...prev.android[browser],
          instructions: [...prev.android[browser].instructions, { icon: '•', text: '' }]
        }
      }
    }));
  };

  const removeAndroidInstruction = (browser: AndroidBrowser, index: number) => {
    if (settings.android[browser].instructions.length > 1) {
      setSettings(prev => ({
        ...prev,
        android: {
          ...prev.android,
          [browser]: {
            ...prev.android[browser],
            instructions: prev.android[browser].instructions.filter((_, i) => i !== index)
          }
        }
      }));
    }
  };

  const getDefaultAndroidInstructions = (browser: AndroidBrowser): InstructionStep[] => {
    const defaults: Record<AndroidBrowser, InstructionStep[]> = {
      chrome: defaultAndroidChromeInstructions,
      firefox: defaultAndroidFirefoxInstructions,
      samsung: defaultAndroidSamsungInstructions,
      opera: defaultAndroidOperaInstructions,
      edge: defaultAndroidEdgeInstructions,
      brave: defaultAndroidBraveInstructions,
      other: defaultAndroidOtherInstructions,
    };
    return defaults[browser];
  };

  const resetAndroidInstructions = (browser: AndroidBrowser) => {
    setSettings(prev => ({
      ...prev,
      android: {
        ...prev.android,
        [browser]: { ...prev.android[browser], instructions: getDefaultAndroidInstructions(browser) }
      }
    }));
  };

  // iOS Browser Functions
  const updateIOSBrowserSetting = <K extends keyof DevicePWASettings>(
    browser: IOSBrowser,
    key: K,
    value: DevicePWASettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      ios: {
        ...prev.ios,
        [browser]: { ...prev.ios[browser], [key]: value }
      }
    }));
  };

  const updateIOSInstruction = (browser: IOSBrowser, index: number, field: 'icon' | 'text', value: string) => {
    setSettings(prev => {
      const updated = [...prev.ios[browser].instructions];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        ios: {
          ...prev.ios,
          [browser]: { ...prev.ios[browser], instructions: updated }
        }
      };
    });
  };

  const addIOSInstruction = (browser: IOSBrowser) => {
    setSettings(prev => ({
      ...prev,
      ios: {
        ...prev.ios,
        [browser]: {
          ...prev.ios[browser],
          instructions: [...prev.ios[browser].instructions, { icon: '•', text: '' }]
        }
      }
    }));
  };

  const removeIOSInstruction = (browser: IOSBrowser, index: number) => {
    if (settings.ios[browser].instructions.length > 1) {
      setSettings(prev => ({
        ...prev,
        ios: {
          ...prev.ios,
          [browser]: {
            ...prev.ios[browser],
            instructions: prev.ios[browser].instructions.filter((_, i) => i !== index)
          }
        }
      }));
    }
  };

  const getDefaultIOSInstructions = (browser: IOSBrowser): InstructionStep[] => {
    const defaults: Record<IOSBrowser, InstructionStep[]> = {
      safari: defaultIOSSafariInstructions,
      chrome: defaultIOSChromeInstructions,
      firefox: defaultIOSFirefoxInstructions,
      edge: defaultIOSEdgeInstructions,
      other: defaultIOSOtherInstructions,
    };
    return defaults[browser];
  };

  const resetIOSInstructions = (browser: IOSBrowser) => {
    setSettings(prev => ({
      ...prev,
      ios: {
        ...prev.ios,
        [browser]: { ...prev.ios[browser], instructions: getDefaultIOSInstructions(browser) }
      }
    }));
  };

  const renderDeviceSettings = (
    deviceSettings: DevicePWASettings,
    label: string,
    updateSetting: <K extends keyof DevicePWASettings>(key: K, value: DevicePWASettings[K]) => void,
    updateInstruction: (index: number, field: 'icon' | 'text', value: string) => void,
    addInstruction: () => void,
    removeInstruction: (index: number) => void,
    resetInstructions: () => void
  ) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Habilitar Banner</Label>
            <p className="text-sm text-muted-foreground">
              Exibir banner de instalação para {label}
            </p>
          </div>
          <Switch
            checked={deviceSettings.enabled}
            onCheckedChange={(checked) => updateSetting('enabled', checked)}
          />
        </div>

        {deviceSettings.enabled && (
          <>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Mostrar Automaticamente</Label>
                <p className="text-sm text-muted-foreground">
                  Exibir banner automaticamente ao acessar o app
                </p>
              </div>
              <Switch
                checked={deviceSettings.autoShowBanner}
                onCheckedChange={(checked) => updateSetting('autoShowBanner', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Não Mostrar Novamente</Label>
                <p className="text-sm text-muted-foreground">
                  Se fechado, não mostrar mais para este usuário
                </p>
              </div>
              <Switch
                checked={deviceSettings.dismissPersistent}
                onCheckedChange={(checked) => updateSetting('dismissPersistent', checked)}
              />
            </div>

            <Card className="bg-muted/20 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Textos Personalizados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Título do Banner</Label>
                  <Input
                    value={deviceSettings.bannerTitle}
                    onChange={(e) => updateSetting('bannerTitle', e.target.value)}
                    placeholder="Instale o App"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Subtítulo</Label>
                  <Input
                    value={deviceSettings.bannerSubtitle}
                    onChange={(e) => updateSetting('bannerSubtitle', e.target.value)}
                    placeholder="Toque para instalar"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Texto do Botão</Label>
                  <Input
                    value={deviceSettings.installButtonText}
                    onChange={(e) => updateSetting('installButtonText', e.target.value)}
                    placeholder="Instalar Agora"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para usar textos padrão
                </p>
              </CardContent>
            </Card>

            <Card className="bg-muted/20 border-border/50">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Instruções de Instalação</CardTitle>
                <Button variant="outline" size="sm" onClick={resetInstructions}>
                  Restaurar Padrão
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {deviceSettings.instructions.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">{index + 1}.</span>
                    <Input
                      value={step.icon}
                      onChange={(e) => updateInstruction(index, 'icon', e.target.value)}
                      className="w-12 text-center px-1"
                      placeholder="📱"
                    />
                    <Input
                      value={step.text}
                      onChange={(e) => updateInstruction(index, 'text', e.target.value)}
                      className="flex-1"
                      placeholder="Instrução..."
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInstruction(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      disabled={deviceSettings.instructions.length <= 1}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addInstruction}
                  className="w-full mt-2"
                >
                  + Adicionar Passo
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="bg-app-surface border-app-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-app-surface border-app-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Config PWA - Banner de Instalação
          </CardTitle>
          <CardDescription>
            Configure o banner de instalação para cada plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="desktop" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="desktop" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Desktop
              </TabsTrigger>
              <TabsTrigger value="android" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Android
              </TabsTrigger>
              <TabsTrigger value="ios" className="flex items-center gap-2">
                <Apple className="w-4 h-4" />
                iOS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="desktop">
              {renderDeviceSettings(
                settings.desktop,
                'Desktop',
                updateDesktopSetting,
                updateDesktopInstruction,
                addDesktopInstruction,
                removeDesktopInstruction,
                resetDesktopInstructions
              )}
            </TabsContent>

            <TabsContent value="android">
              <div className="space-y-4">
                {/* Sub-tabs para navegadores Android */}
                <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg">
                  {(Object.keys(androidBrowserInfo) as AndroidBrowser[]).map((browser) => (
                    <Button
                      key={browser}
                      variant={activeAndroidBrowser === browser ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveAndroidBrowser(browser)}
                      className="flex items-center gap-1.5"
                    >
                      <span>{androidBrowserInfo[browser].icon}</span>
                      {androidBrowserInfo[browser].label}
                    </Button>
                  ))}
                </div>

                {/* Configurações do navegador selecionado */}
                {renderDeviceSettings(
                  settings.android[activeAndroidBrowser],
                  `Android ${androidBrowserInfo[activeAndroidBrowser].label}`,
                  (key, value) => updateAndroidBrowserSetting(activeAndroidBrowser, key, value),
                  (index, field, value) => updateAndroidInstruction(activeAndroidBrowser, index, field, value),
                  () => addAndroidInstruction(activeAndroidBrowser),
                  (index) => removeAndroidInstruction(activeAndroidBrowser, index),
                  () => resetAndroidInstructions(activeAndroidBrowser)
                )}
              </div>
            </TabsContent>

            <TabsContent value="ios">
              <div className="space-y-4">
                {/* Sub-tabs para navegadores iOS */}
                <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg">
                  {(Object.keys(iosBrowserInfo) as IOSBrowser[]).map((browser) => (
                    <Button
                      key={browser}
                      variant={activeIOSBrowser === browser ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveIOSBrowser(browser)}
                      className="flex items-center gap-1.5"
                    >
                      <span>{iosBrowserInfo[browser].icon}</span>
                      {iosBrowserInfo[browser].label}
                    </Button>
                  ))}
                </div>

                {/* Configurações do navegador selecionado */}
                {renderDeviceSettings(
                  settings.ios[activeIOSBrowser],
                  `iOS ${iosBrowserInfo[activeIOSBrowser].label}`,
                  (key, value) => updateIOSBrowserSetting(activeIOSBrowser, key, value),
                  (index, field, value) => updateIOSInstruction(activeIOSBrowser, index, field, value),
                  () => addIOSInstruction(activeIOSBrowser),
                  (index) => removeIOSInstruction(activeIOSBrowser, index),
                  () => resetIOSInstructions(activeIOSBrowser)
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};

export default PWASettingsPanel;
