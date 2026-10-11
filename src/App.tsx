import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavPage } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CommandPalette } from './components/CommandPalette';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { ProductManagement } from './pages/ProductManagement';
import { PromotionPlanner } from './pages/PromotionPlanner';
import { AgentActivityCenter } from './pages/AgentActivityCenter';
import { WhatIfSimulationLab } from './pages/WhatIfSimulationLab';
import { Recommendations } from './pages/Recommendations';
import { AnalyticsHistory } from './pages/AnalyticsHistory';
import { SettingsPage } from './pages/SettingsPage';
import { DemoRunnerModal } from './components/DemoRunnerModal';
import { api } from './services/api';
import { Product, PromotionPlan, InventorySummary, AnalyticsSummary, PlanConfigPayload } from './types';

export default function App() {
  const [activePage, setActivePage] = useState<NavPage>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<PromotionPlan[]>([]);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [plannerProductId, setPlannerProductId] = useState<string>('');
  const [simulationProductId, setSimulationProductId] = useState<string>('PROD-ELEC-001');
  const [productRiskFilter, setProductRiskFilter] = useState<string>('All');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [llmStatus, setLlmStatus] = useState<string>('Deterministic Agents Active');
  const [llmProvider, setLlmProvider] = useState<string>('Featherless AI');
  const [isLLMAvailable, setIsLLMAvailable] = useState<boolean>(false);

  // Swiss Light / Dark Command Center Theme State (Default: Light Warm Ivory)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('promopilot_theme') === 'dark';
    } catch {
      return false;
    }
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Sync document class for Tailwind dark variant
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Global Keyboard Shortcut: Cmd/Ctrl + K for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('promopilot_theme', next ? 'dark' : 'light');
      } catch {}
      return next;
    });
  };

  // Demo Runner Modal state
  const [demoModal, setDemoModal] = useState<{
    isOpen: boolean;
    plan: PromotionPlan | null;
    storyline: string[];
  }>({
    isOpen: false,
    plan: null,
    storyline: [],
  });

  const fetchData = useCallback(async () => {
    try {
      const [prods, plns, inv, ana, health] = await Promise.all([
        api.getProducts(),
        api.getPlans(),
        api.getInventorySummary(),
        api.getAnalyticsSummary(),
        api.getHealth(),
      ]);

      setProducts(prods);
      setPlans(plns);
      setInventorySummary(inv);
      setAnalyticsSummary(ana);
      setLlmProvider(health.llm_provider || 'Featherless AI');
      setIsLLMAvailable(health.llm_available || false);
      setLlmStatus(health.llm_available ? 'Featherless AI + Constraint Guard' : 'Deterministic Guard Active');

      if (plns.length > 0 && !selectedPlanId) {
        setSelectedPlanId(plns[0].plan_id);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedPlanId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
  };

  // Run Hackathon Demo
  const handleRunDemo = async () => {
    try {
      setIsGenerating(true);
      const res = await api.runDemoScenario();
      setPlans((prev) => [res.plan, ...prev.filter((p) => p.plan_id !== res.plan.plan_id)]);
      setSelectedPlanId(res.plan.plan_id);
      setDemoModal({
        isOpen: true,
        plan: res.plan,
        storyline: res.storyline,
      });
      await fetchData();
    } catch (err: any) {
      alert(`Demo execution failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Promotion Plan from Planner
  const handleGeneratePlan = async (payload: PlanConfigPayload): Promise<PromotionPlan> => {
    setIsGenerating(true);
    try {
      const newPlan = await api.generatePlan(payload);
      setPlans((prev) => [newPlan, ...prev]);
      setSelectedPlanId(newPlan.plan_id);
      await fetchData();
      setActivePage('recommendations');
      return newPlan;
    } finally {
      setIsGenerating(false);
    }
  };

  // Product CRUD Handlers
  const handleAddProduct = async (data: Partial<Product>) => {
    await api.createProduct(data);
    await fetchData();
  };

  const handleUpdateProduct = async (id: string, data: Partial<Product>) => {
    await api.updateProduct(id, data);
    await fetchData();
  };

  const handleDeleteProduct = async (id: string) => {
    await api.deleteProduct(id);
    await fetchData();
  };

  const handleImportCSV = async (rows: any[]) => {
    const res = await api.importProducts(rows);
    await fetchData();
    return res;
  };

  // Plan Approval / Rejection
  const handleApprovePlan = async (id: string) => {
    const updated = await api.approvePlan(id);
    setPlans((prev) => prev.map((p) => (p.plan_id === id ? updated : p)));
    await fetchData();
  };

  const handleRejectPlan = async (id: string) => {
    const updated = await api.rejectPlan(id);
    setPlans((prev) => prev.map((p) => (p.plan_id === id ? updated : p)));
    await fetchData();
  };

  const handleSubmitActuals = async (
    id: string,
    actuals: { actual_units_sold: number; actual_revenue: number; actual_gross_profit: number }
  ) => {
    const updated = await api.submitActuals(id, actuals);
    setPlans((prev) => prev.map((p) => (p.plan_id === id ? updated : p)));
    await fetchData();
  };

  const handleResetDemoData = async () => {
    await api.resetDemoData();
    await fetchData();
  };

  const handleExportReport = async () => {
    const reportData = await api.exportReport();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `promopilot_audit_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Navigation Helpers
  const handleNavigateToPlanner = (productId?: string) => {
    if (productId) setPlannerProductId(productId);
    setActivePage('planner');
  };

  const handleNavigateToSimulation = (productId?: string) => {
    if (productId) setSimulationProductId(productId);
    setActivePage('simulation');
  };

  const handleNavigateToProducts = (filterRisk?: string) => {
    if (filterRisk) setProductRiskFilter(filterRisk);
    setActivePage('products');
  };

  const handleNavigateToPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setActivePage('recommendations');
  };

  const overstockCount = products.filter((p) => p.overstock_risk === 'High').length;

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center space-y-4 font-sans ${isDarkMode ? 'bg-[#0C0E14] text-[#F4F5F8]' : 'bg-[#F7F6F0] text-[#191B22]'}`}>
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-[#455BFF]/25 border-t-[#455BFF] rounded-full animate-spin" />
          <div className="w-6 h-6 border-2 border-[#D8F878]/30 border-b-[#D8F878] rounded-full animate-spin-reverse absolute" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold tracking-tight">PromoPilot AI</p>
          <p className="text-xs text-[#8B8F9E]">Loading catalog constraints, deterministic engine & multi-agent lattice</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans antialiased transition-colors duration-200 ${isDarkMode ? 'dark bg-[#0C0E14] text-[#F4F5F8]' : 'bg-[#F7F6F0] text-[#191B22]'}`}>
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        overstockCount={overstockCount}
        onRunDemo={handleRunDemo}
        isDemoRunning={isGenerating}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
        <TopBar
          activePage={activePage}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onRunDemo={handleRunDemo}
          onNewPlanClick={() => handleNavigateToPlanner()}
          llmStatus={llmStatus}
          overstockCount={overstockCount}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />

        <main className="flex-1 overflow-y-auto">
          {activePage === 'overview' && (
            <OverviewDashboard
              products={products}
              plans={plans}
              inventorySummary={inventorySummary}
              analyticsSummary={analyticsSummary}
              onNavigateToPlanner={handleNavigateToPlanner}
              onNavigateToAgents={() => setActivePage('agents')}
              onNavigateToPlan={handleNavigateToPlan}
              onNavigateToSimulation={handleNavigateToSimulation}
              onNavigateToProducts={handleNavigateToProducts}
              onNavigateToSettings={() => setActivePage('settings')}
              onRunDemo={handleRunDemo}
              isDemoRunning={isGenerating}
            />
          )}

          {activePage === 'simulation' && (
            <WhatIfSimulationLab
              products={products}
              initialProductId={simulationProductId}
              onNavigateToPlanner={handleNavigateToPlanner}
            />
          )}

          {activePage === 'products' && (
            <ProductManagement
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onImportCSV={handleImportCSV}
              onPlanPromotion={handleNavigateToPlanner}
              onSimulateProduct={handleNavigateToSimulation}
              initialRiskFilter={productRiskFilter}
            />
          )}

          {activePage === 'planner' && (
            <PromotionPlanner
              products={products}
              initialProductId={plannerProductId}
              onGeneratePlan={handleGeneratePlan}
              onRunDemo={handleRunDemo}
              isGenerating={isGenerating}
            />
          )}

          {activePage === 'agents' && (
            <AgentActivityCenter
              plans={plans}
              selectedPlanId={selectedPlanId}
              onSelectPlanId={setSelectedPlanId}
              onNavigateToPlan={handleNavigateToPlan}
              onRunDemo={handleRunDemo}
              isDemoRunning={isGenerating}
            />
          )}

          {activePage === 'recommendations' && (
            <Recommendations
              plans={plans}
              selectedPlanId={selectedPlanId}
              onSelectPlanId={setSelectedPlanId}
              onApprovePlan={handleApprovePlan}
              onRejectPlan={handleRejectPlan}
            />
          )}

          {activePage === 'history' && (
            <AnalyticsHistory
              plans={plans}
              simulations={[]}
              onSubmitActuals={handleSubmitActuals}
              onExportReport={handleExportReport}
            />
          )}

          {activePage === 'settings' && (
            <SettingsPage
              onResetDemoData={handleResetDemoData}
              llmProvider={llmProvider}
              isLLMAvailable={isLLMAvailable}
            />
          )}
        </main>
      </div>

      {/* Global Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(page) => setActivePage(page)}
        products={products}
        onSelectProductForSimulation={(productId) => {
          setSimulationProductId(productId);
          setActivePage('simulation');
        }}
        onSelectProductForPlanner={(productId) => {
          setPlannerProductId(productId);
          setActivePage('planner');
        }}
        onRunDemo={handleRunDemo}
        onExportReport={handleExportReport}
        onResetDemoData={handleResetDemoData}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Demo Walkthrough Modal */}
      <DemoRunnerModal
        isOpen={demoModal.isOpen}
        onClose={() => setDemoModal({ ...demoModal, isOpen: false })}
        plan={demoModal.plan}
        storyline={demoModal.storyline}
        onViewPlan={handleNavigateToPlan}
        onViewAgents={() => setActivePage('agents')}
      />
    </div>
  );
}
