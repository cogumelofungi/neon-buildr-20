import { Check } from "lucide-react";
import { useAppBuilder } from "@/hooks/useAppBuilder";
import { useLanguage } from "@/hooks/useLanguage";

interface ProgressStep {
  id: number;
  title: string;
  completed: boolean;
  active: boolean;
}

interface ProgressBarProps {
  appBuilder: ReturnType<typeof useAppBuilder>;
}

const ProgressBar = ({ appBuilder }: ProgressBarProps) => {
  const { t } = useLanguage();
  const { appData } = appBuilder;

  // Calcular progresso baseado no estado do app
  const hasUploads = !!(appData.mainProduct?.url || appData.bonus1?.url || appData.bonus2?.url || appData.bonus3?.url || appData.bonus4?.url);
  
  // Verificar se houve personalização (alterações nos campos padrão)
  const hasCustomization = !!(
    (appData.appName && appData.appName !== 'Meu App PLR') ||
    (appData.appDescription && appData.appDescription !== 'PLR Products') ||
    (appData.appColor && appData.appColor !== '#4783F6') ||
    appData.customLink ||
    appData.appIcon?.url ||
    appData.appCover?.url
  );
  
  const steps: ProgressStep[] = [
    { 
      id: 1, 
      title: t("progress.upload"), 
      completed: hasUploads, 
      active: !hasUploads 
    },
    { 
      id: 2, 
      title: t("progress.customization"), 
      completed: hasUploads && hasCustomization, 
      active: hasUploads && !hasCustomization 
    },
    { 
      id: 3, 
      title: t("progress.publish"), 
      completed: false, 
      active: hasUploads && hasCustomization 
    },
  ];

  return (
    <div className="bg-app-bg border-b border-app-border py-4">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className={`progress-step ${step.completed ? 'completed' : step.active ? 'active' : ''}`}>
                <div className="step-circle">
                  {step.completed ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  step.active ? 'text-primary' : 
                  step.completed ? 'text-foreground' : 'text-app-muted'
                }`}>
                  {step.title}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`w-20 h-px mx-4 transition-all duration-500 ${
                  steps[index + 1].completed || steps[index + 1].active 
                    ? 'bg-gradient-neon' 
                    : 'bg-app-border'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;