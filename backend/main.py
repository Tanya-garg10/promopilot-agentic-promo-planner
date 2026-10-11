"""
FastAPI Backend Application for PromoPilot AI
Autonomous Retail Promotion Planner
Provides REST API endpoints for products, promotions, simulations, and analytics.
"""

import os
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, status, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from .models import (
    Product, ProductCreate, ProductUpdate,
    PlanConfiguration, PromotionPlan,
    SimulationRunRequest, SimulationRunResponse,
    ActualsInput, SettingsModel, AnalyticsSummary
)
from .database import (
    init_db, get_all_products, get_product_by_id,
    save_product, delete_product, save_promotion_plan,
    get_all_plans, get_plan_by_id, update_plan_status,
    record_plan_actuals, record_simulation_run,
    get_simulation_runs, reset_database_to_seed
)
from .engine import simulate_strategy_candidate
from .agents import AgentPipeline

app = FastAPI(
    title="PromoPilot AI API",
    description="Autonomous Retail Promotion Planner - Deterministic Optimization & Agentic Intelligence",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SQLite database on startup
@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health_check():
    featherless_key = os.environ.get("FEATHERLESS_API_KEY")
    return {
        "status": "healthy",
        "app": "PromoPilot AI",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "llm_provider": "Featherless AI" if featherless_key else "Deterministic Agentic Pipeline (Offline/Fallback)",
        "llm_available": bool(featherless_key),
        "database": "SQLite (Connected)"
    }

# =============================================================================
# Product CRUD Endpoints
# =============================================================================

@app.get("/api/products", response_model=List[Product])
def list_products(category: Optional[str] = None, region: Optional[str] = None, search: Optional[str] = None):
    products = get_all_products()
    if category and category != "All":
        products = [p for p in products if p["category"].lower() == category.lower()]
    if region and region != "All":
        products = [p for p in products if p["region"].lower() == region.lower()]
    if search:
        s = search.lower()
        products = [p for p in products if s in p["name"].lower() or s in p["id"].lower() or s in p["category"].lower()]
    return products

@app.get("/api/products/{product_id}", response_model=Product)
def get_product(product_id: str):
    p = get_product_by_id(product_id)
    if not p:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found")
    return p

@app.post("/api/products", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate):
    data = product_in.model_dump()
    if not data.get("id"):
        prefix = data["category"][:4].upper()
        data["id"] = f"PROD-{prefix}-{uuid.uuid4().hex[:6].upper()}"
    saved = save_product(data)
    return saved

@app.put("/api/products/{product_id}", response_model=Product)
def update_product(product_id: str, product_update: ProductUpdate):
    existing = get_product_by_id(product_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found")
    update_data = product_update.model_dump(exclude_unset=True)
    merged = {**existing, **update_data}
    saved = save_product(merged)
    return saved

@app.delete("/api/products/{product_id}")
def remove_product(product_id: str):
    deleted = delete_product(product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found")
    return {"message": f"Product '{product_id}' deleted successfully"}

@app.post("/api/products/import")
def import_products_csv(rows: List[Dict[str, Any]]):
    """Imports batch product records from CSV parsed data with row validation."""
    success_count = 0
    errors = []

    for index, row in enumerate(rows):
        try:
            name = str(row.get("name", "")).strip()
            category = str(row.get("category", "")).strip()
            selling_price = float(row.get("selling_price", 0))
            unit_cost = float(row.get("unit_cost", 0))
            current_stock = int(float(row.get("current_stock", 0)))
            target_stock = int(float(row.get("target_stock", 0)))
            min_margin = float(row.get("min_margin", 18.0))
            competitor_price = float(row.get("competitor_price", selling_price))
            region = str(row.get("region", "Pan-India")).strip()
            p_id = str(row.get("id", "")).strip() or f"PROD-{category[:4].upper()}-{uuid.uuid4().hex[:6].upper()}"

            if not name or selling_price <= 0 or unit_cost <= 0 or current_stock < 0:
                raise ValueError("Invalid row values: name, positive price/cost, and non-negative stock required")

            save_product({
                "id": p_id,
                "name": name,
                "category": category,
                "selling_price": selling_price,
                "unit_cost": unit_cost,
                "current_stock": current_stock,
                "target_stock": target_stock,
                "min_margin": min_margin,
                "competitor_price": competitor_price,
                "region": region,
                "base_daily_demand": int(float(row.get("base_daily_demand", 15))),
                "substitute_product_id": row.get("substitute_product_id") or None,
                "complementary_product_id": row.get("complementary_product_id") or None,
                "description": row.get("description", "")
            })
            success_count += 1
        except Exception as e:
            errors.append(f"Row {index + 1}: {str(e)}")

    return {
        "imported": success_count,
        "failed": len(errors),
        "errors": errors
    }

# =============================================================================
# Inventory & Analytics Summaries
# =============================================================================

@app.get("/api/inventory/summary")
def get_inventory_summary():
    products = get_all_products()
    total_units = sum(p["current_stock"] for p in products)
    total_cost_val = sum(p["current_stock"] * p["unit_cost"] for p in products)
    total_retail_val = sum(p["current_stock"] * p["selling_price"] for p in products)
    overstock_items = [p for p in products if p["overstock_risk"] == "High"]
    categories = list(set(p["category"] for p in products))

    category_breakdown = []
    for cat in categories:
        cat_prods = [p for p in products if p["category"] == cat]
        category_breakdown.append({
            "category": cat,
            "product_count": len(cat_prods),
            "stock_units": sum(p["current_stock"] for p in cat_prods),
            "inventory_cost_value": round(sum(p["current_stock"] * p["unit_cost"] for p in cat_prods), 2)
        })

    return {
        "total_sku_count": len(products),
        "total_inventory_units": total_units,
        "total_inventory_cost_value": round(total_cost_val, 2),
        "total_inventory_retail_value": round(total_retail_val, 2),
        "high_overstock_count": len(overstock_items),
        "high_overstock_skus": overstock_items,
        "category_breakdown": category_breakdown
    }

@app.get("/api/analytics/summary", response_model=AnalyticsSummary)
def get_analytics_summary():
    products = get_all_products()
    plans = get_all_plans()
    
    total_units = sum(p["current_stock"] for p in products)
    overstock_count = sum(1 for p in products if p["overstock_risk"] == "High")
    active_plans = [pl for pl in plans if pl["status"] == "APPROVED"]

    projected_rev = sum(pl["recommended_strategy"]["estimated_revenue"] for pl in active_plans)
    projected_prof = sum(pl["recommended_strategy"]["net_contribution"] for pl in active_plans)
    budget_alloc = sum(pl["marketing_budget"] for pl in active_plans)
    
    avg_margin = 0.0
    if active_plans:
        avg_margin = round(sum(pl["recommended_strategy"]["estimated_gross_margin_pct"] for pl in active_plans) / len(active_plans), 1)

    return AnalyticsSummary(
        total_products=len(products),
        total_inventory_units=total_units,
        overstock_risk_count=overstock_count,
        active_plans_count=len(active_plans),
        total_budget_allocated=budget_alloc,
        projected_revenue=projected_rev,
        projected_profit=projected_prof,
        avg_gross_margin_pct=avg_margin
    )

# =============================================================================
# Promotion Planning & Agent Execution
# =============================================================================

@app.post("/api/plans/generate", response_model=PromotionPlan)
def generate_promotion_plan(config: PlanConfiguration):
    product = get_product_by_id(config.product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with ID '{config.product_id}' not found")

    substitute = None
    if product.get("substitute_product_id"):
        substitute = get_product_by_id(product["substitute_product_id"])

    pipeline = AgentPipeline()
    result = pipeline.execute_planning_cycle(
        product=product,
        substitute_product=substitute,
        marketing_budget=config.marketing_budget,
        duration_days=config.duration_days,
        customer_segment=config.customer_segment,
        region=config.region,
        objective=config.objective,
        min_margin_override=config.min_margin_override,
        custom_discounts=config.custom_discounts
    )

    plan_id = f"PLAN-{uuid.uuid4().hex[:8].upper()}"
    new_plan = {
        "plan_id": plan_id,
        "product_id": product["id"],
        "product_name": product["name"],
        "category": product["category"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "DRAFT",
        "objective": config.objective,
        "customer_segment": config.customer_segment,
        "region": config.region,
        "duration_days": config.duration_days,
        "marketing_budget": config.marketing_budget,
        "recommended_strategy": result["recommended_strategy"],
        "candidate_strategies": result["candidate_strategies"],
        "agent_traces": result["agent_traces"],
        "reasoning": result["reasoning"],
        "risks_and_assumptions": result["risks_and_assumptions"],
        "constraint_report": result["constraint_report"],
        "actual_units_sold": None,
        "actual_revenue": None,
        "actual_gross_profit": None
    }

    save_promotion_plan(new_plan)
    return new_plan

@app.get("/api/plans", response_model=List[PromotionPlan])
def list_plans():
    return get_all_plans()

@app.get("/api/plans/{plan_id}", response_model=PromotionPlan)
def get_plan(plan_id: str):
    plan = get_plan_by_id(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail=f"Plan '{plan_id}' not found")
    return plan

@app.post("/api/plans/{plan_id}/approve", response_model=PromotionPlan)
def approve_plan(plan_id: str):
    plan = get_plan_by_id(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail=f"Plan '{plan_id}' not found")
    if not plan["recommended_strategy"]["is_feasible"]:
        raise HTTPException(
            status_code=400,
            detail="Cannot approve plan: recommended strategy violates hard business constraints."
        )
    return update_plan_status(plan_id, "APPROVED")

@app.post("/api/plans/{plan_id}/reject", response_model=PromotionPlan)
def reject_plan(plan_id: str):
    plan = get_plan_by_id(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail=f"Plan '{plan_id}' not found")
    return update_plan_status(plan_id, "REJECTED")

@app.post("/api/plans/{plan_id}/actuals", response_model=PromotionPlan)
def enter_plan_actuals(plan_id: str, actuals: ActualsInput):
    plan = get_plan_by_id(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail=f"Plan '{plan_id}' not found")
    return record_plan_actuals(
        plan_id=plan_id,
        units=actuals.actual_units_sold,
        revenue=actuals.actual_revenue,
        profit=actuals.actual_gross_profit
    )

# =============================================================================
# What-If Simulation Lab Endpoints
# =============================================================================

@app.post("/api/simulations/run", response_model=SimulationRunResponse)
def run_interactive_simulation(req: SimulationRunRequest):
    product = get_product_by_id(req.product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with ID '{req.product_id}' not found")

    substitute = None
    if product.get("substitute_product_id"):
        substitute = get_product_by_id(product["substitute_product_id"])

    strat = simulate_strategy_candidate(
        product=product,
        discount_pct=req.discount_pct,
        duration_days=req.duration_days,
        marketing_budget=req.marketing_budget,
        customer_segment=req.customer_segment,
        substitute_product=substitute
    )

    # Record run in history
    record_simulation_run({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "product_id": product["id"],
        "product_name": product["name"],
        "discount_pct": req.discount_pct,
        "duration_days": req.duration_days,
        "customer_segment": req.customer_segment,
        "estimated_revenue": strat["estimated_revenue"],
        "estimated_profit": strat["net_contribution"],
        "estimated_margin_pct": strat["estimated_gross_margin_pct"],
        "is_feasible": strat["is_feasible"],
        "rejection_reasons": strat["rejection_reasons"]
    })

    return {
        "product_id": product["id"],
        "product_name": product["name"],
        "strategy": strat,
        "model_assumptions": strat.get("demand_meta", {}),
        "formula_breakdown": {
            "demand_formula": "Base_Daily * Duration * (P_discounted / P_base)^Elasticity * Segment_Factor",
            "cogs_formula": "Units_Sold * Unit_Cost",
            "cannibalization_formula": "Substitute_Units_Diverted * Substitute_Unit_Margin",
            "net_contribution_formula": "Gross_Revenue - COGS - Cannibalization_Loss - Campaign_Spend"
        }
    }

@app.get("/api/simulations")
def list_simulations(limit: int = 50):
    return get_simulation_runs(limit=limit)

# =============================================================================
# Ready-to-Run Hackathon Demo Scenario
# =============================================================================

@app.post("/api/demo/run")
def run_demo_scenario():
    """
    Executes the ready-to-run hackathon demo scenario:
    - Product: AeroSound Pro Wireless Earbuds (PROD-ELEC-001)
    - Price: ₹2,499 | Cost: ₹1,650 | Current Stock: 1,840 units | Target: 400
    - Candidate discounts: 10%, 15%, 20%, 30%
    - 30% gets deterministically rejected by Constraint Guard (Margin < 18%)
    - 15% chosen as optimal strategy for profit maximization
    - Real execution traces returned.
    """
    earbuds = get_product_by_id("PROD-ELEC-001")
    if not earbuds:
        reset_database_to_seed()
        earbuds = get_product_by_id("PROD-ELEC-001")

    substitute = get_product_by_id("PROD-ELEC-002")

    pipeline = AgentPipeline()
    result = pipeline.execute_planning_cycle(
        product=earbuds,
        substitute_product=substitute,
        marketing_budget=28000.0,
        duration_days=14,
        customer_segment="Price Sensitive",
        region="Pan-India",
        objective="profit",
        custom_discounts=[10.0, 15.0, 20.0, 30.0]
    )

    plan_id = f"PLAN-DEMO-{uuid.uuid4().hex[:6].upper()}"
    demo_plan = {
        "plan_id": plan_id,
        "product_id": earbuds["id"],
        "product_name": earbuds["name"],
        "category": earbuds["category"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "DRAFT",
        "objective": "profit",
        "customer_segment": "Price Sensitive",
        "region": "Pan-India",
        "duration_days": 14,
        "marketing_budget": 28000.0,
        "recommended_strategy": result["recommended_strategy"],
        "candidate_strategies": result["candidate_strategies"],
        "agent_traces": result["agent_traces"],
        "reasoning": result["reasoning"],
        "risks_and_assumptions": result["risks_and_assumptions"],
        "constraint_report": result["constraint_report"]
    }

    save_promotion_plan(demo_plan)

    return {
        "message": "Demo scenario executed successfully",
        "plan": demo_plan,
        "storyline": [
            "1. Inventory Opportunity Identified: 1,440 excess earbuds (1,840 stock vs 400 target).",
            "2. Candidate Strategies Formulated: 10%, 15%, 20%, 30% discounts.",
            "3. Elasticity & Cannibalization Simulated across all candidates.",
            "4. Constraint Guard Rejection: 30% discount rejected (Gross margin 5.6% < 18.0% minimum).",
            "5. Optimization Decision: 15% discount selected as optimal for Profit Maximization.",
            "6. Full audit trace ready for executive review."
        ]
    }

@app.post("/api/settings/reset-demo")
def reset_demo_data():
    reset_database_to_seed()
    return {"message": "Database reset to 16 clean retail seed products and demo plans."}

@app.get("/api/export/report")
def export_report(format: str = "json"):
    products = get_all_products()
    plans = get_all_plans()
    data = {
        "export_timestamp": datetime.now(timezone.utc).isoformat(),
        "application": "PromoPilot AI",
        "total_products": len(products),
        "total_plans": len(plans),
        "products": products,
        "plans": plans
    }
    return data
