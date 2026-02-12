import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  Save, 
  Globe, 
  FileText, 
  AlertTriangle, 
  Shield, 
  Clock, 
  Trash2, 
  Settings, 
  Users,
  MessageSquare,
  Server,
  Scale,
  FileType,
  Key,
  Palette
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AdminRoleManager from './AdminRoleManager';

interface AdminSettings {
  // Configurações Gerais
  default_language: string;
  platform_name: string;
  platform_description: string;
  maintenance_mode: string;
  
  // Configurações de Suporte
  support_whatsapp_link: string;
  support_title: string;
  support_description: string;
  support_button_text: string;
  support_email: string;
  
  // Configurações Legais
  terms_of_use: string;
  privacy_policy: string;
  cancellation_message: string;
  
  // Configurações de Manutenção
  auto_cleanup_enabled: string;
  auto_cleanup_days: string;
  cleanup_notification_enabled: string;
  cleanup_notification_days: string;
  
  // Configurações de PDF
  pdf_viewer: string;
  adobe_client_id: string;
  pdf_close_button_color: string;
  pdf_controls_color: string;
  pdf_header_bg_color: string;
  pdf_controls_bar_color: string;
}

const SettingsPanel = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<AdminSettings>({
    // Configurações Gerais
    default_language: 'pt',
    platform_name: 'MigraBook',
    platform_description: 'Converta seu ebook para app em minutos',
    maintenance_mode: 'false',
    
    // Configurações de Suporte
    support_whatsapp_link: '',
    support_title: '',
    support_description: '',
    support_button_text: '',
    support_email: '',
    
    // Configurações Legais
    terms_of_use: '',
    privacy_policy: '',
    cancellation_message: '',
    
    // Configurações de Manutenção
    auto_cleanup_enabled: 'true',
    auto_cleanup_days: '30',
    cleanup_notification_enabled: 'true',
    cleanup_notification_days: '7',
    
    // Configurações de PDF
    pdf_viewer: 'google-docs',
    adobe_client_id: '',
    pdf_close_button_color: '#ffffff',
    pdf_controls_color: '#ffffff',
    pdf_header_bg_color: '#000000',
    pdf_controls_bar_color: '#000000'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [scheduledDeletions, setScheduledDeletions] = useState<any[]>([]);
  const [loadingDeletions, setLoadingDeletions] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'maintenance') {
      fetchScheduledDeletions();
    }
  }, [activeTab, settings.auto_cleanup_enabled, settings.auto_cleanup_days]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      console.log('⚙️ Iniciando busca de configurações...');
      
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value');

      if (error) {
        console.error('❌ Erro ao buscar configurações:', error);
        throw error;
      }

      console.log('✅ Configurações encontradas:', data?.length || 0);

      const settingsData: AdminSettings = {
        // Configurações Gerais
        default_language: 'pt',
        platform_name: 'MigraBook',
        platform_description: 'Converta seu ebook para app em minutos',
        maintenance_mode: 'false',
        
        // Configurações de Suporte
        support_whatsapp_link: '',
        support_title: '',
        support_description: '',
        support_button_text: '',
        support_email: '',
        
        // Configurações Legais
        terms_of_use: '',
        privacy_policy: '',
        cancellation_message: '',
        
        // Configurações de Manutenção
        auto_cleanup_enabled: 'true',
        auto_cleanup_days: '30',
        cleanup_notification_enabled: 'true',
        cleanup_notification_days: '7',
        
        // Configurações de PDF
        pdf_viewer: 'google-docs',
        adobe_client_id: '',
        pdf_close_button_color: '#ffffff',
        pdf_controls_color: '#ffffff',
        pdf_header_bg_color: '#000000',
        pdf_controls_bar_color: '#000000'
      };

      data?.forEach(setting => {
        if (setting.key in settingsData) {
          // Only overwrite defaults if there's a non-empty value
          if (setting.value && setting.value.trim() !== '') {
            (settingsData as any)[setting.key] = setting.value;
          }
        }
      });

      console.log('✅ Configurações processadas:', settingsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: `Erro ao carregar configurações: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const updates = Object.entries(settings).map(([key, value]) => {
        let finalValue = value.toString().trim();
        
        // Use defaults for empty critical fields
        if (finalValue === '') {
          if (key === 'platform_name') finalValue = 'MigraBook';
          if (key === 'platform_description') finalValue = 'Converta seu ebook para app em minutos';
        }
        
        return { key, value: finalValue };
      });

      const { error } = await supabase
        .from('admin_settings')
        .upsert(updates, { 
          onConflict: 'key',
          ignoreDuplicates: false 
        });

      if (error) {
        throw error;
      }

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

  const fetchScheduledDeletions = async () => {
    if (settings.auto_cleanup_enabled !== 'true') {
      setScheduledDeletions([]);
      return;
    }

    try {
      setLoadingDeletions(true);
      const cleanupDays = parseInt(settings.auto_cleanup_days) || 30;
      
      // Buscar TODOS os usuários inativos (não apenas os que já passaram do prazo)
      const { data: inactiveUsers, error: usersError } = await supabase
        .from('user_status')
        .select('user_id, updated_at')
        .eq('is_active', false);

      if (usersError) throw usersError;

      if (!inactiveUsers || inactiveUsers.length === 0) {
        setScheduledDeletions([]);
        return;
      }

      const inactiveUserIds = inactiveUsers.map(u => u.user_id);

      // Buscar apps desses usuários
      const { data: apps, error: appsError } = await supabase
        .from('apps')
        .select('id, nome, slug, created_at, updated_at, user_id')
        .in('user_id', inactiveUserIds);

      if (appsError) throw appsError;

      // Buscar dados dos usuários (profiles)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', inactiveUserIds);

      if (profilesError) throw profilesError;

      // Calcular tempo restante para cada app
      const now = new Date();
      const appsWithDeletion = apps?.map(app => {
        const userInfo = inactiveUsers.find(u => u.user_id === app.user_id);
        const userProfile = profiles?.find(p => p.id === app.user_id);
        
        if (!userInfo || !userProfile) return null;

        const userInactiveDate = new Date(userInfo.updated_at);
        const deletionDate = new Date(userInactiveDate);
        deletionDate.setDate(deletionDate.getDate() + cleanupDays);
        
        // Só incluir se a data de exclusão for futura
        if (deletionDate <= now) return null;
        
        const timeRemaining = deletionDate.getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));
        
        return {
          ...app,
          deletionDate,
          daysRemaining,
          userEmail: userProfile.email || 'Email não encontrado',
          userName: userProfile.full_name || userProfile.email || 'Nome não encontrado',
          inactiveDate: userInactiveDate
        };
      }).filter(Boolean) || [];

      // Ordenar por tempo restante (menor primeiro)
      appsWithDeletion.sort((a, b) => a.daysRemaining - b.daysRemaining);
      
      setScheduledDeletions(appsWithDeletion);
    } catch (error) {
      console.error('Erro ao buscar apps agendados para exclusão:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de manutenção",
        variant: "destructive",
      });
    } finally {
      setLoadingDeletions(false);
    }
  };

  const formatTimeRemaining = (days: number) => {
    if (days === 0) return 'Hoje';
    if (days === 1) return '1 dia';
    if (days <= 7) return `${days} dias`;
    if (days <= 30) return `${Math.ceil(days / 7)} semanas`;
    return `${Math.ceil(days / 30)} meses`;
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
      <Card className="bg-app-surface border-app-border p-4 sm:p-6">
        <div className="flex flex-col space-y-4 mb-6">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Configurações da Plataforma</h2>
            <p className="text-sm text-app-muted mt-1">Gerencie todas as configurações do sistema</p>
          </div>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-neon w-full sm:w-auto sm:self-start"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Configurações
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Suporte</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Manutenção</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span className="hidden sm:inline">Legal</span>
            </TabsTrigger>
            <TabsTrigger value="pdf" className="flex items-center gap-2">
              <FileType className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Usuários</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba Geral */}
          <TabsContent value="general" className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <Label htmlFor="language" className="text-base font-medium">Idioma Padrão</Label>
                </div>
                <Select 
                  value={settings.default_language} 
                  onValueChange={(value) => updateSetting('default_language', value)}
                >
                  <SelectTrigger className="bg-app-surface-hover border-app-border h-12 text-base">
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português (BR)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="platform_name" className="text-base font-medium">Nome da Plataforma</Label>
                <Input
                  id="platform_name"
                  value={settings.platform_name}
                  onChange={(e) => updateSetting('platform_name', e.target.value)}
                  placeholder="MigraBook"
                  className="bg-app-surface-hover border-app-border h-12 text-base"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="platform_description" className="text-base font-medium">Descrição da Plataforma</Label>
                <Textarea
                  id="platform_description"
                  value={settings.platform_description}
                  onChange={(e) => updateSetting('platform_description', e.target.value)}
                  placeholder="Converta seu ebook para app em minutos"
                  rows={3}
                  className="bg-app-surface-hover border-app-border text-base resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-app-border rounded-lg bg-app-surface-hover/30">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Modo de Manutenção</Label>
                  <p className="text-sm text-app-muted">
                    Ativa uma página de manutenção para todos os usuários
                  </p>
                </div>
                <Switch
                  checked={settings.maintenance_mode === 'true'}
                  onCheckedChange={(checked) => updateSetting('maintenance_mode', checked.toString())}
                />
              </div>
            </div>
          </TabsContent>

          {/* Aba Suporte */}
          <TabsContent value="support" className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="support_title" className="text-base font-medium">Título da Página de Suporte</Label>
                <Input
                  id="support_title"
                  value={settings.support_title}
                  onChange={(e) => updateSetting('support_title', e.target.value)}
                  placeholder="Central de Suporte"
                  className="bg-app-surface-hover border-app-border h-12 text-base"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="support_description" className="text-base font-medium">Descrição da Página de Suporte</Label>
                <Textarea
                  id="support_description"
                  value={settings.support_description}
                  onChange={(e) => updateSetting('support_description', e.target.value)}
                  placeholder="Entre em contato conosco para obter ajuda e suporte especializado."
                  rows={3}
                  className="bg-app-surface-hover border-app-border text-base resize-none"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="support_button_text" className="text-base font-medium">Texto do Botão de Contato</Label>
                <Input
                  id="support_button_text"
                  value={settings.support_button_text}
                  onChange={(e) => updateSetting('support_button_text', e.target.value)}
                  placeholder="Entrar em Contato"
                  className="bg-app-surface-hover border-app-border h-12 text-base"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="support_whatsapp_link" className="text-base font-medium">Link do WhatsApp</Label>
                <Input
                  id="support_whatsapp_link"
                  value={settings.support_whatsapp_link}
                  onChange={(e) => updateSetting('support_whatsapp_link', e.target.value)}
                  placeholder="https://wa.me/5511999999999"
                  className="bg-app-surface-hover border-app-border h-12 text-base"
                />
                <p className="text-sm text-app-muted">
                  Cole o link completo do WhatsApp Business
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="support_email" className="text-base font-medium">Email de Suporte</Label>
                <Input
                  id="support_email"
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => updateSetting('support_email', e.target.value)}
                  placeholder="suporte@exemplo.com"
                  className="bg-app-surface-hover border-app-border h-12 text-base"
                />
              </div>
            </div>
          </TabsContent>

          {/* Aba Manutenção */}
          <TabsContent value="maintenance" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-app-border rounded-lg bg-app-surface-hover/30">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Limpeza Automática</Label>
                  <p className="text-sm text-app-muted">
                    Remove automaticamente apps de contas inativas
                  </p>
                </div>
                <Switch
                  checked={settings.auto_cleanup_enabled === 'true'}
                  onCheckedChange={(checked) => updateSetting('auto_cleanup_enabled', checked.toString())}
                />
              </div>

              {settings.auto_cleanup_enabled === 'true' && (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <Label htmlFor="cleanup-days" className="text-base font-medium">
                        Dias de inatividade para limpeza
                      </Label>
                    </div>
                    <Input
                      id="cleanup-days"
                      type="number"
                      min="1"
                      max="365"
                      value={settings.auto_cleanup_days}
                      onChange={(e) => updateSetting('auto_cleanup_days', e.target.value)}
                      className="bg-app-surface-hover border-app-border h-12 text-base w-full sm:w-32"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-app-border rounded-lg bg-app-surface-hover/30">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Notificar antes da limpeza</Label>
                      <p className="text-sm text-app-muted">
                        Enviar notificação antes de executar a limpeza
                      </p>
                    </div>
                    <Switch
                      checked={settings.cleanup_notification_enabled === 'true'}
                      onCheckedChange={(checked) => updateSetting('cleanup_notification_enabled', checked.toString())}
                    />
                  </div>

                  {settings.cleanup_notification_enabled === 'true' && (
                    <div className="space-y-3">
                      <Label htmlFor="notification-days" className="text-base font-medium">
                        Dias antes para notificar
                      </Label>
                      <Input
                        id="notification-days"
                        type="number"
                        min="1"
                        max="30"
                        value={settings.cleanup_notification_days}
                        onChange={(e) => updateSetting('cleanup_notification_days', e.target.value)}
                        className="bg-app-surface-hover border-app-border h-12 text-base w-full sm:w-32"
                      />
                    </div>
                  )}

                  {/* Histórico de Apps Agendados para Exclusão */}
                  <div className="space-y-4 p-4 border border-app-border rounded-lg bg-app-surface-hover/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <h3 className="text-lg font-semibold">Apps Agendados para Exclusão</h3>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchScheduledDeletions}
                        disabled={loadingDeletions}
                        className="h-8"
                      >
                        {loadingDeletions ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                        ) : (
                          'Atualizar'
                        )}
                      </Button>
                    </div>

                    {loadingDeletions ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : scheduledDeletions.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-app-muted">
                          Nenhum app agendado para exclusão no momento
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>App</TableHead>
                              <TableHead>Usuário</TableHead>
                              <TableHead>Inativado em</TableHead>
                              <TableHead>Tempo Restante</TableHead>
                              <TableHead>Data de Exclusão</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {scheduledDeletions.map((app) => (
                              <TableRow key={app.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{app.nome}</p>
                                    <p className="text-sm text-app-muted">/{app.slug}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-sm font-medium">{app.userName}</p>
                                    <p className="text-xs text-app-muted">{app.userEmail}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <p className="text-sm">
                                    {app.inactiveDate.toLocaleDateString('pt-BR')}
                                  </p>
                                  <p className="text-xs text-app-muted">
                                    {app.inactiveDate.toLocaleTimeString('pt-BR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                </TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    app.daysRemaining === 0 
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                      : app.daysRemaining <= 3 
                                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                  }`}>
                                    {formatTimeRemaining(app.daysRemaining)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <p className="text-sm">
                                    {app.deletionDate.toLocaleDateString('pt-BR')}
                                  </p>
                                  <p className="text-xs text-app-muted">
                                    {app.deletionDate.toLocaleTimeString('pt-BR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Aba Legal */}
          <TabsContent value="legal" className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <Label htmlFor="terms" className="text-base font-medium">Termos de Uso</Label>
                </div>
                <Textarea
                  id="terms"
                  placeholder="Digite os termos de uso da plataforma..."
                  value={settings.terms_of_use}
                  onChange={(e) => updateSetting('terms_of_use', e.target.value)}
                  className="min-h-[140px] bg-app-surface-hover border-app-border text-base resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="privacy_policy" className="text-base font-medium">Política de Privacidade</Label>
                <Textarea
                  id="privacy_policy"
                  placeholder="Digite a política de privacidade..."
                  value={settings.privacy_policy}
                  onChange={(e) => updateSetting('privacy_policy', e.target.value)}
                  className="min-h-[140px] bg-app-surface-hover border-app-border text-base resize-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <Label htmlFor="cancellation" className="text-base font-medium">Mensagem de Cancelamento</Label>
                </div>
                <Textarea
                  id="cancellation"
                  placeholder="Mensagem exibida para contas canceladas..."
                  value={settings.cancellation_message}
                  onChange={(e) => updateSetting('cancellation_message', e.target.value)}
                  className="min-h-[100px] bg-app-surface-hover border-app-border text-base resize-none"
                />
              </div>
            </div>
          </TabsContent>

          {/* Aba Usuários */}
          <TabsContent value="users" className="space-y-6">
            <AdminRoleManager />
          </TabsContent>

          {/* Aba PDF */}
          <TabsContent value="pdf" className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FileType className="w-5 h-5 text-primary" />
                  <Label className="text-base font-medium">Leitor de PDF</Label>
                </div>
                <p className="text-sm text-app-muted">
                  Selecione qual sistema de visualização de PDF será utilizado nos apps publicados
                </p>
                <Select 
                  value={settings.pdf_viewer} 
                  onValueChange={(value) => updateSetting('pdf_viewer', value)}
                >
                  <SelectTrigger className="bg-app-surface-hover border-app-border h-12 text-base">
                    <SelectValue placeholder="Selecione o leitor de PDF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google-docs">
                      <div className="flex flex-col">
                        <span>Google Docs Viewer</span>
                        <span className="text-xs text-app-muted">Gratuito, simples, mas com bugs frequentes</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="react-pdf">
                      <div className="flex flex-col">
                        <span>PDF.js (react-pdf) ⭐</span>
                        <span className="text-xs text-app-muted">Recomendado - Mozilla, funciona offline</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="adobe-embed">
                      <div className="flex flex-col">
                        <span>Adobe PDF Embed API</span>
                        <span className="text-xs text-app-muted">Alta qualidade Adobe, requer API Key</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="embedpdf">
                      <div className="flex flex-col">
                        <span>EmbedPDF</span>
                        <span className="text-xs text-app-muted">Leve (~50KB), open-source</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campo Adobe Client ID - aparece apenas quando Adobe é selecionado */}
              {settings.pdf_viewer === 'adobe-embed' && (
                <div className="space-y-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-center space-x-2">
                    <Key className="w-5 h-5 text-amber-500" />
                    <Label className="text-base font-medium">Adobe Client ID</Label>
                  </div>
                  <p className="text-sm text-app-muted">
                    Obtenha gratuitamente em{' '}
                    <a 
                      href="https://developer.adobe.com/console" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Adobe Developer Console
                    </a>
                  </p>
                  <Input
                    placeholder="Cole seu Adobe Client ID aqui..."
                    value={settings.adobe_client_id}
                    onChange={(e) => updateSetting('adobe_client_id', e.target.value)}
                    className="bg-app-surface-hover border-app-border h-12 text-base"
                  />
                </div>
              )}

              {/* Info sobre os leitores */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className={`p-4 rounded-lg border ${settings.pdf_viewer === 'google-docs' ? 'border-primary bg-primary/5' : 'border-app-border bg-app-surface-hover/30'}`}>
                  <h4 className="font-medium mb-2">Google Docs Viewer</h4>
                  <ul className="text-sm text-app-muted space-y-1">
                    <li>✅ Gratuito</li>
                    <li>✅ Simples de usar</li>
                    <li>⚠️ Bugs frequentes em mobile</li>
                    <li>⚠️ Depende de conexão</li>
                    <li>⚠️ Rate limiting do Google</li>
                  </ul>
                </div>
                
                <div className={`p-4 rounded-lg border ${settings.pdf_viewer === 'react-pdf' ? 'border-primary bg-primary/5' : 'border-app-border bg-app-surface-hover/30'}`}>
                  <h4 className="font-medium mb-2">PDF.js (react-pdf) ⭐</h4>
                  <ul className="text-sm text-app-muted space-y-1">
                    <li>✅ Gratuito (Mozilla)</li>
                    <li>✅ Controle total da interface</li>
                    <li>✅ Funciona offline</li>
                    <li>✅ Compatível com todos dispositivos</li>
                    <li>⚠️ Bundle maior (~500KB)</li>
                  </ul>
                </div>

                <div className={`p-4 rounded-lg border ${settings.pdf_viewer === 'adobe-embed' ? 'border-primary bg-primary/5' : 'border-app-border bg-app-surface-hover/30'}`}>
                  <h4 className="font-medium mb-2">Adobe PDF Embed API</h4>
                  <ul className="text-sm text-app-muted space-y-1">
                    <li>✅ Gratuito (ilimitado)</li>
                    <li>✅ Renderização de alta qualidade</li>
                    <li>✅ Interface profissional</li>
                    <li>✅ Suporte a anotações</li>
                    <li>⚠️ Requer API Key (gratuita)</li>
                    <li>⚠️ Requer conexão com internet</li>
                  </ul>
                </div>

                <div className={`p-4 rounded-lg border ${settings.pdf_viewer === 'embedpdf' ? 'border-primary bg-primary/5' : 'border-app-border bg-app-surface-hover/30'}`}>
                  <h4 className="font-medium mb-2">EmbedPDF</h4>
                  <ul className="text-sm text-app-muted space-y-1">
                    <li>✅ Gratuito e leve (~50KB)</li>
                    <li>✅ Fácil integração</li>
                    <li>✅ Open-source</li>
                    <li>✅ Framework-agnostic</li>
                    <li>⚠️ Comunidade menor</li>
                    <li>⚠️ Menos recursos avançados</li>
                  </ul>
                </div>
              </div>

              {/* Seção de Personalização Visual */}
              <div className="space-y-4 p-4 rounded-lg border border-primary/30 bg-primary/5">
                <div className="flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <Label className="text-base font-medium">Personalização Visual do Leitor</Label>
                </div>
                <p className="text-sm text-app-muted">
                  Personalize as cores dos elementos do leitor de PDF (aplicável aos leitores react-pdf e embedpdf)
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Cor do Botão Fechar */}
                  <div className="space-y-2">
                    <Label htmlFor="pdf_close_button_color" className="text-sm font-medium">
                      Cor do Botão Fechar (X)
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="pdf_close_button_color"
                        value={settings.pdf_close_button_color}
                        onChange={(e) => updateSetting('pdf_close_button_color', e.target.value)}
                        className="w-12 h-10 rounded border border-app-border cursor-pointer"
                      />
                      <Input
                        value={settings.pdf_close_button_color}
                        onChange={(e) => updateSetting('pdf_close_button_color', e.target.value)}
                        placeholder="#ffffff"
                        className="bg-app-surface-hover border-app-border h-10 text-sm flex-1"
                      />
                    </div>
                  </div>

                  {/* Cor dos Controles */}
                  <div className="space-y-2">
                    <Label htmlFor="pdf_controls_color" className="text-sm font-medium">
                      Cor dos Ícones de Controle
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="pdf_controls_color"
                        value={settings.pdf_controls_color}
                        onChange={(e) => updateSetting('pdf_controls_color', e.target.value)}
                        className="w-12 h-10 rounded border border-app-border cursor-pointer"
                      />
                      <Input
                        value={settings.pdf_controls_color}
                        onChange={(e) => updateSetting('pdf_controls_color', e.target.value)}
                        placeholder="#ffffff"
                        className="bg-app-surface-hover border-app-border h-10 text-sm flex-1"
                      />
                    </div>
                  </div>

                  {/* Cor de Fundo do Header */}
                  <div className="space-y-2">
                    <Label htmlFor="pdf_header_bg_color" className="text-sm font-medium">
                      Cor de Fundo do Cabeçalho
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="pdf_header_bg_color"
                        value={settings.pdf_header_bg_color}
                        onChange={(e) => updateSetting('pdf_header_bg_color', e.target.value)}
                        className="w-12 h-10 rounded border border-app-border cursor-pointer"
                      />
                      <Input
                        value={settings.pdf_header_bg_color}
                        onChange={(e) => updateSetting('pdf_header_bg_color', e.target.value)}
                        placeholder="#000000"
                        className="bg-app-surface-hover border-app-border h-10 text-sm flex-1"
                      />
                    </div>
                  </div>

                  {/* Cor da Barra de Controles */}
                  <div className="space-y-2">
                    <Label htmlFor="pdf_controls_bar_color" className="text-sm font-medium">
                      Cor de Fundo da Barra de Controles
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="pdf_controls_bar_color"
                        value={settings.pdf_controls_bar_color}
                        onChange={(e) => updateSetting('pdf_controls_bar_color', e.target.value)}
                        className="w-12 h-10 rounded border border-app-border cursor-pointer"
                      />
                      <Input
                        value={settings.pdf_controls_bar_color}
                        onChange={(e) => updateSetting('pdf_controls_bar_color', e.target.value)}
                        placeholder="#000000"
                        className="bg-app-surface-hover border-app-border h-10 text-sm flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview das cores */}
                <div className="mt-4 p-3 rounded-lg border border-app-border bg-app-surface-hover/30">
                  <Label className="text-sm font-medium mb-2 block">Pré-visualização</Label>
                  <div 
                    className="rounded-lg p-2 flex items-center justify-between"
                    style={{ backgroundColor: settings.pdf_header_bg_color }}
                  >
                    <span 
                      className="text-sm font-medium"
                      style={{ color: settings.pdf_controls_color }}
                    >
                      Título do PDF
                    </span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center text-xs"
                        style={{ 
                          backgroundColor: settings.pdf_controls_bar_color,
                          color: settings.pdf_controls_color 
                        }}
                      >
                        +
                      </div>
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center text-xs"
                        style={{ 
                          backgroundColor: settings.pdf_controls_bar_color,
                          color: settings.pdf_close_button_color 
                        }}
                      >
                        ✕
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default SettingsPanel;
