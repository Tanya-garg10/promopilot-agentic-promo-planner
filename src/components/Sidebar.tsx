import React from 'react';
import {
  LayoutDashboard,
  Package,
  Sparkles,
  FlaskConical,
  Workflow,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Play,
  FileCheck2,
  Database,
  Sun,
  Moon,
  Command
} from 'lucide-react';

export type NavPage =
  | 'overview'
  | 'products'
  | 'planner'
  | 'simulation'
  | 'agents'
  | 'recommendations'
  | 'history'
  | 'settings';

interface SidebarProps {
  activePage: NavPage;
  setActivePage: (page: NavPage) => void;
  overstockCount: number;
  onRunDemo: () => void;
  isDemoRunning?: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  overstockCount,
  onRunDemo,
  isDemoRunning = false,
  isCollapsed,
  setIsCollapsed,
  isDarkMode = false,
  onToggleTheme,
  onOpenCommandPalette,
}) => {
  const navItems: { id: NavPage; label: string; icon: React.ReactNode; badge?: number; highlight?: boolean }[] = [
    {
      id: 'overview',
      label: 'Intelligence Home',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'simulation',
      label: 'Simulation Studio',
      icon: <FlaskConical className="w-4 h-4 shrink-0" />,
      highlight: true,
    },
    {
      id: 'products',
      label: 'Products & Inventory',
      icon: <Package className="w-4 h-4 shrink-0" />,
      badge: overstockCount > 0 ? overstockCount : undefined,
    },
    {
      id: 'planner',
      label: 'Promotion Planner',
      icon: <Sparkles className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'agents',
      label: 'Live Agent Workspace',
      icon: <Workflow className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'recommendations',
      label: 'Promotion Plans',
      icon: <FileCheck2 className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'history',
      label: 'Analytics & History',
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'settings',
      label: 'Settings & Invariants',
      icon: <Settings className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <aside
      className={`h-screen bg-[#FDFCF7] dark:bg-[#11141C] border-r border-[#E4E2D8] dark:border-[#202432] flex flex-col shrink-0 select-none transition-all duration-300 z-30 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header with Custom Abstract Geometric Retail Intelligence Mark */}
      <div className="h-16 px-4 border-b border-[#E4E2D8] dark:border-[#202432] flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {/* Custom geometric mark: Intersecting isometric retail lattice in cobalt & acid lime */}
          <div className="relative w-8 h-8 rounded-lg bg-[#455BFF] p-[1.5px] shadow-sm shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#191B22] rounded-[6.5px] flex items-center justify-center relative overflow-hidden">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
              >
                <path
                  d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
                  stroke="#455BFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 22V12"
                  stroke="#D8F878"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M21 7L12 12L3 7"
                  stroke="#F7F6F0"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="2" fill="#D8F878" />
              </svg>
            </div>
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-[#191B22] dark:text-[#F4F5F8]">
                  PromoPilot
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#191B22] dark:text-[#D8F878] bg-[#D8F878] dark:bg-[#D8F878]/15 px-1 py-0.2 rounded font-mono border border-black/10 dark:border-[#D8F878]/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-[#8B8F9E] tracking-tight truncate font-sans">
                Retail Intelligence
              </p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[#8B8F9E] hover:text-[#191B22] dark:hover:text-[#F4F5F8] hover:bg-[#F0EFEA] dark:hover:bg-[#181B24] p-1.5 rounded-md transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Quick Launch & Command Palette Access */}
      <div className="p-3 border-b border-[#E4E2D8] dark:border-[#202432] space-y-2">
        <button
          onClick={onRunDemo}
          disabled={isDemoRunning}
          className={`w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-white bg-[#455BFF] hover:bg-[#3448E0] active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 ${
            isCollapsed ? 'px-0' : ''
          }`}
          title="Run Earbuds Promotion Scenario"
        >
          <Play className="w-3.5 h-3.5 fill-current text-[#D8F878] shrink-0" />
          {!isCollapsed && (
            <span className="truncate">
              {isDemoRunning ? 'Simulating Earbuds...' : 'Run Promotion Analysis'}
            </span>
          )}
        </button>

        {onOpenCommandPalette && !isCollapsed && (
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#F0EFEA] dark:bg-[#181B24] border border-[#E4E2D8] dark:border-[#202432] text-[11px] text-[#5C606E] dark:text-[#9499A8] hover:text-[#191B22] dark:hover:text-[#F4F5F8] transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Command className="w-3 h-3 text-[#455BFF]" />
              <span>Command Menu</span>
            </span>
            <kbd className="font-mono text-[9px] bg-white dark:bg-[#11141C] px-1 py-0.5 rounded border border-[#E4E2D8] dark:border-[#202432]">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-[#EEF1FF] dark:bg-[#1C202C] text-[#455BFF] dark:text-[#F4F5F8] font-semibold border border-[#455BFF]/30 dark:border-[#455BFF]/40 shadow-xs'
                  : 'text-[#5C606E] dark:text-[#9499A8] hover:text-[#191B22] dark:hover:text-[#F4F5F8] hover:bg-[#F0EFEA] dark:hover:bg-[#181B24]'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`transition-colors ${
                    isActive
                      ? 'text-[#455BFF]'
                      : 'text-[#8B8F9E] group-hover:text-[#191B22] dark:group-hover:text-[#F4F5F8]'
                  }`}
                >
                  {item.icon}
                </span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && item.badge !== undefined && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  {item.badge}
                </span>
              )}

              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#455BFF] rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Controls: Theme Toggle & Benchmark Status */}
      <div className="p-3 border-t border-[#E4E2D8] dark:border-[#202432] text-[11px] text-[#8B8F9E] space-y-2">
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-[#10B981] dark:text-[#D8F878]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] dark:bg-[#D8F878]" />
                <span className="font-semibold text-[10px] uppercase tracking-wider text-[#191B22] dark:text-[#F4F5F8]">
                  Constraint Guard
                </span>
              </div>

              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className="p-1 rounded-md text-[#5C606E] dark:text-[#9499A8] hover:text-[#191B22] dark:hover:text-[#F4F5F8] hover:bg-[#F0EFEA] dark:hover:bg-[#181B24] transition-colors"
                  title={isDarkMode ? 'Switch to Ivory Editorial light mode' : 'Switch to Dark Command Center'}
                >
                  {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#455BFF]" />}
                </button>
              )}
            </div>

            <div className="p-2 rounded-md bg-[#F0EFEA] dark:bg-[#181B24] border border-[#E4E2D8] dark:border-[#202432] text-[10px] space-y-1">
              <div className="flex items-center justify-between text-[#5C606E] dark:text-[#9499A8]">
                <span className="flex items-center gap-1 font-medium">
                  <Database className="w-3 h-3 text-[#455BFF]" /> Benchmark SKUs
                </span>
                <span className="text-[#191B22] dark:text-[#D8F878] font-bold font-mono">16 items</span>
              </div>
              <p className="text-[9px] text-[#8B8F9E] leading-tight">
                Intelligence behind every promotion
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] dark:bg-[#D8F878]" title="Constraint Guard Active" />
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-1 text-[#8B8F9E] hover:text-[#191B22] dark:hover:text-[#F4F5F8]"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
