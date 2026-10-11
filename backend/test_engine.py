"""
Unit Tests for PromoPilot AI Optimization Engine & Constraint Guard
Runs with Python standard library unittest.
"""

import unittest
from backend.engine import (
    calculate_demand_response,
    calculate_cannibalization,
    simulate_strategy_candidate,
    rank_and_optimize_strategies,
    generate_candidate_discounts
)
from backend.seed_data import SEED_PRODUCTS

class TestPromoPilotEngine(unittest.TestCase):

    def setUp(self):
        self.sample_earbuds = {
            "id": "PROD-ELEC-001",
            "name": "AeroSound Pro Wireless Earbuds",
            "category": "Electronics",
            "selling_price": 2499.0,
            "unit_cost": 1650.0,
            "current_stock": 1840,
            "target_stock": 400,
            "min_margin": 18.0,
            "competitor_price": 2349.0,
            "base_daily_demand": 18,
            "substitute_product_id": "PROD-ELEC-002"
        }
        self.sample_substitute = {
            "id": "PROD-ELEC-002",
            "name": "AeroSound Lite TWS Earbuds",
            "selling_price": 1499.0,
            "unit_cost": 920.0,
            "base_daily_demand": 24
        }

    def test_demand_elasticity_expansion(self):
        """Demand expansion must increase as discount increases with negative elasticity."""
        base_demand, _ = calculate_demand_response(
            base_daily_demand=20,
            duration_days=14,
            current_price=2000.0,
            discounted_price=2000.0, # 0% discount
            customer_segment="Price Sensitive"
        )
        discounted_demand, _ = calculate_demand_response(
            base_daily_demand=20,
            duration_days=14,
            current_price=2000.0,
            discounted_price=1600.0, # 20% discount
            customer_segment="Price Sensitive"
        )
        self.assertGreater(discounted_demand, base_demand)

    def test_inventory_bound_clipping(self):
        """Units sold cannot exceed current inventory, even with massive simulated demand."""
        product_low_stock = dict(self.sample_earbuds)
        product_low_stock["current_stock"] = 50 # Only 50 in stock

        sim = simulate_strategy_candidate(
            product=product_low_stock,
            discount_pct=25.0,
            duration_days=30,
            marketing_budget=50000.0,
            customer_segment="Deal Seekers"
        )
        self.assertEqual(sim["estimated_units_sold"], 50)
        self.assertEqual(sim["remaining_inventory"], 0)
        self.assertEqual(sim["clearance_pct"], 100.0)

    def test_hard_margin_constraint_rejection(self):
        """A discount driving gross margin below the required hurdle must be flagged infeasible."""
        # 30% discount on earbuds:
        # selling_price: 2499 -> discounted_price: ~1749.3
        # unit_cost: 1650
        # raw margin: (1749.3 - 1650) / 1749.3 = ~5.6% -> far below 18.0% minimum!
        sim = simulate_strategy_candidate(
            product=self.sample_earbuds,
            discount_pct=30.0,
            duration_days=14,
            marketing_budget=30000.0,
            min_margin_threshold=18.0
        )
        self.assertFalse(sim["is_feasible"])
        self.assertTrue(any("violates minimum margin threshold" in r for r in sim["rejection_reasons"]))

    def test_feasible_strategy_satisfies_constraints(self):
        """A reasonable discount satisfying margin and budget should be feasible."""
        # 10% discount on earbuds:
        # selling_price: 2499 -> discounted_price: 2249.1
        # unit_cost: 1650 -> raw margin ~26.6% -> well above 18% min
        sim = simulate_strategy_candidate(
            product=self.sample_earbuds,
            discount_pct=10.0,
            duration_days=14,
            marketing_budget=35000.0,
            min_margin_threshold=18.0
        )
        self.assertTrue(sim["is_feasible"])
        self.assertEqual(len(sim["rejection_reasons"]), 0)
        self.assertGreater(sim["net_contribution"], 0)

    def test_cannibalization_calculation(self):
        """Substitute demand diversion and margin loss must be computed accurately."""
        loss, diverted_units, details = calculate_cannibalization(
            promoted_product_discount_pct=15.0,
            duration_days=14,
            substitute_product=self.sample_substitute,
            cannibalization_rate=0.20
        )
        self.assertTrue(details["applied"])
        self.assertGreater(diverted_units, 0)
        self.assertGreater(loss, 0)
        expected_sub_margin = self.sample_substitute["selling_price"] - self.sample_substitute["unit_cost"]
        self.assertEqual(loss, round(diverted_units * expected_sub_margin, 2))

    def test_budget_exceeded_constraint_rejection(self):
        """Tiny budget that cannot support campaign ad spend must fail feasibility."""
        sim = simulate_strategy_candidate(
            product=self.sample_earbuds,
            discount_pct=10.0,
            duration_days=14,
            marketing_budget=100.0, # Unrealistically tiny budget
            min_margin_threshold=10.0
        )
        self.assertFalse(sim["is_feasible"])
        self.assertTrue(any("exceeds maximum allocated budget" in r for r in sim["rejection_reasons"]))

    def test_ranking_by_objective(self):
        """Optimization ranking must sort feasible strategies by the requested objective."""
        candidates = [
            simulate_strategy_candidate(self.sample_earbuds, d, 14, 40000.0, min_margin_threshold=15.0)
            for d in [0.0, 5.0, 10.0, 15.0]
        ]
        
        # Rank by clearance
        ranked_clearance = rank_and_optimize_strategies(candidates, objective="clearance")
        self.assertTrue(ranked_clearance[0]["is_feasible"])
        # In clearance, higher discount typically clears more inventory
        self.assertGreaterEqual(ranked_clearance[0]["clearance_pct"], ranked_clearance[-1]["clearance_pct"])

        # Rank by profit
        ranked_profit = rank_and_optimize_strategies(candidates, objective="profit")
        self.assertTrue(ranked_profit[0]["is_feasible"])
        self.assertGreaterEqual(ranked_profit[0]["net_contribution"], ranked_profit[-1]["net_contribution"])

    def test_seed_dataset_integrity(self):
        """Seed dataset must contain >= 15 products with valid positive values and required keys."""
        self.assertGreaterEqual(len(SEED_PRODUCTS), 15)
        for p in SEED_PRODUCTS:
            self.assertTrue(p["id"].startswith("PROD-"))
            self.assertGreater(p["selling_price"], 0)
            self.assertGreater(p["unit_cost"], 0)
            self.assertGreater(p["selling_price"], p["unit_cost"])
            self.assertGreaterEqual(p["current_stock"], 0)
            self.assertGreaterEqual(p["target_stock"], 0)
            self.assertIn(p["category"], ["Electronics", "Fashion", "Home Essentials", "Personal Care"])

if __name__ == "__main__":
    unittest.main()
