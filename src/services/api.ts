/**
 * API Client for PromoPilot AI
 * Communicates with backend REST API endpoints with robust error handling.
 */

import {
  Product,
  PromotionPlan,
  PlanConfigPayload,
  InventorySummary,
  AnalyticsSummary,
  SimulationRun
} from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(res: globalThis.Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) errorMsg = errorData.detail;
      else if (errorData.error) errorMsg = errorData.error;
    } catch (_) {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse<{
      status: string;
      app: string;
      version: string;
      llm_provider: string;
      llm_available: boolean;
      database: string;
    }>(res);
  },

  // Products
  async getProducts(params?: { category?: string; region?: string; search?: string }): Promise<Product[]> {
    const url = new URL(`${window.location.origin}${BASE_URL}/products`);
    if (params?.category) url.searchParams.set('category', params.category);
    if (params?.region) url.searchParams.set('region', params.region);
    if (params?.search) url.searchParams.set('search', params.search);
    const res = await fetch(url.toString());
    return handleResponse<Product[]>(res);
  },

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`${BASE_URL}/products/${encodeURIComponent(id)}`);
    return handleResponse<Product>(res);
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Product>(res);
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${BASE_URL}/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Product>(res);
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(res);
  },

  async importProducts(rows: any[]): Promise<{ imported: number; failed: number; errors: string[] }> {
    const res = await fetch(`${BASE_URL}/products/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows),
    });
    return handleResponse<{ imported: number; failed: number; errors: string[] }>(res);
  },

  // Summaries
  async getInventorySummary(): Promise<InventorySummary> {
    const res = await fetch(`${BASE_URL}/inventory/summary`);
    return handleResponse<InventorySummary>(res);
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const res = await fetch(`${BASE_URL}/analytics/summary`);
    return handleResponse<AnalyticsSummary>(res);
  },

  // Promotion Plans & Agent Generation
  async generatePlan(payload: PlanConfigPayload): Promise<PromotionPlan> {
    const res = await fetch(`${BASE_URL}/plans/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<PromotionPlan>(res);
  },

  async getPlans(): Promise<PromotionPlan[]> {
    const res = await fetch(`${BASE_URL}/plans`);
    return handleResponse<PromotionPlan[]>(res);
  },

  async getPlan(id: string): Promise<PromotionPlan> {
    const res = await fetch(`${BASE_URL}/plans/${encodeURIComponent(id)}`);
    return handleResponse<PromotionPlan>(res);
  },

  async approvePlan(id: string): Promise<PromotionPlan> {
    const res = await fetch(`${BASE_URL}/plans/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
    });
    return handleResponse<PromotionPlan>(res);
  },

  async rejectPlan(id: string): Promise<PromotionPlan> {
    const res = await fetch(`${BASE_URL}/plans/${encodeURIComponent(id)}/reject`, {
      method: 'POST',
    });
    return handleResponse<PromotionPlan>(res);
  },

  async submitActuals(id: string, actuals: { actual_units_sold: number; actual_revenue: number; actual_gross_profit: number }): Promise<PromotionPlan> {
    const res = await fetch(`${BASE_URL}/plans/${encodeURIComponent(id)}/actuals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actuals),
    });
    return handleResponse<PromotionPlan>(res);
  },

  // Simulation Lab
  async runSimulation(payload: {
    product_id: string;
    discount_pct: number;
    duration_days: number;
    marketing_budget: number;
    customer_segment: string;
  }) {
    const res = await fetch(`${BASE_URL}/simulations/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  async getSimulations(): Promise<SimulationRun[]> {
    const res = await fetch(`${BASE_URL}/simulations`);
    return handleResponse<SimulationRun[]>(res);
  },

  // Hackathon Demo Scenario
  async runDemoScenario(): Promise<{
    message: string;
    plan: PromotionPlan;
    storyline: string[];
  }> {
    const res = await fetch(`${BASE_URL}/demo/run`, {
      method: 'POST',
    });
    return handleResponse<any>(res);
  },

  // Settings & Reset
  async resetDemoData(): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/settings/reset-demo`, {
      method: 'POST',
    });
    return handleResponse<{ message: string }>(res);
  },

  async exportReport(): Promise<any> {
    const res = await fetch(`${BASE_URL}/export/report`);
    return handleResponse<any>(res);
  },
};
