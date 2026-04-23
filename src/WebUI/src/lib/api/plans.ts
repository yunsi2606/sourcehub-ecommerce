import { apiFetch } from './client';
import { Plan, UserPlan, CreatePlanCheckoutRequest, CheckoutResponse, BillingPortalResponse } from '../types/plans';

export const plansApi = {
  getActivePlans: () => {
    return apiFetch<Plan[]>('/plans');
  },
  
  getMyCurrentPlan: (token: string) => {
    return apiFetch<UserPlan>('/plans/my', { token });
  },
  
  createCheckout: (data: CreatePlanCheckoutRequest, token: string) => {
    return apiFetch<CheckoutResponse>('/plans/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
      token
    });
  },
  
  getBillingPortal: (token: string) => {
    return apiFetch<BillingPortalResponse>('/plans/billing-portal', { token });
  }
};
