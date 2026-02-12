import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Globe, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { PhoneField } from "@/components/PhoneField";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "@/components/PhoneField.css";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { platformName, platformDescription } = usePlatformSettings();

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        navigate("/app");
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          throw new Error(t("auth.name_required"));
        }
        if (!phone.trim()) {
          throw new Error(t("auth.phone_required"));
        }

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
          throw new Error(error.message || t("auth.error"));
        }
        
        if (!data?.success) {
          // Verificar código de erro específico
          if (data?.errorCode === 'email_exists') {
            throw new Error(t("auth.error.email_exists"));
          }
          throw new Error(data?.error || t("auth.error"));
        }
        
        toast({
          title: t("auth.signup.success") || "Conta criada!",
          description: t("auth.signup.redirecting") || "Redirecionando...",
        });

        // Conta já confirmada - fazer login automático
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error("[Auth] Error signing in after signup:", signInError);
        }

        // Navegar para /pricing
        setTimeout(() => navigate("/pricing"), 150);

      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: t("auth.login_success"),
          description: t("auth.login_redirecting"),
        });

        // Pequeno delay para garantir que o estado de autenticação seja propagado
        setTimeout(() => navigate("/app"), 150);
      }
    } catch (error: any) {
      const errorMessage = error.message?.toLowerCase() || "";
      const isInvalidCredentials = errorMessage.includes("invalid login credentials") || 
                                    errorMessage.includes("invalid_credentials");
      
      toast({
        title: t("auth.error"),
        description: isInvalidCredentials 
          ? t("toast.login.error.invalid_credentials") 
          : error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset-link', {
        body: { 
          email: resetEmail,
          redirectUrl: window.location.origin
        }
      });
  
      if (error) throw error;
  
      if (!data?.success) {
        if (data?.errorCode === "user_not_found") {
          throw new Error(t("auth.password_reset.user_not_found"));
        }
        throw new Error(t("auth.password_reset.error"));
      }
  
      toast({
        title: t("auth.reset_link_sent"),
        description: t("auth.reset_link_sent_desc"),
      });
  
      setShowForgotPassword(false);
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

  // Removido handlePasswordResetSuccess pois não usamos mais o dialog de código

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-6">
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-app-surface/50 backdrop-blur-sm">
              <Globe className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage("pt")}>🇧🇷 Português</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("en")}>🇺🇸 English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("es")}>🇪🇸 Español</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-8 w-8 p-0 bg-app-surface/50 backdrop-blur-sm"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={theme === "light" ? "/migrabook-favicon.png" : "/migrabook-logo.png"}
            alt="Logo" 
            className="w-16 h-16 mx-auto mb-2 object-contain"
          />
          <h1 className="text-2xl font-bold text-foreground mb-2">{platformName}</h1>
          <p className="text-app-muted">{t("auth.app.subtitle")}</p>
        </div>

        <Card className="bg-app-surface border-app-border p-6">
          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-app-surface-hover">
              <TabsTrigger
                value="login"
                onClick={() => setIsSignUp(false)}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t("auth.login.button")}
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                onClick={() => setIsSignUp(true)}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t("auth.signup.button")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{t("auth.login.title")}</h3>
                <p className="text-sm text-app-muted">{t("auth.login.subtitle")}</p>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{t("auth.signup.title")}</h3>
                <p className="text-sm text-app-muted">{t("auth.signup.subtitle")}</p>
              </div>
            </TabsContent>

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground">
                    {t("auth.full_name")}
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("auth.full_name.placeholder")}
                    required
                    className="bg-app-surface-hover border-app-border focus:border-primary"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  {t("auth.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.email.placeholder")}
                  required
                  autoComplete="email"
                  className="bg-app-surface-hover border-app-border focus:border-primary"
                />
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    {t("auth.phone")}
                  </Label>
                  <PhoneField
                    value={phone}
                    onChange={(value) => setPhone(value || "")}
                    placeholder={t("auth.phone.placeholder")}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  {t("auth.password")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.password.placeholder")}
                    required
                    minLength={6}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    className="bg-app-surface-hover border-app-border focus:border-primary pr-10"
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

              {!isSignUp && (
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
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-neon hover:opacity-90 text-white font-semibold h-11"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isSignUp ? t("auth.signup.loading") : t("auth.login.loading")}
                  </>
                ) : (
                  <>{isSignUp ? t("auth.signup.button") : t("auth.login.button")}</>
                )}
              </Button>
            </form>
          </Tabs>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-app-muted">
            {t("auth.terms.text")}{" "}
            <Link to="/termos" className="text-primary hover:underline">
              {t("auth.terms.link")}
            </Link>{" "}
            {t("auth.terms.and")}{" "}
            <Link to="/privacidade" className="text-primary hover:underline">
              {t("auth.privacy.link")}
            </Link>
          </p>
        </div>

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
                  className="bg-app-surface-hover border-app-border focus:border-primary"
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
                  className="flex-1 bg-gradient-neon hover:opacity-90"
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
      </div>
    </div>
  );
};

export default Auth;
