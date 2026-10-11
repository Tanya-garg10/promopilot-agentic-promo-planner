"""
Pydantic Models and Data Schemas for PromoPilot AI
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=2, max_length=60)
    selling_price: float = Field(..., gt=0)
    unit_cost: float = Field(..., gt=0)
    current_stock: int = Field(..., ge=0)
    target_stock: int = Field(..., ge=0)
    min_margin: float = Field(..., ge=0, le=100)
    competitor_price: float = Field(..., gt=0)
    region: str = Field(default="Pan-India")
    base_daily_demand: int = Field(default=15, ge=1)
    substitute_product_id: Optional[str] = None
    complementary_product_id: Optional[str] = None
    description: Optional[str] = ""

class ProductCreate(ProductBase):
    id: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    selling_price: Optional[float] = None
    unit_cost: Optional[float] = None
    current_stock: Optional[int] = None
    target_stock: Optional[int] = None
    min_margin: Optional[float] = None
    competitor_price: Optional[float] = None
    region: Optional[str] = None
    base_daily_demand: Optional[int] = None
    substitute_product_id: Optional[str] = None
    complementary_product_id: Optional[str] = None
    description: Optional[str] = None

class Product(ProductBase):
    id: str
    overstock_risk: str = "Normal"  # High, Moderate, Normal
    price_gap_pct: float = 0.0      # vs competitor
    current_margin_pct: float = 0.0

class PlanConfiguration(BaseModel):
    product_id: str
    target_clearance_units: Optional[int] = None
    min_margin_override: Optional[float] = None
    marketing_budget: float = Field(default=25000.0, ge=1000)
    duration_days: int = Field(default=14, ge=1, le=90)
    customer_segment: str = Field(default="Price Sensitive") # Price Sensitive, Deal Seekers, Brand Loyalists, Holiday Shoppers, New Customers
    region: str = Field(default="Pan-India")
    objective: str = Field(default="profit") # profit, revenue, clearance
    custom_discounts: Optional[List[float]] = None

class StrategyCandidate(BaseModel):
    strategy_id: str
    discount_pct: float
    mechanism: str # Direct Percentage Off, Flash Sale, Clearance Markdown, Bundle Offer
    discounted_price: float
    estimated_units_sold: int
    estimated_revenue: float
    estimated_gross_profit: float
    estimated_gross_margin_pct: float
    campaign_spending: float
    net_contribution: float
    remaining_inventory: int
    clearance_pct: float
    cannibalization_loss: float
    is_feasible: bool
    rejection_reasons: List[str] = []
    objective_score: float = 0.0
    rank: int = 0

class AgentTrace(BaseModel):
    agent_id: str
    agent_name: str
    timestamp: str
    status: str # SUCCESS, WARNING, REJECTED, INFO
    latency_ms: int
    inputs: Dict[str, Any]
    decisions: Dict[str, Any]
    summary: str

class PromotionPlan(BaseModel):
    plan_id: str
    product_id: str
    product_name: str
    category: str
    created_at: str
    status: str = "DRAFT" # DRAFT, APPROVED, REJECTED
    objective: str
    customer_segment: str
    region: str
    duration_days: int
    marketing_budget: float
    recommended_strategy: StrategyCandidate
    candidate_strategies: List[StrategyCandidate]
    agent_traces: List[AgentTrace]
    reasoning: str
    risks_and_assumptions: List[str]
    constraint_report: Dict[str, Any]
    actual_units_sold: Optional[int] = None
    actual_revenue: Optional[float] = None
    actual_gross_profit: Optional[float] = None

class SimulationRunRequest(BaseModel):
    product_id: str
    discount_pct: float = Field(..., ge=0, le=90)
    duration_days: int = Field(default=14, ge=1, le=90)
    marketing_budget: float = Field(default=25000.0, ge=1000)
    customer_segment: str = Field(default="Price Sensitive")
    elasticity_override: Optional[float] = None
    demand_multiplier_override: Optional[float] = None

class SimulationRunResponse(BaseModel):
    product_id: str
    product_name: str
    strategy: StrategyCandidate
    model_assumptions: Dict[str, Any]
    formula_breakdown: Dict[str, Any]

class ActualsInput(BaseModel):
    actual_units_sold: int = Field(..., ge=0)
    actual_revenue: float = Field(..., ge=0)
    actual_gross_profit: float = Field(..., ge=0)
    notes: Optional[str] = None

class SettingsModel(BaseModel):
    default_min_margin_pct: float = 18.0
    default_marketing_budget: float = 25000.0
    base_price_elasticity: float = -1.4
    cannibalization_rate: float = 0.20
    holding_cost_annual_rate: float = 0.15
    llm_enabled: bool = True
    llm_provider: str = "Featherless AI"
    llm_status: str = "Ready (Deterministic Fallback Available)"

class AnalyticsSummary(BaseModel):
    total_products: int
    total_inventory_units: int
    overstock_risk_count: int
    active_plans_count: int
    total_budget_allocated: float
    projected_revenue: float
    projected_profit: float
    avg_gross_margin_pct: float
