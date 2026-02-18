import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { Search, Trash2, Eye, Calendar, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getAppUrl } from '@/config/domains';

interface AppData {
  id: string;
  nome: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_email?: string;
  plan_name?: string;
  views: number;
  downloads: number;
}

const AppsManagementPanel = () => {
  const { t } = useLanguage();

  const [apps, setApps] = useState<AppData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<Array<{ id: string; email: string; plan_name?: string }>>([]);

  useEffect(() => {
    fetchApps();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('id, email');

      if (error) throw error;

      const { data: userStatusData } = await supabase
        .from('user_status')
        .select('user_id, plan_id');

      const { data: plansData } = await supabase
        .from('plans')
        .select('*');

      const usersData = (profilesData || []).map(profile => {
        const userStatus = userStatusData?.find(us => us.user_id === profile.id);
        const plan = plansData?.find(p => p.id === userStatus?.plan_id);

        return {
          id: profile.id,
          email: profile.email || `usuario${profile.id.slice(-4)}@email.com`,
          plan_name: plan?.name || t('plans.free') // 🔥 corrigido
        };
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const fetchApps = async () => {
    try {
      setIsLoading(true);

      const { data: appsData, error } = await supabase
        .from('apps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = [...new Set(appsData?.map(app => app.user_id) || [])];

      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const { data: userStatusData } = await supabase
        .from('user_status')
        .select('user_id, plan_id')
        .in('user_id', userIds);

      const { data: plansData } = await supabase
        .from('plans')
        .select('*');

      const processedApps: AppData[] = (appsData || []).map(app => {
        const userProfile = usersData?.find(user => user.id === app.user_id);
        const userStatus = userStatusData?.find(us => us.user_id === app.user_id);
        const plan = plansData?.find(p => p.id === userStatus?.plan_id);

        return {
          ...app,
          user_email: userProfile?.email || `usuario${app.user_id.slice(-4)}@email.com`,
          plan_name: plan?.name || t('plans.free') // 🔥 corrigido
        };
      });

      setApps(processedApps);
    } catch (error) {
      console.error('Erro ao buscar apps:', error);
      toast({
        title: t('error.generic'),
        description: t('apps.load_error'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [deletingApp, setDeletingApp] = useState<string | null>(null);

  const deleteApp = async (appId: string, appName: string) => {
    setDeletingApp(appId);
    try {
      const { error } = await supabase.rpc('admin_delete_app', { app_id: appId });
      if (error) throw error;

      setApps(prev => prev.filter(app => app.id !== appId));

      toast({
        title: t('apps.deleted'),
        description: t('apps.deleted_desc'),
      });
    } catch (error) {
      toast({
        title: t('error.generic'),
        description: t('apps.delete_error'),
        variant: "destructive",
      });
    } finally {
      setDeletingApp(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('apps.copied'), // 🔥 corrigido
      description: t('apps.id_copied'), // 🔥 corrigido
    });
  };

  const filteredApps = apps.filter(app => {
    const term = searchTerm.toLowerCase();
    return (
      (app.nome.toLowerCase().includes(term) ||
        app.user_email?.toLowerCase().includes(term) ||
        app.id.toLowerCase().includes(term)) &&
      (userFilter === 'all' || app.user_id === userFilter)
    );
  });

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
    <Card className="bg-app-surface border-app-border p-3 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {t('apps.manage_title')} {/* 🔥 traduzido */}
            </h2>
            <p className="text-sm text-app-muted">
              {t('apps.manage_subtitle')} {/* 🔥 traduzido */}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-xs sm:text-sm text-app-muted">
              {apps.length} apps
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-app-muted" />
            <Input
              placeholder={t('apps.search_placeholder')} // 🔥 corrigido
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-app-surface-hover border-app-border"
            />
          </div>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-full sm:w-64 bg-app-surface-hover border-app-border">
              <SelectValue placeholder={t('apps.filter_by_user')} /> {/* 🔥 corrigido */}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('apps.all_users')}</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.email} ({user.plan_name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        <div className="border border-app-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-app-border">
                  <TableHead>{t('apps.table.name')}</TableHead>
                  <TableHead className="hidden sm:table-cell">ID</TableHead>
                  <TableHead>{t('apps.table.user')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('apps.table.plan')}</TableHead>
                  <TableHead>{t('apps.table.status')}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('apps.table.created_at')}</TableHead>
                  <TableHead className="text-right">{t('apps.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.nome}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs">{app.id.slice(0, 8)}...</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(app.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{app.user_email}</TableCell>
                    <TableCell className="hidden md:table-cell">{app.plan_name}</TableCell>
                    <TableCell>
                      <Badge variant={app.status === 'publicado' ? 'default' : 'secondary'}>
                        {app.status === 'publicado' ? t('apps.status.published') : t('apps.status.draft')}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {new Date(app.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 h-8 px-2"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                            <span className="hidden sm:inline">
                              {t('apps.delete_button')} {/* 🔥 corrigido */}
                            </span>
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="bg-app-surface border-app-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('apps.delete_confirm_title')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('apps.delete_confirm_desc').replace('{appName}', app.nome)}
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t('common.cancel')}
                            </AlertDialogCancel>

                            <AlertDialogAction
                              onClick={() => deleteApp(app.id, app.nome)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deletingApp === app.id ? t('apps.deleting') : t('apps.delete_button')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center py-8">
            <p className="text-app-muted">{t('apps.not_found')}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AppsManagementPanel;
