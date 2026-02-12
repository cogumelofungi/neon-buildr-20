import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, Code, X, Edit2, Route } from 'lucide-react';
import { toast } from 'sonner';
import { useCustomScripts } from '@/hooks/useCustomScripts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AVAILABLE_ROUTES = [
  { value: '/', label: 'Home (/)' },
  { value: '/pricing', label: 'Preços (/pricing)' },
  { value: '/planos', label: 'Planos (/planos)' },
  { value: '/checkout', label: 'Checkout (/checkout)' },
  { value: '/assine', label: 'Assinar (/assine)' },
  { value: '/assinatura', label: 'Assinatura (/assinatura)' },
  { value: '/acesso', label: 'Acesso (/acesso)' },
  { value: '/app', label: 'App Viewer (/app)' },
  { value: '/player', label: 'Player (/player)' },
  { value: '/privacidade', label: 'Privacidade (/privacidade)' },
  { value: '/termos', label: 'Termos (/termos)' },
  { value: '/suporte', label: 'Suporte (/suporte)' },
  { value: '/academy', label: 'Academia (/academy)' },
  { value: '/payment-success', label: 'Pagamento Sucesso (/payment-success)' },
  { value: '/finalizada-assinatura-completa', label: 'Confirmação Completa (/finalizada-assinatura-completa)' },
  { value: '/finalizada-assinatura-consultorio', label: 'Confirmação Consultório (/finalizada-assinatura-consultorio)' },
  { value: '*', label: 'Todas as páginas (*)' },
];

interface ScriptFormData {
  name: string;
  script_code: string;
  routes: string[];
  is_active: boolean;
}

const CustomScriptsPanel = () => {
  const { scripts, isLoading, createScript, updateScript, deleteScript } = useCustomScripts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<any>(null);
  const [formData, setFormData] = useState<ScriptFormData>({
    name: '',
    script_code: '',
    routes: [],
    is_active: true,
  });
  const [selectedRoute, setSelectedRoute] = useState<string>('');

  const resetForm = () => {
    setFormData({
      name: '',
      script_code: '',
      routes: [],
      is_active: true,
    });
    setSelectedRoute('');
    setEditingScript(null);
  };

  const handleOpenDialog = (script?: any) => {
    if (script) {
      setEditingScript(script);
      setFormData({
        name: script.name,
        script_code: script.script_code,
        routes: script.routes || [],
        is_active: script.is_active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleAddRoute = () => {
    if (selectedRoute && !formData.routes.includes(selectedRoute)) {
      setFormData(prev => ({
        ...prev,
        routes: [...prev.routes, selectedRoute],
      }));
      setSelectedRoute('');
    }
  };

  const handleRemoveRoute = (route: string) => {
    setFormData(prev => ({
      ...prev,
      routes: prev.routes.filter(r => r !== route),
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome do script é obrigatório');
      return;
    }
    if (!formData.script_code.trim()) {
      toast.error('Código do script é obrigatório');
      return;
    }
    if (formData.routes.length === 0) {
      toast.error('Selecione pelo menos uma rota');
      return;
    }

    try {
      if (editingScript) {
        await updateScript(editingScript.id, formData);
        toast.success('Script atualizado com sucesso');
      } else {
        await createScript(formData);
        toast.success('Script criado com sucesso');
      }
      handleCloseDialog();
    } catch (error) {
      toast.error('Erro ao salvar script');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este script?')) {
      try {
        await deleteScript(id);
        toast.success('Script excluído com sucesso');
      } catch (error) {
        toast.error('Erro ao excluir script');
      }
    }
  };

  const handleToggleActive = async (script: any) => {
    try {
      await updateScript(script.id, { is_active: !script.is_active });
      toast.success(script.is_active ? 'Script desativado' : 'Script ativado');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const getRouteLabel = (route: string) => {
    const found = AVAILABLE_ROUTES.find(r => r.value === route);
    return found ? found.label : route;
  };

  if (isLoading) {
    return (
      <Card className="bg-app-surface border-app-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-app-surface border-app-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Code className="w-5 h-5" />
            Scripts Personalizados
          </CardTitle>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Script
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-app-muted text-sm mb-4">
            Adicione códigos de integração (pixels, scripts de analytics, etc.) que serão inseridos no header das páginas selecionadas.
          </p>

          {scripts.length === 0 ? (
            <div className="text-center py-8 text-app-muted">
              <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum script cadastrado</p>
              <p className="text-sm">Clique em "Adicionar Script" para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scripts.map((script) => (
                <Card key={script.id} className="bg-background border-app-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-foreground">{script.name}</h4>
                          <Badge variant={script.is_active ? 'default' : 'secondary'}>
                            {script.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {script.routes?.map((route: string) => (
                            <Badge key={route} variant="outline" className="text-xs">
                              <Route className="w-3 h-3 mr-1" />
                              {getRouteLabel(route)}
                            </Badge>
                          ))}
                        </div>
                        <pre className="text-xs text-app-muted bg-app-surface p-2 rounded overflow-x-auto max-h-20">
                          {script.script_code.substring(0, 200)}
                          {script.script_code.length > 200 ? '...' : ''}
                        </pre>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={script.is_active}
                          onCheckedChange={() => handleToggleActive(script)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(script)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(script.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingScript ? 'Editar Script' : 'Adicionar Script'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Script</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Facebook Pixel, Google Analytics..."
              />
            </div>

            <div>
              <Label htmlFor="script_code">Código do Script</Label>
              <Textarea
                id="script_code"
                value={formData.script_code}
                onChange={(e) => setFormData(prev => ({ ...prev, script_code: e.target.value }))}
                placeholder="Cole aqui o código do script (incluindo as tags <script>)"
                className="font-mono text-sm min-h-[150px]"
              />
            </div>

            <div>
              <Label>Rotas (Páginas)</Label>
              <div className="flex gap-2 mt-2">
                <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione uma rota" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ROUTES.filter(r => !formData.routes.includes(r.value)).map((route) => (
                      <SelectItem key={route.value} value={route.value}>
                        {route.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddRoute} disabled={!selectedRoute}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.routes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.routes.map((route) => (
                    <Badge key={route} variant="secondary" className="gap-1 pr-1">
                      {getRouteLabel(route)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveRoute(route)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Script ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomScriptsPanel;
