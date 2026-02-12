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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useLanguage } from '@/hooks/useLanguage';
import { Save, Mail, Zap, RefreshCw, CheckCircle, AlertCircle, ShoppingCart, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { activeCampaignService } from '@/services/activeCampaignService';
import { brevoService, BrevoList, BrevoSender } from '@/services/brevoService';
import { supabase } from '@/integrations/supabase/client';

interface ActiveCampaignList {
  id: string;
  name: string;
}

interface ActiveCampaignTag {
  id: string;
  tag: string;
}

interface ActiveCampaignAutomation {
  id: string;
  name: string;
  type: 'automation' | 'tag' | 'campaign';
}

const IntegrationsPanel = () => {
  const { t } = useLanguage();
  const [activeCampaignData, setActiveCampaignData] = useState({
    apiUrl: '',
    apiKey: '',
    selectedListId: '',
    selectedTags: [] as string[]
  });

  const [acLists, setAcLists] = useState<ActiveCampaignList[]>([]);
  const [acTags, setAcTags] = useState<ActiveCampaignTag[]>([]);
  const [acAutomations, setAcAutomations] = useState<ActiveCampaignAutomation[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isLoadingAutomations, setIsLoadingAutomations] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Purchase Events Configuration
  const [purchaseEvents, setPurchaseEvents] = useState({
    purchase: '',
    refund: '',
    subscriptionCancel: ''
  });

  const [makeData, setMakeData] = useState({
    webhookUrl: ''
  });

  // Brevo State
  const [brevoData, setBrevoData] = useState({
    apiKey: '',
    selectedListId: '',
    selectedSenderId: ''
  });
  const [brevoLists, setBrevoLists] = useState<BrevoList[]>([]);
  const [brevoSenders, setBrevoSenders] = useState<BrevoSender[]>([]);
  const [brevoConnectionStatus, setBrevoConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [brevoConnectionError, setBrevoConnectionError] = useState<string | null>(null);
  const [isLoadingBrevoLists, setIsLoadingBrevoLists] = useState(false);
  const [isLoadingBrevoSenders, setIsLoadingBrevoSenders] = useState(false);
  const [brevoAccountInfo, setBrevoAccountInfo] = useState<{ email?: string; companyName?: string } | null>(null);
  const [brevoPurchaseEvents, setBrevoPurchaseEvents] = useState({
    purchase: '',
    refund: '',
    subscriptionCancel: '',
    newRegistration: '',
    // Listas por plano
    newRegistrationEssencial: '',
    newRegistrationProfissional: '',
    newRegistrationEmpresarial: '',
    newRegistrationConsultorio: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  // Collapsible states for integrations
  const [isActiveCampaignOpen, setIsActiveCampaignOpen] = useState(true);
  const [isMakeOpen, setIsMakeOpen] = useState(true);
  const [isBrevoOpen, setIsBrevoOpen] = useState(true);
  
  // Carregar configurações salvas do admin_settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('*')
          .in('key', ['activecampaign_config', 'make_config', 'brevo_config']);

        if (error) throw error;

        if (data) {
          // Carregar ActiveCampaign
          const acSetting = data.find(s => s.key === 'activecampaign_config');
          if (acSetting?.value) {
            try {
              const config = JSON.parse(acSetting.value);
              setActiveCampaignData({
                apiUrl: config.api_url || '',
                apiKey: config.api_key || '',
                selectedListId: config.list_id || '',
                selectedTags: config.tags || []
              });
              
              if (config.purchase_events) {
                setPurchaseEvents(config.purchase_events);
              }

              // Se tem credenciais, testar conexão
              if (config.api_url && config.api_key) {
                setConnectionStatus('idle');
              }
            } catch (e) {
              console.error('Erro ao fazer parse do ActiveCampaign config:', e);
            }
          }

          // Carregar Make
          const makeSetting = data.find(s => s.key === 'make_config');
          if (makeSetting?.value) {
            try {
              const config = JSON.parse(makeSetting.value);
              setMakeData({
                webhookUrl: config.webhook_url || ''
              });
            } catch (e) {
              console.error('Erro ao fazer parse do Make config:', e);
            }
          }

          // Carregar Brevo
          const brevoSetting = data.find(s => s.key === 'brevo_config');
          if (brevoSetting?.value) {
            try {
              const config = JSON.parse(brevoSetting.value);
              setBrevoData({
                apiKey: config.api_key || '',
                selectedListId: config.list_id || '',
                selectedSenderId: config.sender_id || ''
              });
              
              if (config.purchase_events) {
                setBrevoPurchaseEvents(config.purchase_events);
              }

              if (config.api_key) {
                setBrevoConnectionStatus('idle');
              }
            } catch (e) {
              console.error('Erro ao fazer parse do Brevo config:', e);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar as configurações salvas",
          variant: "destructive",
        });
      }
    };

    loadSettings();
  }, []);


  // Test ActiveCampaign connection and load data
  const testActiveCampaignConnection = async () => {
    if (!activeCampaignData.apiUrl || !activeCampaignData.apiKey) {
      toast({
        title: "Dados incompletos",
        description: "Preencha a URL da API e a chave da API primeiro",
        variant: "destructive",
      });
      return;
    }

    setConnectionStatus('testing');
    setConnectionError(null);
    setIsUsingDemoData(false);
    
    try {
      // First test the connection
      const testResult = await activeCampaignService.testConnection({
        apiUrl: activeCampaignData.apiUrl,
        apiKey: activeCampaignData.apiKey
      });
      
      if (testResult.error) {
        throw new Error(testResult.error || 'Connection test failed');
      }

      // If connection test passed, load real data
      await Promise.all([
        loadActiveCampaignLists(),
        loadActiveCampaignTags(),
        loadActiveCampaignAutomations()
      ]);
      
      setConnectionStatus('success');
      toast({
        title: "Conexão estabelecida ✅",
        description: isUsingDemoData 
          ? "Usando dados de demonstração (API indisponível)" 
          : "Dados reais carregados da sua conta ActiveCampaign",
      });
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError(error.message);
      toast({
        title: "Erro de conexão",
        description: error.message || "Verifique suas credenciais do ActiveCampaign",
        variant: "destructive",
      });
    }
  };

  const loadActiveCampaignLists = async () => {
    setIsLoadingLists(true);
    try {
      const lists = await activeCampaignService.getLists({
        apiUrl: activeCampaignData.apiUrl,
        apiKey: activeCampaignData.apiKey
      });
      
      setAcLists(lists);
      
      // Check if it's demo data (demo items have "demo" in their ID)
      const isDemoData = lists.some(list => list.id.includes('demo'));
      setIsUsingDemoData(isDemoData);
    } catch (error) {
      // Fallback to demo data with clear indication
      setAcLists([
        { id: 'demo-1', name: '📋 Newsletter Subscribers (DEMO)' },
        { id: 'demo-2', name: '⭐ VIP Customers (DEMO)' },
        { id: 'demo-3', name: '🔄 Trial Users (DEMO)' },
        { id: 'demo-4', name: '🎯 Prospects (DEMO)' }
      ]);
      setIsUsingDemoData(true);
      console.log('Using demo data for lists:', error.message);
    } finally {
      setIsLoadingLists(false);
    }
  };

  const loadActiveCampaignTags = async () => {
    setIsLoadingTags(true);
    try {
      const tags = await activeCampaignService.getTags({
        apiUrl: activeCampaignData.apiUrl,
        apiKey: activeCampaignData.apiKey
      });
      
      setAcTags(tags);
      
      // Check if it's demo data (demo items have "demo" in their ID)
      const isDemoData = tags.some(tag => tag.id.includes('demo'));
      setIsUsingDemoData(isDemoData);
    } catch (error) {
      // Fallback to demo data with clear indication
      setAcTags([
        { id: 'demo-1', tag: '👤 cliente (DEMO)' },
        { id: 'demo-2', tag: '🎯 prospect (DEMO)' },
        { id: 'demo-3', tag: '📧 lead (DEMO)' },
        { id: 'demo-4', tag: '⭐ vip (DEMO)' },
        { id: 'demo-5', tag: '🔄 trial (DEMO)' },
        { id: 'demo-6', tag: '📰 newsletter (DEMO)' }
      ]);
      setIsUsingDemoData(true);
      console.log('Using demo data for tags:', error.message);
    } finally {
      setIsLoadingTags(false);
    }
  };

  const loadActiveCampaignAutomations = async () => {
    setIsLoadingAutomations(true);
    try {
      const automations = await activeCampaignService.getAutomations({
        apiUrl: activeCampaignData.apiUrl,
        apiKey: activeCampaignData.apiKey
      });
      
      setAcAutomations(automations);
      
      // Check if it's demo data (demo items have "demo" in their ID)
      const isDemoData = automations.some(automation => automation.id.includes('demo'));
      setIsUsingDemoData(isDemoData);
    } catch (error) {
      // Fallback to demo data with clear indication
      setAcAutomations([
        { id: 'demo-auto-1', name: '🎉 Boas-vindas para novos clientes (DEMO)', type: 'automation' },
        { id: 'demo-auto-2', name: '📦 Sequência pós-compra (DEMO)', type: 'automation' },
        { id: 'demo-auto-3', name: '🔄 Reativação de clientes inativos (DEMO)', type: 'automation' },
        { id: 'demo-tag-1', name: '⭐ Cliente VIP (DEMO)', type: 'tag' },
        { id: 'demo-tag-2', name: '🔁 Comprador recorrente (DEMO)', type: 'tag' },
        { id: 'demo-camp-1', name: '📰 Newsletter mensal (DEMO)', type: 'campaign' },
        { id: 'demo-camp-2', name: '🎁 Ofertas especiais (DEMO)', type: 'campaign' }
      ]);
      setIsUsingDemoData(true);
      console.log('Using demo data for automations:', error.message);
    } finally {
      setIsLoadingAutomations(false);
    }
  };

  // Auto-load data when API credentials change
  useEffect(() => {
    if (activeCampaignData.apiUrl && activeCampaignData.apiKey && connectionStatus === 'idle') {
      const timeoutId = setTimeout(() => {
        testActiveCampaignConnection();
      }, 1000); // Debounce API calls

      return () => clearTimeout(timeoutId);
    }
  }, [activeCampaignData.apiUrl, activeCampaignData.apiKey]);

  const handleTagSelection = (tagId: string) => {
    setActiveCampaignData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }));
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getBrevoConnectionStatusIcon = () => {
    switch (brevoConnectionStatus) {
      case 'testing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Brevo Connection Test
  const testBrevoConnection = async () => {
    if (!brevoData.apiKey) {
      toast({
        title: "Dados incompletos",
        description: "Preencha a API Key do Brevo primeiro",
        variant: "destructive",
      });
      return;
    }

    setBrevoConnectionStatus('testing');
    setBrevoConnectionError(null);
    
    try {
      const testResult = await brevoService.testConnection({
        apiKey: brevoData.apiKey
      });
      
      if (testResult.error) {
        throw new Error(testResult.error || 'Connection test failed');
      }

      if (testResult.data) {
        setBrevoAccountInfo({
          email: testResult.data.email,
          companyName: testResult.data.companyName
        });
      }

      // Load lists and senders
      await Promise.all([
        loadBrevoLists(),
        loadBrevoSenders()
      ]);
      
      setBrevoConnectionStatus('success');
      toast({
        title: "Conexão estabelecida ✅",
        description: `Conectado à conta: ${testResult.data?.email || 'Brevo'}`,
      });
    } catch (error: any) {
      setBrevoConnectionStatus('error');
      setBrevoConnectionError(error.message);
      toast({
        title: "Erro de conexão",
        description: error.message || "Verifique sua API Key do Brevo",
        variant: "destructive",
      });
    }
  };

  const loadBrevoLists = async () => {
    setIsLoadingBrevoLists(true);
    try {
      const lists = await brevoService.getLists({
        apiKey: brevoData.apiKey
      });
      setBrevoLists(lists);
    } catch (error: any) {
      console.error('Error loading Brevo lists:', error);
      setBrevoLists([]);
    } finally {
      setIsLoadingBrevoLists(false);
    }
  };

  const loadBrevoSenders = async () => {
    setIsLoadingBrevoSenders(true);
    try {
      const senders = await brevoService.getSenders({
        apiKey: brevoData.apiKey
      });
      setBrevoSenders(senders.filter(s => s.active));
    } catch (error: any) {
      console.error('Error loading Brevo senders:', error);
      setBrevoSenders([]);
    } finally {
      setIsLoadingBrevoSenders(false);
    }
  };

  // Auto-load Brevo data when API key changes
  useEffect(() => {
    if (brevoData.apiKey && brevoConnectionStatus === 'idle') {
      const timeoutId = setTimeout(() => {
        testBrevoConnection();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [brevoData.apiKey]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Preparar config do ActiveCampaign
      const acConfig = {
        api_url: activeCampaignData.apiUrl,
        api_key: activeCampaignData.apiKey,
        list_id: activeCampaignData.selectedListId,
        tags: activeCampaignData.selectedTags,
        purchase_events: purchaseEvents
      };

      // Salvar ActiveCampaign no admin_settings
      const { error: acError } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'activecampaign_config',
          value: JSON.stringify(acConfig)
        }, {
          onConflict: 'key'
        });

      if (acError) throw acError;

      // Preparar config do Make
      const makeConfig = {
        webhook_url: makeData.webhookUrl
      };

      // Salvar Make no admin_settings
      const { error: makeError } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'make_config',
          value: JSON.stringify(makeConfig)
        }, {
          onConflict: 'key'
        });

      if (makeError) throw makeError;

      // Preparar config do Brevo
      const brevoConfig = {
        api_key: brevoData.apiKey,
        list_id: brevoData.selectedListId,
        sender_id: brevoData.selectedSenderId,
        purchase_events: brevoPurchaseEvents
      };

      // Salvar Brevo no admin_settings
      const { error: brevoError } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'brevo_config',
          value: JSON.stringify(brevoConfig)
        }, {
          onConflict: 'key'
        });

      if (brevoError) throw brevoError;

      toast({
        title: "Configurações salvas",
        description: "As integrações foram atualizadas com sucesso",
      });

    } catch (error) {
      console.error('Erro ao salvar integrações:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-app-surface border-app-border p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">{t('integrations.title')}</h2>
            <p className="text-sm text-app-muted">{t('integrations.subtitle')}</p>
          </div>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-neon w-full sm:w-auto"
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
          <Collapsible open={isActiveCampaignOpen} onOpenChange={setIsActiveCampaignOpen}>
            <Card className="bg-app-surface-hover border-app-border p-6">
              <CollapsibleTrigger asChild>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{t('integrations.activecampaign.title')}</h3>
                      <p className="text-sm text-app-muted">{t('integrations.activecampaign.subtitle')}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-2">
                      {isActiveCampaignOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="flex items-center space-x-2">
                      {getConnectionStatusIcon()}
                      {isUsingDemoData && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded text-xs font-medium">
                          <AlertCircle className="w-3 h-3" />
                          DEMO
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={(e) => { e.stopPropagation(); testActiveCampaignConnection(); }}
                      variant="outline"
                      size="sm"
                      disabled={connectionStatus === 'testing' || !activeCampaignData.apiUrl || !activeCampaignData.apiKey}
                      className="w-full sm:w-auto"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Testar Conexão
                    </Button>
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-6">
            {connectionError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">Erro de Conexão</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{connectionError}</p>
                  </div>
                </div>
              </div>
            )}

            {isUsingDemoData && connectionStatus === 'success' && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Dados de Demonstração</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      Não foi possível conectar com a API do ActiveCampaign. Os dados exibidos são fictícios para demonstração.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ac-api-url">{t('integrations.activecampaign.api_url')}</Label>
                  <Input
                    id="ac-api-url"
                    placeholder={t('integrations.activecampaign.api_url.placeholder')}
                    value={activeCampaignData.apiUrl}
                    onChange={(e) => {
                      setActiveCampaignData(prev => ({ ...prev, apiUrl: e.target.value }));
                      setConnectionStatus('idle');
                    }}
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
                    onChange={(e) => {
                      setActiveCampaignData(prev => ({ ...prev, apiKey: e.target.value }));
                      setConnectionStatus('idle');
                    }}
                    className="bg-app-surface border-app-border"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ac-lists">Lista</Label>
                  <Select 
                    value={activeCampaignData.selectedListId} 
                    onValueChange={(value) => setActiveCampaignData(prev => ({ ...prev, selectedListId: value }))}
                    disabled={isLoadingLists || acLists.length === 0}
                  >
                    <SelectTrigger className="bg-app-surface border-app-border">
                      <SelectValue placeholder={
                        isLoadingLists 
                          ? "Carregando listas..." 
                          : acLists.length === 0 
                            ? "Configure a API primeiro" 
                            : "Selecione uma lista"
                      } />
                    </SelectTrigger>
                    <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                      {acLists.map((list) => (
                        <SelectItem 
                          key={list.id} 
                          value={list.id}
                          className="hover:bg-app-surface-hover"
                        >
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isLoadingLists && (
                    <p className="text-xs text-app-muted mt-1 flex items-center">
                      <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                      Carregando listas...
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ac-tags">Tags</Label>
                  <div className="space-y-2">
                    <div className="max-h-32 overflow-y-auto border border-app-border rounded-md bg-app-surface p-2">
                      {isLoadingTags ? (
                        <div className="flex items-center justify-center py-4">
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                          <span className="text-sm text-app-muted">Carregando tags...</span>
                        </div>
                      ) : acTags.length === 0 ? (
                        <p className="text-sm text-app-muted text-center py-4">
                          Configure a API primeiro
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {acTags.map((tag) => (
                            <label
                              key={tag.id}
                              className="flex items-center space-x-2 p-1 hover:bg-app-surface-hover rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={activeCampaignData.selectedTags.includes(tag.id)}
                                onChange={() => handleTagSelection(tag.id)}
                                className="rounded border-app-border"
                              />
                              <span className="text-sm text-foreground">{tag.tag}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {activeCampaignData.selectedTags.length > 0 && (
                      <p className="text-xs text-app-muted">
                        {activeCampaignData.selectedTags.length} tag(s) selecionada(s)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Events Section */}
            {connectionStatus === 'success' && (
              <Card className="bg-app-surface border-app-border p-6 mt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Automação de Eventos de Compra</h4>
                    <p className="text-sm text-app-muted">
                      Conecte suas vendas com o ActiveCampaign. Configure quais eventos serão enviados automaticamente para sua conta ActiveCampaign.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Purchase Event */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 border border-app-border rounded-lg bg-app-surface-hover">
                    <div>
                      <h5 className="font-medium text-foreground">Compra Efetuada</h5>
                      <p className="text-sm text-app-muted">Disparado quando uma compra é realizada</p>
                    </div>
                    <div>
                      <Select 
                        value={purchaseEvents.purchase} 
                        onValueChange={(value) => setPurchaseEvents(prev => ({ ...prev, purchase: value }))}
                        disabled={isLoadingAutomations}
                      >
                        <SelectTrigger className="bg-app-surface border-app-border">
                          <SelectValue placeholder={
                            isLoadingAutomations 
                              ? "Carregando automações..." 
                              : "Selecione uma automação"
                          } />
                        </SelectTrigger>
                        <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                          {acAutomations.map((automation) => (
                            <SelectItem 
                              key={automation.id} 
                              value={automation.id}
                              className="hover:bg-app-surface-hover"
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  automation.type === 'automation' ? 'bg-blue-100 text-blue-800' :
                                  automation.type === 'tag' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {automation.type}
                                </span>
                                <span>{automation.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Refund Event */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 border border-app-border rounded-lg bg-app-surface-hover">
                    <div>
                      <h5 className="font-medium text-foreground">Reembolso</h5>
                      <p className="text-sm text-app-muted">Disparado quando um reembolso é processado</p>
                    </div>
                    <div>
                      <Select 
                        value={purchaseEvents.refund} 
                        onValueChange={(value) => setPurchaseEvents(prev => ({ ...prev, refund: value }))}
                        disabled={isLoadingAutomations}
                      >
                        <SelectTrigger className="bg-app-surface border-app-border">
                          <SelectValue placeholder={
                            isLoadingAutomations 
                              ? "Carregando automações..." 
                              : "Selecione uma automação"
                          } />
                        </SelectTrigger>
                        <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                          {acAutomations.map((automation) => (
                            <SelectItem 
                              key={automation.id} 
                              value={automation.id}
                              className="hover:bg-app-surface-hover"
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  automation.type === 'automation' ? 'bg-blue-100 text-blue-800' :
                                  automation.type === 'tag' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {automation.type}
                                </span>
                                <span>{automation.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Subscription Cancel Event */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 border border-app-border rounded-lg bg-app-surface-hover">
                    <div>
                      <h5 className="font-medium text-foreground">Cancelamento de Assinatura</h5>
                      <p className="text-sm text-app-muted">Disparado quando uma assinatura é cancelada</p>
                    </div>
                    <div>
                      <Select 
                        value={purchaseEvents.subscriptionCancel} 
                        onValueChange={(value) => setPurchaseEvents(prev => ({ ...prev, subscriptionCancel: value }))}
                        disabled={isLoadingAutomations}
                      >
                        <SelectTrigger className="bg-app-surface border-app-border">
                          <SelectValue placeholder={
                            isLoadingAutomations 
                              ? "Carregando automações..." 
                              : "Selecione uma automação"
                          } />
                        </SelectTrigger>
                        <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                          {acAutomations.map((automation) => (
                            <SelectItem 
                              key={automation.id} 
                              value={automation.id}
                              className="hover:bg-app-surface-hover"
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  automation.type === 'automation' ? 'bg-blue-100 text-blue-800' :
                                  automation.type === 'tag' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {automation.type}
                                </span>
                                <span>{automation.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Save Purchase Events Button */}
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={() => {
                        // Mock save for purchase events
                        toast({
                          title: "Eventos de compra salvos",
                          description: "Configurações de automação atualizadas com sucesso",
                        });
                        // Here you would save to localStorage or send to backend
                        localStorage.setItem('activecampaign_purchase_events', JSON.stringify(purchaseEvents));
                      }}
                      variant="outline"
                      className="border-app-border hover:bg-app-surface-hover"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </Button>
                  </div>
                </div>
              </Card>
            )}
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Make */}
          <Collapsible open={isMakeOpen} onOpenChange={setIsMakeOpen}>
            <Card className="bg-app-surface-hover border-app-border p-6">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{t('integrations.make.title')}</h3>
                      <p className="text-sm text-app-muted">{t('integrations.make.subtitle')}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    {isMakeOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-6">
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
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Brevo */}
          <Collapsible open={isBrevoOpen} onOpenChange={setIsBrevoOpen}>
            <Card className="bg-app-surface-hover border-app-border p-6">
              <CollapsibleTrigger asChild>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Brevo</h3>
                      <p className="text-sm text-app-muted">E-mail Marketing, SMS, CRM e Automação</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-2">
                      {isBrevoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="flex items-center space-x-2">
                      {getBrevoConnectionStatusIcon()}
                      {brevoAccountInfo && brevoConnectionStatus === 'success' && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          {brevoAccountInfo.email}
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={(e) => { e.stopPropagation(); testBrevoConnection(); }}
                      variant="outline"
                      size="sm"
                      disabled={brevoConnectionStatus === 'testing' || !brevoData.apiKey}
                      className="w-full sm:w-auto"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Testar Conexão
                    </Button>
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-6">
            {brevoConnectionError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">Erro de Conexão</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{brevoConnectionError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="brevo-api-key">API Key</Label>
                <Input
                  id="brevo-api-key"
                  type="password"
                  placeholder="xkeysib-..."
                  value={brevoData.apiKey}
                  onChange={(e) => {
                    setBrevoData(prev => ({ ...prev, apiKey: e.target.value }));
                    setBrevoConnectionStatus('idle');
                  }}
                  className="bg-app-surface border-app-border"
                />
                <p className="text-xs text-app-muted mt-1">
                  Obtenha sua API Key em: <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Brevo → Configurações → Chaves de API</a>
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brevo-lists">Lista Padrão</Label>
                  <Select 
                    value={brevoData.selectedListId} 
                    onValueChange={(value) => setBrevoData(prev => ({ ...prev, selectedListId: value }))}
                    disabled={isLoadingBrevoLists || brevoLists.length === 0}
                  >
                    <SelectTrigger className="bg-app-surface border-app-border">
                      <SelectValue placeholder={
                        isLoadingBrevoLists 
                          ? "Carregando listas..." 
                          : brevoLists.length === 0 
                            ? "Conecte a API primeiro" 
                            : "Selecione uma lista"
                      } />
                    </SelectTrigger>
                    <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                      {brevoLists.map((list) => (
                        <SelectItem 
                          key={list.id} 
                          value={String(list.id)}
                          className="hover:bg-app-surface-hover"
                        >
                          {list.name} {list.totalSubscribers !== undefined && `(${list.totalSubscribers})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isLoadingBrevoLists && (
                    <p className="text-xs text-app-muted mt-1 flex items-center">
                      <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                      Carregando listas...
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="brevo-senders">Remetente Padrão</Label>
                  <Select 
                    value={brevoData.selectedSenderId} 
                    onValueChange={(value) => setBrevoData(prev => ({ ...prev, selectedSenderId: value }))}
                    disabled={isLoadingBrevoSenders || brevoSenders.length === 0}
                  >
                    <SelectTrigger className="bg-app-surface border-app-border">
                      <SelectValue placeholder={
                        isLoadingBrevoSenders 
                          ? "Carregando remetentes..." 
                          : brevoSenders.length === 0 
                            ? "Conecte a API primeiro" 
                            : "Selecione um remetente"
                      } />
                    </SelectTrigger>
                    <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                      {brevoSenders.map((sender) => (
                        <SelectItem 
                          key={sender.id} 
                          value={String(sender.id)}
                          className="hover:bg-app-surface-hover"
                        >
                          {sender.name} ({sender.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isLoadingBrevoSenders && (
                    <p className="text-xs text-app-muted mt-1 flex items-center">
                      <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                      Carregando remetentes...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Brevo Purchase Events Section */}
            {brevoConnectionStatus === 'success' && (
              <Card className="bg-app-surface border-app-border p-6 mt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Automação de Eventos de Compra</h4>
                    <p className="text-sm text-app-muted">
                      Adicione contatos automaticamente às listas do Brevo quando eventos ocorrerem.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Purchase Event */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 border border-app-border rounded-lg bg-app-surface-hover">
                    <div>
                      <h5 className="font-medium text-foreground">Compra Efetuada</h5>
                      <p className="text-sm text-app-muted">Adicionar à lista quando uma compra é realizada</p>
                    </div>
                    <div>
                      <Select 
                        value={brevoPurchaseEvents.purchase} 
                        onValueChange={(value) => setBrevoPurchaseEvents(prev => ({ ...prev, purchase: value }))}
                        disabled={isLoadingBrevoLists}
                      >
                        <SelectTrigger className="bg-app-surface border-app-border">
                          <SelectValue placeholder="Selecione uma lista" />
                        </SelectTrigger>
                        <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                          <SelectItem value="none">Nenhuma</SelectItem>
                          {brevoLists.map((list) => (
                            <SelectItem 
                              key={list.id} 
                              value={String(list.id)}
                              className="hover:bg-app-surface-hover"
                            >
                              {list.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Refund Event */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 border border-app-border rounded-lg bg-app-surface-hover">
                    <div>
                      <h5 className="font-medium text-foreground">Reembolso</h5>
                      <p className="text-sm text-app-muted">Adicionar à lista quando um reembolso é processado</p>
                    </div>
                    <div>
                      <Select 
                        value={brevoPurchaseEvents.refund} 
                        onValueChange={(value) => setBrevoPurchaseEvents(prev => ({ ...prev, refund: value }))}
                        disabled={isLoadingBrevoLists}
                      >
                        <SelectTrigger className="bg-app-surface border-app-border">
                          <SelectValue placeholder="Selecione uma lista" />
                        </SelectTrigger>
                        <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                          <SelectItem value="none">Nenhuma</SelectItem>
                          {brevoLists.map((list) => (
                            <SelectItem 
                              key={list.id} 
                              value={String(list.id)}
                              className="hover:bg-app-surface-hover"
                            >
                              {list.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Subscription Cancel Event */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 border border-app-border rounded-lg bg-app-surface-hover">
                    <div>
                      <h5 className="font-medium text-foreground">Cancelamento de Assinatura</h5>
                      <p className="text-sm text-app-muted">Adicionar à lista quando uma assinatura é cancelada</p>
                    </div>
                    <div>
                      <Select 
                        value={brevoPurchaseEvents.subscriptionCancel} 
                        onValueChange={(value) => setBrevoPurchaseEvents(prev => ({ ...prev, subscriptionCancel: value }))}
                        disabled={isLoadingBrevoLists}
                      >
                        <SelectTrigger className="bg-app-surface border-app-border">
                          <SelectValue placeholder="Selecione uma lista" />
                        </SelectTrigger>
                        <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                          <SelectItem value="none">Nenhuma</SelectItem>
                          {brevoLists.map((list) => (
                            <SelectItem 
                              key={list.id} 
                              value={String(list.id)}
                              className="hover:bg-app-surface-hover"
                            >
                              {list.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* New Registration Event */}
                  <div className="p-4 border border-app-border rounded-lg bg-app-surface-hover space-y-4">
                    <div>
                      <h5 className="font-medium text-foreground">Novo Cadastro</h5>
                      <p className="text-sm text-app-muted">Adicionar à lista quando um novo usuário se cadastra na plataforma (/planos)</p>
                    </div>
                    
                    {/* Lista padrão (fallback) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div className="text-sm text-app-muted">Lista Padrão (fallback)</div>
                      <Select 
                        value={brevoPurchaseEvents.newRegistration} 
                        onValueChange={(value) => setBrevoPurchaseEvents(prev => ({ ...prev, newRegistration: value }))}
                        disabled={isLoadingBrevoLists}
                      >
                        <SelectTrigger className="bg-app-surface border-app-border">
                          <SelectValue placeholder="Selecione uma lista" />
                        </SelectTrigger>
                        <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                          <SelectItem value="none">Nenhuma</SelectItem>
                          {brevoLists.map((list) => (
                            <SelectItem 
                              key={list.id} 
                              value={String(list.id)}
                              className="hover:bg-app-surface-hover"
                            >
                              {list.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Listas por plano */}
                    <div className="border-t border-app-border pt-4 space-y-3">
                      <p className="text-xs text-app-muted font-medium">Listas por Plano (opcional - se vazio, usa a lista padrão)</p>
                      
                      {/* Essencial */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="text-sm text-foreground flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Plano Essencial
                        </div>
                        <Select 
                          value={brevoPurchaseEvents.newRegistrationEssencial || ''} 
                          onValueChange={(value) => setBrevoPurchaseEvents(prev => ({ ...prev, newRegistrationEssencial: value }))}
                          disabled={isLoadingBrevoLists}
                        >
                          <SelectTrigger className="bg-app-surface border-app-border">
                            <SelectValue placeholder="Usar lista padrão" />
                          </SelectTrigger>
                          <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                            <SelectItem value="none">Usar lista padrão</SelectItem>
                            {brevoLists.map((list) => (
                              <SelectItem 
                                key={list.id} 
                                value={String(list.id)}
                                className="hover:bg-app-surface-hover"
                              >
                                {list.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Profissional */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="text-sm text-foreground flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Plano Profissional
                        </div>
                        <Select 
                          value={brevoPurchaseEvents.newRegistrationProfissional || ''} 
                          onValueChange={(value) => setBrevoPurchaseEvents(prev => ({ ...prev, newRegistrationProfissional: value }))}
                          disabled={isLoadingBrevoLists}
                        >
                          <SelectTrigger className="bg-app-surface border-app-border">
                            <SelectValue placeholder="Usar lista padrão" />
                          </SelectTrigger>
                          <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                            <SelectItem value="none">Usar lista padrão</SelectItem>
                            {brevoLists.map((list) => (
                              <SelectItem 
                                key={list.id} 
                                value={String(list.id)}
                                className="hover:bg-app-surface-hover"
                              >
                                {list.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Empresarial */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="text-sm text-foreground flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          Plano Empresarial
                        </div>
                        <Select 
                          value={brevoPurchaseEvents.newRegistrationEmpresarial || ''} 
                          onValueChange={(value) => setBrevoPurchaseEvents(prev => ({ ...prev, newRegistrationEmpresarial: value }))}
                          disabled={isLoadingBrevoLists}
                        >
                          <SelectTrigger className="bg-app-surface border-app-border">
                            <SelectValue placeholder="Usar lista padrão" />
                          </SelectTrigger>
                          <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                            <SelectItem value="none">Usar lista padrão</SelectItem>
                            {brevoLists.map((list) => (
                              <SelectItem 
                                key={list.id} 
                                value={String(list.id)}
                                className="hover:bg-app-surface-hover"
                              >
                                {list.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Consultório */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="text-sm text-foreground flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          Plano Consultório
                        </div>
                        <Select 
                          value={brevoPurchaseEvents.newRegistrationConsultorio || ''} 
                          onValueChange={(value) => setBrevoPurchaseEvents(prev => ({ ...prev, newRegistrationConsultorio: value }))}
                          disabled={isLoadingBrevoLists}
                        >
                          <SelectTrigger className="bg-app-surface border-app-border">
                            <SelectValue placeholder="Usar lista padrão" />
                          </SelectTrigger>
                          <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                            <SelectItem value="none">Usar lista padrão</SelectItem>
                            {brevoLists.map((list) => (
                              <SelectItem 
                                key={list.id} 
                                value={String(list.id)}
                                className="hover:bg-app-surface-hover"
                              >
                                {list.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </Card>
    </div>
  );
};

export default IntegrationsPanel;
