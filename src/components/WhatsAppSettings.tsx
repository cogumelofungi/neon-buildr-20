import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle } from "lucide-react";
import { PhoneInputCustom } from "@/components/PhoneInputCustom";

interface WhatsAppSettingsProps {
  appBuilder: any;
}

export default function WhatsAppSettings({ appBuilder }: WhatsAppSettingsProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            <CardTitle>{t("whatsapp.title")}</CardTitle>
          </div>
          <CardDescription>{t("whatsapp.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ativar WhatsApp */}
          <div className="flex items-center justify-between">
            <Label htmlFor="whatsapp-enabled">{t("whatsapp.enable")}</Label>
            <Switch
              id="whatsapp-enabled"
              checked={appBuilder.appData.whatsappEnabled}
              onCheckedChange={(checked) => 
                appBuilder.updateAppData('whatsappEnabled', checked)
              }
            />
          </div>

          {appBuilder.appData.whatsappEnabled && (
            <>
              {/* Número do WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp-phone">{t("whatsapp.phone")}</Label>
                <PhoneInputCustom
                  value={appBuilder.appData.whatsappPhone?.startsWith('+') 
                    ? appBuilder.appData.whatsappPhone 
                    : appBuilder.appData.whatsappPhone 
                      ? `+${appBuilder.appData.whatsappPhone}` 
                      : ''}
                  onChange={(value) => {
                    // Remove o + e caracteres não numéricos para salvar apenas números
                    const cleanValue = value?.replace(/[^0-9]/g, '') || '';
                    appBuilder.updateAppData('whatsappPhone', cleanValue);
                  }}
                  placeholder={t("whatsapp.phone_placeholder")}
                />
              </div>

              {/* Mensagem padrão */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp-message">{t("whatsapp.message")}</Label>
                <Textarea
                  id="whatsapp-message"
                  placeholder={t("whatsapp.message_placeholder")}
                  value={appBuilder.appData.whatsappMessage}
                  onChange={(e) => 
                    appBuilder.updateAppData('whatsappMessage', e.target.value)
                  }
                  rows={3}
                />
              </div>

              {/* Texto do botão */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp-text">{t("whatsapp.button_text")}</Label>
                <Input
                  id="whatsapp-text"
                  placeholder={t("whatsapp.button_text_placeholder")}
                  value={appBuilder.appData.whatsappButtonText}
                  onChange={(e) => 
                    appBuilder.updateAppData('whatsappButtonText', e.target.value)
                  }
                />
              </div>

              {/* Mostrar texto */}
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp-show-text">{t("whatsapp.show_text")}</Label>
                <Switch
                  id="whatsapp-show-text"
                  checked={appBuilder.appData.whatsappShowText}
                  onCheckedChange={(checked) => 
                    appBuilder.updateAppData('whatsappShowText', checked)
                  }
                />
              </div>

              {/* Tamanho do ícone */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp-icon-size">{t("whatsapp.icon_size")}</Label>
                <Select
                  value={appBuilder.appData.whatsappIconSize || "medium"}
                  onValueChange={(value) => 
                    appBuilder.updateAppData('whatsappIconSize', value)
                  }
                >
                  <SelectTrigger id="whatsapp-icon-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">{t("whatsapp.size_small")}</SelectItem>
                    <SelectItem value="medium">{t("whatsapp.size_medium")}</SelectItem>
                    <SelectItem value="large">{t("whatsapp.size_large")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cor do botão */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp-color">{t("whatsapp.button_color")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="whatsapp-color"
                    type="color"
                    value={appBuilder.appData.whatsappButtonColor}
                    onChange={(e) => 
                      appBuilder.updateAppData('whatsappButtonColor', e.target.value)
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={appBuilder.appData.whatsappButtonColor}
                    onChange={(e) => 
                      appBuilder.updateAppData('whatsappButtonColor', e.target.value)
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Posição */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp-position">{t("whatsapp.position")}</Label>
                <Select
                  value={appBuilder.appData.whatsappPosition}
                  onValueChange={(value: 'bottom-right' | 'bottom-left') =>
                    appBuilder.updateAppData('whatsappPosition', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">
                      {t("whatsapp.position_right")}
                    </SelectItem>
                    <SelectItem value="bottom-left">
                      {t("whatsapp.position_left")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
