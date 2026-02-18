import { useUserPlan } from './useUserPlan';

interface PlanLimits {
  maxProducts: number;
  maxBonusSlots: number;
  initialVisibleSlots: number;
  planName: string;
  isLoading: boolean;
}

export const usePlanLimits = (): PlanLimits => {
  const { planName, isLoading } = useUserPlan();
  
  // While loading, avoid showing default "Essencial" to prevent UI flash
  let maxProducts = isLoading ? 0 : 3; // Default to Essencial after load
  let maxBonusSlots = isLoading ? 0 : 10; // Default max bonus for Essencial
  let initialVisibleSlots = isLoading ? 0 : 3; // Default initial visible for Essencial
  
  if (!isLoading && planName) {
    switch (planName) {
      case 'Essencial':
        maxProducts = 10; // 1 produto principal + 9 bônus
        maxBonusSlots = 9; // Bônus 1 a 9
        initialVisibleSlots = 3;
        break;
      case 'Profissional':
        maxProducts = 15; // 1 produto principal + 14 bônus
        maxBonusSlots = 14; // Bônus 1 a 14
        initialVisibleSlots = 5;
        break;
      case 'Empresarial':
      case 'Consultório': // Consultório tem os mesmos benefícios do Empresarial
        maxProducts = 20; // 1 produto principal + 19 bônus
        maxBonusSlots = 19; // Bônus 1 a 19
        initialVisibleSlots = 5;
        break;
      default:
        maxProducts = 10;
        maxBonusSlots = 9;
        initialVisibleSlots = 3;
        break;
    }
  }

  const displayedPlanName = isLoading ? '' : (planName || 'Essencial');

  return {
    maxProducts,
    maxBonusSlots,
    initialVisibleSlots,
    planName: displayedPlanName,
    isLoading
  };
};