import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

interface VerificationCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  password: string;
  onSuccess: () => void;
  onBeforeRedirect?: () => void;
}

export const VerificationCodeDialog = ({ 
  open, 
  onOpenChange, 
  email,
  password,
  onSuccess,
  onBeforeRedirect
}: VerificationCodeDialogProps) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 5) {
      toast({
        title: t("auth.verification.invalid_code"),
        description: t("auth.verification.code_length"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Verificar o código
      const { data, error } = await supabase.functions.invoke("verify-code", {
        body: { email, code },
      });

      if (error) throw error;

      if (data?.success) {
        // IMPORTANTE: Ativar o preloader no componente pai ANTES de qualquer mudança de auth
        onBeforeRedirect?.();
        
        // Fechar o dialog imediatamente
        onOpenChange(false);
        
        // Fazer login automático após verificação
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error("Error signing in after verification:", signInError);
          toast({
            title: t("auth.verification.success"),
            description: t("auth.verification.login_manually"),
          });
        } else {
          toast({
            title: t("auth.verification.success"),
            description: t("auth.verification.redirecting"),
          });
        }
        
        // Chamar onSuccess para redirecionar para Stripe
        onSuccess();
      } else {
        toast({
          title: t("auth.verification.error"),
          description: data?.error || t("auth.verification.invalid_or_expired"),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error verifying code:", error);
      toast({
        title: t("auth.verification.error"),
        description: error.message || t("auth.verification.try_again"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
    setCode(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-gradient-neon rounded-xl flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold">{t("auth.verification.title")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("auth.verification.sent_to")} <strong>{email}</strong>
            <br />
            <span className="text-xs text-muted-foreground">
              {t("auth.verification.expires")}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-center block">
              {t("auth.verification.code_label")}
            </Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={code}
              onChange={handleCodeChange}
              placeholder="00000"
              className="text-center text-2xl font-bold tracking-widest"
              maxLength={5}
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center">
              {t("auth.verification.code_hint")}
            </p>
          </div>

          <Button type="submit" disabled={isLoading || code.length !== 5} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("auth.verification.verifying")}
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" />
                {t("auth.verification.verify_button")}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {t("auth.verification.not_received")}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
