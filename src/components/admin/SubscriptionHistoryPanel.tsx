import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import { Search, RotateCcw, History, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface SubscriptionHistoryEntry {
  id: string;
  user_id: string;
  user_email: string;
  event_type: string;
  event_source: string;
  previous_plan_name: string | null;
  new_plan_name: string | null;
  stripe_subscription_id: string | null;
  can_restore: boolean | null;
  restored_at: string | null;
  restored_by: string | null;
  restore_reason: string | null;
  created_at: string;
}

const SubscriptionHistoryPanel = () => {
  const { t } = useLanguage();
  const [history, setHistory] = useState<SubscriptionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscription_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (entry: SubscriptionHistoryEntry) => {
    setRestoring(entry.id);
    try {
      // Call check-subscription to revalidate with Stripe
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { userId: entry.user_id }
      });

      if (error) throw error;

      // Update the history entry to mark as restored
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: updateError } = await supabase
        .from('subscription_history')
        .update({
          can_restore: false,
          restored_at: new Date().toISOString(),
          restored_by: user?.id,
          restore_reason: 'Manual restoration by admin'
        })
        .eq('id', entry.id);

      if (updateError) throw updateError;

      toast.success(`Conta de ${entry.user_email} verificada e restaurada se necessário`);
      fetchHistory();
    } catch (error) {
      console.error('Error restoring subscription:', error);
      toast.error('Erro ao restaurar assinatura');
    } finally {
      setRestoring(null);
    }
  };

  const getEventBadge = (eventType: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      'subscribe': { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: '🟢 Subscribe' },
      'update': { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: '🟡 Update' },
      'cancel': { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: '🔴 Cancel' },
      'auto-restore': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: '🔵 Auto-Restore' },
      'manual-restore': { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: '🟣 Manual-Restore' },
    };
    const variant = variants[eventType] || { color: 'bg-muted text-muted-foreground', label: eventType };
    return <Badge className={`${variant.color} border`}>{variant.label}</Badge>;
  };

  const filteredHistory = history.filter(entry => {
    const matchesEmail = entry.user_email.toLowerCase().includes(searchEmail.toLowerCase());
    const matchesEvent = eventFilter === 'all' || entry.event_type === eventFilter;
    return matchesEmail && matchesEvent;
  });

  return (
    <Card className="bg-app-surface border-app-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <History className="w-5 h-5" />
          Histórico de Assinaturas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="pl-10 bg-app-bg border-app-border"
            />
          </div>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-app-bg border-app-border">
              <SelectValue placeholder="Filtrar evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os eventos</SelectItem>
              <SelectItem value="subscribe">Subscribe</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="cancel">Cancel</SelectItem>
              <SelectItem value="auto-restore">Auto-Restore</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchHistory} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border border-app-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-app-border hover:bg-app-bg/50">
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Evento</TableHead>
                <TableHead className="text-muted-foreground">Plano Anterior</TableHead>
                <TableHead className="text-muted-foreground">Novo Plano</TableHead>
                <TableHead className="text-muted-foreground">Data</TableHead>
                <TableHead className="text-muted-foreground">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((entry) => (
                  <TableRow key={entry.id} className="border-app-border hover:bg-app-bg/50">
                    <TableCell className="font-medium text-foreground max-w-[200px] truncate">
                      {entry.user_email}
                    </TableCell>
                    <TableCell>{getEventBadge(entry.event_type)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.previous_plan_name || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.new_plan_name || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {entry.event_type === 'cancel' && entry.can_restore ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={restoring === entry.id}
                              className="text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                            >
                              <RotateCcw className={`w-3 h-3 mr-1 ${restoring === entry.id ? 'animate-spin' : ''}`} />
                              Restaurar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-app-surface border-app-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-foreground">Confirmar Restauração</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                Isso irá verificar a assinatura de <strong>{entry.user_email}</strong> no Stripe 
                                e restaurar o plano se houver uma assinatura ativa. Deseja continuar?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-app-border">Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRestore(entry)}>
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : entry.restored_at ? (
                        <Badge variant="outline" className="text-green-400 border-green-500/30">
                          Restaurado
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
          <span>Total: {filteredHistory.length} registros</span>
          <span>Cancelamentos: {filteredHistory.filter(e => e.event_type === 'cancel').length}</span>
          <span>Restaurações: {filteredHistory.filter(e => e.restored_at).length}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionHistoryPanel;
