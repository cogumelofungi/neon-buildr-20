import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import { PhoneField } from "@/components/PhoneField";
import { useLanguage } from "@/hooks/useLanguage";
import { BillingCycle } from "@/config/stripeCheckoutLinks";
import { getUtmData } from "@/hooks/useUtmCapture";
import { getFacebookTrackingData } from "@/hooks/useFacebookTracking";
import { CheckoutPreloader } from "@/components/CheckoutPreloader";

interface PlanosAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlanName: string;
  selectedPlanId: string;
  billingCycle: BillingCycle;
  originalPrice?: number;
  currentPrice?: number;
  onSuccess?: () => void;
}

export const PlanosAuthDialog = ({
  open,
  onOpenChange,
  selectedPlanName,
  selectedPlanId,
  billingCycle,
  originalPrice,
  currentPrice,
}: PlanosAuthDialogProps) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const getTitleText = () => {
    switch (language) {
      case 'en':
        return 'Complete your details to continue';
      case 'es':
        return 'Complete sus datos para continuar';
      default:
        return 'Complete seus dados para continuar';
    }
  };

  const getButtonText = () => {
    switch (language) {
      case 'en':
        return 'Continue to payment';
      case 'es':
        return 'Continuar para el pago';
      default:
        return 'Continuar para o pagamento';
    }
  };

  const discountPercent = originalPrice && currentPrice 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0;

  const redirectToCheckout = async (userData: {name: string; email: string; phone: string}) => {
    setIsRedirectingToCheckout(true);
    
    try {
      // Usar edge function para criar Checkout Session com todos os dados preenchidos
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          planId: selectedPlanId,
          billingCycle: billingCycle,
          customerName: userData.name,
          customerEmail: userData.email,
          customerPhone: userData.phone,
        }
      });

      if (error) {
        console.error('[PlanosAuthDialog] Error creating checkout session:', error);
        setIsRedirectingToCheckout(false);
        toast({
          title: t("auth.error.title"),
          description: error.message || "Erro ao criar sessão de checkout",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        setIsRedirectingToCheckout(false);
        throw new Error("URL de checkout não retornada");
      }
    } catch (error: any) {
      console.error('[PlanosAuthDialog] Error:', error);
      setIsRedirectingToCheckout(false);
      toast({
        title: t("auth.error.title"),
        description: error.message || "Erro ao redirecionar para checkout",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!fullName.trim()) {
        throw new Error(t("auth.validation.name_required"));
      }
      if (!phone.trim()) {
        throw new Error(t("auth.validation.phone_required"));
      }

      const preferredLanguage = language === "pt" ? "pt-br" : language === "en" ? "en-us" : "es";

      // Obter UTMs salvos no sessionStorage
      const utmData = getUtmData();
      
      // Obter dados de rastreamento do Facebook (FBP, FBC, EXTERNAL_ID, USER_AGENT)
      const fbTrackingData = getFacebookTrackingData();

      // Registrar na Brevo sem criar conta (sem senha)
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email,
          password: null, // Sem senha - apenas registra na Brevo
          fullName,
          phone,
          preferredLanguage,
          planId: selectedPlanId,
          skipUserCreation: true, // Nova flag para não criar usuário ainda
          // Passar UTMs para rastreamento
          utmSource: utmData.ld_app_utm_source,
          utmMedium: utmData.ld_app_utm_medium,
          utmCampaign: utmData.ld_app_utm_campaign,
          utmTerm: utmData.ld_app_utm_term,
          utmContent: utmData.ld_app_utm_content,
          // Passar dados de rastreamento do Facebook
          fbp: fbTrackingData.fbp,
          fbc: fbTrackingData.fbc,
          externalId: fbTrackingData.external_id,
          userAgent: fbTrackingData.user_agent,
        }
      });

      if (error) {
        throw new Error(error.message || t("auth.error.title"));
      }
      
      // Mesmo que email já exista, continuar para checkout (Brevo foi atualizado)
      toast({
        title: language === "en" ? "Data saved!" : language === "es" ? "¡Datos guardados!" : "Dados salvos!",
        description: language === "en" ? "Redirecting to checkout..." : language === "es" ? "Redirigiendo al pago..." : "Redirecionando para o pagamento...",
      });

      // Redirecionar direto para o checkout
      onOpenChange(false);
      redirectToCheckout({ name: fullName, email, phone });
    } catch (error: any) {
      toast({
        title: t("auth.error.title"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setFullName("");
    setPhone("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const getTermsText = () => {
    switch (language) {
      case 'en':
        return {
          prefix: 'By continuing you agree to our',
          terms: 'Terms of Use',
          and: 'and',
          privacy: 'Privacy Policies'
        };
      case 'es':
        return {
          prefix: 'Al continuar aceptas nuestros',
          terms: 'Términos de Uso',
          and: 'y',
          privacy: 'Políticas de Privacidad'
        };
      default:
        return {
          prefix: 'Ao continuar você concorda com os nossos',
          terms: 'Termos de Uso',
          and: 'e',
          privacy: 'Políticas de Privacidade'
        };
    }
  };

  const termsText = getTermsText();

  return (
    <>
      <CheckoutPreloader isVisible={isRedirectingToCheckout} />
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center pb-0 space-y-2 pt-2">
            {/* Plan Badge */}
            <div className="flex justify-center mb-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>{selectedPlanName}</span>
              </div>
            </div>

            {/* Original price with discount */}
            {originalPrice && currentPrice && (
              <div className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  <span className="line-through">De R$ {originalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  <span className="text-red-500 ml-2 font-semibold">-{discountPercent}%</span>
                </p>
              </div>
            )}
            
            <DialogTitle className="text-xl font-bold text-center leading-tight text-foreground">
              {getTitleText()}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">
                {language === "en" ? "Name" : language === "es" ? "Nombre" : "Nome"}
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={language === "en" ? "Your full name" : language === "es" ? "Tu nombre completo" : "Seu nome completo"}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.email.placeholder")}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">{t("auth.phone")}</Label>
              <PhoneField
                value={phone}
                onChange={(value) => setPhone(value || "")}
                placeholder={t("auth.phone.placeholder")}
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-[#2054DE] hover:bg-[#1a45b8] text-white font-bold text-base py-3 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("auth.signup.loading")}
                </>
              ) : (
                getButtonText()
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {termsText.prefix}{" "}
              <a href="/termos" target="_blank" className="text-primary hover:underline">
                {termsText.terms}
              </a>{" "}
              {termsText.and}{" "}
              <a href="/privacidade" target="_blank" className="text-primary hover:underline">
                {termsText.privacy}
              </a>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};