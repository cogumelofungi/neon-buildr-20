import { useState, useEffect } from 'react';
import { useSocialProofAdmin } from '@/hooks/useSocialProof';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { Loader2, Plus, Edit, Trash2, Bell, Settings, Users, Shuffle, Clock, Eye, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Tipos de ação pré-definidos
const ACTION_TYPES = [
  { value: 'subscribed', label: 'Assinou um plano', description: 'Ex: João assinou o plano Essencial' },
  { value: 'created_app', label: 'Criou primeiro app', description: 'Ex: Maria criou seu primeiro app' },
  { value: 'published_app', label: 'Publicou um app', description: 'Ex: Pedro publicou seu app' },
  { value: 'custom', label: 'Ação personalizada', description: 'Texto livre' },
] as const;

// Nomes de planos disponíveis
const PLAN_NAMES = [
  { value: 'Essencial', label: 'Essencial' },
  { value: 'Profissional', label: 'Profissional' },
  { value: 'Empresarial', label: 'Empresarial' },
  { value: 'Consultório', label: 'Consultório' },
];

// Rotas disponíveis - TODAS as rotas da aplicação
const AVAILABLE_ROUTES = [
  { value: '/', label: 'Página Inicial (/)' },
  { value: '/planos', label: 'Planos (/planos)' },
  { value: '/assine', label: 'Assine (/assine)' },
  { value: '/assinatura', label: 'Assinatura (/assinatura)' },
  { value: '/checkout/*', label: 'Checkout (/checkout/*)' },
  { value: '/subscribe', label: 'Subscribe (/subscribe)' },
  { value: '/login', label: 'Login (/login)' },
  { value: '/auth', label: 'Autenticação (/auth)' },
  { value: '/admin', label: 'Admin Dashboard (/admin)' },
  { value: '/admin/*', label: 'Todas páginas Admin (/admin/*)' },
  { value: '/dashboard', label: 'Dashboard (/dashboard)' },
  { value: '/academy', label: 'Academia (/academy)' },
  { value: '/support', label: 'Suporte (/support)' },
  { value: '/pricing', label: 'Preços (/pricing)' },
  { value: '/payment-success', label: 'Sucesso Pagamento (/payment-success)' },
  { value: '/subscription-confirmation/*', label: 'Confirmação Assinatura (/subscription-confirmation/*)' },
  { value: '/setup-password', label: 'Configurar Senha (/setup-password)' },
  { value: '/privacy-policy', label: 'Política Privacidade (/privacy-policy)' },
  { value: '/terms-of-service', label: 'Termos de Serviço (/terms-of-service)' },
  { value: '/app/*', label: 'Apps Públicos (/app/*)' },
  { value: '/player/*', label: 'Player (/player/*)' },
];

// Nomes brasileiros para geração
const BRAZILIAN_NAMES = [
  'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Ferreira',
  'Juliana Lima', 'Rafael Souza', 'Fernanda Almeida', 'Lucas Pereira', 'Beatriz Rodrigues',
  'Matheus Carvalho', 'Larissa Gomes', 'Gabriel Martins', 'Camila Ribeiro', 'Thiago Nascimento',
];

interface NotificationFormData {
  name: string;
  action_type: 'subscribed' | 'created_app' | 'published_app' | 'custom';
  plan_name: string;
  action: string;
  avatar_url: string;
  is_active: boolean;
}

const defaultFormData: NotificationFormData = {
  name: '',
  action_type: 'subscribed',
  plan_name: 'Essencial',
  action: '',
  avatar_url: '',
  is_active: true,
};

const SocialProofPanel = () => {
  const {
    settings,
    notifications,
    loading,
    updateSettings,
    addNotification,
    updateNotification,
    deleteNotification,
  } = useSocialProofAdmin();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NotificationFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    is_enabled: false,
    position: 'bottom-right' as 'bottom-right' | 'bottom-left',
    min_interval_seconds: 5,
    max_interval_seconds: 15,
    min_display_seconds: 3,
    max_display_seconds: 6,
    randomize_order: true,
    show_time_ago: true,
    show_verified_badge: true,
    routes: [] as string[],
    // Pause control
    enable_pause: false,
    notifications_before_pause: 5,
    pause_duration_seconds: 30,
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setSettingsForm({
        is_enabled: settings.is_enabled,
        position: settings.position,
        min_interval_seconds: settings.min_interval_seconds || 5,
        max_interval_seconds: settings.max_interval_seconds || 15,
        min_display_seconds: settings.min_display_seconds || 3,
        max_display_seconds: settings.max_display_seconds || 6,
        randomize_order: settings.randomize_order ?? true,
        show_time_ago: settings.show_time_ago ?? true,
        show_verified_badge: settings.show_verified_badge ?? true,
        routes: settings.routes || [],
        enable_pause: (settings as any).enable_pause ?? false,
        notifications_before_pause: (settings as any).notifications_before_pause || 5,
        pause_duration_seconds: (settings as any).pause_duration_seconds || 30,
      });
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    setSaving(true);
    
    // Validate intervals
    if (settingsForm.min_interval_seconds > settingsForm.max_interval_seconds) {
      toast.error('Intervalo mínimo não pode ser maior que o máximo');
      setSaving(false);
      return;
    }
    
    if (settingsForm.min_display_seconds > settingsForm.max_display_seconds) {
      toast.error('Duração mínima não pode ser maior que a máxima');
      setSaving(false);
      return;
    }

    const success = await updateSettings({
      is_enabled: settingsForm.is_enabled,
      position: settingsForm.position,
      min_interval_seconds: settingsForm.min_interval_seconds,
      max_interval_seconds: settingsForm.max_interval_seconds,
      min_display_seconds: settingsForm.min_display_seconds,
      max_display_seconds: settingsForm.max_display_seconds,
      randomize_order: settingsForm.randomize_order,
      show_time_ago: settingsForm.show_time_ago,
      show_verified_badge: settingsForm.show_verified_badge,
      routes: settingsForm.routes,
      enable_pause: settingsForm.enable_pause,
      notifications_before_pause: settingsForm.notifications_before_pause,
      pause_duration_seconds: settingsForm.pause_duration_seconds,
    });

    if (success) {
      toast.success('Configurações salvas com sucesso');
    } else {
      toast.error('Erro ao salvar configurações');
    }
    setSaving(false);
  };

  const handleRouteToggle = (route: string, checked: boolean) => {
    if (checked) {
      setSettingsForm(prev => ({ ...prev, routes: [...prev.routes, route] }));
    } else {
      setSettingsForm(prev => ({ ...prev, routes: prev.routes.filter(r => r !== route) }));
    }
  };

  const handleOpenDialog = (notification?: typeof notifications[0]) => {
    if (notification) {
      setEditingId(notification.id);
      setFormData({
        name: notification.name,
        action_type: (notification.action_type as any) || 'custom',
        plan_name: notification.plan_name || 'Completa',
        action: notification.action || '',
        avatar_url: notification.avatar_url || '',
        is_active: notification.is_active,
      });
    } else {
      setEditingId(null);
      // Suggest a random name
      const randomName = BRAZILIAN_NAMES[Math.floor(Math.random() * BRAZILIAN_NAMES.length)];
      setFormData({ ...defaultFormData, name: randomName });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (formData.action_type === 'custom' && !formData.action.trim()) {
      toast.error('Ação personalizada é obrigatória');
      return;
    }

    setSaving(true);
    
    const notificationData = {
      name: formData.name,
      action_type: formData.action_type,
      plan_name: formData.action_type === 'subscribed' ? formData.plan_name : null,
      action: formData.action_type === 'custom' ? formData.action : '',
      avatar_url: formData.avatar_url || null,
      is_active: formData.is_active,
    };

    let success: boolean;
    if (editingId) {
      success = await updateNotification(editingId, notificationData);
    } else {
      success = await addNotification(notificationData as any);
    }

    if (success) {
      toast.success(editingId ? 'Notificação atualizada' : 'Notificação criada');
      setDialogOpen(false);
      setFormData(defaultFormData);
      setEditingId(null);
    } else {
      toast.error('Erro ao salvar notificação');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notificação?')) return;

    const success = await deleteNotification(id);
    if (success) {
      toast.success('Notificação excluída');
    } else {
      toast.error('Erro ao excluir notificação');
    }
  };

  const handleToggleActive = async (notification: typeof notifications[0]) => {
    const success = await updateNotification(notification.id, { is_active: !notification.is_active });
    if (!success) {
      toast.error('Erro ao atualizar notificação');
    }
  };

  const getActionPreview = (notification: typeof notifications[0]) => {
    switch (notification.action_type) {
      case 'subscribed':
        return `assinou o plano ${notification.plan_name || 'Premium'}`;
      case 'created_app':
        return 'criou seu primeiro app';
      case 'published_app':
        return 'publicou seu app';
      case 'custom':
      default:
        return notification.action || '-';
    }
  };

  const getActionTypeBadge = (type: string) => {
    const found = ACTION_TYPES.find(t => t.value === type);
    return found?.label || 'Personalizado';
  };

  // Generate multiple notifications quickly
  const handleGenerateBatch = async () => {
    setSaving(true);
    const shuffledNames = [...BRAZILIAN_NAMES].sort(() => Math.random() - 0.5).slice(0, 5);
    const actionTypes: Array<'subscribed' | 'created_app' | 'published_app'> = ['subscribed', 'created_app', 'published_app'];
    
    for (const name of shuffledNames) {
      const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
      const planName = actionType === 'subscribed' 
        ? PLAN_NAMES[Math.floor(Math.random() * PLAN_NAMES.length)].value 
        : null;
      
      await addNotification({
        name,
        action_type: actionType,
        plan_name: planName,
        action: '',
        avatar_url: null,
        is_active: true,
      } as any);
    }
    
    toast.success('5 notificações geradas com sucesso!');
    setSaving(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações de Prova Social
              </CardTitle>
              <CardDescription>
                Configure notificações que aparecem no canto da tela para aumentar conversões
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${settingsForm.is_enabled ? 'text-green-600' : 'text-muted-foreground'}`}>
                {settingsForm.is_enabled ? 'Ativado' : 'Desativado'}
              </span>
              <Switch
                checked={settingsForm.is_enabled}
                onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, is_enabled: checked }))}
                disabled={saving}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Notificações ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Notificações</CardTitle>
                  <CardDescription>
                    Gerencie as notificações que serão exibidas aos visitantes
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleGenerateBatch} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shuffle className="w-4 h-4 mr-2" />}
                    Gerar 5 Aleatórias
                  </Button>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Notificação
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma notificação cadastrada</p>
                  <p className="text-sm mt-1">Clique em "Nova Notificação" ou "Gerar 5 Aleatórias"</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Preview</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell className="font-medium">{notification.name}</TableCell>
                        <TableCell>
                          <span className="text-xs px-2 py-1 rounded-full bg-muted">
                            {getActionTypeBadge(notification.action_type)}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate text-muted-foreground">
                          {notification.name} {getActionPreview(notification)}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={notification.is_active}
                            onCheckedChange={() => handleToggleActive(notification)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(notification)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(notification.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid gap-6">
            {/* Timing Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Controle de Tempo
                </CardTitle>
                <CardDescription>
                  Configure intervalos variáveis para parecer mais natural
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Interval Range */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Intervalo entre Notificações</Label>
                    <span className="text-sm text-muted-foreground">
                      {settingsForm.min_interval_seconds}s - {settingsForm.max_interval_seconds}s
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Mínimo (segundos)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={settingsForm.min_interval_seconds}
                        onChange={(e) => setSettingsForm(prev => ({ 
                          ...prev, 
                          min_interval_seconds: parseInt(e.target.value) || 1 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Máximo (segundos)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="120"
                        value={settingsForm.max_interval_seconds}
                        onChange={(e) => setSettingsForm(prev => ({ 
                          ...prev, 
                          max_interval_seconds: parseInt(e.target.value) || 10 
                        }))}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tempo de espera aleatório entre cada notificação
                  </p>
                </div>

                {/* Display Duration Range */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Duração de Exibição</Label>
                    <span className="text-sm text-muted-foreground">
                      {settingsForm.min_display_seconds}s - {settingsForm.max_display_seconds}s
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Mínimo (segundos)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={settingsForm.min_display_seconds}
                        onChange={(e) => setSettingsForm(prev => ({ 
                          ...prev, 
                          min_display_seconds: parseInt(e.target.value) || 2 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Máximo (segundos)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={settingsForm.max_display_seconds}
                        onChange={(e) => setSettingsForm(prev => ({ 
                          ...prev, 
                          max_display_seconds: parseInt(e.target.value) || 6 
                        }))}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Por quanto tempo cada notificação fica visível
                  </p>
                </div>

                {/* Pause Control */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Pausar após X notificações</Label>
                      <p className="text-xs text-muted-foreground">
                        Para não ficar repetitivo, pause as notificações após mostrar uma quantidade
                      </p>
                    </div>
                    <Switch
                      checked={settingsForm.enable_pause}
                      onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, enable_pause: checked }))}
                    />
                  </div>
                  
                  {settingsForm.enable_pause && (
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Notificações antes de pausar</Label>
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          value={settingsForm.notifications_before_pause}
                          onChange={(e) => setSettingsForm(prev => ({ 
                            ...prev, 
                            notifications_before_pause: parseInt(e.target.value) || 5 
                          }))}
                        />
                        <p className="text-xs text-muted-foreground">
                          Quantidade de notificações a exibir antes de pausar
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Tempo de pausa (segundos)</Label>
                        <Input
                          type="number"
                          min="10"
                          max="600"
                          value={settingsForm.pause_duration_seconds}
                          onChange={(e) => setSettingsForm(prev => ({ 
                            ...prev, 
                            pause_duration_seconds: parseInt(e.target.value) || 30 
                          }))}
                        />
                        <p className="text-xs text-muted-foreground">
                          Quanto tempo pausar antes de reiniciar o ciclo
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Appearance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Aparência
                </CardTitle>
                <CardDescription>
                  Personalize como as notificações aparecem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Position */}
                <div className="space-y-2">
                  <Label>Posição na Tela</Label>
                  <Select
                    value={settingsForm.position}
                    onValueChange={(value) =>
                      setSettingsForm(prev => ({
                        ...prev,
                        position: value === 'bottom-left' ? 'bottom-left' : 'bottom-right',
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Canto Inferior Direito</SelectItem>
                      <SelectItem value="bottom-left">Canto Inferior Esquerdo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Toggle Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Ordem Aleatória</Label>
                      <p className="text-xs text-muted-foreground">
                        Embaralhar ordem das notificações a cada ciclo
                      </p>
                    </div>
                    <Switch
                      checked={settingsForm.randomize_order}
                      onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, randomize_order: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Mostrar "há X minutos"</Label>
                      <p className="text-xs text-muted-foreground">
                        Exibir tempo aleatório como "agora mesmo", "há 2 minutos"
                      </p>
                    </div>
                    <Switch
                      checked={settingsForm.show_time_ago}
                      onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, show_time_ago: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Mostrar Badge Verificado</Label>
                      <p className="text-xs text-muted-foreground">
                        Exibir "Verificado por MigraBook" na notificação
                      </p>
                    </div>
                    <Switch
                      checked={settingsForm.show_verified_badge}
                      onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, show_verified_badge: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Routes Card */}
            <Card>
              <CardHeader>
                <CardTitle>Rotas onde Exibir</CardTitle>
                <CardDescription>
                  Selecione em quais páginas as notificações devem aparecer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border rounded-lg bg-muted/30">
                  {AVAILABLE_ROUTES.map((route) => (
                    <div key={route.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`route-${route.value}`}
                        checked={settingsForm.routes.includes(route.value)}
                        onCheckedChange={(checked) => handleRouteToggle(route.value, checked === true)}
                      />
                      <label
                        htmlFor={`route-${route.value}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {route.label}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={handleSaveSettings} disabled={saving} size="lg" className="w-full">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Todas as Configurações
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Notificação' : 'Nova Notificação'}</DialogTitle>
            <DialogDescription>
              Configure os detalhes da notificação de prova social
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Pessoa *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: João Silva"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Ação *</Label>
              <Select
                value={formData.action_type}
                onValueChange={(value: any) => setFormData({ ...formData, action_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {ACTION_TYPES.find(t => t.value === formData.action_type)?.description}
              </p>
            </div>

            {formData.action_type === 'subscribed' && (
              <div className="space-y-2">
                <Label>Nome do Plano</Label>
                <Select
                  value={formData.plan_name}
                  onValueChange={(value) => setFormData({ ...formData, plan_name: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_NAMES.map((plan) => (
                      <SelectItem key={plan.value} value={plan.value}>
                        {plan.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.action_type === 'custom' && (
              <div className="space-y-2">
                <Label>Texto da Ação *</Label>
                <Input
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  placeholder="Ex: está personalizando seu ebook"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>URL do Avatar (opcional)</Label>
              <Input
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Notificação ativa</Label>
            </div>

            {/* Preview */}
            <div className="rounded-lg border p-4 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">Preview:</p>
              <p className="text-sm">
                <span className="font-semibold">{formData.name || 'Nome'}</span>{' '}
                <span className="text-muted-foreground">
                  {formData.action_type === 'subscribed' && `assinou o plano ${formData.plan_name}`}
                  {formData.action_type === 'created_app' && 'criou seu primeiro app'}
                  {formData.action_type === 'published_app' && 'publicou seu app'}
                  {formData.action_type === 'custom' && (formData.action || 'ação personalizada')}
                </span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialProofPanel;
