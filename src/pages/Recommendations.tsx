import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Download,
  Printer,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  DollarSign,
  Calendar,
  Users,
  MapPin,
  Clock,
  ChevronRight,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PromotionPlan } from '../types';

interface RecommendationsProps {
  plans: PromotionPlan[];
  selectedPlanId?: string;
  onSelectPlanId?: (id: string) => void;
  onApprovePlan: (id: string) => Promise<void>;
  onRejectPlan: (id: string) => Promise<void>;
}

export const Recommendations: React.FC<RecommendationsProps> = ({
  plans,
  selectedPlanId,
  onSelectPlanId,
  onApprovePlan,
  onRejectPlan,
}) => {
  const currentPlan = plans.find((p) => p.plan_id === selectedPlanId) || plans[0];
  const [isActionPending, setIsActionPending] = useState(false);

  if (!currentPlan) {
    return (
      <div className="p-12 text-center text-[#8B8F9E] text-xs">
        No promotion plans found. Generate a promotion plan from the Planner to view executive recommendations.
      </div>
    );
  }

  const strat = currentPlan.recommended_strategy;
  const isApproved = currentPlan.status === 'APPROVED';
  const isRejected = currentPlan.status === 'REJECTED';

  const handleApprove = async () => {
    try {
      setIsActionPending(true);
      await onApprovePlan(currentPlan.plan_id);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsActionPending(true);
      await onRejectPlan(currentPlan.plan_id);
    } catch (err: any) {
      alert(`Reject error: ${err.message}`);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentPlan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentPlan.plan_id}_executive_brief.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Plan Selector & Actions Header */}
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">Executive Promotion Recommendation</h2>
            <span
              className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isApproved
                  ? 'bg-[#10B981]/15 text-[#10B981] dark:text-[#D8F878] border border-[#10B981]/30'
                  : isRejected
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                  : 'bg-[#455BFF]/15 text-[#455BFF] border border-[#455BFF]/30'
              }`}
            >
              {currentPlan.status}
            </span>
          </div>
          <p className="text-xs text-[#5C606E] dark:text-[#9499A8] font-mono mt-0.5">
            Plan ID: {currentPlan.plan_id} · Formulated: {new Date(currentPlan.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={currentPlan.plan_id}
            onChange={(e) => onSelectPlanId && onSelectPlanId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono focus:outline-hidden focus:border-[#455BFF]"
          >
            {plans.map((p) => (
              <option key={p.plan_id} value={p.plan_id}>
                {p.plan_id} — {p.product_name} ({p.recommended_strategy.discount_pct}% OFF)
              </option>
            ))}
          </select>

          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 text-xs font-semibold text-[#5C606E] dark:text-[#9499A8] hover:text-[#191B22] dark:hover:text-[#F4F5F8] bg-[#F7F6F0] dark:bg-[#0D1017] hover:bg-[#F0EFEA] dark:hover:bg-[#1E2230] border border-[#E4E2D8] dark:border-[#202432] rounded-lg transition-colors flex items-center gap-1.5"
            title="Download JSON Report"
          >
            <Download className="w-3.5 h-3.5 text-[#455BFF]" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold text-[#5C606E] dark:text-[#9499A8] hover:text-[#191B22] dark:hover:text-[#F4F5F8] bg-[#F7F6F0] dark:bg-[#0D1017] hover:bg-[#F0EFEA] dark:hover:bg-[#1E2230] border border-[#E4E2D8] dark:border-[#202432] rounded-lg transition-colors flex items-center gap-1.5"
            title="Print Executive Brief"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Hero Recommendation Summary Card */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-5 border-b border-[#E4E2D8] dark:border-[#202432] gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#455BFF] bg-[#EEF1FF] dark:bg-[#455BFF]/15 px-2 py-0.5 rounded border border-[#455BFF]/20 inline-block mb-2">
              Optimal Strategy Candidate
            </span>
            <h3 className="text-xl font-bold text-[#191B22] dark:text-[#F4F5F8]">
              {strat.discount_pct}% Discount — {strat.mechanism}
            </h3>
            <p className="text-xs text-[#5C606E] dark:text-[#9499A8] mt-1">
              Target SKU: <strong className="text-[#191B22] dark:text-[#F4F5F8]">{currentPlan.product_name}</strong> ({currentPlan.product_id})
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isApproved && !isRejected && (
              <>
                <button
                  onClick={handleReject}
                  disabled={isActionPending}
                  className="px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors"
                >
                  Reject Plan
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isActionPending || !strat.is_feasible}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#455BFF] hover:bg-[#3448E0] rounded-lg transition-all shadow-xs disabled:opacity-50"
                >
                  Approve Promotion Plan
                </button>
              </>
            )}
            {isApproved && (
              <div className="flex items-center gap-1.5 text-xs text-[#10B981] dark:text-[#D8F878] font-semibold bg-[#10B981]/10 px-3.5 py-1.5 rounded-lg border border-[#10B981]/25 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Plan Approved for Internal Release</span>
              </div>
            )}
            {isRejected && (
              <div className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 font-semibold bg-rose-500/10 px-3.5 py-1.5 rounded-lg border border-rose-500/25">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Plan Rejected</span>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Targeting Metadata Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#FDFCF7] dark:bg-[#0D1017] rounded-lg border border-[#E4E2D8] dark:border-[#202432]">
            <span className="text-[10px] text-[#8B8F9E] block flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3 text-[#455BFF]" /> Duration
            </span>
            <span className="font-semibold text-[#191B22] dark:text-[#F4F5F8] font-mono mt-1 block">
              {currentPlan.duration_days} Days
            </span>
          </div>

          <div className="p-3 bg-[#FDFCF7] dark:bg-[#0D1017] rounded-lg border border-[#E4E2D8] dark:border-[#202432]">
            <span className="text-[10px] text-[#8B8F9E] block flex items-center gap-1 font-mono">
              <Users className="w-3 h-3 text-[#455BFF]" /> Target Segment
            </span>
            <span className="font-semibold text-[#191B22] dark:text-[#F4F5F8] mt-1 block truncate">
              {currentPlan.customer_segment}
            </span>
          </div>

          <div className="p-3 bg-[#FDFCF7] dark:bg-[#0D1017] rounded-lg border border-[#E4E2D8] dark:border-[#202432]">
            <span className="text-[10px] text-[#8B8F9E] block flex items-center gap-1 font-mono">
              <MapPin className="w-3 h-3 text-[#10B981]" /> Geographic Region
            </span>
            <span className="font-semibold text-[#191B22] dark:text-[#F4F5F8] mt-1 block">
              {currentPlan.region}
            </span>
          </div>

          <div className="p-3 bg-[#FDFCF7] dark:bg-[#0D1017] rounded-lg border border-[#E4E2D8] dark:border-[#202432]">
            <span className="text-[10px] text-[#8B8F9E] block flex items-center gap-1 font-mono">
              <DollarSign className="w-3 h-3 text-amber-500" /> Marketing Budget
            </span>
            <span className="font-semibold text-[#191B22] dark:text-[#F4F5F8] font-mono mt-1 block">
              ₹{currentPlan.marketing_budget.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Projected Financial Impact Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3.5 bg-[#FDFCF7] dark:bg-[#0D1017] rounded-xl border border-[#E4E2D8] dark:border-[#202432] hover:border-[#455BFF]/40 transition-colors">
            <span className="text-[10px] text-[#455BFF] block font-semibold uppercase tracking-wider font-mono">Estimated Units Sold</span>
            <span className="text-xl font-bold text-[#191B22] dark:text-[#F4F5F8] font-mono mt-1.5 block tabular-nums">
              {strat.estimated_units_sold.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#10B981] dark:text-[#D8F878] block mt-0.5">
              {strat.clearance_pct}% inventory cleared
            </span>
          </div>

          <div className="p-3.5 bg-[#FDFCF7] dark:bg-[#0D1017] rounded-xl border border-[#E4E2D8] dark:border-[#202432] hover:border-[#191B22]/20 transition-colors">
            <span className="text-[10px] text-[#5C606E] dark:text-[#9499A8] block font-semibold uppercase tracking-wider font-mono">Projected Revenue</span>
            <span className="text-xl font-bold text-[#191B22] dark:text-[#F4F5F8] font-mono mt-1.5 block tabular-nums">
              ₹{(strat.estimated_revenue / 1000).toFixed(1)}k
            </span>
            <span className="text-[10px] text-[#8B8F9E] block mt-0.5 font-mono">
              @ ₹{strat.discounted_price.toLocaleString()} / unit
            </span>
          </div>

          <div className="p-3.5 bg-[#FDFCF7] dark:bg-[#0D1017] rounded-xl border border-[#E4E2D8] dark:border-[#202432] hover:border-[#10B981]/40 transition-colors">
            <span className="text-[10px] text-[#10B981] block font-semibold uppercase tracking-wider font-mono">Net Profit (Contribution)</span>
            <span className="text-xl font-bold text-[#10B981] dark:text-[#D8F878] font-mono mt-1.5 block tabular-nums">
              ₹{(strat.net_contribution / 1000).toFixed(1)}k
            </span>
            <span className="text-[10px] text-[#5C606E] dark:text-[#9499A8] block mt-0.5">
              After ₹{strat.campaign_spending.toLocaleString()} ad spend
            </span>
          </div>

          <div className="p-3.5 bg-[#FDFCF7] dark:bg-[#0D1017] rounded-xl border border-[#E4E2D8] dark:border-[#202432] hover:border-[#455BFF]/40 transition-colors">
            <span className="text-[10px] text-[#455BFF] block font-semibold uppercase tracking-wider font-mono">Gross Margin Hurdle</span>
            <span className="text-xl font-bold text-[#191B22] dark:text-[#F4F5F8] font-mono mt-1.5 block tabular-nums">
              {strat.estimated_gross_margin_pct.toFixed(1)}%
            </span>
            <span className="text-[10px] text-[#10B981] dark:text-[#D8F878] block mt-0.5 font-semibold">
              Hurdle: {currentPlan.constraint_report.minimum_margin_required_pct}% (PASS)
            </span>
          </div>
        </div>

        {/* Strategic Reasoning Narrative */}
        <div className="p-4 bg-[#FDFCF7] dark:bg-[#0D1017] rounded-xl border border-[#E4E2D8] dark:border-[#202432] space-y-2">
          <div className="flex items-center gap-2 text-[#191B22] dark:text-[#F4F5F8] font-bold text-xs">
            <Sparkles className="w-4 h-4 text-[#455BFF]" />
            <span>AI Strategic Rationale & Merchandising Synthesis</span>
          </div>
          <p className="text-xs text-[#5C606E] dark:text-[#9499A8] leading-relaxed">
            {currentPlan.reasoning}
          </p>
        </div>

        {/* Risks & Assumptions */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#191B22] dark:text-[#F4F5F8] uppercase tracking-wider font-mono">
            Risk Assessment & Modeling Assumptions
          </h4>
          <ul className="space-y-1.5 text-xs text-[#5C606E] dark:text-[#9499A8]">
            {currentPlan.risks_and_assumptions.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#455BFF] font-bold">·</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Constraint Validation Report */}
        <div className="p-4 bg-[#FDFCF7] dark:bg-[#0D1017] rounded-xl border border-[#E4E2D8] dark:border-[#202432] space-y-3">
          <div className="flex items-center gap-2 text-[#191B22] dark:text-[#F4F5F8] font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>Constraint Validation Audit Report</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 bg-white dark:bg-[#141722] rounded-lg border border-[#E4E2D8] dark:border-[#202432]">
              <span className="text-[10px] text-[#8B8F9E] block">Gross Margin Rule</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono font-bold text-[#191B22] dark:text-[#F4F5F8]">
                  {currentPlan.constraint_report.achieved_gross_margin_pct.toFixed(1)}% ≥ {currentPlan.constraint_report.minimum_margin_required_pct}%
                </span>
                <span className="text-[10px] font-bold text-[#10B981] dark:text-[#D8F878] bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/20">
                  {currentPlan.constraint_report.margin_status}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-white dark:bg-[#141722] rounded-lg border border-[#E4E2D8] dark:border-[#202432]">
              <span className="text-[10px] text-[#8B8F9E] block">Budget Ceiling</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono font-bold text-[#191B22] dark:text-[#F4F5F8]">
                  ₹{currentPlan.constraint_report.projected_campaign_spend.toLocaleString()} ≤ ₹{currentPlan.constraint_report.allocated_budget.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-[#10B981] dark:text-[#D8F878] bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/20">
                  {currentPlan.constraint_report.budget_status}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-white dark:bg-[#141722] rounded-lg border border-[#E4E2D8] dark:border-[#202432]">
              <span className="text-[10px] text-[#8B8F9E] block">Inventory Bound</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono font-bold text-[#191B22] dark:text-[#F4F5F8]">
                  {currentPlan.constraint_report.projected_units_sold} ≤ {currentPlan.constraint_report.current_inventory} units
                </span>
                <span className="text-[10px] font-bold text-[#10B981] dark:text-[#D8F878] bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/20">
                  {currentPlan.constraint_report.inventory_status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <p className="text-[11px] text-[#8B8F9E] italic">
          * Approving this plan records internal stakeholder authorization in PromoPilot AI. It does not initiate external ad spend or modify POS systems.
        </p>
      </div>
    </div>
  );
};
