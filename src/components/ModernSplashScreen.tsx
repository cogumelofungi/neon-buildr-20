import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

interface ModernSplashScreenProps {
  appName: string;
  appIcon?: string;
  appColor: string;
  appTheme?: 'light' | 'dark';
  onComplete: () => void;
}

const ModernSplashScreen = ({ 
  appName, 
  appIcon, 
  appColor, 
  appTheme = 'dark',
  onComplete 
}: ModernSplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  
  const isDarkTheme = appTheme === 'dark';
  const splashBgColor = isDarkTheme ? '#0a0a0a' : '#ffffff';
  const splashTextColor = isDarkTheme ? '#ffffff' : '#000000';

  useEffect(() => {
    // Splash screen aparece por 1.5 segundos (mais rápido para melhor UX)
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Aguarda animação de fade out
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-opacity duration-400"
      style={{ 
        background: isDarkTheme 
          ? `radial-gradient(circle at center, #1a1a1a 0%, ${splashBgColor} 100%)`
          : `radial-gradient(circle at center, #f5f5f5 0%, ${splashBgColor} 100%)`,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      {/* Padrão de pontos decorativo */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, ${splashTextColor} 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Efeitos de background decorativos */}
      <div 
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-25 animate-pulse"
        style={{ 
          background: appColor,
          top: '-15%',
          right: '-25%',
          animationDuration: '4s'
        }}
      />
      <div 
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ 
          background: appColor,
          bottom: '-15%',
          left: '-25%',
          animationDuration: '5s'
        }}
      />

      {/* Círculos decorativos ao redor do ícone */}
      <div 
        className="absolute w-64 h-64 rounded-full opacity-10"
        style={{ 
          border: `2px solid ${appColor}`,
          animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
      />
      <div 
        className="absolute w-80 h-80 rounded-full opacity-5"
        style={{ 
          border: `1px solid ${appColor}`,
          animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
      />

      {/* Container do ícone com contorno */}
      <div className="relative z-10 animate-scale-in">
        {/* Contorno externo brilhante */}
        <div 
          className="absolute -inset-3 rounded-[3rem] opacity-40 blur-md"
          style={{ 
            background: `linear-gradient(135deg, ${appColor}, ${appColor}99)`,
          }}
        />
        
        {/* Contorno sólido na cor do app */}
        <div 
          className="absolute -inset-1 rounded-[2.8rem]"
          style={{ 
            background: `linear-gradient(135deg, ${appColor}, ${appColor}dd)`,
            padding: '3px'
          }}
        >
          <div 
            className="w-full h-full rounded-[2.6rem]"
            style={{ backgroundColor: splashBgColor }}
          />
        </div>

        {/* Ícone do App */}
        <div className="relative">
          {appIcon ? (
            <img 
              src={appIcon}
              alt={appName}
              className="w-32 h-32 rounded-[2.5rem] object-cover relative z-10"
              style={{
                boxShadow: `0 25px 50px -12px ${appColor}60`
              }}
            />
          ) : (
            <div 
              className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center relative z-10"
              style={{ 
                backgroundColor: appColor,
                boxShadow: `0 25px 50px -12px ${appColor}60`
              }}
            >
              <Smartphone className="w-16 h-16 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Brilhos decorativos */}
      <div 
        className="absolute w-32 h-32 rounded-full blur-2xl opacity-20"
        style={{ 
          background: appColor,
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  );
};

export default ModernSplashScreen;
