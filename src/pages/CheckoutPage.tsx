import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check, Sun, Moon, Globe, LogOut } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/auth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { useUserPlan } from "@/hooks/useUserPlan";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, isAuthenticated, signOut } = useAuthState();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { hasActivePlan } = useUserPlan();
  const planParam = searchParams.get('plan');
  const billingParam = searchParams.get('billing') || 'monthly';
  const isAnnual = billingParam === 'annual';
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plansData = {
      "8851ac57-8aa3-450b-8fda-c13f1f064efa": {
        name: t("pricing.plan.essencial"),
        monthlyPrice: 47,
        annualPrice: 470,
        monthlyEquivalent: 39.16,
        description: t("pricing.plan.essencial.description"),
        appLimit: t("pricing.plan.essencial.apps"),
        pdfLimit: t("pricing.plan.essencial.pdfs"),
        planId: "8851ac57-8aa3-450b-8fda-c13f1f064efa",
        features: [
          t("pricing.features.customization"),
          t("pricing.features.multi_language"),
          t("pricing.features.real_time_updates"),
          t("pricing.features.unlimited_users"),
          t("pricing.features.email_support")
        ]
      },
      "2e93cc7a-5800-4bf3-8a18-7a1cffbe521c": {
        name: t("pricing.plan.profissional"), 
        monthlyPrice: 97,
        annualPrice: 970,
        monthlyEquivalent: 80.83,
        description: t("pricing.plan.profissional.description"),
        appLimit: t("pricing.plan.profissional.apps"),
        pdfLimit: t("pricing.plan.profissional.pdfs"),
        planId: "2e93cc7a-5800-4bf3-8a18-7a1cffbe521c",
        features: [
          t("pricing.features.customization"),
          t("pricing.features.multi_language"),
          t("pricing.features.real_time_updates"),
          t("pricing.features.unlimited_users"),
          t("pricing.features.email_support"),
          t("pricing.features.whatsapp_support"),
          t("pricing.features.push_notifications"),
          t("pricing.features.internal_chat"),
          t("pricing.features.integrations"),
          t("pricing.features.import_apps")
        ]
      },
      "21c9894c-279a-4152-bc18-65309448f5cf": {
        name: t("pricing.plan.empresarial"),
        monthlyPrice: 197,
        annualPrice: 1970,
        monthlyEquivalent: 164.16,
        description: t("pricing.plan.empresarial.description"),
        appLimit: t("pricing.plan.empresarial.apps"),
        pdfLimit: t("pricing.plan.empresarial.pdfs"),
        planId: "21c9894c-279a-4152-bc18-65309448f5cf",
        features: [
          t("pricing.features.customization"),
          t("pricing.features.multi_language"),
          t("pricing.features.real_time_updates"),
          t("pricing.features.unlimited_users"),
          t("pricing.features.email_support"),
          t("pricing.features.whatsapp_support"),
          t("pricing.features.push_notifications"),
          t("pricing.features.internal_chat"),
          t("pricing.features.integrations"),
          t("pricing.features.import_apps"),
          t("pricing.features.video_player"),
          t("pricing.features.custom_domain"),
          t("pricing.features.premium_templates")
        ]
      }
  };

  const getDisplayPrice = (plan) => {
    if (isAnnual) {
      return `R$${plan.annualPrice}`;
    }
    return `R$${plan.monthlyPrice}`;
  };

  const getPeriod = () => {
    return isAnnual ? t("checkout.price.annual") : t("checkout.price.monthly");
  };

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!isAuthenticated) {
      navigate('/pricing');
      return;
    }

    if (!planParam || !plansData[planParam]) {
      navigate('/pricing');
      return;
    }
    setSelectedPlan(plansData[planParam]);
  }, [planParam, navigate, isAuthenticated]);

  const handleStartPayment = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: selectedPlan.planId,
          billingCycle: isAnnual ? 'yearly' : 'monthly',
        },
      });

      if (error) throw new Error(error.message || 'Erro ao iniciar checkout');
      if (!data?.url) throw new Error('URL de checkout não retornada');

      // Abre o checkout da Stripe na mesma guia
      window.location.href = data.url as string;
    } catch (err) {
      console.error('Erro ao criar sessão de checkout:', err);
      toast({
        title: t('checkout.error.title'),
        description: t('checkout.error.description'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToPricing = () => {
    navigate('/pricing');
  };

  const handleBackToApp = () => {
    navigate('/app');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/pricing');
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-6 pb-12 px-4">
      {/* Header actions - same as pricing page */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center gap-3 mb-8">
          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 px-3 flex items-center gap-2"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Language Selector - always visible */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 px-3 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">{t("header.language")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background z-50">
              <DropdownMenuItem onClick={() => setLanguage("pt")}>{t("header.language.pt")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("en")}>{t("header.language.en")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("es")}>{t("header.language.es")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Spacer to push auth buttons to the right */}
          <div className="flex-1" />

          {/* Authenticated user buttons */}
          {isAuthenticated && (
            <>
              {hasActivePlan && (
                <Button onClick={handleBackToApp} variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="sm:hidden">{t("checkout.back.short")}</span>
                  <span className="hidden sm:inline">{t("pricing.back_to_app")}</span>
                </Button>
              )}
              <Button onClick={handleLogout} variant="outline" size="sm" className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                {t("pricing.logout")}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t("checkout.title")}
          </h1>
          <div className="text-lg text-muted-foreground max-w-3xl mx-auto space-y-1">
            <p>{t("checkout.subtitle.line1")}</p>
            <p className="font-medium text-foreground">{t("checkout.subtitle.line2")}</p>
            <p>
              {isAnnual 
                ? t("checkout.subtitle.line3.annual").replace("{price}", String(selectedPlan.monthlyPrice * 10))
                : t("checkout.subtitle.line3.monthly").replace("{price}", String(selectedPlan.monthlyPrice))
              }
            </p>
          </div>
        </div>

        {/* Plan Summary Card */}
        <Card className="relative p-10 transition-all duration-300 bg-card dark:bg-gray-800/50 dark:border dark:border-gray-700 border-border hover:border-primary/50 hover:shadow-xl mb-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2 text-foreground">
              {selectedPlan.name}
            </h3>
            <p className="text-sm mb-4 text-muted-foreground">
              {selectedPlan.appLimit}
            </p>

            <div className="flex flex-col items-center">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-foreground">
                  {getDisplayPrice(selectedPlan)}
                </span>
                <span className="text-xl text-muted-foreground">
                  {getPeriod()}
                </span>
              </div>
              {isAnnual && (
                <p className="text-sm mt-1 text-muted-foreground">
                  {t("checkout.price.equivalent")} R${selectedPlan.monthlyEquivalent?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}{t("checkout.price.monthly")}
                </p>
              )}
            </div>
          </div>

          <Button 
            onClick={handleStartPayment}
            disabled={isProcessing}
            className="w-full mb-8 px-3 py-2 text-lg h-auto font-semibold transition-all bg-[#2054DE] text-white hover:bg-[#2054DE]/90 hover:shadow-lg"
          >
            {isProcessing ? t("checkout.processing") : t("checkout.subscribe.button")}
          </Button>

          <div className="border-t border-border mb-6"></div>

          <div className="space-y-4">
            {selectedPlan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-500" />
                <span className="text-base text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Back to Pricing */}
        <div className="text-center">
          <Button 
            onClick={handleBackToPricing}
            variant="ghost"
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("checkout.back.button")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
