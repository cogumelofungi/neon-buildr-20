import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, CheckCircle2 } from "lucide-react";

interface AppLoginGateProps {
  appId: string;
  appSlug: string;
  appName: string;
  appIcon?: string;
  appColor: string;
  appTheme: 'light' | 'dark';
  onSuccess: () => void;
}

const LOCAL_STORAGE_KEY = "app_login_sessions";

// Gerencia sessões de login por app no localStorage
const getLoginSessions = (): Record<string, string> => {
  try {
    const sessions = localStorage.getItem(LOCAL_STORAGE_KEY);
    return sessions ? JSON.parse(sessions) : {};
  } catch {
    return {};
  }
};

const setLoginSession = (appId: string, email: string) => {
  const sessions = getLoginSessions();
  sessions[appId] = email;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
};

export const getLoginSession = (appId: string): string | null => {
  const sessions = getLoginSessions();
  return sessions[appId] || null;
};

export const clearLoginSession = (appId: string) => {
  const sessions = getLoginSessions();
  delete sessions[appId];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
};

export const AppLoginGate = ({
  appId,
  appSlug,
  appName,
  appIcon,
  appColor,
  appTheme,
  onSuccess,
}: AppLoginGateProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState("");

  const isDark = appTheme === 'dark';
  const bgColor = isDark ? '#0a0a0a' : '#f5f5f5';
  const textColor = isDark ? '#ffffff' : '#0a0a0a';
  const mutedColor = isDark ? '#a1a1aa' : '#71717a';
  const cardBg = isDark ? '#18181b' : '#ffffff';
  const inputBg = isDark ? '#27272a' : '#f4f4f5';
  const inputBorder = isDark ? '#3f3f46' : '#e4e4e7';

  // Verificar se já tem sessão salva
  useEffect(() => {
    const checkExistingSession = async () => {
      const savedEmail = getLoginSession(appId);
      
      if (savedEmail) {
        // Verificar se o email ainda está na lista de compras usando função segura
        const { data, error } = await supabase
          .rpc("verify_purchase_email", {
            p_app_id: appId,
            p_email: savedEmail.toLowerCase().trim()
          });

        if (!error && data && data.length > 0) {
          console.log("[AppLoginGate] Sessão existente válida:", savedEmail);
          onSuccess();
          return;
        } else {
          // Sessão expirou ou email não está mais válido
          clearLoginSession(appId);
        }
      }
      
      setIsValidating(false);
    };

    checkExistingSession();
  }, [appId, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim()) {
      setError("Digite seu e-mail");
      return;
    }

    setIsLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      console.log("[AppLoginGate] Verificando email:", normalizedEmail, "para app:", appId);

      // Buscar compra com este email para este app usando função segura
      const { data, error: queryError } = await supabase
        .rpc("verify_purchase_email", {
          p_app_id: appId,
          p_email: normalizedEmail
        });

      if (queryError) {
        console.error("[AppLoginGate] Erro na consulta:", queryError);
        throw queryError;
      }

      if (!data || data.length === 0) {
        console.log("[AppLoginGate] Email não encontrado nas compras");
        setError("E-mail não encontrado. Verifique se usou o mesmo e-mail da compra.");
        return;
      }

      console.log("[AppLoginGate] Compra encontrada:", data[0]);

      // Salvar sessão permanente
      setLoginSession(appId, normalizedEmail);

      toast({
        title: "✅ Acesso liberado!",
        description: `Bem-vindo(a), ${data[0].buyer_name}!`,
      });

      onSuccess();
    } catch (err: any) {
      console.error("[AppLoginGate] Erro:", err);
      setError("Erro ao verificar acesso. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Mostra loading enquanto valida sessão existente
  if (isValidating) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: appColor }} />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div 
        className="w-full max-w-sm rounded-2xl p-6 shadow-xl"
        style={{ backgroundColor: cardBg }}
      >
        {/* Header com ícone do app */}
        <div className="text-center mb-6">
          {appIcon ? (
            <img 
              src={appIcon} 
              alt={appName}
              className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover shadow-lg"
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
              style={{ backgroundColor: appColor }}
            >
              <Lock className="w-8 h-8 text-white" />
            </div>
          )}
          
          <h1 
            className="text-xl font-bold mb-1"
            style={{ color: textColor }}
          >
            {appName}
          </h1>
          
          <p 
            className="text-sm"
            style={{ color: mutedColor }}
          >
            Insira o e-mail usado na compra para acessar
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label 
              htmlFor="email" 
              className="text-sm font-medium"
              style={{ color: textColor }}
            >
              E-mail da compra
            </Label>
            <div className="relative">
              <Mail 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: mutedColor }}
              />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="pl-10 h-12"
                style={{ 
                  backgroundColor: inputBg,
                  borderColor: error ? '#ef4444' : inputBorder,
                  color: textColor
                }}
              />
            </div>
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base font-semibold"
            style={{ 
              backgroundColor: appColor,
              color: '#ffffff'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Acessar
              </>
            )}
          </Button>
        </form>

        {/* Rodapé */}
        <p 
          className="text-xs text-center mt-6"
          style={{ color: mutedColor }}
        >
          Não consegue acessar? Entre em contato com o suporte.
        </p>
      </div>
    </div>
  );
};

export default AppLoginGate;
