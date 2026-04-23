export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  tier: number;
  monthlyPrice: number;
  yearlyPrice: number;
  isActive: boolean;
  features: string[];
}

export interface UserPlan {
  planSubscriptionId: string | null;
  tier: number;
  planName: string;
  billingCycle: string;
  currentPeriodEnd: string | null;
  autoRenew: boolean;
  status: string | null;
}

export interface CreatePlanCheckoutRequest {
  planId: string;
  billingCycle: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
}

export interface BillingPortalResponse {
  portalUrl: string;
}
