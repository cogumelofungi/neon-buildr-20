import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

const ConfigurarSenha = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { language } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const getTexts = () => {
    switch (language) {
      case 'en':
        return {
          title: 'Your subscription has been confirmed.',
          subtitle: 'Now just create a password to access the platform.',
          emailLabel: 'Your e-mail',
          passwordLabel: 'Password',
          passwordPlaceholder: 'Enter your password',
          confirmLabel: 'Confirm Password',
          confirmPlaceholder: 'Confirm your password',
          buttonText: 'Access the platform',
          loading: 'Configuring...',
          passwordMismatch: 'Passwords do not match',
          passwordTooShort: 'Password must be at least 6 characters',
          success: 'Account configured!',
          successDesc: 'Redirecting to the platform...',
          errorTitle: 'Error',
          linkUsed: 'This link has already been used. Log in with your credentials.',
          linkExpired: 'This link has expired. Please contact support.',
          invalidToken: 'Invalid or not found token',
          accessCreated: 'Access already created successfully',
          accessCreatedDesc: 'This link was used to create your password and access MigraBook.',
          continueBtn: 'Continue to login',
          goToLogin: 'Go to login',
          invalidLink: 'Invalid Link',
          validating: 'Validating link...',
        };
      case 'es':
        return {
          title: 'Su suscripción ha sido confirmada.',
          subtitle: 'Ahora solo crea una contraseña para acceder a la plataforma.',
          emailLabel: 'Tu e-mail',
          passwordLabel: 'Contraseña',
          passwordPlaceholder: 'Escribe tu contraseña',
          confirmLabel: 'Confirmar Contraseña',
          confirmPlaceholder: 'Confirma tu contraseña',
          buttonText: 'Acceder a la plataforma',
          loading: 'Configurando...',
          passwordMismatch: 'Las contraseñas no coinciden',
          passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
          success: '¡Cuenta configurada!',
          successDesc: 'Redirigiendo a la plataforma...',
          errorTitle: 'Error',
          linkUsed: 'Este enlace ya ha sido utilizado. Inicia sesión con tus credenciales.',
          linkExpired: 'Este enlace ha expirado. Contacta con soporte.',
          invalidToken: 'Token inválido o no encontrado',
          accessCreated: 'Acceso ya creado con éxito',
          accessCreatedDesc: 'Este enlace fue utilizado para crear tu contraseña y acceder a MigraBook.',
          continueBtn: 'Continuar al login',
          goToLogin: 'Ir al login',
          invalidLink: 'Enlace Inválido',
          validating: 'Validando enlace...',
        };
      default:
        return {
          title: 'Sua assinatura foi confirmada.',
          subtitle: 'Agora é só criar uma senha para acessar a plataforma.',
          emailLabel: 'Seu e-mail',
          passwordLabel: 'Senha',
          passwordPlaceholder: 'Digite sua senha',
          confirmLabel: 'Confirmar Senha',
          confirmPlaceholder: 'Confirme sua senha',
          buttonText: 'Acessar a plataforma',
          loading: 'Configurando...',
          passwordMismatch: 'As senhas não coincidem',
          passwordTooShort: 'A senha deve ter pelo menos 6 caracteres',
          success: 'Conta configurada!',
          successDesc: 'Redirecionando para a plataforma...',
          errorTitle: 'Erro',
          linkUsed: 'Este link já foi utilizado. Faça login com suas credenciais.',
          linkExpired: 'Este link expirou. Entre em contato com o suporte.',
          invalidToken: 'Token inválido ou não encontrado',
          accessCreated: 'Acesso já criado com sucesso',
          accessCreatedDesc: 'Este link foi usado para criar sua senha e acessar o MigraBook.',
          continueBtn: 'Continuar para o login',
          goToLogin: 'Ir para o login',
          invalidLink: 'Link Inválido',
          validating: 'Validando link...',
        };
    }
  };

  const texts = getTexts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: texts.errorTitle,
        description: texts.passwordMismatch,
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: texts.errorTitle,
        description: texts.passwordTooShort,
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
        title: texts.success,
        description: texts.successDesc,
      });

      // Fazer login automático
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Se o login falhar, redirecionar para a página de login
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        // Se o login for bem-sucedido, redirecionar para /app
        setTimeout(() => {
          navigate("/app");
        }, 1500);
      }
    } catch (err: any) {
      toast({
        title: texts.errorTitle,
        description: err.message || "Erro ao configurar senha",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mb-4" />
          <p className="text-gray-400">{texts.validating}</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    const isAlreadyUsed = tokenError.includes("já foi utilizado") || tokenError.includes("already been used") || tokenError.includes("ya ha sido utilizado");
    
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          {isAlreadyUsed ? (
            <>
              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-green-500 mb-2">{texts.accessCreated}</h2>
              <p className="text-gray-400 mb-6">
                {texts.accessCreatedDesc}
              </p>
              <Button 
                onClick={() => navigate("/login")} 
                className="bg-[#2054DE] hover:bg-[#1a45b8] text-white"
              >
                {texts.continueBtn}
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-red-500 mb-2">{texts.invalidLink}</h2>
              <p className="text-gray-400 mb-6">{tokenError}</p>
              <Button 
                onClick={() => navigate("/login")} 
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                {texts.goToLogin}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">{texts.success}</h2>
          <p className="text-gray-400">{texts.successDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-white text-2xl font-bold">↑MB</span>
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-white text-xl font-semibold mb-2">{texts.title}</h1>
          <p className="text-gray-400">{texts.subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field (disabled) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white font-semibold">
              {texts.emailLabel}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-[#1a1a1a] border-gray-700 text-gray-400 h-12 rounded-lg"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#f5d742] font-semibold">
              {texts.passwordLabel}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={texts.passwordPlaceholder}
                required
                minLength={6}
                className="bg-[#1a1a1a] border-gray-700 text-white h-12 rounded-lg pr-10 placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[#f5d742] font-semibold">
              {texts.confirmLabel}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={texts.confirmPlaceholder}
                required
                minLength={6}
                className="bg-[#1a1a1a] border-gray-700 text-white h-12 rounded-lg pr-10 placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-[#2054DE] hover:bg-[#1a45b8] text-white font-semibold h-12 rounded-lg mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {texts.loading}
              </>
            ) : (
              texts.buttonText
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ConfigurarSenha;