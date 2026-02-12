import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface WhatsAppConfig {
  enabled: boolean;
  phone: string;
  message: string;
  position: "bottom-right" | "bottom-left";
  buttonColor: string;
  buttonText: string;
  showText: boolean;
  iconSize?: "small" | "medium" | "large";
}

interface WhatsAppButtonProps {
  config: WhatsAppConfig;
  isPreview?: boolean;
}

export default function WhatsAppButton({ config: propConfig, isPreview = false }: WhatsAppButtonProps) {
  const [config, setConfig] = useState<WhatsAppConfig | null>(propConfig || null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
  setConfig(propConfig);
  if (propConfig.enabled) {
    setTimeout(() => setIsVisible(true), 1000);
  }
  }, [propConfig]);

  if (!config || !config.enabled || !isVisible) {
    return null;
  }

  const handleClick = () => {
    const phoneNumber = config.phone.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(config.message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const positionClasses = config.position === "bottom-left" 
    ? "bottom-4 left-4" 
    : "bottom-4 right-4";
  
  const positionType = isPreview ? "absolute" : "fixed";

    // Definir tamanhos baseado na prop
    const sizeConfig = {
      small: {
        button: config.showText && isHovered ? 'h-12 px-5 min-w-max' : 'w-12 h-12 p-0',
        icon: 'h-5 w-5'
      },
      medium: {
        button: config.showText && isHovered ? 'h-14 px-6 min-w-max' : 'w-14 h-14 p-0',
        icon: 'h-6 w-6'
      },
      large: {
        button: config.showText && isHovered ? 'h-16 px-7 min-w-max' : 'w-16 h-16 p-0',
        icon: 'h-7 w-7'
      }
    };
    
    const currentSize = sizeConfig[config.iconSize || 'medium'];

  return (
    <div
      className={`${positionType} ${positionClasses} ${isPreview ? 'z-20' : 'z-50'} transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Button
        onClick={handleClick}
        className={`shadow-2xl hover:scale-105 transition-all duration-300 rounded-full ${
          currentSize.button
        }`}
        style={{
          backgroundColor: config.buttonColor,
          color: '#ffffff',
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <MessageCircle className={`${currentSize.icon} flex-shrink-0`} />
          {config.showText && isHovered && (
            <span className="whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
              {config.buttonText}
            </span>
          )}
        </div>
      </Button>
    </div>
  );
}
