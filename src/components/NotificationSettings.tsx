import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Gift, Star, Sparkles, Zap, Trophy, Heart, Award, Upload } from "lucide-react";
import { useAppBuilder } from "@/hooks/useAppBuilder";
import { useFeatureAccess, getRequiredPlan } from "@/hooks/useFeatureAccess";
import PremiumOverlay from "@/components/ui/premium-overlay";
import { useLanguage } from "@/hooks/useLanguage";

interface NotificationSettingsProps {
  appBuilder: ReturnType<typeof useAppBuilder>;
}

const NotificationSettings = ({ appBuilder }: NotificationSettingsProps) => {
  const { t } = useLanguage();
  const { hasAppNotifications } = useFeatureAccess();
  const appData = appBuilder?.appData || {
    notificationEnabled: false,
    notificationTitle: '',
    notificationMessage: '',
    notificationImage: undefined,
    notificationLink: '',
    notificationButtonText: '',
    notificationButtonColor: '#FF0000',
    notificationIcon: 'gift'
  };
  const updateAppData = appBuilder?.updateAppData || (() => {});
  const handleFileUpload = appBuilder?.handleFileUpload || (() => Promise.resolve());

  return (
    <PremiumOverlay
      isBlocked={!hasAppNotifications}
      title={t("notifications.title")}
      description={t("notifications.description")}
      requiredPlan={getRequiredPlan('hasAppNotifications')}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
          <Label htmlFor="notification-enabled" className="flex items-center space-x-2 text-foreground cursor-pointer">
            <Bell className="w-4 h-4" />
            <span>{t("notifications.enable")}</span>
          </Label>
          <Switch
            id="notification-enabled"
            checked={appData.notificationEnabled}
            onCheckedChange={(checked) => updateAppData('notificationEnabled', checked)}
            disabled={!hasAppNotifications}
          />
        </div>
        
        {appData.notificationEnabled && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notification-title" className="text-sm text-foreground">
                {t("notifications.notification_title")}
              </Label>
              <Input
                id="notification-title"
                value={appData.notificationTitle}
                onChange={(e) => updateAppData('notificationTitle', e.target.value)}
                placeholder={t("notifications.title_placeholder")}
                className="bg-background border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-message" className="text-sm text-foreground">
                {t("notifications.message")}
              </Label>
              <Textarea
                id="notification-message"
                value={appData.notificationMessage}
                onChange={(e) => updateAppData('notificationMessage', e.target.value)}
                placeholder={t("notifications.message_placeholder")}
                className="bg-background border-border focus:border-primary"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-foreground">
                {t("notifications.image")}
              </Label>
              <div className="relative cursor-pointer hover:bg-muted/50 rounded-xl transition-colors border-2 border-dashed border-border">
                <div className="flex flex-col items-center space-y-2 p-4">
                  <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {appData.notificationImage?.url ? (
                      <img 
                        src={appData.notificationImage.url} 
                        alt="Notification" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">{t("notifications.upload_click")}</p>
                      </div>
                    )}
                  </div>
                  {appData.notificationImage?.url && (
                    <p className="text-xs text-green-500">{t("notifications.image_loaded")}</p>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('notificationImage', file, 'notification-image');
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("notifications.image_help")}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notification-link" className="text-sm text-foreground">
                {t("notifications.link")}
              </Label>
              <Input
                id="notification-link"
                value={appData.notificationLink}
                onChange={(e) => updateAppData('notificationLink', e.target.value)}
                placeholder="https://seusite.com/oferta"
                className="bg-background border-border focus:border-primary"
              />
            </div>
            
            {appData.notificationLink && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="notification-button-text" className="text-sm text-foreground">
                    {t("notifications.button_text")}
                  </Label>
                  <Input
                    id="notification-button-text"
                    value={appData.notificationButtonText}
                    onChange={(e) => updateAppData('notificationButtonText', e.target.value)}
                    placeholder={t("notifications.button_text_placeholder")}
                    className="bg-background border-border focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notification-button-color" className="text-sm text-foreground">
                    {t("notifications.button_color")}
                  </Label>
                  <div className="flex space-x-3">
                    <Input
                      id="notification-button-color"
                      type="color"
                      value={appData.notificationButtonColor}
                      onChange={(e) => updateAppData('notificationButtonColor', e.target.value)}
                      className="w-16 h-10 bg-muted border-border cursor-pointer"
                    />
                    <Input
                      value={appData.notificationButtonColor}
                      onChange={(e) => updateAppData('notificationButtonColor', e.target.value)}
                      placeholder="#ff0000"
                      className="flex-1 bg-background border-border focus:border-primary"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="notification-icon" className="text-sm text-foreground">
                {t("notifications.icon")}
              </Label>
              <Select
                value={appData.notificationIcon}
                onValueChange={(value) => updateAppData('notificationIcon', value)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder={t("notifications.choose_icon")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gift">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      <span>{t("notifications.icon.gift")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bell">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      <span>{t("notifications.icon.bell")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="star">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <span>{t("notifications.icon.star")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="sparkles">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>{t("notifications.icon.sparkles")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="zap">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span>{t("notifications.icon.zap")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="trophy">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      <span>{t("notifications.icon.trophy")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="heart">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span>{t("notifications.icon.heart")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="award">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>{t("notifications.icon.award")}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <p className="text-xs text-muted-foreground">
              {t("notifications.click_help")}
            </p>
          </div>
        )}
      </div>
    </PremiumOverlay>
  );
};

export default NotificationSettings;
