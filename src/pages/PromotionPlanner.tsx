import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  DollarSign,
  Calendar,
  Users,
  MapPin,
  Target,
  ShieldCheck,
  Package,
  Play,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Boxes,
  HelpCircle
} from 'lucide-react';
import { Product, PlanConfigPayload, PromotionPlan } from '../types';

interface PromotionPlannerProps {
  products: Product[];
  initialProductId?: string;
  onGeneratePlan: (payload: PlanConfigPayload) => Promise<PromotionPlan>;
  onRunDemo: () => void;
  isGenerating?: boolean;
}

export const PromotionPlanner: React.FC<PromotionPlannerProps> = ({
  products,
  initialProductId,
  onGeneratePlan,
  onRunDemo,
  isGenerating = false,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId || products[0]?.id || ''
  );

  useEffect(() => {
    if (initialProductId) {
      setSelectedProductId(initialProductId);
    } else if (!selectedProductId && products.length > 0) {
      setSelectedProductId(products[0].id);
    }
  }, [initialProductId, products]);

  const [marketingBudget, setMarketingBudget] = useState<number>(28000);
  const [durationDays, setDurationDays] = useState<number>(14);
  const [customerSegment, setCustomerSegment] = useState<string>('Price Sensitive');
  const [region, setRegion] = useState<string>('Pan-India');
  const [objective, setObjective] = useState<'profit' | 'revenue' | 'clearance'>('profit');
  const [minMarginOverride, setMinMarginOverride] = useState<number>(18.0);
  const [customDiscountsText, setCustomDiscountsText] = useState<string>('10, 15, 20, 30');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  useEffect(() => {
    if (selectedProduct) {
      setMinMarginOverride(selectedProduct.min_margin || 18.0);
    }
  }, [selectedProductId]);

  const handleTriggerGenerate = async () => {
    if (!selectedProduct) return;
    setErrorMsg('');

    let customDiscounts: number[] | undefined = undefined;
    if (customDiscountsText.trim()) {
      customDiscounts = customDiscountsText
        .split(',')
        .map((s) => parseFloat(s.trim()))
        .filter((n) => !isNaN(n) && n >= 0 && n <= 80);
    }

    try {
      await onGeneratePlan({
        product_id: selectedProduct.id,
        marketing_budget: marketingBudget,
        duration_days: durationDays,
        customer_segment: customerSegment,
        region,
        objective,
        min_margin_override: minMarginOverride,
        custom_discounts: customDiscounts,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Plan generation failed');
    }
  };

  if (!selectedProduct) {
    return <div className="p-8 text-center text-[#8B8F9E]">No products available.</div>;
  }

  const currentMarginPct =
    selectedProduct.selling_price > 0
      ? ((selectedProduct.selling_price - selectedProduct.unit_cost) / selectedProduct.selling_price) * 100
      : 0;

  const excessStock = Math.max(0, selectedProduct.current_stock - selectedProduct.target_stock);

  const steps = [
    { number: 1, title: 'Target Product', label: 'Select SKU' },
    { number: 2, title: 'Strategic Goal', label: 'Set Objective' },
    { number: 3, title: 'Parameters', label: 'Budget & Window' },
    { number: 4, title: 'Constraint Check', label: 'Verify Hurdles' },
    { number: 5, title: 'Autonomous Launch', label: 'Generate' },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Step Indicator Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {steps.map((step) => {
            const isActive = currentStep === step.number;
            const isPassed = currentStep > step.number;

            return (
              <button
                key={step.number}
                onClick={() => setCurrentStep(step.number)}
                className={`p-2.5 rounded-lg text-left transition-all border ${
                  isActive
                    ? 'bg-[#EEF1FF] dark:bg-[#1C202C] border-[#455BFF] shadow-xs'
                    : isPassed
                    ? 'bg-[#FDFCF7] dark:bg-[#0D1017] border-[#10B981]/40 text-[#10B981] dark:text-[#D8F878]'
                    : 'bg-[#FDFCF7] dark:bg-[#0D1017] border-[#E4E2D8] dark:border-[#202432] text-[#8B8F9E]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] ${
                      isPassed
                        ? 'bg-[#10B981] text-white'
                        : isActive
                        ? 'bg-[#455BFF] text-white'
                        : 'bg-[#EFEFE8] dark:bg-[#1E2230] text-[#8B8F9E]'
                    }`}
                  >
                    {isPassed ? '✓' : step.number}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B8F9E]">
                    Step 0{step.number}
                  </span>
                </div>
                <div className="text-xs font-bold text-[#191B22] dark:text-[#F4F5F8] mt-1 truncate">{step.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main 2-Column Content: Step Content (Left) & Sticky Planning Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Current Step Content (2 Columns) */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm space-y-5">
          {/* STEP 1: Choose Product */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
                <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">Step 1: Select Target Product SKU</h3>
                <p className="text-xs text-[#5C606E] dark:text-[#9499A8]">
                  Select an SKU requiring demand expansion, promotional repositioning, or overstock clearance
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {products.map((p) => {
                  const isSelected = p.id === selectedProductId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProductId(p.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#EEF1FF] dark:bg-[#1C202C] border-[#455BFF] ring-1 ring-[#455BFF]/40 shadow-xs'
                          : 'bg-[#FDFCF7] dark:bg-[#0D1017] border-[#E4E2D8] dark:border-[#202432] hover:border-[#455BFF]/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono text-[#455BFF] font-semibold">{p.id}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              p.overstock_risk === 'High'
                                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-[#10B981]/15 text-[#10B981] dark:text-[#D8F878] border border-[#10B981]/30'
                            }`}
                          >
                            {p.overstock_risk} Overstock
                          </span>
                        </div>
                        <div className="font-bold text-xs text-[#191B22] dark:text-[#F4F5F8] line-clamp-1">{p.name}</div>
                        <div className="text-[11px] text-[#8B8F9E] mt-0.5">{p.category} · {p.region}</div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#E4E2D8]/60 dark:border-[#202432] flex items-center justify-between text-xs font-mono">
                        <span className="text-[#191B22] dark:text-[#F4F5F8] font-bold">₹{p.selling_price.toLocaleString()}</span>
                        <span className="text-[#5C606E] dark:text-[#9499A8]">Stock: {p.current_stock}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#455BFF] hover:bg-[#3448E0] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Continue to Objective</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Strategic Goal */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
                <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">Step 2: Strategic Optimization Objective</h3>
                <p className="text-xs text-[#5C606E] dark:text-[#9499A8]">
                  Define the mathematical objective function for ranking feasible candidate strategies
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'profit',
                    title: 'Maximize Net Profit',
                    desc: 'Prioritizes total gross profit contribution after campaign marketing costs.',
                    icon: <DollarSign className="w-4 h-4 text-[#10B981]" />,
                  },
                  {
                    id: 'clearance',
                    title: 'Inventory Clearance',
                    desc: 'Maximizes unit velocity to eliminate warehouse carrying costs.',
                    icon: <Boxes className="w-4 h-4 text-amber-500" />,
                  },
                  {
                    id: 'revenue',
                    title: 'Maximize Gross Revenue',
                    desc: 'Optimizes top-line sales volume and retailer gross merchandise value.',
                    icon: <TrendingUp className="w-4 h-4 text-[#455BFF]" />,
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setObjective(opt.id as any)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      objective === opt.id
                        ? 'bg-[#EEF1FF] dark:bg-[#1C202C] border-[#455BFF] ring-1 ring-[#455BFF]/40 shadow-xs'
                        : 'bg-[#FDFCF7] dark:bg-[#0D1017] border-[#E4E2D8] dark:border-[#202432] hover:border-[#455BFF]/30'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] w-fit mb-2">
                      {opt.icon}
                    </div>
                    <div className="font-bold text-xs text-[#191B22] dark:text-[#F4F5F8]">{opt.title}</div>
                    <p className="text-[11px] text-[#5C606E] dark:text-[#9499A8] mt-1 leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-[#5C606E] dark:text-[#9499A8] border border-[#E4E2D8] dark:border-[#202432] rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#455BFF] hover:bg-[#3448E0] rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <span>Continue to Parameters</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Parameters */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
                <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">Step 3: Campaign Parameters & Scope</h3>
                <p className="text-xs text-[#5C606E] dark:text-[#9499A8]">
                  Define marketing budget boundaries, duration window, and target customer audience
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#191B22] dark:text-[#F4F5F8] font-semibold mb-1">
                    Marketing Budget Ceiling (₹)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="5000"
                    max="200000"
                    value={marketingBudget}
                    onChange={(e) => setMarketingBudget(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#191B22] dark:text-[#F4F5F8] font-semibold mb-1">
                    Promotion Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="60"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value, 10) || 14)}
                    className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#191B22] dark:text-[#F4F5F8] font-semibold mb-1">Customer Segment</label>
                  <select
                    value={customerSegment}
                    onChange={(e) => setCustomerSegment(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8]"
                  >
                    <option value="Price Sensitive">Price Sensitive (High Elasticity)</option>
                    <option value="Deal Seekers">Deal Seekers (Promotional Responsive)</option>
                    <option value="Brand Loyalists">Brand Loyalists (Inelastic)</option>
                    <option value="Impulse Buyers">Impulse Buyers (Moderate Elasticity)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#191B22] dark:text-[#F4F5F8] font-semibold mb-1">Geographic Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8]"
                  >
                    <option value="Pan-India">Pan-India</option>
                    <option value="North">North Region</option>
                    <option value="South">South Region</option>
                    <option value="West">West Region</option>
                    <option value="East">East Region</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-[#5C606E] dark:text-[#9499A8] border border-[#E4E2D8] dark:border-[#202432] rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#455BFF] hover:bg-[#3448E0] rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <span>Verify Constraints</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Constraint Check */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
                <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">Step 4: Hard Business Constraints</h3>
                <p className="text-xs text-[#5C606E] dark:text-[#9499A8]">
                  Constraint Guard ensures zero margin leakage: discount proposals yielding below this threshold are rejected
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#191B22] dark:text-[#F4F5F8] font-semibold mb-1">
                    Minimum Gross Margin Hurdle (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="45"
                    value={minMarginOverride}
                    onChange={(e) => setMinMarginOverride(parseFloat(e.target.value) || 18.0)}
                    className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono text-sm"
                  />
                  <p className="text-[10px] text-[#8B8F9E] mt-1">
                    Baseline product hurdle is {selectedProduct.min_margin}%. Overriding ensures stricter or relaxed evaluation.
                  </p>
                </div>

                <div>
                  <label className="block text-[#191B22] dark:text-[#F4F5F8] font-semibold mb-1">
                    Custom Discount Candidates (%)
                  </label>
                  <input
                    type="text"
                    value={customDiscountsText}
                    onChange={(e) => setCustomDiscountsText(e.target.value)}
                    placeholder="10, 15, 20, 30"
                    className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono"
                  />
                  <p className="text-[10px] text-[#8B8F9E] mt-1">
                    Comma-separated list of candidate discount depths to generate and test.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 text-xs font-semibold text-[#5C606E] dark:text-[#9499A8] border border-[#E4E2D8] dark:border-[#202432] rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#455BFF] hover:bg-[#3448E0] rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <span>Ready to Launch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Launch */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
                <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">Step 5: Review Configuration & Launch Multi-Agent Workflow</h3>
                <p className="text-xs text-[#5C606E] dark:text-[#9499A8]">
                  The 7-agent pipeline will evaluate price elasticity, check substitute cannibalization, enforce margin constraints, and rank candidates
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FDFCF7] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5C606E] dark:text-[#9499A8]">Target Product:</span>
                  <span className="font-bold text-[#191B22] dark:text-[#F4F5F8]">{selectedProduct.name} ({selectedProduct.id})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C606E] dark:text-[#9499A8]">Objective:</span>
                  <span className="font-bold text-[#455BFF] capitalize">{objective}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C606E] dark:text-[#9499A8]">Budget Ceiling:</span>
                  <span className="font-bold font-mono">₹{marketingBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C606E] dark:text-[#9499A8]">Duration:</span>
                  <span className="font-bold font-mono">{durationDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C606E] dark:text-[#9499A8]">Margin Hurdle:</span>
                  <span className="font-bold text-[#10B981] font-mono">{minMarginOverride}% Minimum</span>
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 text-xs font-semibold text-[#5C606E] dark:text-[#9499A8] border border-[#E4E2D8] dark:border-[#202432] rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={handleTriggerGenerate}
                  disabled={isGenerating}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#455BFF] hover:bg-[#3448E0] active:scale-[0.98] rounded-lg transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#D8F878]" />
                  <span>{isGenerating ? 'Orchestrating 7 Agents...' : 'Generate Promotion Plan'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Plan Summary Card (1 Column) */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm space-y-4">
          <div className="pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
            <span className="text-[10px] font-mono text-[#455BFF] uppercase tracking-wider block font-bold">
              Target SKU Snapshot
            </span>
            <h4 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8] mt-0.5">{selectedProduct.name}</h4>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="font-sans text-[#5C606E] dark:text-[#9499A8]">Current Stock:</span>
              <span className="font-bold text-[#191B22] dark:text-[#F4F5F8]">{selectedProduct.current_stock}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-[#5C606E] dark:text-[#9499A8]">Target Stock:</span>
              <span>{selectedProduct.target_stock}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-[#5C606E] dark:text-[#9499A8]">Overhang:</span>
              <span className="text-amber-700 dark:text-amber-400 font-bold">+{excessStock} units</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-[#5C606E] dark:text-[#9499A8]">Selling Price:</span>
              <span>₹{selectedProduct.selling_price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-[#5C606E] dark:text-[#9499A8]">Base Margin:</span>
              <span className="text-[#10B981] font-bold">{currentMarginPct.toFixed(1)}%</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#FDFCF7] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] text-xs space-y-1">
            <span className="font-bold text-[#191B22] dark:text-[#F4F5F8] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Deterministic Guarantee</span>
            </span>
            <p className="text-[11px] text-[#5C606E] dark:text-[#9499A8] leading-tight">
              Every plan candidate is checked against margin and budget constraints before final ranking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
