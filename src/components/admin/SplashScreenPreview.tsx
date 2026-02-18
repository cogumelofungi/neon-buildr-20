import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Smartphone } from 'lucide-react';

interface App {
  id: string;
  nome: string;
  slug: string;
  cor: string;
  icone_url?: string;
  app_theme?: 'light' | 'dark';
}

const SplashScreenPreview = () => {
  const { t } = useLanguage();
  const [apps, setApps] = useState<App[]>([]);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('id, nome, slug, cor, icone_url, app_theme')
        .eq('status', 'publicado')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []).map(app => ({
        ...app,
        app_theme: (app.app_theme as 'light' | 'dark') || 'dark'
      }));
      
      setApps(typedData);
      if (typedData.length > 0) {
        setSelectedApp(typedData[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar apps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppChange = (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (app) setSelectedApp(app);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  const isDarkTheme = selectedApp?.app_theme === 'dark';
  const splashBgColor = isDarkTheme ? '#0a0a0a' : '#ffffff';
  const splashTextColor = isDarkTheme ? '#ffffff' : '#000000';

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Preview da Splash Screen PWA
            </h2>
            <p className="text-sm text-muted-foreground">
              O layout moderno já está aplicado! Quando usuários abrem o PWA instalado, veem primeiro a splash nativa rápida do sistema, 
              seguida pela splash customizada moderna com todos os efeitos visuais.
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t("admin.app.select")}</Label>
            <Select 
              value={selectedApp?.id} 
              onValueChange={handleAppChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um app..." />
              </SelectTrigger>
              <SelectContent>
                {apps.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {selectedApp && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview da Splash Screen - Layout Atual */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Preview - Layout Nativo (Sistema)
                  </h3>
                  <p className="text-xs text-muted-foreground">Splash rápida gerada pelo sistema operacional</p>
                </div>
              </div>

              {/* Simulação da Splash Screen - Atual */}
              <div className="relative mx-auto" style={{ width: '300px', height: '600px' }}>
                {/* Moldura do celular */}
                <div className="absolute inset-0 rounded-[3rem] border-[14px] border-gray-800 shadow-2xl overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-3xl z-10"></div>
                  
                  {/* Tela da Splash Screen - Layout Nativo (fundo MigraBook com "Carregando...") */}
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: '#0F1117' }}
                  >
                    <p className="text-white/60 text-sm">
                      Carregando...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Preview da Splash Screen - Layout Moderno */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Preview - Layout Moderno ✓ Ativo
                  </h3>
                  <p className="text-xs text-muted-foreground">Aplicado automaticamente após o carregamento do PWA</p>
                </div>
              </div>

              {/* Simulação da Splash Screen - Moderno */}
              <div className="relative mx-auto" style={{ width: '300px', height: '600px' }}>
                {/* Moldura do celular */}
                <div className="absolute inset-0 rounded-[3rem] border-[14px] border-gray-800 shadow-2xl overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-3xl z-10"></div>
                  
                  {/* Tela da Splash Screen - Layout Moderno */}
                  <div 
                    className="w-full h-full flex items-center justify-center relative overflow-hidden"
                    style={{ 
                      background: isDarkTheme 
                        ? `radial-gradient(circle at center, #1a1a1a 0%, ${splashBgColor} 100%)`
                        : `radial-gradient(circle at center, #f5f5f5 0%, ${splashBgColor} 100%)`
                    }}
                  >
                    {/* Padrão de pontos decorativo */}
                    <div 
                      className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage: `radial-gradient(circle, ${splashTextColor} 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                      }}
                    />

                    {/* Efeitos de background decorativos - círculos maiores e mais visíveis */}
                    <div 
                      className="absolute w-80 h-80 rounded-full blur-3xl opacity-25 animate-pulse"
                      style={{ 
                        background: selectedApp.cor,
                        top: '-15%',
                        right: '-25%',
                        animationDuration: '4s'
                      }}
                    />
                    <div 
                      className="absolute w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse"
                      style={{ 
                        background: selectedApp.cor,
                        bottom: '-15%',
                        left: '-25%',
                        animationDuration: '5s'
                      }}
                    />

                    {/* Círculos decorativos ao redor do ícone */}
                    <div 
                      className="absolute w-64 h-64 rounded-full opacity-10"
                      style={{ 
                        border: `2px solid ${selectedApp.cor}`,
                        animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }}
                    />
                    <div 
                      className="absolute w-80 h-80 rounded-full opacity-5"
                      style={{ 
                        border: `1px solid ${selectedApp.cor}`,
                        animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }}
                    />

                    {/* Container do ícone com contorno */}
                    <div className="relative z-10">
                      {/* Contorno externo brilhante */}
                      <div 
                        className="absolute -inset-3 rounded-[3rem] opacity-40 blur-md"
                        style={{ 
                          background: `linear-gradient(135deg, ${selectedApp.cor}, ${selectedApp.cor}99)`,
                        }}
                      />
                      
                      {/* Contorno sólido na cor do app */}
                      <div 
                        className="absolute -inset-1 rounded-[2.8rem] animate-scale-in"
                        style={{ 
                          background: `linear-gradient(135deg, ${selectedApp.cor}, ${selectedApp.cor}dd)`,
                          padding: '3px'
                        }}
                      >
                        <div 
                          className="w-full h-full rounded-[2.6rem]"
                          style={{ backgroundColor: splashBgColor }}
                        />
                      </div>

                      {/* Ícone do App */}
                      <div className="relative animate-scale-in">
                        {selectedApp.icone_url ? (
                          <img 
                            src={selectedApp.icone_url}
                            alt={selectedApp.nome}
                            className="w-32 h-32 rounded-[2.5rem] object-cover relative z-10"
                            style={{
                              boxShadow: `0 25px 50px -12px ${selectedApp.cor}60`
                            }}
                          />
                        ) : (
                          <div 
                            className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center relative z-10"
                            style={{ 
                              backgroundColor: selectedApp.cor,
                              boxShadow: `0 25px 50px -12px ${selectedApp.cor}60`
                            }}
                          >
                            <Smartphone className="w-16 h-16 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Brilhos decorativos */}
                    <div 
                      className="absolute w-32 h-32 rounded-full blur-2xl opacity-20"
                      style={{ 
                        background: selectedApp.cor,
                        top: '35%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Informações do App */}
          <Card className="p-6 lg:col-span-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Configuração Atual do Manifest
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Nome do App</Label>
                  <p className="text-foreground font-medium">{selectedApp.nome}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs">Slug</Label>
                  <p className="text-foreground font-mono text-sm">{selectedApp.slug}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs">Tema</Label>
                  <p className="text-foreground capitalize">{selectedApp.app_theme || 'dark'}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs">Display Mode</Label>
                  <p className="text-foreground">standalone</p>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs">Background Color (splash)</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border border-border"
                      style={{ backgroundColor: splashBgColor }}
                    />
                    <p className="text-foreground font-mono text-sm">{splashBgColor}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs">Theme Color</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border border-border"
                      style={{ backgroundColor: selectedApp.cor }}
                    />
                    <p className="text-foreground font-mono text-sm">{selectedApp.cor}</p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-muted-foreground text-xs">Ícone do App</Label>
                  <p className="text-foreground text-sm break-all">
                    {selectedApp.icone_url || '/icons/pwa-192.png (padrão)'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Como funcionam os Layouts?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground mb-2">Layout Nativo (Sistema):</p>
                    <ul className="space-y-1">
                      <li>• Gerado automaticamente pelo SO</li>
                      <li>• Usa apenas manifest.json</li>
                      <li>• Aparece antes do app carregar</li>
                      <li>• Limitado: apenas fundo e ícone</li>
                      <li>• Duração controlada pelo sistema</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">Layout Moderno (Aplicado ✓):</p>
                    <ul className="space-y-1">
                      <li>• Aparece após o app carregar (1.5s)</li>
                      <li>• Controle total sobre o design</li>
                      <li>• Gradientes, sombras e animações</li>
                      <li>• Círculos pulsantes e contornos</li>
                      <li>• Transição suave para o app</li>
                      <li className="text-primary font-medium">• Já está ativo no PWA!</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-xs text-foreground">
                    <strong>📱 Como ver em ação:</strong> Instale o app como PWA e abra. Você verá a splash nativa rápida do sistema, 
                    seguida imediatamente pela splash moderna customizada com todos os efeitos visuais.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {!selectedApp && apps.length === 0 && (
        <Card className="p-6">
          <div className="text-center py-12">
            <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum app publicado encontrado
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SplashScreenPreview;
