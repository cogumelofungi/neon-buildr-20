import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Check, X, Crown, Globe, LogOut, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import { AuthDialog } from "@/components/AuthDialog";
import { EditorProvider } from '@/contexts/EditorContext';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditableElement } from '@/components/editor/EditableElement';
import { useEditor } from '@/contexts/EditorContext';
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PricingPage = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string>("");
  const { t, setLanguage } = useLanguage();
  const { isAuthenticated, signOut } = useAuthContext();
  const { planName, hasActivePlan } = useUserPlan();
  const { theme, setTheme } = useTheme();

  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const plans = [
    {
      id: "essencial",
      nameKey: "pricing.plan.essencial",
      subtitle: language === "pt" ? "Ideal para quem está começando" : language === "en" ? "Ideal for beginners" : "Ideal para principiantes",
      monthlyPrice: 47,
      annualPrice: 470,
      monthlyEquivalent: 39.16,
      originalMonthlyPrice: 97,
      originalAnnualPrice: 1164,
      appLimitKey: "pricing.plan.essencial.apps",
      features: [
        { name: language === "pt" ? "Transforme seu eBook em app profissional em 3 minutos" : language === "en" ? "Transform your eBook into a professional app in 3 minutes" : "Transforma tu eBook en app profesional en 3 minutos", included: true },
        { name: language === "pt" ? "Cliente acessa com 1 clique (sem cadastro, sem senha)" : language === "en" ? "Customer accesses with 1 click (no registration, no password)" : "Cliente accede con 1 clic (sin registro, sin contraseña)", included: true },
        { name: language === "pt" ? "Até 10 eBooks/PDFs + áudios por app (cada PDF até 200 páginas)" : language === "en" ? "Up to 10 eBooks/PDFs + audios per app (each PDF up to 200 pages)" : "Hasta 10 eBooks/PDFs + audios por app (cada PDF hasta 200 páginas)", included: true },
        { name: language === "pt" ? "Usuários finais ilimitados (venda para quantos quiser)" : language === "en" ? "Unlimited end users (sell to as many as you want)" : "Usuarios finales ilimitados (vende a cuantos quieras)", included: true },
        { name: language === "pt" ? "Atualize o conteúdo sem reenviar nada para os clientes" : language === "en" ? "Update content without resending anything to customers" : "Actualiza el contenido sin reenviar nada a los clientes", included: true },
        { name: language === "pt" ? "Funciona em Android, iOS e Web (compatibilidade total)" : language === "en" ? "Works on Android, iOS and Web (full compatibility)" : "Funciona en Android, iOS y Web (compatibilidad total)", included: true },
      ],
      planId: "8851ac57-8aa3-450b-8fda-c13f1f064efa",
      highlight: false,
    },
    {
      id: "profissional",
      nameKey: "pricing.plan.profissional",
      subtitle: language === "pt" ? "Para quem já vende e quer escalar" : language === "en" ? "For those who sell and want to scale" : "Para quienes ya venden y quieren escalar",
      monthlyPrice: 97,
      annualPrice: 970,
      monthlyEquivalent: 80.83,
      originalMonthlyPrice: 197,
      originalAnnualPrice: 2364,
      appLimitKey: "pricing.plan.profissional.apps",
      features: [
        { name: language === "pt" ? "Tudo do Essencial +" : language === "en" ? "Everything from Essential +" : "Todo del Esencial +", included: true, isBold: true },
        { name: language === "pt" ? "Até 15 eBooks/PDFs + áudios por app (cada PDF até 200 páginas)" : language === "en" ? "Up to 15 eBooks/PDFs + audios per app (each PDF up to 200 pages)" : "Hasta 15 eBooks/PDFs + audios por app (cada PDF hasta 200 páginas)", included: true },
        { name: language === "pt" ? "Botão de WhatsApp integrado (suporte direto ou vendas no app)" : language === "en" ? "Integrated WhatsApp button (direct support or sales in the app)" : "Botón de WhatsApp integrado (soporte directo o ventas en la app)", included: true },
        { name: language === "pt" ? "Notificações push para reengajar clientes" : language === "en" ? "Push notifications to re-engage customers" : "Notificaciones push para reenganchar clientes", included: true },
        { name: language === "pt" ? "Integração nativa com Hotmart, Kiwify, Monetizze e outras" : language === "en" ? "Native integration with Hotmart, Kiwify, Monetizze and others" : "Integración nativa con Hotmart, Kiwify, Monetizze y otras", included: true },
      ],
      planId: "2e93cc7a-5800-4bf3-8a18-7a1cffbe521c",
      highlight: true,
    },
    {
      id: "empresarial",
      nameKey: "pricing.plan.empresarial",
      subtitle: language === "pt" ? "Para alto volume de vendas" : language === "en" ? "For high volume sales" : "Para alto volumen de ventas",
      monthlyPrice: 197,
      annualPrice: 1970,
      monthlyEquivalent: 164.16,
      originalMonthlyPrice: 397,
      originalAnnualPrice: 4764,
      appLimitKey: "pricing.plan.empresarial.apps",
      features: [
        { name: language === "pt" ? "Tudo do Profissional +" : language === "en" ? "Everything from Professional +" : "Todo del Profesional +", included: true, isBold: true },
        { name: language === "pt" ? "Até 20 eBooks/PDFs + áudios por app (cada PDF até 200 páginas)" : language === "en" ? "Up to 20 eBooks/PDFs + audios per app (each PDF up to 200 pages)" : "Hasta 20 eBooks/PDFs + audios por app (cada PDF hasta 200 páginas)", included: true },
        { name: language === "pt" ? "Vídeos integrados no app (aulas, tutoriais direto no aplicativo)" : language === "en" ? "Integrated videos in the app (classes, tutorials directly in the app)" : "Videos integrados en la app (clases, tutoriales directo en la aplicación)", included: true },
        { name: language === "pt" ? "Upsell e Order Bump dentro do app (venda mais dentro do aplicativo)" : language === "en" ? "Upsell and Order Bump inside the app (sell more within the app)" : "Upsell y Order Bump dentro de la app (vende más dentro de la app)", included: true },
        { name: language === "pt" ? "Templates premium exclusivos (visual de app de R$ 10k+)" : language === "en" ? "Exclusive premium templates ($2k+ app visuals)" : "Templates premium exclusivos (visual de app de $2k+)", included: true },
        { name: language === "pt" ? "Domínio personalizado com sua marca (app.suamarca.com)" : language === "en" ? "Custom domain with your brand (app.yourbrand.com)" : "Dominio personalizado con tu marca (app.tumarca.com)", included: true },
      ],
      planId: "21c9894c-279a-4152-bc18-65309448f5cf",
      highlight: false,
    },
  ];

  const getPrice = (plan: any) => {
    if (isAnnual) {
      return `R$${plan.annualPrice}`;
    }
    return `R$${plan.monthlyPrice}`;
  };

  // Função para determinar se um plano está disponível para upgrade
  const isPlanAvailable = (plan: any) => {
    if (!hasActivePlan) {
      // Usuário gratuito pode fazer upgrade para qualquer plano pago
      return true;
    }

    // Mapear nomes dos planos para comparação (sempre em português, independente do idioma da UI)
    const currentPlanName = planName?.toLowerCase();
    // Extrair nome fixo do plano (sem tradução) do nameKey
    const targetPlanName = plan.nameKey.replace("pricing.plan.", "");

    // Plano Essencial: pode fazer upgrade para Profissional ou Empresarial
    if (currentPlanName === "essencial") {
      return targetPlanName === "profissional" || targetPlanName === "empresarial";
    }

    // Plano Profissional: pode fazer upgrade apenas para Empresarial
    if (currentPlanName === "profissional") {
      return targetPlanName === "empresarial";
    }

    // Plano Empresarial: não pode fazer upgrade (plano máximo)
    if (currentPlanName === "empresarial") {
      return false;
    }

    return false;
  };

  // Função para determinar se é o plano atual do usuário
  const isCurrentPlan = (plan: any) => {
    if (!hasActivePlan) return false;
    const currentPlanName = planName?.toLowerCase();
    // Extrair nome fixo do plano (sem tradução) do nameKey
    const targetPlanName = plan.nameKey.replace("pricing.plan.", "");
    return currentPlanName === targetPlanName;
  };

  const getPeriod = () => {
    return isAnnual ? t("pricing.per_year") : t("pricing.per_month");
  };

  const handleSubscribe = async (plan: any) => {
    // Verificar se o plano está disponível
    if (!isPlanAvailable(plan)) {
      return;
    }

    if (!isAuthenticated) {
      setPendingPlanId(plan.planId);
      setShowAuthDialog(true);
      return;
    }

    // Usuário logado - ir direto para checkout do Stripe
    setIsLoading(plan.planId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t("pricing.error.session"));
        setIsLoading(null);
        return;
      }

      const billingCycle = isAnnual ? "yearly" : "monthly";
      const response = await supabase.functions.invoke("create-checkout", {
        body: { planId: plan.planId, billingCycle },
      });

      if (response.error) {
        console.error("Error creating checkout:", response.error);
        toast.error(t("pricing.error.checkout"));
        setIsLoading(null);
        return;
      }

      const { url } = response.data;
      if (url) {
        window.location.href = url;
      } else {
        toast.error(t("pricing.error.checkout"));
        setIsLoading(null);
      }
    } catch (error) {
      console.error("Error in handleSubscribe:", error);
      toast.error(t("pricing.error.checkout"));
      setIsLoading(null);
    }
  };

  const handleAuthSuccess = async () => {
    if (pendingPlanId) {
      // Após login, criar checkout do Stripe
      setIsLoading(pendingPlanId);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error(t("pricing.error.session"));
          setIsLoading(null);
          return;
        }

        const billingCycle = isAnnual ? "yearly" : "monthly";
        const response = await supabase.functions.invoke("create-checkout", {
          body: { planId: pendingPlanId, billingCycle },
        });

        if (response.error) {
          console.error("Error creating checkout:", response.error);
          toast.error(t("pricing.error.checkout"));
          setIsLoading(null);
          return;
        }

        const { url } = response.data;
        if (url) {
          window.location.href = url;
        } else {
          toast.error(t("pricing.error.checkout"));
          setIsLoading(null);
        }
      } catch (error) {
        console.error("Error in handleAuthSuccess:", error);
        toast.error(t("pricing.error.checkout"));
        setIsLoading(null);
      }
      setPendingPlanId("");
    }
  };

  const handleBackToApp = () => {
    navigate("/app");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <EditorProvider pageName="pricing-page">
      <PricingPageContent
        navigate={navigate}
        isAnnual={isAnnual}
        setIsAnnual={setIsAnnual}
        showAuthDialog={showAuthDialog}
        setShowAuthDialog={setShowAuthDialog}
        pendingPlanId={pendingPlanId}
        setPendingPlanId={setPendingPlanId}
        t={t}
        setLanguage={setLanguage}
        isAuthenticated={isAuthenticated}
        signOut={signOut}
        planName={planName}
        hasActivePlan={hasActivePlan}
        plans={plans}
        isLoading={isLoading}
        getPrice={getPrice}
        isPlanAvailable={isPlanAvailable}
        isCurrentPlan={isCurrentPlan}
        getPeriod={getPeriod}
        handleSubscribe={handleSubscribe}
        handleAuthSuccess={handleAuthSuccess}
        handleBackToApp={handleBackToApp}
        handleLogout={handleLogout}
        theme={theme}
        setTheme={setTheme}
      />
    </EditorProvider>
  );
};

const PricingPageContent = ({
  navigate,
  isAnnual,
  setIsAnnual,
  showAuthDialog,
  setShowAuthDialog,
  pendingPlanId,
  setPendingPlanId,
  t,
  setLanguage,
  isAuthenticated,
  signOut,
  planName,
  hasActivePlan,
  plans,
  isLoading,
  getPrice,
  isPlanAvailable,
  isCurrentPlan,
  getPeriod,
  handleSubscribe,
  handleAuthSuccess,
  handleBackToApp,
  handleLogout,
  theme,
  setTheme
}: any) => {
  const { isEditMode, elementStyles, updateElementStyle, isSaving } = useEditor();

  return (
    <>
      <EditorToolbar />
      <div className="min-h-screen bg-background pt-6 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
        {/* Header actions - language selector always visible, other buttons only when authenticated */}
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

        {/* Header */}
        <div className="text-center mb-16">
          <EditableElement
            elementId="pricing-main-title"
            currentStyles={elementStyles['pricing-main-title'] || {}}
            onStyleChange={updateElementStyle}
            isEditMode={isEditMode}
            className="text-5xl font-bold text-foreground mb-6"
          >
            <h1>{t("pricing.title")}</h1>
          </EditableElement>
          <EditableElement
            elementId="pricing-subtitle"
            currentStyles={elementStyles['pricing-subtitle'] || {}}
            onStyleChange={updateElementStyle}
            isEditMode={isEditMode}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            <p>{t("pricing.subtitle")}</p>
          </EditableElement>
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Label
              htmlFor="billing-toggle"
              className={`text-lg ${!isAnnual ? "text-foreground font-semibold" : "text-muted-foreground"}`}
            >
              <EditableElement
                elementId="pricing-label-monthly"
                currentStyles={elementStyles["pricing-label-monthly"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
                className="text-lg"
              >
                {t("pricing.billing.monthly")}
              </EditableElement>
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <Label
              htmlFor="billing-toggle"
              className={`text-lg ${isAnnual ? "text-foreground font-semibold" : "text-muted-foreground"}`}
            >
              <EditableElement
                elementId="pricing-label-annual"
                currentStyles={elementStyles["pricing-label-annual"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
                className="text-lg"
              >
                {t("pricing.billing.annual")}
              </EditableElement>
            </Label>
          {isAnnual && (
            <EditableElement
              elementId="pricing-save-badge"
              currentStyles={elementStyles["pricing-save-badge"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
            >
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                {t("pricing.billing.save")}
              </Badge>
            </EditableElement>
          )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const isAvailable = isPlanAvailable(plan);
            const isCurrent = isCurrentPlan(plan);
            const isMaxPlan = hasActivePlan && planName?.toLowerCase() === "empresarial";

            return (
              <Card
                key={plan.nameKey}
                className={`relative p-10 transition-all duration-300 ${
                  plan.highlight
                    ? "bg-[#2054DE] text-white border-2 border-[#2054DE] shadow-2xl scale-105 hover:scale-[1.06]"
                    : "bg-card dark:bg-gray-800/50 dark:border dark:border-gray-700 border-border hover:border-primary/50 hover:shadow-xl"
                } ${
                  !isAvailable && !isCurrent
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                } ${isCurrent ? "ring-2 ring-primary border-primary" : ""}`}
              >
                {plan.highlight && !isCurrent && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <EditableElement
                      elementId="pricing-badge-popular"
                      currentStyles={elementStyles["pricing-badge-popular"] || {}}
                      onStyleChange={updateElementStyle}
                      isEditMode={isEditMode}
                    >
                      <span className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                        {t("pricing.popular")}
                      </span>
                    </EditableElement>
                  </div>
                )}

              {isCurrent && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <EditableElement
                    elementId="pricing-current-plan-badge"
                    currentStyles={elementStyles["pricing-current-plan-badge"] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                  >
                    <span className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      {t("pricing.current_plan")}
                    </span>
                  </EditableElement>
                </div>
              )}

              {isMaxPlan && t(plan.nameKey).toLowerCase() === "empresarial" && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <EditableElement
                    elementId="pricing-max-plan-badge"
                    currentStyles={elementStyles["pricing-max-plan-badge"] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                  >
                    <span className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      {t("pricing.max_plan")}
                    </span>
                  </EditableElement>
                </div>
              )}

              {plan.badgeKey && !isCurrent && isAvailable && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <EditableElement
                    elementId={`pricing-custom-badge-${plan.nameKey}`}
                    currentStyles={elementStyles[`pricing-custom-badge-${plan.nameKey}`] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                  >
                    <span className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {t(plan.badgeKey)}
                    </span>
                  </EditableElement>
                </div>
              )}

                <div className="text-center mb-8">
                  <EditableElement
                    elementId={`pricing-plan-name-${plan.nameKey}`}
                    currentStyles={elementStyles[`pricing-plan-name-${plan.nameKey}`] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                    className={`text-2xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-foreground"}`}
                  >
                    <h3>{t(plan.nameKey)}</h3>
                  </EditableElement>
                  
                  {/* Subtitle */}
                  <p className={`text-sm mb-4 ${plan.highlight ? "text-white/80" : "text-muted-foreground"}`}>
                    {plan.subtitle}
                  </p>
                  
                  <EditableElement
                    elementId={`pricing-app-limit-${plan.nameKey}`}
                    currentStyles={elementStyles[`pricing-app-limit-${plan.nameKey}`] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                    className="text-sm font-semibold mb-4"
                  >
                    <p className="relative inline-block px-3 py-0.5">
                      <span 
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, #facc15 8%, #facc15 92%, transparent 100%)',
                        }}
                      />
                      <span className="relative z-10 text-black">{t(plan.appLimitKey)}</span>
                    </p>
                  </EditableElement>

                  {/* Original price with discount */}
                  {(() => {
                    const originalPrice = isAnnual ? plan.originalAnnualPrice : plan.originalMonthlyPrice;
                    const currentPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
                    const discountPercent = originalPrice
                      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
                      : 0;
                    return (
                      <p className={`text-sm mb-2 ${plan.highlight ? "text-white/70" : "text-muted-foreground"}`}>
                        <span className="line-through">
                          De R$ {originalPrice?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="ml-2 font-semibold text-green-500">-{discountPercent}%</span>
                      </p>
                    );
                  })()}

                  <div className="flex flex-col items-center">
                    <div className="flex items-baseline justify-center gap-2">
                      <EditableElement
                        elementId={`pricing-plan-price-${plan.nameKey}`}
                        currentStyles={elementStyles[`pricing-plan-price-${plan.nameKey}`] || {}}
                        onStyleChange={updateElementStyle}
                        isEditMode={isEditMode}
                        className={`text-5xl font-bold ${plan.highlight ? "text-white" : "text-foreground"}`}
                      >
                        <span>{getPrice(plan)}</span>
                      </EditableElement>
                      <span className={`text-xl ${plan.highlight ? "text-white/80" : "text-muted-foreground"}`}>
                        {getPeriod()}
                      </span>
                    </div>
                    {isAnnual && (
                      <EditableElement
                        elementId={`pricing-equivalent-${plan.nameKey}`}
                        currentStyles={elementStyles[`pricing-equivalent-${plan.nameKey}`] || {}}
                        onStyleChange={updateElementStyle}
                        isEditMode={isEditMode}
                        className={`text-sm mt-1 ${plan.highlight ? "text-white/70" : "text-muted-foreground"}`}
                      >
                        <p>
                          {t("pricing.equivalent")} R${plan.monthlyEquivalent?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          {t("pricing.per_month")}
                        </p>
                      </EditableElement>
                    )}
                  </div>
                </div>

                <EditableElement
                  elementId={`pricing-button-${plan.planId}`}
                  currentStyles={elementStyles[`pricing-button-${plan.planId}`] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                >
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={!isAvailable || isCurrent || isLoading === plan.planId}
                    className={`w-full mb-2 px-3 py-2 text-xl h-auto font-semibold transition-all ${
                      plan.id === "profissional"
                        ? "bg-white text-black hover:bg-white/90 hover:shadow-lg"
                        : "bg-[#2054DE] text-white hover:bg-[#2054DE]/90 hover:shadow-lg"
                    } ${
                      !isAvailable || isCurrent || isLoading === plan.planId
                        ? "opacity-50 cursor-not-allowed hover:shadow-none"
                        : ""
                    }`}
                  >
                    {isLoading === plan.planId ? (
                      t("pricing.loading")
                    ) : isCurrent ? (
                      t("pricing.current_plan")
                    ) : (
                      t("pricing.start_now")
                    )}
                  </Button>
                </EditableElement>
                
                {/* Cancel anytime text */}
                <p className={`text-sm text-center mb-6 ${plan.highlight ? "text-white/70" : "text-muted-foreground"}`}>
                  {t("pricing.cancel_anytime")}
                </p>
                
                <div className={`border-t ${plan.highlight ? "border-white/20" : "border-border"} mb-6`}></div>


                <div className="space-y-4">
                  {plan.features.map((feature: any, index: number) => (
                    <EditableElement
                      key={index}
                      elementId={`pricing-feature-${plan.id}-${index}`}
                      currentStyles={elementStyles[`pricing-feature-${plan.id}-${index}`] || {}}
                      onStyleChange={updateElementStyle}
                      isEditMode={isEditMode}
                    >
                      <div className="flex items-start gap-3">
                        {feature.included ? (
                          <Check
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlight ? "text-white" : "text-green-500"}`}
                          />
                        ) : (
                          <X
                            className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500"
                          />
                        )}
                        <span className={`text-base ${plan.highlight ? "text-white" : "text-foreground"} ${feature.isBold ? "font-bold" : ""}`}>
                          {feature.name}
                        </span>
                      </div>
                    </EditableElement>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        <AuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          onSuccess={handleAuthSuccess}
          redirectAfterLogin={`/checkout?plan=${pendingPlanId}&billing=${isAnnual ? "annual" : "monthly"}`}
        />
      </div>
    </div>
    </>
  );
};

export default PricingPage;
