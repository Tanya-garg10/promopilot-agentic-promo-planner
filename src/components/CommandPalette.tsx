import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  Package,
  Sparkles,
  FlaskConical,
  Workflow,
  FileCheck2,
  BarChart3,
  Settings,
  Play,
  Download,
  RotateCcw,
  Sun,
  Moon,
  ArrowRight,
  Command,
  X,
  Filter
} from 'lucide-react';
import { NavPage } from './Sidebar';
import { Product } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: NavPage) => void;
  products: Product[];
  onSelectProductForSimulation: (productId: string) => void;
  onSelectProductForPlanner: (productId: string) => void;
  onRunDemo: () => void;
  onExportReport: () => void;
  onResetDemoData: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Actions' | 'Products' | 'Theme';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  products,
  onSelectProductForSimulation,
  onSelectProductForPlanner,
  onRunDemo,
  onExportReport,
  onResetDemoData,
  isDarkMode,
  onToggleTheme,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const baseCommands: CommandItem[] = [
    {
      id: 'nav-overview',
      category: 'Navigation',
      title: 'Intelligence Home',
      subtitle: 'Editorial overview, dominant insights & bento metrics',
      icon: <LayoutDashboard className="w-4 h-4 text-[#455BFF]" />,
      shortcut: 'G O',
      action: () => {
        onNavigate('overview');
        onClose();
      },
    },
    {
      id: 'nav-simulation',
      category: 'Navigation',
      title: 'Simulation Studio',
      subtitle: 'What-If multi-strategy comparison & elasticity sandbox',
      icon: <FlaskConical className="w-4 h-4 text-[#455BFF]" />,
      shortcut: 'G S',
      action: () => {
        onNavigate('simulation');
        onClose();
      },
    },
    {
      id: 'nav-products',
      category: 'Navigation',
      title: 'Products & Inventory',
      subtitle: 'Catalog explorer, margin hurdles & overstock audit',
      icon: <Package className="w-4 h-4 text-[#455BFF]" />,
      shortcut: 'G P',
      action: () => {
        onNavigate('products');
        onClose();
      },
    },
    {
      id: 'nav-planner',
      category: 'Navigation',
      title: 'Promotion Planner',
      subtitle: 'Formulate autonomous campaign with constraint validation',
      icon: <Sparkles className="w-4 h-4 text-[#455BFF]" />,
      shortcut: 'G L',
      action: () => {
        onNavigate('planner');
        onClose();
      },
    },
    {
      id: 'nav-agents',
      category: 'Navigation',
      title: 'Live Agent Workspace',
      subtitle: '7-agent trace pipeline, logs & decision graph',
      icon: <Workflow className="w-4 h-4 text-[#455BFF]" />,
      shortcut: 'G A',
      action: () => {
        onNavigate('agents');
        onClose();
      },
    },
    {
      id: 'nav-recommendations',
      category: 'Navigation',
      title: 'Executive Promotion Plans',
      subtitle: 'Inspect winning recommendations & approve for release',
      icon: <FileCheck2 className="w-4 h-4 text-[#455BFF]" />,
      shortcut: 'G R',
      action: () => {
        onNavigate('recommendations');
        onClose();
      },
    },
    {
      id: 'nav-history',
      category: 'Navigation',
      title: 'Analytics & History',
      subtitle: 'Estimated vs Actuals tracker & audit logs',
      icon: <BarChart3 className="w-4 h-4 text-[#455BFF]" />,
      shortcut: 'G H',
      action: () => {
        onNavigate('history');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      category: 'Navigation',
      title: 'Settings & Constraints',
      subtitle: 'Global margin hurdles, budget caps & AI provider',
      icon: <Settings className="w-4 h-4 text-[#5C606E] dark:text-[#9499A8]" />,
      action: () => {
        onNavigate('settings');
        onClose();
      },
    },
    {
      id: 'action-demo',
      category: 'Actions',
      title: 'Run Promotion Analysis',
      subtitle: 'Execute full 7-agent pipeline on AeroSound Earbuds overstock',
      icon: <Play className="w-4 h-4 text-[#10B981]" />,
      shortcut: '⌘ ↵',
      action: () => {
        onRunDemo();
        onClose();
      },
    },
    {
      id: 'action-export',
      category: 'Actions',
      title: 'Export Full Audit Report',
      subtitle: 'Download complete JSON history with traces and actuals',
      icon: <Download className="w-4 h-4 text-[#455BFF]" />,
      action: () => {
        onExportReport();
        onClose();
      },
    },
    {
      id: 'action-reset',
      category: 'Actions',
      title: 'Restore Benchmark Catalog',
      subtitle: 'Reset to 16 curated retail products & initial states',
      icon: <RotateCcw className="w-4 h-4 text-amber-500" />,
      action: () => {
        onResetDemoData();
        onClose();
      },
    },
    {
      id: 'theme-toggle',
      category: 'Theme',
      title: isDarkMode ? 'Switch to Warm Ivory Editorial Mode' : 'Switch to Dark Command Center Mode',
      subtitle: isDarkMode ? 'Classic 2026 Swiss-inspired light palette' : 'High-contrast nocturnal operations interface',
      icon: isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#455BFF]" />,
      shortcut: '⌘ T',
      action: () => {
        onToggleTheme();
        onClose();
      },
    },
  ];

  // Dynamic product commands based on search query
  const productCommands: CommandItem[] = products.slice(0, 10).map((p) => ({
    id: `prod-${p.id}`,
    category: 'Products',
    title: p.name,
    subtitle: `${p.category} · Stock: ${p.current_stock} · Margin: ${(((p.selling_price - p.unit_cost) / p.selling_price) * 100).toFixed(0)}%`,
    icon: <Package className="w-4 h-4 text-[#455BFF]" />,
    action: () => {
      onSelectProductForSimulation(p.id);
      onClose();
    },
  }));

  const allCommands = [...baseCommands, ...productCommands];

  const filteredCommands = allCommands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#191B22]/40 dark:bg-black/70 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#141722] rounded-xl border border-[#E4E2D8] dark:border-[#202432] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#E4E2D8] dark:border-[#202432] gap-3 bg-[#FDFCF7] dark:bg-[#11141C]">
          <Search className="w-4 h-4 text-[#8B8F9E]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, search products, or run actions..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-[#191B22] dark:text-[#F4F5F8] placeholder-[#8B8F9E] focus:outline-hidden"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#8B8F9E] bg-[#EFEFE8] dark:bg-[#1B1E2B] rounded border border-[#E4E2D8] dark:border-[#202432]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8B8F9E]">
              No commands or products matching "<span className="text-[#191B22] dark:text-[#F4F5F8] font-medium">{query}</span>"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-[#EEF1FF] dark:bg-[#1C202C] text-[#191B22] dark:text-[#F4F5F8]'
                      : 'text-[#191B22] dark:text-[#F4F5F8] hover:bg-[#F7F6F0] dark:hover:bg-[#181B24]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-md bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shrink-0">
                      {cmd.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate flex items-center gap-2">
                        <span>{cmd.title}</span>
                        <span className="text-[10px] font-normal text-[#8B8F9E] uppercase tracking-wider">
                          {cmd.category}
                        </span>
                      </div>
                      {cmd.subtitle && (
                        <p className="text-[11px] text-[#5C606E] dark:text-[#9499A8] truncate mt-0.5">
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {cmd.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#8B8F9E] bg-[#EFEFE8] dark:bg-[#11141C] rounded border border-[#E4E2D8] dark:border-[#202432]">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-[#455BFF]" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-[#E4E2D8] dark:border-[#202432] bg-[#FDFCF7] dark:bg-[#11141C] flex items-center justify-between text-[11px] text-[#8B8F9E]">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd> to navigate</span>
            <span><kbd className="font-mono">↵</kbd> to select</span>
          </div>
          <span className="font-mono">PromoPilot AI</span>
        </div>
      </div>
    </div>
  );
};
