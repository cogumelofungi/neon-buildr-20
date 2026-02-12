import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useFeatureAccess, getRequiredPlan } from "@/hooks/useFeatureAccess";
import { PremiumOverlay } from "@/components/ui/premium-overlay";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, ExternalLink, CheckCircle, Copy, Pencil, Lock, Loader2, Mail } from "lucide-react";
import { useTutorialVideos } from "@/hooks/useTutorialVideos";
import { cn } from "@/lib/utils";
import VideoPlayerDialog from "./VideoPlayerDialog";

interface Integration {
  id: string;
  provider: string;
  product_id: string;
  app_link: string;
  api_token?: string;
  api_account_id?: string;
  hottok?: string;
  postback_key?: string;
  default_language?: string;
  created_at: string;
}

// Plataformas com validação via Token API
const TOKEN_PLATFORMS = [
  "Stripe",
  "Kiwify",
  // "Braip",  // ← Comentado para reativar no futuro
  // "Paypal", // ← Comentado para reativar no futuro
  "Cart Panda",
];

// Plataforma que usa apenas webhook_token
const WEBHOOK_TOKEN_PLATFORMS = ["Perfect Pay", "Cakto"];

// Plataformas que não precisam de token (apenas webhook URL)
const NO_TOKEN_PLATFORMS = ["Mundpay"];

// Plataformas SEM validação prévia (apenas webhook)
const WEBHOOK_ONLY_PLATFORMS = ["Monetizze", "Eduzz", "Ticto"];

// Plataformas que usam API (alias, token, secret)
const API_PLATFORMS = ["Yampi"];

// Plataformas que usam OAuth 2.0
const OAUTH_PLATFORMS = ["Hotmart"];

const PLATFORMS = [
  ...TOKEN_PLATFORMS,
  ...WEBHOOK_TOKEN_PLATFORMS,
  ...WEBHOOK_ONLY_PLATFORMS,
  ...API_PLATFORMS,
  ...OAUTH_PLATFORMS,
  ...NO_TOKEN_PLATFORMS,
];

export default function IntegrationsPanel() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { hasIntegrations } = useFeatureAccess();
  const { getVideoByCategory } = useTutorialVideos();
  const isBlocked = !hasIntegrations;
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [videoDialog, setVideoDialog] = useState<{ url: string; title: string } | null>(null);

  // Estado para configuração de login por app
  interface AppWithLogin {
    id: string;
    nome: string;
    slug: string;
    require_login: boolean;
    has_integration: boolean;
  }
  const [appsWithLogin, setAppsWithLogin] = useState<AppWithLogin[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [updatingLoginApp, setUpdatingLoginApp] = useState<string | null>(null);

  // Form state
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("pt-br");
  const [productId, setProductId] = useState("");
  const [appLink, setAppLink] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [webhookToken, setWebhookToken] = useState("");
  const [kiwifyAccountId, setKiwifyAccountId] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [basicToken, setBasicToken] = useState("");
  const [hottok, setHottok] = useState("");
  const [postbackKey, setPostbackKey] = useState("");
  const [stripeApiKey, setStripeApiKey] = useState("");
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalSecret, setPaypalSecret] = useState("");
  const [cartPandaBearerToken, setCartPandaBearerToken] = useState("");
  const [cartPandaStoreSlug, setCartPandaStoreSlug] = useState("");
  const [yampiAlias, setYampiAlias] = useState("");
  const [yampiToken, setYampiToken] = useState("");
  const [yampiSecretKey, setYampiSecretKey] = useState("");
  const [showWebhookInstructions, setShowWebhookInstructions] = useState(false);
  const [showMonetizzeInstructions, setShowMonetizzeInstructions] = useState(false);
  const [showEduzzInstructions, setShowEduzzInstructions] = useState(false);
  const [supabaseProjectId] = useState("jboartixfhvifdecdufq"); // PROJECT_ID SUPABASE

  // Carregar integrações e apps existentes
  useEffect(() => {
    loadIntegrations();
    loadAppsWithLoginConfig();
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error: any) {
      console.error(t("integrations.error.load"), error);
      toast({
        title: t("integrations.error.load"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Carregar apps publicados com status de login e verificar se têm integração
  const loadAppsWithLoginConfig = async () => {
    setLoadingApps(true);
    try {
      // Buscar usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("Usuário não autenticado");
        setLoadingApps(false);
        return;
      }

      // Buscar apps publicados do usuário logado (filtrado por user_id)
      const { data: apps, error: appsError } = await supabase
        .from("apps")
        .select("id, nome, slug, require_login")
        .eq("status", "publicado")
        .eq("user_id", user.id)
        .order("nome");

      if (appsError) throw appsError;

      // Buscar integrações do usuário para ver quais apps têm integração
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("app_id, app_link")
        .eq("user_id", user.id);

      if (productsError) throw productsError;

      // Mapear apps com info de integração
      const appsList: AppWithLogin[] = (apps || []).map((app) => {
        // Verificar se o app tem integração (por app_id ou por slug no app_link)
        const hasIntegration = (products || []).some(
          (p) => p.app_id === app.id || (p.app_link && p.app_link.includes(`/${app.slug}`)),
        );

        return {
          id: app.id,
          nome: app.nome,
          slug: app.slug,
          require_login: app.require_login || false,
          has_integration: hasIntegration,
        };
      });

      setAppsWithLogin(appsList);
    } catch (error: any) {
      console.error("Erro ao carregar apps:", error);
    } finally {
      setLoadingApps(false);
    }
  };

  // Atualizar configuração de login de um app
  const handleToggleLogin = async (appId: string, enabled: boolean) => {
    setUpdatingLoginApp(appId);
    try {
      const { error } = await supabase.from("apps").update({ require_login: enabled }).eq("id", appId);

      if (error) throw error;

      // Atualizar estado local
      setAppsWithLogin((prev) => prev.map((app) => (app.id === appId ? { ...app, require_login: enabled } : app)));

      toast({
        title: enabled ? "🔒 Login ativado" : "🔓 Login desativado",
        description: enabled
          ? "Usuários precisarão inserir o email de compra para acessar"
          : "O app está aberto para todos",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar login:", error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingLoginApp(null);
    }
  };

  const handleSave = async () => {
    // Validações
    if (!selectedPlatform) {
      toast({
        title: t("integrations.error.required"),
        description: t("integrations.error.platform.required"),
        variant: "destructive",
      });
      return;
    }

    if (!productId.trim()) {
      toast({
        title: t("integrations.error.required"),
        description: t("integrations.error.productid.required"),
        variant: "destructive",
      });
      return;
    }

    if (!appLink.trim()) {
      toast({
        title: t("integrations.error.required"),
        description: t("integrations.error.applink.required"),
        variant: "destructive",
      });
      return;
    }

    // Validar credenciais por plataforma
    if (TOKEN_PLATFORMS.includes(selectedPlatform)) {
      if (selectedPlatform === "Kiwify") {
        if (!kiwifyAccountId.trim() || !clientId.trim() || !clientSecret.trim()) {
          toast({
            title: t("integrations.error.required"),
            description: t("integrations.error.kiwify.credentials.required"),
            variant: "destructive",
          });
          return;
        }
      } else if (selectedPlatform === "Perfect Pay") {
        // Perfect Pay: apenas webhook_token
        if (!webhookToken.trim()) {
          toast({
            title: t("integrations.error.required"),
            description: t("integrations.error.perfectpay.token.required"),
            variant: "destructive",
          });
          return;
        }
      } else if (selectedPlatform === "Mundpay") {
        // Mundpay: não precisa de token, apenas o ID do produto
        console.log("ℹ️ [Mundpay] Plataforma sem validação de token");
      } else if (selectedPlatform === "Cakto") {
        // Cakto: apenas webhook_token (chave secreta)
        if (!webhookToken.trim()) {
          toast({
            title: t("integrations.error.required"),
            description: t("integrations.error.cakto.token.required.description"),
            variant: "destructive",
          });
          return;
        }
      } else if (selectedPlatform === "Cart Panda") {
        // Cart Panda: Bearer Token + Store Slug
        if (!cartPandaBearerToken.trim()) {
          toast({
            title: t("integrations.error.required"),
            description: t("integrations.error.cartpanda.token.required"),
            variant: "destructive",
          });
          return;
        }
        if (!cartPandaStoreSlug.trim()) {
          toast({
            title: t("integrations.error.required"),
            description: t("integrations.error.cartpanda.storeslug.required"),
            variant: "destructive",
          });
          return;
        }
      } else if (selectedPlatform === "Stripe") {
        // Stripe: webhook_token (signing secret) + API key
        if (!webhookToken.trim()) {
          toast({
            title: t("integrations.error.required"),
            description: t("integrations.error.stripe.webhooktoken.required"),
            variant: "destructive",
          });
          return;
        }
        if (!stripeApiKey.trim()) {
          toast({
            title: t("integrations.error.required"),
            description: t("integrations.error.stripe.apikey.required"),
            variant: "destructive",
          });
          return;
        }
        // Validar formato da API Key
        if (!stripeApiKey.startsWith("sk_live_") && !stripeApiKey.startsWith("sk_test_")) {
          toast({
            title: t("integrations.error.required"),
            description: t("integrations.error.stripe.apikey.invalid"),
            variant: "destructive",
          });
          return;
        }
      } else if (selectedPlatform === "Paypal") {
        // Paypal: Client ID + Secret
        if (!paypalClientId.trim()) {
          toast({
            title: "Atenção",
            description: "Informe o PayPal Client ID",
            variant: "destructive",
          });
          return;
        }
        if (!paypalSecret.trim()) {
          toast({
            title: "Atenção",
            description: "Informe o PayPal Secret",
            variant: "destructive",
          });
          return;
        }
      } else if (selectedPlatform === "Cart Panda") {
        // Cart Panda: Bearer Token + Store Slug
        if (!cartPandaBearerToken.trim()) {
          toast({
            title: "Atenção",
            description: "Informe o Bearer Token do Cart Panda",
            variant: "destructive",
          });
          return;
        }
        if (!cartPandaStoreSlug.trim()) {
          toast({
            title: t("integrations.error.required"),
            description: t("integrations.error.stripe.apikey.invalid"),
            variant: "destructive",
          });
          return;
        }
      } else {
        // Outras plataformas TOKEN: apenas token
        if (!apiToken.trim()) {
          toast({
            title: "Atenção",
            description: "Informe o Token API da plataforma",
            variant: "destructive",
          });
          return;
        }
      }
    } else if (OAUTH_PLATFORMS.includes(selectedPlatform)) {
      // Apenas Hotmart usa OAuth
      if (selectedPlatform === "Hotmart") {
        if (!clientId.trim() || !clientSecret.trim() || !basicToken.trim()) {
          toast({
            title: "Atenção",
            description: "Informe o Client ID, Client Secret e Basic Token",
            variant: "destructive",
          });
          return;
        }
        if (!hottok.trim()) {
          toast({
            title: "Atenção",
            description: "Informe o HOTTOK para validação de webhook",
            variant: "destructive",
          });
          return;
        }
      }
    } else if (WEBHOOK_ONLY_PLATFORMS.includes(selectedPlatform)) {
      // Monetizze e Eduzz: apenas postback_key (sem validação prévia de API)
      if (!postbackKey.trim()) {
        toast({
          title: "Atenção",
          description:
            selectedPlatform === "Monetizze"
              ? "Informe o Postback Key para validação de webhook"
              : "Informe a Chave de Acesso da Eduzz (Webhook Key)",
          variant: "destructive",
        });
        return;
      }
    } else if (API_PLATFORMS.includes(selectedPlatform)) {
      // Yampi: apenas chave secreta do webhook
      if (selectedPlatform === "Yampi") {
        if (!yampiSecretKey.trim()) {
          toast({
            title: "Atenção",
            description: "Informe a Chave Secreta do Webhook da Yampi",
            variant: "destructive",
          });
          return;
        }
      }
    }

    // Validar formato do link - aceita qualquer URL válida
    try {
      new URL(appLink.trim());
    } catch {
      toast({
        title: "Atenção",
        description: "O link informado não é uma URL válida. Ex: https://seusite.com/app",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Monetizze, Eduzz e Mundpay não tem API de validação prévia - cadastrar direto
    let skipApiValidation = false;
    if (WEBHOOK_ONLY_PLATFORMS.includes(selectedPlatform) || NO_TOKEN_PLATFORMS.includes(selectedPlatform)) {
      console.log(`⚠️ [${selectedPlatform}] Plataforma sem validação prévia - cadastrando direto`);
      skipApiValidation = true;
    }

    try {
      // Buscar o user_id atual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      console.log("🔍 Link digitado:", appLink);

      // Tentar buscar o app_id baseado no slug (opcional)
      let appId: string | null = null;
      const urlParts = appLink.trim().split("/");
      const extractedSlug = urlParts[urlParts.length - 1];

      if (extractedSlug) {
        const { data: appData } = await supabase
          .from("apps")
          .select("id, slug, nome")
          .eq("slug", extractedSlug)
          .maybeSingle();

        if (appData) {
          appId = appData.id;
          console.log("🔍 App encontrado:", appData);
        } else {
          console.log("ℹ️ App não encontrado pelo slug - usando link customizado");
        }
      }

      // VALIDAÇÃO PRÉ-INSERT para plataformas com API
      if (
        !skipApiValidation &&
        (TOKEN_PLATFORMS.includes(selectedPlatform) ||
          OAUTH_PLATFORMS.includes(selectedPlatform) ||
          WEBHOOK_TOKEN_PLATFORMS.includes(selectedPlatform))
      ) {
        console.log("🔐 Validando produto via API...");

        // Preparar body da requisição
        const requestBody: any = {
          platform: selectedPlatform,
          product_id: productId.trim(),
        };

        // Configurar autenticação por plataforma
        if (selectedPlatform === "Kiwify") {
          requestBody.account_id = kiwifyAccountId.trim();
          requestBody.client_id = clientId.trim();
          requestBody.client_secret = clientSecret.trim();
          console.log("🔑 [Kiwify] Usando client_id + client_secret");
        } else if (selectedPlatform === "Hotmart") {
          requestBody.client_id = clientId.trim();
          requestBody.client_secret = clientSecret.trim();
          requestBody.basic_token = basicToken.trim();
          console.log("🔑 [Hotmart] Usando client_id + client_secret + basic_token");
        } else if (selectedPlatform === "Perfect Pay") {
          requestBody.webhook_token = webhookToken.trim();
          console.log("🔑 [Perfect Pay] Usando webhook_token");
          console.log("🔍 [Perfect Pay] Token:", webhookToken.trim());
        } else if (selectedPlatform === "Mundpay") {
          // Mundpay não precisa de validação prévia de token
          console.log("ℹ️ [Mundpay] Sem validação prévia - salvando direto");
        } else if (selectedPlatform === "Cakto") {
          requestBody.webhook_token = webhookToken.trim();
          console.log("🔑 [Cakto] Usando webhook_token");
          console.log("🔍 [Cakto] Token:", webhookToken.trim());
        } else if (selectedPlatform === "Cart Panda") {
          requestBody.cartpanda_bearer_token = cartPandaBearerToken.trim();
          requestBody.cartpanda_store_slug = cartPandaStoreSlug.trim();
          console.log("🔑 [Cart Panda] Usando cartpanda_bearer_token + cartpanda_store_slug");
        } else if (selectedPlatform === "Stripe") {
          requestBody.webhook_token = webhookToken.trim();
          requestBody.stripe_api_key = stripeApiKey.trim();
          console.log("🔑 [Stripe] Usando webhook_token + stripe_api_key");
        } else if (selectedPlatform === "Paypal") {
          requestBody.paypal_client_id = paypalClientId.trim();
          requestBody.paypal_secret = paypalSecret.trim();
          console.log("🔑 [Paypal] Usando paypal_client_id + paypal_secret");
        } else {
          // Outras plataformas TOKEN: apenas token
          requestBody.api_token = apiToken.trim();
        }

        // ← ADICIONAR AQUI:
        console.log("📤 [INTEGRAÇÕES] RequestBody:", JSON.stringify(requestBody, null, 2));

        const { data: validationResult, error: validationError } = await supabase.functions.invoke("validate-product", {
          body: requestBody,
        });

        if (validationError) {
          throw new Error(`Erro na validação: ${validationError.message}`);
        }

        if (!validationResult.valid) {
          toast({
            title: "❌ Produto inválido",
            description: validationResult.error,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Mostrar sucesso da validação
        toast({
          title: "✅ Produto validado!",
          description: `"${validationResult.product.name}" encontrado na ${selectedPlatform}`,
        });
      }

      // Inserir ou atualizar a integração
      if (editingId) {
        // Modo de edição - UPDATE
        const { error } = await supabase
          .from("products")
          .update({
            provider: selectedPlatform,
            product_id: productId.trim(),
            app_id: appId,
            app_link: appLink.trim(),
            api_token:
              TOKEN_PLATFORMS.includes(selectedPlatform) || OAUTH_PLATFORMS.includes(selectedPlatform)
                ? apiToken.trim() || null
                : null,
            api_account_id: selectedPlatform === "Kiwify" ? kiwifyAccountId.trim() : null,
            hottok: selectedPlatform === "Hotmart" ? hottok.trim() : null,
            postback_key:
              selectedPlatform === "Monetizze" ||
              selectedPlatform === "Eduzz" ||
              selectedPlatform === "Ticto" ||
              selectedPlatform === "Yampi"
                ? selectedPlatform === "Yampi"
                  ? yampiSecretKey.trim()
                  : postbackKey.trim()
                : null,
            webhook_token:
              selectedPlatform === "Perfect Pay" ||
              selectedPlatform === "Stripe" ||
              selectedPlatform === "Cakto" ||
              selectedPlatform === "Mundpay"
                ? webhookToken.trim()
                : null,
            stripe_api_key: selectedPlatform === "Stripe" ? stripeApiKey.trim() : null,
            paypal_client_id: selectedPlatform === "Paypal" ? paypalClientId.trim() : null,
            paypal_secret: selectedPlatform === "Paypal" ? paypalSecret.trim() : null,
            cartpanda_bearer_token: selectedPlatform === "Cart Panda" ? cartPandaBearerToken.trim() : null,
            cartpanda_store_slug: selectedPlatform === "Cart Panda" ? cartPandaStoreSlug.trim() : null,
            default_language: selectedLanguage,
          })
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "✅ Integração atualizada!",
          description: `${selectedPlatform} foi atualizado com sucesso`,
        });
      } else {
        // Modo de criação - INSERT
        const { error } = await supabase.from("products").insert({
          user_id: user.id,
          provider: selectedPlatform,
          product_id: productId.trim(),
          app_id: appId,
          app_link: appLink.trim(),
          api_token:
            TOKEN_PLATFORMS.includes(selectedPlatform) || OAUTH_PLATFORMS.includes(selectedPlatform)
              ? apiToken.trim() || null
              : null,
          api_account_id: selectedPlatform === "Kiwify" ? kiwifyAccountId.trim() : null,
          hottok: selectedPlatform === "Hotmart" ? hottok.trim() : null,
          postback_key:
            selectedPlatform === "Monetizze" ||
            selectedPlatform === "Eduzz" ||
            selectedPlatform === "Ticto" ||
            selectedPlatform === "Yampi"
              ? selectedPlatform === "Yampi"
                ? yampiSecretKey.trim()
                : postbackKey.trim()
              : null,
          webhook_token:
            selectedPlatform === "Perfect Pay" ||
            selectedPlatform === "Stripe" ||
            selectedPlatform === "Cakto" ||
            selectedPlatform === "Mundpay"
              ? webhookToken.trim()
              : null,
          stripe_api_key: selectedPlatform === "Stripe" ? stripeApiKey.trim() : null,
          paypal_client_id: selectedPlatform === "Paypal" ? paypalClientId.trim() : null,
          paypal_secret: selectedPlatform === "Paypal" ? paypalSecret.trim() : null,
          cartpanda_bearer_token: selectedPlatform === "Cart Panda" ? cartPandaBearerToken.trim() : null,
          cartpanda_store_slug: selectedPlatform === "Cart Panda" ? cartPandaStoreSlug.trim() : null,
          default_language: selectedLanguage,
        });

        if (error) throw error;

        toast({
          title: "✅ Integração salva!",
          description: `${selectedPlatform} vinculado com sucesso`,
        });
      }

      // Limpar form e recarregar lista
      clearForm();
      loadIntegrations();
    } catch (error: any) {
      console.error("Erro ao salvar integração:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta integração?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Integração removida",
        description: "A integração foi excluída com sucesso",
      });

      loadIntegrations();
    } catch (error: any) {
      console.error("Erro ao deletar:", error);
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (integration: Integration) => {
    // Carregar dados completos da integração
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", integration.id).single();

      if (error) throw error;
      if (!data) throw new Error("Integração não encontrada");

      // Preencher o formulário com os dados
      setEditingId(integration.id);
      setSelectedPlatform(data.provider as string);
      setProductId(data.product_id as string);
      setAppLink(data.app_link as string);
      setApiToken((data as any).api_token || "");
      setWebhookToken((data as any).webhook_token || "");
      setKiwifyAccountId((data as any).api_account_id || "");
      setStoreSlug((data as any).api_account_id || "");
      setHottok((data as any).hottok || "");
      setPostbackKey((data as any).postback_key || "");
      setStripeApiKey((data as any).stripe_api_key || "");
      setPaypalClientId((data as any).paypal_client_id || "");
      setPaypalSecret((data as any).paypal_secret || "");
      setCartPandaBearerToken((data as any).cartpanda_bearer_token || "");
      setCartPandaStoreSlug((data as any).cartpanda_store_slug || "");
      setSelectedLanguage((data as any).default_language || "pt-br");
      // Yampi: carregar apenas chave secreta do webhook
      if (data.provider === "Yampi") {
        setYampiSecretKey((data as any).postback_key || "");
      } else {
        setYampiSecretKey("");
      }

      // Scroll suave para o formulário
      window.scrollTo({ top: 0, behavior: "smooth" });

      toast({
        title: "Modo de edição ativado",
        description: "Modifique os campos e clique em Salvar",
      });
    } catch (error: any) {
      console.error("Erro ao carregar integração:", error);
      toast({
        title: "Erro ao carregar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setSelectedPlatform("");
    setProductId("");
    setAppLink("");
    setApiToken("");
    setWebhookToken("");
    setKiwifyAccountId("");
    setStoreSlug("");
    setClientId("");
    setClientSecret("");
    setBasicToken("");
    setHottok("");
    setPostbackKey("");
    setStripeApiKey("");
    setPaypalClientId("");
    setPaypalSecret("");
    setCartPandaBearerToken("");
    setCartPandaStoreSlug("");
    setYampiAlias("");
    setYampiToken("");
    setYampiSecretKey("");
    setSelectedLanguage("pt-br");
  };

  return (
    <PremiumOverlay
      isBlocked={isBlocked}
      title={t("premium.integrations.title")}
      description={t("premium.integrations.description")}
      requiredPlan={getRequiredPlan("hasIntegrations")}
      variant="overlay"
    >
      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Integração
          </TabsTrigger>
          <TabsTrigger value="login-email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Login por E-mail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          {/* Card de Adicionar Nova Integração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingId ? (
                  <>
                    <Pencil className="h-5 w-5 text-orange-500" />
                    {t("integrations.edit_title")}
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 text-primary" />
                    {t("integrations.new_title")}
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {editingId ? t("integrations.edit_description") : t("integrations.new_description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Select de Plataforma */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="platform">{t("integrations.platform")}</Label>
                  {selectedPlatform &&
                    (() => {
                      const categoryMap: Record<string, string> = {
                        Kiwify: "kiwify",
                        Hotmart: "hotmart",
                        Braip: "braip",
                        Monetizze: "monetizze",
                        "Perfect Pay": "perfectpay",
                        Eduzz: "eduzz",
                        "Cart Panda": "cartpanda",
                        Stripe: "stripe",
                        Paypal: "paypal",
                        Cakto: "cakto",
                        Mundpay: "mundpay",
                        Yampi: "yampi",
                        Ticto: "ticto",
                      };
                      const category = categoryMap[selectedPlatform];
                      const video = category ? getVideoByCategory(category) : null;

                      return video ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setVideoDialog({ url: video.video_url, title: video.title })}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          → Ver Tutorial
                        </Button>
                      ) : null;
                    })()}
                </div>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger id="platform">
                    <SelectValue placeholder={t("integrations.platform_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Input Link do App */}
              <div className="space-y-2">
                <Label htmlFor="app-link">{t("integrations.app_link")}</Label>
                <Input
                  id="app-link"
                  placeholder="Insira a URL do App"
                  value={appLink}
                  onChange={(e) => setAppLink(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{t("integrations.app_link_help")}</p>
              </div>

              {/* Select de Idioma do Email */}
              <div className="space-y-2">
                <Label htmlFor="email-language">Idioma do Email de Acesso</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger id="email-language">
                    <SelectValue placeholder={t("integrations.select.language")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-br">🇧🇷 Português</SelectItem>
                    <SelectItem value="en-us">🇺🇸 English</SelectItem>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">📧 Idioma que será usado no email enviado após a compra</p>
              </div>

              {/* KIWIFY: Autenticação */}
              {selectedPlatform === "Kiwify" && (
                <div className="space-y-4 p-4 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <CheckCircle className="h-4 w-4" />
                    {t("integrations.config.kiwify")}
                  </div>

                  {/* Product ID */}
                  <div className="space-y-2">
                    <Label htmlFor="kiwify-product-id">ID do Produto</Label>
                    <Input
                      id="kiwify-product-id"
                      placeholder={t("integrations.product.id.placeholder")}
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                    />
                  </div>

                  {/* Client Secret */}
                  <div className="space-y-2">
                    <Label htmlFor="client-secret">Client Secret</Label>
                    <Input
                      id="client-secret"
                      type="password"
                      placeholder="Insira o Client Secret aqui"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                    />
                  </div>

                  {/* Client ID */}
                  <div className="space-y-2">
                    <Label htmlFor="client-id">Client ID</Label>
                    <Input
                      id="client-id"
                      placeholder="Insira o Client ID aqui"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                    />
                  </div>

                  {/* Account ID */}
                  <div className="space-y-2">
                    <Label htmlFor="kiwify-account-id">Account ID</Label>
                    <Input
                      id="kiwify-account-id"
                      placeholder="Insira a Account ID aqui"
                      value={kiwifyAccountId}
                      onChange={(e) => setKiwifyAccountId(e.target.value)}
                    />
                  </div>

                  {/* URL do Webhook */}
                  <div>
                    <Label className="text-xs mb-2 block">🔐 URL para configurar webhook:</Label>
                    <div className="flex items-center gap-2 bg-muted/50 p-3 rounded border border-border">
                      <code className="flex-1 text-xs break-all">https://webhook.migrabook.app</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://webhook.migrabook.app`);
                          toast({ title: "URL copiada!" });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Outras plataformas: apenas Token API */}
              {selectedPlatform &&
                TOKEN_PLATFORMS.includes(selectedPlatform) &&
                selectedPlatform !== "Kiwify" &&
                selectedPlatform !== "Cart Panda" &&
                selectedPlatform !== "Stripe" &&
                selectedPlatform !== "Cakto" &&
                selectedPlatform !== "Paypal" && (
                  <div className="space-y-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <Label htmlFor="api-token" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Token API da {selectedPlatform}
                    </Label>
                    <Input
                      id="api-token"
                      type="password"
                      placeholder="Cole aqui o token da sua conta"
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      ℹ️ O produto será validado em tempo real antes de salvar
                    </p>
                  </div>
                )}

              {/* Cart Panda: Bearer Token + Store Slug */}
              {selectedPlatform === "Cart Panda" && (
                <div className="space-y-4 p-4 bg-gradient-to-br from-cyan-500/5 to-cyan-500/10 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                    <CheckCircle className="h-4 w-4" />
                    Configuração Cart Panda
                  </div>

                  {/* Product ID */}
                  <div className="space-y-2">
                    <Label htmlFor="cartpanda-product-id">ID do Produto</Label>
                    <Input
                      id="cartpanda-product-id"
                      placeholder={t("integrations.product.id.placeholder")}
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                    />
                  </div>

                  {/* Bearer Token */}
                  <div className="space-y-2">
                    <Label htmlFor="cartpanda-bearer-token">Token</Label>
                    <Input
                      id="cartpanda-bearer-token"
                      type="password"
                      placeholder="Cole aqui o Token da API do Cart Panda"
                      value={cartPandaBearerToken}
                      onChange={(e) => setCartPandaBearerToken(e.target.value)}
                    />
                  </div>

                  {/* Store Slug */}
                  <div className="space-y-2">
                    <Label htmlFor="cartpanda-store-slug">Store Slug *</Label>
                    <Input
                      id="cartpanda-store-slug"
                      placeholder="Ex: minhaloja"
                      value={cartPandaStoreSlug}
                      onChange={(e) => setCartPandaStoreSlug(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Perfect Pay: Token de Webhook */}
              {selectedPlatform === "Perfect Pay" && (
                <div className="space-y-4 p-4 bg-gradient-to-br from-purple-500/5 to-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400">
                    <CheckCircle className="h-4 w-4" />
                    Configuração Perfect Pay
                  </div>

                  {/* Product ID */}
                  <div className="space-y-2">
                    <Label htmlFor="perfectpay-product-id">ID do Produto</Label>
                    <Input
                      id="perfectpay-product-id"
                      placeholder={t("integrations.product.id.placeholder")}
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-token">Token de Webhook</Label>
                    <Input
                      id="webhook-token"
                      type="password"
                      placeholder="Insira o Token de Webhook aqui"
                      value={webhookToken}
                      onChange={(e) => setWebhookToken(e.target.value)}
                    />
                  </div>

                  {/* URL do Webhook */}
                  <div>
                    <Label className="text-xs mb-2 block">🔐 URL para configurar webhook:</Label>
                    <div className="flex items-center gap-2 bg-muted/50 p-3 rounded border border-border">
                      <code className="flex-1 text-xs break-all">https://webhook.migrabook.app</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://webhook.migrabook.app`);
                          toast({ title: "URL copiada!" });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* STRIPE: Configuração */}
              {selectedPlatform === "Stripe" && (
                <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-900 dark:text-purple-100 font-semibold">
                    <CheckCircle className="h-5 w-5" />
                    <span>Configuração Stripe</span>
                  </div>

                  {/* Product ID */}
                  <div className="space-y-2">
                    <Label htmlFor="stripe-product-id">ID do Produto</Label>
                    <Input
                      id="stripe-product-id"
                      placeholder={t("integrations.product.id.placeholder")}
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                    />
                  </div>

                  {/* Stripe Secret Key */}
                  <div className="space-y-2">
                    <Label htmlFor="stripe-secret-key">Stripe Secret Key *</Label>
                    <Input
                      id="stripe-secret-key"
                      type="password"
                      placeholder="sk_live_..."
                      value={stripeApiKey}
                      onChange={(e) => setStripeApiKey(e.target.value)}
                    />
                  </div>

                  {/* Webhook Signing Secret */}
                  <div className="space-y-2">
                    <Label htmlFor="stripe-webhook-secret">Webhook Signing Secret *</Label>
                    <Input
                      id="stripe-webhook-secret"
                      type="password"
                      placeholder="whsec_..."
                      value={webhookToken}
                      onChange={(e) => setWebhookToken(e.target.value)}
                    />
                  </div>

                  {/* URL do Webhook */}
                  <div>
                    <Label className="text-xs mb-2 block">🔐 URL para configurar webhook:</Label>
                    <div className="flex items-center gap-2 bg-muted/50 p-3 rounded border border-border">
                      <code className="flex-1 text-xs break-all">https://webhook.migrabook.app</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://webhook.migrabook.app`);
                          toast({ title: "URL copiada!" });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* HOTMART: Autenticação */}
              {selectedPlatform === "Hotmart" && (
                <div className="space-y-4 p-4 bg-gradient-to-br from-orange-500/5 to-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400">
                    <CheckCircle className="h-4 w-4" />
                    Configuração Hotmart
                  </div>

                  {/* Product ID */}
                  <div className="space-y-2">
                    <Label htmlFor="hotmart-product-id">ID do Produto</Label>
                    <Input
                      id="hotmart-product-id"
                      placeholder={t("integrations.product.id.placeholder")}
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                    />
                  </div>

                  {/* Client ID */}
                  <div className="space-y-2">
                    <Label htmlFor="hotmart-client-id">Client ID</Label>
                    <Input
                      id="hotmart-client-id"
                      placeholder="Insira o Client ID aqui"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                    />
                  </div>

                  {/* Client Secret */}
                  <div className="space-y-2">
                    <Label htmlFor="hotmart-client-secret">Client Secret</Label>
                    <Input
                      id="hotmart-client-secret"
                      type="password"
                      placeholder="Insira o Client Secret aqui"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                    />
                  </div>

                  {/* Basic Token */}
                  <div className="space-y-2">
                    <Label htmlFor="hotmart-basic-token">Basic Token</Label>
                    <Input
                      id="hotmart-basic-token"
                      type="password"
                      placeholder="Insira o Basic Token aqui"
                      value={basicToken}
                      onChange={(e) => setBasicToken(e.target.value)}
                    />
                  </div>

                  {/* HOTTOK */}
                  <div className="space-y-2">
                    <Label htmlFor="hotmart-hottok">HOTTOK (Webhook)</Label>
                    <Input
                      id="hotmart-hottok"
                      type="password"
                      placeholder="Insira o HOTTOK aqui"
                      value={hottok}
                      onChange={(e) => setHottok(e.target.value)}
                    />
                  </div>

                  {/* URL do Webhook */}
                  <div>
                    <Label className="text-xs mb-2 block">🔐 URL para configurar webhook:</Label>
                    <div className="flex items-center gap-2 bg-muted/50 p-3 rounded border border-border">
                      <code className="flex-1 text-xs break-all">https://webhook.migrabook.app</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://webhook.migrabook.app`);
                          toast({ title: "URL copiada!" });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* EDUZZ: Configuração */}
              {selectedPlatform === "Eduzz" && (
                <div className="space-y-4 p-4 bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                    <CheckCircle className="h-4 w-4" />
                    Configuração Eduzz
                  </div>

                  {/* Product ID */}
                  <div className="space-y-2">
                    <Label htmlFor="eduzz-product-id">ID do Produto</Label>
                    <Input
                      id="eduzz-product-id"
                      placeholder={t("integrations.product.id.placeholder")}
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                    />
                  </div>

                  {/* Eduzz Access Key */}
                  <div className="space-y-2">
                    <Label htmlFor="eduzz-key">Chave de Acesso (Webhook Key)</Label>
                    <Input
                      id="eduzz-key"
                      type="password"
                      placeholder="Cole a Chave de Acesso da Eduzz aqui (ex: edzwgp_...)"
                      value={postbackKey}
                      onChange={(e) => setPostbackKey(e.target.value)}
                    />
                  </div>

                  {/* URL do Webhook */}
                  <div>
                    <Label className="text-xs mb-2 block">🔐 URL para configurar webhook:</Label>
                    <div className="flex items-center gap-2 bg-muted/50 p-3 rounded border border-border">
                      <code className="flex-1 text-xs break-all">https://webhook.migrabook.app</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://webhook.migrabook.app`);
                          toast({ title: "URL copiada!" });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* MONETIZZE: Postback Key */}
              {selectedPlatform === "Monetizze" && (
                <div className="space-y-4 p-4 bg-gradient-to-br from-green-500/5 to-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    Configuração Monetizze
                  </div>

                  {/* Product ID */}
                  <div className="space-y-2">
                    <Label htmlFor="monetizze-product-id">ID do Produto</Label>
                    <Input
                      id="monetizze-product-id"
                      placeholder={t("integrations.product.id.placeholder")}
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                    />
                  </div>

                  {/* Postback Key */}
                  <div className="space-y-2">
                    <Label htmlFor="monetizze-postback-key">Postback Key (Webhook)</Label>
                    <Input
                      id="monetizze-postback-key"
                      type="password"
                      placeholder="Cole a Chave Única (Postback Key) aqui"
                      value={postbackKey}
                      onChange={(e) => setPostbackKey(e.target.value)}
                    />
                  </div>

                  {/* URL do Webhook */}
                  <div>
                    <Label className="text-xs mb-2 block">🔐 URL para configurar webhook:</Label>
                    <div className="flex items-center gap-2 bg-muted/50 p-3 rounded border border-border">
                      <code className="flex-1 text-xs break-all">https://webhook.migrabook.app</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://webhook.migrabook.app`);
                          toast({ title: "URL copiada!" });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* TICTO: Configuração */}
              {selectedPlatform === "Ticto" && (
                <div className="space-y-4 p-4 bg-gradient-to-br from-teal-500/5 to-teal-500/10 border border-teal-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400">
                    <CheckCircle className="h-4 w-4" />
                    Configuração Ticto
                  </div>

                  {/* Product ID */}
                  <div className="space-y-2">
                    <Label htmlFor="ticto-product-id">ID do Produto</Label>
                    <Input
                      id="ticto-product-id"
                      placeholder={t("integrations.product.id.placeholder")}
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Encontre o ID do produto na Ticto: Produtos → Selecione o produto → ID do produto
                    </p>
                  </div>

                  {/* Token de Webhook */}
                  <div className="space-y-2">
                    <Label htmlFor="ticto-postback-key">Token de Webhook *</Label>
                    <Input
                      id="ticto-postback-key"
                      type="password"
                      placeholder="Cole o Token fornecido pela Ticto aqui"
                      value={postbackKey}
                      onChange={(e) => setPostbackKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      🔐 Este token garante que os webhooks foram enviados pela Ticto. Encontre em: Tictools → Webhook
                    </p>
                  </div>

                  {/* URL do Webhook */}
                  <div>
                    <Label className="text-xs mb-2 block">🔐 URL para configurar webhook na Ticto:</Label>
                    <div className="flex items-center gap-2 bg-muted/50 p-3 rounded border border-border">
                      <code className="flex-1 text-xs break-all">https://webhook.migrabook.app</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://webhook.migrabook.app`);
                          toast({ title: "URL copiada!" });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border">
                      <p className="text-xs font-medium mb-2">📋 Como configurar na Ticto:</p>
                      <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Acesse: Tictools → Webhook</li>
                        <li>Cole a URL acima no campo "URL"</li>
                        <li>Selecione a versão "2.0 (Recomendado)"</li>
                        <li>Formato de Envio: "JSON (Recomendado)"</li>
                        <li>Marque o evento "Venda Realizada"</li>
                        <li>Clique em "Salvar"</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* CAKTO: Webhook Token */}
              {selectedPlatform === "Cakto" && (
                <div className="space-y-4 p-4 bg-gradient-to-br from-pink-500/5 to-pink-500/10 border border-pink-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-semibold text-pink-600 dark:text-pink-400">
                    <CheckCircle className="h-4 w-4" />
                    Configuração Cakto
                  </div>

                  {/* Product ID */}
                  <div className="space-y-2">
                    <Label htmlFor="cakto-product-id">ID do Produto</Label>
                    <Input
                      id="cakto-product-id"
                      placeholder={t("integrations.product.id.placeholder")}
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                    />
                  </div>

                  {/* Chave Secreta do Webhook */}
                  <div className="space-y-2">
                    <Label htmlFor="cakto-webhook-token">Chave Secreta do Webhook *</Label>
                    <Input
                      id="cakto-webhook-token"
                      type="password"
                      placeholder="Insira a Chave Secreta aqui"
                      value={webhookToken}
                      onChange={(e) => setWebhookToken(e.target.value)}
                    />
                  </div>

                  {/* URL do Webhook */}
                  <div>
                    <Label className="text-xs mb-2 block">🔐 URL para configurar webhook:</Label>
                    <div className="flex items-center gap-2 bg-muted/50 p-3 rounded border border-border">
                      <code className="flex-1 text-xs break-all">https://webhook.migrabook.app</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://webhook.migrabook.app`);
                          toast({ title: "URL copiada!" });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* MUNDPAY: Configuração simples - sem token */}
              {selectedPlatform === "Mundpay" && (
                <div className="space-y-4 p-4 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    Configuração Mundpay
                  </div>

                  {/* Product ID */}
                  <div className="space-y-2">
                    <Label htmlFor="mundpay-product-id">ID da Oferta (Produto) *</Label>
                    <Input
                      id="mundpay-product-id"
                      placeholder="Ex: 019bd6fe-76ff-7245-86aa-e8b2cff684f1"
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 O ID da oferta está no painel da Mundpay: Produtos → Selecione o produto → Ofertas → ID da
                      oferta
                    </p>
                  </div>

                  {/* URL do Webhook */}
                  <div>
                    <Label className="text-xs mb-2 block">🔐 URL de Postback para configurar na Mundpay:</Label>
                    <div className="flex items-center gap-2 bg-muted/50 p-3 rounded border border-border">
                      <code className="flex-1 text-xs break-all">https://webhook.migrabook.app</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://webhook.migrabook.app`);
                          toast({ title: "URL copiada!" });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      📋 Na Mundpay: Conectar → Webhook → Cole a URL acima → Selecione o evento <strong>"Pago"</strong>{" "}
                      → Salvar
                    </p>
                  </div>
                </div>
              )}

              {/* YAMPI: Webhook Configuration */}
              {selectedPlatform === "Yampi" && (
                <div className="space-y-4 p-4 bg-gradient-to-br from-violet-500/5 to-violet-500/10 border border-violet-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400">
                    <CheckCircle className="h-4 w-4" />
                    Configuração Yampi
                  </div>

                  {/* Product ID */}
                  <div className="space-y-2">
                    <Label htmlFor="yampi-product-id">ID do Produto (ID #)</Label>
                    <Input
                      id="yampi-product-id"
                      placeholder={t("integrations.product.id.placeholder")}
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Encontre em: Produtos → Coluna "ID #" (ex: 43713405)
                    </p>
                  </div>

                  {/* Chave Secreta do Webhook */}
                  <div className="space-y-2">
                    <Label htmlFor="yampi-secret-key" className="flex items-center gap-2">
                      🔐 Chave Secreta do Webhook *
                    </Label>
                    <Input
                      id="yampi-secret-key"
                      type="password"
                      placeholder="Cole a chave secreta do webhook aqui"
                      value={yampiSecretKey}
                      onChange={(e) => setYampiSecretKey(e.target.value)}
                    />
                  </div>

                  {/* URL do Webhook */}
                  <div>
                    <Label className="text-xs mb-2 block">🔗 URL para configurar webhook na Yampi:</Label>
                    <div className="flex items-center gap-2 bg-muted/50 p-3 rounded border border-border">
                      <code className="flex-1 text-xs break-all">https://webhook.migrabook.app</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://webhook.migrabook.app`);
                          toast({ title: "URL copiada!" });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* PAYPAL: Configuração */}
              {selectedPlatform === "Paypal" && (
                <div className="space-y-4 p-4 bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                    <CheckCircle className="h-4 w-4" />
                    Configuração PayPal
                  </div>

                  {/* PayPal Client ID */}
                  <div className="space-y-2">
                    <Label htmlFor="paypal-client-id">Client ID *</Label>
                    <Input
                      id="paypal-client-id"
                      type="text"
                      placeholder="Ex: AYSq3RDGsmBLJE-otTkBtM-j..."
                      value={paypalClientId}
                      onChange={(e) => setPaypalClientId(e.target.value)}
                    />
                  </div>

                  {/* PayPal Secret */}
                  <div className="space-y-2">
                    <Label htmlFor="paypal-secret">Secret *</Label>
                    <Input
                      id="paypal-secret"
                      type="password"
                      placeholder="Cole o Secret do PayPal aqui"
                      value={paypalSecret}
                      onChange={(e) => setPaypalSecret(e.target.value)}
                    />
                  </div>

                  {/* URL do Webhook */}
                  <div>
                    <Label className="text-xs mb-2 block">🔐 URL para configurar webhook:</Label>
                    <div className="flex items-center gap-2 bg-muted/50 p-3 rounded border border-border">
                      <code className="flex-1 text-xs break-all">https://webhook.migrabook.app</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://webhook.migrabook.app`);
                          toast({ title: "URL copiada!" });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex gap-2">
                {editingId && (
                  <Button onClick={clearForm} variant="outline" className="flex-1" size="lg">
                    Cancelar
                  </Button>
                )}
                <Button onClick={handleSave} disabled={loading} className="flex-1" size="lg">
                  {loading ? "Salvando..." : editingId ? "Atualizar Integração" : "Salvar Integração"}
                </Button>
              </div>

              {/* Instruções do Webhook Hotmart */}
              {showWebhookInstructions && (
                <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-500/30 rounded-lg space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                        ✅ Integração Hotmart Salva!
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                        <strong>Último passo:</strong> Configure o Webhook na Hotmart para receber notificações de
                        compra e enviar o e-mail de acesso automaticamente.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pl-9">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-green-200 dark:border-green-800 space-y-3">
                      <p className="text-sm font-semibold text-foreground">📋 Siga estes passos:</p>

                      <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                        <li>
                          Acesse:{" "}
                          <a
                            href="https://developers.hotmart.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                          >
                            developers.hotmart.com
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                        <li>
                          Clique em: <strong>Webhook</strong> → <strong>Gerenciar webhook</strong>
                        </li>
                        <li>
                          Clique em: <strong>Criar nova configuração</strong>
                        </li>
                        <li>
                          Selecione o <strong>produto</strong> que você integrou (ID: {productId})
                        </li>
                        <li>
                          Cole esta URL no campo <strong>"URL do webhook"</strong>:
                        </li>
                      </ol>

                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                        <code className="flex-1 text-xs font-mono text-foreground break-all">
                          https://webhook.migrabook.app
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(`https://webhook.migrabook.app`);
                            toast({
                              title: "✅ URL copiada!",
                              description: "Cole no campo 'URL do webhook' da Hotmart",
                            });
                          }}
                          className="flex-shrink-0"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </Button>
                      </div>

                      <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside" start={6}>
                        <li>
                          Selecione a <strong>Versão: 2.0.0</strong>
                        </li>
                        <li>
                          Marque o evento: <strong>PURCHASE_COMPLETE</strong>
                        </li>
                        <li>
                          <strong>IMPORTANTE:</strong> Copie o <strong>HOTTOK</strong> gerado pela Hotmart (é um código
                          de segurança único)
                        </li>
                        <li>
                          Clique em <strong>Salvar</strong>
                        </li>
                      </ol>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded border border-orange-200 dark:border-orange-800">
                      <p className="text-xs text-orange-800 dark:text-orange-200 font-medium mb-2">
                        🔐 <strong>Sobre o HOTTOK:</strong>
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        O HOTTOK é um código de segurança que a Hotmart gera para cada webhook. Ele garante que apenas
                        webhooks legítimos da Hotmart sejam processados. Você já configurou o HOTTOK nesta integração ✓
                      </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        💡 <strong>Dica:</strong> Após configurar, faça uma compra de teste para verificar se o e-mail
                        de acesso está sendo enviado corretamente.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWebhookInstructions(false)}
                    className="w-full mt-2"
                  >
                    {t("integrations.instructions.close")}
                  </Button>
                </div>
              )}

              {/* Instruções do Webhook Monetizze */}
              {showMonetizzeInstructions && (
                <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-500/30 rounded-lg space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                        ⚠️ Monetizze será validado na primeira compra
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                        Como a Monetizze não possui API de validação prévia, o sistema verificará automaticamente quando
                        a primeira compra chegar via webhook.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pl-9">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-green-200 dark:border-green-800 space-y-3">
                      <p className="text-sm font-semibold text-foreground">🔍 O que será validado:</p>

                      <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
                        <li>
                          Se o <strong>Product ID</strong> corresponde ao produto cadastrado
                        </li>
                        <li>
                          Se o <strong>Postback Key</strong> é válido e corresponde à sua conta Monetizze
                        </li>
                        <li>Se os dados da compra estão completos e corretos</li>
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-green-200 dark:border-green-800 space-y-3">
                      <p className="text-sm font-semibold text-foreground">📋 Próximos passos:</p>

                      <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                        <li>
                          Acesse o painel Monetizze → <strong>Postback Ferramentas</strong>
                        </li>
                        <li>
                          Configure a <strong>URL do Postback</strong>:
                        </li>
                      </ol>

                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                        <code className="flex-1 text-xs font-mono text-foreground break-all">
                          https://webhook.migrabook.app
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(`https://webhook.migrabook.app`);
                            toast({
                              title: "✅ URL copiada!",
                              description: "Cole no campo de URL do Postback da Monetizze",
                            });
                          }}
                          className="flex-shrink-0"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </Button>
                      </div>

                      <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside" start={3}>
                        <li>
                          Marque <strong>APENAS</strong> os eventos: <strong>"Finalizada / Aprovada"</strong> e{" "}
                          <strong>"Completa"</strong>
                        </li>
                        <li>
                          Verifique se a <strong>Chave única (Postback Key)</strong> está correta
                        </li>
                        <li>
                          Clique em <strong>Salvar</strong>
                        </li>
                      </ol>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        💡 <strong>Dica:</strong> Faça uma compra de teste (pode ser R$ 1,00) ou use o Postman para
                        simular uma compra e verificar se tudo está funcionando corretamente.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMonetizzeInstructions(false)}
                    className="w-full mt-2"
                  >
                    {t("integrations.instructions.close")}
                  </Button>
                </div>
              )}

              {/* Instruções do Webhook Eduzz */}
              {showEduzzInstructions && (
                <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-500/30 rounded-lg space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        ⚠️ Eduzz será validado na primeira compra
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                        Como a Eduzz não possui API de validação prévia, o sistema verificará automaticamente quando a
                        primeira compra chegar via webhook.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pl-9">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3">
                      <p className="text-sm font-semibold text-foreground">🔍 O que será validado:</p>

                      <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
                        <li>
                          Se o <strong>Product ID</strong> (produto_codigo) corresponde ao produto cadastrado
                        </li>
                        <li>
                          Se a <strong>Chave de Webhook (Eduzz Key)</strong> é válida
                        </li>
                        <li>Se os dados da compra estão completos e corretos</li>
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3">
                      <p className="text-sm font-semibold text-foreground">📋 Próximos passos:</p>

                      <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                        <li>
                          Acesse o painel Eduzz → <strong>Configurações</strong> → <strong>Integrações</strong> →{" "}
                          <strong>Webhook</strong>
                        </li>
                        <li>
                          Configure a <strong>URL do Webhook</strong>:
                        </li>
                      </ol>

                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                        <code className="flex-1 text-xs font-mono text-foreground break-all">
                          https://webhook.migrabook.app
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(`https://webhook.migrabook.app`);
                            toast({
                              title: "✅ URL copiada!",
                              description: "Cole no campo de URL do Webhook da Eduzz",
                            });
                          }}
                          className="flex-shrink-0"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </Button>
                      </div>

                      <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside" start={3}>
                        <li>
                          Selecione os eventos: <strong>"Venda Aprovada"</strong> e <strong>"Venda Completa"</strong>
                        </li>
                        <li>
                          Cole a <strong>Chave de Webhook</strong> que você configurou acima
                        </li>
                        <li>
                          Clique em <strong>Salvar</strong>
                        </li>
                      </ol>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        💡 <strong>Dica:</strong> Faça uma compra de teste ou use o Postman para simular uma compra e
                        verificar se o webhook está funcionando corretamente.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEduzzInstructions(false)}
                    className="w-full mt-2"
                  >
                    {t("integrations.instructions.close")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de Integrações */}
          <Card>
            <CardHeader>
              <CardTitle>Integrações Ativas</CardTitle>
              <CardDescription>{integrations.length} integração(ões) configurada(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {integrations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t("integrations.none")}</div>
              ) : (
                <div className="space-y-3">
                  {integrations.map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between gap-3 p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          {integration.provider}
                          {integration.api_token && (
                            <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded">
                              ✓ Validado
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          Produto: <span className="font-mono">{integration.product_id}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 truncate">
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{integration.app_link}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(integration)}
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary hover:border-primary"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(integration.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login-email" className="space-y-6">
          {/* Seção de Configuração de Login por Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Login por E-mail de Compra
              </CardTitle>
              <CardDescription>
                Ative para exigir que visitantes insiram o e-mail usado na compra para acessar o app. Funciona apenas
                para apps com integração configurada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingApps ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : appsWithLogin.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum app publicado. Publique um app para configurar o login.
                </div>
              ) : (
                <div className="space-y-3">
                  {appsWithLogin.map((app) => (
                    <div
                      key={app.id}
                      className={cn(
                        "flex items-center justify-between gap-4 p-4 rounded-lg border transition-colors",
                        app.has_integration
                          ? "bg-muted/50 border-border hover:border-primary/50"
                          : "bg-muted/20 border-dashed border-muted-foreground/30 opacity-60",
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground flex items-center gap-2">
                          {app.nome}
                          {app.require_login && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Protegido
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          /{app.slug}
                          {!app.has_integration && (
                            <span className="ml-2 text-yellow-600 dark:text-yellow-400">⚠️ Sem integração</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={app.require_login}
                          onCheckedChange={(checked) => handleToggleLogin(app.id, checked)}
                          disabled={!app.has_integration || updatingLoginApp === app.id}
                        />
                        {updatingLoginApp === app.id && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  💡 <strong>Como funciona:</strong> Quando ativado, o visitante precisa inserir o e-mail usado na
                  compra. O sistema verifica se existe uma compra registrada com esse e-mail para liberar o acesso. A
                  sessão é permanente no dispositivo.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {videoDialog && (
        <VideoPlayerDialog
          open={!!videoDialog}
          onOpenChange={(open) => !open && setVideoDialog(null)}
          videoUrl={videoDialog.url}
          title={videoDialog.title}
        />
      )}
    </PremiumOverlay>
  );
}
