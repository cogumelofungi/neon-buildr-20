import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { platformName } = usePlatformSettings();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  useEffect(() => {
    if (!token || !email) {
      setError(t("auth.reset_password.invalid_link"));
    }
  }, [token, email, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      toast({
        title: t("auth.error"),
        description: t("auth.password_min_length"),
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t("auth.error"),
        description: t("auth.passwords_dont_match"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: resetError } = await supabase.functions.invoke("reset-password", {
        body: { 
          email: decodeURIComponent(email || ""),
          token,
          newPassword 
        },
      });

      if (resetError) throw resetError;

      if (!data?.success) {
        throw new Error(data?.error || t("auth.reset_password.error"));
      }

      setIsSuccess(true);
      
      toast({
        title: t("auth.password_changed"),
        description: t("auth.password_changed_desc"),
      });

      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err: any) {
      console.error("Error resetting password:", err);
      setError(err.message || t("auth.reset_password.error"));
      toast({
        title: t("auth.error"),
        description: err.message || t("auth.reset_password.error"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Tela de erro (link inválido ou expirado)
  if (error && !token) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src={theme === "light" ? "/migrabook-favicon.png" : "/migrabook-logo.png"}
              alt="Logo" 
              className="w-16 h-16 mx-auto mb-2 object-contain"
            />
            <h1 className="text-2xl font-bold text-foreground mb-2">{platformName}</h1>
          </div>

          <Card className="bg-app-surface border-app-border p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">{t("auth.reset_password.invalid_link_title")}</h2>
              <p className="text-app-muted">{error}</p>
              <Button 
                onClick={() => navigate("/login")}
                className="w-full bg-gradient-neon hover:opacity-90"
              >
                {t("auth.back_to_login")}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Tela de sucesso
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src={theme === "light" ? "/migrabook-favicon.png" : "/migrabook-logo.png"}
              alt="Logo" 
              className="w-16 h-16 mx-auto mb-2 object-contain"
            />
            <h1 className="text-2xl font-bold text-foreground mb-2">{platformName}</h1>
          </div>

          <Card className="bg-app-surface border-app-border p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">{t("auth.password_changed")}</h2>
              <p className="text-app-muted">{t("auth.reset_password.success_redirect")}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-app-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("auth.redirecting")}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Formulário de redefinição de senha
  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={theme === "light" ? "/migrabook-favicon.png" : "/migrabook-logo.png"}
            alt="Logo" 
            className="w-16 h-16 mx-auto mb-2 object-contain"
          />
          <h1 className="text-2xl font-bold text-foreground mb-2">{platformName}</h1>
          <p className="text-app-muted">{t("auth.reset_password.subtitle")}</p>
        </div>

        <Card className="bg-app-surface border-app-border p-6">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{t("auth.reset_password.title")}</h3>
              <p className="text-sm text-app-muted">
                {t("auth.reset_password.enter_new_password")}
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-foreground">
                  {t("auth.new_password")}
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("auth.new_password.placeholder")}
                    required
                    minLength={8}
                    autoComplete="new-password"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  {t("auth.confirm_password")}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("auth.confirm_password.placeholder")}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="bg-app-surface-hover border-app-border focus:border-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword}
                className="w-full bg-[#2054DE] hover:bg-[#1a45b8] text-white font-semibold h-11"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("auth.resetting_password")}
                  </>
                ) : (
                  t("auth.reset_password.button")
                )}
              </Button>
            </form>

            <div className="text-center">
              <Link to="/login" className="text-sm text-primary hover:underline">
                {t("auth.back_to_login")}
              </Link>
            </div>
          </div>
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
      </div>
    </div>
  );
};

export default ResetPassword;
