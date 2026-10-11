# PromoPilot AI — Autonomous Retail Promotion Planner

**ET AI Hackathon: Agentic Edition**

## Overview

PromoPilot AI is an autonomous retail promotion planning platform that uses a 7-agent pipeline with deterministic constraint satisfaction to generate, simulate, and optimize promotion strategies.

**Key Features:**
- Multi-agent workflow (Market, Inventory, Customer, Promotion, Simulation, Constraint Guard, Optimization)
- Hard constraints: Min 18% margin, price > cost, budget limits
- Demand elasticity modeling with cannibalization
- What-If simulation sandbox
- React dashboard with approval workflow

## 7-Agent Pipeline

1. **Market Analyst** - Price gaps vs competitors
2. **Inventory Analyst** - Overstock risk & holding cost
3. **Customer Strategy** - Price elasticity & segment mapping
4. **Promotion Strategy** - Discount lattice (0-30%)
5. **Simulation Agent** - Demand response & cannibalization
6. **Constraint Guard** - Enforces margin ≥18%, price > cost, budget limits
7. **Optimization Agent** - Ranks by Profit/Revenue/Clearance

## Setup

### Option A: Full-Stack (Node.js + React)
```cmd
npm install
npm run dev
# Open http://localhost:3000
```

### Option B: Python FastAPI Backend
```cmd
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
# Open http://localhost:8000/docs
```

## Testing

```cmd
python -m unittest backend/test_engine.py
# or
npm test
```

## Quick Demo

1. Open Overview Dashboard - check Overstock Alerts (AeroSound Pro: 1,840 units)
2. Click "Run Hackathon Demo" - watch 7-agent pipeline execution
3. Inspect Agent Activity Center - see real trace with constraint violations
4. Try What-If Simulation - move discount slider (28% = infeasible, margin < 18%)
5. Approve plan and track Estimated vs Actuals

## License

MIT License - See [LICENSE](LICENSE) file
