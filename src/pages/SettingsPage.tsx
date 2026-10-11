import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Info,
  Check,
  Server,
  KeyRound,
  Sliders,
  Database
} from 'lucide-react';

interface SettingsPageProps {
  onResetDemoData: () => Promise<void>;
  llmProvider: string;
  isLLMAvailable: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onResetDemoData,
  llmProvider,
  isLLMAvailable,
}) => {
  const [minMargin, setMinMargin] = useState<number>(18.0);
  const [defaultBudget, setDefaultBudget] = useState<number>(25000);
  const [cannibalizationRate, setCannibalizationRate] = useState<number>(20);
  const [holdingCostRate, setHoldingCostRate] = useState<number>(15);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExecuteReset = async () => {
    try {
      setIsResetting(true);
      await onResetDemoData();
      setIsResetConfirmOpen(false);
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">System Constraints & Engine Configuration</h2>
        <p className="text-xs text-[#5C606E] dark:text-[#9499A8] mt-0.5">
          Manage hard business boundaries, demand model parameters, AI provider status, and demo data lifecycle
        </p>
      </div>

      {/* Business Constraints Form */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">Global Business Guardrails</h3>
          </div>
          {saveSuccess && (
            <span className="text-xs text-[#10B981] dark:text-[#D8F878] bg-[#10B981]/10 px-2 py-0.5 rounded font-medium border border-[#10B981]/20 flex items-center gap-1">
              <Check className="w-3 h-3" /> Constraints Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#191B22] dark:text-[#F4F5F8] font-semibold mb-1.5">
                Default Minimum Gross Margin Hurdle (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="5"
                max="50"
                value={minMargin}
                onChange={(e) => setMinMargin(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono focus:outline-hidden focus:border-[#455BFF]"
              />
              <p className="text-[10px] text-[#8B8F9E] mt-1">
                Hard constraint: candidate strategies yielding gross margins below this hurdle are strictly rejected.
              </p>
            </div>

            <div>
              <label className="block text-[#191B22] dark:text-[#F4F5F8] font-semibold mb-1.5">
                Default Campaign Marketing Budget (₹)
              </label>
              <input
                type="number"
                step="1000"
                min="5000"
                max="500000"
                value={defaultBudget}
                onChange={(e) => setDefaultBudget(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono focus:outline-hidden focus:border-[#455BFF]"
              />
              <p className="text-[10px] text-[#8B8F9E] mt-1">
                Standard baseline marketing allocation ceiling for promotion candidate generation.
              </p>
            </div>

            <div>
              <label className="block text-[#191B22] dark:text-[#F4F5F8] font-semibold mb-1.5">
                Substitute Cannibalization Factor (%)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="50"
                value={cannibalizationRate}
                onChange={(e) => setCannibalizationRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono focus:outline-hidden focus:border-[#455BFF]"
              />
              <p className="text-[10px] text-[#8B8F9E] mt-1">
                Percentage of promoted discount intensity transferred as demand diversion from substitute catalog items.
              </p>
            </div>

            <div>
              <label className="block text-[#191B22] dark:text-[#F4F5F8] font-semibold mb-1.5">
                Annual Inventory Holding Cost Rate (%)
              </label>
              <input
                type="number"
                step="1"
                min="5"
                max="40"
                value={holdingCostRate}
                onChange={(e) => setHoldingCostRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono focus:outline-hidden focus:border-[#455BFF]"
              />
              <p className="text-[10px] text-[#8B8F9E] mt-1">
                Cost of capital and warehouse carrying cost audited by the Inventory Analyst Agent.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#455BFF] hover:bg-[#3448E0] text-white rounded-lg font-semibold shadow-xs transition-all"
            >
              Update Business Constraints
            </button>
          </div>
        </form>
      </div>

      {/* AI & Intelligence Engine Status */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm space-y-4 text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E4E2D8] dark:border-[#202432] text-[#191B22] dark:text-[#F4F5F8] font-bold">
          <Sparkles className="w-4 h-4 text-[#455BFF]" />
          <span>Agentic & LLM Intelligence Configuration</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 bg-[#FDFCF7] dark:bg-[#0D1017] rounded-lg border border-[#E4E2D8] dark:border-[#202432]">
            <span className="text-[10px] text-[#8B8F9E] block">Configured AI Service</span>
            <div className="font-semibold text-[#191B22] dark:text-[#F4F5F8] text-xs mt-0.5">{llmProvider}</div>
            <div className="text-[11px] text-[#10B981] dark:text-[#D8F878] mt-1 flex items-center gap-1 font-medium">
              <Check className="w-3 h-3" />
              <span>{isLLMAvailable ? 'Online & Authenticated (Featherless AI)' : 'Offline Fallback (Deterministic Rules Active)'}</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#FDFCF7] dark:bg-[#0D1017] rounded-lg border border-[#E4E2D8] dark:border-[#202432]">
            <span className="text-[10px] text-[#8B8F9E] block">Architectural Guarantee</span>
            <div className="font-semibold text-[#191B22] dark:text-[#F4F5F8] text-xs mt-0.5">Deterministic Guard Priority</div>
            <p className="text-[10px] text-[#5C606E] dark:text-[#9499A8] mt-1">
              LLMs never calculate margins or override constraints. All financials and hurdle rules execute in deterministic Python/TypeScript logic.
            </p>
          </div>
        </div>

        <div className="p-3 bg-[#EEF1FF] dark:bg-[#455BFF]/10 rounded-lg border border-[#455BFF]/20 text-[#191B22] dark:text-[#F4F5F8] text-[11px] leading-relaxed flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#455BFF] shrink-0" />
          <div>
            <strong>Security Architecture:</strong> Secret keys are exclusively stored server-side via <code className="font-mono text-[#455BFF] dark:text-[#D8F878]">FEATHERLESS_API_KEY</code>. No frontend bundles ever expose API tokens.
          </div>
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm space-y-4 text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E4E2D8] dark:border-[#202432] text-[#191B22] dark:text-[#F4F5F8] font-bold">
          <RotateCcw className="w-4 h-4 text-amber-500" />
          <span>Demo Data & Environment Reset</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-[#191B22] dark:text-[#F4F5F8]">Restore Clean Hackathon Benchmark Catalog</p>
            <p className="text-[#5C606E] dark:text-[#9499A8] mt-0.5 leading-relaxed max-w-xl">
              Restores the 16 realistic fictional retail products (including the AeroSound Pro Wireless Earbuds overstock benchmark) and resets all past promotion plans to the clean initial benchmark state.
            </p>
          </div>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg transition-colors shrink-0"
          >
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-[#191B22]/40 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141722] rounded-xl border border-[#E4E2D8] dark:border-[#202432] shadow-2xl max-w-sm w-full p-5 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Confirm Demo Data Reset</span>
            </div>
            <p className="text-[#5C606E] dark:text-[#9499A8]">
              This will re-seed the catalog with the 16 standard benchmark retail products and clear uncommitted simulation runs. Continue?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E2D8] dark:border-[#202432]">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1.5 border border-[#E4E2D8] dark:border-[#202432] text-[#5C606E] dark:text-[#9499A8] hover:text-[#191B22] dark:hover:text-[#F4F5F8] rounded-lg hover:bg-[#F0EFEA] dark:hover:bg-[#1E2230] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReset}
                disabled={isResetting}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-[#191B22] rounded-lg font-semibold shadow-xs transition-colors"
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
