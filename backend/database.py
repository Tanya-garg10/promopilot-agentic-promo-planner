"""
SQLite Database Layer for PromoPilot AI
Provides persistence for products, promotion plans, simulations, audit logs, and settings.
Includes automated schema creation and demo data seeding.
"""

import sqlite3
import json
import os
from typing import List, Dict, Any, Optional
from .seed_data import SEED_PRODUCTS

DB_PATH = os.environ.get("SQLITE_DB_PATH", os.path.join(os.path.dirname(__file__), "promopilot.db"))

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Products Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        selling_price REAL NOT NULL,
        unit_cost REAL NOT NULL,
        current_stock INTEGER NOT NULL,
        target_stock INTEGER NOT NULL,
        min_margin REAL NOT NULL,
        competitor_price REAL NOT NULL,
        region TEXT NOT NULL,
        base_daily_demand INTEGER NOT NULL,
        substitute_product_id TEXT,
        complementary_product_id TEXT,
        description TEXT
    )
    """)

    # Promotion Plans Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS promotion_plans (
        plan_id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        category TEXT NOT NULL,
        created_at TEXT NOT NULL,
        status TEXT NOT NULL,
        objective TEXT NOT NULL,
        customer_segment TEXT NOT NULL,
        region TEXT NOT NULL,
        duration_days INTEGER NOT NULL,
        marketing_budget REAL NOT NULL,
        recommended_strategy TEXT NOT NULL,
        candidate_strategies TEXT NOT NULL,
        agent_traces TEXT NOT NULL,
        reasoning TEXT,
        risks_and_assumptions TEXT,
        constraint_report TEXT,
        actual_units_sold INTEGER,
        actual_revenue REAL,
        actual_gross_profit REAL,
        FOREIGN KEY (product_id) REFERENCES products(id)
    )
    """)

    # Simulation Runs History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS simulation_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        discount_pct REAL NOT NULL,
        duration_days INTEGER NOT NULL,
        customer_segment TEXT NOT NULL,
        estimated_revenue REAL NOT NULL,
        estimated_profit REAL NOT NULL,
        estimated_margin_pct REAL NOT NULL,
        is_feasible INTEGER NOT NULL,
        rejection_reasons TEXT
    )
    """)

    # App Settings
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    """)

    conn.commit()

    # Seed if products table is empty
    cursor.execute("SELECT COUNT(*) FROM products")
    count = cursor.fetchone()[0]
    if count == 0:
        seed_default_products(cursor)
        seed_default_demo_plan(cursor)
        conn.commit()

    conn.close()

def seed_default_products(cursor):
    for p in SEED_PRODUCTS:
        cursor.execute("""
        INSERT OR REPLACE INTO products (
            id, name, category, selling_price, unit_cost, current_stock,
            target_stock, min_margin, competitor_price, region, base_daily_demand,
            substitute_product_id, complementary_product_id, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p["id"], p["name"], p["category"], p["selling_price"], p["unit_cost"],
            p["current_stock"], p["target_stock"], p["min_margin"], p["competitor_price"],
            p["region"], p["base_daily_demand"], p["substitute_product_id"],
            p["complementary_product_id"], p.get("description", "")
        ))

def seed_default_demo_plan(cursor):
    demo_plan_id = "PLAN-DEMO-EARBUDS-2026"
    recommended = {
        "strategy_id": "STRAT-15PCT-2124",
        "discount_pct": 15.0,
        "mechanism": "Limited-Time Flash Promotion",
        "discounted_price": 2124.15,
        "estimated_units_sold": 542,
        "estimated_revenue": 1151289.0,
        "estimated_gross_profit": 234140.0,
        "estimated_gross_margin_pct": 20.34,
        "campaign_spending": 22450.0,
        "net_contribution": 211690.0,
        "remaining_inventory": 1298,
        "clearance_pct": 29.5,
        "cannibalization_loss": 22770.0,
        "is_feasible": True,
        "rejection_reasons": [],
        "rank": 1,
        "objective_score": 211.69
    }
    cursor.execute("""
    INSERT OR REPLACE INTO promotion_plans (
        plan_id, product_id, product_name, category, created_at, status, objective,
        customer_segment, region, duration_days, marketing_budget,
        recommended_strategy, candidate_strategies, agent_traces, reasoning,
        risks_and_assumptions, constraint_report, actual_units_sold, actual_revenue, actual_gross_profit
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        demo_plan_id,
        "PROD-ELEC-001",
        "AeroSound Pro Wireless Earbuds",
        "Electronics",
        "2026-10-10T12:00:00Z",
        "APPROVED",
        "profit",
        "Price Sensitive",
        "Pan-India",
        14,
        25000.0,
        json.dumps(recommended),
        json.dumps([recommended]),
        json.dumps([]),
        "Historical pilot campaign executed for Q4 festive clearance. Achieved 20.3% gross margin while respecting 18.0% hurdle rate.",
        json.dumps(["Assumes stable competitive response", "Cannibalization monitored on Lite Earbuds"]),
        json.dumps({"margin_status": "PASS", "budget_status": "PASS"}),
        520,
        1104558.0,
        224800.0
    ))

def reset_database_to_seed():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products")
    cursor.execute("DELETE FROM promotion_plans")
    cursor.execute("DELETE FROM simulation_runs")
    seed_default_products(cursor)
    seed_default_demo_plan(cursor)
    conn.commit()
    conn.close()

def get_all_products() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products ORDER BY category, name")
    rows = cursor.fetchall()
    result = []
    for r in rows:
        d = dict(r)
        # Compute derived risk metrics
        curr = d["current_stock"]
        target = d["target_stock"]
        excess = curr - target
        if excess > 500 or (target > 0 and curr / target >= 2.5):
            d["overstock_risk"] = "High"
        elif excess > 100 or (target > 0 and curr / target >= 1.5):
            d["overstock_risk"] = "Moderate"
        else:
            d["overstock_risk"] = "Normal"

        comp = d["competitor_price"]
        sell = d["selling_price"]
        d["price_gap_pct"] = round(((comp - sell) / comp * 100.0) if comp > 0 else 0.0, 1)
        cost = d["unit_cost"]
        d["current_margin_pct"] = round(((sell - cost) / sell * 100.0) if sell > 0 else 0.0, 1)
        result.append(d)
    conn.close()
    return result

def get_product_by_id(product_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    curr = d["current_stock"]
    target = d["target_stock"]
    excess = curr - target
    if excess > 500 or (target > 0 and curr / target >= 2.5):
        d["overstock_risk"] = "High"
    elif excess > 100 or (target > 0 and curr / target >= 1.5):
        d["overstock_risk"] = "Moderate"
    else:
        d["overstock_risk"] = "Normal"
    comp = d["competitor_price"]
    sell = d["selling_price"]
    d["price_gap_pct"] = round(((comp - sell) / comp * 100.0) if comp > 0 else 0.0, 1)
    cost = d["unit_cost"]
    d["current_margin_pct"] = round(((sell - cost) / sell * 100.0) if sell > 0 else 0.0, 1)
    return d

def save_product(product_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO products (
        id, name, category, selling_price, unit_cost, current_stock,
        target_stock, min_margin, competitor_price, region, base_daily_demand,
        substitute_product_id, complementary_product_id, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        product_data["id"], product_data["name"], product_data["category"],
        float(product_data["selling_price"]), float(product_data["unit_cost"]),
        int(product_data["current_stock"]), int(product_data["target_stock"]),
        float(product_data["min_margin"]), float(product_data["competitor_price"]),
        product_data.get("region", "Pan-India"), int(product_data.get("base_daily_demand", 15)),
        product_data.get("substitute_product_id"), product_data.get("complementary_product_id"),
        product_data.get("description", "")
    ))
    conn.commit()
    conn.close()
    return get_product_by_id(product_data["id"])

def delete_product(product_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def save_promotion_plan(plan: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO promotion_plans (
        plan_id, product_id, product_name, category, created_at, status, objective,
        customer_segment, region, duration_days, marketing_budget,
        recommended_strategy, candidate_strategies, agent_traces, reasoning,
        risks_and_assumptions, constraint_report, actual_units_sold, actual_revenue, actual_gross_profit
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        plan["plan_id"], plan["product_id"], plan["product_name"], plan["category"],
        plan["created_at"], plan.get("status", "DRAFT"), plan["objective"],
        plan["customer_segment"], plan["region"], plan["duration_days"],
        float(plan["marketing_budget"]),
        json.dumps(plan["recommended_strategy"]),
        json.dumps(plan["candidate_strategies"]),
        json.dumps(plan["agent_traces"]),
        plan.get("reasoning", ""),
        json.dumps(plan.get("risks_and_assumptions", [])),
        json.dumps(plan.get("constraint_report", {})),
        plan.get("actual_units_sold"),
        plan.get("actual_revenue"),
        plan.get("actual_gross_profit")
    ))
    conn.commit()
    conn.close()

def get_all_plans() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM promotion_plans ORDER BY created_at DESC")
    rows = cursor.fetchall()
    result = []
    for r in rows:
        d = dict(r)
        d["recommended_strategy"] = json.loads(d["recommended_strategy"])
        d["candidate_strategies"] = json.loads(d["candidate_strategies"])
        d["agent_traces"] = json.loads(d["agent_traces"])
        d["risks_and_assumptions"] = json.loads(d["risks_and_assumptions"] or "[]")
        d["constraint_report"] = json.loads(d["constraint_report"] or "{}")
        result.append(d)
    conn.close()
    return result

def get_plan_by_id(plan_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM promotion_plans WHERE plan_id = ?", (plan_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["recommended_strategy"] = json.loads(d["recommended_strategy"])
    d["candidate_strategies"] = json.loads(d["candidate_strategies"])
    d["agent_traces"] = json.loads(d["agent_traces"])
    d["risks_and_assumptions"] = json.loads(d["risks_and_assumptions"] or "[]")
    d["constraint_report"] = json.loads(d["constraint_report"] or "{}")
    return d

def update_plan_status(plan_id: str, status: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE promotion_plans SET status = ? WHERE plan_id = ?", (status, plan_id))
    conn.commit()
    conn.close()
    return get_plan_by_id(plan_id)

def record_plan_actuals(plan_id: str, units: int, revenue: float, profit: float) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE promotion_plans
    SET actual_units_sold = ?, actual_revenue = ?, actual_gross_profit = ?
    WHERE plan_id = ?
    """, (units, revenue, profit, plan_id))
    conn.commit()
    conn.close()
    return get_plan_by_id(plan_id)

def record_simulation_run(run_data: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO simulation_runs (
        timestamp, product_id, product_name, discount_pct, duration_days,
        customer_segment, estimated_revenue, estimated_profit,
        estimated_margin_pct, is_feasible, rejection_reasons
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        run_data["timestamp"], run_data["product_id"], run_data["product_name"],
        run_data["discount_pct"], run_data["duration_days"], run_data["customer_segment"],
        run_data["estimated_revenue"], run_data["estimated_profit"],
        run_data["estimated_margin_pct"], 1 if run_data["is_feasible"] else 0,
        json.dumps(run_data.get("rejection_reasons", []))
    ))
    conn.commit()
    conn.close()

def get_simulation_runs(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM simulation_runs ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    result = []
    for r in rows:
        d = dict(r)
        d["rejection_reasons"] = json.loads(d["rejection_reasons"] or "[]")
        d["is_feasible"] = bool(d["is_feasible"])
        result.append(d)
    conn.close()
    return result
