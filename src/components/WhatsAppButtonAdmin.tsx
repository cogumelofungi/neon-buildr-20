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
}

export default function WhatsAppButtonAdmin() {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'whatsapp_config')
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        const parsedConfig = JSON.parse(data.value);
        setConfig(parsedConfig);
        
        if (parsedConfig.enabled) {
          setTimeout(() => setIsVisible(true), 1000);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do WhatsApp do Admin:', error);
    }
  };

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
    ? "bottom-6 left-6" 
    : "bottom-6 right-6";

  return (
    <div
      className={`fixed ${positionClasses} z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Button
        onClick={handleClick}
        size="lg"
        className={`shadow-2xl hover:scale-105 transition-all duration-300 ${
          config.showText && isHovered 
            ? 'rounded-full px-6 h-14 gap-2'
            : 'rounded-full w-14 h-14 p-0'
        }`}
        style={{
          backgroundColor: config.buttonColor,
          color: '#ffffff',
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <MessageCircle className="h-6 w-6 flex-shrink-0" />
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
