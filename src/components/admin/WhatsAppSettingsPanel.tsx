import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Save, Phone, MessageSquare, Palette, Eye } from "lucide-react";
import { useLanguage } from '@/hooks/useLanguage';
import { PhoneInputCustom } from "@/components/PhoneInputCustom";

interface WhatsAppConfig {
  enabled: boolean;
  phone: string;
  message: string;
  position: "bottom-right" | "bottom-left";
  buttonColor: string;
  buttonText: string;
  showText: boolean;
  iconSize: "small" | "medium" | "large";
}

const DEFAULT_CONFIG: WhatsAppConfig = {
  enabled: false,
  phone: "",
  message: "",
  position: "bottom-right",
  buttonColor: "#25D366",
  buttonText: "",
  showText: true,
  iconSize: "medium",
};

export default function WhatsAppSettingsPanel() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [config, setConfig] = useState<WhatsAppConfig>(DEFAULT_CONFIG);

  // ✅ CORREÇÃO: useEffect agora está dentro do componente
  useEffect(() => {
    if (!config.message) {
      setConfig(prev => ({
        ...prev,
        message: t("whatsapp.default_message"),
        buttonText: prev.buttonText || t("whatsapp.contact_us"),
      }));
    }
  }, [t]); // quando o idioma muda, ele atualiza a mensagem padrão

  // Carrega configuração do banco
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoadingConfig(true);
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "whatsapp_config")
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        setConfig(JSON.parse(data.value));
      }
    } catch (error: any) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro ao carregar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const handleSave = async () => {
    if (config.enabled && !config.phone.trim()) {
      toast({
        title: t('whatsapp.attention'),
        description: t('whatsapp.enter_phone'),
        variant: "destructive"
      });
      return;
    }
  
    // Validar formato
    const phoneNumbers = config.phone.replace(/[^0-9]/g, '');
    if (config.enabled && phoneNumbers.length < 10) {
      toast({
        title: t('whatsapp.attention'),
        description: t('whatsapp.invalid_phone'),
        variant: "destructive"
      });
      return;
    }
  
    setLoading(true);
  
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'whatsapp_config',
          value: JSON.stringify(config)
        }, {
          onConflict: 'key'
        });
  
      if (error) throw error;
  
      toast({
        title: t('whatsapp.settings_saved'),
        description: config.enabled 
          ? t('whatsapp.button_active')
          : t('whatsapp.button_disabled')
      });
  
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: t('error.saving'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = <K extends keyof WhatsAppConfig>(
    key: K,
    value: WhatsAppConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (isLoadingConfig) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-muted animate-pulse rounded" />
              <div className="h-6 w-40 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-20 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card principal */}
      <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[#25D366]" />
            Configurações do WhatsApp
          </CardTitle>
          <CardDescription>
            Configure o botão flutuante de WhatsApp que aparece no app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ativar / desativar */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
            <div className="space-y-0.5">
              <Label htmlFor="enabled" className="text-base font-semibold">
                Ativar WhatsApp
              </Label>
              <p className="text-sm text-muted-foreground">
                Exibir botão flutuante no app
              </p>
            </div>
            <Switch
              id="enabled"
              checked={config.enabled}
              onCheckedChange={checked => handleConfigChange("enabled", checked)}
            />
          </div>

          {config.enabled && (
            <>
              {/* Número */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 font-semibold">
                  <Phone className="h-4 w-4 text-[#25D366]" />
                  Número do WhatsApp
                </Label>
                <PhoneInputCustom
                  value={config.phone.startsWith('+') ? config.phone : config.phone ? `+${config.phone}` : ''}
                  onChange={(value) => {
                    // Remove o + e espaços para salvar apenas números
                    const cleanValue = value?.replace(/[^0-9]/g, '') || '';
                    handleConfigChange("phone", cleanValue);
                  }}
                  placeholder="(11) 99999-9999"
                />
                <p className="text-xs text-muted-foreground">
                  Selecione o país e digite o número
                </p>
              </div>

              {/* Mensagem */}
              <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-2 font-semibold">
                  <MessageSquare className="h-4 w-4 text-[#25D366]" />
                  Mensagem Pré-preenchida
                </Label>
                <Textarea
                  id="message"
                  placeholder="Mensagem enviada automaticamente"
                  value={config.message}
                  onChange={e => handleConfigChange("message", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Texto do botão */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonText" className="font-semibold">
                    Texto do Botão
                  </Label>
                  <Input
                    id="buttonText"
                    placeholder="Ex: Fale Conosco"
                    value={config.buttonText}
                    onChange={e => handleConfigChange("buttonText", e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="space-y-0.5">
                    <Label htmlFor="showText" className="text-sm font-semibold">
                      Mostrar Texto
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Exibir ao passar o mouse
                    </p>
                  </div>
                  <Switch
                    id="showText"
                    checked={config.showText}
                    onCheckedChange={checked => handleConfigChange("showText", checked)}
                  />
                </div>
              </div>

              {/* Posição e estilo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Posição */}
                <div className="space-y-2">
                  <Label htmlFor="position" className="font-semibold">
                    Posição na Tela
                  </Label>
                  <Select
                    value={config.position}
                    onValueChange={(value: "bottom-right" | "bottom-left") =>
                      handleConfigChange("position", value)
                    }
                  >
                    <SelectTrigger id="position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Inferior Direito</SelectItem>
                      <SelectItem value="bottom-left">Inferior Esquerdo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tamanho */}
                <div className="space-y-2">
                  <Label htmlFor="icon-size" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Tamanho do Ícone
                  </Label>
                  <Select
                    value={config.iconSize}
                    onValueChange={(value: "small" | "medium" | "large") =>
                      handleConfigChange("iconSize", value)
                    }
                  >
                    <SelectTrigger id="icon-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeno (48px)</SelectItem>
                      <SelectItem value="medium">Médio (56px)</SelectItem>
                      <SelectItem value="large">Grande (64px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cor */}
                <div className="space-y-2">
                  <Label htmlFor="buttonColor" className="flex items-center gap-2 font-semibold">
                    <Palette className="h-4 w-4" />
                    Cor do Botão
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="buttonColor"
                      type="color"
                      value={config.buttonColor}
                      onChange={e => handleConfigChange("buttonColor", e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={config.buttonColor}
                      onChange={e => handleConfigChange("buttonColor", e.target.value)}
                      placeholder="#25D366"
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border-2 border-dashed border-primary/30">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-primary" />
                  <Label className="font-semibold">Preview do Botão</Label>
                </div>
                <div className="flex justify-center items-center h-24 bg-app-bg/50 rounded-lg relative">
                  <Button
                    size="lg"
                    className="rounded-full shadow-lg flex items-center gap-2"
                    style={{
                      backgroundColor: config.buttonColor,
                      color: "#fff",
                    }}
                  >
                    <MessageCircle className="h-5 w-5" />
                    {config.showText && <span>{config.buttonText}</span>}
                  </Button>

                  <p className="absolute bottom-2 text-xs text-muted-foreground">
                    Preview em tempo real
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Botão Salvar */}
          <Button onClick={handleSave} disabled={loading} size="lg" className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">💡 Como funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-2">
            <span className="font-bold text-foreground">1.</span>
            <p>Configure o número no formato internacional (DDI + DDD + Número)</p>
          </div>
          <div className="flex gap-2">
            <span className="font-bold text-foreground">2.</span>
            <p>Personalize a mensagem automática</p>
          </div>
          <div className="flex gap-2">
            <span className="font-bold text-foreground">3.</span>
            <p>Escolha posição e cor do botão</p>
          </div>
          <div className="flex gap-2">
            <span className="font-bold text-foreground">4.</span>
            <p>O botão aparece flutuante na rota /app</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
