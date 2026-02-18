import { useUserPlan } from './useUserPlan';

interface FeatureAccess {
  hasCustomDomain: boolean;
  hasAppImport: boolean;
  hasPremiumTemplates: boolean;
  hasWhatsAppSupport: boolean;
  hasAppNotifications: boolean;
  hasIntegrations: boolean;
  hasVideoCourse: boolean;
  hasAppointments: boolean; // EXCLUSIVO para plano Consultório
  isLoading: boolean;
  planName: string | null;
}

export const useFeatureAccess = (): FeatureAccess => {
  const { planName, isLoading } = useUserPlan();

  // Definir as permissões por plano (Consultório tem os mesmos benefícios do Empresarial)
  const isConsultorioPlan = planName === 'Consultório';
  const isEnterprisePlan = planName === 'Empresarial' || isConsultorioPlan;
  const isProfessionalOrHigher = planName === 'Profissional' || isEnterprisePlan;
  
  const features = {
    hasCustomDomain: isProfessionalOrHigher,
    hasAppImport: isProfessionalOrHigher,
    hasPremiumTemplates: isEnterprisePlan,
    hasWhatsAppSupport: isProfessionalOrHigher,
    hasAppNotifications: isProfessionalOrHigher,
    hasIntegrations: isProfessionalOrHigher,
    hasVideoCourse: isEnterprisePlan,
    hasAppointments: isConsultorioPlan, // EXCLUSIVO para Consultório
  };

  return {
    ...features,
    isLoading,
    planName
  };
};

// Helper para obter o plano mínimo necessário para um recurso
export const getRequiredPlan = (feature: keyof Omit<FeatureAccess, 'isLoading' | 'planName'>): string => {
  const planRequirements: Record<keyof Omit<FeatureAccess, 'isLoading' | 'planName'>, string> = {
    hasCustomDomain: 'premium.plan.profissional',
    hasAppImport: 'premium.plan.profissional', 
    hasPremiumTemplates: 'premium.plan.empresarial',
    hasWhatsAppSupport: 'premium.plan.profissional',
    hasAppNotifications: 'premium.plan.profissional',
    hasIntegrations: 'premium.plan.profissional',
    hasVideoCourse: 'premium.plan.empresarial',
    hasAppointments: 'premium.plan.consultorio',
  };

  return planRequirements[feature];
};
