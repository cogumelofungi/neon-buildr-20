// Mapeamento dos links de checkout do Stripe por plano e período
export const STRIPE_CHECKOUT_LINKS = {
  essencial: {
    monthly: "https://buy.stripe.com/00w00icII21hcDBd8t0Ba1s",
    annual: "https://buy.stripe.com/cNi4gycII21h7jhd8t0Ba1v",
  },
  profissional: {
    monthly: "https://buy.stripe.com/8x24gy8ss35leLJ2tP0Ba1t",
    annual: "https://buy.stripe.com/bJe4gy5ggdJZ8nlc4p0Ba1w",
  },
  empresarial: {
    monthly: "https://buy.stripe.com/5kQcN42449tJcDB7O90Ba1u",
    annual: "https://buy.stripe.com/9B6bJ0eQQeO3eLJ6K50Ba1x",
  },
  consultorio: {
    monthly: "https://buy.stripe.com/aFa9AScIIeO38nl3xT0Ba1y",
    annual: "https://buy.stripe.com/3cI5kC100gWbgTRgkF0Ba1z",
  },
} as const;

export type PlanId = keyof typeof STRIPE_CHECKOUT_LINKS;
export type BillingCycle = "monthly" | "annual";

export const getCheckoutLink = (planId: PlanId, billingCycle: BillingCycle): string => {
  return STRIPE_CHECKOUT_LINKS[planId]?.[billingCycle] || "";
};
