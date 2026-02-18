import { useState, useRef, useEffect } from "react";
import { useOrderBumps, OrderBumpFormData } from "@/hooks/useOrderBumps";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Edit,
  Gift,
  Lock,
  FileText,
  Video,
  Link as LinkIcon,
  Music,
  CheckCircle,
  Copy,
  Settings,
  ChevronUp,
  ChevronDown,
  Type,
  Layers,
  Upload,
  Image,
  Palette,
  X,
  DollarSign,
  Star,
  Sparkles,
  Zap,
  Trophy,
  Crown,
  Eye,
  KeyRound,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import OrderBumpPreview from "./OrderBumpPreview";

// Ícones disponíveis para o card de conteúdos premium
const PREMIUM_ICON_OPTIONS = [
  {
    value: "gift",
    label: "Presente",
    icon: Gift,
  },
  {
    value: "dollar",
    label: "Cifrão",
    icon: DollarSign,
  },
  {
    value: "star",
    label: "Estrela",
    icon: Star,
  },
  {
    value: "sparkles",
    label: "Brilhos",
    icon: Sparkles,
  },
  {
    value: "zap",
    label: "Raio",
    icon: Zap,
  },
  {
    value: "trophy",
    label: "Troféu",
    icon: Trophy,
  },
  {
    value: "crown",
    label: "Coroa",
    icon: Crown,
  },
];
interface OrderBumpsPanelProps {
  appId: string;
  appTemplate?: string;
  appTheme?: 'dark' | 'light';
}
const PROVIDERS = [
  "Hotmart",
  "Kiwify",
  "Monetizze",
  "Eduzz",
  "Perfect Pay",
  "Cakto",
  "Ticto",
  "Yampi",
  "Mundpay",
  "Stripe",
  "Cart Panda",
];

// Templates removidos - order bumps agora herdam o template do app principal

// Plataformas com validação via Token API
const TOKEN_PLATFORMS = ["Stripe", "Kiwify", "Cart Panda"];

// Plataforma que usa apenas webhook_token
const WEBHOOK_TOKEN_PLATFORMS = ["Perfect Pay", "Cakto"];

// Plataformas que não precisam de token (apenas webhook URL)
const NO_TOKEN_PLATFORMS = ["Mundpay"];

// Plataformas SEM validação prévia (apenas webhook)
const WEBHOOK_ONLY_PLATFORMS = ["Monetizze", "Eduzz", "Ticto"];
// Templates que suportam imagem de fundo nos cards de produto
const TEMPLATES_WITH_BACKGROUNDS = ["corporate", "showcase"];

interface OrderBumpFormState extends OrderBumpFormData {
  // Campos de integração específicos por plataforma
  api_token?: string;
  webhook_token?: string;
  client_id?: string;
  client_secret?: string;
  basic_token?: string;
  hottok?: string;
  postback_key?: string;
  stripe_api_key?: string;
  account_id?: string;
  store_slug?: string;
  yampi_secret_key?: string;
  default_language?: string;
  // Campos visuais
  nome?: string;
  cor?: string;
  icone_url?: string;
  capa_url?: string;
  template?: string;
  app_theme?: string;
  allow_pdf_download?: boolean;
  view_button_label?: string;
  // Premium card fields
  premium_card_title?: string;
  premium_card_description?: string;
  premium_image_url?: string;
  bullet1?: string;
  bullet2?: string;
  bullet3?: string;
  unlock_button_color?: string;
  affiliate_mode?: boolean;
  purchase_link?: string;
  // Uploads
  produto_principal_url?: string;
  bonus1_url?: string;
  bonus2_url?: string;
  bonus3_url?: string;
  bonus4_url?: string;
  bonus5_url?: string;
  bonus6_url?: string;
  bonus7_url?: string;
  bonus8_url?: string;
  bonus9_url?: string;
  // Thumbnails
  main_product_thumbnail?: string;
  bonus1_thumbnail?: string;
  bonus2_thumbnail?: string;
  bonus3_thumbnail?: string;
  bonus4_thumbnail?: string;
  bonus5_thumbnail?: string;
  bonus6_thumbnail?: string;
  bonus7_thumbnail?: string;
  bonus8_thumbnail?: string;
  bonus9_thumbnail?: string;
  // Backgrounds (stored in theme_config)
  main_product_background?: string;
  bonus1_background?: string;
  bonus2_background?: string;
  bonus3_background?: string;
  bonus4_background?: string;
  bonus5_background?: string;
  bonus6_background?: string;
  bonus7_background?: string;
  bonus8_background?: string;
  bonus9_background?: string;
  // Rótulos
  main_product_label?: string;
  main_product_description?: string;
  bonuses_label?: string;
  bonus1_label?: string;
  bonus2_label?: string;
  bonus3_label?: string;
  bonus4_label?: string;
  bonus5_label?: string;
  bonus6_label?: string;
  bonus7_label?: string;
  bonus8_label?: string;
  bonus9_label?: string;
  // New visual fields (stored in theme_config)
  app_name_color?: string;
  app_description?: string;
  app_description_color?: string;
  show_app_icon?: boolean;
  showcase_text_position?: 'bottom' | 'middle' | 'top';
  members_header_size?: 'small' | 'medium' | 'large';
  shop_remove_card_border?: boolean;
  members_show_card_border?: boolean;
  flow_show_card_border?: boolean;
  // Bonus colors for exclusive template
  bonus1_color?: string;
  bonus2_color?: string;
  bonus3_color?: string;
  bonus4_color?: string;
  bonus5_color?: string;
  bonus6_color?: string;
  bonus7_color?: string;
  bonus8_color?: string;
  bonus9_color?: string;
  // Video Course
  video_course_enabled?: boolean;
  video_modules?: any[];
  video_course_title?: string;
  video_course_description?: string;
  video_course_button_text?: string;
  video_course_image?: string;
  video_course_background?: string;
}
const MAX_UPLOADS = 10; // 1 principal + 9 bônus

export default function OrderBumpsPanel({ appId, appTemplate: propAppTemplate = 'classic', appTheme: propAppTheme = 'dark' }: OrderBumpsPanelProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const {
    orderBumps,
    loading,
    createOrderBump,
    updateOrderBump,
    deleteOrderBump,
    toggleOrderBump,
    reorderOrderBumps,
    canAddMore,
    maxOrderBumps,
  } = useOrderBumps(appId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("uploads");
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [premiumCardIcon, setPremiumCardIcon] = useState("gift");
  const [loadingIcon, setLoadingIcon] = useState(false);
  const [resolvedAppLink, setResolvedAppLink] = useState<string>("");
  const [loadingAppLink, setLoadingAppLink] = useState(true);
  const [codeGenOpen, setCodeGenOpen] = useState(false);
  const [codeGenOrderBumpId, setCodeGenOrderBumpId] = useState<string>("");
  const [codeGenEmail, setCodeGenEmail] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const appTemplate = propAppTemplate;
  const appTheme = propAppTheme;

  // Resolver automaticamente o link do app (domínio personalizado ou link padrão)
  useEffect(() => {
    const resolveAppLink = async () => {
      if (!appId) return;
      setLoadingAppLink(true);
      try {
        // 1. Buscar o slug do app
        const { data: appData } = await supabase.from("apps").select("slug, user_id").eq("id", appId).single();

        if (!appData?.slug) {
          setLoadingAppLink(false);
          return;
        }

        // 2. Verificar se há domínio personalizado mapeado para este app
        const { data: mappings } = await supabase
          .from("domain_app_mappings")
          .select("path, custom_domain_id, custom_domains!inner(domain, status)")
          .eq("app_id", appId);

        const activeMapping = mappings?.find(
          (m: any) => m.custom_domains?.status === "active" || m.custom_domains?.status === "verified",
        );

        if (activeMapping) {
          const domain = (activeMapping as any).custom_domains.domain;
          const path = (activeMapping as any).path || "";
          const url = `https://${domain}${path.startsWith("/") ? path : `/${path}`}`;
          setResolvedAppLink(url);
        } else {
          // 3. Fallback: usar o link padrão do MigraBook
          setResolvedAppLink(`${window.location.origin}/${appData.slug}`);
        }
      } catch (error) {
        console.error("Erro ao resolver link do app:", error);
      } finally {
        setLoadingAppLink(false);
      }
    };

    resolveAppLink();
  }, [appId]);

  // Carregar configuração do ícone do card premium
  useEffect(() => {
    const loadIconConfig = async () => {
      try {
        const { data } = await supabase
          .from("admin_settings")
          .select("value")
          .eq("key", `premium_card_icon_${appId}`)
          .maybeSingle();
        if (data?.value) {
          setPremiumCardIcon(data.value);
        }
      } catch (error) {
        console.error("Erro ao carregar ícone:", error);
      }
    };
    if (appId) loadIconConfig();
  }, [appId]);

  // Salvar configuração do ícone
  const handleIconChange = async (iconValue: string) => {
    setPremiumCardIcon(iconValue);
    setLoadingIcon(true);
    try {
      const { error } = await supabase.from("admin_settings").upsert(
        {
          key: `premium_card_icon_${appId}`,
          value: iconValue,
        },
        {
          onConflict: "key",
        },
      );
      if (error) throw error;
      toast({
        title: "Ícone atualizado!",
      });
    } catch (error) {
      console.error("Erro ao salvar ícone:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a configuração do ícone.",
        variant: "destructive",
      });
    } finally {
      setLoadingIcon(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!codeGenOrderBumpId) {
      toast({ title: "Selecione um Order Bump", variant: "destructive" });
      return;
    }
    setGeneratingCode(true);
    setGeneratedCode(null);
    try {
      const { data, error } = await supabase.rpc('admin_generate_order_bump_code', {
        p_order_bump_id: codeGenOrderBumpId,
        p_buyer_email: codeGenEmail || 'manual@admin',
      });
      if (error) throw error;
      setGeneratedCode(data as string);
      toast({ title: "Código gerado com sucesso!" });
    } catch (error: any) {
      console.error("Erro ao gerar código:", error);
      toast({ title: "Erro ao gerar código", description: error.message, variant: "destructive" });
    } finally {
      setGeneratingCode(false);
    }
  };

  const [formData, setFormData] = useState<OrderBumpFormState>({
    product_id: "",
    provider: "",
    label: "",
    description: "",
    content_url: "",
    content_type: "file",
    app_link: resolvedAppLink,
    default_language: "pt-br",
    // Integração (independente do sidebar)
    api_token: "",
    webhook_token: "",
    client_id: "",
    client_secret: "",
    basic_token: "",
    hottok: "",
    postback_key: "",
    stripe_api_key: "",
    account_id: "",
    store_slug: "",
    yampi_secret_key: "",
    // Visuais
    nome: "",
    cor: "#4783F6",
    template: propAppTemplate,
    app_theme: propAppTheme,
    allow_pdf_download: true,
    view_button_label: "",
    // Rótulos
    main_product_label: "Produto Principal",
    main_product_description: "",
    bonuses_label: "Bônus Exclusivos",
    bonus1_label: "Bônus 1",
    bonus2_label: "Bônus 2",
    bonus3_label: "Bônus 3",
    bonus4_label: "Bônus 4",
    bonus5_label: "Bônus 5",
    bonus6_label: "Bônus 6",
    bonus7_label: "Bônus 7",
    bonus8_label: "Bônus 8",
    bonus9_label: "Bônus 9",
  });
  const resetForm = () => {
    setFormData({
      product_id: "",
      provider: "",
      label: "",
      description: "",
      content_url: "",
      content_type: "file",
      app_link: resolvedAppLink,
      default_language: "pt-br",
      // Integração (independente do sidebar)
      api_token: "",
      webhook_token: "",
      client_id: "",
      client_secret: "",
      basic_token: "",
      hottok: "",
      postback_key: "",
      stripe_api_key: "",
      account_id: "",
      store_slug: "",
      yampi_secret_key: "",
      // Visuais
      nome: "",
      cor: "#4783F6",
      template: propAppTemplate,
      app_theme: propAppTheme,
      allow_pdf_download: true,
      view_button_label: "",
      // Rótulos
      main_product_label: "Produto Principal",
      main_product_description: "",
      bonuses_label: "Bônus Exclusivos",
      bonus1_label: "Bônus 1",
      bonus2_label: "Bônus 2",
      bonus3_label: "Bônus 3",
      bonus4_label: "Bônus 4",
      bonus5_label: "Bônus 5",
      bonus6_label: "Bônus 6",
      bonus7_label: "Bônus 7",
      bonus8_label: "Bônus 8",
      bonus9_label: "Bônus 9",
    });
    setEditingId(null);
    setActiveTab("uploads");
  };
  const handleOpenDialog = (orderBump?: (typeof orderBumps)[0]) => {
    if (orderBump) {
      setFormData({
        product_id: orderBump.product_id,
        provider: orderBump.provider,
        label: orderBump.label,
        description: orderBump.description || "",
        content_url: orderBump.content_url,
        content_type: orderBump.content_type,
        app_link: orderBump.app_link || resolvedAppLink,
        default_language: (orderBump as any).default_language || "pt-br",
        // Integração (carregar do próprio order_bumps)
        api_token: (orderBump as any).api_token || "",
        webhook_token: (orderBump as any).webhook_token || "",
        client_id: (orderBump as any).client_id || "",
        client_secret: (orderBump as any).client_secret || "",
        basic_token: (orderBump as any).basic_token || "",
        hottok: (orderBump as any).hottok || "",
        postback_key: (orderBump as any).postback_key || "",
        stripe_api_key: (orderBump as any).stripe_api_key || "",
        account_id: (orderBump as any).account_id || "",
        store_slug: (orderBump as any).store_slug || "",
        yampi_secret_key: (orderBump as any).yampi_secret_key || "",
        // Visuais
        nome: (orderBump as any).nome || "",
        cor: (orderBump as any).cor || "#4783F6",
        icone_url: (orderBump as any).icone_url,
        capa_url: (orderBump as any).capa_url,
        template: (orderBump as any).template || "classic",
        app_theme: (orderBump as any).app_theme || "dark",
        allow_pdf_download: (orderBump as any).allow_pdf_download ?? true,
        view_button_label: (orderBump as any).view_button_label || "",
        // Uploads
        produto_principal_url: (orderBump as any).produto_principal_url,
        bonus1_url: (orderBump as any).bonus1_url,
        bonus2_url: (orderBump as any).bonus2_url,
        bonus3_url: (orderBump as any).bonus3_url,
        bonus4_url: (orderBump as any).bonus4_url,
        bonus5_url: (orderBump as any).bonus5_url,
        bonus6_url: (orderBump as any).bonus6_url,
        bonus7_url: (orderBump as any).bonus7_url,
        bonus8_url: (orderBump as any).bonus8_url,
        bonus9_url: (orderBump as any).bonus9_url,
        // Thumbnails
        main_product_thumbnail: (orderBump as any).main_product_thumbnail,
        bonus1_thumbnail: (orderBump as any).bonus1_thumbnail,
        bonus2_thumbnail: (orderBump as any).bonus2_thumbnail,
        bonus3_thumbnail: (orderBump as any).bonus3_thumbnail,
        bonus4_thumbnail: (orderBump as any).bonus4_thumbnail,
        bonus5_thumbnail: (orderBump as any).bonus5_thumbnail,
        bonus6_thumbnail: (orderBump as any).bonus6_thumbnail,
        bonus7_thumbnail: (orderBump as any).bonus7_thumbnail,
        bonus8_thumbnail: (orderBump as any).bonus8_thumbnail,
        bonus9_thumbnail: (orderBump as any).bonus9_thumbnail,
        // Rótulos
        main_product_label: (orderBump as any).main_product_label || "Produto Principal",
        main_product_description: (orderBump as any).main_product_description || "",
        bonuses_label: (orderBump as any).bonuses_label || "Bônus Exclusivos",
        bonus1_label: (orderBump as any).bonus1_label || "Bônus 1",
        bonus2_label: (orderBump as any).bonus2_label || "Bônus 2",
        bonus3_label: (orderBump as any).bonus3_label || "Bônus 3",
        bonus4_label: (orderBump as any).bonus4_label || "Bônus 4",
        bonus5_label: (orderBump as any).bonus5_label || "Bônus 5",
        bonus6_label: (orderBump as any).bonus6_label || "Bônus 6",
        bonus7_label: (orderBump as any).bonus7_label || "Bônus 7",
        bonus8_label: (orderBump as any).bonus8_label || "Bônus 8",
        bonus9_label: (orderBump as any).bonus9_label || "Bônus 9",
        // Textos do card premium
        premium_card_title: (orderBump as any).premium_card_title || "Conteúdo Premium Exclusivo",
        premium_card_description: (orderBump as any).premium_card_description || "",
        premium_image_url: (orderBump as any).premium_image_url || "",
        bullet1: (orderBump as any).bullet1 || "",
        bullet2: (orderBump as any).bullet2 || "",
        bullet3: (orderBump as any).bullet3 || "",
        unlock_button_color: (orderBump as any).unlock_button_color || "#22c55e",
        purchase_link: (orderBump as any).purchase_link || "",
        affiliate_mode: (orderBump as any).affiliate_mode || false,
        // Backgrounds from theme_config
        main_product_background: (orderBump as any).theme_config?.mainProductBackground || "",
        bonus1_background: (orderBump as any).theme_config?.bonus1Background || "",
        bonus2_background: (orderBump as any).theme_config?.bonus2Background || "",
        bonus3_background: (orderBump as any).theme_config?.bonus3Background || "",
        bonus4_background: (orderBump as any).theme_config?.bonus4Background || "",
        bonus5_background: (orderBump as any).theme_config?.bonus5Background || "",
        bonus6_background: (orderBump as any).theme_config?.bonus6Background || "",
        bonus7_background: (orderBump as any).theme_config?.bonus7Background || "",
        bonus8_background: (orderBump as any).theme_config?.bonus8Background || "",
        bonus9_background: (orderBump as any).theme_config?.bonus9Background || "",
        // New visual fields from theme_config
        app_name_color: (orderBump as any).theme_config?.appNameColor || "#ffffff",
        app_description: (orderBump as any).theme_config?.appDescription || "",
        app_description_color: (orderBump as any).theme_config?.appDescriptionColor || "#ffffff",
        show_app_icon: (orderBump as any).theme_config?.showAppIcon ?? true,
        showcase_text_position: (orderBump as any).theme_config?.showcaseTextPosition || "bottom",
        members_header_size: (orderBump as any).theme_config?.membersHeaderSize || "large",
        shop_remove_card_border: (orderBump as any).theme_config?.shopRemoveCardBorder ?? false,
        members_show_card_border: (orderBump as any).theme_config?.membersShowCardBorder ?? false,
        flow_show_card_border: (orderBump as any).theme_config?.flowShowCardBorder ?? false,
        // Academy carousel covers from theme_config
        training1_cover: (orderBump as any).theme_config?.training1Cover || "",
        training2_cover: (orderBump as any).theme_config?.training2Cover || "",
        training3_cover: (orderBump as any).theme_config?.training3Cover || "",
        training4_cover: (orderBump as any).theme_config?.training4Cover || "",
        bonus1_color: (orderBump as any).theme_config?.bonus1Color || "",
        bonus2_color: (orderBump as any).theme_config?.bonus2Color || "",
        bonus3_color: (orderBump as any).theme_config?.bonus3Color || "",
        bonus4_color: (orderBump as any).theme_config?.bonus4Color || "",
        bonus5_color: (orderBump as any).theme_config?.bonus5Color || "",
        bonus6_color: (orderBump as any).theme_config?.bonus6Color || "",
        bonus7_color: (orderBump as any).theme_config?.bonus7Color || "",
        bonus8_color: (orderBump as any).theme_config?.bonus8Color || "",
        bonus9_color: (orderBump as any).theme_config?.bonus9Color || "",
        // Video Course
        video_course_enabled: (orderBump as any).video_course_enabled ?? false,
        video_modules: (orderBump as any).video_modules || [],
        video_course_title: (orderBump as any).theme_config?.videoCourseTitle || "Curso em Vídeo",
        video_course_description: (orderBump as any).theme_config?.videoCourseDescription || "",
        video_course_button_text: (orderBump as any).theme_config?.videoCourseButtonText || "Assistir Aulas",
        video_course_image: (orderBump as any).theme_config?.videoCourseImage || "",
        video_course_background: (orderBump as any).theme_config?.videoCourseBackground || "",
      } as any);
      setEditingId(orderBump.id);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };
  const handleFileUpload = async (field: string, file: File) => {
    setUploadingField(field);
    try {
      // Obter user_id para path correto (RLS requer user_id como primeiro folder)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      // Path correto: {user_id}/{appId}/order-bumps/{fileName}
      const filePath = `${user.id}/${appId}/order-bumps/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("products").upload(filePath, file, {
        upsert: true,
      });
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);
      setFormData((prev) => ({
        ...prev,
        [field]: publicUrl,
      }));
      toast({
        title: "Upload concluído!",
      });
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingField(null);
    }
  };
  const handleSave = async () => {
    // Validações da aba Integração
    if (!formData.provider) {
      toast({
        title: "Atenção",
        description: "Selecione uma plataforma",
        variant: "destructive",
      });
      setActiveTab("integration");
      return;
    }
    if (!formData.product_id) {
      toast({
        title: "Atenção",
        description: "Informe o ID do produto",
        variant: "destructive",
      });
      setActiveTab("integration");
      return;
    }
    // app_link é resolvido automaticamente, mas validar se existe
    const appLink = formData.app_link || resolvedAppLink;
    if (!appLink) {
      toast({
        title: "Atenção",
        description: "Não foi possível resolver o link do app automaticamente",
        variant: "destructive",
      });
      setActiveTab("integration");
      return;
    }

    // Validação: purchase_link obrigatório quando affiliate_mode está ativo
    if ((formData as any).affiliate_mode && !(formData as any).purchase_link?.trim()) {
      toast({
        title: "Atenção",
        description: "O link 'Ainda não comprei' é obrigatório quando o modo Afiliado está ativo",
        variant: "destructive",
      });
      setActiveTab("texts");
      return;
    }

    // Validações da aba Textos
    if (!formData.label) {
      toast({
        title: "Atenção",
        description: "Informe o nome do conteúdo",
        variant: "destructive",
      });
      setActiveTab("texts");
      return;
    }

    // Preparar dados para salvar - sempre herdar template/tema do app principal
    const themeConfig = {
      mainProductBackground: (formData as any).main_product_background || null,
      bonus1Background: (formData as any).bonus1_background || null,
      bonus2Background: (formData as any).bonus2_background || null,
      bonus3Background: (formData as any).bonus3_background || null,
      bonus4Background: (formData as any).bonus4_background || null,
      bonus5Background: (formData as any).bonus5_background || null,
      bonus6Background: (formData as any).bonus6_background || null,
      bonus7Background: (formData as any).bonus7_background || null,
      bonus8Background: (formData as any).bonus8_background || null,
      bonus9Background: (formData as any).bonus9_background || null,
      // New visual fields
      appNameColor: (formData as any).app_name_color || "#ffffff",
      appDescription: (formData as any).app_description || null,
      appDescriptionColor: (formData as any).app_description_color || "#ffffff",
      showAppIcon: (formData as any).show_app_icon ?? true,
      showcaseTextPosition: (formData as any).showcase_text_position || "bottom",
      membersHeaderSize: (formData as any).members_header_size || "large",
      shopRemoveCardBorder: (formData as any).shop_remove_card_border ?? false,
      membersShowCardBorder: (formData as any).members_show_card_border ?? false,
      flowShowCardBorder: (formData as any).flow_show_card_border ?? false,
      // Academy carousel covers
      training1Cover: (formData as any).training1_cover || null,
      training2Cover: (formData as any).training2_cover || null,
      training3Cover: (formData as any).training3_cover || null,
      training4Cover: (formData as any).training4_cover || null,
      bonus1Color: (formData as any).bonus1_color || null,
      bonus2Color: (formData as any).bonus2_color || null,
      bonus3Color: (formData as any).bonus3_color || null,
      bonus4Color: (formData as any).bonus4_color || null,
      bonus5Color: (formData as any).bonus5_color || null,
      bonus6Color: (formData as any).bonus6_color || null,
      bonus7Color: (formData as any).bonus7_color || null,
      bonus8Color: (formData as any).bonus8_color || null,
      bonus9Color: (formData as any).bonus9_color || null,
      // Video Course visual settings
      videoCourseTitle: (formData as any).video_course_title || "Curso em Vídeo",
      videoCourseDescription: (formData as any).video_course_description || "",
      videoCourseButtonText: (formData as any).video_course_button_text || "Assistir Aulas",
      videoCourseImage: (formData as any).video_course_image || null,
      videoCourseBackground: (formData as any).video_course_background || null,
    };
    const saveData = {
      ...formData,
      app_link: formData.app_link || resolvedAppLink,
      content_url: formData.produto_principal_url || formData.content_url || "",
      template: appTemplate,
      app_theme: appTheme,
      theme_config: themeConfig,
    };
    if (editingId) {
      await updateOrderBump(editingId, saveData);
    } else {
      await createOrderBump(saveData);
    }
    setIsDialogOpen(false);
    resetForm();
  };
  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este order bump?")) {
      await deleteOrderBump(id);
    }
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "URL copiada!",
    });
  };

  // Componente de Upload Card
  const UploadCard = ({
    field,
    label,
    description,
    accept = ".pdf,.mp3",
    thumbnailSlot,
  }: {
    field: string;
    label: string;
    description: string;
    accept?: string;
    thumbnailSlot?: React.ReactNode;
  }) => {
    const url = (formData as any)[field];
    const isUploading = uploadingField === field;
    return (
      <div className="border rounded-lg p-4 bg-card">
        {label && (
          <div className="flex items-center justify-between mb-2">
            <Label className="font-medium">{label}</Label>
            {url && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    [field]: undefined,
                  }))
                }
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground mb-3">{description}</p>

        {url ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm flex-1 min-w-0">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate flex-1">{url.split("/").pop()}</span>
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive shrink-0"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    [field]: undefined,
                  }))
                }
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {thumbnailSlot}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Button variant="outline" className="w-full bg-background" disabled={isUploading}>
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Enviando..." : "Fazer Upload"}
              </Button>
              <Input
                type="file"
                accept={accept}
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(field, file);
                }}
              />
            </div>
            {thumbnailSlot}
          </div>
        )}
      </div>
    );
  };

  // Componente de Upload de Imagem
  const ImageUploadCard = ({
    field,
    label,
    dimensions,
    square = false,
    small = false,
  }: {
    field: string;
    label: string;
    dimensions: string;
    square?: boolean;
    small?: boolean;
  }) => {
    const url = (formData as any)[field];
    const isUploading = uploadingField === field;
    const inputRef = useRef<HTMLInputElement>(null);
    const handleClick = () => {
      inputRef.current?.click();
    };
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div
          className="relative cursor-pointer hover:opacity-90 transition-opacity border-2 border-dashed border-border hover:border-primary rounded-lg"
          onClick={handleClick}
        >
          <div
            className={`bg-muted/50 rounded-lg flex items-center justify-center overflow-hidden ${small ? "w-32 h-32" : square ? "w-full aspect-square" : "w-full h-28"}`}
          >
            {isUploading ? (
              <div className="text-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Enviando...</p>
              </div>
            ) : url ? (
              <>
                <img src={url} alt={label} className="w-full h-full object-cover" />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData((prev) => ({
                      ...prev,
                      [field]: undefined,
                    }));
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </>
            ) : (
              <div className="text-center p-4">
                <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Clique para upload</p>
                <p className="text-xs text-muted-foreground/70">{dimensions}</p>
              </div>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(field, file);
            }}
          />
        </div>
      </div>
    );
  };

  // Renderizar campos específicos por plataforma
  const renderPlatformFields = () => {
    const provider = formData.provider;
    if (!provider) return null;
    return (
      <div className="space-y-4 p-4 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <CheckCircle className="h-4 w-4" />
          Configuração {provider}
        </div>

        {/* ID do Produto */}
        <div className="space-y-2">
          <Label>ID do Produto na Plataforma *</Label>
          <Input
            placeholder="Ex: 12345678"
            value={formData.product_id}
            onChange={(e) =>
              setFormData({
                ...formData,
                product_id: e.target.value,
              })
            }
          />
        </div>

        {/* KIWIFY */}
        {provider === "Kiwify" && (
          <>
            <div className="space-y-2">
              <Label>Client Secret *</Label>
              <Input
                type="password"
                placeholder="Insira o Client Secret aqui"
                value={formData.client_secret || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    client_secret: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Client ID *</Label>
              <Input
                placeholder="Insira o Client ID aqui"
                value={formData.client_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    client_id: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Account ID *</Label>
              <Input
                placeholder="Insira a Account ID aqui"
                value={formData.account_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    account_id: e.target.value,
                  })
                }
              />
            </div>
          </>
        )}

        {/* HOTMART */}
        {provider === "Hotmart" && (
          <>
            <div className="space-y-2">
              <Label>Client ID *</Label>
              <Input
                placeholder="Insira o Client ID aqui"
                value={formData.client_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    client_id: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Client Secret *</Label>
              <Input
                type="password"
                placeholder="Insira o Client Secret aqui"
                value={formData.client_secret || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    client_secret: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Basic Token *</Label>
              <Input
                type="password"
                placeholder="Insira o Basic Token aqui"
                value={formData.basic_token || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    basic_token: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>HOTTOK *</Label>
              <Input
                type="password"
                placeholder="Insira o HOTTOK aqui"
                value={formData.hottok || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hottok: e.target.value,
                  })
                }
              />
            </div>
          </>
        )}

        {/* STRIPE */}
        {provider === "Stripe" && (
          <>
            <div className="space-y-2">
              <Label>Stripe Secret Key *</Label>
              <Input
                type="password"
                placeholder="sk_live_..."
                value={formData.stripe_api_key || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stripe_api_key: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Webhook Signing Secret *</Label>
              <Input
                type="password"
                placeholder="whsec_..."
                value={formData.webhook_token || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    webhook_token: e.target.value,
                  })
                }
              />
            </div>
          </>
        )}

        {/* PERFECT PAY / CAKTO */}
        {WEBHOOK_TOKEN_PLATFORMS.includes(provider) && (
          <div className="space-y-2">
            <Label>Token de Webhook *</Label>
            <Input
              type="password"
              placeholder="Insira o Token de Webhook aqui"
              value={formData.webhook_token || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  webhook_token: e.target.value,
                })
              }
            />
          </div>
        )}

        {/* MONETIZZE / EDUZZ / TICTO */}
        {WEBHOOK_ONLY_PLATFORMS.includes(provider) && (
          <div className="space-y-2">
            <Label>{provider === "Monetizze" ? "Postback Key *" : "Chave de Acesso (Webhook Key) *"}</Label>
            <Input
              type="password"
              placeholder={provider === "Monetizze" ? "Insira o Postback Key aqui" : "Insira a chave de acesso aqui"}
              value={formData.postback_key || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  postback_key: e.target.value,
                })
              }
            />
          </div>
        )}

        {/* CART PANDA */}
        {provider === "Cart Panda" && (
          <>
            <div className="space-y-2">
              <Label>Token *</Label>
              <Input
                type="password"
                placeholder="Cole aqui o Token da API do Cart Panda"
                value={formData.api_token || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    api_token: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Store Slug *</Label>
              <Input
                placeholder="Ex: minhaloja"
                value={formData.store_slug || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    store_slug: e.target.value,
                  })
                }
              />
            </div>
          </>
        )}

        {/* YAMPI */}
        {provider === "Yampi" && (
          <div className="space-y-2">
            <Label>Chave Secreta do Webhook *</Label>
            <Input
              type="password"
              placeholder="Insira a chave secreta do webhook aqui"
              value={formData.yampi_secret_key || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  yampi_secret_key: e.target.value,
                })
              }
            />
          </div>
        )}

        {/* MUNDPAY */}
        {provider === "Mundpay" && (
          <p className="text-xs text-muted-foreground">
            ℹ️ Mundpay não requer configuração adicional, apenas o ID do produto.
          </p>
        )}

        {/* URL do Webhook */}
        {!NO_TOKEN_PLATFORMS.includes(provider) && (
          <div>
            <Label className="text-xs mb-2 block">🔐 URL para configurar webhook:</Label>
            <div className="flex items-center gap-2 bg-muted/50 p-3 rounded border border-border">
              <code className="flex-1 text-xs break-all">https://webhook.migrabook.app</code>
              <Button size="sm" variant="ghost" onClick={() => copyToClipboard("https://webhook.migrabook.app")}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle>Venda extra automática</CardTitle>
          </div>
          <Badge variant="outline">
            {orderBumps.length}/{maxOrderBumps}
          </Badge>
        </div>
        <CardDescription>
          Quando o usuário compra um adicional, o acesso é liberado automaticamente no app por um código enviado por
          e-mail.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuração do Ícone do Card Premium */}
        <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ícone do Card de Conteúdos Premium
          </Label>
          <p className="text-sm text-muted-foreground">
            Escolha o ícone que aparece no balão de "Conteúdos Premium" dentro do app.
          </p>
          <Select value={premiumCardIcon} onValueChange={handleIconChange} disabled={loadingIcon}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Selecione um ícone" />
            </SelectTrigger>
            <SelectContent>
              {PREMIUM_ICON_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        {/* Lista de Order Bumps */}
        {orderBumps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum Order Bump configurado</p>
            <p className="text-sm">Crie um conteúdo premium para vender como adicional dentro do app.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orderBumps.map((orderBump, index) => (
              <div key={orderBump.id} className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  {/* Reorder buttons */}
                  <div className="flex flex-col items-center shrink-0">
                    <button
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={index === 0}
                      onClick={() => reorderOrderBumps(index, index - 1)}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={index === orderBumps.length - 1}
                      onClick={() => reorderOrderBumps(index, index + 1)}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{orderBump.label}</p>
                      {!orderBump.is_active && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {orderBump.provider} • ID: {orderBump.product_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={orderBump.is_active}
                      onCheckedChange={(checked) => toggleOrderBump(orderBump.id, checked)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(orderBump)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(orderBump.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
              </div>
            ))}
          </div>
        )}

        {/* Botão Gerar Código de Desbloqueio */}
        {orderBumps.length > 0 && (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
              setCodeGenOrderBumpId("");
              setCodeGenEmail("");
              setGeneratedCode(null);
              setCodeGenOpen(true);
            }}
          >
            <KeyRound className="h-4 w-4" />
            Gerar Código de Desbloqueio
          </Button>
        )}

        {/* Dialog Gerar Código */}
        <Dialog open={codeGenOpen} onOpenChange={(open) => { setCodeGenOpen(open); if (!open) setGeneratedCode(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Gerar Código de Desbloqueio
              </DialogTitle>
              <DialogDescription>
                Gere um código válido para liberar o acesso a um Order Bump específico.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Order Bump *</Label>
                <Select value={codeGenOrderBumpId} onValueChange={setCodeGenOrderBumpId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o Order Bump" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderBumps.map((ob) => (
                      <SelectItem key={ob.id} value={ob.id}>
                        {ob.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Email do Comprador *</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={codeGenEmail}
                  onChange={(e) => setCodeGenEmail(e.target.value)}
                />
              </div>

              {generatedCode && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Código gerado:</p>
                  <p className="text-2xl font-bold tracking-widest text-primary">{generatedCode}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode);
                      toast({ title: "Código copiado!" });
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copiar
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCodeGenOpen(false)}>
                Fechar
              </Button>
              <Button onClick={handleGenerateCode} disabled={generatingCode || !codeGenOrderBumpId}>
                {generatingCode ? "Gerando..." : "Gerar Código"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Botão Adicionar */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-full" disabled={!canAddMore} onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Order Bump
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{editingId ? "Editar Order Bump" : "Novo Order Bump"}</DialogTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={(formData as any).affiliate_mode || false}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        affiliate_mode: checked,
                      } as any)
                    }
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    {(formData as any).affiliate_mode ? "Afiliado" : "Produtor"}
                  </span>
                </div>
              </div>
              <DialogDescription>Configure a integração, aparência e uploads do seu conteúdo premium</DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full h-auto p-1 bg-muted/60">
                <TabsTrigger
                  value="uploads"
                  className="flex-1 gap-1.5 py-2 px-3 text-sm data-[state=active]:bg-background"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Uploads</span>
                </TabsTrigger>
                <TabsTrigger
                  value="texts"
                  className="flex-1 gap-1.5 py-2 px-3 text-sm data-[state=active]:bg-background"
                >
                  <Type className="h-4 w-4" />
                  <span className="hidden sm:inline">Textos</span>
                </TabsTrigger>
                <TabsTrigger
                  value="general"
                  className="flex-1 gap-1.5 py-2 px-3 text-sm data-[state=active]:bg-background"
                >
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Geral</span>
                </TabsTrigger>
                <TabsTrigger
                  value="integration"
                  className="flex-1 gap-1.5 py-2 px-3 text-sm data-[state=active]:bg-background"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Integração</span>
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="flex-1 gap-1.5 py-2 px-3 text-sm data-[state=active]:bg-background"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Preview</span>
                </TabsTrigger>
              </TabsList>

              {/* ABA INTEGRAÇÃO */}
              <TabsContent value="integration" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Plataforma de Vendas *</Label>
                  <Select
                    value={formData.provider}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        provider: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {provider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {renderPlatformFields()}

                <div className="space-y-2">
                  <Label>Link de Acesso ao App</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={formData.app_link || resolvedAppLink}
                      readOnly
                      className="bg-muted/50 cursor-default opacity-80"
                    />
                    {(formData.app_link || resolvedAppLink) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => copyToClipboard(formData.app_link || resolvedAppLink)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loadingAppLink
                      ? "Detectando link do app..."
                      : "Detectado automaticamente a partir do app publicado"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Idioma do Email</Label>
                  <Select
                    value={formData.default_language}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        default_language: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                      <SelectItem value="en-us">English (US)</SelectItem>
                      <SelectItem value="es-es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* ABA GERAL - Personalização Visual */}
              <TabsContent value="general" className="space-y-6 mt-4">
                {/* Nome e Cor */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do App</Label>
                    <Input
                      placeholder="Nome exibido no app"
                      value={formData.nome || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nome: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor Principal</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.cor || "#4783F6"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cor: e.target.value,
                          })
                        }
                        className="w-14 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.cor || "#4783F6"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cor: e.target.value,
                          })
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Cor do Nome do App */}
                <div className="space-y-2">
                  <Label>Cor do Nome do App</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={(formData as any).app_name_color || "#ffffff"}
                      onChange={(e) => setFormData({ ...formData, app_name_color: e.target.value } as any)}
                      className="w-14 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={(formData as any).app_name_color || "#ffffff"}
                      onChange={(e) => setFormData({ ...formData, app_name_color: e.target.value } as any)}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Descrição do App + Cor */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Descrição do App</Label>
                    <Input
                      placeholder="Descrição exibida no app"
                      value={(formData as any).app_description || ""}
                      onChange={(e) => setFormData({ ...formData, app_description: e.target.value } as any)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor da Descrição</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={(formData as any).app_description_color || "#ffffff"}
                        onChange={(e) => setFormData({ ...formData, app_description_color: e.target.value } as any)}
                        className="w-14 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={(formData as any).app_description_color || "#ffffff"}
                        onChange={(e) => setFormData({ ...formData, app_description_color: e.target.value } as any)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Template herdado do app principal - removido seletor manual */}

                {/* Tema herdado do app principal - removido seletor manual */}

                {/* Imagens */}
                <div className="grid grid-cols-2 gap-4">
                  <ImageUploadCard field="icone_url" label="Ícone do App" dimensions="512x512 PNG" square />
                  {appTemplate !== 'academy' && (
                    <ImageUploadCard field="capa_url" label="Capa do App" dimensions="1200x630 PNG/JPG" />
                  )}
                </div>

                {/* Academy Template - Carousel Covers */}
                {appTemplate === 'academy' && (
                  <div className="space-y-4">
                    <Label className="font-medium">Capas do Carrossel (Academy)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <ImageUploadCard field="training1_cover" label="Capa do App (Slide 1)" dimensions="600x800 PNG/JPG" />
                      <ImageUploadCard field="training2_cover" label="Slide 2" dimensions="600x800 PNG/JPG" />
                      <ImageUploadCard field="training3_cover" label="Slide 3" dimensions="600x800 PNG/JPG" />
                      <ImageUploadCard field="training4_cover" label="Slide 4" dimensions="600x800 PNG/JPG" />
                    </div>
                  </div>
                )}

                {/* Opções */}
                <div className="space-y-4">
                  {/* Toggle Exibir Ícone do App - Same templates as main app: classic, showcase, modern, corporate, flow */}
                  {["classic", "showcase", "modern", "corporate", "flow", "members", "academy"].includes(appTemplate) && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <Label>Exibir Ícone do App</Label>
                        <p className="text-xs text-muted-foreground">Mostrar o ícone no header do app</p>
                      </div>
                      <Switch
                        checked={(formData as any).show_app_icon ?? true}
                        onCheckedChange={(checked) => setFormData({ ...formData, show_app_icon: checked } as any)}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <Label>Permitir Download de PDF</Label>
                      <p className="text-xs text-muted-foreground">Usuários podem baixar os arquivos</p>
                    </div>
                    <Switch
                      checked={formData.allow_pdf_download ?? true}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          allow_pdf_download: checked,
                        })
                      }
                    />
                  </div>

                  {/* Hide view button label for templates that don't use text buttons */}
                  {appTemplate !== "modern" && appTemplate !== "exclusive" && appTemplate !== "units" && appTemplate !== "members" && appTemplate !== "flow" && appTemplate !== "academy" && appTemplate !== "shop" && (
                    <div className="space-y-2">
                      <Label>Texto do Botão de Visualização</Label>
                      <Input
                        placeholder="Ex: Acessar, Ver, Abrir..."
                        value={formData.view_button_label || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            view_button_label: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Configurações específicas por template */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Configurações do Template
                  </h4>

                  {/* Showcase: Text Position - only when icon is hidden (matching main app behavior) */}
                  {appTemplate === "showcase" && !(formData as any).show_app_icon && (
                    <div className="space-y-2">
                      <Label>Posição do Texto (Showcase)</Label>
                      <Select
                        value={(formData as any).showcase_text_position || "bottom"}
                        onValueChange={(value) => setFormData({ ...formData, showcase_text_position: value } as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Topo</SelectItem>
                          <SelectItem value="middle">Meio</SelectItem>
                          <SelectItem value="bottom">Inferior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Members: Header Size */}
                  {appTemplate === "members" && (
                    <div className="space-y-2">
                      <Label>Tamanho do Header (Members)</Label>
                      <Select
                        value={(formData as any).members_header_size || "large"}
                        onValueChange={(value) => setFormData({ ...formData, members_header_size: value } as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Pequeno</SelectItem>
                          <SelectItem value="medium">Médio</SelectItem>
                          <SelectItem value="large">Grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Shop: Remover Contorno dos Cards */}
                  {appTemplate === "shop" && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <Label>Remover Contorno dos Cards</Label>
                        <p className="text-xs text-muted-foreground">Remove a borda dos cards de produto</p>
                      </div>
                      <Switch
                        checked={(formData as any).shop_remove_card_border ?? false}
                        onCheckedChange={(checked) => setFormData({ ...formData, shop_remove_card_border: checked } as any)}
                      />
                    </div>
                  )}

                  {/* Members: Mostrar Contorno dos Cards */}
                  {appTemplate === "members" && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <Label>Mostrar Contorno dos Cards</Label>
                        <p className="text-xs text-muted-foreground">Adiciona borda colorida nos cards</p>
                      </div>
                      <Switch
                        checked={(formData as any).members_show_card_border ?? false}
                        onCheckedChange={(checked) => setFormData({ ...formData, members_show_card_border: checked } as any)}
                      />
                    </div>
                  )}

                  {/* Flow: Mostrar Contorno dos Cards */}
                  {appTemplate === "flow" && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <Label>Mostrar Contorno dos Cards</Label>
                        <p className="text-xs text-muted-foreground">Adiciona borda colorida nos cards</p>
                      </div>
                      <Switch
                        checked={(formData as any).flow_show_card_border ?? false}
                        onCheckedChange={(checked) => setFormData({ ...formData, flow_show_card_border: checked } as any)}
                      />
                    </div>
                  )}

                  {/* Exclusive: Cores dos Bônus */}
                  {appTemplate === "exclusive" && (
                    <div className="space-y-3">
                      <Label>Cores dos Bônus (Exclusive)</Label>
                      <p className="text-xs text-muted-foreground">Personalize a cor de cada card de bônus</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                          const hasBonus = !!(formData as any)[`bonus${n}_url`];
                          if (!hasBonus) return null;
                          const defaultColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1"];
                          return (
                            <div key={n} className="space-y-1">
                              <Label className="text-xs">{(formData as any)[`bonus${n}_label`] || `Bônus ${n}`}</Label>
                              <div className="flex gap-1">
                                <Input
                                  type="color"
                                  value={(formData as any)[`bonus${n}_color`] || defaultColors[n - 1]}
                                  onChange={(e) => setFormData({ ...formData, [`bonus${n}_color`]: e.target.value } as any)}
                                  className="w-10 h-8 p-0.5 cursor-pointer"
                                />
                                <Input
                                  value={(formData as any)[`bonus${n}_color`] || defaultColors[n - 1]}
                                  onChange={(e) => setFormData({ ...formData, [`bonus${n}_color`]: e.target.value } as any)}
                                  className="flex-1 h-8 text-xs"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!["showcase", "members", "shop", "flow", "exclusive", "corporate"].includes(appTemplate) && (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma configuração específica disponível para o template "{appTemplate}".
                    </p>
                  )}
                </div>

                {/* Curso em Vídeo */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Curso em Vídeo
                      </Label>
                      <p className="text-xs text-muted-foreground">Adicione módulos e vídeos do YouTube</p>
                    </div>
                    <Switch
                      checked={(formData as any).video_course_enabled ?? false}
                      onCheckedChange={(checked) => setFormData({ ...formData, video_course_enabled: checked } as any)}
                    />
                  </div>

                  {(formData as any).video_course_enabled && (
                    <>
                      <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                        <div className="space-y-2">
                          <Label>Título do Curso em Vídeo</Label>
                          <Input
                            placeholder="Curso em Vídeo"
                            value={(formData as any).video_course_title || ""}
                            onChange={(e) => setFormData({ ...formData, video_course_title: e.target.value } as any)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Descrição do Curso</Label>
                          <Textarea
                            placeholder="Descrição do Curso"
                            value={(formData as any).video_course_description || ""}
                            onChange={(e) => setFormData({ ...formData, video_course_description: e.target.value } as any)}
                            className="min-h-[60px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Texto do Botão</Label>
                          <Input
                            placeholder="Assistir Aulas"
                            value={(formData as any).video_course_button_text || ""}
                            onChange={(e) => setFormData({ ...formData, video_course_button_text: e.target.value } as any)}
                          />
                        </div>

                        {/* Ícone do Curso */}
                        {!['members', 'flow', 'shop', 'academy'].includes(appTemplate) && (
                          <ImageUploadCard field="video_course_image" label="Ícone do Curso" dimensions="512x512 PNG" square small />
                        )}
                        {/* Capa do Curso */}
                        {!['classic', 'modern', 'exclusive', 'units'].includes(appTemplate) && (
                          <ImageUploadCard field="video_course_background" label="Capa do Curso" dimensions="800x600 PNG/JPG" />
                        )}
                      </div>

                      {/* Módulos */}
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            const modules = (formData as any).video_modules || [];
                            const newModule = {
                              id: Date.now().toString(),
                              title: `Módulo ${modules.length + 1}`,
                              videos: []
                            };
                            setFormData({ ...formData, video_modules: [...modules, newModule] } as any);
                          }}
                        >
                          + Adicionar Módulo
                        </Button>

                        {((formData as any).video_modules || []).map((module: any, moduleIndex: number) => (
                          <div key={module.id} className="p-4 border rounded-lg bg-card space-y-3">
                            <div className="flex items-center justify-between">
                              <Input
                                value={module.title}
                                onChange={(e) => {
                                  const modules = [...((formData as any).video_modules || [])];
                                  modules[moduleIndex] = { ...modules[moduleIndex], title: e.target.value };
                                  setFormData({ ...formData, video_modules: modules } as any);
                                }}
                                placeholder="Nome do Módulo"
                                className="flex-1 mr-2"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const modules = ((formData as any).video_modules || []).filter((_: any, i: number) => i !== moduleIndex);
                                  setFormData({ ...formData, video_modules: modules } as any);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {module.videos.map((video: any, videoIndex: number) => (
                                <div key={video.id} className="flex gap-2">
                                  <Input
                                    value={video.title}
                                    onChange={(e) => {
                                      const modules = [...((formData as any).video_modules || [])];
                                      const videos = [...modules[moduleIndex].videos];
                                      videos[videoIndex] = { ...videos[videoIndex], title: e.target.value };
                                      modules[moduleIndex] = { ...modules[moduleIndex], videos };
                                      setFormData({ ...formData, video_modules: modules } as any);
                                    }}
                                    placeholder="Título do Vídeo"
                                    className="flex-1"
                                  />
                                  <Input
                                    value={video.youtubeUrl}
                                    onChange={(e) => {
                                      const modules = [...((formData as any).video_modules || [])];
                                      const videos = [...modules[moduleIndex].videos];
                                      videos[videoIndex] = { ...videos[videoIndex], youtubeUrl: e.target.value };
                                      modules[moduleIndex] = { ...modules[moduleIndex], videos };
                                      setFormData({ ...formData, video_modules: modules } as any);
                                    }}
                                    placeholder="Link do YouTube"
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const modules = [...((formData as any).video_modules || [])];
                                      const videos = modules[moduleIndex].videos.filter((_: any, i: number) => i !== videoIndex);
                                      modules[moduleIndex] = { ...modules[moduleIndex], videos };
                                      setFormData({ ...formData, video_modules: modules } as any);
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}

                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  const modules = [...((formData as any).video_modules || [])];
                                  const videos = [...modules[moduleIndex].videos, {
                                    id: Date.now().toString(),
                                    title: `Vídeo ${modules[moduleIndex].videos.length + 1}`,
                                    youtubeUrl: ''
                                  }];
                                  modules[moduleIndex] = { ...modules[moduleIndex], videos };
                                  setFormData({ ...formData, video_modules: modules } as any);
                                }}
                              >
                                + Adicionar Vídeo
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Imagens de Fundo dos Produtos (apenas para templates que suportam) */}
                {TEMPLATES_WITH_BACKGROUNDS.includes(appTemplate) && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-1">
                      <h4 className="font-medium flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Imagens de Fundo dos Produtos
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Imagens exibidas como fundo nos cards de produto (template {appTemplate}).
                      </p>
                    </div>

                    {/* Background do Produto Principal */}
                    {formData.produto_principal_url && (
                      <ImageUploadCard
                        field="main_product_background"
                        label={`Fundo: ${formData.main_product_label || "Produto Principal"}`}
                        dimensions="800x400 PNG/JPG"
                      />
                    )}

                    {/* Backgrounds dos Bônus */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                      const hasFile = !!(formData as any)[`bonus${n}_url`];
                      if (!hasFile) return null;
                      return (
                        <ImageUploadCard
                          key={n}
                          field={`bonus${n}_background`}
                          label={`Fundo: ${(formData as any)[`bonus${n}_label`] || `Bônus ${n}`}`}
                          dimensions="800x400 PNG/JPG"
                        />
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* ABA TEXTOS - Rótulos */}
              <TabsContent value="texts" className="space-y-4 mt-4">
                {/* Card Premium - Textos personalizáveis */}
                <div className="space-y-1">
                  <h4 className="font-medium flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    Configuração do Card "Conteúdo Premium"
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Personalize o balão de conteúdos premium exibido no app.
                  </p>
                </div>

                {/* Título do Card */}
                <div className="space-y-2">
                  <Label>Título do Card</Label>
                  <Input
                    placeholder="Conteúdo Premium Exclusivo"
                    value={(formData as any).premium_card_title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        premium_card_title: e.target.value,
                      } as any)
                    }
                  />
                </div>

                <div className="border-t pt-4 space-y-4">
                  {/* Nome do Conteúdo */}
                  <div className="space-y-2">
                    <Label>Nome do Conteúdo *</Label>
                    <Input
                      placeholder="eBook Premium"
                      value={formData.label}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          label: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      placeholder="Descrição opcional do conteúdo..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Bullets */}
                <div className="border-t pt-4 space-y-2">
                  <Label>Bullets (até 3)</Label>
                  <p className="text-xs text-muted-foreground">Textos de destaque com check verde exibidos no card.</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      <Input
                        placeholder="Ex: Acesso imediato"
                        value={(formData as any).bullet1 || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bullet1: e.target.value,
                          } as any)
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      <Input
                        placeholder="Ex: Conteúdo prático"
                        value={(formData as any).bullet2 || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bullet2: e.target.value,
                          } as any)
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      <Input
                        placeholder="Ex: Disponível dentro do app"
                        value={(formData as any).bullet3 || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bullet3: e.target.value,
                          } as any)
                        }
                      />
                    </div>
                  </div>

                  {/* Cor do Botão */}
                  <div className="space-y-2 pt-2">
                    <Label>Cor do Botão "Desbloquear"</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={(formData as any).unlock_button_color || "#22c55e"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            unlock_button_color: e.target.value,
                          } as any)
                        }
                        className="w-14 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={(formData as any).unlock_button_color || "#22c55e"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            unlock_button_color: e.target.value,
                          } as any)
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Imagem do Card */}
                <div className="border-t pt-4 space-y-2">
                  <Label>Imagem do Card</Label>
                  <p className="text-xs text-muted-foreground">Imagem exibida à esquerda do conteúdo no balão premium.</p>
                  <div className="max-w-[200px]">
                    <ImageUploadCard field="premium_image_url" label="" dimensions="512x512 PNG/JPG" square />
                  </div>
                </div>

                {/* Link "Ainda não comprei" */}
                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-medium flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Link "Ainda não comprei"
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      URL para onde o usuário será redirecionado ao clicar em "Ainda não comprei" no dialog de
                      desbloqueio.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>URL de Compra</Label>
                    <Input
                      placeholder="Insira a URL da página de vendas ou checkout do order bump."
                      value={(formData as any).purchase_link || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchase_link: e.target.value,
                        } as any)
                      }
                    />
                  </div>
                </div>

                {/* Rótulos do App */}
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-medium">Rótulos do App</h4>

                  <div className="space-y-2">
                    <Label>Título Produto Principal</Label>
                    <Input
                      placeholder="Produto Principal"
                      value={formData.main_product_label || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          main_product_label: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição do Produto Principal</Label>
                    <Textarea
                      placeholder="Descrição do Produto Principal"
                      value={formData.main_product_description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          main_product_description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Título Seção Bônus</Label>
                    <Input
                      placeholder="Bônus Exclusivos"
                      value={formData.bonuses_label || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bonuses_label: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              {/* ABA UPLOADS */}
              <TabsContent value="uploads" className="space-y-6 mt-4">
                {/* Header com contador */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">Arquivos do Conteúdo</h4>
                    <p className="text-sm text-muted-foreground">1 produto principal + até 9 bônus</p>
                  </div>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {
                      [
                        formData.produto_principal_url,
                        formData.bonus1_url,
                        formData.bonus2_url,
                        formData.bonus3_url,
                        formData.bonus4_url,
                        formData.bonus5_url,
                        formData.bonus6_url,
                        formData.bonus7_url,
                        formData.bonus8_url,
                        formData.bonus9_url,
                      ].filter(Boolean).length
                    }{" "}
                    / {MAX_UPLOADS}
                  </Badge>
                </div>

                {/* Produto Principal - Destaque */}
                <div className="p-4 border-2 border-primary/30 bg-primary/5 rounded-xl space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold text-sm shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <Input
                      placeholder="Nome do Produto Principal"
                      value={formData.main_product_label || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          main_product_label: e.target.value,
                        })
                      }
                      className="flex-1 h-9 bg-background font-medium"
                    />
                  </div>
                  <UploadCard
                    field="produto_principal_url"
                    label=""
                    description="Arquivo principal que o comprador terá acesso"
                    thumbnailSlot={
                      formData.main_product_thumbnail ? (
                        <div className="flex items-center gap-1 px-1.5 py-1.5 bg-muted rounded shrink-0">
                          <img
                            src={formData.main_product_thumbnail}
                            alt="Miniatura"
                            className="w-7 h-7 object-cover rounded"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-destructive"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                main_product_thumbnail: undefined,
                              }))
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 text-muted-foreground bg-background"
                            disabled={uploadingField === 'main_product_thumbnail'}
                            onClick={() => document.getElementById('main-thumb-input')?.click()}
                            title="Adicionar miniatura"
                          >
                            {uploadingField === 'main_product_thumbnail' ? (
                              <div className="animate-spin h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full" />
                            ) : (
                              <Image className="h-4 w-4" />
                            )}
                          </Button>
                          <input
                            id="main-thumb-input"
                            type="file"
                            accept=".png,.jpg,.jpeg,.webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload('main_product_thumbnail', file);
                            }}
                          />
                        </div>
                      )
                    }
                  />
                </div>

                {/* Bônus - Grid organizado */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    <h5 className="font-semibold">Bônus Adicionais</h5>
                    <span className="text-xs text-muted-foreground">(opcional)</span>
                  </div>

                  <div className="grid gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                      const hasFile = !!(formData as any)[`bonus${n}_url`];
                      const hasThumbnail = !!(formData as any)[`bonus${n}_thumbnail`];
                      const isUploading = uploadingField === `bonus${n}_url`;
                      const isUploadingThumb = uploadingField === `bonus${n}_thumbnail`;
                      const inputId = `bonus-upload-${n}`;
                      const thumbInputId = `bonus-thumb-${n}`;
                      return (
                        <div
                          key={n}
                          className={`p-3 rounded-lg border transition-colors ${hasFile ? "bg-primary/10 border-primary/30" : "bg-card hover:bg-muted/50"}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold text-sm shrink-0">
                              {n}
                            </div>

                            <Input
                              placeholder={`Nome do Bônus ${n}`}
                              value={(formData as any)[`bonus${n}_label`] || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  [`bonus${n}_label`]: e.target.value,
                                })
                              }
                              className="flex-1 h-9 bg-background"
                            />

                          {hasFile ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-primary" />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-destructive hover:text-destructive"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      [`bonus${n}_url`]: undefined,
                                    })
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="relative">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 px-4 bg-background"
                                  disabled={isUploading}
                                  onClick={() => document.getElementById(inputId)?.click()}
                                >
                                  {isUploading ? (
                                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-1.5" />
                                      Upload
                                    </>
                                  )}
                                </Button>
                                <input
                                  id={inputId}
                                  type="file"
                                  accept=".pdf,.mp3"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(`bonus${n}_url`, file);
                                  }}
                                />
                              </div>
                            )}

                            {/* Thumbnail inline discreto */}
                            {hasThumbnail ? (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded shrink-0">
                                <img
                                  src={(formData as any)[`bonus${n}_thumbnail`]}
                                  alt={`Miniatura ${n}`}
                                  className="w-7 h-7 object-cover rounded"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-destructive"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      [`bonus${n}_thumbnail`]: undefined,
                                    }))
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="relative shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 w-9 p-0 text-muted-foreground bg-background"
                                  disabled={isUploadingThumb}
                                  onClick={() => document.getElementById(thumbInputId)?.click()}
                                  title="Adicionar miniatura"
                                >
                                  {isUploadingThumb ? (
                                    <div className="animate-spin h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full" />
                                  ) : (
                                    <Image className="h-4 w-4" />
                                  )}
                                </Button>
                                <input
                                  id={thumbInputId}
                                  type="file"
                                  accept=".png,.jpg,.jpeg,.webp"
                                  className="hidden"
                                  disabled={isUploadingThumb}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(`bonus${n}_thumbnail`, file);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* ABA PREVIEW */}
              <TabsContent value="preview" className="mt-4">
                <OrderBumpPreview
                  formData={formData}
                  appTheme={appTheme}
                  appTemplate={appTemplate}
                  premiumIcon={premiumCardIcon}
                  primaryColor={formData.cor || "#4783F6"}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Criar Order Bump"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {!canAddMore && (
          <p className="text-xs text-center text-muted-foreground">Limite de {maxOrderBumps} order bumps atingido</p>
        )}
      </CardContent>
    </Card>
  );
}
