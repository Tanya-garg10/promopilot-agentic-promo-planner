# PromoPilot AI — Autonomous Retail Promotion Planner

**ET AI Hackathon: Agentic Edition**

## Overview

PromoPilot AI is an autonomous retail promotion planning platform that uses a 7-agent pipeline with deterministic constraint satisfaction to generate, simulate, and optimize promotion strategies. Unlike black-box LLM approaches, PromoPilot AI combines agentic intelligence with rigorous mathematical modeling to ensure business rule compliance.

**Key Features:**
- Multi-agent workflow (Market, Inventory, Customer, Promotion, Simulation, Constraint Guard, Optimization)
- Hard constraints: Min 18% margin, price > cost, budget limits
- Demand elasticity modeling with cannibalization
- What-If simulation sandbox
- React dashboard with approval workflow
- Offline-capable deterministic fallback

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│  (Dashboard, Planner, Simulation, Analytics, Settings)  │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────────┐
│              Express/Node.js Server                     │
│         (or Python FastAPI - Alternative)               │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│          7-Agent Pipeline + Engine                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ Market   │ │Inventory │ │Customer  │ │Promotion │    │
│  │ Analyst  │ │ Analyst  │ │ Strategy │ │ Strategy │    │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘    │
│       │            │            │            │          │
│  ┌────▼─────┐ ┌────▼─────┐ ┌────▼─────┐ ┌────▼─────┐    │
│  │Simulation│ │Constraint│ │Optimize  │ │  LLM     │    │
│  │  Agent   │ │  Guard   │ │  Agent   │ │(Optional)│    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              SQLite Database                            │
│         (Products, Plans, Simulations)                  │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 19 + TypeScript
- Tailwind CSS 4
- Recharts (data visualization)
- Lucide React (icons)
- Framer Motion (animations)

**Backend (Node.js/Express):**
- Express.js
- sql.js (embedded SQLite)
- TypeScript
- Featherless AI (optional LLM integration)

**Backend (Python/FastAPI - Alternative):**
- FastAPI
- SQLite3
- Pydantic (data validation)
- UnitTest (testing)

## 7-Agent Pipeline

1. **Market Analyst (AGENT-01)**
   - Analyzes price gaps against competitors
   - Flags pricing position (advantaged/parity/disadvantaged)
   - Provides market pressure metrics

2. **Inventory Analyst (AGENT-02)**
   - Computes days of supply
   - Flags overstock risk (High/Moderate/Normal)
   - Estimates warehouse holding costs

3. **Customer Strategy (AGENT-03)**
   - Maps customer segments to elasticity curves
   - Segments: Price Sensitive, Deal Seekers, Brand Loyalists, Holiday Shoppers, New Customers
   - Applies segment multipliers

4. **Promotion Strategy (AGENT-04)**
   - Generates discount lattice (0%, 5%, 10%, 15%, 20%, 25%, 30%)
   - Pairs with promotional mechanisms (Flash Sale, Direct Markdown, Bundle)
   - Creates candidate strategies

5. **Simulation Agent (AGENT-05)**
   - Evaluates demand response using constant-elasticity model
   - Applies inventory boundary clipping
   - Models substitute cannibalization effects

6. **Constraint Guard (AGENT-06)**
   - Enforces hard business rules:
     - Minimum gross margin ≥ 18%
     - Selling price > unit cost
     - Campaign spend ≤ marketing budget
   - Rejects infeasible strategies

7. **Optimization Agent (AGENT-07)**
   - Ranks feasible candidates by objective:
     - Profit Maximization
     - Revenue Maximization
     - Inventory Clearance
   - Selects optimal strategy

## Installation & Setup

### Prerequisites

- **Node.js** 18+ (for Node.js/Express backend)
- **Python** 3.8+ (for Python/FastAPI backend - optional)
- **npm** or **bun** package manager

### Option A: Full-Stack (Node.js + React) - Recommended

1. **Clone the repository**
```bash
git clone https://github.com/Tanya-garg10/promopilot-agentic-promo-planner.git
cd promopilot-agentic-promo-planner
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and add your Featherless AI API key (optional)
# FEATHERLESS_API_KEY=your_api_key_here
```

4. **Run development server**
```bash
npm run dev
```

5. **Open browser**
```
http://localhost:3000
```

### Option B: Python FastAPI Backend

1. **Clone the repository**
```bash
git clone https://github.com/Tanya-garg10/promopilot-agentic-promo-planner.git
cd promopilot-agentic-promo-planner
```

2. **Create and activate Python virtual environment**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and add your Featherless AI API key (optional)
# FEATHERLESS_API_KEY=your_api_key_here
```

5. **Run FastAPI server**
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

6. **Access API documentation**
```
http://localhost:8000/docs
```

## Environment Variables

Create a `.env` file in the project root:

```env
# Optional: Featherless AI API key for strategic reasoning
# If omitted, the system runs in deterministic-only mode
FEATHERLESS_API_KEY=""

# Application URL
APP_URL="http://localhost:3000"

# Server port (default: 3000 for Node.js, 8000 for FastAPI)
PORT=3000

# SQLite database path
SQLITE_DB_PATH="./backend/promopilot.db"
```

## API Documentation

### REST API Endpoints

#### Health Check
```
GET /api/health
```
Returns system status, LLM availability, and database connection.

#### Products
```
GET    /api/products                    # List all products
GET    /api/products/{id}               # Get product by ID
POST   /api/products                    # Create new product
PUT    /api/products/{id}               # Update product
DELETE /api/products/{id}               # Delete product
POST   /api/products/import             # Batch import from CSV
```

#### Inventory & Analytics
```
GET /api/inventory/summary              # Inventory aggregates
GET /api/analytics/summary              # KPIs and metrics
```

#### Promotion Planning
```
POST /api/plans/generate                # Execute 7-agent pipeline
GET  /api/plans                         # List all plans
GET  /api/plans/{id}                    # Get plan details
POST /api/plans/{id}/approve            # Approve plan
POST /api/plans/{id}/reject             # Reject plan
POST /api/plans/{id}/actuals            # Record actual results
```

#### Simulation
```
POST /api/simulations/run               # Run What-If simulation
GET  /api/simulations                   # Simulation history
```

#### Demo & Settings
```
POST /api/demo/run                      # Run hackathon demo
POST /api/settings/reset-demo           # Reset to seed data
GET  /api/export/report                 # Export audit report
```

## Testing

### Run Unit Tests (Python Backend)
```bash
python -m unittest backend/test_engine.py
```

Tests verify:
- Demand elasticity calculations
- Margin constraint enforcement
- Inventory clipping bounds
- Cannibalization loss accuracy
- Optimization objective rankings

### Run Tests via npm
```bash
npm test
```

## Quick Demo Walkthrough

1. **Start the application**
   - Run `npm run dev` and open `http://localhost:3000`

2. **Overview Dashboard**
   - Check Overstock Alerts widget
   - Note: AeroSound Pro Wireless Earbuds has 1,840 units vs 400 target (1,440 excess)

3. **Run Hackathon Demo**
   - Click "Run Hackathon Demo" button in top bar
   - Watch the 6-step storyline modal
   - Click "Inspect 7-Agent Trace" to see detailed execution

4. **Agent Activity Center**
   - Review real-time traces across all 7 agents
   - Observe Constraint Guard rejecting 30% discount (margin 5.6% < 18%)
   - See Optimization Agent selecting 15% discount for profit maximization

5. **What-If Simulation Lab**
   - Navigate to Simulation tab
   - Move discount slider to 28% - observe red violation (margin < 18%)
   - Adjust duration slider - see dynamic updates to revenue/profit
   - Compare multiple discount scenarios side-by-side

6. **Approve & Track**
   - Go to Promotion Plans
   - Review financial impact (₹11.5L revenue, ₹2.1L net profit)
   - Click "Approve Promotion Plan"
   - Navigate to Analytics & History to track Estimated vs Actuals

## Deployment

### Render (Recommended)

1. Connect GitHub repository to [render.com](https://render.com)
2. Create new "Web Service"
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add `FEATHERLESS_API_KEY` (optional)
4. Deploy - Render will auto-build and deploy

### Vercel

```bash
npm i -g vercel
vercel
```

Or connect GitHub repo to [vercel.com](https://vercel.com) for auto-deploy.

### Railway

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

## Mathematical Models

### Constant-Elasticity Demand Curve
```
Price Ratio = P_discounted / P_catalog
Gross Demand = Base_Daily_Demand × Duration × (Price_Ratio)^Elasticity × Segment_Multiplier
```

### Inventory Boundary Clipping
```
Effective Units Sold = min(Current_Stock, max(0, Gross_Demand))
```

### Cannibalization Model
```
Diverted Units = Substitute_Base_Demand × Duration × (Discount%/100) × Cannibalization_Rate
Cannibalization Loss = Diverted Units × (Substitute_Price - Substitute_Cost)
```

### Financial Calculations
```
Gross Revenue = Effective Units Sold × P_discounted
COGS = Effective Units Sold × Unit Cost
Gross Profit = Gross Revenue - COGS - Cannibalization Loss
Gross Margin % = (Gross Profit / Gross Revenue) × 100
Campaign Spend = (Budget × 0.18) + (Units Sold × CAC_variable)
Net Contribution = Gross Profit - Campaign Spend
```

## Project Structure

```
promopilot-agentic-promo-planner/
├── backend/                 # Python FastAPI backend
│   ├── agents.py           # Agent pipeline implementation
│   ├── database.py         # SQLite database operations
│   ├── engine.py           # Simulation & optimization engine
│   ├── main.py             # FastAPI application
│   ├── models.py           # Pydantic data models
│   ├── seed_data.py        # Initial product data
│   └── test_engine.py      # Unit tests
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # API client
│   ├── types.ts            # TypeScript types
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── data/                   # SQLite database (generated)
├── server.ts               # Node.js/Express server
├── package.json            # Node dependencies
├── requirements.txt       # Python dependencies
├── .env.example            # Environment variables template
├── README.md               # This file
└── LICENSE                 # MIT License
```

## Troubleshooting

### Build Fails with esbuild Error
If you encounter esbuild version conflicts, ensure you're using the latest version in package.json:
```json
"esbuild": "^0.28.0"
```

### Database Not Found
The SQLite database is auto-generated on first run. If issues persist:
```bash
# For Node.js version
rm -rf data/
npm run dev

# For Python version
rm backend/promopilot.db
uvicorn backend.main:app --reload
```

### LLM Not Working
If Featherless AI integration fails, the system automatically falls back to deterministic-only mode. Check:
- API key is correctly set in `.env`
- API key has sufficient credits/permissions
- Network connectivity to Featherless API

## License

MIT License - See [LICENSE](LICENSE) file

## Contributing

This project was developed for the ET AI Hackathon: Agentic Edition. Contributions are welcome under the MIT License.
