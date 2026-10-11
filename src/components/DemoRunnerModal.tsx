import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Boxes,
  ShieldCheck,
  TrendingUp,
  X,
  Play
} from 'lucide-react';
import { PromotionPlan } from '../types';

interface DemoRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PromotionPlan | null;
  storyline: string[];
  onViewPlan: (planId: string) => void;
  onViewAgents: () => void;
}

export const DemoRunnerModal: React.FC<DemoRunnerModalProps> = ({
  isOpen,
  onClose,
  plan,
  storyline,
  onViewPlan,
  onViewAgents,
}) => {
  if (!isOpen || !plan) return null;

  const strat = plan.recommended_strategy;
  const rejected = plan.candidate_strategies.filter((c) => !c.is_feasible);

  return (
    <div className="fixed inset-0 z-50 bg-[#191B22]/40 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#141722] rounded-2xl border border-[#E4E2D8] dark:border-[#202432] shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#455BFF] flex items-center justify-center text-white font-bold text-xs shadow-xs">
              AI
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">
                Autonomous Earbuds Promotion Optimization Complete
              </h3>
              <p className="text-[11px] text-[#8B8F9E] font-mono">
                Economic Times × Accenture ET AI Hackathon Execution Pipeline
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8B8F9E] hover:text-[#191B22] dark:hover:text-[#F4F5F8] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Storyline Stepper */}
        <div className="space-y-2 bg-[#FDFCF7] dark:bg-[#0D1017] p-4 rounded-xl border border-[#E4E2D8] dark:border-[#202432]">
          <span className="font-bold text-[#191B22] dark:text-[#F4F5F8] text-[11px] uppercase tracking-wider block mb-2 font-mono">
            Multi-Agent Autonomous Execution Trace
          </span>
          <div className="space-y-2.5">
            {storyline.map((step, idx) => {
              const isRejectionStep = step.includes('Constraint Guard Rejection');
              const isOptimizationStep = step.includes('Optimization Decision');
              return (
                <div key={idx} className="flex items-start gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 font-mono ${
                      isRejectionStep
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                        : isOptimizationStep
                        ? 'bg-[#10B981]/15 text-[#10B981] dark:text-[#D8F878] border border-[#10B981]/30 font-bold'
                        : 'bg-[#EEF1FF] dark:bg-[#455BFF]/20 text-[#455BFF] border border-[#455BFF]/30'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`text-xs leading-relaxed ${
                      isRejectionStep
                        ? 'font-medium text-rose-700 dark:text-rose-300'
                        : isOptimizationStep
                        ? 'font-semibold text-[#10B981] dark:text-[#D8F878]'
                        : 'text-[#5C606E] dark:text-[#9499A8]'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Strategy Highlight Card */}
        <div className="p-4 bg-[#EEF1FF]/60 dark:bg-[#0D1017] rounded-xl border border-[#455BFF]/30 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#455BFF] uppercase tracking-wider block">
                Deterministic Winning Strategy
              </span>
              <h4 className="text-base font-bold text-[#191B22] dark:text-[#F4F5F8] mt-0.5">
                {strat.discount_pct}% OFF — {strat.mechanism}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-[#10B981] dark:text-[#D8F878] bg-[#10B981]/10 px-2.5 py-1 rounded-full border border-[#10B981]/25">
                Optimal for Net Profit
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center font-mono">
            <div className="p-2.5 bg-white dark:bg-[#141722] rounded-lg border border-[#E4E2D8] dark:border-[#202432]">
              <span className="text-[10px] text-[#8B8F9E] font-sans block">Effective Price</span>
              <span className="font-bold text-[#191B22] dark:text-[#F4F5F8] text-xs">₹{strat.discounted_price.toLocaleString()}</span>
            </div>
            <div className="p-2.5 bg-white dark:bg-[#141722] rounded-lg border border-[#E4E2D8] dark:border-[#202432]">
              <span className="text-[10px] text-[#8B8F9E] font-sans block">Est. Revenue</span>
              <span className="font-bold text-[#191B22] dark:text-[#F4F5F8] text-xs">₹{(strat.estimated_revenue / 1000).toFixed(0)}k</span>
            </div>
            <div className="p-2.5 bg-white dark:bg-[#141722] rounded-lg border border-[#E4E2D8] dark:border-[#202432]">
              <span className="text-[10px] text-[#10B981] font-sans block font-semibold">Net Profit</span>
              <span className="font-bold text-[#10B981] dark:text-[#D8F878] text-xs">₹{(strat.net_contribution / 1000).toFixed(0)}k</span>
            </div>
            <div className="p-2.5 bg-white dark:bg-[#141722] rounded-lg border border-[#E4E2D8] dark:border-[#202432]">
              <span className="text-[10px] text-[#8B8F9E] font-sans block">Gross Margin</span>
              <span className="font-bold text-[#191B22] dark:text-[#F4F5F8] text-xs">{strat.estimated_gross_margin_pct.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Constraint Rejection Callout */}
        {rejected.length > 0 && (
          <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs">
            <div className="font-semibold flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Constraint Guard Interception:</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#5C606E] dark:text-[#9499A8]">
              {rejected[0].discount_pct}% discount was synthesized by Strategy Agent but strictly rejected by Constraint Guard:{' '}
              <span className="text-rose-700 dark:text-rose-300 font-semibold">{rejected[0].rejection_reasons.join(', ')}</span>. Hard margin invariants were protected.
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E4E2D8] dark:border-[#202432]">
          <button
            onClick={() => {
              onClose();
              onViewAgents();
            }}
            className="text-xs font-semibold text-[#455BFF] hover:underline flex items-center gap-1.5 transition-colors"
          >
            Inspect 7-Agent Workflow Trace →
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#E4E2D8] dark:border-[#202432] text-[#5C606E] dark:text-[#9499A8] hover:text-[#191B22] dark:hover:text-[#F4F5F8] rounded-lg hover:bg-[#F0EFEA] dark:hover:bg-[#1E2230] font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onViewPlan(plan.plan_id);
              }}
              className="px-4 py-2 bg-[#455BFF] hover:bg-[#3448E0] text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <span>View Full Recommendation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
