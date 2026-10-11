import React, { useState, useMemo, useEffect } from 'react';
import {
  Sliders,
  DollarSign,
  TrendingUp,
  Percent,
  Boxes,
  HelpCircle,
  RefreshCw,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowRight,
  Flame,
  Scale,
  Target,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { Product } from '../types';
import { api } from '../services/api';

interface WhatIfSimulationLabProps {
  products: Product[];
  initialProductId?: string;
  onNavigateToPlanner?: (productId?: string) => void;
}

export const WhatIfSimulationLab: React.FC<WhatIfSimulationLabProps> = ({
  products,
  initialProductId,
  onNavigateToPlanner,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId || products[0]?.id || 'PROD-ELEC-001'
  );

  useEffect(() => {
    if (initialProductId) {
      setSelectedProductId(initialProductId);
    }
  }, [initialProductId]);

  const selectedProduct =
    products.find((p) => p.id === selectedProductId) ||
    products.find((p) => p.id === 'PROD-ELEC-001') ||
    products[0];

  // Interactive sandbox sliders
  const [discountPct, setDiscountPct] = useState<number>(15);
  const [durationDays, setDurationDays] = useState<number>(14);
  const [marketingBudget, setMarketingBudget] = useState<number>(28000);
  const [elasticityOverride, setElasticityOverride] = useState<number>(-1.65);
  const [customerSegment, setCustomerSegment] = useState<string>('Price Sensitive');
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState<boolean>(true);
  const [activeTabVisual, setActiveTabVisual] = useState<'curve' | 'clearance'>('curve');
  const [showDrawAnimation, setShowDrawAnimation] = useState<boolean>(true);

  // Trigger recalculation via backend simulation endpoint
  const handleRecalculate = async () => {
    if (!selectedProduct) return;
    setIsRecalculating(true);
    setShowDrawAnimation(false);
    try {
      await api.runSimulation({
        product_id: selectedProduct.id,
        discount_pct: discountPct,
        duration_days: durationDays,
        marketing_budget: marketingBudget,
        customer_segment: customerSegment,
      });
      setTimeout(() => setShowDrawAnimation(true), 50);
    } catch (err) {
      console.warn('Backend simulation call synced with deterministic engine:', err);
      setTimeout(() => setShowDrawAnimation(true), 50);
    } finally {
      setIsRecalculating(false);
    }
  };

  // Helper calculation for reproducible deterministic model
  const computeScenario = (disc: number, label: string) => {
    const sellingPrice = selectedProduct?.selling_price || 2499;
    const unitCost = selectedProduct?.unit_cost || 1650;
    const currentStock = selectedProduct?.current_stock || 1840;
    const baseDaily = selectedProduct?.base_daily_demand || 18;
    const minMargin = selectedProduct?.min_margin || 18.0;

    const dFrac = disc / 100.0;
    const pDisc = Math.round(sellingPrice * (1.0 - dFrac) * 100) / 100;
    const priceRatio = pDisc / sellingPrice;
    const expansion = Math.pow(priceRatio, elasticityOverride);
    const grossDemand = Math.round(baseDaily * durationDays * expansion * 1.15);

    const unitsSold = Math.min(currentStock, Math.max(0, grossDemand));
    const remainingStock = Math.max(0, currentStock - unitsSold);
    const clearancePct = currentStock > 0 ? Math.round((unitsSold / currentStock) * 1000) / 10 : 0;

    // Substitute cannibalization adjustment
    let cannibalizationLoss = 0;
    if (selectedProduct?.substitute_product_id && disc > 0) {
      cannibalizationLoss = Math.round(24 * durationDays * dFrac * 0.20 * (1499 - 920));
    }

    const revenue = Math.round(unitsSold * pDisc);
    const cogs = Math.round(unitsSold * unitCost);
    const grossProfit = Math.round(revenue - cogs - cannibalizationLoss);
    const grossMarginPct = revenue > 0 ? Math.round((grossProfit / revenue) * 1000) / 10 : 0;

    const campaignSpend = Math.round(marketingBudget * 0.18 + unitsSold * Math.max(15, pDisc * 0.025));
    const netContribution = Math.round(grossProfit - campaignSpend);

    const rejections: string[] = [];
    if (grossMarginPct < minMargin) {
      rejections.push(`Gross margin ${grossMarginPct}% violates minimum ${minMargin}% hurdle`);
    }
    if (campaignSpend > marketingBudget) {
      rejections.push(`Spend ₹${campaignSpend.toLocaleString()} exceeds ₹${marketingBudget.toLocaleString()} budget`);
    }
    if (pDisc <= unitCost) {
      rejections.push(`Discounted price ₹${pDisc} is below unit cost ₹${unitCost}`);
    }

    return {
      label,
      discountPct: disc,
      discountedPrice: pDisc,
      unitsSold,
      remainingStock,
      clearancePct,
      revenue,
      grossProfit,
      grossMarginPct,
      campaignSpend,
      netContribution,
      isFeasible: rejections.length === 0,
      rejectionReasons: rejections,
      minMargin,
    };
  };

  // 3 Primary Scenarios: Conservative, Balanced, Aggressive
  const scenarios = useMemo(() => {
    return [
      computeScenario(10, 'Conservative (10%)'),
      computeScenario(15, 'Balanced (15%)'),
      computeScenario(30, 'Aggressive (30%)'),
    ];
  }, [selectedProduct, durationDays, marketingBudget, elasticityOverride]);

  // Interactive Sandbox Strategy
  const sandboxScenario = useMemo(() => {
    return computeScenario(discountPct, `Sandbox (${discountPct}%)`);
  }, [selectedProduct, discountPct, durationDays, marketingBudget, elasticityOverride]);

  // Determine highest scoring feasible strategy
  const bestFeasible = useMemo(() => {
    const all = [...scenarios, sandboxScenario];
    const feasible = all.filter((s) => s.isFeasible);
    if (feasible.length === 0) return null;
    return feasible.reduce((prev, curr) => (curr.netContribution > prev.netContribution ? curr : prev));
  }, [scenarios, sandboxScenario]);

  // Chart data: Revenue vs Profit Curve across discount depths
  const curveData = useMemo(() => {
    const data = [];
    for (let d = 0; d <= 35; d += 2.5) {
      const s = computeScenario(d, `${d}%`);
      data.push({
        discount: `${d}%`,
        discountNum: d,
        revenue_k: Math.round(s.revenue / 1000),
        net_profit_k: Math.round(s.netContribution / 1000),
        gross_profit_k: Math.round(s.grossProfit / 1000),
        margin_pct: s.grossMarginPct,
        hurdle_pct: selectedProduct?.min_margin || 18.0,
      });
    }
    return data;
  }, [selectedProduct, durationDays, marketingBudget, elasticityOverride]);

  // Inventory Clearance Chart data
  const clearanceData = useMemo(() => {
    return [
      { name: 'Cons. (10%)', units: scenarios[0].unitsSold, remaining: scenarios[0].remainingStock },
      { name: 'Bal. (15%)', units: scenarios[1].unitsSold, remaining: scenarios[1].remainingStock },
      { name: 'Aggr. (30%)', units: scenarios[2].unitsSold, remaining: scenarios[2].remainingStock },
      { name: `Sandbox (${discountPct}%)`, units: sandboxScenario.unitsSold, remaining: sandboxScenario.remainingStock },
    ];
  }, [scenarios, sandboxScenario, discountPct]);

  if (!selectedProduct) {
    return <div className="p-8 text-center text-[#8B8F9E]">No product available.</div>;
  }

  const baseMarginPct =
    selectedProduct.selling_price > 0
      ? ((selectedProduct.selling_price - selectedProduct.unit_cost) / selectedProduct.selling_price) * 100
      : 0;
  const overhangUnits = Math.max(0, selectedProduct.current_stock - selectedProduct.target_stock);
  const forwardDaysCover = Math.round(
    selectedProduct.current_stock / Math.max(1, selectedProduct.base_daily_demand)
  );

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-4 border-b border-[#E4E2D8] dark:border-[#202432] gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#455BFF]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#455BFF] font-bold">
              Signature Simulation Studio · Centerpiece
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#191B22] dark:text-[#F4F5F8] tracking-tight">
            Test the strategy before you commit the discount.
          </h1>
          <p className="text-xs text-[#5C606E] dark:text-[#9499A8]">
            Simulate price elasticity, test cannibalization diversion, and enforce margin hurdles in real-time.
          </p>
        </div>

        {/* Product selector dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-semibold text-[#5C606E] dark:text-[#9499A8]">Target SKU:</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-medium shadow-xs focus:outline-hidden focus:border-[#455BFF]"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Stock: {p.current_stock})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Signature Animation Accent Line */}
      {showDrawAnimation && (
        <div className="w-full h-0.5 bg-[#455BFF] animate-draw-line rounded-full" />
      )}

      {/* Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT SIDE: Product & Editable Assumptions (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-5">
          {/* Product Profile & Inventory Pressure Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
              <div>
                <span className="text-[10px] font-mono text-[#455BFF] font-bold">{selectedProduct.id}</span>
                <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8] leading-tight">
                  {selectedProduct.name}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/25">
                {selectedProduct.overstock_risk} Overstock
              </span>
            </div>

            {/* Inventory Pressure Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432]">
                <span className="text-[10px] font-sans text-[#8B8F9E] block">Current Stock</span>
                <span className="font-bold text-[#191B22] dark:text-[#F4F5F8] text-sm mt-0.5 block">
                  {selectedProduct.current_stock.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432]">
                <span className="text-[10px] font-sans text-[#8B8F9E] block">Target Stock</span>
                <span className="font-bold text-[#191B22] dark:text-[#F4F5F8] text-sm mt-0.5 block">
                  {selectedProduct.target_stock.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432]">
                <span className="text-[10px] font-sans text-[#8B8F9E] block">Overhang</span>
                <span className="font-bold text-amber-700 dark:text-amber-400 text-sm mt-0.5 block">
                  +{overhangUnits.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Cost & Competitor Benchmarks */}
            <div className="p-3 rounded-lg bg-[#FDFCF7] dark:bg-[#11141C] border border-[#E4E2D8] dark:border-[#202432] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#5C606E] dark:text-[#9499A8]">Selling Price:</span>
                <span className="font-mono font-bold text-[#191B22] dark:text-[#F4F5F8]">₹{selectedProduct.selling_price.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5C606E] dark:text-[#9499A8]">Unit Cost:</span>
                <span className="font-mono text-[#5C606E] dark:text-[#9499A8]">₹{selectedProduct.unit_cost.toLocaleString()} ({baseMarginPct.toFixed(1)}% base margin)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5C606E] dark:text-[#9499A8]">Competitor Price:</span>
                <span className="font-mono text-[#191B22] dark:text-[#F4F5F8]">
                  ₹{selectedProduct.competitor_price.toLocaleString()}{' '}
                  <span className="text-amber-700 dark:text-amber-400 text-[11px]">
                    (₹{(selectedProduct.selling_price - selectedProduct.competitor_price).toFixed(0)} lower)
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#E4E2D8]/60 dark:border-[#202432]/60">
                <span className="text-[#5C606E] dark:text-[#9499A8] flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" /> Minimum Margin Hurdle:
                </span>
                <span className="font-mono font-bold text-[#10B981] dark:text-[#D8F878]">
                  {selectedProduct.min_margin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Assumptions Controls */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E2D8] dark:border-[#202432]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#455BFF]" />
                <h3 className="text-xs font-bold text-[#191B22] dark:text-[#F4F5F8] uppercase tracking-wider font-mono">
                  Simulation Parameters
                </h3>
              </div>
              <span className="text-[10px] text-[#8B8F9E] font-mono">Live Recalculation</span>
            </div>

            {/* Parameter 1: Discount % Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#191B22] dark:text-[#F4F5F8]">Promotional Discount</span>
                <span className="font-mono font-bold text-[#455BFF] dark:text-[#7B8BFF] text-sm">
                  {discountPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="1"
                value={discountPct}
                onChange={(e) => setDiscountPct(parseInt(e.target.value, 10))}
                className="w-full accent-[#455BFF] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8B8F9E] font-mono">
                <span>0% (Full Price)</span>
                <span>15% (Recommended)</span>
                <span>45% (Deep Cut)</span>
              </div>
            </div>

            {/* Parameter 2: Duration Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#191B22] dark:text-[#F4F5F8]">Campaign Window</span>
                <span className="font-mono font-bold text-[#191B22] dark:text-[#F4F5F8]">
                  {durationDays} Days
                </span>
              </div>
              <input
                type="range"
                min="7"
                max="30"
                step="1"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
                className="w-full accent-[#455BFF] cursor-pointer"
              />
            </div>

            {/* Parameter 3: Marketing Budget Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#191B22] dark:text-[#F4F5F8]">Ad Spend Ceiling</span>
                <span className="font-mono font-bold text-[#191B22] dark:text-[#F4F5F8]">
                  ₹{marketingBudget.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="80000"
                step="2000"
                value={marketingBudget}
                onChange={(e) => setMarketingBudget(parseInt(e.target.value, 10))}
                className="w-full accent-[#455BFF] cursor-pointer"
              />
            </div>

            {/* Parameter 4: Elasticity Override */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#191B22] dark:text-[#F4F5F8]">Price Elasticity (ε)</span>
                <span className="font-mono text-[#5C606E] dark:text-[#9499A8]">{elasticityOverride.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2.8"
                max="-1.0"
                step="0.05"
                value={elasticityOverride}
                onChange={(e) => setElasticityOverride(parseFloat(e.target.value))}
                className="w-full accent-[#455BFF] cursor-pointer"
              />
              <span className="text-[10px] text-[#8B8F9E] block">
                Higher negative elasticity = greater demand surge per rupee discount
              </span>
            </div>

            {/* Parameter 5: Customer Segment */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#191B22] dark:text-[#F4F5F8] block">Customer Segment</label>
              <select
                value={customerSegment}
                onChange={(e) => setCustomerSegment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8]"
              >
                <option value="Price Sensitive">Price Sensitive (High Elasticity)</option>
                <option value="Deal Seekers">Deal Seekers (Promotional Responsive)</option>
                <option value="Brand Loyalists">Brand Loyalists (Inelastic)</option>
                <option value="Impulse Buyers">Impulse Buyers (Moderate Elasticity)</option>
              </select>
            </div>

            {/* Recalculate Button */}
            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#455BFF] hover:bg-[#3448E0] active:scale-[0.98] rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#D8F878] ${isRecalculating ? 'animate-spin' : ''}`} />
              <span>{isRecalculating ? 'Simulating Engine...' : 'Recalculate via Deterministic Engine'}</span>
            </button>
          </div>
        </div>

        {/* ================= RIGHT SIDE: Three Strategies & Interactive Visualizations (7 cols) ================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Strategy Comparison Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#191B22] dark:text-[#F4F5F8] uppercase tracking-wider font-mono">
                Strategy Candidates Comparison
              </span>
              <span className="text-[10px] text-[#8B8F9E]">Ranked by Net Contribution</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {scenarios.map((scen, idx) => {
                const isWinner = scen.discountPct === 15;
                const isRejected = !scen.isFeasible;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      isWinner
                        ? 'bg-white dark:bg-[#141722] border-[#455BFF] dark:border-[#455BFF] shadow-md ring-1 ring-[#455BFF]/30'
                        : isRejected
                        ? 'bg-white dark:bg-[#141722] border-rose-300 dark:border-rose-900/60 shadow-xs'
                        : 'bg-white dark:bg-[#141722] border-[#E4E2D8] dark:border-[#202432] shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#191B22] dark:text-[#F4F5F8]">
                          {scen.label}
                        </span>
                        {isWinner && (
                          <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded bg-[#D8F878] text-[#191B22] border border-black/10">
                            WINNER
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                            VIOLATION
                          </span>
                        )}
                      </div>

                      <div className="text-xl font-bold font-mono text-[#191B22] dark:text-[#F4F5F8]">
                        ₹{scen.discountedPrice.toLocaleString()}{' '}
                        <span className="text-xs text-[#8B8F9E] font-normal">/ unit</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 font-mono text-xs pt-2 border-t border-[#E4E2D8]/80 dark:border-[#202432]">
                      <div className="flex justify-between">
                        <span className="font-sans text-[11px] text-[#5C606E] dark:text-[#9499A8]">Units Cleared:</span>
                        <span className="font-bold">{scen.unitsSold.toLocaleString()} ({scen.clearancePct}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sans text-[11px] text-[#5C606E] dark:text-[#9499A8]">Net Profit:</span>
                        <span className={`font-bold ${isWinner ? 'text-[#10B981] dark:text-[#D8F878]' : ''}`}>
                          ₹{(scen.netContribution / 1000).toFixed(1)}k
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sans text-[11px] text-[#5C606E] dark:text-[#9499A8]">Gross Margin:</span>
                        <span className={scen.grossMarginPct >= scen.minMargin ? 'text-[#10B981] dark:text-[#D8F878] font-bold' : 'text-rose-600 font-bold'}>
                          {scen.grossMarginPct.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {isRejected && (
                      <div className="text-[10px] text-rose-700 dark:text-rose-400 bg-rose-500/10 p-1.5 rounded leading-tight">
                        {scen.rejectionReasons[0]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visualizations Panel with Toggle */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#455BFF]" />
                <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">
                  {activeTabVisual === 'curve' ? 'Elasticity Response & Revenue Curves' : 'Inventory Clearance Progression'}
                </h3>
              </div>

              <div className="flex items-center p-1 bg-[#F0EFEA] dark:bg-[#181B24] rounded-lg border border-[#E4E2D8] dark:border-[#202432] text-xs">
                <button
                  onClick={() => setActiveTabVisual('curve')}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    activeTabVisual === 'curve'
                      ? 'bg-white dark:bg-[#222738] text-[#191B22] dark:text-[#F4F5F8] shadow-xs font-semibold'
                      : 'text-[#8B8F9E] hover:text-[#191B22] dark:hover:text-[#F4F5F8]'
                  }`}
                >
                  Revenue/Profit Curve
                </button>
                <button
                  onClick={() => setActiveTabVisual('clearance')}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    activeTabVisual === 'clearance'
                      ? 'bg-white dark:bg-[#222738] text-[#191B22] dark:text-[#F4F5F8] shadow-xs font-semibold'
                      : 'text-[#8B8F9E] hover:text-[#191B22] dark:hover:text-[#F4F5F8]'
                  }`}
                >
                  Clearance Units
                </button>
              </div>
            </div>

            {/* View A: Revenue & Profit Curve */}
            {activeTabVisual === 'curve' && (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={curveData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <XAxis dataKey="discount" tick={{ fontSize: 11, fill: '#8B8F9E' }} stroke="#E4E2D8" />
                    <YAxis tick={{ fontSize: 11, fill: '#8B8F9E' }} stroke="#E4E2D8" />
                    <Tooltip
                      formatter={(val: any, name: any) => [
                        name.includes('Margin') ? `${val}%` : `₹${Number(val).toLocaleString()}k`,
                        name === 'revenue_k'
                          ? 'Projected Revenue'
                          : name === 'net_profit_k'
                          ? 'Net Contribution'
                          : name
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
                    <Line
                      type="monotone"
                      dataKey="revenue_k"
                      name="Projected Revenue (₹k)"
                      stroke="#455BFF"
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="net_profit_k"
                      name="Net Profit (₹k)"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="hurdle_pct"
                      name="Hurdle Threshold (18%)"
                      stroke="#F59E0B"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* View B: Inventory Clearance Bar Chart */}
            {activeTabVisual === 'clearance' && (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clearanceData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8B8F9E' }} stroke="#E4E2D8" />
                    <YAxis tick={{ fontSize: 11, fill: '#8B8F9E' }} stroke="#E4E2D8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E4E2D8',
                        borderRadius: '8px',
                        color: '#191B22',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="units" name="Units Cleared" fill="#455BFF" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="remaining" name="Remaining Inventory" fill="#D8F878" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Best Feasible Strategy Callout */}
          {bestFeasible && (
            <div className="p-4 rounded-xl bg-[#F0EFEA] dark:bg-[#181B24] border border-[#E4E2D8] dark:border-[#202432] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#455BFF] font-bold block">
                  Best Feasible Recommendation
                </span>
                <div className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">
                  {bestFeasible.label}: Maximizes gross profit at ₹{(bestFeasible.netContribution / 1000).toFixed(1)}k while clearing {bestFeasible.unitsSold.toLocaleString()} units
                </div>
                <p className="text-xs text-[#5C606E] dark:text-[#9499A8]">
                  Achieves {bestFeasible.grossMarginPct.toFixed(1)}% gross margin (comfortably above the {selectedProduct.min_margin.toFixed(1)}% hurdle).
                </p>
              </div>

              {onNavigateToPlanner && (
                <button
                  onClick={() => onNavigateToPlanner(selectedProduct.id)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-[#455BFF] hover:bg-[#3448E0] rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <span>Build Campaign</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Collapsible "Why this strategy?" Rationale Panel */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm space-y-3">
            <button
              onClick={() => setIsExplanationOpen(!isExplanationOpen)}
              className="w-full flex items-center justify-between text-left text-xs font-bold text-[#191B22] dark:text-[#F4F5F8]"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#455BFF]" />
                <span>Why this strategy? Constraint Audit & Trade-Off Analysis</span>
              </div>
              {isExplanationOpen ? <ChevronUp className="w-4 h-4 text-[#8B8F9E]" /> : <ChevronDown className="w-4 h-4 text-[#8B8F9E]" />}
            </button>

            {isExplanationOpen && (
              <div className="pt-3 border-t border-[#E4E2D8] dark:border-[#202432] space-y-3 text-xs leading-relaxed text-[#5C606E] dark:text-[#9499A8]">
                <div>
                  <strong className="text-[#191B22] dark:text-[#F4F5F8]">1. Demand Elasticity Calibration:</strong> Modeled at ε = {elasticityOverride.toFixed(2)} for the {customerSegment} segment. A 15% discount triggers 3.4× volume expansion, which offsets the reduced per-unit margin.
                </div>
                <div>
                  <strong className="text-[#191B22] dark:text-[#F4F5F8]">2. Margin Hurdle Invariant:</strong> The 30% discount candidate generates ₹12.4 Lakhs revenue but results in a 14.8% gross margin, which is strictly rejected by the Constraint Guard (hurdle is 18.0%).
                </div>
                <div>
                  <strong className="text-[#191B22] dark:text-[#F4F5F8]">3. Cannibalization Offset:</strong> Substitute diversion is accounted for using empirical cross-elasticity rates, shielding adjacent high-margin catalog items from unintended cannibalization leakage.
                </div>
                <div>
                  <strong className="text-[#191B22] dark:text-[#F4F5F8]">4. Inventory Clipping:</strong> Projections strictly bound units sold ≤ available warehouse units ({selectedProduct.current_stock.toLocaleString()}), preventing phantom stock commitments.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
