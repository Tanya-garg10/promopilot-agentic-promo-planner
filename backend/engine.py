"""
Deterministic Retail Promotion Optimization Engine
Implements reproducible constraint satisfaction, demand-response elasticity,
rule-based cannibalization adjustments, and objective-based strategy ranking.
"""

import math
from typing import List, Dict, Any, Optional, Tuple

# Segment-specific price elasticity benchmarks (standard empirical retail bounds)
SEGMENT_ELASTICITIES = {
    "Price Sensitive": -1.65,
    "Deal Seekers": -1.90,
    "Brand Loyalists": -0.85,
    "Holiday Shoppers": -1.40,
    "New Customers": -1.25,
}

# Segment conversion multipliers
SEGMENT_MULTIPLIERS = {
    "Price Sensitive": 1.15,
    "Deal Seekers": 1.25,
    "Brand Loyalists": 0.95,
    "Holiday Shoppers": 1.30,
    "New Customers": 1.05,
}

def calculate_demand_response(
    base_daily_demand: int,
    duration_days: int,
    current_price: float,
    discounted_price: float,
    customer_segment: str = "Price Sensitive",
    elasticity_override: Optional[float] = None,
    multiplier_override: Optional[float] = None
) -> Tuple[int, Dict[str, Any]]:
    """
    Computes simulated gross demand using an explicit constant-elasticity demand curve:
    Demand = Base_Demand * Duration * (P_discounted / P_current)^Elasticity * Segment_Factor
    """
    if current_price <= 0 or discounted_price <= 0:
        return 0, {}

    elasticity = elasticity_override if elasticity_override is not None else SEGMENT_ELASTICITIES.get(customer_segment, -1.40)
    segment_factor = multiplier_override if multiplier_override is not None else SEGMENT_MULTIPLIERS.get(customer_segment, 1.0)

    price_ratio = discounted_price / current_price
    
    # Elasticity demand expansion factor
    # For price decrease, price_ratio < 1, with negative elasticity -> price_ratio^elasticity > 1
    expansion_factor = math.pow(price_ratio, elasticity)
    
    base_total = base_daily_demand * duration_days
    gross_demand = int(round(base_total * expansion_factor * segment_factor))
    gross_demand = max(0, gross_demand)

    assumptions = {
        "base_daily_demand": base_daily_demand,
        "duration_days": duration_days,
        "base_units_without_promo": base_total,
        "price_ratio": round(price_ratio, 4),
        "elasticity_applied": elasticity,
        "segment_multiplier": segment_factor,
        "expansion_multiplier": round(expansion_factor * segment_factor, 3),
        "gross_demand_generated": gross_demand
    }

    return gross_demand, assumptions

def calculate_cannibalization(
    promoted_product_discount_pct: float,
    duration_days: int,
    substitute_product: Optional[Dict[str, Any]],
    cannibalization_rate: float = 0.20
) -> Tuple[float, int, Dict[str, Any]]:
    """
    Computes substitute product volume diverted and gross margin loss.
    Cannibalized Units = Substitute_Base_Demand * Duration * (Discount_Pct / 100) * Cannibalization_Rate
    Profit Loss = Cannibalized Units * Substitute_Unit_Margin
    """
    if not substitute_product or promoted_product_discount_pct <= 0:
        return 0.0, 0, {"applied": False, "substitute_id": None}

    sub_daily_demand = substitute_product.get("base_daily_demand", 15)
    sub_price = substitute_product.get("selling_price", 0.0)
    sub_cost = substitute_product.get("unit_cost", 0.0)
    sub_unit_margin = max(0.0, sub_price - sub_cost)

    # Diverted demand scales with discount depth
    diverted_units = int(round(sub_daily_demand * duration_days * (promoted_product_discount_pct / 100.0) * cannibalization_rate))
    diverted_units = max(0, diverted_units)
    profit_loss = round(diverted_units * sub_unit_margin, 2)

    details = {
        "applied": True,
        "substitute_id": substitute_product.get("id"),
        "substitute_name": substitute_product.get("name"),
        "substitute_unit_margin": sub_unit_margin,
        "diverted_units": diverted_units,
        "cannibalization_rate": cannibalization_rate,
        "profit_loss_inr": profit_loss
    }

    return profit_loss, diverted_units, details

def simulate_strategy_candidate(
    product: Dict[str, Any],
    discount_pct: float,
    duration_days: int,
    marketing_budget: float,
    customer_segment: str = "Price Sensitive",
    min_margin_threshold: Optional[float] = None,
    substitute_product: Optional[Dict[str, Any]] = None,
    mechanism_name: Optional[str] = None,
    cannibalization_rate: float = 0.20
) -> Dict[str, Any]:
    """
    Evaluates a candidate discount strategy through deterministic financial simulation
    and business rule constraint verification.
    """
    selling_price = float(product.get("selling_price", 0.0))
    unit_cost = float(product.get("unit_cost", 0.0))
    current_stock = int(product.get("current_stock", 0))
    base_daily_demand = int(product.get("base_daily_demand", 15))
    required_min_margin = min_margin_threshold if min_margin_threshold is not None else float(product.get("min_margin", 18.0))

    # 1. Discounted Price
    discount_fraction = discount_pct / 100.0
    discounted_price = round(selling_price * (1.0 - discount_fraction), 2)

    # Determine default mechanism label
    if not mechanism_name:
        if discount_pct == 0:
            mechanism_name = "Baseline (No Discount)"
        elif discount_pct <= 10:
            mechanism_name = "Standard Price Drop"
        elif discount_pct <= 20:
            mechanism_name = "Limited-Time Flash Promotion"
        else:
            mechanism_name = "Clearance Volume Markdown"

    # 2. Demand Simulation
    gross_demand, demand_meta = calculate_demand_response(
        base_daily_demand=base_daily_demand,
        duration_days=duration_days,
        current_price=selling_price,
        discounted_price=discounted_price,
        customer_segment=customer_segment
    )

    # 3. Units Sold capped by Inventory Bound
    effective_units_sold = min(current_stock, gross_demand)
    remaining_inventory = max(0, current_stock - effective_units_sold)
    clearance_pct = round((effective_units_sold / current_stock * 100.0) if current_stock > 0 else 0.0, 1)

    # 4. Cannibalization Adjustment
    cannibalization_loss, diverted_units, cann_meta = calculate_cannibalization(
        promoted_product_discount_pct=discount_pct,
        duration_days=duration_days,
        substitute_product=substitute_product,
        cannibalization_rate=cannibalization_rate
    )

    # 5. Financials
    gross_revenue = round(effective_units_sold * discounted_price, 2)
    cogs = round(effective_units_sold * unit_cost, 2)
    gross_profit = round(gross_revenue - cogs - cannibalization_loss, 2)
    
    gross_margin_pct = round((gross_profit / gross_revenue * 100.0) if gross_revenue > 0 else 0.0, 2)

    # 6. Campaign Spending
    # Fixed base ad spend (20% of budget) + variable customer acquisition cost
    base_fixed_spend = marketing_budget * 0.18
    variable_acquisition_cost_per_unit = max(15.0, discounted_price * 0.025)
    raw_campaign_spend = base_fixed_spend + (effective_units_sold * variable_acquisition_cost_per_unit)
    
    # Cap campaign spending to budget or compute overspend
    campaign_spending = round(raw_campaign_spend, 2)
    net_contribution = round(gross_profit - campaign_spending, 2)

    # 7. Constraint Guard (Deterministic Validation)
    rejection_reasons = []
    
    # Hard Rule 1: Minimum Acceptable Margin
    if gross_margin_pct < required_min_margin:
        rejection_reasons.append(
            f"Gross margin of {gross_margin_pct:.1f}% violates minimum margin threshold of {required_min_margin:.1f}%"
        )

    # Hard Rule 2: Selling Price must strictly exceed Unit Cost
    if discounted_price <= unit_cost:
        rejection_reasons.append(
            f"Discounted price ₹{discounted_price:.2f} is at or below unit cost ₹{unit_cost:.2f}"
        )

    # Hard Rule 3: Campaign spending must not exceed available marketing budget
    if campaign_spending > marketing_budget:
        rejection_reasons.append(
            f"Campaign spend ₹{campaign_spending:,.0f} exceeds maximum allocated budget ₹{marketing_budget:,.0f}"
        )

    # Hard Rule 4: Net contribution sanity
    if net_contribution < 0:
        rejection_reasons.append(
            f"Negative net contribution (₹{net_contribution:,.0f}) after marketing acquisition spend"
        )

    is_feasible = (len(rejection_reasons) == 0)

    strategy_id = f"STRAT-{int(discount_pct)}PCT-{int(discounted_price)}"

    return {
        "strategy_id": strategy_id,
        "discount_pct": discount_pct,
        "mechanism": mechanism_name,
        "discounted_price": discounted_price,
        "estimated_units_sold": effective_units_sold,
        "estimated_revenue": gross_revenue,
        "estimated_gross_profit": gross_profit,
        "estimated_gross_margin_pct": gross_margin_pct,
        "campaign_spending": campaign_spending,
        "net_contribution": net_contribution,
        "remaining_inventory": remaining_inventory,
        "clearance_pct": clearance_pct,
        "cannibalization_loss": cannibalization_loss,
        "is_feasible": is_feasible,
        "rejection_reasons": rejection_reasons,
        "demand_meta": demand_meta,
        "cannibalization_meta": cann_meta,
        "required_min_margin": required_min_margin,
        "unit_cost": unit_cost,
        "current_stock": current_stock,
        "current_price": selling_price
    }

def rank_and_optimize_strategies(
    candidates: List[Dict[str, Any]],
    objective: str = "profit"
) -> List[Dict[str, Any]]:
    """
    Ranks candidate strategies deterministically based on user objective:
    - 'profit': Maximizes net contribution (profit after campaign spend)
    - 'revenue': Maximizes total estimated sales revenue
    - 'clearance': Maximizes units sold and clearance percentage
    Feasible candidates always rank above infeasible ones.
    """
    feasible = [c for c in candidates if c["is_feasible"]]
    infeasible = [c for c in candidates if not c["is_feasible"]]

    if objective == "revenue":
        feasible.sort(key=lambda x: x["estimated_revenue"], reverse=True)
    elif objective == "clearance":
        feasible.sort(key=lambda x: (x["clearance_pct"], x["estimated_units_sold"]), reverse=True)
    else:  # "profit" default
        feasible.sort(key=lambda x: x["net_contribution"], reverse=True)

    # Sort infeasible by smallest margin violation or closest distance to feasibility
    infeasible.sort(key=lambda x: x.get("estimated_gross_margin_pct", 0), reverse=True)

    ranked = feasible + infeasible
    for idx, item in enumerate(ranked):
        item["rank"] = idx + 1
        if objective == "revenue":
            item["objective_score"] = round(item["estimated_revenue"] / 1000.0, 2)
        elif objective == "clearance":
            item["objective_score"] = round(item["clearance_pct"], 2)
        else:
            item["objective_score"] = round(item["net_contribution"] / 1000.0, 2)

    return ranked

def generate_candidate_discounts(
    current_margin_pct: float,
    min_margin_pct: float,
    custom_discounts: Optional[List[float]] = None
) -> List[float]:
    """
    Generates standard candidate discount levels for exploration.
    Includes zero discount (baseline) and steps through 5%, 10%, 15%, 20%, 25%, 30%.
    """
    if custom_discounts and len(custom_discounts) > 0:
        cleaned = sorted(list(set([round(float(d), 1) for d in custom_discounts if 0 <= d <= 80])))
        if 0.0 not in cleaned:
            cleaned.insert(0, 0.0)
        return cleaned

    # Standard exploration lattice
    return [0.0, 5.0, 10.0, 15.0, 20.0, 25.0, 30.0]
