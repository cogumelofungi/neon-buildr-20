import { useEffect, useState } from 'react';
import { Settings, Server } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const Maintenance = () => {
  const [platformName, setPlatformName] = useState('MigraBook');
  const { t } = useLanguage();

  useEffect(() => {
    // Você pode buscar configurações adicionais aqui se necessário
    document.title = `${t("maintenance.title")} - ${platformName}`;
  }, [platformName, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-app-surface to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Ícone animado */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-gradient-neon opacity-20 animate-pulse"></div>
          <div className="absolute inset-4 rounded-full bg-app-surface border-2 border-app-border flex items-center justify-center">
            <Settings className="w-16 h-16 text-primary animate-spin-slow" />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-neon bg-clip-text text-transparent">
            {t("maintenance.title")}
          </h1>
          <p className="text-lg text-app-muted">
            {t("maintenance.message")}
          </p>
        </div>

        {/* Informações adicionais */}
        <div className="bg-app-surface border border-app-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-app-muted">
            <Server className="w-5 h-5" />
            <p className="text-sm">{t("maintenance.back.soon")}</p>
          </div>
          <p className="text-sm text-app-muted">
            {t("maintenance.thanks")}
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-app-muted">
          © 2025 {platformName}. {t("footer.rights")}
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
