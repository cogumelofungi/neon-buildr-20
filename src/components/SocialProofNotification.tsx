import { useEffect, useState, useMemo } from 'react';
import { useSocialProof } from '@/hooks/useSocialProof';
import { User, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const SocialProofNotification = () => {
  const { settings, currentNotification, isVisible, shouldShowOnRoute } = useSocialProof();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Generate a stable time ago when notification changes
  const timeAgo = useMemo(() => {
    if (!currentNotification) return '';
    const times = ['agora mesmo', 'há 2 minutos', 'há 5 minutos', 'há 10 minutos', 'há 15 minutos'];
    return times[Math.floor(Math.random() * times.length)];
  }, [currentNotification?.id]);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setIsDismissed(false);
    } else {
      const timeout = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  if (!settings?.is_enabled || !shouldShowOnRoute() || !currentNotification || isDismissed) {
    return null;
  }

  const positionClasses = settings.position === 'bottom-left' 
    ? 'left-4 sm:left-6' 
    : 'right-4 sm:right-6';

  return (
    <div
      className={cn(
        'fixed bottom-4 sm:bottom-6 z-50 transition-all duration-300 ease-in-out',
        positionClasses,
        isVisible && isAnimating
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0 pointer-events-none'
      )}
    >
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl p-4 max-w-[320px] sm:max-w-sm relative">
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {currentNotification.avatar_url ? (
              <img
                src={currentNotification.avatar_url}
                alt={currentNotification.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/20">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground leading-snug">
              <span className="font-semibold">{currentNotification.name}</span>{' '}
              <span className="text-muted-foreground">{currentNotification.action}</span>
            </p>
            
            {settings.show_time_ago && (
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                <span>{timeAgo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Verified badge */}
        {settings.show_verified_badge && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/50">
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs text-muted-foreground">Verificado por MigraBook</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialProofNotification;
