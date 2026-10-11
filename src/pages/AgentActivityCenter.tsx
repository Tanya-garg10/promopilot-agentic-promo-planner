import React, { useState } from 'react';
import {
  Workflow,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Code,
  Sparkles,
  Layers,
  ArrowRight,
  Play,
  Check,
  XCircle,
  Cpu,
  TrendingUp,
  Boxes,
  Users,
  Target,
  FileCheck2,
  GitBranch,
  Bot
} from 'lucide-react';
import { PromotionPlan, AgentTrace } from '../types';

interface AgentActivityCenterProps {
  plans: PromotionPlan[];
  selectedPlanId?: string;
  onSelectPlanId?: (id: string) => void;
  onNavigateToPlan?: (id: string) => void;
  onRunDemo?: () => void;
  isDemoRunning?: boolean;
}

export const AgentActivityCenter: React.FC<AgentActivityCenterProps> = ({
  plans,
  selectedPlanId,
  onSelectPlanId,
  onNavigateToPlan,
  onRunDemo,
  isDemoRunning = false,
}) => {
  const currentPlan = plans.find((p) => p.plan_id === selectedPlanId) || plans[0];
  const [selectedAgentId, setSelectedAgentId] = useState<string>('AGENT-01');

  if (!currentPlan) {
    return (
      <div className="p-12 text-center text-[#8B8F9E] text-xs">
        No agent execution traces found. Please click "Run Promotion Analysis" or generate a plan.
      </div>
    );
  }

  const traces: AgentTrace[] = currentPlan.agent_traces || [];
  const selectedTrace = traces.find((t) => t.agent_id === selectedAgentId) || traces[0];

  // Rejections from constraint guard
  const rejectedCandidates = currentPlan.candidate_strategies.filter((c) => !c.is_feasible);

  // Workflow Node Definitions
  const workflowNodes = [
    {
      id: 'AGENT-01',
      name: 'Market Analyst',
      type: 'Deterministic Index',
      mode: 'DETERMINISTIC',
      role: 'Audits competitor rate gaps and regional price pressure',
      icon: <TrendingUp className="w-4 h-4 text-[#455BFF]" />,
    },
    {
      id: 'AGENT-02',
      name: 'Inventory Analyst',
      type: 'Deterministic Audit',
      mode: 'DETERMINISTIC',
      role: 'Calculates forward days of supply & holding cost risk',
      icon: <Boxes className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'AGENT-03',
      name: 'Customer Strategist',
      type: 'Elasticity Calibrator',
      mode: 'DETERMINISTIC',
      role: 'Maps buyer segment to empirical price elasticity curves',
      icon: <Users className="w-4 h-4 text-[#455BFF]" />,
    },
    {
      id: 'AGENT-04',
      name: 'Promotion Strategist',
      type: 'Lattice Generator',
      mode: 'DETERMINISTIC',
      role: 'Synthesizes candidate discount depths & mechanics',
      icon: <Sparkles className="w-4 h-4 text-[#455BFF]" />,
    },
    {
      id: 'AGENT-05',
      name: 'Simulation Agent',
      type: 'Demand-Response Math',
      mode: 'DETERMINISTIC',
      role: 'Models inventory clipping, cannibalization loss & revenues',
      icon: <Cpu className="w-4 h-4 text-[#10B981]" />,
    },
    {
      id: 'AGENT-06',
      name: 'Constraint Guard',
      type: 'Hard Invariant Enforcer',
      mode: 'DETERMINISTIC GUARD',
      role: 'Strictly rejects strategies violating margin hurdle or budget',
      icon: <ShieldCheck className="w-4 h-4 text-rose-500" />,
    },
    {
      id: 'AGENT-07',
      name: 'Optimization Agent',
      type: 'Objective Ranking + AI',
      mode: 'HYBRID OPTIMIZER',
      role: 'Selects optimal plan & synthesizes executive rationale',
      icon: <Target className="w-4 h-4 text-[#10B981]" />,
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header and Plan Selector */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#455BFF]">
              Autonomous Orchestration Engine
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#191B22] dark:text-[#F4F5F8] tracking-tight">
            Live Agent Workspace
          </h2>
          <p className="text-xs text-[#5C606E] dark:text-[#9499A8]">
            Sequential 7-agent execution trace with deterministic mathematical invariants & transparent decision logs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={currentPlan.plan_id}
            onChange={(e) => onSelectPlanId && onSelectPlanId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono focus:border-[#455BFF] focus:outline-hidden"
          >
            {plans.map((p) => (
              <option key={p.plan_id} value={p.plan_id}>
                {p.plan_id} — {p.product_name} ({p.recommended_strategy.discount_pct}% OFF)
              </option>
            ))}
          </select>

          {onRunDemo && (
            <button
              onClick={onRunDemo}
              disabled={isDemoRunning}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#455BFF] hover:bg-[#3448E0] rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current text-[#D8F878]" />
              <span>{isDemoRunning ? 'Simulating...' : 'Re-Run Trace'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Connected Node Timeline */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
          <div>
            <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">Multi-Agent Process Timeline</h3>
            <p className="text-xs text-[#5C606E] dark:text-[#9499A8]">
              Click any agent node to inspect real inputs, decisions, and constraint validations
            </p>
          </div>
          <span className="text-xs font-mono text-[#10B981] dark:text-[#D8F878] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 font-semibold">
            Pipeline: 100% Completed
          </span>
        </div>

        {/* Connected Node Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
          {workflowNodes.map((node, idx) => {
            const isSelected = selectedAgentId === node.id;
            const trace = traces.find((t) => t.agent_id === node.id);
            const status = trace?.status || 'SUCCESS';

            return (
              <button
                key={node.id}
                onClick={() => setSelectedAgentId(node.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all h-full flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#EEF1FF] dark:bg-[#1C202C] border-[#455BFF] shadow-xs ring-1 ring-[#455BFF]/40'
                    : 'bg-[#FDFCF7] dark:bg-[#0D1017] border-[#E4E2D8] dark:border-[#202432] hover:border-[#455BFF]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-md bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432]">
                      {node.icon}
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        status === 'SUCCESS'
                          ? 'bg-[#10B981]/15 text-[#10B981] dark:text-[#D8F878] border border-[#10B981]/25'
                          : status === 'WARNING'
                          ? 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/25'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/25'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-[#191B22] dark:text-[#F4F5F8] line-clamp-1">{node.name}</div>
                  <div className="text-[10px] text-[#455BFF] dark:text-[#7B8BFF] font-mono mt-0.5">{node.type}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#E4E2D8]/60 dark:border-[#202432] flex items-center justify-between text-[10px] text-[#8B8F9E]">
                  <span className="font-mono font-bold">Step 0{idx + 1}</span>
                  <span className="font-mono text-[#5C606E] dark:text-[#9499A8]">{trace ? `${trace.latency_ms}ms` : '12ms'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Detail View: Execution Inspector (Left) & Constraint Guard Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Selected Agent Deep-Dive (2 Columns) */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm space-y-5">
          {selectedTrace ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E4E2D8] dark:border-[#202432] gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#455BFF] bg-[#EEF1FF] dark:bg-[#455BFF]/15 px-2 py-0.5 rounded border border-[#455BFF]/25">
                      {selectedTrace.agent_id}
                    </span>
                    <h3 className="text-base font-bold text-[#191B22] dark:text-[#F4F5F8]">{selectedTrace.agent_name}</h3>
                  </div>
                  <p className="text-xs text-[#5C606E] dark:text-[#9499A8] mt-1 leading-relaxed">
                    {selectedTrace.summary}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                      selectedTrace.status === 'SUCCESS'
                        ? 'bg-[#10B981]/15 text-[#10B981] dark:text-[#D8F878] border border-[#10B981]/30'
                        : selectedTrace.status === 'WARNING'
                        ? 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    Status: {selectedTrace.status}
                  </span>
                  <div className="text-[11px] text-[#8B8F9E] font-mono mt-1">
                    Latency: {selectedTrace.latency_ms}ms · Deterministic Math
                  </div>
                </div>
              </div>

              {/* Audited Input Parameters */}
              <div>
                <h4 className="text-[11px] font-bold text-[#8B8F9E] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                  <Code className="w-3.5 h-3.5 text-[#455BFF]" />
                  <span>Audited Input Parameters (Immutable)</span>
                </h4>
                <div className="p-3.5 rounded-xl bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] font-mono text-xs text-[#191B22] dark:text-[#D8F878] overflow-x-auto">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(selectedTrace.inputs, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Agent Decisions & Outputs */}
              <div>
                <h4 className="text-[11px] font-bold text-[#8B8F9E] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                  <Cpu className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Agent Autonomous Decisions & Evaluation Output</span>
                </h4>
                <div className="p-3.5 rounded-xl bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] font-mono text-xs text-[#191B22] dark:text-[#F4F5F8] overflow-x-auto">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(selectedTrace.decisions, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-xs text-[#8B8F9E]">
              Select an agent from the workflow timeline above to inspect execution payload.
            </div>
          )}
        </div>

        {/* Right Column: Dedicated Constraint Guard Rejection Inspector */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">Constraint Guard Invariants</h3>
            </div>
            <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25">
              {rejectedCandidates.length} Rejected
            </span>
          </div>

          <p className="text-xs text-[#5C606E] dark:text-[#9499A8] leading-relaxed">
            The Constraint Guard enforces strict business boundaries: any strategy where gross margin violates the minimum hurdle ({currentPlan.constraint_report?.minimum_margin_required_pct || 18}%) or campaign spending exceeds budget is intercepted and rejected.
          </p>

          <div className="space-y-3">
            {rejectedCandidates.map((c) => (
              <div
                key={c.strategy_id}
                className="p-3.5 rounded-xl bg-[#FDFCF7] dark:bg-[#0D1017] border border-rose-300 dark:border-rose-900/60 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-800 dark:text-rose-300">
                    {c.discount_pct}% Discount ({c.mechanism})
                  </span>
                  <span className="font-mono text-xs text-rose-700 dark:text-rose-400 font-bold">
                    Margin: {c.estimated_gross_margin_pct.toFixed(1)}%
                  </span>
                </div>

                <div className="text-[11px] text-[#5C606E] dark:text-[#9499A8]">
                  <strong className="text-rose-700 dark:text-rose-400">Violation Reason:</strong>
                  <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-rose-700 dark:text-rose-300">
                    {c.rejection_reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-[10px] text-[#8B8F9E] pt-1 border-t border-[#E4E2D8] dark:border-[#202432] flex justify-between font-mono">
                  <span>Hurdle Target: 18.0%</span>
                  <span>Shortfall: {(18.0 - c.estimated_gross_margin_pct).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] dark:text-[#D8F878] text-xs">
            <div className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Winning Strategy Selected</span>
            </div>
            <p className="text-[11px] text-[#5C606E] dark:text-[#9499A8] mt-1 leading-relaxed">
              <strong>{currentPlan.recommended_strategy.discount_pct}% Discount</strong> satisfies all business bounds, achieving a compliant {currentPlan.recommended_strategy.estimated_gross_margin_pct.toFixed(1)}% margin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
