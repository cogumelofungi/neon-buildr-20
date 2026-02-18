import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { PhoneField } from "@/components/PhoneField";
import { useLanguage } from "@/hooks/useLanguage";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { PasswordResetDialog } from "@/components/PasswordResetDialog";
import { useNavigate } from "react-router-dom";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  redirectAfterLogin?: string;
}

export const AuthDialog = ({ open, onOpenChange, onSuccess, redirectAfterLogin }: AuthDialogProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [resetEmailForCode, setResetEmailForCode] = useState("");
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { platformName } = usePlatformSettings();
  
  // Traduções para a descrição do popup
  const getPopupDescription = () => {
    switch (language) {
      case 'en':
        return 'Convert your ebook to an app in minutes';
      case 'es':
        return 'Convierte tu ebook en una app en minutos';
      default:
        return 'Converta seu ebook para app em minutos';
    }
  };
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          throw new Error(t("auth.validation.name_required"));
        }
        if (!phone.trim()) {
          throw new Error(t("auth.validation.phone_required"));
        }

        // Converter o idioma para o formato esperado
        const preferredLanguage = language === "pt" ? "pt-br" : language === "en" ? "en-us" : "es";

        const { data, error } = await supabase.functions.invoke('create-user', {
          body: {
            email,
            password,
            fullName,
            phone,
            preferredLanguage,
          }
        });

        if (error) {
          throw new Error(error.message || t("auth.error.title"));
        }
        
        if (!data?.success) {
          // Verificar código de erro específico
          if (data?.errorCode === 'email_exists') {
            throw new Error(t("auth.error.email_exists"));
          }
          throw new Error(data?.error || t("auth.error.title"));
        }

        toast({
          title: t("auth.signup.success") || "Conta criada!",
          description: t("auth.signup.redirecting") || "Redirecionando...",
        });

        // Conta já confirmada - fazer login automático e redirecionar
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error("[AuthDialog] Error signing in after signup:", signInError);
        }

        onOpenChange(false);
        setTimeout(() => {
          navigate("/pricing");
        }, 150);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        // Verificar se o erro é de email não confirmado (não deve mais acontecer, mas por segurança)
        if (error) {
          throw error;
        }

        // Login bem sucedido

        toast({
          title: t("auth.login.success"),
        });

        onOpenChange(false);
        
        // Pequeno delay para garantir que o estado de autenticação seja propagado
        setTimeout(() => {
          onSuccess?.();
        }, 150);
      }
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
    setPassword("");
    setFullName("");
    setPhone("");
    setIsSignUp(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };


  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset-code', {
        body: { email: resetEmail }
      });
  
      if (error) throw error;
  
      if (!data?.success) {
        if (data?.errorCode === "user_not_found") {
          throw new Error(t("auth.password_reset.user_not_found"));
        }
        throw new Error(t("auth.password_reset.error"));
      }
  
      toast({
        title: t("auth.code_sent"),
        description: t("auth.code_sent_desc"),
      });
  
      setShowForgotPassword(false);
      setResetEmailForCode(resetEmail);
      setShowPasswordResetDialog(true);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: t("auth.password_reset.error_title"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetSuccess = () => {
    toast({
      title: t("auth.password_changed"),
      description: t("auth.password_changed_desc"),
    });
    
    setShowPasswordResetDialog(false);
    setResetEmailForCode("");
    setIsSignUp(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center pb-0 space-y-0 pt-2">
            <DialogTitle className="text-xl font-bold text-center leading-tight text-foreground">
              Converta seu eBook/PDF em App<br />e venda mais todos os dias
            </DialogTitle>
            <div className="flex justify-center pt-2 pb-1">
              <span className="relative inline-block font-bold text-xl text-gray-900">
                <span 
                  className="absolute bg-yellow-400 -skew-y-1 transform top-[25%] h-[70%] dark:top-[15%] dark:h-[80%]"
                  style={{ 
                    left: '-4px',
                    right: '-4px',
                    zIndex: 0
                  }}
                />
                <span className="relative z-10 px-1">Teste grátis por 7 dias</span>
              </span>
            </div>
          </DialogHeader>

          {isSignUp ? (
            // Tela de Criar Conta
            <form onSubmit={handleAuth} className="space-y-3 mt-1">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                <PhoneField
                  value={phone}
                  onChange={(value) => setPhone(value || "")}
                  placeholder={t("auth.phone.placeholder")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.password.placeholder")}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-[#2054DE] hover:bg-[#1a45b8] text-white font-bold text-base py-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("auth.signup.loading")}
                  </>
                ) : (
                  "Sim, quero testar 7 dias grátis"
                )}
              </Button>

              <div className="text-center">
                <span className="text-sm text-muted-foreground">Já tem conta? </span>
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  Faça login
                </button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Ao criar uma conta você concorda com os nossos{" "}
                <a href="/termos" target="_blank" className="text-primary hover:underline">
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a href="/privacidade" target="_blank" className="text-primary hover:underline">
                  Políticas de Privacidade
                </a>
              </p>
            </form>
          ) : (
            // Tela de Login
            <form onSubmit={handleAuth} className="space-y-3 mt-2">
              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.password.placeholder")}
                    required
                    minLength={6}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Button
                  type="button"
                  variant="link"
                  className="text-xs text-primary hover:underline p-0 h-auto"
                  onClick={() => setShowForgotPassword(true)}
                >
                  {t("auth.forgot_password")}
                </Button>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-[#2054DE] hover:bg-[#1a45b8] text-white font-bold">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("auth.login.loading")}
                  </>
                ) : (
                  t("auth.login.button")
                )}
              </Button>

              <div className="text-center">
                <span className="text-sm text-muted-foreground">Não tem conta? </span>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  Criar conta
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("auth.recover_password")}</DialogTitle>
            <DialogDescription>
              {t("auth.recover_password_desc")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail">{t("auth.email")}</Label>
              <Input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder={t("auth.email.placeholder")}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail("");
                }}
                className="flex-1"
              >
                {t("editor.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("auth.sending")}
                  </>
                ) : (
                  t("auth.send_link")
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <PasswordResetDialog
        open={showPasswordResetDialog}
        onOpenChange={setShowPasswordResetDialog}
        email={resetEmailForCode}
        onSuccess={handlePasswordResetSuccess}
      />
    </>
  );
};
