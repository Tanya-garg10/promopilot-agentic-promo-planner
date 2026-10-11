import React, { useState } from 'react';
import {
  History,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpDown,
  PlusCircle,
  TrendingUp,
  X,
  FileSpreadsheet,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';
import { PromotionPlan, SimulationRun } from '../types';

interface AnalyticsHistoryProps {
  plans: PromotionPlan[];
  simulations: SimulationRun[];
  onSubmitActuals: (planId: string, actuals: { actual_units_sold: number; actual_revenue: number; actual_gross_profit: number }) => Promise<void>;
  onExportReport: () => Promise<void>;
}

export const AnalyticsHistory: React.FC<AnalyticsHistoryProps> = ({
  plans,
  simulations,
  onSubmitActuals,
  onExportReport,
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'actuals' | 'simulations' | 'rejections'>('plans');
  const [selectedPlanForActuals, setSelectedPlanForActuals] = useState<PromotionPlan | null>(null);
  const [actualUnits, setActualUnits] = useState<number>(0);
  const [actualRevenue, setActualRevenue] = useState<number>(0);
  const [actualProfit, setActualProfit] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Plans with actual data recorded
  const plansWithActuals = plans.filter((p) => p.actual_units_sold !== null && p.actual_units_sold !== undefined);

  // Aggregated rejected strategies across all plans
  const allRejectedStrategies = plans.flatMap((p) =>
    p.candidate_strategies
      .filter((c) => !c.is_feasible)
      .map((c) => ({
        planId: p.plan_id,
        productName: p.product_name,
        strategy: c,
        createdAt: p.created_at,
      }))
  );

  const handleOpenActualsModal = (plan: PromotionPlan) => {
    setSelectedPlanForActuals(plan);
    setActualUnits(plan.actual_units_sold || plan.recommended_strategy.estimated_units_sold);
    setActualRevenue(plan.actual_revenue || plan.recommended_strategy.estimated_revenue);
    setActualProfit(plan.actual_gross_profit || plan.recommended_strategy.estimated_gross_profit);
  };

  const handleSaveActuals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForActuals) return;
    try {
      setIsSubmitting(true);
      await onSubmitActuals(selectedPlanForActuals.plan_id, {
        actual_units_sold: actualUnits,
        actual_revenue: actualRevenue,
        actual_gross_profit: actualProfit,
      });
      setSelectedPlanForActuals(null);
    } catch (err: any) {
      alert(`Failed to save actuals: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header and Export Controls */}
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">Analytics, History & Performance Tracking</h2>
          <p className="text-xs text-[#5C606E] dark:text-[#9499A8] mt-0.5">
            Audit historical promotion plans, simulation logs, rejected candidates, and campaign actuals
          </p>
        </div>

        <button
          onClick={onExportReport}
          className="px-3.5 py-2 text-xs font-semibold text-[#191B22] dark:text-[#F4F5F8] bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] hover:bg-[#F0EFEA] dark:hover:bg-[#1E2230] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-[#455BFF]" />
          <span>Export Full Audit Report</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E2D8] dark:border-[#202432] pb-2 overflow-x-auto">
        {[
          { id: 'plans', label: `Promotion Plans (${plans.length})` },
          { id: 'actuals', label: `Estimated vs Actuals (${plansWithActuals.length})` },
          { id: 'simulations', label: `Simulation Logs (${simulations.length})` },
          { id: 'rejections', label: `Rejected Strategies (${allRejectedStrategies.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-[#455BFF] text-white shadow-xs'
                : 'text-[#5C606E] dark:text-[#9499A8] hover:bg-[#F0EFEA] dark:hover:bg-[#1C202C] hover:text-[#191B22] dark:hover:text-[#F4F5F8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Historical Promotion Plans */}
      {activeTab === 'plans' && (
        <div className="rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FDFCF7] dark:bg-[#11141C] border-b border-[#E4E2D8] dark:border-[#202432] text-[#8B8F9E] font-semibold select-none">
                  <th className="py-3 px-4">Plan ID</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Strategy</th>
                  <th className="py-3 px-4 text-right">Est. Units</th>
                  <th className="py-3 px-4 text-right">Est. Revenue</th>
                  <th className="py-3 px-4 text-right">Net Profit</th>
                  <th className="py-3 px-4 text-right">Gross Margin</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2D8]/70 dark:divide-[#202432] font-mono">
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#8B8F9E] font-sans">
                      No plans generated yet.
                    </td>
                  </tr>
                ) : (
                  plans.map((p) => (
                    <tr key={p.plan_id} className="hover:bg-[#F7F6F0]/70 dark:hover:bg-[#181B24]/70 transition-colors">
                      <td className="py-3 px-4 text-[#455BFF] font-bold">{p.plan_id}</td>
                      <td className="py-3 px-4 font-sans text-[#191B22] dark:text-[#F4F5F8] font-bold">
                        {p.product_name}
                      </td>
                      <td className="py-3 px-4 text-[#5C606E] dark:text-[#9499A8]">
                        {p.recommended_strategy.discount_pct}% Off ({p.recommended_strategy.mechanism})
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-[#191B22] dark:text-[#F4F5F8]">
                        {p.recommended_strategy.estimated_units_sold.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-[#191B22] dark:text-[#F4F5F8] font-bold">
                        ₹{p.recommended_strategy.estimated_revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-[#10B981] dark:text-[#D8F878] font-bold">
                        ₹{p.recommended_strategy.net_contribution.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-[#5C606E] dark:text-[#9499A8]">
                        {p.recommended_strategy.estimated_gross_margin_pct.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase font-mono ${
                            p.status === 'APPROVED'
                              ? 'bg-[#10B981]/15 text-[#10B981] dark:text-[#D8F878] border border-[#10B981]/30'
                              : p.status === 'REJECTED'
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                              : 'bg-[#455BFF]/15 text-[#455BFF] border border-[#455BFF]/30'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        {p.status === 'APPROVED' && (
                          <button
                            onClick={() => handleOpenActualsModal(p)}
                            className="text-xs text-[#455BFF] hover:underline font-semibold transition-colors"
                          >
                            {p.actual_units_sold !== null ? 'Edit Actuals' : '+ Enter Actuals'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Estimated vs Actuals Tracker */}
      {activeTab === 'actuals' && (
        <div className="rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">Campaign Retrospective: Estimated vs Actuals</h3>
            <p className="text-xs text-[#5C606E] dark:text-[#9499A8] mt-0.5">
              Compare deterministic agent projections against post-campaign ground-truth performance
            </p>
          </div>

          {plansWithActuals.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8B8F9E] bg-[#FDFCF7] dark:bg-[#0D1017] rounded-lg border border-[#E4E2D8] dark:border-[#202432]">
              No campaign actuals entered yet. Approve a plan and click "Enter Actuals" to log post-campaign performance.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FDFCF7] dark:bg-[#11141C] border-b border-[#E4E2D8] dark:border-[#202432] text-[#8B8F9E] font-semibold select-none">
                    <th className="py-3 px-4">Plan & Product</th>
                    <th className="py-3 px-4 text-right">Est. Units</th>
                    <th className="py-3 px-4 text-right">Actual Units</th>
                    <th className="py-3 px-4 text-right">Units Variance</th>
                    <th className="py-3 px-4 text-right">Est. Revenue</th>
                    <th className="py-3 px-4 text-right">Actual Revenue</th>
                    <th className="py-3 px-4 text-right">Revenue Variance</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2D8]/70 dark:divide-[#202432] font-mono">
                  {plansWithActuals.map((p) => {
                    const estUnits = p.recommended_strategy.estimated_units_sold;
                    const actUnits = p.actual_units_sold || 0;
                    const unitVar = estUnits > 0 ? ((actUnits - estUnits) / estUnits) * 100 : 0;

                    const estRev = p.recommended_strategy.estimated_revenue;
                    const actRev = p.actual_revenue || 0;
                    const revVar = estRev > 0 ? ((actRev - estRev) / estRev) * 100 : 0;

                    return (
                      <tr key={p.plan_id} className="hover:bg-[#F7F6F0]/70 dark:hover:bg-[#181B24]/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-sans font-bold text-[#191B22] dark:text-[#F4F5F8] block">{p.product_name}</span>
                          <span className="text-[11px] text-[#455BFF] font-mono">{p.plan_id}</span>
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#5C606E] dark:text-[#9499A8]">
                          {estUnits.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#191B22] dark:text-[#F4F5F8] font-bold">
                          {actUnits.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums font-bold">
                          <span className={unitVar >= 0 ? 'text-[#10B981]' : 'text-amber-600'}>
                            {unitVar >= 0 ? `+${unitVar.toFixed(1)}%` : `${unitVar.toFixed(1)}%`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#5C606E] dark:text-[#9499A8]">
                          ₹{estRev.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#191B22] dark:text-[#F4F5F8] font-bold">
                          ₹{actRev.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums font-bold">
                          <span className={revVar >= 0 ? 'text-[#10B981]' : 'text-amber-600'}>
                            {revVar >= 0 ? `+${revVar.toFixed(1)}%` : `${revVar.toFixed(1)}%`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-sans">
                          <button
                            onClick={() => handleOpenActualsModal(p)}
                            className="text-xs text-[#455BFF] hover:underline font-semibold transition-colors"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Simulation Logs */}
      {activeTab === 'simulations' && (
        <div className="rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FDFCF7] dark:bg-[#11141C] border-b border-[#E4E2D8] dark:border-[#202432] text-[#8B8F9E] font-semibold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Est. Revenue</th>
                  <th className="py-3 px-4 text-right">Est. Profit</th>
                  <th className="py-3 px-4 text-right">Margin %</th>
                  <th className="py-3 px-4 text-center">Feasible</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2D8]/70 dark:divide-[#202432] font-mono">
                {simulations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#8B8F9E] font-sans">
                      No standalone simulations logged yet. Use the Simulation Studio.
                    </td>
                  </tr>
                ) : (
                  simulations.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F7F6F0]/70 dark:hover:bg-[#181B24]/70 transition-colors">
                      <td className="py-3 px-4 text-[#8B8F9E] text-[11px]">
                        {new Date(s.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 font-sans text-[#191B22] dark:text-[#F4F5F8]">{s.product_name}</td>
                      <td className="py-3 px-4 font-bold text-[#455BFF]">{s.discount_pct}%</td>
                      <td className="py-3 px-4 text-[#5C606E] dark:text-[#9499A8]">{s.duration_days}d</td>
                      <td className="py-3 px-4 text-right text-[#191B22] dark:text-[#F4F5F8]">₹{s.estimated_revenue.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-[#10B981] dark:text-[#D8F878]">₹{s.estimated_profit.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-[#191B22] dark:text-[#F4F5F8]">{s.estimated_margin_pct.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-center font-sans">
                        {s.is_feasible ? (
                          <span className="text-[10px] text-[#10B981] dark:text-[#D8F878] bg-[#10B981]/15 px-2 py-0.5 rounded font-semibold border border-[#10B981]/30 font-mono">
                            PASS
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-700 dark:text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded font-semibold border border-rose-500/30 font-mono">
                            FAIL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Rejected Strategies Audit */}
      {activeTab === 'rejections' && (
        <div className="rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">Rejected Strategies & Constraint Violations</h3>
            <p className="text-xs text-[#5C606E] dark:text-[#9499A8] mt-0.5">
              Audit log of candidate discount strategies rejected deterministically by the Constraint Guard
            </p>
          </div>

          {allRejectedStrategies.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8B8F9E] bg-[#FDFCF7] dark:bg-[#0D1017] rounded-lg border border-[#E4E2D8] dark:border-[#202432]">
              No rejected candidate strategies recorded across plans.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FDFCF7] dark:bg-[#11141C] border-b border-[#E4E2D8] dark:border-[#202432] text-[#8B8F9E] font-semibold select-none">
                    <th className="py-3 px-4">Origin Plan</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Candidate Discount</th>
                    <th className="py-3 px-4 text-right">Resulting Margin</th>
                    <th className="py-3 px-4">Violation Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2D8]/70 dark:divide-[#202432] font-mono">
                  {allRejectedStrategies.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F7F6F0]/70 dark:hover:bg-[#181B24]/70 transition-colors">
                      <td className="py-3 px-4 text-[#455BFF] font-semibold">{item.planId}</td>
                      <td className="py-3 px-4 font-sans text-[#191B22] dark:text-[#F4F5F8] font-medium">
                        {item.productName}
                      </td>
                      <td className="py-3 px-4 font-bold text-rose-700 dark:text-rose-400">
                        {item.strategy.discount_pct}% Off ({item.strategy.mechanism})
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-700 dark:text-rose-400">
                        {item.strategy.estimated_gross_margin_pct.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 font-sans text-rose-700 dark:text-rose-300">
                        <ul className="list-disc list-inside space-y-0.5">
                          {item.strategy.rejection_reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Enter Actuals Modal */}
      {selectedPlanForActuals && (
        <div className="fixed inset-0 z-50 bg-[#191B22]/40 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141722] rounded-xl border border-[#E4E2D8] dark:border-[#202432] shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
              <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">
                Log Actual Campaign Results
              </h3>
              <button onClick={() => setSelectedPlanForActuals(null)} className="text-[#8B8F9E] hover:text-[#191B22] dark:hover:text-[#F4F5F8] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[#5C606E] dark:text-[#9499A8]">
              Enter post-campaign performance data for plan <strong className="font-mono text-[#455BFF]">{selectedPlanForActuals.plan_id}</strong> ({selectedPlanForActuals.product_name}).
            </p>

            <form onSubmit={handleSaveActuals} className="space-y-3">
              <div>
                <label className="block text-[#191B22] dark:text-[#F4F5F8] font-medium mb-1">Actual Units Sold</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={actualUnits}
                  onChange={(e) => setActualUnits(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono focus:outline-hidden focus:border-[#455BFF]"
                />
              </div>

              <div>
                <label className="block text-[#191B22] dark:text-[#F4F5F8] font-medium mb-1">Actual Revenue Realized (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min={0}
                  value={actualRevenue}
                  onChange={(e) => setActualRevenue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono focus:outline-hidden focus:border-[#455BFF]"
                />
              </div>

              <div>
                <label className="block text-[#191B22] dark:text-[#F4F5F8] font-medium mb-1">Actual Gross Profit (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min={0}
                  value={actualProfit}
                  onChange={(e) => setActualProfit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono focus:outline-hidden focus:border-[#455BFF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E2D8] dark:border-[#202432]">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForActuals(null)}
                  className="px-4 py-2 border border-[#E4E2D8] dark:border-[#202432] text-[#5C606E] dark:text-[#9499A8] hover:text-[#191B22] dark:hover:text-[#F4F5F8] rounded-lg hover:bg-[#F0EFEA] dark:hover:bg-[#1E2230] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#455BFF] hover:bg-[#3448E0] text-white rounded-lg font-semibold shadow-xs transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Record Actuals'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
