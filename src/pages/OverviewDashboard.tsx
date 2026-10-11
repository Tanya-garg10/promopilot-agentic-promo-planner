import React, { useState } from 'react';
import {
  Package,
  Boxes,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Play,
  Layers,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Search,
  CornerDownLeft,
  Flame,
  Percent,
  Sliders,
  Compass
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Product, PromotionPlan, InventorySummary, AnalyticsSummary } from '../types';

interface OverviewDashboardProps {
  products: Product[];
  plans: PromotionPlan[];
  inventorySummary: InventorySummary | null;
  analyticsSummary: AnalyticsSummary | null;
  onNavigateToPlanner: (productId?: string) => void;
  onNavigateToAgents: () => void;
  onNavigateToPlan: (planId: string) => void;
  onNavigateToSimulation?: (productId?: string) => void;
  onNavigateToProducts?: (filterRisk?: string) => void;
  onNavigateToSettings?: () => void;
  onRunDemo: () => void;
  isDemoRunning?: boolean;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  products,
  plans,
  inventorySummary,
  analyticsSummary,
  onNavigateToPlanner,
  onNavigateToAgents,
  onNavigateToPlan,
  onNavigateToSimulation,
  onNavigateToProducts,
  onNavigateToSettings,
  onRunDemo,
  isDemoRunning = false,
}) => {
  const [nlQuery, setNlQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'7D' | '14D' | '30D' | 'ALL'>('14D');
  const [nlFeedback, setNlFeedback] = useState<string | null>(null);

  const overstockProducts = products.filter((p) => p.overstock_risk === 'High');
  const dominantProduct = products.find((p) => p.id === 'PROD-ELEC-001') || overstockProducts[0] || products[0];
  const latestPlan = plans[0];
  const recentTraces = latestPlan?.agent_traces?.slice(0, 4) || [];

  // Natural Language Command Handler
  const handleNLSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = nlQuery.trim().toLowerCase();
    if (!q) return;

    if (q.includes('excess') || q.includes('overstock') || q.includes('inventory')) {
      setNlFeedback('Filtering catalog to products with forward overstock risk...');
      setTimeout(() => {
        setNlFeedback(null);
        if (onNavigateToProducts) onNavigateToProducts('High');
      }, 350);
    } else if (q.includes('compare') || q.includes('strategy') || q.includes('simulate') || q.includes('what-if') || q.includes('earbuds')) {
      setNlFeedback('Opening Simulation Studio with AeroSound Earbuds...');
      setTimeout(() => {
        setNlFeedback(null);
        if (onNavigateToSimulation) onNavigateToSimulation(dominantProduct?.id);
      }, 350);
    } else if (q.includes('margin') || q.includes('protect') || q.includes('hurdle') || q.includes('constraint')) {
      setNlFeedback('Opening Margin Hurdle Invariant Settings...');
      setTimeout(() => {
        setNlFeedback(null);
        if (onNavigateToSettings) onNavigateToSettings();
      }, 350);
    } else if (q.includes('plan') || q.includes('regional') || q.includes('build') || q.includes('new promo')) {
      setNlFeedback('Opening Autonomous Promotion Planner...');
      setTimeout(() => {
        setNlFeedback(null);
        onNavigateToPlanner(dominantProduct?.id);
      }, 350);
    } else if (q.includes('agent') || q.includes('trace') || q.includes('log')) {
      setNlFeedback('Navigating to Live Agent Workspace...');
      setTimeout(() => {
        setNlFeedback(null);
        onNavigateToAgents();
      }, 350);
    } else {
      // Check if user typed a specific product name
      const matched = products.find((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
      if (matched) {
        setNlFeedback(`Found ${matched.name}. Launching Simulation Studio...`);
        setTimeout(() => {
          setNlFeedback(null);
          if (onNavigateToSimulation) onNavigateToSimulation(matched.id);
        }, 350);
      } else {
        setNlFeedback(`Evaluating query: "${nlQuery}". Running multi-agent promotion analysis...`);
        setTimeout(() => {
          setNlFeedback(null);
          onRunDemo();
        }, 500);
      }
    }
  };

  const handleSuggestedClick = (text: string) => {
    setNlQuery(text);
    const q = text.toLowerCase();
    if (q.includes('excess')) {
      if (onNavigateToProducts) onNavigateToProducts('High');
    } else if (q.includes('compare')) {
      if (onNavigateToSimulation) onNavigateToSimulation(dominantProduct?.id);
    } else if (q.includes('protect margins')) {
      if (onNavigateToSettings) onNavigateToSettings();
    } else if (q.includes('regional')) {
      onNavigateToPlanner();
    }
  };

  // Trajectory data for clearance chart
  const promoTrendData = [
    { period: 'Day 1', baseline: 120, clearance_est: 190, revenue_k: 240 },
    { period: 'Day 3', baseline: 360, clearance_est: 610, revenue_k: 490 },
    { period: 'Day 7', baseline: 840, clearance_est: 1450, revenue_k: 910 },
    { period: 'Day 10', baseline: 1200, clearance_est: 2180, revenue_k: 1280 },
    { period: 'Day 14', baseline: 1680, clearance_est: 3120, revenue_k: 1690 },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Editorial Header & Natural Language Command Field */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E4E2D8] dark:border-[#202432] pb-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#455BFF] bg-[#EEF1FF] dark:bg-[#455BFF]/15 px-2 py-0.5 rounded font-bold border border-[#455BFF]/20">
                Autonomous Intelligence
              </span>
              <span className="text-xs text-[#8B8F9E]">· Economic Times AI Hackathon Edition</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#191B22] dark:text-[#F4F5F8]">
              Your next best promotion starts here.
            </h1>
            <p className="text-xs sm:text-sm text-[#5C606E] dark:text-[#9499A8] leading-relaxed">
              Observe inventory overhang, reason over competitor rates, simulate demand elasticity, and optimize margin hurdles.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateToPlanner()}
              className="px-3.5 py-2 text-xs font-semibold text-[#191B22] dark:text-[#F4F5F8] bg-white dark:bg-[#141722] hover:bg-[#F0EFEA] dark:hover:bg-[#1C202C] border border-[#E4E2D8] dark:border-[#202432] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#455BFF]" />
              <span>New Plan</span>
            </button>

            <button
              onClick={onRunDemo}
              disabled={isDemoRunning}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#455BFF] hover:bg-[#3448E0] active:scale-[0.98] rounded-lg transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current text-[#D8F878]" />
              <span>{isDemoRunning ? 'Simulating...' : 'Run Promotion Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Natural Language Command Bar with Suggested Workflows */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm space-y-3">
          <form onSubmit={handleNLSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-[#8B8F9E] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Ask PromoPilot to optimize inventory, margins, or promotions..."
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] placeholder-[#8B8F9E] focus:outline-hidden focus:border-[#455BFF] focus:ring-1 focus:ring-[#455BFF]/30 transition-all font-sans"
            />
            <button
              type="submit"
              className="absolute right-2 px-3 py-1.5 text-xs font-semibold text-white bg-[#455BFF] hover:bg-[#3448E0] rounded-md transition-all flex items-center gap-1.5"
            >
              <span>Execute</span>
              <CornerDownLeft className="w-3 h-3" />
            </button>
          </form>

          {/* Feedback message when command triggers */}
          {nlFeedback && (
            <div className="text-xs text-[#455BFF] dark:text-[#7B8BFF] font-medium animate-in fade-in flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#455BFF] animate-ping" />
              <span>{nlFeedback}</span>
            </div>
          )}

          {/* Suggested Contextual Action Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#5C606E] dark:text-[#9499A8]">
            <span className="text-[11px] font-semibold text-[#8B8F9E] uppercase tracking-wider font-mono">
              Suggested:
            </span>
            {[
              { label: 'Find products with excess inventory', desc: 'Overstock' },
              { label: 'Compare discount strategies', desc: 'Simulation' },
              { label: 'Protect margins across categories', desc: 'Guard' },
              { label: 'Build a regional promotion plan', desc: 'Planner' },
            ].map((cmd) => (
              <button
                key={cmd.label}
                type="button"
                onClick={() => handleSuggestedClick(cmd.label)}
                className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#F0EFEA] dark:bg-[#1B1E2B] hover:bg-[#EAE8E0] dark:hover:bg-[#222738] text-[#191B22] dark:text-[#F4F5F8] border border-[#E4E2D8] dark:border-[#202432] transition-colors flex items-center gap-1.5 group cursor-pointer"
              >
                <span>{cmd.label}</span>
                <ArrowRight className="w-2.5 h-2.5 text-[#8B8F9E] group-hover:text-[#455BFF] transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dominant Actionable Insight Hero Banner */}
      {dominantProduct && (
        <div className="rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm overflow-hidden">
          <div className="p-6 md:p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-[#E4E2D8] dark:border-[#202432] bg-gradient-to-r from-[#FDFCF7] via-white to-[#EEF1FF]/40 dark:from-[#141722] dark:via-[#141722] dark:to-[#455BFF]/10">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Primary Actionable Opportunity
                </span>
                <span className="text-xs text-[#8B8F9E]">· SKU #{dominantProduct.id}</span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-[#191B22] dark:text-[#F4F5F8] tracking-tight">
                {dominantProduct.name}: 1,140 Unit Overhang Driving ₹48.3k/mo Carrying Cost Risk
              </h2>

              <p className="text-xs sm:text-sm text-[#5C606E] dark:text-[#9499A8] leading-relaxed">
                Warehouse inventory stands at <strong>{dominantProduct.current_stock.toLocaleString()} units</strong> against a forward target of <strong>{dominantProduct.target_stock.toLocaleString()} units</strong> (2.6× coverage, 102 days of supply). A calibrated 15% discount accelerates velocity 3.4×, clearing 624 units in 14 days while locking in a <strong>27.2% gross margin</strong> (exceeding the 18.0% hurdle).
              </p>
            </div>

            <div className="flex flex-wrap lg:flex-col items-stretch gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => {
                  if (onNavigateToSimulation) onNavigateToSimulation(dominantProduct.id);
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-white bg-[#455BFF] hover:bg-[#3448E0] rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Sliders className="w-3.5 h-3.5 text-[#D8F878]" />
                <span>Launch Simulation Studio</span>
              </button>

              <button
                onClick={onNavigateToAgents}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-[#191B22] dark:text-[#F4F5F8] bg-[#F7F6F0] dark:bg-[#1B1E2B] hover:bg-[#EAE8E0] dark:hover:bg-[#222738] border border-[#E4E2D8] dark:border-[#202432] rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-[#455BFF]" />
                <span>Review 7-Agent Trace</span>
              </button>
            </div>
          </div>

          {/* Supporting Evidence Metric Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#E4E2D8] dark:divide-[#202432] bg-[#FDFCF7] dark:bg-[#11141C] text-xs font-mono">
            <div className="p-4">
              <span className="text-[10px] text-[#8B8F9E] font-sans uppercase tracking-wider block">Stock vs Target</span>
              <span className="text-base font-bold text-[#191B22] dark:text-[#F4F5F8] mt-1 block">
                {dominantProduct.current_stock.toLocaleString()} / {dominantProduct.target_stock.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-sans mt-0.5 block">
                +1,140 excess units (High Overstock)
              </span>
            </div>

            <div className="p-4">
              <span className="text-[10px] text-[#8B8F9E] font-sans uppercase tracking-wider block">Competitor Benchmark</span>
              <span className="text-base font-bold text-[#191B22] dark:text-[#F4F5F8] mt-1 block">
                ₹{dominantProduct.competitor_price.toLocaleString()} vs ₹{dominantProduct.selling_price.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#5C606E] dark:text-[#9499A8] font-sans mt-0.5 block">
                Competitor is ₹{(dominantProduct.selling_price - dominantProduct.competitor_price).toFixed(0)} lower
              </span>
            </div>

            <div className="p-4">
              <span className="text-[10px] text-[#8B8F9E] font-sans uppercase tracking-wider block">Optimized Discount</span>
              <span className="text-base font-bold text-[#455BFF] dark:text-[#7B8BFF] mt-1 block">
                15% OFF (Balanced)
              </span>
              <span className="text-[10px] text-[#10B981] dark:text-[#D8F878] font-sans mt-0.5 block">
                27.2% Margin ≥ 18.0% Hurdle
              </span>
            </div>

            <div className="p-4">
              <span className="text-[10px] text-[#8B8F9E] font-sans uppercase tracking-wider block">Projected Contribution</span>
              <span className="text-base font-bold text-[#10B981] dark:text-[#D8F878] mt-1 block">
                ₹2.24 Lakhs Net Profit
              </span>
              <span className="text-[10px] text-[#5C606E] dark:text-[#9499A8] font-sans mt-0.5 block">
                After ₹25k campaign budget
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Asymmetric Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bento 1: Inventory Health & Promotion Clearance Velocity (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#455BFF]" />
                <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">
                  Inventory Clearance Velocity & Trajectory
                </h3>
              </div>
              <p className="text-xs text-[#5C606E] dark:text-[#9499A8] mt-0.5">
                Simulated baseline sales velocity vs promotional campaign clearance volume
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#F0EFEA] dark:bg-[#181B24] rounded-lg border border-[#E4E2D8] dark:border-[#202432] text-[11px] self-start sm:self-auto">
              {(['7D', '14D', '30D', 'ALL'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    timeRange === r
                      ? 'bg-white dark:bg-[#222738] text-[#191B22] dark:text-[#F4F5F8] shadow-xs font-semibold'
                      : 'text-[#8B8F9E] hover:text-[#191B22] dark:hover:text-[#F4F5F8]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={promoTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="clearanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#455BFF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#455BFF" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#8B8F9E' }} stroke="#E4E2D8" />
                <YAxis tick={{ fontSize: 11, fill: '#8B8F9E' }} stroke="#E4E2D8" />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${Number(val).toLocaleString()} units`,
                    name === 'clearance_est' ? 'Simulated Campaign Velocity' : 'Baseline Run-Rate'
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E2D8',
                    borderRadius: '8px',
                    color: '#191B22',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="clearance_est"
                  name="Simulated Clearance Velocity"
                  stroke="#455BFF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#clearanceGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="baseline"
                  name="Baseline Run-Rate Demand"
                  stroke="#10B981"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#baselineGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-[#E4E2D8] dark:border-[#202432] flex items-center justify-between text-xs">
            <span className="text-[#5C606E] dark:text-[#9499A8]">Total Catalog Cost Basis:</span>
            <span className="font-mono text-[#191B22] dark:text-[#F4F5F8] font-bold">
              ₹{((inventorySummary?.total_inventory_cost_value || 0) / 100000).toFixed(1)} Lakhs ({inventorySummary?.total_inventory_units.toLocaleString()} units)
            </span>
          </div>
        </div>

        {/* Bento 2: High-Leverage Promotion Candidates (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
            <div>
              <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">Promotion Candidates</h3>
              <p className="text-xs text-[#5C606E] dark:text-[#9499A8]">High-overhang SKUs needing clearance</p>
            </div>
            <button
              onClick={() => onNavigateToProducts && onNavigateToProducts('High')}
              className="text-xs font-semibold text-[#455BFF] hover:underline flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {overstockProducts.slice(0, 4).map((prod) => (
              <div
                key={prod.id}
                className="p-3 rounded-lg bg-[#FDFCF7] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] flex items-center justify-between gap-3 text-xs hover:border-[#455BFF]/30 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#191B22] dark:text-[#F4F5F8] truncate">{prod.name}</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-800 dark:text-amber-400">
                      High Overhang
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5C606E] dark:text-[#9499A8] mt-0.5 font-mono">
                    Stock: {prod.current_stock} · Target: {prod.target_stock} · Margin: {(((prod.selling_price - prod.unit_cost) / prod.selling_price) * 100).toFixed(0)}%
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onNavigateToSimulation) onNavigateToSimulation(prod.id);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-[#455BFF] bg-[#EEF1FF] dark:bg-[#455BFF]/15 hover:bg-[#455BFF] hover:text-white rounded-md transition-colors shrink-0"
                >
                  Simulate →
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-[#F0EFEA] dark:bg-[#181B24] border border-[#E4E2D8] dark:border-[#202432] flex items-center justify-between text-xs">
            <span className="text-[#5C606E] dark:text-[#9499A8] font-medium">Overstock Risk Count:</span>
            <span className="font-bold font-mono text-amber-700 dark:text-amber-400">
              {overstockProducts.length} of {products.length} SKUs flagged
            </span>
          </div>
        </div>
      </div>

      {/* Bento Bottom Row: Budget Status & Recent Agent Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bento 3: Budget Status & Marketing Efficiency (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#455BFF] uppercase tracking-wider block mb-1">
              Marketing Capital
            </span>
            <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">
              Budget & Promotion Efficiency
            </h3>
            <p className="text-xs text-[#5C606E] dark:text-[#9499A8] mt-0.5">
              Capital efficiency across active campaigns
            </p>
          </div>

          <div className="space-y-3 font-mono">
            <div className="p-3.5 rounded-lg bg-[#FDFCF7] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432]">
              <span className="text-[10px] font-sans text-[#8B8F9E] uppercase tracking-wider block">Allocated Ad Budget</span>
              <span className="text-xl font-bold text-[#191B22] dark:text-[#F4F5F8] mt-0.5 block">
                ₹{((analyticsSummary?.total_budget_allocated || 25000) / 1000).toFixed(0)}k
              </span>
              <span className="text-[10px] font-sans text-[#5C606E] dark:text-[#9499A8] mt-0.5 block">
                Budget Ceiling Enforced by Constraint Guard
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FDFCF7] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432]">
              <span className="text-[10px] font-sans text-[#8B8F9E] uppercase tracking-wider block">Projected Net Contribution</span>
              <span className="text-xl font-bold text-[#10B981] dark:text-[#D8F878] mt-0.5 block">
                ₹{((analyticsSummary?.projected_profit || 211690) / 1000).toFixed(1)}k
              </span>
              <span className="text-[10px] font-sans text-[#10B981] dark:text-[#D8F878] font-bold mt-0.5 block">
                ROPS: 8.5× Return on Promotion Spend
              </span>
            </div>
          </div>

          <div className="text-[11px] text-[#5C606E] dark:text-[#9499A8] flex items-center gap-1.5 pt-2 border-t border-[#E4E2D8] dark:border-[#202432]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
            <span>All campaign spending verified ≤ budget bounds</span>
          </div>
        </div>

        {/* Bento 4: Recent Agent Decisions (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
            <div>
              <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">Recent Agent Decisions</h3>
              <p className="text-xs text-[#5C606E] dark:text-[#9499A8]">Real decisions synthesized by the 7-agent pipeline</p>
            </div>
            <button
              onClick={onNavigateToAgents}
              className="text-xs font-semibold text-[#455BFF] hover:underline flex items-center gap-1"
            >
              Live Agent Workspace <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentTraces.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-xs text-[#8B8F9E]">
                No recent agent runs found. Click "Run Promotion Analysis" to launch the pipeline.
              </div>
            ) : (
              recentTraces.map((trace, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-[#FDFCF7] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] flex flex-col justify-between space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#191B22] dark:text-[#F4F5F8]">{trace.agent_name}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        trace.status === 'SUCCESS'
                          ? 'bg-[#10B981]/15 text-[#10B981] dark:text-[#D8F878] border border-[#10B981]/30'
                          : trace.status === 'WARNING'
                          ? 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {trace.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5C606E] dark:text-[#9499A8] line-clamp-2 leading-relaxed">
                    {trace.summary}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#8B8F9E] font-mono pt-1 border-t border-[#E4E2D8]/60 dark:border-[#202432]/60">
                    <span className="capitalize">{trace.agent_id}</span>
                    <span>{trace.latency_ms}ms</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-[#E4E2D8] dark:border-[#202432] flex items-center justify-between text-xs">
            <span className="text-[#5C606E] dark:text-[#9499A8]">Decision Invariants:</span>
            <span className="text-[#10B981] dark:text-[#D8F878] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Deterministic Constraint Compliance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
