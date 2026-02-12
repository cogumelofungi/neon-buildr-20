import { useState, useEffect } from "react";
import VturbPlayer from "@/components/VturbPlayer";
import { useNavigate, Link } from "react-router-dom";
import { useUtmCapture } from "@/hooks/useUtmCapture";
import { initFacebookTracking } from "@/hooks/useFacebookTracking";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Check,
  X,
  Zap,
  Lock,
  Cloud,
  Smartphone,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  Globe,
  Sun,
  Moon,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Bell,
  DollarSign,
  BarChart,
  Palette,
  Menu,
  MessageCircle,
} from "lucide-react";
import { useAuthState } from "@/hooks/auth";
import { AuthDialog } from "@/components/AuthDialog";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { usePlanContext } from "@/contexts/PlanContext";
import { supabase } from "@/integrations/supabase/client";
import { getCheckoutLink, PlanId } from "@/config/stripeCheckoutLinks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ebookMockupBr from "@/assets/ebook-mockup-br.png";
import ebookMockupEn from "@/assets/ebook-mockup-en.png";
import ebookMockupEs from "@/assets/ebook-mockup-es.png";
import appMockupBr from "@/assets/app-mockup-br.png";
import appMockupEn from "@/assets/app-mockup-en.png";
import appMockupEs from "@/assets/app-mockup-es.png";
import appCarousel1 from "@/assets/app-carousel-1.png";
import appCarousel2 from "@/assets/app-carousel-2.png";
import appCarousel3 from "@/assets/app-carousel-3.png";
import appCarousel4 from "@/assets/app-carousel-4.png";
import appCarouselEn1 from "@/assets/app-carousel-en-1.png";
import appCarouselEn2 from "@/assets/app-carousel-en-2.png";
import appCarouselEn3 from "@/assets/app-carousel-en-3.png";
import appCarouselEn4 from "@/assets/app-carousel-en-4.png";
import appCarouselEs1 from "@/assets/app-carousel-es-1.png";
import appCarouselEs2 from "@/assets/app-carousel-es-2.png";
import appCarouselEs3 from "@/assets/app-carousel-es-3.png";
import appCarouselEs4 from "@/assets/app-carousel-es-4.png";
import angryBr from "@/assets/angry-br.png";
import angryEn from "@/assets/angry-en.png";
import angryEs from "@/assets/angry-es.png";
import seuAplicativoProprio from "@/assets/seu-aplicativo-proprio.png";
import valorAgregadoImg from "@/assets/valor-agregado.png";
import conteudoProtegido from "@/assets/conteudo-protegido.png";
import notificacoes from "@/assets/notificacoes-engajamento.png";
import recebaDireto from "@/assets/receba-direto-conta.png";
import relatoriosDetalhados from "@/assets/relatorios-detalhados.png";
import totalmentePersonalizavel from "@/assets/totalmente-personalizavel.png";
import multiplataforma from "@/assets/multiplataforma.png";
import entregaInstantanea from "@/assets/entrega-instantanea.png";
import identidadeVisualImg from "@/assets/identidade-visual-consistente.png";
import experienciaUsuarioImg from "@/assets/experiencia-usuario.png";
import atualizacoesAutomaticasImg from "@/assets/atualizacoes-automaticas.png";
import facilidadeAcessoImg from "@/assets/facilidade-acesso.png";
import hotmartLogo from "@/assets/logos/hotmart-logo.png";
import eduzzLogo from "@/assets/logos/eduzz-logo.png";
import kiwifyLogo from "@/assets/logos/kiwify-logo.png";
import monetizzeLogo from "@/assets/logos/monetizze-logo.png";
import stripeLogo from "@/assets/logos/stripe-logo.png";
import perfectpayLogo from "@/assets/logos/perfectpay-logo.png";
import cartpandaLogo from "@/assets/logos/cartpanda-logo.png";
import caktoLogo from "@/assets/logos/cakto-logo.png";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { EditorProvider, useEditor } from "@/contexts/EditorContext";
import { EditableElement } from "@/components/editor/EditableElement";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
const AppCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { language } = useLanguage();

  // Select images based on language
  const images =
    language === "en"
      ? [appCarouselEn1, appCarouselEn2, appCarouselEn3, appCarouselEn4]
      : language === "es"
        ? [appCarouselEs1, appCarouselEs2, appCarouselEs3, appCarouselEs4]
        : [appCarousel1, appCarousel2, appCarousel3, appCarousel4]; // PT-BR

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-md">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`App Migrabook passo ${index + 1}`}
            className={`w-full rounded-2xl shadow-2xl transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0 absolute inset-0"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const PlatformLogosCarousel = () => {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      dragFree: true,
      align: "start",
      skipSnaps: false,
      containScroll: false,
    },
    [
      Autoplay({
        delay: 2500,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        playOnInit: true,
      }) as any,
    ],
  );
  const platforms = [
    {
      name: "Hotmart",
      logo: hotmartLogo,
    },
    {
      name: "Eduzz",
      logo: eduzzLogo,
    },
    {
      name: "Kiwify",
      logo: kiwifyLogo,
    },
    {
      name: "Monetizze",
      logo: monetizzeLogo,
    },
    {
      name: "Stripe",
      logo: stripeLogo,
    },
    {
      name: "Perfect Pay",
      logo: perfectpayLogo,
    },
    {
      name: "Cart Panda",
      logo: cartpandaLogo,
    },
    {
      name: "Cakto",
      logo: caktoLogo,
    },
  ];
  return (
    <div className="relative overflow-hidden" ref={emblaRef}>
      <div className="flex gap-8 cursor-grab active:cursor-grabbing">
        {[...platforms, ...platforms, ...platforms].map((platform, index) => (
          <div
            key={`${platform.name}-${index}`}
            className="px-6 py-3 rounded-xl bg-white dark:bg-white shadow-lg shrink-0"
          >
            <img
              src={platform.logo}
              alt={platform.name}
              className="h-8 sm:h-10 w-auto object-contain"
              style={{
                minWidth: "140px",
                maxWidth: "160px",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
const SubscribePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthState();
  const { theme, setTheme } = useTheme();
  const { language, t, setLanguage } = useLanguage();
  const [isAnnual, setIsAnnual] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Admin check
  const { isAdmin, isLoading: isAdminLoading } = useAdminAuth();

  // Capturar UTMs da URL
  useUtmCapture();

  // Inicializar rastreamento do Facebook (FBP, FBC)
  useEffect(() => {
    initFacebookTracking();
  }, []);

  // Plan refresh function
  const { refresh: refreshPlan } = usePlanContext();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const plans = [
    {
      id: "essencial",
      name: t("pricing.plan.essencial.name"),
      description: t("pricing.plan.essencial.description"),
      monthlyPrice: 47,
      annualPrice: 470,
      monthlyEquivalent: 39.16,
      maxApps: 1,
      features: [
        {
          name: t("pricing.features.customization"),
          included: true,
        },
        {
          name: t("pricing.features.multilingual"),
          included: true,
        },
        {
          name: t("pricing.features.realtime_updates"),
          included: true,
        },
        {
          name: t("pricing.features.unlimited_users"),
          included: true,
        },
        {
          name: t("pricing.features.email_support"),
          included: true,
        },
        {
          name: t("pricing.features.whatsapp_support"),
          included: false,
        },
        {
          name: t("pricing.features.push_notifications"),
          included: false,
        },
        {
          name: t("pricing.features.internal_chat"),
          included: false,
        },
        {
          name: t("pricing.features.platform_integrations"),
          included: false,
        },
        {
          name: t("pricing.features.app_import"),
          included: false,
        },
        {
          name: t("pricing.features.video_player"),
          included: false,
        },
        {
          name: t("pricing.features.custom_domain"),
          included: false,
        },
        {
          name: t("pricing.features.premium_templates"),
          included: false,
        },
      ],
      highlight: false,
    },
    {
      id: "profissional",
      name: t("pricing.plan.profissional.name"),
      description: t("pricing.plan.profissional.description"),
      monthlyPrice: 97,
      annualPrice: 970,
      monthlyEquivalent: 80.83,
      maxApps: 3,
      features: [
        {
          name: t("pricing.features.customization"),
          included: true,
        },
        {
          name: t("pricing.features.multilingual"),
          included: true,
        },
        {
          name: t("pricing.features.realtime_updates"),
          included: true,
        },
        {
          name: t("pricing.features.unlimited_users"),
          included: true,
        },
        {
          name: t("pricing.features.email_support"),
          included: true,
        },
        {
          name: t("pricing.features.whatsapp_support"),
          included: true,
        },
        {
          name: t("pricing.features.push_notifications"),
          included: true,
        },
        {
          name: t("pricing.features.internal_chat"),
          included: true,
        },
        {
          name: t("pricing.features.platform_integrations"),
          included: true,
        },
        {
          name: t("pricing.features.app_import"),
          included: true,
        },
        {
          name: t("pricing.features.video_player"),
          included: false,
        },
        {
          name: t("pricing.features.custom_domain"),
          included: false,
        },
        {
          name: t("pricing.features.premium_templates"),
          included: false,
        },
      ],
      highlight: true,
    },
    {
      id: "empresarial",
      name: t("pricing.plan.empresarial.name"),
      description: t("pricing.plan.empresarial.description"),
      monthlyPrice: 197,
      annualPrice: 1970,
      monthlyEquivalent: 164.16,
      maxApps: -1,
      features: [
        {
          name: t("pricing.features.customization"),
          included: true,
        },
        {
          name: t("pricing.features.multilingual"),
          included: true,
        },
        {
          name: t("pricing.features.realtime_updates"),
          included: true,
        },
        {
          name: t("pricing.features.unlimited_users"),
          included: true,
        },
        {
          name: t("pricing.features.email_support"),
          included: true,
        },
        {
          name: t("pricing.features.whatsapp_support"),
          included: true,
        },
        {
          name: t("pricing.features.push_notifications"),
          included: true,
        },
        {
          name: t("pricing.features.internal_chat"),
          included: true,
        },
        {
          name: t("pricing.features.platform_integrations"),
          included: true,
        },
        {
          name: t("pricing.features.app_import"),
          included: true,
        },
        {
          name: t("pricing.features.video_player"),
          included: true,
        },
        {
          name: t("pricing.features.custom_domain"),
          included: true,
        },
        {
          name: t("pricing.features.premium_templates"),
          included: true,
        },
      ],
      highlight: false,
    },
  ];
  const getPrice = (plan: (typeof plans)[0]) => {
    const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    return price.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    });
  };
  const handleSubscribe = (planId: string) => {
    // Redirecionar diretamente para o link de checkout do Stripe
    const billingCycle = isAnnual ? "annual" : "monthly";
    const checkoutUrl = getCheckoutLink(planId as PlanId, billingCycle);
    
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
    }
  };
  const handleAuthSuccess = async () => {
    setShowAuthDialog(false);

    // Se tem pendingPlanId, vai para checkout
    if (pendingPlanId) {
      navigate(`/checkout?plan=${pendingPlanId}&billing=${isAnnual ? "annual" : "monthly"}`);
      return;
    }

    // Buscar sessão diretamente do Supabase para garantir userId correto
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      console.warn("[SubscribePage] No user session found after auth");
      navigate("/pricing");
      return;
    }

    // Forçar refresh do plano passando userId explícito
    const planResult = await refreshPlan(userId);

    console.log("🔄 [SubscribePage] Redirecting after auth:", planResult);

    // Se tem plano ativo (pago), vai para /app
    if (planResult.hasActivePlan) {
      navigate("/app");
    } else {
      // Se não tem plano ativo (gratuito ou sem plano), vai para /pricing
      navigate("/pricing");
    }
  };
  return (
    <EditorProvider pageName="subscribe-page">
      <SubscribePageContent
        navigate={navigate}
        isAuthenticated={isAuthenticated}
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        t={t}
        isAnnual={isAnnual}
        setIsAnnual={setIsAnnual}
        showAuthDialog={showAuthDialog}
        setShowAuthDialog={setShowAuthDialog}
        pendingPlanId={pendingPlanId}
        setPendingPlanId={setPendingPlanId}
        isScrolled={isScrolled}
        plans={plans}
        getPrice={getPrice}
        handleSubscribe={handleSubscribe}
        handleAuthSuccess={handleAuthSuccess}
      />
    </EditorProvider>
  );
};
const SubscribePageContent = ({
  navigate,
  isAuthenticated,
  theme,
  setTheme,
  language,
  setLanguage,
  t,
  isAnnual,
  setIsAnnual,
  showAuthDialog,
  setShowAuthDialog,
  pendingPlanId,
  setPendingPlanId,
  isScrolled,
  plans,
  getPrice,
  handleSubscribe,
  handleAuthSuccess,
}: any) => {
  const { isEditMode, elementStyles, updateElementStyle, resetChanges } = useEditor();

  // Carregar estilos salvos ao montar o componente
  useEffect(() => {
    resetChanges();
  }, []);
  return (
    <div className="min-h-screen bg-app-bg overflow-x-hidden select-none">
      {/* Fixed Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-md shadow-lg" : "bg-transparent"}`}
      >
        <div className="container mx-auto px-4 sm:px-4 h-16 flex items-center justify-between max-w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 sm:h-10 sm:w-10 relative"
              style={{
                WebkitMaskImage: "url(/migrabook-logo.png)",
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskImage: "url(/migrabook-logo.png)",
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                background: "linear-gradient(to right, rgb(59 130 246), rgb(147 51 234))",
              }}
            />
            <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              MigraBook
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-12 h-12">
                    <Globe className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background">
                  <DropdownMenuItem onClick={() => setLanguage("pt")}>
                    {t("subscribe.header.portuguese")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("en")}>{t("subscribe.header.english")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("es")}>{t("subscribe.header.spanish")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>


              {/* Login Button */}
              <Button
                variant="outline"
                className="h-10 px-4"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="flex md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-white h-10 px-3 text-sm">
                    <Menu className="h-4 w-4 mr-1" />
                    {t("subscribe.header.menu")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background z-50">
                  {/* Login */}
                  <DropdownMenuItem onClick={() => navigate("/login")}>
                    Login
                  </DropdownMenuItem>

                  {/* Idioma - Submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Globe className="h-4 w-4 mr-2" />
                      {t("subscribe.header.language")}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-background">
                      <DropdownMenuItem onClick={() => setLanguage("pt")}>
                        {t("subscribe.header.portuguese")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLanguage("en")}>
                        {t("subscribe.header.english")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLanguage("es")}>
                        {t("subscribe.header.spanish")}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </div>
      </header>

      {/* Offset for fixed header */}
      <div className="pt-16"></div>

      {/* First Section - Impactful Headline */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100/50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 sm:px-4 lg:px-8 pt-10 sm:pt-20 md:pt-16 pb-12 sm:pb-16 md:pb-20 relative z-10 max-w-full">
          <div className="max-w-6xl mx-auto text-center">
            <EditableElement
              elementId="hero-title"
              currentStyles={elementStyles["hero-title"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[28px] sm:text-[36px] md:text-[52px] font-bold mb-3 sm:mb-4 leading-[1.2]"
            >
              {t("subscribe.hero.title.part1")}
              <br className="hidden md:block" />{" "}
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                {t("subscribe.hero.title.part2")}
              </span>{" "}
              {t("subscribe.hero.title.part3")}
              <br className="hidden md:block" />
              {t("subscribe.hero.title.part4")}
            </EditableElement>

            <EditableElement
              elementId="hero-subtitle"
              currentStyles={elementStyles["hero-subtitle"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              {t("subscribe.hero.subtitle")}
            </EditableElement>

            {/* VSL Video Player - Vturb */}
            <div className="mb-8 sm:mb-12 flex justify-center">
              <div className="relative w-full max-w-5xl aspect-video shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden dark:border-[0.5px] dark:border-white/20">
                <VturbPlayer
                  key={language}
                  videoId={
                    language === "en"
                      ? "6944096a8fd5231b631acf79"
                      : language === "es"
                        ? "694409a69a07b812705acabf"
                        : "694a060087bdd2a5aeab3d28"
                  }
                  accountId="e3c86e0f-335f-4aa4-935e-74ffd2429942"
                  className="w-full h-full"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <EditableElement
                elementId="hero-cta-button"
                currentStyles={elementStyles["hero-cta-button"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <Button
                  className="bg-primary hover:bg-primary/90 hover:scale-105 text-primary-foreground px-6 sm:px-10 md:px-14 py-5 sm:py-6 md:py-7 text-xl sm:text-xl md:text-2xl h-auto rounded-xl font-semibold shadow-2xl hover:shadow-xl transition-all duration-300"
                  onClick={() =>
                    window.scrollTo({
                      top: document.getElementById("pricing")?.offsetTop || 800,
                      behavior: "smooth",
                    })
                  }
                >
                  {t("subscribe.hero.cta")}
                </Button>
              </EditableElement>
            </div>
          </div>
        </div>
      </section>

      {/* Second Section - Why eBooks Don't Deliver Value */}
      <section className="relative py-12 sm:py-16 md:py-24 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-4 lg:px-8 max-w-full">
          <div className="max-w-5xl mx-auto">
            {/* Heading */}
            <EditableElement
              elementId="ebook-problem-title"
              currentStyles={elementStyles["ebook-problem-title"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[28px] sm:text-[32px] md:text-[40px] font-bold mb-4 sm:mb-6 text-foreground leading-[1.3]"
            >
              {t("subscribe.ebook.title")}
            </EditableElement>

            {/* Three paragraphs */}
            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12 text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed">
              <EditableElement
                elementId="ebook-problem-para1"
                currentStyles={elementStyles["ebook-problem-para1"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
                className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC]"
              >
                <p>{t("subscribe.ebook.para1")}</p>
              </EditableElement>
              <EditableElement
                elementId="ebook-problem-para2"
                currentStyles={elementStyles["ebook-problem-para2"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
                className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC]"
              >
                <p>{t("subscribe.ebook.para2")}</p>
              </EditableElement>
              <EditableElement
                elementId="ebook-problem-para3"
                currentStyles={elementStyles["ebook-problem-para3"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
                className="text-[18px] sm:text-xl md:text-2xl font-semibold text-foreground"
              >
                <p>{t("subscribe.ebook.test_title")}</p>
              </EditableElement>
            </div>

            {/* Quick Test - Two Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <Card className="p-4 sm:p-6 md:p-8 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                <EditableElement
                  elementId="quick-test-ebook"
                  currentStyles={elementStyles["quick-test-ebook"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[18px] sm:text-[20px] md:text-2xl text-foreground leading-relaxed"
                >
                  <p>
                    {t("subscribe.ebook.test_ebook")} <br />
                    <span className="font-bold">{t("subscribe.ebook.test_ebook_word")}</span>{" "}
                    {t("subscribe.ebook.test_subject")}
                  </p>
                </EditableElement>
              </Card>
              <Card className="p-4 sm:p-6 md:p-8 bg-blue-50 dark:bg-gray-800 border-2 border-[#2054DE]/40">
                <EditableElement
                  elementId="quick-test-app"
                  currentStyles={elementStyles["quick-test-app"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[18px] sm:text-[20px] md:text-2xl text-foreground leading-relaxed"
                >
                  <p>
                    {t("subscribe.ebook.test_app")} <br />
                    <span className="font-bold">{t("subscribe.ebook.test_app_word")}</span>{" "}
                    {t("subscribe.ebook.test_subject")}
                  </p>
                </EditableElement>
              </Card>
            </div>

            {/* Percebe a diferença? */}
            <EditableElement
              elementId="difference-question"
              currentStyles={elementStyles["difference-question"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-center mb-8 sm:mb-28 md:mb-36 text-foreground mt-12 md:mt-16 leading-[1.2]"
            >
              {t("subscribe.ebook.difference_question")}
            </EditableElement>

            {/* Visual Comparison - eBook vs App */}
            <div className="flex flex-col md:flex-row items-stretch justify-center gap-28 sm:gap-12 md:gap-16 mb-8 sm:mb-12 max-w-5xl mx-auto">
              {/* eBook Mockup */}
              <div className="flex-shrink-0 flex flex-col items-center w-full md:w-auto">
                <div className="flex items-end mb-4 sm:mb-8 h-[280px] sm:h-[320px] md:h-[360px]">
                  <img
                    src={language === "pt" ? ebookMockupBr : language === "en" ? ebookMockupEn : ebookMockupEs}
                    alt="Capa de eBook PDF tradicional"
                    className="w-48 sm:w-56 md:w-64 h-auto rounded-lg shadow-2xl"
                  />
                </div>
                <Card className="p-6 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 w-full max-w-sm flex-grow flex items-center justify-center">
                  <EditableElement
                    elementId="ebook-mockup-caption"
                    currentStyles={elementStyles["ebook-mockup-caption"] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                    className="text-[16px] sm:text-[18px] text-foreground text-center"
                  >
                    <p>{t("subscribe.ebook.mockup_ebook")}</p>
                  </EditableElement>
                </Card>
              </div>

              {/* App Mockup */}
              <div className="flex-shrink-0 flex flex-col items-center w-full md:w-auto">
                <div className="flex items-end mb-4 sm:mb-8 h-[280px] sm:h-[320px] md:h-[360px]">
                  <img
                    src={language === "pt" ? appMockupBr : language === "en" ? appMockupEn : appMockupEs}
                    alt="Aplicativo moderno em smartphone"
                    className="w-56 sm:w-64 md:w-72 h-auto rounded-2xl shadow-2xl mt-[30px] md:mt-0"
                  />
                </div>
                <Card className="p-6 bg-blue-50 dark:bg-gray-800 border-2 border-[#A9CDFF] w-full max-w-sm flex-grow flex items-center justify-center">
                  <EditableElement
                    elementId="app-mockup-caption"
                    currentStyles={elementStyles["app-mockup-caption"] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                    className="text-[16px] sm:text-[18px] text-foreground text-center"
                  >
                    <p>{t("subscribe.ebook.mockup_app")}</p>
                  </EditableElement>
                </Card>
              </div>
            </div>

            {/* Final Text */}
            <div className="space-y-3 sm:space-y-4 text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed">
              <EditableElement
                elementId="app-experience-title"
                currentStyles={elementStyles["app-experience-title"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
                className="font-bold text-[20px] sm:text-[22px] md:text-2xl text-foreground text-center"
              >
                <p>{t("subscribe.ebook.app_experience_title")}</p>
              </EditableElement>
              <EditableElement
                elementId="app-experience-para1"
                currentStyles={elementStyles["app-experience-para1"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
                className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed text-center"
              >
                <p className="text-2xl">{t("subscribe.ebook.app_experience_para1")}</p>
              </EditableElement>
              <EditableElement
                elementId="app-experience-para2"
                currentStyles={elementStyles["app-experience-para2"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
                className="text-[20px] sm:text-[22px] md:text-2xl font-semibold text-foreground text-center"
              >
                <p>{t("subscribe.ebook.app_experience_para2")}</p>
              </EditableElement>
            </div>
          </div>
        </div>
      </section>

      {/* Third Section - Benefits Cards */}
      <section className="relative py-20 md:py-28 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Title */}
            <EditableElement
              elementId="benefits-title"
              currentStyles={elementStyles["benefits-title"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[28px] sm:text-[36px] md:text-[48px] font-bold mb-4 text-foreground leading-[1.2] text-center"
            >
              {t("subscribe.benefits.title.part1")}
              <br />
              {t("subscribe.benefits.title.part2")}
            </EditableElement>

            {/* Subtitle */}
            <p className="text-lg text-muted-foreground text-center mb-10 md:mb-12 sm:text-2xl">
              {t("subscribe.benefits.title.subtitle")}
            </p>

            {/* Benefits Grid - 4 columns x 2 rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-16">
              {/* Card 1 - Smartphone */}
              <Card className="p-8 text-center bg-card dark:bg-gray-800/50 dark:border dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="h-[100px] flex items-center justify-center mb-1">
                  <img
                    src={valorAgregadoImg}
                    alt="Valor agregado"
                    className="max-w-[80px] max-h-[80px] object-contain transition-all hover:scale-110"
                  />
                </div>
                <EditableElement
                  elementId="benefit-card-1-title"
                  currentStyles={elementStyles["benefit-card-1-title"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[20px] sm:text-[22px] md:text-xl font-bold mb-3 text-foreground"
                >
                  {t("subscribe.benefits.card1.title")}
                </EditableElement>
                <EditableElement
                  elementId="benefit-card-1-desc"
                  currentStyles={elementStyles["benefit-card-1-desc"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[18px] sm:text-[20px] md:text-[20px] text-[#374151] dark:text-[#CCCCCC] leading-relaxed"
                >
                  {t("subscribe.benefits.card1.desc")}
                </EditableElement>
              </Card>

              {/* Card 2 - Experiência do Usuário */}
              <Card className="p-8 text-center bg-card dark:bg-gray-800/50 dark:border dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="h-[100px] flex items-center justify-center mb-1">
                  <img
                    src={experienciaUsuarioImg}
                    alt="Experiência do usuário"
                    className="max-w-[75px] max-h-[75px] object-contain transition-all hover:scale-110"
                  />
                </div>
                <EditableElement
                  elementId="benefit-card-2-title"
                  currentStyles={elementStyles["benefit-card-2-title"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[20px] sm:text-[22px] md:text-xl font-bold mb-3 text-foreground"
                >
                  {t("subscribe.benefits.card2.title")}
                </EditableElement>
                <EditableElement
                  elementId="benefit-card-2-desc"
                  currentStyles={elementStyles["benefit-card-2-desc"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[18px] sm:text-[20px] md:text-[20px] text-[#374151] dark:text-[#CCCCCC] leading-relaxed"
                >
                  {t("subscribe.benefits.card2.desc")}
                </EditableElement>
              </Card>

              {/* Card 3 - Bell */}
              <Card className="p-8 text-center bg-card dark:bg-gray-800/50 dark:border dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="h-[100px] flex items-center justify-center mb-1">
                  <img
                    src={notificacoes}
                    alt="Notificações para aumentar engajamento"
                    className="max-w-[70px] max-h-[70px] object-contain transition-all hover:scale-110"
                  />
                </div>
                <EditableElement
                  elementId="benefit-card-3-title"
                  currentStyles={elementStyles["benefit-card-3-title"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[20px] sm:text-[22px] md:text-xl font-bold mb-3 text-foreground"
                >
                  {t("subscribe.benefits.card3.title")}
                </EditableElement>
                <EditableElement
                  elementId="benefit-card-3-desc"
                  currentStyles={elementStyles["benefit-card-3-desc"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[18px] sm:text-[20px] md:text-[20px] text-[#374151] dark:text-[#CCCCCC] leading-relaxed"
                >
                  {t("subscribe.benefits.card3.desc")}
                </EditableElement>
              </Card>

              {/* Card 4 - Identidade Visual */}
              <Card className="p-8 text-center bg-card dark:bg-gray-800/50 dark:border dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="h-[100px] flex items-center justify-center mb-1">
                  <img
                    src={identidadeVisualImg}
                    alt="Identidade visual consistente"
                    className="max-w-[50px] max-h-[50px] object-contain transition-all hover:scale-110"
                  />
                </div>
                <EditableElement
                  elementId="benefit-card-4-title"
                  currentStyles={elementStyles["benefit-card-4-title"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[20px] sm:text-[22px] md:text-xl font-bold mb-3 text-foreground"
                >
                  {t("subscribe.benefits.card4.title")}
                </EditableElement>
                <EditableElement
                  elementId="benefit-card-4-desc"
                  currentStyles={elementStyles["benefit-card-4-desc"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[18px] sm:text-[20px] md:text-[20px] text-[#374151] dark:text-[#CCCCCC] leading-relaxed"
                >
                  {t("subscribe.benefits.card4.desc")}
                </EditableElement>
              </Card>

              {/* Card 5 - Interface Multi-idioma */}
              <Card className="p-8 text-center bg-card dark:bg-gray-800/50 dark:border dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="h-[100px] flex items-center justify-center mb-1">
                  <img
                    src={multiplataforma}
                    alt="Interface multi-idioma"
                    className="max-w-12 max-h-12 object-contain transition-all hover:scale-110"
                  />
                </div>
                <EditableElement
                  elementId="benefit-card-5-title"
                  currentStyles={elementStyles["benefit-card-5-title"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[20px] sm:text-[22px] md:text-xl font-bold mb-3 text-foreground"
                >
                  {t("subscribe.benefits.card5.title")}
                </EditableElement>
                <EditableElement
                  elementId="benefit-card-5-desc"
                  currentStyles={elementStyles["benefit-card-5-desc"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[18px] sm:text-[20px] md:text-[20px] text-[#374151] dark:text-[#CCCCCC] leading-relaxed"
                >
                  {t("subscribe.benefits.card5.desc")}
                </EditableElement>
              </Card>

              {/* Card 6 - Facilidade de acesso */}
              <Card className="p-8 text-center bg-card dark:bg-gray-800/50 dark:border dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="h-[100px] flex items-center justify-center mb-1">
                  <img
                    src={facilidadeAcessoImg}
                    alt="Facilidade de acesso"
                    className="max-w-[65px] max-h-[65px] object-contain transition-all hover:scale-110"
                  />
                </div>
                <EditableElement
                  elementId="benefit-card-6-title"
                  currentStyles={elementStyles["benefit-card-6-title"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[20px] sm:text-[22px] md:text-xl font-bold mb-3 text-foreground"
                >
                  {t("subscribe.benefits.card6.title")}
                </EditableElement>
                <EditableElement
                  elementId="benefit-card-6-desc"
                  currentStyles={elementStyles["benefit-card-6-desc"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[18px] sm:text-[20px] md:text-[20px] text-[#374151] dark:text-[#CCCCCC] leading-relaxed"
                >
                  {t("subscribe.benefits.card6.desc")}
                </EditableElement>
              </Card>

              {/* Card 7 - Atualizações automáticas */}
              <Card className="p-8 text-center bg-card dark:bg-gray-800/50 dark:border dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="h-[100px] flex items-center justify-center mb-1">
                  <img
                    src={atualizacoesAutomaticasImg}
                    alt="Atualizações automáticas"
                    className="max-w-[70px] max-h-[70px] object-contain transition-all hover:scale-110"
                  />
                </div>
                <EditableElement
                  elementId="benefit-card-7-title"
                  currentStyles={elementStyles["benefit-card-7-title"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[20px] sm:text-[22px] md:text-xl font-bold mb-3 text-foreground"
                >
                  {t("subscribe.benefits.card7.title")}
                </EditableElement>
                <EditableElement
                  elementId="benefit-card-7-desc"
                  currentStyles={elementStyles["benefit-card-7-desc"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[18px] sm:text-[20px] md:text-[20px] text-[#374151] dark:text-[#CCCCCC] leading-relaxed"
                >
                  {t("subscribe.benefits.card7.desc")}
                </EditableElement>
              </Card>

              {/* Card 8 - Lightning */}
              <Card className="p-8 text-center bg-card dark:bg-gray-800/50 dark:border dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="h-[100px] flex items-center justify-center mb-1">
                  <img
                    src={entregaInstantanea}
                    alt="Entrega instantânea"
                    className="max-w-[100px] max-h-[100px] object-contain transition-all hover:scale-110"
                  />
                </div>
                <EditableElement
                  elementId="benefit-card-8-title"
                  currentStyles={elementStyles["benefit-card-8-title"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[20px] sm:text-[22px] md:text-xl font-bold mb-3 text-foreground"
                >
                  {t("subscribe.benefits.card8.title")}
                </EditableElement>
                <EditableElement
                  elementId="benefit-card-8-desc"
                  currentStyles={elementStyles["benefit-card-8-desc"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[18px] sm:text-[20px] md:text-[20px] text-[#374151] dark:text-[#CCCCCC]"
                >
                  {t("subscribe.benefits.card8.desc")}
                </EditableElement>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="text-center px-4">
              <EditableElement
                elementId="benefits-cta-title"
                currentStyles={elementStyles["benefits-cta-title"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
                className="text-[24px] sm:text-[28px] md:text-2xl font-bold mb-5 text-foreground"
              >
                <h3>{t("subscribe.benefits.cta.title")}</h3>
              </EditableElement>
              <EditableElement
                elementId="benefits-cta-button"
                currentStyles={elementStyles["benefits-cta-button"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 sm:px-10 md:px-12 py-6 sm:py-6 text-[19px] sm:text-[19px] md:text-2xl h-auto rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all max-w-full min-w-[280px] sm:min-w-fit"
                  onClick={() =>
                    window.scrollTo({
                      top: document.getElementById("pricing")?.offsetTop || 800,
                      behavior: "smooth",
                    })
                  }
                >
                  {t("subscribe.benefits.cta.button")}
                </Button>
              </EditableElement>
            </div>
          </div>
        </div>
      </section>

      {/* Fourth Section - Who is MigraBook For */}
      <section className="relative py-20 md:py-28 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Main Title */}
            <EditableElement
              elementId="target-audience-title"
              currentStyles={elementStyles["target-audience-title"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-center mb-10 text-foreground leading-[1.2]"
            >
              {t("subscribe.target.title")}
            </EditableElement>

            {/* Scenarios List */}
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-[#ECF2FD] dark:bg-gray-800/30 transition-colors">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[18px] sm:text-[20px] md:text-2xl font-bold text-foreground leading-relaxed">
                    {t("subscribe.target.bullet1.title")}
                  </p>
                  <p className="text-[16px] sm:text-[18px] md:text-xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed mt-1">
                    {t("subscribe.target.bullet1.desc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-lg bg-[#ECF2FD] dark:bg-gray-800/30 transition-colors">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[18px] sm:text-[20px] md:text-2xl font-bold text-foreground leading-relaxed">
                    {t("subscribe.target.bullet2.title")}
                  </p>
                  <p className="text-[16px] sm:text-[18px] md:text-xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed mt-1">
                    {t("subscribe.target.bullet2.desc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-lg bg-[#ECF2FD] dark:bg-gray-800/30 transition-colors">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[18px] sm:text-[20px] md:text-2xl font-bold text-foreground leading-relaxed">
                    {t("subscribe.target.bullet3.title")}
                  </p>
                  <p className="text-[16px] sm:text-[18px] md:text-xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed mt-1">
                    {t("subscribe.target.bullet3.desc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-lg bg-[#ECF2FD] dark:bg-gray-800/30 transition-colors">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[18px] sm:text-[20px] md:text-2xl font-bold text-foreground leading-relaxed">
                    {t("subscribe.target.bullet4.title")}
                  </p>
                  <p className="text-[16px] sm:text-[18px] md:text-xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed mt-1">
                    {t("subscribe.target.bullet4.desc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-lg bg-[#ECF2FD] dark:bg-gray-800/30 transition-colors">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[18px] sm:text-[20px] md:text-2xl font-bold text-foreground leading-relaxed">
                    {t("subscribe.target.bullet5.title")}
                  </p>
                  <p className="text-[16px] sm:text-[18px] md:text-xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed mt-1">
                    {t("subscribe.target.bullet5.desc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-lg bg-[#ECF2FD] dark:bg-gray-800/30 transition-colors">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[18px] sm:text-[20px] md:text-2xl font-bold text-foreground leading-relaxed">
                    {t("subscribe.target.bullet6.title")}
                  </p>
                  <p className="text-[16px] sm:text-[18px] md:text-xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed mt-1">
                    {t("subscribe.target.bullet6.desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fifth Section - Digital Knowledge Problems */}
      <section className="relative pb-20 md:pb-28 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 md:gap-16 items-center">
              {/* Left - Image */}
              <div className="flex justify-center items-center">
                <img
                  src={language === "pt" ? angryBr : language === "en" ? angryEn : angryEs}
                  alt="Jornada complicada de acesso a conteúdo digital com múltiplos obstáculos"
                  className="w-full max-w-[300px] sm:max-w-md h-auto object-contain"
                />
              </div>

              {/* Right - Content */}
              <div>
                <EditableElement
                  elementId="problems-title"
                  currentStyles={elementStyles["problems-title"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[28px] sm:text-[32px] md:text-[40px] font-bold mb-6 text-foreground leading-[1.3]"
                >
                  {t("subscribe.problems.title.part1")}
                  <br className="hidden md:block" />
                  <span className="md:hidden"> </span>
                  {t("subscribe.problems.title.part2")}
                </EditableElement>

                {/* Problems List with X */}
                <div className="space-y-4 mb-8">
                  <EditableElement
                    elementId="problem-item-1"
                    currentStyles={elementStyles["problem-item-1"] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                  >
                    <div className="flex items-start gap-3">
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                      <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed">
                        {t("subscribe.problems.item1")}
                      </p>
                    </div>
                  </EditableElement>

                  <EditableElement
                    elementId="problem-item-2"
                    currentStyles={elementStyles["problem-item-2"] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                  >
                    <div className="flex items-start gap-3">
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                      <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed">
                        {t("subscribe.problems.item2")}
                      </p>
                    </div>
                  </EditableElement>

                  <EditableElement
                    elementId="problem-item-3"
                    currentStyles={elementStyles["problem-item-3"] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                  >
                    <div className="flex items-start gap-3">
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                      <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed">
                        {t("subscribe.problems.item3")}
                      </p>
                    </div>
                  </EditableElement>

                  <EditableElement
                    elementId="problem-item-4"
                    currentStyles={elementStyles["problem-item-4"] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                  >
                    <div className="flex items-start gap-3">
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                      <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed">
                        {t("subscribe.problems.item4")}
                      </p>
                    </div>
                  </EditableElement>

                  <EditableElement
                    elementId="problem-item-5"
                    currentStyles={elementStyles["problem-item-5"] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                  >
                    <div className="flex items-start gap-3">
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                      <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed">
                        {t("subscribe.problems.item5")}
                      </p>
                    </div>
                  </EditableElement>
                </div>

                {/* Warning Question */}
                <EditableElement
                  elementId="warning-question"
                  currentStyles={elementStyles["warning-question"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[20px] sm:text-[22px] md:text-2xl font-bold mb-3 text-gray-900 dark:text-white"
                >
                  {t("subscribe.problems.warning_question")}
                </EditableElement>

                {/* Warning Box */}
                <EditableElement
                  elementId="warning-box"
                  currentStyles={elementStyles["warning-box"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                >
                  <div className="p-6 rounded-lg bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500">
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed">
                      {t("subscribe.problems.warning_box")}
                    </p>
                  </div>
                </EditableElement>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Section - How Migrabook Changes This */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center max-w-7xl mx-auto">
              {/* Image - First on mobile, second on desktop */}
              <div className="flex flex-col items-center order-first md:order-last">
                <a 
                  href="https://migrabook.app/biblico-kids" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="relative w-full max-w-lg block cursor-pointer"
                >
                  <img
                    src="/app-mockup-fixed.png"
                    alt="App Migrabook"
                    className="w-full rounded-2xl shadow-2xl hover:opacity-90 transition-opacity"
                  />
                </a>
                <a 
                  href="https://migrabook.app/biblico-kids" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 text-primary hover:text-primary/80 font-medium underline underline-offset-4 transition-colors"
                >
                  {t("subscribe.changes.demo_link")}
                </a>
              </div>

              {/* Content - Second on mobile, first on desktop */}
              <div className="order-last md:order-first">
                <EditableElement
                  elementId="migrabook-changes-title"
                  currentStyles={elementStyles["migrabook-changes-title"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[28px] sm:text-[32px] md:text-[40px] font-bold mb-5 text-foreground leading-[1.3]"
                >
                  {t("subscribe.changes.title")}
                </EditableElement>

                <EditableElement
                  elementId="migrabook-benefits-intro"
                  currentStyles={elementStyles["migrabook-benefits-intro"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-6 leading-relaxed"
                >
                  <p>{t("subscribe.changes.intro")}</p>
                </EditableElement>

                {/* Benefits List with Check */}
                <div className="space-y-4 mb-8">
                  <EditableElement
                    elementId="benefit-no-login"
                    currentStyles={elementStyles["benefit-no-login"] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <p className="text-[18px] sm:text-[20px] md:text-2xl text-foreground leading-relaxed">
                        {t("subscribe.changes.benefit1")}
                      </p>
                    </div>
                  </EditableElement>

                  <EditableElement
                    elementId="benefit-no-email"
                    currentStyles={elementStyles["benefit-no-email"] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <p className="text-[18px] sm:text-[20px] md:text-2xl text-foreground leading-relaxed">
                        {t("subscribe.changes.benefit2")}
                      </p>
                    </div>
                  </EditableElement>

                  <EditableElement
                    elementId="benefit-no-password"
                    currentStyles={elementStyles["benefit-no-password"] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <p className="text-[18px] sm:text-[20px] md:text-2xl text-foreground leading-relaxed">
                        {t("subscribe.changes.benefit3")}
                      </p>
                    </div>
                  </EditableElement>

                  <EditableElement
                    elementId="benefit-no-support"
                    currentStyles={elementStyles["benefit-no-support"] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <p className="text-[18px] sm:text-[20px] md:text-2xl text-foreground leading-relaxed">
                        {t("subscribe.changes.benefit4")}
                      </p>
                    </div>
                  </EditableElement>
                </div>

                {/* Success Box */}
                <EditableElement
                  elementId="success-box"
                  currentStyles={elementStyles["success-box"] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                >
                  <div className="p-6 rounded-lg bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500">
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed">
                      <span className="font-semibold">{t("subscribe.changes.success_box")}</span>{" "}
                      {t("subscribe.changes.success_tagline")}
                    </p>
                  </div>
                </EditableElement>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section - Experience is App */}
      <section className="relative py-10 md:py-14 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <EditableElement
              elementId="experience-hero-title"
              currentStyles={elementStyles["experience-hero-title"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[28px] sm:text-[36px] md:text-[48px] font-bold mb-5 text-white leading-[1.3] max-w-5xl mx-auto"
            >
              {t("subscribe.experience.hero_title")}
            </EditableElement>

            <EditableElement
              elementId="experience-tagline"
              currentStyles={elementStyles["experience-tagline"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[20px] sm:text-[24px] md:text-3xl text-white/90 mb-12 font-light"
            >
              <p>{t("subscribe.experience.tagline")}</p>
            </EditableElement>

            <EditableElement
              elementId="hero-migrate-button"
              currentStyles={elementStyles["hero-migrate-button"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
            >
              <Button
                className="bg-white text-black hover:bg-white/90 text-xl sm:text-xl md:text-2xl px-6 sm:px-10 md:px-12 py-5 sm:py-6 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all"
                onClick={() =>
                  document.getElementById("pricing")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                {t("subscribe.experience.cta")}
              </Button>
            </EditableElement>

            <EditableElement
              elementId="hero-subtitle"
              currentStyles={elementStyles["hero-subtitle"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="mt-8 text-white/80 text-[18px] sm:text-[20px] md:text-xl font-bold"
            >
              <p>{t("subscribe.experience.subtitle")}</p>
            </EditableElement>
          </div>
        </div>
      </section>

      {/* Integrations Section - Platform Logos Carousel */}
      <section className="relative py-16 md:py-32 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Title */}
            <EditableElement
              elementId="integrations-title"
              currentStyles={elementStyles["integrations-title"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-center mb-4 sm:mb-8 leading-[1.2]"
            >
              {t("subscribe.integration.title.part1")}{" "}
              <span className="text-primary">{t("subscribe.integration.title.part2")}</span>
              <br className="hidden md:block" /> {t("subscribe.integration.title.part3")}
            </EditableElement>

            {/* Subtitle */}
            <EditableElement
              elementId="integrations-subtitle"
              currentStyles={elementStyles["integrations-subtitle"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[18px] sm:text-[20px] md:text-2xl text-center text-[#374151] dark:text-[#CCCCCC] mb-8 sm:mb-16 max-w-5xl mx-auto"
            >
              <p>{t("subscribe.integration.subtitle")}</p>
            </EditableElement>

            {/* Platform Logos Carousel */}
            <PlatformLogosCarousel />

            {/* Bottom Text */}
            <EditableElement
              elementId="integrations-bottom-text"
              currentStyles={elementStyles["integrations-bottom-text"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-center text-[18px] sm:text-[20px] md:text-xl text-[#374151] dark:text-[#CCCCCC] font-medium mt-8 sm:mt-16"
            >
              <p>{t("subscribe.integration.bottom_text")}</p>
            </EditableElement>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="pricing" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <EditableElement
            elementId="pricing-title"
            currentStyles={elementStyles["pricing-title"] || {}}
            onStyleChange={updateElementStyle}
            isEditMode={isEditMode}
            className="text-[28px] sm:text-[36px] md:text-[48px] font-bold mb-8 text-foreground leading-[1.2]"
          >
            {language === "pt" ? "Escolha o seu plano abaixo" : language === "en" ? "Choose your plan below" : "Elige tu plan abajo"}
          </EditableElement>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <Label
              htmlFor="billing-toggle"
              className={`text-lg ${!isAnnual ? "text-foreground font-semibold" : "text-[#374151] dark:text-[#CCCCCC]"}`}
            >
              <EditableElement
                elementId="billing-label-monthly"
                currentStyles={elementStyles["billing-label-monthly"] || {}}
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
              className={`text-lg ${isAnnual ? "text-foreground font-semibold" : "text-[#374151] dark:text-[#CCCCCC]"}`}
            >
              <EditableElement
                elementId="billing-label-annual"
                currentStyles={elementStyles["billing-label-annual"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
                className="text-lg"
              >
                {t("pricing.billing.annual")}
              </EditableElement>
            </Label>
            {isAnnual && (
              <EditableElement
                elementId="billing-save-badge"
                currentStyles={elementStyles["billing-save-badge"] || {}}
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

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-20 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative p-10 transition-all duration-300 md:max-w-3xl md:mx-auto lg:max-w-none lg:mx-0 ${plan.highlight ? "bg-[#2054DE] text-white border-2 border-[#2054DE] shadow-2xl scale-105 hover:scale-[1.06]" : "bg-card dark:bg-gray-800/50 dark:border dark:border-gray-700 border-border hover:border-primary/50 hover:shadow-xl"}`}
            >

              {plan.highlight && (
                <EditableElement
                  elementId={`plan-badge-${plan.id}`}
                  currentStyles={elementStyles[`plan-badge-${plan.id}`] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-green-600 text-white text-sm font-medium">
                    {t("subscribe.pricing.popular")}
                  </div>
                </EditableElement>
              )}

              <div className="text-center mb-8">
                <EditableElement
                  elementId={`plan-name-${plan.id}`}
                  currentStyles={elementStyles[`plan-name-${plan.id}`] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                  className={`text-2xl font-bold mb-2 ${plan.highlight ? "text-white" : "text-foreground"}`}
                >
                  <h3>{plan.name}</h3>
                </EditableElement>
                <EditableElement
                  elementId={`plan-description-${plan.id}`}
                  currentStyles={elementStyles[`plan-description-${plan.id}`] || {}}
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
                    <span className="relative z-10 text-black">{plan.description}</span>
                  </p>
                </EditableElement>

                <div className="flex flex-col items-center">
                  <div className="flex items-baseline justify-center gap-2">
                    <EditableElement
                      elementId={`plan-price-${plan.id}`}
                      currentStyles={elementStyles[`plan-price-${plan.id}`] || {}}
                      onStyleChange={updateElementStyle}
                      isEditMode={isEditMode}
                      className={`text-[42px] sm:text-5xl font-bold whitespace-nowrap ${plan.highlight ? "text-white" : "text-foreground"}`}
                    >
                      <span>{isAnnual ? `R$ ${plan.annualPrice}` : `R$ ${getPrice(plan)}`}</span>
                    </EditableElement>
                    <span
                      className={`text-xl ${plan.highlight ? "text-white/80" : "text-[#374151] dark:text-[#CCCCCC]"}`}
                    >
                      /{isAnnual ? t("pricing.billing.year") : t("pricing.billing.month")}
                    </span>
                  </div>
                  {isAnnual && (
                    <p
                      className={`text-sm mt-1 ${plan.highlight ? "text-white/70" : "text-[#374151] dark:text-[#CCCCCC]"}`}
                    >
                      {t("pricing.billing.equivalent")} R${" "}
                      {plan.monthlyEquivalent?.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                      /{t("pricing.billing.month")}
                    </p>
                  )}
                </div>
              </div>

              <EditableElement
                elementId={`plan-button-${plan.id}`}
                currentStyles={elementStyles[`plan-button-${plan.id}`] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full mb-8 px-3 py-2 text-xl h-auto font-semibold transition-all ${plan.id === "profissional" ? "bg-white text-black hover:bg-white/90 hover:shadow-lg" : "bg-[#2054DE] text-white hover:bg-[#2054DE]/90 hover:shadow-lg"}`}
                >
                  {language === "pt" ? "Teste grátis por 7 dias" : language === "en" ? "Free trial for 7 days" : "Prueba gratis por 7 días"}
                </Button>
              </EditableElement>
              <div className={`border-t ${plan.highlight ? "border-white/20" : "border-border"} mb-6`}></div>

              <div className="space-y-4">
                {plan.features.map((feature, index) => (
                  <EditableElement
                    key={index}
                    elementId={`plan-feature-${plan.id}-${index}`}
                    currentStyles={elementStyles[`plan-feature-${plan.id}-${index}`] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                  >
                    <div className="flex items-start gap-3">
                      {feature.included ? (
                        <Check
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlight ? "text-white" : "text-green-500"}`}
                        />
                      ) : (
                        <X className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                      )}
                      <span className={`text-base ${plan.highlight ? "text-white" : "text-foreground"}`}>
                        {feature.name}
                      </span>
                    </div>
                  </EditableElement>
                ))}
              </div>
            </Card>
          ))}
        </div>

      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-3 sm:px-4 lg:px-8 py-16 sm:py-20 md:py-28 border-t border-app-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <EditableElement
              elementId="faq-title"
              currentStyles={elementStyles["faq-title"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[28px] sm:text-[36px] md:text-[48px] font-bold mb-4 sm:mb-6 leading-[1.2] px-2"
            >
              {t("subscribe.faq.title")}
            </EditableElement>
            <EditableElement
              elementId="faq-subtitle"
              currentStyles={elementStyles["faq-subtitle"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[18px] sm:text-xl text-[#374151] dark:text-[#CCCCCC] px-2"
            >
              {t("subscribe.faq.subtitle")}
            </EditableElement>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem
              value="item-1"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <EditableElement
                elementId="faq-question-1"
                currentStyles={elementStyles["faq-question-1"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                  {t("subscribe.faq.q1.question")}
                </AccordionTrigger>
              </EditableElement>
              <EditableElement
                elementId="faq-answer-1"
                currentStyles={elementStyles["faq-answer-1"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                  {t("subscribe.faq.q1.answer")}
                </AccordionContent>
              </EditableElement>
            </AccordionItem>

            <AccordionItem
              value="item-2"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <EditableElement
                elementId="faq-question-2"
                currentStyles={elementStyles["faq-question-2"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                  {t("subscribe.faq.q2.question")}
                </AccordionTrigger>
              </EditableElement>
              <EditableElement
                elementId="faq-answer-2"
                currentStyles={elementStyles["faq-answer-2"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                  {t("subscribe.faq.q2.answer")}
                </AccordionContent>
              </EditableElement>
            </AccordionItem>

            <AccordionItem
              value="item-3"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <EditableElement
                elementId="faq-question-3"
                currentStyles={elementStyles["faq-question-3"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                  {t("subscribe.faq.q3.question")}
                </AccordionTrigger>
              </EditableElement>
              <EditableElement
                elementId="faq-answer-3"
                currentStyles={elementStyles["faq-answer-3"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                  {t("subscribe.faq.q3.answer")}
                </AccordionContent>
              </EditableElement>
            </AccordionItem>

            <AccordionItem
              value="item-3a"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <EditableElement
                elementId="faq-question-3a"
                currentStyles={elementStyles["faq-question-3a"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                  {t("subscribe.faq.q3a.question")}
                </AccordionTrigger>
              </EditableElement>
              <EditableElement
                elementId="faq-answer-3a"
                currentStyles={elementStyles["faq-answer-3a"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                  {t("subscribe.faq.q3a.answer")}
                </AccordionContent>
              </EditableElement>
            </AccordionItem>

            <AccordionItem
              value="item-4"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <EditableElement
                elementId="faq-question-4"
                currentStyles={elementStyles["faq-question-4"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                  {t("subscribe.faq.q4.question")}
                </AccordionTrigger>
              </EditableElement>
              <EditableElement
                elementId="faq-answer-4"
                currentStyles={elementStyles["faq-answer-4"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                  {t("subscribe.faq.q4.answer")}
                </AccordionContent>
              </EditableElement>
            </AccordionItem>

            <AccordionItem
              value="item-5"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <EditableElement
                elementId="faq-question-5"
                currentStyles={elementStyles["faq-question-5"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                  {t("subscribe.faq.q5.question")}
                </AccordionTrigger>
              </EditableElement>
              <EditableElement
                elementId="faq-answer-5"
                currentStyles={elementStyles["faq-answer-5"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                  {t("subscribe.faq.q5.answer")}
                </AccordionContent>
              </EditableElement>
            </AccordionItem>

            <AccordionItem
              value="item-6"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <EditableElement
                elementId="faq-question-6"
                currentStyles={elementStyles["faq-question-6"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                  {t("subscribe.faq.q6.question")}
                </AccordionTrigger>
              </EditableElement>
              <EditableElement
                elementId="faq-answer-6"
                currentStyles={elementStyles["faq-answer-6"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                  {t("subscribe.faq.q6.answer")}
                </AccordionContent>
              </EditableElement>
            </AccordionItem>

            <AccordionItem
              value="item-6b"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <EditableElement
                elementId="faq-question-6b"
                currentStyles={elementStyles["faq-question-6b"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                  {t("subscribe.faq.q6b.question")}
                </AccordionTrigger>
              </EditableElement>
              <EditableElement
                elementId="faq-answer-6b"
                currentStyles={elementStyles["faq-answer-6b"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                  {t("subscribe.faq.q6b.answer")}
                </AccordionContent>
              </EditableElement>
            </AccordionItem>

            <AccordionItem
              value="item-7"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <EditableElement
                elementId="faq-question-7"
                currentStyles={elementStyles["faq-question-7"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                  {t("subscribe.faq.q7.question")}
                </AccordionTrigger>
              </EditableElement>
              <EditableElement
                elementId="faq-answer-7"
                currentStyles={elementStyles["faq-answer-7"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                  {t("subscribe.faq.q7.answer")}
                </AccordionContent>
              </EditableElement>
            </AccordionItem>

            <AccordionItem
              value="item-8"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <EditableElement
                elementId="faq-question-8"
                currentStyles={elementStyles["faq-question-8"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                  {t("subscribe.faq.q8.question")}
                </AccordionTrigger>
              </EditableElement>
              <EditableElement
                elementId="faq-answer-8"
                currentStyles={elementStyles["faq-answer-8"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                  {t("subscribe.faq.q8.answer")}
                </AccordionContent>
              </EditableElement>
            </AccordionItem>

            <AccordionItem
              value="item-9"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <EditableElement
                elementId="faq-question-9"
                currentStyles={elementStyles["faq-question-9"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                  {t("subscribe.faq.q9.question")}
                </AccordionTrigger>
              </EditableElement>
              <EditableElement
                elementId="faq-answer-9"
                currentStyles={elementStyles["faq-answer-9"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                  {t("subscribe.faq.q9.answer")}
                </AccordionContent>
              </EditableElement>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-10 md:py-14 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <EditableElement
              elementId="final-cta-title"
              currentStyles={elementStyles["final-cta-title"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[28px] sm:text-[36px] md:text-[48px] font-bold mb-5 text-white leading-[1.3] max-w-5xl mx-auto"
            >
              {t("subscribe.final.title")}
            </EditableElement>

            <EditableElement
              elementId="final-cta-subtitle"
              currentStyles={elementStyles["final-cta-subtitle"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[20px] sm:text-[24px] md:text-3xl text-white/90 mb-12 font-light"
            >
              <p className="text-2xl">{t("subscribe.final.subtitle")}</p>
            </EditableElement>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <EditableElement
                elementId="final-cta-button"
                currentStyles={elementStyles["final-cta-button"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <Button
                  className="bg-white text-black hover:bg-white/90 text-xl sm:text-xl md:text-2xl px-6 sm:px-10 md:px-12 py-5 sm:py-6 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all"
                  onClick={() =>
                    window.scrollTo({
                      top: document.getElementById("pricing")?.offsetTop || 800,
                      behavior: "smooth",
                    })
                  }
                >
                  {t("subscribe.final.cta.button")}
                </Button>
              </EditableElement>

              <EditableElement
                elementId="final-cta-whatsapp-button"
                currentStyles={elementStyles["final-cta-whatsapp-button"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white text-xl sm:text-xl md:text-2xl px-6 sm:px-10 md:px-12 py-5 sm:py-6 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all"
                  onClick={() =>
                    window.open(
                      "https://wa.me/5544920001762?text=Ol%C3%A1!%20Vim%20atrav%C3%A9s%20da%20p%C3%A1gina%20do%20MigraBook%20e%20gostaria%20de%20tirar%20d%C3%BAvidas",
                      "_blank",
                    )
                  }
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  {t("subscribe.final.cta.whatsapp")}
                </Button>
              </EditableElement>
            </div>

            <EditableElement
              elementId="final-cta-features"
              currentStyles={elementStyles["final-cta-features"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="flex flex-wrap justify-center gap-8 md:gap-12 text-white/90 text-base md:text-lg"
            >
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>{t("subscribe.final.feature1")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>{t("subscribe.final.feature2")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>{t("subscribe.final.feature3")}</span>
              </div>
            </EditableElement>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 text-sm text-[#374151] dark:text-[#CCCCCC]">
            <p>© 2026 MigraBook. {t("subscribe.footer.rights")}</p>
            <div className="flex gap-6">
              <Link to="/privacidade" className="hover:text-foreground transition-colors">
                {t("subscribe.footer.privacy")}
              </Link>
              <Link to="/termos" className="hover:text-foreground transition-colors">
                {t("subscribe.footer.terms")}
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} onSuccess={handleAuthSuccess} />
      <EditorToolbar />

      {/* WhatsApp Support Button */}
      <a
        href="https://wa.me/5544920001762?text=Ol%C3%A1!%20Vim%20atrav%C3%A9s%20da%20p%C3%A1gina%20do%20MigraBook%20e%20gostaria%20de%20tirar%20d%C3%BAvidas"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="WhatsApp Support"
      >
        <MessageCircle className="w-7 h-7 text-white fill-white" />
      </a>
    </div>
  );
};
export default SubscribePage;
