import { apiFetch } from './client';
import { Plan, UserPlan, CreatePlanCheckoutRequest, CheckoutResponse, BillingPortalResponse, UpsertPlanRequest } from '../types/plans';

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

export const adminPlansApi = {
  getAll: (token: string) => {
    return apiFetch<Plan[]>('/plans/all', { token });
  },

  getById: (token: string, id: string) => {
    return apiFetch<Plan>(`/plans/${id}`, { token });
  },

  create: (token: string, data: UpsertPlanRequest) => {
    return apiFetch<Plan>('/plans', {
      method: 'POST',
      body: JSON.stringify(data),
      token
    });
  },

  update: (token: string, id: string, data: UpsertPlanRequest) => {
    return apiFetch<Plan>(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token
    });
  }
};
