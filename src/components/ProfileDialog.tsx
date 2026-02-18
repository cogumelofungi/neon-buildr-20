import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocation } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Trash2, Edit, RefreshCw, RotateCcw, X, AlertTriangle } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUserPlan } from "@/hooks/useUserPlan";
import { usePlanContext } from "@/contexts/PlanContext";
import { useSubscriptionHistory } from "@/hooks/useSubscriptionHistory";
import { useSubscriptionType } from "@/hooks/useSubscriptionType";
import { usePlanManagement } from "@/hooks/usePlanManagement";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { CreditCard, ArrowDown, Clock } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { CancellationDialog } from "@/components/CancellationDialog";

interface ProfileData {
  full_name: string;
  phone: string;
  email: string;
}

interface UserApp {
  id: string;
  nome: string;
  status: string;
  created_at: string;
  updated_at: string;
  slug: string;
}

interface ProfileDialogProps {
  children?: React.ReactNode;
}

export const ProfileDialog = ({ children }: ProfileDialogProps = {}) => {
  const { user } = useAuthContext();
  const { t } = useLanguage();
  const { updateProfile } = useAuthActions();
  const { toast } = useToast();
  const { planName, hasActivePlan, isLoading: loadingPlan } = useUserPlan();
  const { refresh: refreshPlan } = usePlanContext();
  const { hasEverSubscribed, isLoading: loadingHistory } = useSubscriptionHistory();
  const { isStripeCustomer, isManualCustomer, isLoading: loadingSubscriptionType } = useSubscriptionType();
  const { canDowngrade } = usePlanManagement();
  const { cancel_at_period_end, subscription_end, openCustomerPortal, reactivateSubscription, refresh: refreshStripeSubscription } = useStripeSubscription();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSimpleDeleteConfirm, setShowSimpleDeleteConfirm] = useState(false);
  const [userApps, setUserApps] = useState<UserApp[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [isDeletingApp, setIsDeletingApp] = useState(false);
  const [appToDelete, setAppToDelete] = useState<UserApp | null>(null);
  const [showDeleteAppConfirm, setShowDeleteAppConfirm] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (user && isOpen) {
      fetchProfile();
      fetchUserApps();
    }
  }, [user, isOpen]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        return;
      }

      // Se não existe registro na tabela profiles, criar um
      if (!data) {
        const phoneFromMetadata = user.user_metadata?.phone || "";
        const fullNameFromMetadata = user.user_metadata?.full_name || user.user_metadata?.display_name || "";
        
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email || "",
            full_name: fullNameFromMetadata,
            phone: phoneFromMetadata
          });

        if (insertError) {
          console.error("Erro ao criar perfil:", insertError);
        }

        setProfile({
          full_name: fullNameFromMetadata,
          phone: phoneFromMetadata,
          email: user.email || "",
        });
        return;
      }

      // Buscar o telefone tanto da tabela profiles quanto do user metadata
      const phoneFromProfiles = data.phone || "";
      const phoneFromMetadata = user.user_metadata?.phone || "";
      const fullNameFromProfiles = data.full_name || "";
      const fullNameFromMetadata = user.user_metadata?.full_name || user.user_metadata?.display_name || "";
      
      setProfile({
        full_name: fullNameFromProfiles || fullNameFromMetadata,
        phone: phoneFromProfiles || phoneFromMetadata,
        email: user.email || "",
      });
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    }
  };

  const fetchUserApps = async () => {
    if (!user) return;

    setIsLoadingApps(true);
    try {
      const { data, error } = await supabase
        .from("apps")
        .select("id, nome, status, created_at, updated_at, slug")
        .eq("user_id", user.id)
        .eq("status", "publicado")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar apps:", error);
        return;
      }

      setUserApps(data || []);
    } catch (error) {
      console.error("Erro ao buscar apps:", error);
    } finally {
      setIsLoadingApps(false);
    }
  };

  const handleEditApp = async (appId: string) => {
    try {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .eq("id", appId)
        .single();

      if (error || !data) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do app.",
          variant: "destructive",
        });
        return;
      }

      // Criar o event customizado para carregar o app no builder
      const loadAppEvent = new CustomEvent('loadAppForEdit', {
        detail: data
      });
      
      window.dispatchEvent(loadAppEvent);
      
      toast({
        title: t("toast.profile.app_loaded"),
        description: t("toast.profile.app_loaded_description"),
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao carregar app:", error);
      toast({
        title: t("toast.profile.error"),
        description: t("toast.profile.error_internal"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteApp = async () => {
    if (!appToDelete) return;

    setIsDeletingApp(true);
    try {
      const { error } = await supabase
        .from("apps")
        .delete()
        .eq("id", appToDelete.id);

      if (error) {
        throw error;
      }

      toast({
        title: t("toast.profile.app_deleted") || "App excluído",
        description: t("toast.profile.app_deleted_description") || "O app foi excluído com sucesso.",
      });

      // Atualizar a lista de apps
      setUserApps(userApps.filter(app => app.id !== appToDelete.id));
      setShowDeleteAppConfirm(false);
      setAppToDelete(null);
      
      // Disparar evento customizado para atualizar o limite de apps em outros componentes
      window.dispatchEvent(new CustomEvent('app-deleted'));
    } catch (error) {
      console.error("Erro ao excluir app:", error);
      toast({
        title: t("toast.profile.error"),
        description: t("toast.profile.delete_app_error") || "Erro ao excluir o app.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingApp(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await updateProfile({
        full_name: profile.full_name,
        phone: profile.phone,
      });
      
      toast({
        title: t("toast.profile.updated"),
        description: t("toast.profile.updated_description"),
      });
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: t("toast.profile.error"),
        description: t("toast.profile.update_error"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async (reason: string, feedback: string) => {
    if (!user) throw new Error("User not authenticated");

    setIsCancellingSubscription(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session?.access_token) {
        throw new Error(t("error.session_expired"));
      }

      // Primeiro, cancelar no Stripe (isso é o mais importante)
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        console.error('Erro na chamada da edge function:', error);
        throw new Error(t("error.server_communication"));
      }

      if (!data?.success) {
        console.error('Edge function retornou erro:', data?.error);
        throw new Error(data?.error || t("error.cancel_subscription_failed"));
      }

      // Somente salvar feedback DEPOIS do cancelamento bem-sucedido no Stripe
      const { error: feedbackError } = await supabase
        .from('cancellation_feedback' as any)
        .insert({
          user_id: user.id,
          user_email: user.email,
          reason: reason,
          feedback: feedback,
        } as any);

      if (feedbackError) {
        console.error('Erro ao salvar feedback:', feedbackError);
        // Continua mesmo se falhar o salvamento do feedback (cancelamento já foi feito)
      }

      toast({
        title: t("toast.profile.subscription_canceled"),
        description: data.message || t("toast.profile.subscription_canceled_description"),
      });

      // Refresh subscription status
      await refreshPlan();
      await refreshStripeSubscription();
    } catch (error) {
      console.error("Erro ao cancelar assinatura:", error);
      toast({
        title: t("toast.profile.error"),
        description: error instanceof Error ? error.message : t("toast.profile.cancel_error"),
        variant: "destructive",
      });
      // Re-throw para que o CancellationDialog saiba que falhou
      throw error;
    } finally {
      setIsCancellingSubscription(false);
    }
  };

  const [isReactivating, setIsReactivating] = useState(false);

  const handleReactivateSubscription = async () => {
    setIsReactivating(true);
    try {
      const result = await reactivateSubscription();
      
      if (result.success) {
        toast({
          title: t("toast.profile.subscription_reactivated") || "Assinatura reativada!",
          description: t("toast.profile.subscription_reactivated_description") || "Sua assinatura foi reativada com sucesso.",
        });
        await refreshPlan();
        await refreshStripeSubscription();
      } else {
        toast({
          title: t("toast.profile.error"),
          description: result.error || t("toast.profile.reactivate_error") || "Erro ao reativar assinatura",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao reativar assinatura:", error);
      toast({
        title: t("toast.profile.error"),
        description: t("toast.profile.reactivate_error") || "Erro ao reativar assinatura",
        variant: "destructive",
      });
    } finally {
      setIsReactivating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      console.log('Iniciando exclusão da conta própria...');
      
      // Obter sessão atual
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session?.access_token) {
        throw new Error(t("error.session_expired"));
      }

      // Call the edge function to delete account completely
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      console.log('Resposta da edge function:', { data, error });

      if (error) {
        console.error('Erro na chamada da edge function:', error);
        throw new Error(t("error.server_communication"));
      }

      if (!data?.success) {
        console.error('Edge function retornou erro:', data?.error);
        throw new Error(data?.error || t("error.delete_account_failed"));
      }

      console.log('Conta excluída com sucesso, fazendo logout...');
      
      // Sign out the user
      await supabase.auth.signOut();
      
      toast({
        title: t("toast.profile.account_deleted"),
        description: t("toast.profile.account_deleted_description"),
      });
      
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      toast({
        title: t("toast.profile.error"),
        description: t("toast.profile.delete_error"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccountWithSubscriptionCheck = async () => {
    // If user has active subscription that is NOT already canceled, show warning modal
    if (hasActivePlan && !cancel_at_period_end) {
      setShowDeleteConfirm(true);
      return;
    }
    
    // If no active subscription or subscription already canceled, show simple confirmation
    setShowSimpleDeleteConfirm(true);
  };

  const handleConfirmDeleteWithSubscription = async () => {
    setShowDeleteConfirm(false);
    await handleDeleteAccount();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <User className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("profile.title")}</DialogTitle>
          <DialogDescription>
            {t("profile.subtitle")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Seção de Informações Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("profile.personal_info")}</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  {t("profile.email")}
                </Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="col-span-3 bg-muted"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="full_name" className="text-right">
                  {t("profile.name")}
                </Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  {t("profile.phone")}
                </Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="+55 (11) 99999-9999"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção de Assinatura */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("profile.my_subscription")}</h3>
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {t("profile.plan")} {planName || t("profile.free")}
                  </CardTitle>
                  <Badge variant={hasActivePlan ? "default" : "secondary"}>
                    {hasActivePlan ? t("profile.active") : t("profile.free")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {loadingPlan ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : planName === "Empresarial" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("profile.max_plan_message")}
                      </span>
                      <Badge variant="default">{t("profile.max_plan_badge")}</Badge>
                    </div>
                    
                    {/* Opção de Downgrade para plano Empresarial */}
                    {canDowngrade && (
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                            {t("profile.downgrade_question")}
                          </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open('/suporte', '_blank')}
                          className="h-8"
                        >
                          <ArrowDown className="h-3 w-3 mr-1" />
                          {t("profile.contact_support")}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {planName === "Profissional" ? t("profile.upgrade_to_business") : t("profile.upgrade_message")}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => window.open('/pricing', '_blank')}
                        className="h-8"
                      >
                        {t("profile.upgrade_button")}
                      </Button>
                    </div>
                    
                    {/* Opção de Downgrade */}
                    {canDowngrade && (
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                          {t("profile.downgrade_question")}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open('/suporte', '_blank')}
                          className="h-8"
                        >
                          <ArrowDown className="h-3 w-3 mr-1" />
                          {t("profile.contact_support")}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Informação de período da assinatura ativa */}
                {hasActivePlan && subscription_end && !cancel_at_period_end && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                          Próxima renovação
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Sua assinatura renova automaticamente em{" "}
                          <strong>
                            {new Date(subscription_end).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Indicador de Cancelamento Pendente */}
                {hasActivePlan && cancel_at_period_end && subscription_end && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                          {t("cancellation.step3.title")}
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                          {t("cancellation.step3.access_until")}{" "}
                          <strong>
                            {new Date(subscription_end).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </strong>
                        </p>
                        <Button
                          size="sm"
                          onClick={handleReactivateSubscription}
                          disabled={isReactivating}
                          className="h-8 gap-2"
                        >
                          {isReactivating ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <RotateCcw className="h-3 w-3" />
                          )}
                          {isReactivating ? "Reativando..." : t("cancellation.step3.reactivate_button")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* CTA de Renovação para ex-assinantes */}
                {!hasActivePlan && hasEverSubscribed && !loadingHistory && (
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          {t("profile.renew_subscription")}
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-300">
                          {t("profile.renew_subscription_message")}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => window.open('/pricing', '_blank')}
                        className="h-8 bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        {t("profile.renew_button")}
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Botão Cancelar Assinatura - APENAS PARA CLIENTES STRIPE (esconde quando cancelamento pendente) */}
                {hasActivePlan && isStripeCustomer && !loadingSubscriptionType && !cancel_at_period_end && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t("profile.manage_subscription")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("profile.cancel_anytime")}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCancelConfirm(true)}
                        className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        <X className="h-3 w-3 mr-1" />
                        {t("profile.cancel_subscription")}
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Aviso para clientes manuais */}
                {hasActivePlan && isManualCustomer && !loadingSubscriptionType && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                        {t("profile.manual_plan_title")}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-300">
                        {t("profile.manual_plan_message")}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('/suporte', '_blank')}
                        className="mt-2 h-7 text-xs"
                      >
                        {t("profile.contact_support")}
                      </Button>
                    </div>
                  </div>
                )}
                
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Seção de Apps Publicados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t("profile.my_apps")}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUserApps}
                disabled={isLoadingApps}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingApps ? 'animate-spin' : ''}`} />
                {t("profile.refresh")}
              </Button>
            </div>
            
            {isLoadingApps ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : userApps.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {userApps.map((app) => (
                  <Card key={app.id} className="border border-border">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{app.nome}</CardTitle>
                        <Badge variant="secondary">
                          {app.status === 'publicado' ? t("profile.published") : app.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {t("profile.created_at")} {new Date(app.created_at).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t("profile.updated_at")} {new Date(app.updated_at).toLocaleDateString('pt-BR')}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditApp(app.id)}
                            className="h-8"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            {t("profile.edit")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/${app.slug}`, '_blank')}
                            className="h-8"
                          >
                            {t("profile.view_app")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAppToDelete(app);
                              setShowDeleteAppConfirm(true);
                            }}
                            className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("profile.no_apps")}</p>
                <p className="text-sm">{t("profile.no_apps_message")}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Seção de Exclusão de Conta */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-destructive">{t("profile.danger_zone")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("profile.delete_warning")}
            </p>
            
            <Button
              variant="outline"
              disabled={isDeleting}
              className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={handleDeleteAccountWithSubscriptionCheck}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              {isDeleting ? t("profile.deleting") : t("profile.delete_account")}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? t("profile.saving") : t("profile.save")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Modal de Cancelamento Multi-etapas */}
      <CancellationDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        onConfirmCancel={handleCancelSubscription}
        onReactivate={handleReactivateSubscription}
        isCancelling={isCancellingSubscription}
        subscriptionEnd={subscription_end}
        isCancelled={cancel_at_period_end}
      />

      {/* Modal de Confirmação para Exclusão de Conta com Assinatura Ativa */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              {t("profile.active_subscription_detected")}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div>
                  ⚠️ {t("profile.must_cancel_first")}
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded">
                  <div className="text-sm text-orange-800 dark:text-orange-200">
                    <div className="font-semibold mb-1">{t("profile.what_will_happen")}:</div>
                    <div>• {t("profile.subscription_auto_cancel")}</div>
                    <div>• {t("profile.data_permanent_delete")}</div>
                    <div>• {t("profile.action_irreversible")}</div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-col sm:flex-row gap-2">
                <AlertDialogCancel className="flex-1" disabled={isDeleting}>
                  {t("common.cancel")}
                </AlertDialogCancel>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setShowCancelConfirm(true);
                  }}
                  className="flex-1"
                  disabled={isDeleting}
                >
                  {t("profile.only_cancel_subscription")}
                </Button>
              </div>
              <AlertDialogAction 
                onClick={handleConfirmDeleteWithSubscription}
                disabled={isDeleting}
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? t("profile.deleting") : t("profile.cancel_and_delete")}
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Confirmação Simples para Exclusão de Conta */}
      <AlertDialog open={showSimpleDeleteConfirm} onOpenChange={setShowSimpleDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t("profile.confirm_delete_title")}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div>
                  {t("profile.confirm_delete_message")}
                </div>
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded">
                  <div className="text-sm text-destructive">
                    <div className="font-semibold mb-1">{t("profile.what_will_happen")}:</div>
                    <div>• {t("profile.all_apps_deleted")}</div>
                    <div>• {t("profile.data_permanent_delete")}</div>
                    <div>• {t("profile.action_irreversible")}</div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("profile.deleting") : t("profile.confirm_delete_account")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Confirmação para Exclusão de App */}
      <AlertDialog open={showDeleteAppConfirm} onOpenChange={setShowDeleteAppConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              {t("profile.delete_app_title") || "Excluir app"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("profile.delete_app_message") || "Tem certeza que deseja excluir o app"} <strong>"{appToDelete?.nome}"</strong>? {t("profile.action_irreversible") || "Esta ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingApp}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteApp}
              disabled={isDeletingApp}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingApp ? t("profile.deleting") : t("profile.delete") || "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
