import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import { Search, UserCheck, UserX, Eye, Calendar, Package, User, Trash2, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  email: string;
  phone?: string;
  full_name?: string;
  created_at: string;
  is_active: boolean;
  app_count: number;
  plan_name?: string;
  plan_id?: string;
  plan_app_limit?: number;
  last_renewal_date?: string;
  payment_method?: 'stripe' | 'manual' | 'pix';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'paused' | null;
  subscription_end?: string;
  cancel_at_period_end?: boolean;
}

interface UserApp {
  id: string;
  nome: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const ITEMS_PER_PAGE = 10;

const StudentsPanel = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserData[]>([]);
  const [plans, setPlans] = useState<Array<{id: string; name: string; app_limit: number}>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [stripeStatusFilter, setStripeStatusFilter] = useState<'all' | 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'no_stripe'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Helper para renderizar badge de status da assinatura Stripe
  const renderSubscriptionStatusBadge = (user: UserData) => {
    // Só mostrar para usuários com pagamento Stripe
    if (user.payment_method !== 'stripe' || !user.stripe_subscription_id) {
      return null;
    }

    const status = user.subscription_status;
    
    if (!status) {
      return (
        <Badge variant="outline" className="text-xs bg-gray-500/20 text-gray-400 border-gray-500/30">
          {t('students.subscription_unknown')}
        </Badge>
      );
    }

    switch (status) {
      case 'active':
        return (
          <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
            {t('students.subscription_active')}
          </Badge>
        );
      case 'trialing':
        return (
          <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
            {t('students.subscription_trialing')}
          </Badge>
        );
      case 'past_due':
        return (
          <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
            {t('students.subscription_past_due')}
          </Badge>
        );
      case 'unpaid':
        return (
          <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
            {t('students.subscription_unpaid')}
          </Badge>
        );
      case 'canceled':
        return (
          <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
            {t('students.subscription_canceled')}
          </Badge>
        );
      case 'incomplete':
      case 'incomplete_expired':
        return (
          <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            {t('students.subscription_incomplete')}
          </Badge>
        );
      case 'paused':
        return (
          <Badge className="text-xs bg-gray-500/20 text-gray-400 border-gray-500/30">
            {t('students.subscription_paused')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        );
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Iniciando busca de usuários...');
      
      // Buscar todos os planos disponíveis
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*');
      
      if (plansError) {
        console.error('❌ Erro ao buscar planos:', plansError);
        throw plansError;
      }
      
      console.log('✅ Planos encontrados:', plansData?.length || 0);
      setPlans(plansData || []);
      
      // Buscar usuários com metadados usando a função RPC
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_users_with_metadata');
        
      if (usersError) {
        console.error('❌ Erro ao buscar usuários:', usersError);
        throw usersError;
      }
      
      console.log('✅ Usuários encontrados:', usersData?.length || 0);

      // Buscar user_status separadamente
      const { data: userStatusData, error: statusError } = await supabase
        .from('user_status')
        .select('*');
        
      if (statusError) {
        console.error('❌ Erro ao buscar user_status:', statusError);
        // Não vamos lançar erro aqui, apenas loggar
      }
      
      console.log('✅ User status encontrados:', userStatusData?.length || 0);

      // Buscar contagem de apps por usuário
      const { data: appCounts, error: appError } = await supabase
        .from('apps')
        .select('user_id')
        .eq('status', 'publicado');
        
      if (appError) {
        console.error('❌ Erro ao buscar apps:', appError);
        // Não vamos lançar erro aqui, apenas loggar
      }
      
      console.log('✅ Apps encontrados:', appCounts?.length || 0);

      // Buscar status de assinaturas Stripe diretamente da API
      const stripeSubscriptionStatuses: Record<string, { status: string; subscription_end: string | null; cancel_at_period_end: boolean }> = {};
      
      // Para usuários com stripe_subscription_id, buscar status atual da Stripe
      const usersWithStripe = userStatusData?.filter(us => us.stripe_subscription_id) || [];
      
      if (usersWithStripe.length > 0) {
        try {
          const subscriptionIds = usersWithStripe.map(u => u.stripe_subscription_id).filter(Boolean) as string[];
          
          // Chamar edge function para buscar status real da Stripe
          const { data: stripeData, error: stripeError } = await supabase.functions.invoke('get-stripe-subscription-status', {
            body: { subscription_ids: subscriptionIds }
          });
          
          if (stripeError) {
            console.error('Erro ao buscar status da Stripe:', stripeError);
          } else if (stripeData?.results) {
            // Mapear subscription_id para user_id
            usersWithStripe.forEach(userStatus => {
              const subId = userStatus.stripe_subscription_id;
              if (subId && stripeData.results[subId]) {
                const stripeInfo = stripeData.results[subId];
                stripeSubscriptionStatuses[userStatus.user_id] = {
                  status: stripeInfo.status,
                  subscription_end: stripeInfo.current_period_end 
                    ? new Date(stripeInfo.current_period_end * 1000).toISOString() 
                    : null,
                  cancel_at_period_end: stripeInfo.cancel_at_period_end || false
                };
              }
            });
          }
        } catch (err) {
          console.error('Erro ao buscar status de assinaturas Stripe:', err);
        }
      }

      // Processar dados dos usuários
      const userData: UserData[] = (usersData || []).map(user => {
        const userStatus = userStatusData?.find(us => us.user_id === user.id);
        const appCount = appCounts?.filter(app => app.user_id === user.id).length || 0;
        const plan = plansData?.find(p => p.id === userStatus?.plan_id);
        const stripeInfo = stripeSubscriptionStatuses[user.id];
        
        console.log(`📄 Processando usuário: ${user.email}`, {
          userStatus,
          appCount,
          plan,
          display_name: user.display_name,
          stripeInfo
        });
        
        return {
          id: user.id,
          email: user.email || `usuario${user.id.slice(-4)}@email.com`,
          phone: user.phone || '',
          full_name: user.display_name || '',
          created_at: user.created_at,
          is_active: userStatus?.is_active ?? true,
          app_count: appCount,
          plan_id: userStatus?.plan_id || null,
          plan_name: plan?.name || 'Gratuito',
          plan_app_limit: plan?.app_limit || 0,
          last_renewal_date: null,
          payment_method: (userStatus as any)?.payment_method || null,
          stripe_customer_id: (userStatus as any)?.stripe_customer_id || null,
          stripe_subscription_id: (userStatus as any)?.stripe_subscription_id || null,
          subscription_status: stripeInfo?.status as any || null,
          subscription_end: stripeInfo?.subscription_end || null,
          cancel_at_period_end: stripeInfo?.cancel_at_period_end || false
        };
      });

      console.log('✅ Dados processados:', userData);
      setUsers(userData);
      
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: `Erro ao carregar dados dos usuários: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar apps do usuário
  const fetchUserApps = async (userId: string): Promise<UserApp[]> => {
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('id, nome, slug, status, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar apps do usuário:', error);
      return [];
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      // First, check if user_status record exists
      const { data: existingStatus, error: checkError } = await supabase
        .from('user_status')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let updateError;
      
      if (existingStatus) {
        // Update existing record
        const { error } = await supabase
          .from('user_status')
          .update({ is_active: newStatus })
          .eq('user_id', userId);
        updateError = error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_status')
          .insert({
            user_id: userId,
            is_active: newStatus
          });
        updateError = error;
      }

      if (updateError) throw updateError;

      // Update local state immediately
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, is_active: newStatus }
          : user
      ));

      toast({
        title: t("students.status_updated"),
        description: t("students.status_updated_description")
        .replace("{status}", newStatus ? t("students.activated") : t("students.deactivated")),
      });
      
      // Refetch data to ensure consistency
      setTimeout(() => {
        fetchUsers();
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: t("students.error"),
        description: t("students.error_update_status"),
        variant: "destructive",
      });
      
      // Refetch data in case of error to restore correct state
      fetchUsers();
    }
  };

  const updateUserPlan = async (userId: string, planId: string, stripeCustomerId?: string) => {
    try {
    const currentStudent = users.find(u => u.id === userId);
    const hasStripeCustomer = currentStudent?.stripe_customer_id || stripeCustomerId;
      const { error } = await supabase
        .from('user_status')
        .upsert(
          {
            user_id: userId,
            plan_id: planId,
            payment_method: hasStripeCustomer ? 'stripe' : 'manual',  // ✅ CONDICIONAL
            bypass_stripe_check: !hasStripeCustomer,                  // ✅ CONDICIONAL
            // ✅ NOVO: Só reseta se NÃO for cliente Stripe
            ...(hasStripeCustomer ? {} : { 
              stripe_customer_id: null,
              stripe_subscription_id: null 
            }),
            is_active: true
          },
          { onConflict: 'user_id' }
        );
      
      if (error) throw error;

      const selectedPlan = plans.find(p => p.id === planId);
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              plan_id: planId,
              plan_name: selectedPlan?.name || t('students.free'),
              plan_app_limit: selectedPlan?.app_limit || 0 // Plano gratuito tem limite 0
            }
          : user
      ));

      // ✅ NOVO: Toast condicional com warning
      if (hasStripeCustomer) {
        toast({
          title: t("students.stripe_warning_title"),
          description: t("students.stripe_warning_description"),
          variant: "destructive",
          duration: 8000,
        });
      } else {
        toast({
          title: t("students.plan_updated"),
          description: t("students.plan_updated_description").replace("{planName}", selectedPlan?.name),
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      toast({
        title: t("students.error"),
        description: t("students.error_update_plan"),
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    setDeletingUser(userId);
    try {
      // Usar a edge function para exclusão completa (dados + autenticação)
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`,
        },
        body: { target_user_id: userId }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || t('students.error_delete_user'));
      }

      // Atualizar lista localmente
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      toast({
        title: t("students.user_deleted"),
        description: t("students.user_deleted_description").replace("{email}", userEmail),
      });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: t("students.error"),
        description: t("students.error_delete").replace("{error}", error.message),
        variant: "destructive",
      });
    } finally {
      setDeletingUser(null);
    }
  };

  // Componente para os detalhes do usuário
  const UserDetailsDialog = ({ user }: { user: UserData }) => {
    const [userApps, setUserApps] = useState<UserApp[]>([]);
    const [isLoadingApps, setIsLoadingApps] = useState(false);

    const loadUserApps = async () => {
      setIsLoadingApps(true);
      const apps = await fetchUserApps(user.id);
      setUserApps(apps);
      setIsLoadingApps(false);
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadUserApps}
            className="bg-app-surface-hover border-app-border hover:bg-app-surface"
          >
            <Eye className="w-4 h-4 mr-1" />
            {t('admin.students.details')}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-app-surface border-app-border mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">{t("students.details_title")}</DialogTitle>
            <DialogDescription className="text-app-muted">
              {t("students.details_subtitle")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Dados do Cliente */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h3 className="text-base sm:text-lg font-semibold text-foreground">{t("students.client_data")}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-app-surface-hover p-3 sm:p-4 rounded-lg border border-app-border">
                <div>
                  <p className="text-xs sm:text-sm text-app-muted">{t("students.full_name")}</p>
                  <p className="font-medium text-foreground text-sm sm:text-base">{user.full_name || t('students.not_informed')}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-app-muted">{t("students.email")}</p>
                  <p className="font-medium text-foreground text-sm sm:text-base break-all">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-app-muted">{t("students.phone")}</p>
                  <p className="font-medium text-foreground text-sm sm:text-base">{user.phone || t('students.not_informed')}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-app-muted">{t("students.registration_date")}</p>
                  <p className="font-medium text-foreground text-sm sm:text-base">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Plano Contratado */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">{t("students.contracted_plan")}</h3>
              </div>
              <div className="bg-app-surface-hover p-4 rounded-lg border border-app-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-app-muted">{t("students.current_plan")}</p>
                    <p className="font-medium text-foreground">
                      {user.plan_name} ({user.plan_app_limit} {t("students.apps")})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-app-muted">{t("students.published_apps")}</p>
                    <p className="font-medium text-foreground">
                      {user.app_count}/{user.plan_app_limit}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-app-muted">{t("students.last_renewal_date")}</p>
                    <p className="font-medium text-foreground">
                      {user.last_renewal_date 
                        ? new Date(user.last_renewal_date).toLocaleDateString('pt-BR')
                        : t('students.not_informed')
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Histórico de Apps */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">{t("students.app_history")}</h3>
              </div>
              <div className="bg-app-surface-hover p-4 rounded-lg border border-app-border">
                {isLoadingApps ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : userApps.length > 0 ? (
                  <div className="space-y-3">
                    {userApps.map((app) => (
                      <div key={app.id} className="flex justify-between items-center p-3 bg-background rounded border border-app-border">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{app.nome}</p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-app-muted mt-1">
                            <span>
                              Status: <Badge variant={app.status === 'publicado' ? 'default' : 'secondary'}>
                                {app.status === 'publicado' ? t('students.published') : t('students.draft')}
                              </Badge>
                            </span>
                            <span>
                              {t("students.publication_date")}: {app.status === 'publicado'
                                ? new Date(app.created_at).toLocaleDateString('pt-BR')
                                : '—'
                              }
                            </span>
                            <span>
                              {t("students.last_edit")}: {new Date(app.updated_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        {app.status === 'publicado' && app.slug && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2 shrink-0"
                            onClick={() => window.open(`/${app.slug}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            {t('students.view_app')}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-app-muted text-center py-4">{t("students.no_apps_found")}</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active);
    
    // Filtro de status da Stripe
    let matchesStripeStatus = true;
    if (stripeStatusFilter !== 'all') {
      if (stripeStatusFilter === 'no_stripe') {
        matchesStripeStatus = !user.stripe_subscription_id;
      } else {
        matchesStripeStatus = user.subscription_status === stripeStatusFilter;
      }
    }
    
    return matchesSearch && matchesStatus && matchesStripeStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: 'all' | 'active' | 'inactive') => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleStripeStatusFilterChange = (value: 'all' | 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'no_stripe') => {
    setStripeStatusFilter(value);
    setCurrentPage(1);
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
    <Card className="bg-app-surface border-app-border p-3 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">{t('admin.students.title')}</h2>
            <p className="text-sm text-app-muted">{t('admin.students.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            <span className="text-xs sm:text-sm text-app-muted">
              {users.filter(u => u.is_active).length} {t('admin.students.active')}
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-app-muted" />
            <Input
              placeholder={t('admin.students.search')}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-app-surface-hover border-app-border"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-40 bg-app-surface-hover border-app-border">
              <SelectValue placeholder={t("students.filter_by_status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.students.all')}</SelectItem>
              <SelectItem value="active">{t('admin.students.active.filter')}</SelectItem>
              <SelectItem value="inactive">{t('admin.students.inactive')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={stripeStatusFilter} onValueChange={handleStripeStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-48 bg-app-surface-hover border-app-border">
              <SelectValue placeholder={t("students.filter_by_stripe")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('students.stripe_all')}</SelectItem>
              <SelectItem value="active">{t('students.stripe_active')}</SelectItem>
              <SelectItem value="trialing">{t('students.stripe_trialing')}</SelectItem>
              <SelectItem value="past_due">{t('students.stripe_past_due')}</SelectItem>
              <SelectItem value="canceled">{t('students.stripe_canceled')}</SelectItem>
              <SelectItem value="unpaid">{t('students.stripe_unpaid')}</SelectItem>
              <SelectItem value="no_stripe">{t('students.stripe_none')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        <div className="border border-app-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-app-border">
                  <TableHead className="whitespace-nowrap">{t('admin.students.email')}</TableHead>
                  <TableHead className="whitespace-nowrap hidden sm:table-cell">{t('admin.students.phone')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('admin.students.plan')}</TableHead>
                  <TableHead className="whitespace-nowrap hidden md:table-cell">{t('admin.students.apps')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('admin.students.status')}</TableHead>
                  <TableHead className="whitespace-nowrap hidden lg:table-cell">{t('admin.students.created')}</TableHead>
                  <TableHead className="text-right">{t('admin.students.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="border-b border-app-border/50">
                    <TableCell className="font-medium">
                      <div className="min-w-0">
                        <p className="truncate">{user.email}</p>
                        <p className="text-xs text-app-muted sm:hidden truncate">
                          {user.phone || t('students.no_phone')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{user.phone || '—'}</TableCell>
                   
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Select 
                            value={user.plan_id || ''} 
                            onValueChange={(value) => updateUserPlan(user.id, value)}
                          >
                            <SelectTrigger className="h-8 text-xs bg-app-surface-hover border-app-border">
                              <SelectValue>
                                <span className="truncate">{user.plan_name}</span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {plans.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.name} ({plan.app_limit} Apps)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {/* BADGES - NOVO */}
                          {user.payment_method === 'stripe' && (
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              {t("students.stripe")}
                            </Badge>
                          )}
                          {user.payment_method === 'manual' && (
                            <Badge variant="secondary" className="text-xs whitespace-nowrap">
                              {t("students.manual")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-app-muted md:hidden">
                          {user.app_count}/{user.plan_app_limit} apps
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">
                        {user.app_count}/{user.plan_app_limit}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={user.is_active}
                            onCheckedChange={() => toggleUserStatus(user.id, user.is_active)}
                            className="data-[state=checked]:bg-green-500"
                          />
                          <span className="hidden sm:inline text-xs">
                            {user.is_active ? t('students.active') : t('students.inactive')}
                          </span>
                        </div>
                        {renderSubscriptionStatusBadge(user)}
                        {user.cancel_at_period_end && user.subscription_status === 'active' && (
                          <Badge className="text-xs whitespace-nowrap bg-amber-500/20 text-amber-400 border-amber-500/30">
                            {t('students.subscription_canceling')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <UserDetailsDialog user={user} />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                              disabled={deletingUser === user.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-app-surface border-app-border mx-2 sm:mx-0">
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("students.confirm_delete")}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("students.confirm_delete_message")
                                .replace("{email}", user.email)}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0">
                              <AlertDialogCancel disabled={deletingUser === user.id}>
                                {t("students.cancel")}
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteUser(user.id, user.email)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deletingUser === user.id}
                              >
                                {deletingUser === user.id ? t("students.deleting") : t("students.delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-app-muted">{t("students.no_users_found")}</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-app-border">
            <p className="text-sm text-app-muted">
              {t('students.showing')} {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} {t('students.of')} {filteredUsers.length} {t('students.users')}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="bg-app-surface-hover border-app-border"
              >
                {t('students.previous')}
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  // Show first, last, current, and adjacent pages
                  const showPage = page === 1 || 
                                   page === totalPages || 
                                   Math.abs(page - currentPage) <= 1;
                  const showEllipsis = page === 2 && currentPage > 3 || 
                                       page === totalPages - 1 && currentPage < totalPages - 2;
                  
                  if (!showPage && !showEllipsis) return null;
                  if (showEllipsis && !showPage) {
                    return <span key={page} className="px-2 text-app-muted">...</span>;
                  }
                  
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 p-0 ${currentPage === page ? '' : 'bg-app-surface-hover border-app-border'}`}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="bg-app-surface-hover border-app-border"
              >
                {t('students.next')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StudentsPanel;
