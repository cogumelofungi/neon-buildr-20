import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface CheckoutPreloaderProps {
  isVisible: boolean;
}

export const CheckoutPreloader = ({ isVisible }: CheckoutPreloaderProps) => {
  const { language } = useLanguage();

  const getText = () => {
    switch (language) {
      case 'en':
        return {
          title: 'Preparing your checkout...',
          subtitle: 'Please wait while we redirect you to secure payment.',
        };
      case 'es':
        return {
          title: 'Preparando tu checkout...',
          subtitle: 'Por favor espera mientras te redirigimos al pago seguro.',
        };
      default:
        return {
          title: 'Preparando seu checkout...',
          subtitle: 'Por favor aguarde enquanto redirecionamos você para o pagamento seguro.',
        };
    }
  };

  if (!isVisible) return null;

  const text = getText();

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-8 text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="relative w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {text.title}
          </h2>
          <p className="text-muted-foreground max-w-sm">
            {text.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
