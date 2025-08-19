import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Rocket } from "lucide-react";
import { PhoneInputCustom } from "@/components/PhoneInputCustom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se já está logado
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
          throw new Error("Nome completo é obrigatório");
        }
        if (!phone) {
          throw new Error("Telefone é obrigatório");
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/pricing`,
            data: {
              full_name: fullName,
              phone: phone
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar a conta e escolher seu plano.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando...",
        });
        
        navigate("/app");
      }
    } catch (error: any) {
      toast({
        title: "Erro na autenticação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-neon rounded-xl flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            PLR App Builder
          </h1>
          <p className="text-app-muted">
            Crie e publique seus apps PLR facilmente
          </p>
        </div>

        <Card className="bg-app-surface border-app-border p-6">
          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-app-surface-hover">
              <TabsTrigger 
                value="login" 
                onClick={() => setIsSignUp(false)}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                onClick={() => setIsSignUp(true)}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Criar Conta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Faça login na sua conta
                </h3>
                <p className="text-sm text-app-muted">
                  Entre para acessar seus apps PLR
                </p>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Crie sua conta
                </h3>
                <p className="text-sm text-app-muted">
                  Comece a criar seus apps PLR agora mesmo
                </p>
              </div>
            </TabsContent>

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground">
                    Nome Completo
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className="bg-app-surface-hover border-app-border focus:border-primary"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="bg-app-surface-hover border-app-border focus:border-primary"
                />
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    Telefone
                  </Label>
                  <PhoneInputCustom
                    value={phone}
                    onChange={setPhone}
                    placeholder="Digite seu telefone"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-app-surface-hover border-app-border focus:border-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-neon hover:opacity-90 text-white font-semibold h-11"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isSignUp ? "Criando conta..." : "Entrando..."}
                  </>
                ) : (
                  <>
                    {isSignUp ? "Criar Conta" : "Entrar"}
                  </>
                )}
              </Button>
            </form>
          </Tabs>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-app-muted">
            Ao criar uma conta, você concorda com nossos{" "}
            <span className="text-primary">Termos de Uso</span> e{" "}
            <span className="text-primary">Política de Privacidade</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;