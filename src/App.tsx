import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./hooks/useTheme";
import { LanguageProvider } from "./hooks/useLanguage";
import { AuthProvider, useAuthState } from "./hooks/auth";
import { useUserStatus } from "./hooks/useUserStatus";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import InactiveAccount from "./pages/InactiveAccount";
import AppViewer from "./pages/AppViewer";
import PricingPage from "./pages/PricingPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentSuccess from "./pages/PaymentSuccess";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthState();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <AuthenticatedRoute>{children}</AuthenticatedRoute>;
};

const AuthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isActive, isLoading: statusLoading } = useUserStatus();
  
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isActive) {
    return <InactiveAccount />;
  }
  
  // Allow access to /app even without a plan - user can upgrade inside the app
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/app" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/app/:slug" element={<AppViewer />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/inactive" element={<InactiveAccount />} />
                  <Route path="/" element={<Auth />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;