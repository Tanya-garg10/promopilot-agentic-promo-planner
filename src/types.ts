/**
 * TypeScript Interfaces and Data Types for PromoPilot AI
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  selling_price: number;
  unit_cost: number;
  current_stock: number;
  target_stock: number;
  min_margin: number;
  competitor_price: number;
  region: string;
  base_daily_demand: number;
  substitute_product_id?: string | null;
  complementary_product_id?: string | null;
  description?: string;
  overstock_risk: 'High' | 'Moderate' | 'Normal';
  price_gap_pct: number;
  current_margin_pct: number;
}

export interface StrategyCandidate {
  strategy_id: string;
  discount_pct: number;
  mechanism: string;
  discounted_price: number;
  estimated_units_sold: number;
  estimated_revenue: number;
  estimated_gross_profit: number;
  estimated_gross_margin_pct: number;
  campaign_spending: number;
  net_contribution: number;
  remaining_inventory: number;
  clearance_pct: number;
  cannibalization_loss: number;
  is_feasible: boolean;
  rejection_reasons: string[];
  objective_score?: number;
  rank?: number;
  demand_meta?: Record<string, any>;
  cannibalization_meta?: Record<string, any>;
}

export interface AgentTrace {
  agent_id: string;
  agent_name: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'REJECTED' | 'INFO';
  latency_ms: number;
  inputs: Record<string, any>;
  decisions: Record<string, any>;
  summary: string;
}

export interface ConstraintReport {
  minimum_margin_required_pct: number;
  achieved_gross_margin_pct: number;
  margin_status: 'PASS' | 'FAIL';
  allocated_budget: number;
  projected_campaign_spend: number;
  budget_status: 'PASS' | 'FAIL';
  current_inventory: number;
  projected_units_sold: number;
  inventory_status: 'PASS' | 'FAIL';
}

export interface PromotionPlan {
  plan_id: string;
  product_id: string;
  product_name: string;
  category: string;
  created_at: string;
  status: 'DRAFT' | 'APPROVED' | 'REJECTED';
  objective: 'profit' | 'revenue' | 'clearance';
  customer_segment: string;
  region: string;
  duration_days: number;
  marketing_budget: number;
  recommended_strategy: StrategyCandidate;
  candidate_strategies: StrategyCandidate[];
  agent_traces: AgentTrace[];
  reasoning: string;
  risks_and_assumptions: string[];
  constraint_report: ConstraintReport;
  actual_units_sold?: number | null;
  actual_revenue?: number | null;
  actual_gross_profit?: number | null;
}

export interface SimulationRun {
  id: number;
  timestamp: string;
  product_id: string;
  product_name: string;
  discount_pct: number;
  duration_days: number;
  customer_segment: string;
  estimated_revenue: number;
  estimated_profit: number;
  estimated_margin_pct: number;
  is_feasible: boolean;
  rejection_reasons: string[];
}

export interface AnalyticsSummary {
  total_products: number;
  total_inventory_units: number;
  overstock_risk_count: number;
  active_plans_count: number;
  total_budget_allocated: number;
  projected_revenue: number;
  projected_profit: number;
  avg_gross_margin_pct: number;
}

export interface InventorySummary {
  total_sku_count: number;
  total_inventory_units: number;
  total_inventory_cost_value: number;
  total_inventory_retail_value: number;
  high_overstock_count: number;
  high_overstock_skus: Product[];
  category_breakdown: {
    category: string;
    product_count: number;
    stock_units: number;
    inventory_cost_value: number;
  }[];
}

export interface PlanConfigPayload {
  product_id: string;
  target_clearance_units?: number;
  min_margin_override?: number;
  marketing_budget: number;
  duration_days: number;
  customer_segment: string;
  region: string;
  objective: 'profit' | 'revenue' | 'clearance';
  custom_discounts?: number[];
}
