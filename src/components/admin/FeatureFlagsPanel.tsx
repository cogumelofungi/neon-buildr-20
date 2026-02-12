import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useFeatureFlagsAdmin } from '@/hooks/useFeatureFlags';
import { useLanguage } from '@/hooks/useLanguage';
import { Layers, Plus, X, Save, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';

const FeatureFlagsPanel = () => {
  const { t } = useLanguage();
  const { mode, whitelist, isLoading, isSaving, saveFlags } = useFeatureFlagsAdmin();
  const [localMode, setLocalMode] = useState(mode);
  const [localWhitelist, setLocalWhitelist] = useState<string[]>(whitelist);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    setLocalMode(mode);
    setLocalWhitelist(whitelist);
  }, [mode, whitelist]);

  const handleAddEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('E-mail inválido');
      return;
    }
    if (localWhitelist.includes(email)) {
      toast.error('E-mail já adicionado');
      return;
    }
    setLocalWhitelist(prev => [...prev, email]);
    setNewEmail('');
  };

  const handleRemoveEmail = (email: string) => {
    setLocalWhitelist(prev => prev.filter(e => e !== email));
  };

  const handleSave = async () => {
    const success = await saveFlags(localMode, localWhitelist);
    if (success) {
      toast.success('Configurações de feature flags salvas!');
    } else {
      toast.error('Erro ao salvar configurações');
    }
  };

  const hasChanges = localMode !== mode || JSON.stringify(localWhitelist) !== JSON.stringify(whitelist);

  if (isLoading) {
    return (
      <Card className="p-6 bg-app-surface border-app-border">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-app-muted">Carregando...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-app-surface border-app-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Controle de Funcionalidades</h3>
            <p className="text-sm text-app-muted">Controle quais funcionalidades estão visíveis para os usuários</p>
          </div>
        </div>

        {/* Upload Modules Feature */}
        <Card className="p-5 border-app-border bg-background">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="w-5 h-5 text-primary" />
            <div>
              <h4 className="font-medium text-foreground">Organizar em Módulos</h4>
              <p className="text-xs text-app-muted">Controla a visibilidade da opção "Organizar em Módulos" no editor de apps</p>
            </div>
          </div>

          <RadioGroup
            value={localMode}
            onValueChange={(val) => setLocalMode(val as any)}
            className="space-y-3 mb-4"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-app-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="disabled" id="mode-disabled" />
              <Label htmlFor="mode-disabled" className="flex-1 cursor-pointer">
                <span className="font-medium text-foreground">Desativado</span>
                <p className="text-xs text-app-muted">Ninguém pode ver esta funcionalidade</p>
              </Label>
              <Badge variant="secondary" className="text-xs">Oculto</Badge>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border border-app-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="whitelist" id="mode-whitelist" />
              <Label htmlFor="mode-whitelist" className="flex-1 cursor-pointer">
                <span className="font-medium text-foreground">Apenas usuários selecionados</span>
                <p className="text-xs text-app-muted">Somente os e-mails listados abaixo poderão ver</p>
              </Label>
              <Badge variant="outline" className="text-xs">Restrito</Badge>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border border-app-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="everyone" id="mode-everyone" />
              <Label htmlFor="mode-everyone" className="flex-1 cursor-pointer">
                <span className="font-medium text-foreground">Todos os usuários</span>
                <p className="text-xs text-app-muted">Todos podem ver e usar esta funcionalidade</p>
              </Label>
              <Badge className="text-xs bg-green-500/15 text-green-600 border-green-500/30">Liberado</Badge>
            </div>
          </RadioGroup>

          {/* Whitelist management */}
          {localMode === 'whitelist' && (
            <div className="space-y-3 pt-3 border-t border-app-border">
              <Label className="text-sm font-medium text-foreground">Usuários com acesso</Label>
              
              <div className="flex gap-2">
                <Input
                  placeholder="email@exemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleAddEmail} variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              {localWhitelist.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {localWhitelist.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="flex items-center gap-1 py-1 px-3"
                    >
                      {email}
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="ml-1 hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-app-muted italic">Nenhum usuário adicionado ainda</p>
              )}
            </div>
          )}
        </Card>

        {/* Save button */}
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default FeatureFlagsPanel;
