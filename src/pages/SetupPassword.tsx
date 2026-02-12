import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

const SetupPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);

  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError("Token não encontrado na URL");
        setIsValidating(false);
        return;
      }

      try {
        // Verificar se o token é válido usando função segura
        const { data: rows, error } = await supabase
          .rpc("get_pending_user_by_token", { p_token: token });
        
        const data = rows && rows.length > 0 ? rows[0] : null;

        if (error || !data) {
          setTokenError("Token inválido ou não encontrado");
          setIsValidating(false);
          return;
        }

        if (data.used_at) {
          setTokenError("Este link já foi utilizado. Faça login com suas credenciais.");
          setIsValidating(false);
          return;
        }

        if (new Date(data.expires_at) < new Date()) {
          setTokenError("Este link expirou. Entre em contato com o suporte.");
          setIsValidating(false);
          return;
        }

        setEmail(data.email);
        setPlanName(data.plan_name);
        setIsValidating(false);
      } catch (err) {
        setTokenError("Erro ao validar token");
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  useEffect(() => {
    if (emailParam && !email) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [emailParam, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("complete-registration", {
        body: { token, password },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setIsSuccess(true);

      toast({
        title: "Sucesso!",
        description: "Sua conta foi configurada. Fazendo login...",
      });

      // Fazer login automático
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Se o login falhar, redirecionar para a página de login
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        // Se o login for bem-sucedido, redirecionar para /app
        setTimeout(() => {
          navigate("/app");
        }, 1500);
      }
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao configurar senha",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Validando link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenError) {
    // Check if the error is because the link was already used (account created successfully)
    const isAlreadyUsed = tokenError.includes("já foi utilizado");
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            {isAlreadyUsed ? (
              <>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-green-600 mb-2">Acesso já criado com sucesso</h2>
                <p className="text-muted-foreground text-center mb-6">
                  Este link foi usado para criar sua senha e acessar o MigraBook.
                  <br /><br />
                  Para continuar, clique no botão abaixo.
                </p>
                <Button onClick={() => navigate("/")} className="bg-primary hover:bg-primary/90">
                  Ir para o login
                </Button>
              </>
            ) : (
              <>
                <CardHeader className="text-center p-0 mb-4">
                  <CardTitle className="text-destructive">Link Inválido</CardTitle>
                  <CardDescription>{tokenError}</CardDescription>
                </CardHeader>
                <Button onClick={() => navigate("/")} variant="outline">
                  Ir para Login
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Conta configurada!</h2>
            <p className="text-muted-foreground text-center">
              Redirecionando para o aplicativo...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Configure sua senha</CardTitle>
          <CardDescription>
            {planName && (
              <span className="block text-primary font-medium mb-1">
                Plano {planName} ativado! 🎉
              </span>
            )}
            Crie uma senha para acessar sua conta MigraBook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite a senha novamente"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando...
                </>
              ) : (
                "Criar conta e acessar"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupPassword;
