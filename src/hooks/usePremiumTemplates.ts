import { useUserPlan } from './useUserPlan';

interface PremiumTemplateAccess {
  hasPremiumAccess: boolean;
  hasProfessionalAccess: boolean;
  hasEnterpriseAccess: boolean;
  isLoading: boolean;
  isTemplateAllowed: (templateId: string) => boolean;
}

// Templates disponíveis para o plano Profissional
const PROFESSIONAL_TEMPLATES = ['classic', 'corporate', 'showcase', 'modern', 'exclusive'];

// Templates disponíveis APENAS para o plano Empresarial
const ENTERPRISE_ONLY_TEMPLATES = ['units', 'members', 'flow', 'shop', 'academy'];

// Templates gratuitos (Essencial)
const FREE_TEMPLATES = ['classic'];

export const usePremiumTemplates = (): PremiumTemplateAccess => {
  const { planName, isLoading } = useUserPlan();

  // Consultório tem os mesmos benefícios do Empresarial
  const hasEnterpriseAccess = planName === 'Empresarial' || planName === 'Consultório';
  const hasProfessionalAccess = planName === 'Profissional' || hasEnterpriseAccess;
  
  // Manter compatibilidade - hasPremiumAccess agora significa acesso a todos os templates
  const hasPremiumAccess = hasEnterpriseAccess;

  const isTemplateAllowed = (templateId: string): boolean => {
    // Templates gratuitos são sempre permitidos
    if (FREE_TEMPLATES.includes(templateId)) {
      return true;
    }

    // Templates do plano Empresarial
    if (ENTERPRISE_ONLY_TEMPLATES.includes(templateId)) {
      return hasEnterpriseAccess;
    }

    // Templates do plano Profissional
    if (PROFESSIONAL_TEMPLATES.includes(templateId)) {
      return hasProfessionalAccess;
    }

    // Fallback: não permitido
    return false;
  };

  return {
    hasPremiumAccess,
    hasProfessionalAccess,
    hasEnterpriseAccess,
    isLoading,
    isTemplateAllowed
  };
};

// Helper para obter o plano mínimo necessário para um template
export const getRequiredPlanForTemplate = (templateId: string): string => {
  if (FREE_TEMPLATES.includes(templateId)) {
    return 'premium.plan.essencial';
  }
  if (ENTERPRISE_ONLY_TEMPLATES.includes(templateId)) {
    return 'premium.plan.empresarial';
  }
  if (PROFESSIONAL_TEMPLATES.includes(templateId)) {
    return 'premium.plan.profissional';
  }
  return 'premium.plan.empresarial';
};

// Exportar as listas para uso em outros lugares
export { PROFESSIONAL_TEMPLATES, ENTERPRISE_ONLY_TEMPLATES, FREE_TEMPLATES };
