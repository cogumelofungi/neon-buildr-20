import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/useLanguage';
import { Save, Mail, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const IntegrationsPanel = () => {
  const { t } = useLanguage();
  const [activeCampaignData, setActiveCampaignData] = useState({
    apiUrl: '',
    apiKey: '',
    lists: '',
    tags: ''
  });

  const [makeData, setMakeData] = useState({
    webhookUrl: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulando salvamento - aqui futuramente será implementada a lógica real
    setTimeout(() => {
      toast({
        title: t('toast.save.success.title'),
        description: t('toast.save.success.description'),
      });
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-app-surface border-app-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('integrations.title')}</h2>
            <p className="text-app-muted">{t('integrations.subtitle')}</p>
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
            {isSaving ? t('integrations.saving') : t('integrations.save')}
          </Button>
        </div>

        <div className="space-y-8">
          {/* ActiveCampaign */}
          <Card className="bg-app-surface-hover border-app-border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('integrations.activecampaign.title')}</h3>
                <p className="text-sm text-app-muted">{t('integrations.activecampaign.subtitle')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ac-api-url">{t('integrations.activecampaign.api_url')}</Label>
                  <Input
                    id="ac-api-url"
                    placeholder={t('integrations.activecampaign.api_url.placeholder')}
                    value={activeCampaignData.apiUrl}
                    onChange={(e) => setActiveCampaignData(prev => ({ ...prev, apiUrl: e.target.value }))}
                    className="bg-app-surface border-app-border"
                  />
                </div>
                <div>
                  <Label htmlFor="ac-api-key">{t('integrations.activecampaign.api_key')}</Label>
                  <Input
                    id="ac-api-key"
                    type="password"
                    placeholder={t('integrations.activecampaign.api_key.placeholder')}
                    value={activeCampaignData.apiKey}
                    onChange={(e) => setActiveCampaignData(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="bg-app-surface border-app-border"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ac-lists">Listas</Label>
                  <Textarea
                    id="ac-lists"
                    placeholder="Digite os IDs das listas separados por vírgula (ex: 1,2,3)"
                    value={activeCampaignData.lists}
                    onChange={(e) => setActiveCampaignData(prev => ({ ...prev, lists: e.target.value }))}
                    className="bg-app-surface border-app-border min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="ac-tags">Tags</Label>
                  <Textarea
                    id="ac-tags"
                    placeholder="Digite as tags separadas por vírgula (ex: cliente,prospects,leads)"
                    value={activeCampaignData.tags}
                    onChange={(e) => setActiveCampaignData(prev => ({ ...prev, tags: e.target.value }))}
                    className="bg-app-surface border-app-border min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Make */}
          <Card className="bg-app-surface-hover border-app-border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('integrations.make.title')}</h3>
                <p className="text-sm text-app-muted">{t('integrations.make.subtitle')}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="make-webhook">{t('integrations.make.webhook_url')}</Label>
              <Input
                id="make-webhook"
                placeholder={t('integrations.make.webhook_url.placeholder')}
                value={makeData.webhookUrl}
                onChange={(e) => setMakeData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                className="bg-app-surface border-app-border"
              />
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default IntegrationsPanel;