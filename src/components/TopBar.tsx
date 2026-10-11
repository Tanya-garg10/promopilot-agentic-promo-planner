import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Search,
  Bell,
  Play,
  ChevronRight,
  User,
  AlertTriangle,
  X,
  Command,
  Sun,
  Moon
} from 'lucide-react';
import { NavPage } from './Sidebar';

interface TopBarProps {
  activePage: NavPage;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onRunDemo?: () => void;
  onNewPlanClick?: () => void;
  llmStatus?: string;
  overstockCount?: number;
  onOpenCommandPalette?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

const PAGE_NAMES: Record<NavPage, { section: string; title: string }> = {
  overview: { section: 'Overview', title: 'Intelligence Home' },
  simulation: { section: 'Centerpiece', title: 'Signature Simulation Studio' },
  products: { section: 'Catalog', title: 'Products & Inventory' },
  planner: { section: 'Strategy', title: 'Promotion Planner' },
  agents: { section: 'Autonomous', title: 'Live Agent Workspace' },
  recommendations: { section: 'Decisions', title: 'Promotion Plans' },
  history: { section: 'Audit', title: 'Analytics & History' },
  settings: { section: 'Invariants', title: 'Constraints & System' },
};

export const TopBar: React.FC<TopBarProps> = ({
  activePage,
  onRefresh,
  isRefreshing = false,
  onRunDemo,
  onNewPlanClick,
  llmStatus,
  overstockCount = 0,
  onOpenCommandPalette,
  isDarkMode = false,
  onToggleTheme,
}) => {
  const current = PAGE_NAMES[activePage] || PAGE_NAMES.overview;
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="h-16 px-6 bg-[#FDFCF7]/90 dark:bg-[#11141C]/90 backdrop-blur-md border-b border-[#E4E2D8] dark:border-[#202432] flex items-center justify-between gap-6 shrink-0 select-none z-20">
      {/* Zone 1: Breadcrumbs & Current Workspace */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-[10px] font-bold text-[#8B8F9E] tracking-wider uppercase font-mono">
          Retail Intelligence
        </span>
        <ChevronRight className="w-3 h-3 text-[#8B8F9E]" />
        <span className="text-xs text-[#5C606E] dark:text-[#9499A8] font-medium hidden sm:inline">
          {current.section}
        </span>
        <ChevronRight className="w-3 h-3 text-[#8B8F9E] hidden sm:inline" />
        <h2 className="text-xs sm:text-sm font-bold text-[#191B22] dark:text-[#F4F5F8] tracking-tight truncate">
          {current.title}
        </h2>
      </div>

      {/* Zone 2: Search interface / Command Palette Trigger */}
      <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-auto">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs bg-[#F0EFEA] dark:bg-[#181B24] hover:bg-[#EAE8E0] dark:hover:bg-[#1E2230] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#5C606E] dark:text-[#9499A8] transition-all group"
        >
          <span className="flex items-center gap-2.5 truncate">
            <Search className="w-3.5 h-3.5 text-[#8B8F9E] group-hover:text-[#455BFF] transition-colors" />
            <span className="truncate">Ask PromoPilot or search actions...</span>
          </span>
          <kbd className="text-[10px] font-mono text-[#8B8F9E] bg-white dark:bg-[#11141C] px-1.5 py-0.5 rounded border border-[#E4E2D8] dark:border-[#202432] shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Badges, Notifications, Refresh & Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Environment Badge: Demo Data */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Demo Data</span>
        </div>

        {/* AI & Constraint Status */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#455BFF]/10 dark:bg-[#455BFF]/15 border border-[#455BFF]/25 text-[#455BFF] dark:text-[#7B8BFF] text-[11px] font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Deterministic Guard</span>
        </div>

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-2 text-[#5C606E] dark:text-[#9499A8] hover:text-[#191B22] dark:hover:text-[#F4F5F8] hover:bg-[#F0EFEA] dark:hover:bg-[#181B24] rounded-lg transition-colors border border-[#E4E2D8] dark:border-[#202432]"
            title={isDarkMode ? 'Switch to Ivory Editorial light mode' : 'Switch to Dark Command Center'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#455BFF]" />}
          </button>
        )}

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-[#5C606E] dark:text-[#9499A8] hover:text-[#191B22] dark:hover:text-[#F4F5F8] hover:bg-[#F0EFEA] dark:hover:bg-[#181B24] rounded-lg transition-colors border border-[#E4E2D8] dark:border-[#202432] relative"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {overstockCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>

          {/* Notifications Drawer Popup */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] rounded-xl shadow-2xl p-4 z-50 text-xs text-[#191B22] dark:text-[#F4F5F8] animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E2D8] dark:border-[#202432]">
                <span className="font-bold">System Alerts & Notices</span>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-[#8B8F9E] hover:text-[#191B22] dark:hover:text-[#F4F5F8]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px]">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Overstock Hurdle Triggered</span>
                  </div>
                  <p className="text-[#5C606E] dark:text-[#9499A8] mt-0.5">
                    {overstockCount} catalog SKUs exceed target forward inventory levels.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#455BFF]/10 border border-[#455BFF]/20 text-[#455BFF] dark:text-[#7B8BFF] text-[11px]">
                  <div className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Hurdle Invariant Enforced</span>
                  </div>
                  <p className="text-[#5C606E] dark:text-[#9499A8] mt-0.5">
                    Constraint guard strictly rejects discount candidates yielding gross margins &lt; 18%.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-[#5C606E] dark:text-[#9499A8] hover:text-[#191B22] dark:hover:text-[#F4F5F8] hover:bg-[#F0EFEA] dark:hover:bg-[#181B24] rounded-lg transition-colors border border-[#E4E2D8] dark:border-[#202432]"
            title="Refresh application data"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#455BFF]' : ''}`} />
          </button>
        )}

        {/* User profile avatar */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 bg-[#F0EFEA] dark:bg-[#181B24] hover:bg-[#EAE8E0] dark:hover:bg-[#1E2230] border border-[#E4E2D8] dark:border-[#202432] rounded-lg transition-colors text-xs text-[#191B22] dark:text-[#F4F5F8]"
            title="User Profile"
          >
            <span className="hidden sm:inline font-semibold text-[11px] text-[#5C606E] dark:text-[#9499A8]">Retail Lead</span>
            <div className="w-6 h-6 rounded-md bg-[#455BFF] text-white font-bold text-[10px] flex items-center justify-center">
              RI
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] rounded-xl shadow-2xl p-3 z-50 text-xs text-[#191B22] dark:text-[#F4F5F8] animate-in fade-in zoom-in-95 space-y-1">
              <div className="p-2 border-b border-[#E4E2D8] dark:border-[#202432]">
                <div className="font-bold text-[#191B22] dark:text-[#F4F5F8]">Chief Merchandiser</div>
                <div className="text-[10px] text-[#8B8F9E] truncate">merchandise@retailintel.ai</div>
              </div>
              <div className="pt-1 text-[11px] text-[#5C606E] dark:text-[#9499A8]">
                <div className="px-2 py-1.5 hover:bg-[#F0EFEA] dark:hover:bg-[#181B24] rounded-md text-[#191B22] dark:text-[#F4F5F8] cursor-pointer">
                  Workspace: Enterprise Core
                </div>
                <div className="px-2 py-1.5 hover:bg-[#F0EFEA] dark:hover:bg-[#181B24] rounded-md text-[#191B22] dark:text-[#F4F5F8] cursor-pointer">
                  Constraint Guard Settings
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
