import { useState, useEffect } from "react";
import VturbPlayer from "@/components/VturbPlayer";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
import ConsultorioPlanSection from "@/components/ConsultorioPlanSection";
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
import step1Mockup from "@/assets/step1-mockup.png";
import step2Mockup from "@/assets/step2-mockup.png";
import step3Mockup from "@/assets/step3-mockup.png";
import draCamilaApp from "@/assets/consultorio/dra-camila-app.png";
import angryEn from "@/assets/angry-en.png";
import angryEs from "@/assets/angry-es.png";
import seuAplicativoProprio from "@/assets/seu-aplicativo-proprio.png";
import valorAgregadoImg from "@/assets/valor-agregado.png";
import conteudoProtegido from "@/assets/conteudo-protegido.png";
import notificacoes from "@/assets/notificacoes-engajamento.png";
import iconeNotif from "@/assets/icone-notif.png";
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
import depoimento1 from "@/assets/testimonials/depoimento-1.png";
import depoimento2 from "@/assets/testimonials/depoimento-2.png";
import depoimento3 from "@/assets/testimonials/depoimento-3.png";
import depoimento4 from "@/assets/testimonials/depoimento-4.png";
import depoimento5 from "@/assets/testimonials/depoimento-5.png";
import depoimento6 from "@/assets/testimonials/depoimento-6.png";
import depoimento7 from "@/assets/testimonials/depoimento-7.png";
import depoimento8 from "@/assets/testimonials/depoimento-8.png";
import depoimento9 from "@/assets/testimonials/depoimento-9.png";
import imagemEnvioPdf from "@/assets/consultorio/imagem-envio-pdf.png";
import imagemEnvioPdf2 from "@/assets/consultorio/imagem-envio-pdf-2.png";
import appNutriPatricia from "@/assets/consultorio/app-nutri-patricia.png";
import appNutriPatricia2 from "@/assets/consultorio/app-nutri-patricia-2.png";
import checkGreen from "@/assets/consultorio/check-green.png";
import xRed from "@/assets/consultorio/x-red.png";
import avaliacoesAvatars from "@/assets/consultorio/avaliacoes-avatars.png";
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
const AccessPage = () => {
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

  // Plan refresh function
  const { refresh: refreshPlan } = usePlanContext();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // Nota: Os planos agora são gerenciados pelo componente ConsultorioPlanSection
  const plans: any[] = []; // Mantido para compatibilidade mas não usado
  const getPrice = () => "0"; // Mantido para compatibilidade
  const handleSubscribe = () => {}; // Mantido para compatibilidade
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
    <EditorProvider pageName="access-page">
      <AccessPageContent
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
const AccessPageContent = ({
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
              Transforme seus materiais de atendimento em um{" "}
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                aplicativo profissional
              </span>{" "}
              com o seu nome.
            </EditableElement>

            <EditableElement
              elementId="hero-subtitle"
              currentStyles={elementStyles["hero-subtitle"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              A forma como você entrega reflete o seu profissionalismo.
            </EditableElement>

            {/* Hero Content Grid - VSL + Comparison Cards */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch justify-center mb-8 sm:mb-12">
              {/* Left: VSL in Stories Format (Vertical) */}
              <div className="relative w-full max-w-[240px] sm:max-w-[280px] mx-auto lg:mx-0 shadow-2xl rounded-2xl overflow-hidden dark:border-[0.5px] dark:border-white/20 flex-shrink-0">
                <VturbPlayer
                  key="acesso-vsl"
                  videoId="6952e5c2acd48189f693e3a0"
                  accountId="e3c86e0f-335f-4aa4-935e-74ffd2429942"
                  className="w-full h-full"
                />
              </div>

              {/* Right: Comparison Cards */}
              <div className="flex flex-col gap-2 max-w-[420px] sm:max-w-[500px] justify-between md:mx-auto lg:mx-0">
                {/* Before Card - X Red */}
                <div className="bg-white dark:bg-gray-800/50 rounded-xl p-3 shadow-lg border border-gray-100 dark:border-gray-700/50 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-28 sm:w-32 rounded-lg overflow-hidden shadow-md">
                      <img
                        src={imagemEnvioPdf}
                        alt="PDFs enviados pelo WhatsApp"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-[18px] sm:text-[21px] md:text-[33px] font-semibold text-gray-900 dark:text-white mb-1 leading-[1.2]">
                        Antes era assim:
                      </h3>
                      <p className="text-[18px] sm:text-[16px] md:text-[20px] text-gray-600 dark:text-gray-300 leading-relaxed">
                        PDFs enviados pelo WhatsApp, que acabam perdidos, esquecidos ou simplesmente não são abertos.
                      </p>
                      <img src={xRed} alt="X" className="w-7 h-7 sm:w-7 sm:h-7 mt-1" />
                    </div>
                  </div>
                </div>

                {/* After Card - Check Green */}
                <div className="bg-white dark:bg-gray-800/50 rounded-xl p-3 shadow-lg border border-gray-100 dark:border-gray-700/50 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-28 sm:w-32 rounded-lg overflow-hidden shadow-md">
                      <img
                        src={appNutriPatricia}
                        alt="Aplicativo profissional"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-[18px] sm:text-[21px] md:text-[33px] font-semibold text-gray-900 dark:text-white mb-1 leading-[1.2]">
                        Agora é assim:
                      </h3>
                      <p className="text-[18px] sm:text-[16px] md:text-[20px] text-gray-600 dark:text-gray-300 leading-relaxed">
                        Um aplicativo com meu nome, organizado e instalado diretamente no celular do paciente.
                      </p>
                      <img src={checkGreen} alt="Check" className="w-7 h-7 sm:w-7 sm:h-7 mt-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Text and Button */}
            <EditableElement
              elementId="hero-cta-text"
              currentStyles={elementStyles["hero-cta-text"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[18px] sm:text-[20px] md:text-2xl text-gray-600 dark:text-gray-400 mb-4"
            >
              Quer entregar seus materiais de forma mais profissional?
            </EditableElement>

            <div className="flex justify-center">
              <EditableElement
                elementId="hero-cta-button"
                currentStyles={elementStyles["hero-cta-button"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <Button
                  className="bg-[#22C55E] hover:bg-[#16A34A] hover:scale-105 text-white px-6 sm:px-10 md:px-14 py-5 sm:py-6 md:py-7 text-lg sm:text-xl md:text-2xl h-auto rounded-xl font-semibold shadow-2xl hover:shadow-xl transition-all duration-300"
                  onClick={() =>
                    window.scrollTo({
                      top: document.getElementById("pricing")?.offsetTop || 800,
                      behavior: "smooth",
                    })
                  }
                >
                  Sim, Quero Meu App Agora
                </Button>
              </EditableElement>
            </div>

            {/* Professions Marquee */}
            <div className="mt-8 overflow-hidden">
              <div className="flex animate-marquee-fast sm:animate-marquee whitespace-nowrap">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-6 mx-4">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span>🩺</span> Médicos
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span>🧠</span> Psiquiatras
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span>🧩</span> Psicólogos
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span>🧠</span> Neuropsicólogos
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span>💬</span> Psicanalistas
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span>🍃</span> Nutricionistas
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span>🦵</span> Fisioterapeutas
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span>🧩</span> Terapeutas Ocupacionais
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span>🗣</span> Fonoaudiólogos
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span>📚</span> Psicopedagogos
                    </span>
                    <span className="text-gray-400">•</span>
                  </div>
                ))}
              </div>
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
              Quando você entrega um material em PDF, ele acaba sendo tratado como um simples arquivo.
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
                <p>Não porque o conteúdo é ruim. Mas porque o formato não ajuda.</p>
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
                  <p>"Vou te enviar um PDF com as orientações."</p>
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
                  <p>"Vou te enviar um aplicativo com as orientações."</p>
                </EditableElement>
              </Card>
            </div>

            {/* Percebe a diferença? */}
            <EditableElement
              elementId="difference-question"
              currentStyles={elementStyles["difference-question"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-center mb-4 text-foreground mt-12 md:mt-16 leading-[1.2]"
            >
              {t("subscribe.ebook.difference_question")}
            </EditableElement>
            <p className="text-center text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-8 sm:mb-28 md:mb-36">
              O conteúdo é o mesmo. A percepção, não.
            </p>

            {/* Visual Comparison - eBook vs App */}
            <div className="flex flex-col md:flex-row items-end justify-center gap-28 sm:gap-12 md:gap-16 mb-8 sm:mb-12 max-w-5xl mx-auto">
              {/* eBook Mockup */}
              <div className="flex-shrink-0 flex flex-col items-center w-full md:w-[320px]">
                <div className="flex items-end justify-center mb-4 sm:mb-8 h-[280px] sm:h-[320px] md:h-[360px]">
                  <img
                    src={imagemEnvioPdf2}
                    alt="Envio de PDFs por WhatsApp"
                    className="w-48 sm:w-56 md:w-64 h-auto rounded-lg object-cover"
                  />
                </div>
                <Card className="p-6 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 w-full flex items-center justify-center">
                  <EditableElement
                    elementId="ebook-mockup-caption"
                    currentStyles={elementStyles["ebook-mockup-caption"] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                    className="text-[16px] sm:text-[18px] text-foreground text-center"
                  >
                    <p>O primeiro soa amador.</p>
                  </EditableElement>
                </Card>
              </div>

              {/* App Mockup */}
              <div className="flex-shrink-0 flex flex-col items-center w-full md:w-[320px]">
                <div className="flex items-end justify-center mb-4 sm:mb-8 h-[240px] sm:h-[380px] md:h-[420px]">
                  <img
                    src={appNutriPatricia2}
                    alt="Aplicativo profissional da nutricionista"
                    className="w-56 sm:w-64 md:w-80 h-auto rounded-2xl object-cover"
                  />
                </div>
                <Card className="p-6 bg-blue-50 dark:bg-gray-800 border-2 border-[#A9CDFF] w-full flex items-center justify-center">
                  <EditableElement
                    elementId="app-mockup-caption"
                    currentStyles={elementStyles["app-mockup-caption"] || {}}
                    onStyleChange={updateElementStyle}
                    isEditMode={isEditMode}
                    className="text-[16px] sm:text-[18px] text-foreground text-center"
                  >
                    <p>O segundo é profissional.</p>
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
                <p>Aplicativo é organização, é cuidado, é profissionalismo.</p>
              </EditableElement>
              <EditableElement
                elementId="app-experience-para1"
                currentStyles={elementStyles["app-experience-para1"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
                className="text-[20px] sm:text-[22px] md:text-2xl text-foreground text-center"
              >
                <p>É algo que fica na tela inicial do smartphone, não perdido no download ou numa pasta.</p>
              </EditableElement>
              <EditableElement
                elementId="app-experience-para2"
                currentStyles={elementStyles["app-experience-para2"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
                className="text-[20px] sm:text-[22px] md:text-2xl font-semibold text-foreground text-center"
              >
                <p>Seu paciente percebe isso na hora.</p>
              </EditableElement>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-12 sm:py-14 md:py-20 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Ratings Badge */}
            <div className="flex flex-col items-center mb-8">
              <img 
                src={avaliacoesAvatars} 
                alt="Avatares de profissionais" 
                className="w-36 sm:w-40 h-auto mb-3"
              />
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-white/90 text-[18px] sm:text-[20px] md:text-2xl text-center">
                Avaliado por profissionais da saúde que já usam o MigraBook no dia a dia
              </p>
            </div>

            {/* Title */}
            <EditableElement
              elementId="testimonials-title"
              currentStyles={elementStyles["testimonials-title"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[28px] sm:text-[36px] md:text-[48px] font-bold mb-4 text-white text-center leading-[1.2]"
            >
              O que outros <span className="text-blue-200">profissionais da saúde</span><br />perceberam na prática
            </EditableElement>
            <p className="text-center text-[18px] sm:text-[20px] md:text-2xl text-white/80 mb-12 sm:mb-16">
              Resultados reais de quem já transformou seus materiais em aplicativos
            </p>

            {/* Testimonials Carousel */}
            <Carousel
              opts={{
                align: "start",
                loop: true,
                slidesToScroll: 1,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }) as any,
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {[
                  {
                    name: "Dr. Rafael Mendes",
                    role: "Médico Clínico Geral",
                    image: depoimento1,
                    quote: "Eu já entregava orientações aos pacientes, mas em PDF. Com o app, a forma como meu material é percebido mudou completamente. Ficou mais organizado, mais profissional e alinhado com o atendimento que eu presto."
                  },
                  {
                    name: "Dra. Paula Nogueira",
                    role: "Nutricionista",
                    image: depoimento2,
                    quote: "Antes eu enviava plano alimentar por WhatsApp. Sempre tinha paciente dizendo que perdeu o arquivo. Com o MigraBook, isso acabou. Hoje meu material fica no celular do paciente, do jeito certo."
                  },
                  {
                    name: "Lucas Ferreira",
                    role: "Fisioterapeuta",
                    image: depoimento3,
                    quote: "O que mais mudou foi a organização. Os exercícios não ficam mais espalhados em PDFs e mensagens. O paciente acessa tudo no app e isso reflete muito mais profissionalismo."
                  },
                  {
                    name: "Dra. Camila Rocha",
                    role: "Psicóloga",
                    image: depoimento4,
                    quote: "A forma de entrega faz diferença. Quando passei a usar o app, senti que o material ganhou mais valor. Não parece algo improvisado. Os pacientes percebem isso."
                  },
                  {
                    name: "Marcos Vinícius",
                    role: "Educador Físico Clínico",
                    image: depoimento5,
                    quote: "Eu já tinha os treinos bem estruturados, mas o formato não ajudava. No app, tudo ficou mais claro e organizado. Hoje a entrega está no nível do meu trabalho."
                  },
                  {
                    name: "André Lima",
                    role: "Fisioterapeuta",
                    image: depoimento6,
                    quote: "O paciente leva mais a sério quando o material vem em formato de app. A percepção muda. Não é só conteúdo, é apresentação e cuidado."
                  },
                  {
                    name: "Juliana Pacheco",
                    role: "Psicopedagoga",
                    image: depoimento7,
                    quote: "Os pais elogiaram muito a organização. Antes eu enviava PDFs separados. Agora tudo fica no app, fácil de acessar e muito mais profissional."
                  },
                  {
                    name: "Dr. Felipe Azevedo",
                    role: "Médico",
                    image: depoimento8,
                    quote: "O que me fez ficar foi isso: parar de parecer amador. O conteúdo é o mesmo, mas a forma como chega ao paciente faz toda a diferença."
                  },
                  {
                    name: "Dra. Renata Alves",
                    role: "Nutricionista",
                    image: depoimento9,
                    quote: "O MigraBook trouxe um padrão profissional para o meu atendimento. Não envio mais arquivos soltos. Tudo fica em um só lugar, com meu nome e minha identidade."
                  },
                ].map((testimonial, index) => (
                  <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="p-6 sm:p-8 bg-white/10 backdrop-blur-sm border border-white/20 text-center h-full">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                        <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{testimonial.name}</h3>
                      <p className="text-white/70 text-base sm:text-lg mb-4">{testimonial.role}</p>
                      <div className="flex justify-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <p className="text-white/90 italic text-base sm:text-lg leading-relaxed">
                        "{testimonial.quote}"
                      </p>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-2 mt-8">
                <CarouselPrevious className="static translate-y-0 bg-white/20 border-white/30 text-white hover:bg-white/30" />
                <CarouselNext className="static translate-y-0 bg-white/20 border-white/30 text-white hover:bg-white/30" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>


      {/* Professional App Section - Only for /acesso */}
      <section className="relative py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Image */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -left-8 top-1/4 w-32 h-32 border-l-4 border-blue-500 rounded-l-full opacity-60"></div>
                  <img
                    src={draCamilaApp}
                    alt="Aplicativo profissional para pacientes"
                    className="w-full max-w-md rounded-2xl shadow-xl"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <h2 className="text-[28px] sm:text-[32px] md:text-[40px] font-bold mb-10 text-foreground leading-[1.3]">
                  Muito mais que um app. Uma <span className="text-blue-600">forma profissional</span> de acompanhar seus pacientes.
                </h2>

                <div className="space-y-6">
                  {/* Item 1 */}
                  <div className="border-l-4 border-blue-500 rounded-sm pl-4 py-2">
                    <h3 className="text-[22px] sm:text-[24px] md:text-[26px] font-bold text-foreground mb-1">Tudo organizado em um só lugar</h3>
                    <p className="text-muted-foreground text-[18px] sm:text-[20px] md:text-[22px]">Nada de arquivos soltos ou esquecidos no WhatsApp.</p>
                  </div>

                  {/* Item 2 */}
                  <div className="border-l-4 border-blue-500 rounded-sm pl-4 py-2">
                    <h3 className="text-[22px] sm:text-[24px] md:text-[26px] font-bold text-foreground mb-1">Identidade profissional</h3>
                    <p className="text-muted-foreground text-[18px] sm:text-[20px] md:text-[22px]">Seu nome, seu visual e seu conteúdo no celular do paciente.</p>
                  </div>

                  {/* Item 3 */}
                  <div className="border-l-4 border-blue-500 rounded-sm pl-4 py-2">
                    <h3 className="text-[22px] sm:text-[24px] md:text-[26px] font-bold text-foreground mb-1">Atualizações simples</h3>
                    <p className="text-muted-foreground text-[18px] sm:text-[20px] md:text-[22px]">Atualizou uma vez, todos os pacientes recebem.</p>
                  </div>

                  {/* Item 4 */}
                  <div className="border-l-4 border-blue-500 rounded-sm pl-4 py-2">
                    <h3 className="text-[22px] sm:text-[24px] md:text-[26px] font-bold text-foreground mb-1">Acesso fácil e imediato</h3>
                    <p className="text-muted-foreground text-[18px] sm:text-[20px] md:text-[22px]">Um link, um clique, pronto. Sem complicação.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Passos Simples Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-gray-50 via-gray-100/50 to-gray-50 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-foreground mb-4 leading-[1.2]">
                Seu aplicativo pronto em 3 passos simples
              </h2>
              <p className="text-[18px] sm:text-[20px] md:text-2xl text-muted-foreground">
                Você não precisa saber programar, nem lidar com parte técnica.
              </p>
            </div>

            {/* Steps Container with Timeline */}
            <div className="relative">
              {/* Vertical Timeline Line - Hidden on mobile */}
              <div className="hidden md:block absolute left-[60px] top-[90px] bottom-[90px] w-[3px] bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-400 dark:from-emerald-600 dark:via-emerald-500 dark:to-emerald-600" />

              {/* Steps */}
              <div className="space-y-12 md:space-y-16">
                {/* Passo 1 */}
                <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-8 md:gap-12 md:pl-[120px]">
                  {/* Timeline Dot - Hidden on mobile */}
                  <div className="hidden md:flex absolute left-[48px] top-1/2 -translate-y-1/2 w-[28px] h-[28px] rounded-full bg-emerald-500 dark:bg-emerald-400 border-4 border-white dark:border-gray-900 shadow-lg z-20" />

                  {/* Content Card */}
                  <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/60 dark:from-gray-800/90 dark:to-gray-800/70 rounded-2xl p-8 md:p-10 border border-emerald-100/50 dark:border-gray-700/50">
                    <h3 className="text-[28px] sm:text-[32px] md:text-[36px] font-bold text-emerald-700 dark:text-emerald-400 mb-2 leading-[1.1]">
                      Passo 1:
                    </h3>
                    <h4 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold text-emerald-700 dark:text-emerald-400 mb-4">
                      Envie seu material
                    </h4>
                    <p className="text-[16px] sm:text-[18px] md:text-[20px] text-muted-foreground leading-relaxed">
                      Você importa o conteúdo que já usa hoje (PDF, vídeos ou materiais).
                    </p>
                  </div>

                  {/* Phone Mockup */}
                  <div className="flex justify-center md:justify-end md:-my-10">
                    <img
                      src={step1Mockup}
                      alt="Envie seu material"
                      className="w-56 sm:w-64 md:w-72 lg:w-80 h-auto drop-shadow-2xl"
                    />
                  </div>
                </div>

                {/* Passo 2 */}
                <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-8 md:gap-12 md:pl-[120px]">
                  {/* Timeline Dot - Hidden on mobile */}
                  <div className="hidden md:flex absolute left-[48px] top-1/2 -translate-y-1/2 w-[28px] h-[28px] rounded-full bg-purple-500 dark:bg-purple-400 border-4 border-white dark:border-gray-900 shadow-lg z-20" />

                  {/* Content Card */}
                  <div className="bg-purple-100/70 dark:bg-gray-800/90 rounded-2xl p-8 md:p-10 border border-purple-200/50 dark:border-gray-700/50">
                    <h3 className="text-[28px] sm:text-[32px] md:text-[36px] font-bold text-purple-700 dark:text-purple-400 mb-2 leading-[1.1]">
                      Passo 2:
                    </h3>
                    <h4 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold text-purple-700 dark:text-purple-400 mb-4">
                      Personalize o visual
                    </h4>
                    <p className="text-[16px] sm:text-[18px] md:text-[20px] text-muted-foreground leading-relaxed">
                      Adicione seu nome, escolha as cores e pronto.
                    </p>
                  </div>

                  {/* Phone Mockup */}
                  <div className="flex justify-center md:justify-end md:-my-10">
                    <img
                      src={step2Mockup}
                      alt="Personalize o visual"
                      className="w-56 sm:w-64 md:w-72 lg:w-80 h-auto drop-shadow-2xl"
                    />
                  </div>
                </div>

                {/* Passo 3 */}
                <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-8 md:gap-12 md:pl-[120px]">
                  {/* Timeline Dot - Hidden on mobile */}
                  <div className="hidden md:flex absolute left-[48px] top-1/2 -translate-y-1/2 w-[28px] h-[28px] rounded-full bg-blue-500 dark:bg-blue-400 border-4 border-white dark:border-gray-900 shadow-lg z-20" />

                  {/* Content Card */}
                  <div className="bg-gradient-to-br from-blue-50/80 to-sky-50/60 dark:from-gray-800/90 dark:to-gray-800/70 rounded-2xl p-8 md:p-10 border border-blue-100/50 dark:border-gray-700/50">
                    <h3 className="text-[28px] sm:text-[32px] md:text-[36px] font-bold text-blue-700 dark:text-blue-400 mb-2 leading-[1.1]">
                      Passo 3:
                    </h3>
                    <h4 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold text-blue-700 dark:text-blue-400 mb-4">
                      Envie para seus pacientes
                    </h4>
                    <p className="text-[16px] sm:text-[18px] md:text-[20px] text-muted-foreground leading-relaxed">
                      O app fica pronto. Você envia o link e o paciente acessa no celular.
                    </p>
                  </div>

                  {/* Phone Mockup */}
                  <div className="flex justify-center md:justify-end md:-my-10">
                    <img
                      src={step3Mockup}
                      alt="Envie para seus pacientes"
                      className="w-56 sm:w-64 md:w-72 lg:w-80 h-auto drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Final text */}
            <div className="text-center mt-16 md:mt-20">
              <p className="text-[20px] sm:text-[22px] md:text-[26px] font-bold text-foreground mb-2">
                No fim, não é sobre tecnologia.
              </p>
              <p className="text-[18px] sm:text-[20px] md:text-2xl text-muted-foreground">
                É sobre facilitar o uso e respeitar o tempo do paciente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Plano Consultório */}
      <div id="pricing">
        <ConsultorioPlanSection />
      </div>

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
              <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                O que é o MigraBook?
              </AccordionTrigger>
              <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                O MigraBook é uma forma simples de transformar os materiais que você já entrega em um aplicativo profissional com o seu nome.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-2"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                Como funciona o MigraBook?
              </AccordionTrigger>
              <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                Você importa o material que já utiliza (PDF, vídeos ou outros conteúdos), personaliza o visual do aplicativo com seu nome, publica e pronto. O MigraBook cria seu aplicativo automaticamente. Você envia o link ao paciente e ele acessa tudo pelo celular, de forma organizada e profissional.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-3"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                O paciente precisa baixar algo na Play Store ou App Store?
              </AccordionTrigger>
              <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                Não. O acesso acontece diretamente pelo link que você envia. O app é adicionado à tela inicial do celular, sem lojas, sem complicação.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-4"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                Preciso colocar o aplicativo na Play Store ou App Store?
              </AccordionTrigger>
              <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                Não é necessário. Publicar em lojas envolve custos e etapas adicionais. Com o MigraBook, o acesso acontece diretamente pelo link do aplicativo.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-5"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                O paciente pode acessar pelo computador?
              </AccordionTrigger>
              <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                Sim. O mesmo aplicativo funciona no navegador do computador, com adaptação automática de tela.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-6"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                Posso atualizar o conteúdo do app depois de publicado?
              </AccordionTrigger>
              <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                Sim. Sempre que você atualizar o material ou o visual dentro do app, todos os pacientes veem a nova versão automaticamente. Não é preciso reenviar arquivos.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-7"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                Preciso saber programar para usar?
              </AccordionTrigger>
              <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                Não. Você só importa o material, ajusta o visual e publica. Sem código, sem parte técnica.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-8"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                Quanto tempo leva para transformar meu material em um app?
              </AccordionTrigger>
              <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                A geração do app é imediata. Você importa o conteúdo, visualiza a prévia e pode publicar no mesmo momento.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-9"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                Como funciona o cancelamento?
              </AccordionTrigger>
              <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                O cancelamento interrompe apenas as renovações futuras. Você continua com acesso até o fim do período já pago.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-10"
              className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
            >
              <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                O que acontece se eu cancelar a assinatura?
              </AccordionTrigger>
              <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                O aplicativo deixa de funcionar e o acesso ao conteúdo é interrompido. Antes de cancelar, recomendamos salvar sua lista de pacientes e definir outra forma de entrega, se desejar manter o material disponível.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-10 md:py-14 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <EditableElement
              elementId="final-cta-title"
              currentStyles={elementStyles["final-cta-title"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[28px] sm:text-[32px] md:text-[48px] font-bold mb-5 text-white leading-[1.2] max-w-6xl mx-auto text-center px-2"
            >
              <p className="md:whitespace-nowrap">Pronto para transformar a forma como você</p>
              <p className="md:whitespace-nowrap">entrega seus materiais aos pacientes?</p>
            </EditableElement>

            <EditableElement
              elementId="final-cta-subtitle"
              currentStyles={elementStyles["final-cta-subtitle"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[18px] sm:text-[20px] md:text-2xl text-white/90 mb-10 font-light max-w-3xl mx-auto text-center"
            >
              <p>Junte-se a profissionais da saúde que já deixaram o PDF para trás e hoje entregam seus materiais com mais organização, clareza e profissionalismo.</p>
            </EditableElement>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <EditableElement
                elementId="final-cta-button"
                currentStyles={elementStyles["final-cta-button"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <Button
                  className="bg-white text-blue-600 hover:bg-white/90 text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-5 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all"
                  onClick={() =>
                    window.scrollTo({
                      top: document.getElementById("pricing")?.offsetTop || 800,
                      behavior: "smooth",
                    })
                  }
                >
                  Criar Meu App Agora
                </Button>
              </EditableElement>

              <EditableElement
                elementId="final-cta-whatsapp-button"
                currentStyles={elementStyles["final-cta-whatsapp-button"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-5 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all"
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
                  Falar no WhatsApp
                </Button>
              </EditableElement>
            </div>

            <EditableElement
              elementId="final-cta-features"
              currentStyles={elementStyles["final-cta-features"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="flex flex-wrap justify-center gap-6 md:gap-10 text-white/90 text-base md:text-lg"
            >
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>Sem necessidade de programação</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>Suporte completo</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>Resultado em minutos</span>
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
export default AccessPage;
