import { useLanguage } from "./hooks/useLanguage";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./hooks/useTheme";
import { LanguageProvider } from "./hooks/useLanguage";
import { AuthProvider, useAuthState, useUserPlan, useAdminAuth, useAuth, useUserStatus } from "./hooks/auth";
import { useMaintenanceMode } from "./hooks/useMaintenanceMode";
import { useFeatureAccess } from "./hooks/useFeatureAccess";
import { PlanProvider } from "./contexts/PlanContext";
import ScriptInjector from "./components/ScriptInjector";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import DomainNotFound from "./pages/DomainNotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPreview from "./pages/AdminPreview";
import InactiveAccount from "./pages/InactiveAccount";
import AppViewer from "./pages/AppViewer";
import PricingPage from "./pages/PricingPage";
import SubscribePage from "./pages/SubscribePage";
import PlanosPage from "./pages/PlanosPage";
import AssinaturaPage from "./pages/AssinaturaPage";
import AccessPage from "./pages/AccessPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import Support from "./pages/Support";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Maintenance from "./pages/Maintenance";
import Player from "./pages/Player";
import Academy from "./pages/Academy";
import SetupPassword from "./pages/SetupPassword";
import ConfigurarSenha from "./pages/ConfigurarSenha";
import ResetPassword from "./pages/ResetPassword";
import SubscriptionConfirmationConsultorio from "./pages/SubscriptionConfirmationConsultorio";
import SubscriptionConfirmationCompleta from "./pages/SubscriptionConfirmationCompleta";
import SocialProofNotification from "./components/SocialProofNotification";
import CustomDomainRouteWrapper from "./components/CustomDomainRouteWrapper";
import { isCustomDomainContext, getCustomDomainAppSlug } from "./utils/customDomainDetection";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

// Componente para decidir o que mostrar na raiz "/" 
// baseado se estamos em domínio customizado ou não
const CustomDomainRootHandler = () => {
  // Detectar se estamos em contexto de domínio customizado
  const customDomainHeader = document.querySelector('meta[name="x-custom-domain"]')?.getAttribute('content');
  const customDomainSlug = document.querySelector('meta[name="x-custom-domain-slug"]')?.getAttribute('content');
  
  // Verificar também o header injetado via Worker
  const isCustomDomain = isCustomDomainContext();
  const appSlug = getCustomDomainAppSlug();
  
  console.log('[CustomDomainRootHandler] Detectando contexto:', { 
    customDomainHeader, 
    customDomainSlug, 
    isCustomDomain, 
    appSlug 
  });
  
  // Se estamos em domínio customizado e temos um slug mapeado
  if (isCustomDomain && appSlug) {
    console.log('[CustomDomainRootHandler] Renderizando AppViewer para slug:', appSlug);
    return <AppViewer />;
  }
  
  // Caso contrário, redirecionar para /assinatura como antes
  return <Navigate to="/assinatura" replace />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthState();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <AuthenticatedRoute>{children}</AuthenticatedRoute>;
};

const AuthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isActive, isLoading: statusLoading } = useUserStatus();
  const { hasActivePlan, planName, isLoading: planLoading } = useUserPlan();
  
  // Wait for both status and plan loading to finish
  if (statusLoading || planLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isActive) {
    return <InactiveAccount />;
  }
  
  console.log('AuthenticatedRoute - Final decision:', { 
    hasActivePlan, 
    planName
  });
  
  // hasActivePlan já verifica se plano não é "Gratuito" (verificação feita no PlanContext)
  // Redirecionar usuários sem plano ativo para /pricing
  if (!hasActivePlan) {
    console.log('Redirecting to /pricing - no active plan');
    return <Navigate to="/pricing" replace />;
  }
  
  console.log('Allowing access to /app');
  return <>{children}</>;
};

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { t } = useLanguage();
  const { isAdmin, isLoading } = useAdminAuth();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { hasWhatsAppSupport, isLoading: planLoading, planName } = useFeatureAccess();
  
  // Hold route until all checks are done
  if (authLoading || isLoading || planLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-app-muted">{t("status.checking_permissions")}</p>
        </div>
      </div>
    );
  }
  
  // Permitir acesso se é admin OU se tem plano Profissional/Empresarial
  const hasAccess = isAdmin || hasWhatsAppSupport;
  
  if (!isAuthenticated || !hasAccess) {
    console.error('❌ Acesso negado ao admin - user:', user?.email, 'isAdmin:', isAdmin, 'planName:', planName);
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

const MaintenanceWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isMaintenanceMode, isLoading } = useMaintenanceMode();
  const location = useLocation();

  // Se está carregando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Rotas que não devem ser afetadas pelo modo de manutenção
  const exemptRoutes = ['/admin', '/assine', '/planos'];
  const isExemptRoute = exemptRoutes.some(route => location.pathname.startsWith(route));

  // Se está em modo de manutenção E não é rota isenta, mostrar página de manutenção
  if (isMaintenanceMode && !isExemptRoute) {
    return <Maintenance />;
  }

  // Caso contrário, renderizar normalmente
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PlanProvider>
          <ThemeProvider>
            <LanguageProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ScriptInjector />
                  <SocialProofNotification />
                  <MaintenanceWrapper>
                    <Routes>
                      {/* Protected routes */}
                      <Route path="/app" element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      } />
                      
                      {/* Admin routes */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin" element={
                        <AdminProtectedRoute>
                          <AdminDashboard />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/admin/preview" element={
                        <AdminProtectedRoute>
                          <AdminPreview />
                        </AdminProtectedRoute>
                      } />
                      
                      {/* Public routes - wrapped to support custom domain paths */}
                      <Route path="/pricing" element={
                        <CustomDomainRouteWrapper><PricingPage /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/assine" element={
                        <CustomDomainRouteWrapper><Navigate to="/assinatura" replace /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/planos" element={
                        <CustomDomainRouteWrapper><Navigate to="/assinatura" replace /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/assinatura" element={
                        <CustomDomainRouteWrapper><AssinaturaPage /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/acesso" element={
                        <CustomDomainRouteWrapper><AccessPage /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/checkout" element={
                        <CustomDomainRouteWrapper><CheckoutPage /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/payment-success" element={
                        <CustomDomainRouteWrapper><PaymentSuccess /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/inactive" element={
                        <CustomDomainRouteWrapper><InactiveAccount /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/suporte" element={
                        <CustomDomainRouteWrapper><Support /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/termos" element={
                        <CustomDomainRouteWrapper><TermsOfService /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/privacidade" element={
                        <CustomDomainRouteWrapper><PrivacyPolicy /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/player" element={
                        <CustomDomainRouteWrapper><Player /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/academy" element={
                        <CustomDomainRouteWrapper><Academy /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/configurar-senha" element={
                        <CustomDomainRouteWrapper><ConfigurarSenha /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/setup-password" element={
                        <CustomDomainRouteWrapper><SetupPassword /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/redefinir-senha" element={
                        <CustomDomainRouteWrapper><ResetPassword /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/finalizada-assinatura-consultorio" element={
                        <CustomDomainRouteWrapper><SubscriptionConfirmationConsultorio /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/finalizada-assinatura-completa" element={
                        <CustomDomainRouteWrapper><SubscriptionConfirmationCompleta /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/auth" element={
                        <CustomDomainRouteWrapper><Auth /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/login" element={
                        <CustomDomainRouteWrapper><Login /></CustomDomainRouteWrapper>
                      } />
                      <Route path="/" element={<CustomDomainRootHandler />} />
                      
                      {/* Published app route - MUST be last to avoid conflicts */}
                      <Route path="/:slug" element={<AppViewer />} />
                      
                      {/* 404 fallback */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </MaintenanceWrapper>
                </BrowserRouter>
              </TooltipProvider>
            </LanguageProvider>
          </ThemeProvider>
        </PlanProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
