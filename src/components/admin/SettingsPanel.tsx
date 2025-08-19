import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { Save, Globe, FileText, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminSettings {
  default_language: string;
  terms_of_use: string;
  cancellation_message: string;
}

const SettingsPanel = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<AdminSettings>({
    default_language: 'pt',
    terms_of_use: '',
    cancellation_message: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value');

      if (error) throw error;

      const settingsData: AdminSettings = {
        default_language: 'pt',
        terms_of_use: '',
        cancellation_message: ''
      };

      data?.forEach(setting => {
        if (setting.key in settingsData) {
          (settingsData as any)[setting.key] = setting.value || '';
        }
      });

      setSettings(settingsData);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value.toString()
      }));

      const { error } = await supabase
        .from('admin_settings')
        .upsert(updates, { 
          onConflict: 'key',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Todas as configurações foram atualizadas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof AdminSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <Card className="bg-app-surface border-app-border p-6">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-app-surface border-app-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('admin.settings.title')}</h2>
            <p className="text-app-muted">{t('admin.settings.subtitle')}</p>
          </div>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-neon"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {t('admin.settings.save')}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Idioma Padrão */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-primary" />
              <Label htmlFor="language">{t('admin.settings.language')}</Label>
            </div>
            <Select 
              value={settings.default_language} 
              onValueChange={(value) => updateSetting('default_language', value)}
            >
              <SelectTrigger className="bg-app-surface-hover border-app-border">
                <SelectValue placeholder={t('admin.settings.language.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">Português (BR)</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Termos de Uso */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-primary" />
              <Label htmlFor="terms">{t('admin.settings.terms')}</Label>
            </div>
            <Textarea
              id="terms"
              placeholder={t('admin.settings.terms.placeholder')}
              value={settings.terms_of_use}
              onChange={(e) => updateSetting('terms_of_use', e.target.value)}
              className="min-h-[120px] bg-app-surface-hover border-app-border"
            />
          </div>

          {/* Mensagem de Cancelamento */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <Label htmlFor="cancellation">{t('admin.settings.cancellation')}</Label>
            </div>
            <Textarea
              id="cancellation"
              placeholder={t('admin.settings.cancellation.placeholder')}
              value={settings.cancellation_message}
              onChange={(e) => updateSetting('cancellation_message', e.target.value)}
              className="min-h-[80px] bg-app-surface-hover border-app-border"
            />
            <p className="text-xs text-app-muted">
              {t('admin.settings.cancellation.help')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPanel;