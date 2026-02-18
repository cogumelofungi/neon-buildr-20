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
  Search,
  Clock,
} from "lucide-react";
import { useAuthState } from "@/hooks/auth";
import { AuthDialog } from "@/components/AuthDialog";
import { PlanosAuthDialog } from "@/components/PlanosAuthDialog";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import step1Mockup from "@/assets/planos/mb-passo1.png";
import step2Mockup from "@/assets/planos/mb-passo2.png";
import step3Mockup from "@/assets/planos/mb-passo3.png";
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
import pdfWhatsappImage from "@/assets/consultorio/imagem-envio-pdf-3.png";
import appNutriPatricia from "@/assets/consultorio/app-nutri-patricia-3.png";
import mbFc1 from "@/assets/planos/mb-fc-7-3.png";
import mbFc2 from "@/assets/planos/mb-fc-2.png";
import mbFc3 from "@/assets/planos/mb-fc-3.png";
import mbFc4 from "@/assets/planos/mb-fc-4.png";
import mbFc5 from "@/assets/planos/mb-fc-5.png";
import mbFc6 from "@/assets/planos/mb-fc-6.png";
import hotmartLogo from "@/assets/logos/hotmart-logo.png";
import eduzzLogo from "@/assets/logos/eduzz-logo.png";
import kiwifyLogo from "@/assets/logos/kiwify-logo.png";
import monetizzeLogo from "@/assets/logos/monetizze-logo.png";
import stripeLogo from "@/assets/logos/stripe-logo.png";
import perfectpayLogo from "@/assets/logos/perfectpay-logo.png";
import cartpandaLogo from "@/assets/logos/cartpanda-logo.png";
import caktoLogo from "@/assets/logos/cakto-logo.png";
import mundpayLogo from "@/assets/logos/mundpay-logo.png";
import yampiLogo from "@/assets/logos/yampi-logo.png";
import iconGrowth from "@/assets/planos/icon-growth.png";
import iconMoney from "@/assets/planos/icon-money.png";
import iconSync from "@/assets/planos/icon-sync.png";
import iconPhone from "@/assets/planos/icon-phone.png";
import iconLightbulb from "@/assets/planos/icon-lightbulb.png";
import iconRocket from "@/assets/planos/icon-rocket.png";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import mbFc7 from "@/assets/planos/mb-fc-7.png";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { EditorProvider, useEditor } from "@/contexts/EditorContext";
import { EditableElement } from "@/components/editor/EditableElement";
import { EditorToolbar } from "@/components/editor/EditorToolbar";

// Countdown Timer Component
const CountdownTimer = ({ language, t }: { language: string; t: (key: string) => string }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 0,
    seconds: 0,
  });
  useEffect(() => {
    const storageKey = "migrabook_promo_end_time_v2";
    const DURATION_HOURS = 8;
    const MAX_HOURS = 8;
    const getOrCreateEndTime = () => {
      let endTime = localStorage.getItem(storageKey);
      const now = new Date().getTime();

      if (!endTime || parseInt(endTime) <= now || parseInt(endTime) - now > MAX_HOURS * 60 * 60 * 1000) {
        const end = new Date();
        end.setHours(end.getHours() + DURATION_HOURS);
        endTime = end.getTime().toString();
        localStorage.setItem(storageKey, endTime);
      }
      return parseInt(endTime);
    };
    let endTimeValue = getOrCreateEndTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      let diff = endTimeValue - now;

      if (diff <= 0) {
        const end = new Date();
        end.setHours(end.getHours() + DURATION_HOURS);
        endTimeValue = end.getTime();
        localStorage.setItem(storageKey, endTimeValue.toString());
        diff = endTimeValue - now;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({
        hours,
        minutes,
        seconds,
      });
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);
  const formatNumber = (num: number) => num.toString().padStart(2, "0");
  return (
    <section className="py-6 md:py-8 bg-red-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-white" />
            <span className="text-white text-lg md:text-xl font-medium">{t("planos.countdown.title")}</span>
          </div>

          <div className="flex items-center justify-center gap-2 md:gap-4">
            <div className="flex flex-col items-center">
              <div className="bg-white text-red-600 text-3xl md:text-5xl font-bold px-4 py-2 md:px-6 md:py-3 rounded-lg min-w-[70px] md:min-w-[90px]">
                {formatNumber(timeLeft.hours)}
              </div>
              <span className="text-white text-sm mt-1">{t("planos.countdown.hours")}</span>
            </div>

            <span className="text-white text-3xl md:text-5xl font-bold">:</span>

            <div className="flex flex-col items-center">
              <div className="bg-white text-red-600 text-3xl md:text-5xl font-bold px-4 py-2 md:px-6 md:py-3 rounded-lg min-w-[70px] md:min-w-[90px]">
                {formatNumber(timeLeft.minutes)}
              </div>
              <span className="text-white text-sm mt-1">{t("planos.countdown.minutes")}</span>
            </div>

            <span className="text-white text-3xl md:text-5xl font-bold">:</span>

            <div className="flex flex-col items-center">
              <div className="bg-white text-red-600 text-3xl md:text-5xl font-bold px-4 py-2 md:px-6 md:py-3 rounded-lg min-w-[70px] md:min-w-[90px]">
                {formatNumber(timeLeft.seconds)}
              </div>
              <span className="text-white text-sm mt-1">{t("planos.countdown.seconds")}</span>
            </div>
          </div>

          <p className="text-white/90 text-sm mt-4 font-semibold md:text-2xl">{t("planos.countdown.disclaimer")}</p>
        </div>
      </div>
    </section>
  );
};

// Final CTA Countdown Timer Component (same timer, different style)
const FinalCountdownTimer = ({ language, t }: { language: string; t: (key: string) => string }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 0,
    seconds: 0,
  });
  useEffect(() => {
    const storageKey = "migrabook_promo_end_time_v2";
    const DURATION_HOURS = 8;
    const MAX_HOURS = 8;
    const getOrCreateEndTime = () => {
      let endTime = localStorage.getItem(storageKey);
      const now = new Date().getTime();

      if (!endTime || parseInt(endTime) <= now || parseInt(endTime) - now > MAX_HOURS * 60 * 60 * 1000) {
        const end = new Date();
        end.setHours(end.getHours() + DURATION_HOURS);
        endTime = end.getTime().toString();
        localStorage.setItem(storageKey, endTime);
      }
      return parseInt(endTime);
    };
    let endTimeValue = getOrCreateEndTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      let diff = endTimeValue - now;
      if (diff <= 0) {
        const end = new Date();
        end.setHours(end.getHours() + DURATION_HOURS);
        endTimeValue = end.getTime();
        localStorage.setItem(storageKey, endTimeValue.toString());
        diff = endTimeValue - now;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({
        hours,
        minutes,
        seconds,
      });
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);
  const formatNumber = (num: number) => num.toString().padStart(2, "0");
  return (
    <div className="flex items-center justify-center gap-2 md:gap-3">
      <div className="flex flex-col items-center">
        <div className="bg-white text-gray-900 text-2xl md:text-4xl font-bold px-4 py-2 md:px-5 md:py-3 rounded-lg min-w-[60px] md:min-w-[80px] shadow-lg">
          {formatNumber(timeLeft.hours)}
        </div>
        <span className="text-white text-xs md:text-sm mt-1 uppercase tracking-wide">
          {t("planos.countdown.hours")}
        </span>
      </div>

      <div className="flex flex-col items-center">
        <div className="bg-white text-gray-900 text-2xl md:text-4xl font-bold px-4 py-2 md:px-5 md:py-3 rounded-lg min-w-[60px] md:min-w-[80px] shadow-lg">
          {formatNumber(timeLeft.minutes)}
        </div>
        <span className="text-white text-xs md:text-sm mt-1 uppercase tracking-wide">
          {t("planos.countdown.minutes")}
        </span>
      </div>

      <div className="flex flex-col items-center">
        <div className="bg-white text-gray-900 text-2xl md:text-4xl font-bold px-4 py-2 md:px-5 md:py-3 rounded-lg min-w-[60px] md:min-w-[80px] shadow-lg">
          {formatNumber(timeLeft.seconds)}
        </div>
        <span className="text-white text-xs md:text-sm mt-1 uppercase tracking-wide">
          {t("planos.countdown.seconds")}
        </span>
      </div>
    </div>
  );
};

const AppCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { language } = useLanguage();

  const images =
    language === "en"
      ? [appCarouselEn1, appCarouselEn2, appCarouselEn3, appCarouselEn4]
      : language === "es"
        ? [appCarouselEs1, appCarouselEs2, appCarouselEs3, appCarouselEs4]
        : [appCarousel1, appCarousel2, appCarousel3, appCarousel4];

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
            className={`w-full rounded-2xl shadow-2xl transition-opacity duration-1000 ${index === currentIndex ? "opacity-100" : "opacity-0 absolute inset-0"}`}
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
    {
      name: "Mundpay",
      logo: mundpayLogo,
    },
    {
      name: "Yampi",
      logo: yampiLogo,
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

const AssinaturaPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthState();
  const { theme, setTheme } = useTheme();
  const { language, t, setLanguage } = useLanguage();
  const [isAnnual, setIsAnnual] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [selectedPlanName, setSelectedPlanName] = useState<string>("");
  const [selectedOriginalPrice, setSelectedOriginalPrice] = useState<number | undefined>();
  const [selectedCurrentPrice, setSelectedCurrentPrice] = useState<number | undefined>();
  const [isScrolled, setIsScrolled] = useState(false);

  const { isAdmin, isLoading: isAdminLoading } = useAdminAuth();

  useUtmCapture();

  useEffect(() => {
    initFacebookTracking();
  }, []);

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
      subtitle:
        language === "pt"
          ? "Ideal para quem está começando"
          : language === "en"
            ? "Ideal for beginners"
            : "Ideal para principiantes",
      monthlyPrice: 47,
      annualPrice: 470,
      monthlyEquivalent: 39.16,
      originalMonthlyPrice: 97,
      originalAnnualPrice: 1164,
      maxApps: 1,
      features: [
        {
          name:
            language === "pt"
              ? "Transforme seu eBook em app profissional em 3 minutos"
              : language === "en"
                ? "Transform your eBook into a professional app in 3 minutes"
                : "Transforma tu eBook en app profesional en 3 minutos",
          included: true,
        },
        {
          name:
            language === "pt"
              ? "Cliente acessa com 1 clique (sem cadastro, sem senha)"
              : language === "en"
                ? "Customer accesses with 1 click (no registration, no password)"
                : "Cliente accede con 1 clic (sin registro, sin contraseña)",
          included: true,
        },
        {
          name:
            language === "pt"
              ? "Até 10 eBooks/PDFs + áudios por app (cada PDF até 200 páginas)"
              : language === "en"
                ? "Up to 10 eBooks/PDFs + audios per app (each PDF up to 200 pages)"
                : "Hasta 10 eBooks/PDFs + audios por app (cada PDF hasta 200 páginas)",
          included: true,
        },
        {
          name:
            language === "pt"
              ? "Usuários finais ilimitados (venda para quantos quiser)"
              : language === "en"
                ? "Unlimited end users (sell to as many as you want)"
                : "Usuarios finales ilimitados (vende a cuantos quieras)",
          included: true,
        },
        {
          name:
            language === "pt"
              ? "Atualize o conteúdo sem reenviar nada para os clientes"
              : language === "en"
                ? "Update content without resending anything to customers"
                : "Actualiza el contenido sin reenviar nada a los clientes",
          included: true,
        },
        {
          name:
            language === "pt"
              ? "Funciona em Android, iOS e Web (compatibilidade total)"
              : language === "en"
                ? "Works on Android, iOS and Web (full compatibility)"
                : "Funciona en Android, iOS y Web (compatibilidad total)",
          included: true,
        },
      ],
      highlight: false,
    },
    {
      id: "profissional",
      name: t("pricing.plan.profissional.name"),
      description: t("pricing.plan.profissional.description"),
      subtitle:
        language === "pt"
          ? "Para quem já vende e quer escalar"
          : language === "en"
            ? "For those who sell and want to scale"
            : "Para quienes ya venden y quieren escalar",
      monthlyPrice: 97,
      annualPrice: 970,
      monthlyEquivalent: 80.83,
      originalMonthlyPrice: 197,
      originalAnnualPrice: 2364,
      maxApps: 3,
      features: [
        {
          name:
            language === "pt"
              ? "Tudo do Essencial +"
              : language === "en"
                ? "Everything from Essential +"
                : "Todo del Esencial +",
          included: true,
          isBold: true,
        },
        {
          name:
            language === "pt"
              ? "Até 15 eBooks/PDFs + áudios por app (cada PDF até 200 páginas)"
              : language === "en"
                ? "Up to 15 eBooks/PDFs + audios per app (each PDF up to 200 pages)"
                : "Hasta 15 eBooks/PDFs + audios por app (cada PDF hasta 200 páginas)",
          included: true,
        },
        {
          name:
            language === "pt"
              ? "Botão de WhatsApp integrado (suporte direto ou vendas no app)"
              : language === "en"
                ? "Integrated WhatsApp button (direct support or sales in the app)"
                : "Botón de WhatsApp integrado (soporte directo o ventas en la app)",
          included: true,
        },
        {
          name:
            language === "pt"
              ? "Notificações push para reengajar clientes"
              : language === "en"
                ? "Push notifications to re-engage customers"
                : "Notificaciones push para reenganchar clientes",
          included: true,
        },
        {
          name:
            language === "pt"
              ? "Integração nativa com Hotmart, Kiwify, Monetizze e outras"
              : language === "en"
                ? "Native integration with Hotmart, Kiwify, Monetizze and others"
                : "Integración nativa con Hotmart, Kiwify, Monetizze y otras",
          included: true,
        },
      ],
      highlight: true,
    },
    {
      id: "empresarial",
      name: t("pricing.plan.empresarial.name"),
      description: t("pricing.plan.empresarial.description"),
      subtitle:
        language === "pt"
          ? "Para alto volume de vendas"
          : language === "en"
            ? "For high volume sales"
            : "Para alto volumen de ventas",
      monthlyPrice: 197,
      annualPrice: 1970,
      monthlyEquivalent: 164.16,
      originalMonthlyPrice: 397,
      originalAnnualPrice: 4764,
      maxApps: -1,
      features: [
        {
          name:
            language === "pt"
              ? "Tudo do Profissional +"
              : language === "en"
                ? "Everything from Professional +"
                : "Todo del Profesional +",
          included: true,
          isBold: true,
        },
        {
          name:
            language === "pt"
              ? "Até 20 eBooks/PDFs + áudios por app (cada PDF até 200 páginas)"
              : language === "en"
                ? "Up to 20 eBooks/PDFs + audios per app (each PDF up to 200 pages)"
                : "Hasta 20 eBooks/PDFs + audios por app (cada PDF hasta 200 páginas)",
          included: true,
        },
        {
          name:
            language === "pt"
              ? "Vídeos integrados no app (aulas, tutoriais direto no aplicativo)"
              : language === "en"
                ? "Integrated videos in the app (classes, tutorials directly in the app)"
                : "Videos integrados en la app (clases, tutoriales directo en la aplicación)",
          included: true,
        },
        {
          name:
            language === "pt"
              ? "Upsell e Order Bump dentro do app (venda mais dentro do aplicativo)"
              : language === "en"
                ? "Upsell and Order Bump inside the app (sell more within the app)"
                : "Upsell y Order Bump dentro de la app (vende más dentro de la app)",
          included: true,
        },
        {
          name:
            language === "pt"
              ? "Templates premium exclusivos (visual de app de R$ 10k+)"
              : language === "en"
                ? "Exclusive premium templates ($2k+ app visuals)"
                : "Templates premium exclusivos (visual de app de $2k+)",
          included: true,
        },
        {
          name:
            language === "pt"
              ? "Domínio personalizado com sua marca (app.suamarca.com)"
              : language === "en"
                ? "Custom domain with your brand (app.yourbrand.com)"
                : "Dominio personalizado con tu marca (app.tumarca.com)",
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
    const selectedPlan = plans.find((p) => p.id === planId);
    if (selectedPlan) {
      setSelectedPlanName(selectedPlan.name);
      setPendingPlanId(planId);
      const originalPrice = isAnnual ? selectedPlan.originalAnnualPrice : selectedPlan.originalMonthlyPrice;
      const currentPrice = isAnnual ? selectedPlan.annualPrice : selectedPlan.monthlyPrice;
      setSelectedOriginalPrice(originalPrice);
      setSelectedCurrentPrice(currentPrice);
      setShowAuthDialog(true);
    }
  };

  const handleAuthSuccess = async () => {
    setShowAuthDialog(false);

    if (pendingPlanId) {
      navigate(`/checkout?plan=${pendingPlanId}&billing=${isAnnual ? "annual" : "monthly"}`);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) {
      console.warn("[AssinaturaPage] No user session found after auth");
      navigate("/pricing");
      return;
    }

    const planResult = await refreshPlan(userId);
    console.log("🔄 [AssinaturaPage] Redirecting after auth:", planResult);

    if (planResult.hasActivePlan) {
      navigate("/app");
    } else {
      navigate("/pricing");
    }
  };

  return (
    <EditorProvider pageName="assinatura-page">
      <AssinaturaPageContent
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
        selectedPlanName={selectedPlanName}
        selectedOriginalPrice={selectedOriginalPrice}
        selectedCurrentPrice={selectedCurrentPrice}
        isScrolled={isScrolled}
        plans={plans}
        getPrice={getPrice}
        handleSubscribe={handleSubscribe}
        handleAuthSuccess={handleAuthSuccess}
      />
    </EditorProvider>
  );
};

const AssinaturaPageContent = ({
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
  selectedPlanName,
  selectedOriginalPrice,
  selectedCurrentPrice,
  isScrolled,
  plans,
  getPrice,
  handleSubscribe,
  handleAuthSuccess,
}: any) => {
  const { isEditMode, elementStyles, updateElementStyle, resetChanges } = useEditor();
  const [showPlansVideoDialog, setShowPlansVideoDialog] = useState(false);
  const [plansVideoInstance, setPlansVideoInstance] = useState(0);

  const handlePlansVideoOpenChange = (open: boolean) => {
    setShowPlansVideoDialog(open);
    if (open) setPlansVideoInstance((v) => v + 1);
  };

  useEffect(() => {
    resetChanges();
  }, []);

  // The rest of the content is identical to PlanosPageContent
  // Import and use from PlanosPage or copy the full JSX here
  // For now, redirecting to /planos to avoid code duplication

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
              {/* Como funciona? Link */}
              <Button
                variant="ghost"
                className="h-10 px-4 text-foreground hover:text-white hover:bg-primary"
                onClick={() =>
                  document.getElementById("como-funciona")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                {language === "pt" ? "Como funciona?" : language === "en" ? "How it works?" : "¿Cómo funciona?"}
              </Button>

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
              <Button variant="outline" className="h-10 px-4" onClick={() => navigate("/login")}>
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
                  <DropdownMenuItem
                    onClick={() =>
                      document.getElementById("como-funciona")?.scrollIntoView({
                        behavior: "smooth",
                      })
                    }
                  >
                    {language === "pt" ? "Como funciona?" : language === "en" ? "How it works?" : "¿Cómo funciona?"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/login")}>Login</DropdownMenuItem>
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
              className="text-[28px] sm:text-[36px] md:text-[50px] font-bold mb-3 sm:mb-4 leading-[1.2]"
            >
              <span className="md:whitespace-nowrap">
                Transforme Qualquer eBook em <span className="text-[#2054DE]">App Profissional</span>
              </span>
              <br className="hidden md:block" />
              <span className="hidden md:inline">em </span>
              <span className="md:hidden"> em </span>3 Minutos e{" "}
              <span className="underline decoration-[#2054DE] decoration-4 underline-offset-4">Venda 3x Mais</span> (sem
              precisar entender nada de tecnologia)
            </EditableElement>

            <EditableElement
              elementId="hero-subtitle"
              currentStyles={elementStyles["hero-subtitle"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              {language === "pt" ? (
                <>
                  <span className="sm:hidden">
                    Mesmo conteúdo, novo formato, nova percepção → mais vendas. Pessoas passam a pagar mais por uma
                    experiência de app.
                  </span>
                  <span className="hidden sm:inline">
                    Mesmo conteúdo, novo formato, nova percepção → mais vendas.
                    <br />
                    Pessoas passam a pagar mais por uma experiência de app.
                  </span>
                </>
              ) : language === "en" ? (
                <>
                  <span className="sm:hidden">
                    Same content, new format, new perception → more sales. People pay more for an app experience.
                  </span>
                  <span className="hidden sm:inline">
                    Same content, new format, new perception → more sales.
                    <br />
                    People pay more for an app experience.
                  </span>
                </>
              ) : (
                <>
                  <span className="sm:hidden">
                    Mismo contenido, nuevo formato, nueva percepción → más ventas. Las personas pagan más por una
                    experiencia de app.
                  </span>
                  <span className="hidden sm:inline">
                    Mismo contenido, nuevo formato, nueva percepción → más ventas.
                    <br />
                    Las personas pagan más por una experiencia de app.
                  </span>
                </>
              )}
            </EditableElement>

            {/* Hero Image + Benefits Section - A/B Test without VSL */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 mb-8 sm:mb-12">
              {/* Left: Transformation Image */}
              <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                <img
                  src={mbFc7}
                  alt="Transforme PDF em App Profissional"
                  className="w-full max-w-[400px] lg:max-w-[450px] h-auto"
                />
              </div>

              {/* Right: Benefits Bullets */}
              <div className="w-full lg:w-1/2 space-y-5 text-left">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-7 h-7 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-[18px] sm:text-[20px] md:text-2xl">
                      {language === "pt"
                        ? "Transforme PDF em App Completo em 3 Minutos"
                        : language === "en"
                          ? "Transform PDF into Complete App in 3 Minutes"
                          : "Transforma PDF en App Completo en 3 Minutos"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-[16px] sm:text-[18px] md:text-xl">
                      {language === "pt"
                        ? "Adicione ebooks, vídeos, áudios. Tudo em um app profissional."
                        : language === "en"
                          ? "Add ebooks, videos, audios. All in a professional app."
                          : "Añade ebooks, videos, audios. Todo en una app profesional."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-7 h-7 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-[18px] sm:text-[20px] md:text-2xl">
                      {language === "pt"
                        ? "Mais potencial de vendas com o mesmo conteúdo"
                        : language === "en"
                          ? "More sales potential with the same content"
                          : "Más potencial de ventas con el mismo contenido"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-[16px] sm:text-[18px] md:text-xl">
                      {language === "pt"
                        ? "Ao mudar o formato da entrega, sua oferta fica mais profissional e fácil de converter."
                        : language === "en"
                          ? "By changing the delivery format, your offer becomes more professional and easier to convert."
                          : "Al cambiar el formato de entrega, tu oferta se vuelve más profesional y fácil de convertir."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-7 h-7 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-[18px] sm:text-[20px] md:text-2xl">
                      {language === "pt"
                        ? "Seu Cliente Acessa em 10 Segundos"
                        : language === "en"
                          ? "Your Customer Accesses in 10 Seconds"
                          : "Tu Cliente Accede en 10 Segundos"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-[16px] sm:text-[18px] md:text-xl">
                      {language === "pt"
                        ? "Link → Instala → Pronto. Sem login, sem senha, sem enrolação."
                        : language === "en"
                          ? "Link → Install → Done. No login, no password, no hassle."
                          : "Link → Instala → Listo. Sin login, sin contraseña, sin complicaciones."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-7 h-7 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-[18px] sm:text-[20px] md:text-2xl">
                      {language === "pt"
                        ? "90% Menos Reembolso e Reclamações"
                        : language === "en"
                          ? "90% Less Refunds and Complaints"
                          : "90% Menos Reembolsos y Quejas"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-[16px] sm:text-[18px] md:text-xl">
                      {language === "pt"
                        ? 'Acaba com "não consegui acessar" e diminui suporte. Entrega rápido sempre.'
                        : language === "en"
                          ? 'Ends "I couldn\'t access" and reduces support. Fast delivery always.'
                          : 'Termina con "no pude acceder" y reduce soporte. Entrega rápido siempre.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-7 h-7 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-[18px] sm:text-[20px] md:text-2xl">
                      {language === "pt"
                        ? "Sem Programação, A Partir de R$47/mês"
                        : language === "en"
                          ? "No Coding, Starting at $47/month"
                          : "Sin Programación, Desde $47/mes"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-[16px] sm:text-[18px] md:text-xl">
                      {language === "pt"
                        ? "Simples como criar um post. Preço justo por app profissional."
                        : language === "en"
                          ? "Simple as creating a post. Fair price for a professional app."
                          : "Simple como crear un post. Precio justo por app profesional."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Text and Button */}
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-medium text-gray-700 dark:text-gray-300 mb-6">
                {language === "pt"
                  ? "Seu primeiro app pronto em 3 minutos."
                  : language === "en"
                    ? "Your first app ready in 3 minutes."
                    : "Tu primera app lista en 3 minutos."}
              </p>
              <EditableElement
                elementId="hero-cta-button"
                currentStyles={elementStyles["hero-cta-button"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
              >
                <Button
                  className="bg-primary hover:bg-primary/90 hover:scale-105 text-primary-foreground px-6 sm:px-10 md:px-14 py-5 sm:py-6 md:py-7 text-xl sm:text-xl md:text-2xl h-auto rounded-xl font-semibold shadow-2xl hover:shadow-xl transition-all duration-300"
                  onClick={() =>
                    document.getElementById("countdown-section")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                >
                  {language === "pt"
                    ? "Transformar Meu eBook em App Agora"
                    : language === "en"
                      ? "Transform My eBook into App Now"
                      : "Transformar Mi eBook en App Ahora"}
                </Button>
              </EditableElement>
            </div>
          </div>
        </div>
      </section>

      {/* Second Section - Why eBooks Don't Deliver Value */}
      <section className="relative py-12 sm:py-16 md:py-24 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-4 lg:px-8 max-w-full">
          <div className="max-w-5xl mx-auto text-center">
            {/* Heading */}
            <EditableElement
              elementId="ebook-problem-title"
              currentStyles={elementStyles["ebook-problem-title"] || {}}
              onStyleChange={updateElementStyle}
              isEditMode={isEditMode}
              className="text-[28px] sm:text-[32px] md:text-[40px] font-bold mb-4 sm:mb-6 text-foreground leading-[1.3]"
            >
              {language === "pt" ? (
                <>
                  Por Que Seu eBook Parece "Só Mais um PDF Pirata"
                  <br />
                  (E Como Isso Mata Suas Vendas)
                </>
              ) : language === "en" ? (
                <>
                  Why Your eBook Looks Like "Just Another Pirated PDF"
                  <br />
                  (And How This Kills Your Sales)
                </>
              ) : (
                <>
                  Por Qué Tu eBook Parece "Solo Otro PDF Pirata"
                  <br />
                  (Y Cómo Esto Mata Tus Ventas)
                </>
              )}
            </EditableElement>

            {/* Content */}
            <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12 text-left max-w-4xl mx-auto">
              <EditableElement
                elementId="ebook-problem-para1"
                currentStyles={elementStyles["ebook-problem-para1"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
                className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed"
              >
                {language === "pt"
                  ? "Você trabalhou semanas criando conteúdo de qualidade. Mas na hora de vender, ouve coisas como:"
                  : language === "en"
                    ? "You spent weeks creating quality content. But when it's time to sell, you hear things like:"
                    : "Trabajaste semanas creando contenido de calidad. Pero a la hora de vender, escuchas cosas como:"}
              </EditableElement>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-[#374151] dark:text-[#CCCCCC] mt-1 flex-shrink-0" />
                  <span className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] font-bold">
                    {language === "pt"
                      ? '"Tá caro pra um PDF"'
                      : language === "en"
                        ? '"It\'s expensive for a PDF"'
                        : '"Está caro para un PDF"'}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-[#374151] dark:text-[#CCCCCC] mt-1 flex-shrink-0" />
                  <span className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] font-bold">
                    {language === "pt"
                      ? '"Achei esse conteúdo de graça no Google"'
                      : language === "en"
                        ? '"I found this content for free on Google"'
                        : '"Encontré este contenido gratis en Google"'}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-[#374151] dark:text-[#CCCCCC] mt-1 flex-shrink-0" />
                  <span className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] font-bold">
                    {language === "pt"
                      ? '"Não tem como testar antes?"'
                      : language === "en"
                        ? '"Can\'t I test it first?"'
                        : '"¿No puedo probarlo antes?"'}
                  </span>
                </div>
              </div>

              <EditableElement
                elementId="ebook-problem-para2"
                currentStyles={elementStyles["ebook-problem-para2"] || {}}
                onStyleChange={updateElementStyle}
                isEditMode={isEditMode}
                className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed"
              >
                {language === "pt" ? (
                  <>
                    E o pior? Você acaba cedendo. Faz promoção. Baixa o preço. Compete com pirataria.
                    <br />
                    <br className="block md:hidden" />
                    Enquanto isso, outros criadores vendem o <strong>MESMO</strong> conteúdo em formato de aplicativo
                    por <strong>3x mais</strong> e os clientes agradecem.
                  </>
                ) : language === "en" ? (
                  <>
                    And the worst part? You end up giving in. Running promotions. Lowering prices. Competing with
                    piracy.
                    <br />
                    <br className="block md:hidden" />
                    Meanwhile, other creators sell the <strong>SAME</strong> content as an app for{" "}
                    <strong>3x more</strong> and customers thank them.
                  </>
                ) : (
                  <>
                    ¿Y lo peor? Terminas cediendo. Haces promociones. Bajas el precio. Compites con la piratería.
                    <br />
                    <br className="block md:hidden" />
                    Mientras tanto, otros creadores venden el <strong>MISMO</strong> contenido en formato de aplicación
                    por <strong>3x más</strong> y los clientes agradecen.
                  </>
                )}
              </EditableElement>
            </div>

            {/* O problema? Não é seu conteúdo. */}
            <div className="text-center mb-6 sm:mb-8 mt-12 md:mt-16 max-w-4xl mx-auto">
              <h3 className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-foreground leading-[1.2] mb-2">
                {language === "pt" ? (
                  <>
                    O problema? <span className="font-bold">Não é seu conteúdo.</span>
                  </>
                ) : language === "en" ? (
                  <>
                    The problem? <span className="font-bold">It's not your content.</span>
                  </>
                ) : (
                  <>
                    ¿El problema? <span className="font-bold">No es tu contenido.</span>
                  </>
                )}
              </h3>
              <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC]">
                {language === "pt"
                  ? 'É o formato que grita "amador" antes mesmo de abrirem.'
                  : language === "en"
                    ? 'It\'s the format that screams "amateur" before they even open it.'
                    : 'Es el formato que grita "amateur" antes de que lo abran.'}
              </p>
            </div>

            {/* Visual Comparison - PDF via WhatsApp vs App */}
            <div className="flex flex-col md:flex-row items-end justify-center gap-12 sm:gap-16 md:gap-24 mb-10 sm:mb-14 max-w-5xl mx-auto">
              {/* PDF via WhatsApp */}
              <div className="flex-shrink-0 flex flex-col items-center w-full md:w-auto">
                <div className="flex items-end mb-4 sm:mb-5">
                  <img
                    src={pdfWhatsappImage}
                    alt="PDF sendo enviado via WhatsApp"
                    className="w-48 sm:w-56 md:w-64 h-auto rounded-2xl shadow-2xl object-cover"
                  />
                </div>
                <Card className="py-3 px-5 sm:py-4 sm:px-6 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 w-full max-w-[280px]">
                  <p className="text-[16px] sm:text-[18px] text-foreground text-center font-medium mb-1">
                    {language === "pt" ? "Cliente pensa:" : language === "en" ? "Client thinks:" : "Cliente piensa:"}
                  </p>
                  <p className="text-[14px] sm:text-[16px] text-[#374151] dark:text-[#CCCCCC] text-center">
                    {language === "pt"
                      ? "'Deve ter pirata no Telegram'"
                      : language === "en"
                        ? "'There must be a pirate version on Telegram'"
                        : "'Debe haber pirata en Telegram'"}
                  </p>
                </Card>
              </div>

              {/* App Profissional */}
              <div className="flex-shrink-0 flex flex-col items-center w-full md:w-auto">
                <div className="flex items-end mb-4 sm:mb-5">
                  <img
                    src={appNutriPatricia}
                    alt="Aplicativo profissional Dra. Patricia"
                    className="w-56 sm:w-64 md:w-72 h-auto rounded-2xl shadow-2xl object-cover"
                  />
                </div>
                <Card className="py-3 px-5 sm:py-4 sm:px-6 bg-blue-50 dark:bg-gray-800 border-2 border-[#2054DE]/40 w-full max-w-[280px]">
                  <p className="text-[16px] sm:text-[18px] text-foreground text-center font-medium mb-1">
                    {language === "pt" ? "Cliente pensa:" : language === "en" ? "Client thinks:" : "Cliente piensa:"}
                  </p>
                  <p className="text-[14px] sm:text-[16px] text-[#374151] dark:text-[#CCCCCC] text-center">
                    {language === "pt"
                      ? "'Parece coisa séria, vou pagar'"
                      : language === "en"
                        ? "'This looks serious, I'll pay'"
                        : "'Parece cosa seria, voy a pagar'"}
                  </p>
                </Card>
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto text-left">
              <p className="font-bold text-[20px] sm:text-[22px] md:text-2xl text-foreground">
                {language === "pt"
                  ? "O mesmo eBook, quando vira app:"
                  : language === "en"
                    ? "The same eBook, when it becomes an app:"
                    : "El mismo eBook, cuando se convierte en app:"}
              </p>

              <div className="flex flex-col items-start gap-2 sm:gap-3 text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC]">
                <p className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2054DE] flex-shrink-0" />
                  {language === "pt"
                    ? "Reduz pedidos de reembolso em até 90% (cliente vê mais valor)"
                    : language === "en"
                      ? "Reduces refund requests by up to 90% (client sees more value)"
                      : "Reduce solicitudes de reembolso hasta 90% (cliente ve más valor)"}
                </p>
                <p className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2054DE] flex-shrink-0" />
                  {language === "pt"
                    ? 'Reduz suporte por "dificuldade de acesso" (cliente entra fácil)'
                    : language === "en"
                      ? 'Reduces support for "access difficulties" (client gets in easily)'
                      : 'Reduce soporte por "dificultad de acceso" (cliente entra fácil)'}
                </p>
                <p className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2054DE] flex-shrink-0" />
                  {language === "pt"
                    ? 'Evita "baratear pra vender" (você cobra mais pelo mesmo conteúdo)'
                    : language === "en"
                      ? 'Avoids "cheapening to sell" (you charge more for the same content)'
                      : 'Evita "abaratar para vender" (cobras más por el mismo contenido)'}
                </p>
                <p className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2054DE] flex-shrink-0" />
                  {language === "pt"
                    ? 'Elimina objeções de "é só um PDF" (entrega vira experiência)'
                    : language === "en"
                      ? 'Eliminates "it\'s just a PDF" objections (delivery becomes experience)'
                      : 'Elimina objeciones de "es solo un PDF" (entrega se vuelve experiencia)'}
                </p>
                <p className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2054DE] flex-shrink-0" />
                  {language === "pt"
                    ? "Aumenta percepção de exclusividade e profissionalismo (produto premium)"
                    : language === "en"
                      ? "Increases perception of exclusivity and professionalism (premium product)"
                      : "Aumenta percepción de exclusividad y profesionalismo (producto premium)"}
                </p>
              </div>

              <div className="pt-4 sm:pt-6 text-left">
                <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC]">
                  {language === "pt"
                    ? "O problema? Criar um app do zero custa R$ 3 mil+ e leva meses."
                    : language === "en"
                      ? "The problem? Creating an app from scratch costs $3,000+ and takes months."
                      : "¿El problema? Crear una app desde cero cuesta $3,000+ y toma meses."}
                </p>
                <p className="text-[20px] sm:text-[22px] md:text-2xl font-bold text-foreground mt-2">
                  {language === "pt" ? "Até agora." : language === "en" ? "Until now." : "Hasta ahora."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Third Section - 3 Passos Simples */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-gray-50 via-gray-100/50 to-gray-50 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-foreground mb-4 leading-[1.2]">
                {t("planos.steps.title")}
              </h2>
              <p className="sm:text-[20px] md:text-2xl text-muted-foreground text-lg">{t("planos.steps.subtitle")}</p>
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
                      {t("planos.steps.step1.title")}
                    </h3>
                    <h4 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold text-emerald-700 dark:text-emerald-400 mb-4">
                      {t("planos.steps.step1.name")}
                    </h4>
                    <p className="sm:text-[20px] md:text-2xl text-muted-foreground leading-relaxed text-lg">
                      {t("planos.steps.step1.description")}
                    </p>
                  </div>

                  {/* Phone Mockup */}
                  <div className="flex justify-center md:justify-end md:-my-10">
                    <img
                      src={step1Mockup}
                      alt={t("planos.steps.step1.name")}
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
                      {t("planos.steps.step2.title")}
                    </h3>
                    <h4 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold text-purple-700 dark:text-purple-400 mb-4">
                      {t("planos.steps.step2.name")}
                    </h4>
                    <p className="sm:text-[20px] md:text-2xl text-muted-foreground leading-relaxed text-lg">
                      {t("planos.steps.step2.description")}
                    </p>
                  </div>

                  {/* Phone Mockup */}
                  <div className="flex justify-center md:justify-end md:-my-10">
                    <img
                      src={step2Mockup}
                      alt={t("planos.steps.step2.name")}
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
                      {t("planos.steps.step3.title")}
                    </h3>
                    <h4 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold text-blue-700 dark:text-blue-400 mb-4">
                      {t("planos.steps.step3.name")}
                    </h4>
                    <p className="sm:text-[20px] md:text-2xl text-muted-foreground leading-relaxed text-lg">
                      {t("planos.steps.step3.description")}
                    </p>
                  </div>

                  {/* Phone Mockup */}
                  <div className="flex justify-center md:justify-end md:-my-10">
                    <img
                      src={step3Mockup}
                      alt={t("planos.steps.step3.name")}
                      className="w-56 sm:w-64 md:w-72 lg:w-80 h-auto drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Final text */}
            <div className="text-center mt-16 md:mt-20">
              <p className="text-[20px] sm:text-[22px] md:text-[26px] font-bold text-foreground mb-2">
                {t("planos.steps.final.title")}
              </p>
              <p className="sm:text-[20px] md:text-2xl text-muted-foreground mb-6 text-xl">
                {t("planos.steps.final.subtitle")}
              </p>
              <Button
                size="lg"
                onClick={() =>
                  document.getElementById("countdown-section")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold px-8 py-6 rounded-xl sm:text-2xl text-xl"
              >
                {t("planos.steps.final.button")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* New Section - What Changes When Your eBook Becomes an App */}
      <section className="relative py-16 md:py-24 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-foreground leading-[1.2]">
                {t("planos.benefits.title.part1")}{" "}
                <span className="text-[#3B82F6]">{t("planos.benefits.title.highlight")}</span>{" "}
                {t("planos.benefits.title.part2")}
              </h2>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Benefit 1 - Cobre 3x Mais */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-24 h-24 mb-2">
                  <img src={iconGrowth} alt="" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-[18px] sm:text-[20px] font-bold text-foreground mb-3">
                  {t("planos.benefits.card1.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed sm:text-xl text-lg">
                  {t("planos.benefits.card1.desc")}
                </p>
              </div>

              {/* Benefit 2 - Converta Mais */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-24 h-24 mb-2">
                  <img src={iconMoney} alt="" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-[18px] sm:text-[20px] font-bold text-foreground mb-3">
                  {t("planos.benefits.card2.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed sm:text-xl text-lg">
                  {t("planos.benefits.card2.desc")}
                </p>
              </div>

              {/* Benefit 3 - Reduza Reembolsos */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-24 h-24 mb-2">
                  <img src={iconSync} alt="" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-[18px] sm:text-[20px] font-bold text-foreground mb-3">
                  {t("planos.benefits.card3.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed sm:text-xl text-lg">
                  {t("planos.benefits.card3.desc")}
                </p>
              </div>

              {/* Benefit 4 - Nunca Perdem Acesso */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-24 h-24 mb-2">
                  <img src={iconPhone} alt="" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-[18px] sm:text-[20px] font-bold text-foreground mb-3">
                  {t("planos.benefits.card4.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed sm:text-xl text-lg">
                  {t("planos.benefits.card4.desc")}
                </p>
              </div>

              {/* Benefit 5 - Pareça Grande Marca */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-24 h-24 mb-2">
                  <img src={iconLightbulb} alt="" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-[18px] sm:text-[20px] font-bold text-foreground mb-3">
                  {t("planos.benefits.card5.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed sm:text-xl text-lg">
                  {t("planos.benefits.card5.desc")}
                </p>
              </div>

              {/* Benefit 6 - Venda para 10 ou 10.000 */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-24 h-24 mb-2">
                  <img src={iconRocket} alt="" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-[18px] sm:text-[20px] font-bold text-foreground mb-3">
                  {t("planos.benefits.card6.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed sm:text-xl text-lg">
                  {t("planos.benefits.card6.desc")}
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center mt-12 md:mt-16">
              <p className="sm:text-[20px] md:text-2xl text-muted-foreground mb-2 text-xl">
                {t("planos.benefits.cta.subtitle")}
              </p>
              <p className="sm:text-[22px] md:text-[26px] font-bold text-foreground mb-6 text-xl">
                {t("planos.benefits.cta.title")}
              </p>
              <Button
                onClick={() =>
                  document.getElementById("countdown-section")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="bg-primary hover:bg-primary/90 hover:scale-105 text-primary-foreground px-6 sm:px-10 md:px-14 py-5 sm:py-6 md:py-7 text-xl sm:text-xl md:text-2xl h-auto rounded-xl font-semibold shadow-2xl hover:shadow-xl transition-all duration-300"
              >
                {t("planos.benefits.cta.button")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What MigraBook Does in Practice Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-gray-50 via-gray-100/50 to-gray-50 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Title */}
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-foreground leading-[1.2]">
                {t("planos.practice.title")}
              </h2>
            </div>

            {/* Block 1 - Transforma PDF em App */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                {/* Block Header */}
                <div className="flex items-center gap-4">
                  <div className="min-w-12 w-12 h-12 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    1
                  </div>
                  <h3 className="text-[22px] sm:text-[26px] md:text-[28px] font-bold text-foreground leading-[1.2]">
                    {t("planos.practice.block1.title")}
                  </h3>
                </div>

                {/* Feature Items */}
                <div className="space-y-5 pl-2">
                  <div className="border-l-4 border-[#3B82F6] pl-5">
                    <h4 className="text-[20px] sm:text-[22px] md:text-[26px] font-bold text-foreground mb-2">
                      {t("planos.practice.block1.pdf.title")}
                    </h4>
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-muted-foreground leading-relaxed">
                      {t("planos.practice.block1.pdf.desc")}
                    </p>
                  </div>

                  <div className="border-l-4 border-[#3B82F6] pl-5">
                    <h4 className="text-[20px] sm:text-[22px] md:text-[26px] font-bold text-foreground mb-2">
                      {t("planos.practice.block1.video.title")}
                    </h4>
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-muted-foreground leading-relaxed">
                      {t("planos.practice.block1.video.desc")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="flex justify-center lg:justify-end">
                <img
                  src={mbFc1}
                  alt={t("planos.practice.block1.title")}
                  className="w-full max-w-[500px] h-auto object-contain"
                />
              </div>
            </div>

            {/* Block 2 - Entrega conteúdo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mt-16 md:mt-24">
              {/* Left Image */}
              <div className="flex justify-center lg:justify-start order-2 lg:order-1">
                <img
                  src={mbFc2}
                  alt={t("planos.practice.block2.title")}
                  className="w-full max-w-[500px] h-auto object-contain"
                />
              </div>

              {/* Right Content */}
              <div className="space-y-6 order-1 lg:order-2">
                {/* Block Header */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    2
                  </div>
                  <h3 className="text-[22px] sm:text-[26px] md:text-[28px] font-bold text-foreground leading-[1.2]">
                    {t("planos.practice.block2.title")}
                  </h3>
                </div>

                {/* Feature Items */}
                <div className="space-y-5 pl-2">
                  <div className="border-l-4 border-[#3B82F6] pl-5">
                    <h4 className="text-[20px] sm:text-[22px] md:text-[26px] font-bold text-foreground mb-2">
                      {t("planos.practice.block2.access.title")}
                    </h4>
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-muted-foreground leading-relaxed">
                      {t("planos.practice.block2.access.desc")}
                    </p>
                  </div>

                  <div className="border-l-4 border-[#3B82F6] pl-5">
                    <h4 className="text-[20px] sm:text-[22px] md:text-[26px] font-bold text-foreground mb-2">
                      {t("planos.practice.block2.install.title")}
                    </h4>
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-muted-foreground leading-relaxed">
                      {t("planos.practice.block2.install.desc")}
                    </p>
                  </div>

                  <div className="border-l-4 border-[#3B82F6] pl-5">
                    <h4 className="text-[20px] sm:text-[22px] md:text-[26px] font-bold text-foreground mb-2">
                      {t("planos.practice.block2.whatsapp.title")}
                    </h4>
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-muted-foreground leading-relaxed">
                      {t("planos.practice.block2.whatsapp.desc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Block 3 - Mantém o conteúdo sempre atualizado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mt-16 md:mt-24">
              {/* Left Content */}
              <div className="space-y-6">
                {/* Block Header */}
                <div className="flex items-center gap-4">
                  <div className="min-w-12 w-12 h-12 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    3
                  </div>
                  <h3 className="text-[22px] sm:text-[26px] md:text-[28px] font-bold text-foreground leading-[1.2]">
                    {t("planos.practice.block3.title")}
                  </h3>
                </div>

                {/* Feature Items */}
                <div className="space-y-5 pl-2">
                  <div className="border-l-4 border-[#3B82F6] pl-5">
                    <h4 className="text-[20px] sm:text-[22px] md:text-[26px] font-bold text-foreground mb-2">
                      {t("planos.practice.block3.realtime.title")}
                    </h4>
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-muted-foreground leading-relaxed">
                      {t("planos.practice.block3.realtime.desc")}
                    </p>
                  </div>

                  <div className="border-l-4 border-[#3B82F6] pl-5">
                    <h4 className="text-[20px] sm:text-[22px] md:text-[26px] font-bold text-foreground mb-2">
                      {t("planos.practice.block3.templates.title")}
                    </h4>
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-muted-foreground leading-relaxed">
                      {t("planos.practice.block3.templates.desc")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="flex justify-center lg:justify-end">
                <img
                  src={mbFc3}
                  alt={t("planos.practice.block3.title")}
                  className="w-full max-w-[500px] h-auto object-contain"
                />
              </div>
            </div>

            {/* Block 4 - Aumenta vendas e engajamento */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mt-16 md:mt-24">
              {/* Left Image (order reversed on lg) */}
              <div className="flex justify-center lg:justify-start order-2 lg:order-1">
                <img
                  src={mbFc4}
                  alt={t("planos.practice.block4.title")}
                  className="w-full max-w-[500px] h-auto object-contain"
                />
              </div>

              {/* Right Content */}
              <div className="space-y-6 order-1 lg:order-2">
                {/* Block Header */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    4
                  </div>
                  <h3 className="text-[22px] sm:text-[26px] md:text-[28px] font-bold text-foreground leading-[1.2]">
                    {t("planos.practice.block4.title")}
                  </h3>
                </div>

                {/* Feature Items */}
                <div className="space-y-5 pl-2">
                  <div className="border-l-4 border-[#3B82F6] pl-5">
                    <h4 className="text-[20px] sm:text-[22px] md:text-[26px] font-bold text-foreground mb-2">
                      {t("planos.practice.block4.push.title")}
                    </h4>
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-muted-foreground leading-relaxed">
                      {t("planos.practice.block4.push.desc")}
                    </p>
                  </div>

                  <div className="border-l-4 border-[#3B82F6] pl-5">
                    <h4 className="text-[20px] sm:text-[22px] md:text-[26px] font-bold text-foreground mb-2">
                      {t("planos.practice.block4.upsell.title")}
                    </h4>
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-muted-foreground leading-relaxed">
                      {t("planos.practice.block4.upsell.desc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Block 5 - Permite escalar sem limitações */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mt-16 md:mt-24">
              {/* Left Content */}
              <div className="space-y-6">
                {/* Block Header */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    5
                  </div>
                  <h3 className="text-[22px] sm:text-[26px] md:text-[28px] font-bold text-foreground leading-[1.2]">
                    {t("planos.practice.block5.title")}
                  </h3>
                </div>

                {/* Feature Items */}
                <div className="space-y-5 pl-2">
                  <div className="border-l-4 border-[#3B82F6] pl-5">
                    <h4 className="text-[20px] sm:text-[22px] md:text-[26px] font-bold text-foreground mb-2">
                      {t("planos.practice.block5.users.title")}
                    </h4>
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-muted-foreground leading-relaxed">
                      {t("planos.practice.block5.users.desc")}
                    </p>
                  </div>

                  <div className="border-l-4 border-[#3B82F6] pl-5">
                    <h4 className="text-[20px] sm:text-[22px] md:text-[26px] font-bold text-foreground mb-2">
                      {t("planos.practice.block5.integration.title")}
                    </h4>
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-muted-foreground leading-relaxed">
                      {t("planos.practice.block5.integration.desc")}
                    </p>
                  </div>

                  <div className="border-l-4 border-[#3B82F6] pl-5">
                    <h4 className="text-[20px] sm:text-[22px] md:text-[26px] font-bold text-foreground mb-2">
                      {t("planos.practice.block5.domain.title")}
                    </h4>
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-muted-foreground leading-relaxed">
                      {t("planos.practice.block5.domain.desc")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="flex justify-center lg:justify-end">
                <img
                  src={mbFc5}
                  alt={t("planos.practice.block5.title")}
                  className="w-full max-w-[500px] h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Ready to Apply */}
      <section
        id="como-funciona"
        className="relative py-10 md:py-14 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[24px] sm:text-[30px] md:text-[36px] font-bold text-white leading-[1.3]">
              {t("planos.practice.cta.title")}
            </h2>
            <h2 className="text-[24px] sm:text-[30px] md:text-[36px] font-bold mb-8 text-white leading-[1.3]">
              {t("planos.practice.cta.subtitle")}
            </h2>

            {/* CTA Video Player */}
            <div className="mb-10 flex justify-center">
              <div className="relative w-full max-w-3xl aspect-video shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden border-[0.5px] border-white/20">
                <VturbPlayer
                  videoId="69695eb545237c230be2c08e"
                  accountId="e3c86e0f-335f-4aa4-935e-74ffd2429942"
                  className="w-full h-full"
                />
              </div>
            </div>

            <Button
              className="bg-white text-black hover:bg-white/90 text-xl sm:text-xl md:text-2xl px-6 sm:px-10 md:px-12 py-5 sm:py-6 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all"
              onClick={() =>
                document.getElementById("countdown-section")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              {t("planos.practice.cta.button")}
            </Button>
          </div>
        </div>
      </section>

      {/* Fourth Section - Who is MigraBook For */}
      <section className="relative py-20 md:py-28 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Main Title */}
            <h2 className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-center mb-10 text-foreground leading-[1.2]">
              {t("subscribe.target.title")}
            </h2>

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
                  <p className="text-[16px] sm:text-[18px] text-[#374151] dark:text-[#CCCCCC] leading-relaxed mt-1 md:text-2xl">
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
                    {t("subscribe.target.bullet3.title")}
                  </p>
                  <p className="text-[16px] sm:text-[18px] text-[#374151] dark:text-[#CCCCCC] leading-relaxed mt-1 md:text-2xl">
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
                  <p className="text-[16px] sm:text-[18px] text-[#374151] dark:text-[#CCCCCC] leading-relaxed mt-1 md:text-2xl">
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
                  <p className="text-[16px] sm:text-[18px] text-[#374151] dark:text-[#CCCCCC] leading-relaxed mt-1 md:text-2xl">
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
                  <p className="text-[16px] sm:text-[18px] text-[#374151] dark:text-[#CCCCCC] leading-relaxed mt-1 md:text-2xl">
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
                <h2 className="text-[28px] sm:text-[32px] md:text-[40px] font-bold mb-6 text-foreground leading-[1.3]">
                  {t("subscribe.problems.title.part1")} {t("subscribe.problems.title.part2")}
                </h2>

                {/* Problems List with X */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed">
                      {t("subscribe.problems.item1")}
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed">
                      {t("subscribe.problems.item2")}
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed">
                      {t("subscribe.problems.item3")}
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed">
                      {t("subscribe.problems.item4")}
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed">
                      {t("subscribe.problems.item5")}
                    </p>
                  </div>
                </div>

                {/* Warning Question */}
                <h3 className="text-[20px] sm:text-[22px] md:text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {t("subscribe.problems.warning_question")}
                </h3>

                {/* Warning Box */}
                <div className="p-6 rounded-lg bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500">
                  <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed">
                    {t("subscribe.problems.warning_box")}
                  </p>
                </div>
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
                <div className="relative w-full max-w-xl">
                  <img src={mbFc6} alt="App Migrabook" className="w-full" />
                </div>
              </div>

              {/* Content - Second on mobile, first on desktop */}
              <div className="order-last md:order-first">
                <h2 className="text-[28px] sm:text-[32px] md:text-[40px] font-bold mb-5 text-foreground leading-[1.3]">
                  {t("planos.changes.title")}
                </h2>

                <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-6 leading-relaxed">
                  {t("planos.changes.intro")}
                </p>

                {/* Benefits List with Check */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-foreground leading-relaxed">
                      {t("planos.changes.benefit1")}
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-foreground leading-relaxed">
                      {t("planos.changes.benefit2")}
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-foreground leading-relaxed">
                      {t("planos.changes.benefit3")}
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <p className="text-[18px] sm:text-[20px] md:text-2xl text-foreground leading-relaxed">
                      {t("planos.changes.benefit4")}
                    </p>
                  </div>
                </div>

                {/* Success Box */}
                <div className="p-6 rounded-lg bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500">
                  <p className="text-[18px] sm:text-[20px] md:text-2xl text-[#374151] dark:text-[#CCCCCC] leading-relaxed">
                    <span className="font-semibold">{t("planos.changes.success_box")}</span>{" "}
                    {t("planos.changes.success_tagline")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section - Chega de perder dinheiro */}
      <section className="relative py-10 md:py-14 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[28px] sm:text-[36px] md:text-[48px] font-bold mb-5 text-white leading-[1.3] max-w-5xl mx-auto">
              {t("planos.cta.title")}
            </h2>

            <p className="text-[20px] sm:text-[24px] md:text-3xl text-white/90 mb-12 font-light">
              {t("planos.cta.subtitle")}
            </p>

            <Button
              className="bg-white text-black hover:bg-white/90 text-xl sm:text-xl md:text-2xl px-6 sm:px-10 md:px-12 py-5 sm:py-6 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all"
              onClick={() =>
                document.getElementById("countdown-section")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              {t("planos.cta.button")}
            </Button>

            <p className="mt-8 text-white/80 text-[18px] sm:text-[20px] md:text-xl font-bold">
              {t("planos.cta.tagline")}
            </p>
          </div>
        </div>
      </section>

      {/* Integrations Section - Platform Logos Carousel */}
      <section className="relative py-16 md:py-32 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Title */}
            <h2 className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-center mb-4 sm:mb-8 leading-[1.2]">
              {t("subscribe.integration.title.part1")}{" "}
              <span className="text-primary">{t("subscribe.integration.title.part2")}</span>
              <br className="hidden md:block" /> {t("subscribe.integration.title.part3")}
            </h2>

            {/* Subtitle */}
            <p className="text-[18px] sm:text-[20px] md:text-2xl text-center text-[#374151] dark:text-[#CCCCCC] mb-8 sm:mb-16 max-w-5xl mx-auto">
              {t("subscribe.integration.subtitle")}
            </p>

            {/* Platform Logos Carousel */}
            <PlatformLogosCarousel />

            {/* Bottom Text */}
            <p className="text-center text-[18px] sm:text-[20px] md:text-xl text-[#374151] dark:text-[#CCCCCC] font-medium mt-8 sm:mt-16">
              {t("subscribe.integration.bottom_text")}
            </p>
          </div>
        </div>
      </section>

      {/* Countdown Timer - Before Compare Costs */}
      <section id="countdown-section">
        <CountdownTimer language={language} t={t} />
      </section>

      {/* Compare Costs Section */}
      <section className="py-12 md:py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-[28px] sm:text-[36px] md:text-[42px] font-bold text-center text-foreground mb-10">
              {t("planos.compare.title")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Developer */}
              <div className="text-center">
                <p className="text-[16px] text-[#374151] dark:text-[#CCCCCC] mb-2 sm:text-2xl">
                  {t("planos.compare.developer.label")}
                </p>
                <p className="text-[28px] sm:text-[32px] font-bold text-red-500 md:text-3xl">
                  {t("planos.compare.developer.price")}
                </p>
              </div>

              {/* Members Area */}
              <div className="text-center">
                <p className="text-[16px] text-[#374151] dark:text-[#CCCCCC] mb-2 sm:text-2xl">
                  {t("planos.compare.members.label")}
                </p>
                <p className="text-[28px] sm:text-[32px] font-bold text-orange-500 md:text-3xl">
                  {t("planos.compare.members.price")}
                </p>
              </div>

              {/* MigraBook */}
              <div className="text-center">
                <p className="text-[16px] text-[#374151] dark:text-[#CCCCCC] mb-2 sm:text-2xl">
                  {t("planos.compare.migrabook.label")}
                </p>
                <p className="text-[28px] sm:text-[32px] font-bold text-green-500 md:text-3xl">
                  {t("planos.compare.migrabook.price")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="pricing" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <EditableElement
            elementId="pricing-pretitle"
            currentStyles={elementStyles["pricing-pretitle"] || {}}
            onStyleChange={updateElementStyle}
            isEditMode={isEditMode}
            className="text-[28px] sm:text-[36px] md:text-[48px] font-bold mb-4 text-foreground leading-[1.2]"
          >
            {language === "pt"
              ? "Não sabe qual plano escolher?"
              : language === "en"
                ? "Don't know which plan to choose?"
                : "¿No sabes qué plan elegir?"}
          </EditableElement>

          <p className="text-lg sm:text-xl md:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-6">
            {language === "pt"
              ? "Veja como funciona:"
              : language === "en"
                ? "See how it works:"
                : "Mira cómo funciona:"}
          </p>

          {/* Plans Explainer Video */}
          <div className="mb-14 flex justify-center">
            <div className="relative w-full max-w-3xl aspect-video shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden dark:border-[0.5px] dark:border-white/20">
              <VturbPlayer
                videoId="6966d7bc16e3821ec3e09879"
                accountId="e3c86e0f-335f-4aa4-935e-74ffd2429942"
                className="w-full h-full"
              />
            </div>
          </div>

          <EditableElement
            elementId="pricing-title"
            currentStyles={elementStyles["pricing-title"] || {}}
            onStyleChange={updateElementStyle}
            isEditMode={isEditMode}
            className="text-[28px] sm:text-[36px] md:text-[48px] font-bold mb-8 text-foreground leading-[1.2]"
          >
            {language === "pt"
              ? "Escolha o seu plano"
              : language === "en"
                ? "Choose your plan below"
                : "Elige tu plan abajo"}
          </EditableElement>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <Label
              htmlFor="billing-toggle"
              className={`text-lg ${!isAnnual ? "text-foreground font-semibold" : "text-[#374151] dark:text-[#CCCCCC]"}`}
            >
              {t("pricing.monthly")}
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-[#2054DE]"
            />
            <div className="flex items-center gap-2">
              <Label
                htmlFor="billing-toggle"
                className={`text-lg ${isAnnual ? "text-foreground font-semibold" : "text-[#374151] dark:text-[#CCCCCC]"}`}
              >
                {t("pricing.annual")}
              </Label>
              <Badge className="bg-[#2054DE] text-white text-xs md:text-sm">
                {language === "pt" ? "2 meses grátis" : language === "en" ? "2 months free" : "2 meses gratis"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-20 max-w-7xl mx-auto pb-[60px]">
          {plans.map((plan: any) => (
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
                  className={`text-2xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-foreground"}`}
                >
                  <h3>{plan.name}</h3>
                </EditableElement>

                {/* Subtitle */}
                <p
                  className={`text-sm mb-4 ${plan.highlight ? "text-white/80" : "text-[#374151] dark:text-[#CCCCCC]"}`}
                >
                  {plan.subtitle}
                </p>

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
                        background: "linear-gradient(90deg, transparent 0%, #facc15 8%, #facc15 92%, transparent 100%)",
                      }}
                    />
                    <span className="relative z-10 text-black">{plan.description}</span>
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
                    <p
                      className={`text-sm mb-2 ${plan.highlight ? "text-white/70" : "text-[#374151] dark:text-[#CCCCCC]"}`}
                    >
                      <span className="line-through">
                        De R${" "}
                        {originalPrice?.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <span className="ml-2 font-semibold text-green-500">-{discountPercent}%</span>
                    </p>
                  );
                })()}

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
                  className={`w-full mb-2 px-3 py-2 text-xl h-auto font-semibold transition-all ${plan.id === "profissional" ? "bg-white text-black hover:bg-white/90 hover:shadow-lg" : "bg-[#2054DE] text-white hover:bg-[#2054DE]/90 hover:shadow-lg"}`}
                >
                  {language === "pt" ? "Começar Agora" : language === "en" ? "Start Now" : "Empezar Ahora"}
                </Button>
              </EditableElement>

              {/* Cancel anytime text */}
              <p
                className={`text-sm text-center mb-6 ${plan.highlight ? "text-white/70" : "text-[#374151] dark:text-[#CCCCCC]"}`}
              >
                {language === "pt"
                  ? "Cancele quando quiser"
                  : language === "en"
                    ? "Cancel anytime"
                    : "Cancela cuando quieras"}
              </p>

              <div className={`border-t ${plan.highlight ? "border-white/20" : "border-border"} mb-6`}></div>

              <div className="space-y-4">
                {plan.features.map((feature: any, index: number) => (
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
                      <span
                        className={`text-base ${plan.highlight ? "text-white" : "text-foreground"} ${feature.isBold ? "font-bold" : ""}`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  </EditableElement>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Social proof text */}
        <p className="text-[16px] sm:text-xl text-[#374151] dark:text-[#CCCCCC] flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-2 mt-8 mb-6">
          {language === "pt" ? (
            <>
              <span className="flex items-center gap-1">
                Mais de <span className="font-bold text-foreground">2.347 criadores</span>
              </span>
              <span>já transformaram seus conteúdos</span>
            </>
          ) : language === "en" ? (
            <>
              <span className="flex items-center gap-1">
                More than <span className="font-bold text-foreground">2,347 creators</span>
              </span>
              <span>have already transformed their content</span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1">
                Más de <span className="font-bold text-foreground">2.347 creadores</span>
              </span>
              <span>ya transformaron sus contenidos</span>
            </>
          )}
        </p>

        {/* Testimonials Carousel */}
        <div className="mt-6">
          <TestimonialCarousel />
        </div>
      </section>

      {/* Plans Video Dialog */}
      <Dialog open={showPlansVideoDialog} onOpenChange={handlePlansVideoOpenChange}>
        <DialogContent className="sm:max-w-4xl p-0 bg-black border-none">
          <div className="aspect-video w-full">
            {showPlansVideoDialog && (
              <VturbPlayer
                key={`plans-video-${plansVideoInstance}`}
                videoId="6966d7bc16e3821ec3e09879"
                accountId="e3c86e0f-335f-4aa4-935e-74ffd2429942"
                reloadScriptOnMount
                className="w-full h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

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
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((num) => (
              <AccordionItem
                key={num}
                value={`item-${num}`}
                className="bg-card dark:bg-gray-800/50 dark:border-gray-700 px-6 mb-4 rounded-lg border border-border"
              >
                <EditableElement
                  elementId={`faq-question-${num}`}
                  currentStyles={elementStyles[`faq-question-${num}`] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                >
                  <AccordionTrigger className="text-left text-[20px] font-semibold hover:no-underline">
                    {t(`planos.faq.q${num}.question`)}
                  </AccordionTrigger>
                </EditableElement>
                <EditableElement
                  elementId={`faq-answer-${num}`}
                  currentStyles={elementStyles[`faq-answer-${num}`] || {}}
                  onStyleChange={updateElementStyle}
                  isEditMode={isEditMode}
                >
                  <AccordionContent className="text-[#374151] dark:text-[#CCCCCC] text-[18px]">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: t(`planos.faq.q${num}.answer`),
                      }}
                    />
                  </AccordionContent>
                </EditableElement>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-12 md:py-20 bg-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="relative inline-block sm:hidden px-6">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white text-xl font-medium block text-center">{t("planos.final.urgency")}</span>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>

              <div className="hidden sm:inline-flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white text-lg md:text-xl font-medium">{t("planos.final.urgency")}</span>
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </div>
            </div>

            <FinalCountdownTimer language={language} t={t} />

            <div className="w-full flex justify-center mt-8 mb-2 px-4 sm:px-0">
              <h2 className="text-[18px] sm:text-[28px] md:text-[38px] font-bold text-white leading-[1.3] text-center whitespace-normal sm:whitespace-nowrap">
                {t("planos.final.title.part1")}
              </h2>
            </div>
            <h2 className="text-[28px] sm:text-[36px] md:text-[48px] font-bold mb-10 text-white leading-[1.2] max-w-4xl mx-auto text-center">
              {t("planos.final.title.part2")}
            </h2>

            <div className="flex flex-col gap-4 justify-center items-center mb-10">
              <Button
                className="bg-white text-gray-900 hover:bg-gray-100 sm:text-xl md:text-2xl px-8 sm:px-12 md:px-16 py-5 sm:py-6 h-auto font-bold shadow-xl hover:shadow-2xl transition-all rounded-lg text-xl"
                onClick={() =>
                  document.getElementById("countdown-section")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                {t("planos.final.cta.button")}
              </Button>

              <Button
                className="bg-green-500 hover:bg-green-600 text-white text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all rounded-lg flex items-center gap-2"
                onClick={() =>
                  window.open(
                    "https://wa.me/5544920001762?text=Ol%C3%A1!%20Vim%20atrav%C3%A9s%20da%20p%C3%A1gina%20do%20MigraBook%20e%20gostaria%20de%20tirar%20d%C3%BAvidas",
                    "_blank",
                  )
                }
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                {t("planos.final.cta.whatsapp")}
              </Button>
            </div>

            <div className="flex flex-col items-start max-w-md mx-auto gap-2 mb-6">
              <div className="flex items-start gap-3 text-white text-base md:text-lg">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-left">{t("planos.final.benefit1")}</span>
              </div>
              <div className="flex items-center gap-3 text-white text-base md:text-lg">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>{t("planos.final.benefit2")}</span>
              </div>
              <div className="flex items-center gap-3 text-white text-base md:text-lg">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>{t("planos.final.benefit3")}</span>
              </div>
              <div className="flex items-center gap-3 text-white text-base md:text-lg">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>{t("planos.final.benefit4")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <TestimonialCarousel />
        </div>
      </section>

      {/* Why Pay Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28 border-t border-app-border bg-background">
        <div className="max-w-3xl mx-auto">
          {/* Main Title */}
          <h2 className="text-[24px] sm:text-[32px] md:text-[40px] font-bold text-center mb-8 leading-[1.2]">
            "Mas por que pagar o MigraBook <br className="hidden sm:block" />
            se <span className="text-red-500">existem IAs que criam app de graça</span>?"
          </h2>

          {/* Intro */}
          <div className="mb-10">
            <p className="text-[16px] sm:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-4">
              Criar um app é só o começo...
              <br />O que complica e custa caro vem depois.
            </p>
            <p className="text-[16px] sm:text-2xl text-[#374151] dark:text-[#CCCCCC]">
              O que normalmente acontece quando você usa "IA grátis"
            </p>
          </div>

          {/* Problem 1 */}
          <div className="mb-10">
            <h3 className="text-[18px] sm:text-[22px] font-bold mb-4">1. Tempo e dinheiro indo embora</h3>
            <p className="text-[16px] sm:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-4">
              Você até cria algo rápido...
              <br />
              mas logo percebe que precisa ajustar layout, acesso, navegação, erros de exibição.
            </p>
            <p className="text-[16px] sm:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-3">Cada ajuste custa:</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">tempo seu</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">créditos de IA</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">e retrabalho</span>
              </div>
            </div>
            <p className="text-[16px] sm:text-2xl text-[#374151] dark:text-[#CCCCCC]">
              No início, nunca fica do jeito que você imaginou.
            </p>
          </div>

          {/* Problem 2 */}
          <div className="mb-10">
            <h3 className="text-[18px] sm:text-[22px] font-bold mb-4">2. Manutenção constante e dor de cabeça</h3>
            <p className="text-[16px] sm:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-4">
              Depois que começa a vender, aparecem os problemas reais:
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">"não abriu aqui"</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">"o botão não funciona"</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">"o conteúdo sumiu"</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">"no meu celular não aparece"</span>
              </div>
            </div>
            <p className="text-[16px] sm:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-3">E aí sobra pra você:</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">investigar onde está o erro</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">gastar mais créditos</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">perder horas tentando corrigir</span>
              </div>
            </div>
          </div>

          {/* Problem 3 */}
          <div className="mb-12">
            <h3 className="text-[18px] sm:text-[22px] font-bold mb-4">3. Hospedagem, configuração e risco técnico</h3>
            <p className="text-[16px] sm:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-4">
              IA não hospeda app pra você.
            </p>
            <p className="text-[16px] sm:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-3">Você vai precisar:</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">pagar hospedagem</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">configurar domínio</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">lidar com atualizações</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">torcer pra nada quebrar</span>
              </div>
            </div>
            <p className="text-[16px] sm:text-2xl text-[#374151] dark:text-[#CCCCCC]">
              Se errar em algo, o app sai do ar e a venda junto.
            </p>
          </div>

          {/* Solution Title */}
          <h3 className="text-[24px] sm:text-[32px] md:text-[36px] font-bold text-center md:text-left mb-8 leading-[1.2]">
            O <span className="text-blue-600">MigraBook</span> existe para evitar tudo isso
          </h3>

          {/* Solution Content */}
          <div className="mb-10">
            <p className="text-[16px] sm:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-4">
              Com o MigraBook, você não "testa uma ideia".
            </p>
            <p className="text-[16px] sm:text-2xl font-bold mb-4">Você entrega uma solução pronta.</p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">Estrutura já validada</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">Hospedagem inclusa</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">Atualizações e manutenção feitas pra você</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">Suporte quando algo precisa de ajuste</span>
              </div>
            </div>
            <p className="text-[16px] sm:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-4">
              Foco total em você vender, não em consertar
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">Você não paga para criar um app.</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] sm:text-2xl">
                <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                <span className="text-[#374151] dark:text-[#CCCCCC]">Você paga para não ter dor de cabeça depois.</span>
              </div>
            </div>
          </div>

          {/* Final Message */}
          <div className="mb-10">
            <p className="text-[16px] sm:text-2xl font-bold mb-4">
              Se quiser experimentar ferramentas de IA, fique a vontade.
            </p>
            <p className="text-[16px] sm:text-2xl text-[#374151] dark:text-[#CCCCCC] mb-4">
              Mas se o seu objetivo é vender com consistência, entregar algo profissional e não virar suporte técnico do
              próprio produto…
            </p>
            <p className="text-[16px] sm:text-2xl text-[#374151] dark:text-[#CCCCCC] flex items-center gap-2">
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />o MigraBook resolve isso desde já.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button
              className="bg-primary hover:bg-primary/90 hover:scale-105 text-primary-foreground px-6 sm:px-10 md:px-14 py-5 sm:py-6 md:py-7 text-xl sm:text-xl md:text-2xl h-auto rounded-xl font-semibold shadow-2xl hover:shadow-xl transition-all duration-300"
              onClick={() =>
                document.getElementById("countdown-section")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Quero meu app agora
            </Button>
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

      <PlanosAuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        selectedPlanName={selectedPlanName}
        selectedPlanId={pendingPlanId || ""}
        billingCycle={isAnnual ? "annual" : "monthly"}
        originalPrice={selectedOriginalPrice}
        currentPrice={selectedCurrentPrice}
        onSuccess={handleAuthSuccess}
      />
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

export default AssinaturaPage;
