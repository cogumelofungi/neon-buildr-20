import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, CreditCard, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserPlan } from "@/hooks/useUserPlan";
import { usePlanContext } from "@/contexts/PlanContext";
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { t } = useLanguage();
  const { planName, hasActivePlan, isLoading } = useUserPlan();
  const { refresh } = usePlanContext();

useEffect(() => {
  // Apenas refresh do contexto (dados já foram salvos pelo webhook)
  const timer = setTimeout(() => {
    console.log('🔄 [PaymentSuccess] Atualizando contexto...');
    refresh();
  }, 1000);
  return () => clearTimeout(timer);
}, [refresh]);

  const { language } = useLanguage();
  
  const formatDate = (dateString) => {
    const locale = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'BRL') => {
    const locale = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          {/* Ícone animado */}
          <div className="relative mx-auto w-32 h-32 mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-neon opacity-20 animate-pulse"></div>
            <div className="absolute inset-4 rounded-full bg-card border-2 border-border flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-primary animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t("payment_success.title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {hasActivePlan && planName 
              ? `Você assinou o plano ${planName} com sucesso!`
              : t("payment_success.subtitle")
            }
          </p>
        </div>

        {/* Subscription Details */}
        {hasActivePlan && (
          <Card className="mb-8 mx-auto max-w-md text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                {planName}
              </CardTitle>
              <CardDescription>
                Sua assinatura foi ativada com sucesso
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          <Button 
            onClick={() => navigate('/app')}  
            className="w-full sm:w-auto h-12 text-lg font-semibold px-8"
            size="lg"
          >
            {t("payment_success.access_app")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
