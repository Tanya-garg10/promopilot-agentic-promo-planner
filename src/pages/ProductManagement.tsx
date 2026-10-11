import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Upload,
  Trash2,
  Edit2,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  Sparkles,
  Link as LinkIcon,
  X,
  Check,
  LayoutGrid,
  List,
  Boxes,
  ArrowRight,
  Sliders,
  DollarSign,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Product } from '../types';

interface ProductManagementProps {
  products: Product[];
  onAddProduct: (data: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onImportCSV: (rows: any[]) => Promise<{ imported: number; failed: number; errors: string[] }>;
  onPlanPromotion: (productId: string) => void;
  onSimulateProduct?: (productId: string) => void;
  initialRiskFilter?: string;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onImportCSV,
  onPlanPromotion,
  onSimulateProduct,
  initialRiskFilter = 'All',
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState(initialRiskFilter);
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<{ imported: number; failed: number; errors: string[] } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    selling_price: 1999,
    unit_cost: 1200,
    current_stock: 500,
    target_stock: 200,
    min_margin: 20,
    competitor_price: 1899,
    region: 'Pan-India',
    base_daily_demand: 15,
    substitute_product_id: '',
    complementary_product_id: '',
    description: '',
  });

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  const regions = useMemo(() => {
    const set = new Set(products.map((p) => p.region));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'All') {
      list = list.filter((p) => p.category === categoryFilter);
    }

    if (regionFilter !== 'All') {
      list = list.filter((p) => p.region === regionFilter);
    }

    if (riskFilter !== 'All') {
      list = list.filter((p) => p.overstock_risk === riskFilter);
    }

    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortAsc
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      return sortAsc
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return list;
  }, [products, search, categoryFilter, regionFilter, riskFilter, sortField, sortAsc]);

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Electronics',
      selling_price: 1999,
      unit_cost: 1200,
      current_stock: 500,
      target_stock: 200,
      min_margin: 20,
      competitor_price: 1899,
      region: 'Pan-India',
      base_daily_demand: 15,
      substitute_product_id: '',
      complementary_product_id: '',
      description: '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      selling_price: p.selling_price,
      unit_cost: p.unit_cost,
      current_stock: p.current_stock,
      target_stock: p.target_stock,
      min_margin: p.min_margin,
      competitor_price: p.competitor_price,
      region: p.region,
      base_daily_demand: p.base_daily_demand,
      substitute_product_id: p.substitute_product_id || '',
      complementary_product_id: p.complementary_product_id || '',
      description: p.description || '',
    });
    setFormError('');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Product name is required');
      return;
    }
    if (formData.selling_price <= 0 || formData.unit_cost <= 0) {
      setFormError('Selling price and unit cost must be greater than zero');
      return;
    }
    if (formData.selling_price <= formData.unit_cost) {
      setFormError('Selling price must exceed unit cost to maintain positive margins');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, formData);
        setEditingProduct(null);
      } else {
        await onAddProduct(formData);
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProductId) return;
    try {
      setIsSubmitting(true);
      await onDeleteProduct(deletingProductId);
      setDeletingProductId(null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'id',
      'name',
      'category',
      'selling_price',
      'unit_cost',
      'current_stock',
      'target_stock',
      'min_margin',
      'competitor_price',
      'region',
      'base_daily_demand',
      'overstock_risk',
    ];

    const rows = products.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.selling_price,
      p.unit_cost,
      p.current_stock,
      p.target_stock,
      p.min_margin,
      p.competitor_price,
      `"${p.region}"`,
      p.base_daily_demand,
      `"${p.overstock_risk}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `promopilot_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleProcessImportCSV = async () => {
    if (!importText.trim()) return;
    try {
      setIsSubmitting(true);
      const lines = importText.trim().split(/\r?\n/);
      if (lines.length < 2) {
        setImportResult({ imported: 0, failed: 1, errors: ['CSV must contain header row and data'] });
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
      const parsedRows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
        const rowObj: any = {};
        headers.forEach((h, idx) => {
          let val = values[idx] || '';
          val = val.replace(/^"|"$/g, '').trim();
          rowObj[h] = val;
        });
        parsedRows.push(rowObj);
      }

      const result = await onImportCSV(parsedRows);
      setImportResult(result);
    } catch (err: any) {
      setImportResult({ imported: 0, failed: 1, errors: [err.message] });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls Toolbar */}
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8B8F9E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU name, ID, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] placeholder-[#8B8F9E] focus:outline-hidden focus:border-[#455BFF]"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Departments' : c}
              </option>
            ))}
          </select>

          {/* Risk Dropdown */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8]"
          >
            <option value="All">All Overstock Tiers</option>
            <option value="High">High Risk (&gt;2.5x)</option>
            <option value="Moderate">Moderate Stock</option>
            <option value="Normal">Normal</option>
          </select>

          {/* Table / Cards View Toggle */}
          <div className="flex items-center p-0.5 bg-[#F7F6F0] dark:bg-[#0D1017] rounded-lg border border-[#E4E2D8] dark:border-[#202432]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-white dark:bg-[#222738] text-[#191B22] dark:text-[#F4F5F8] shadow-xs' : 'text-[#8B8F9E]'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'cards' ? 'bg-white dark:bg-[#222738] text-[#191B22] dark:text-[#F4F5F8] shadow-xs' : 'text-[#8B8F9E]'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold text-[#5C606E] dark:text-[#9499A8] hover:text-[#191B22] dark:hover:text-[#F4F5F8] bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg transition-colors flex items-center gap-1.5"
            title="Export products to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => {
              setImportText('');
              setImportResult(null);
              setIsImportModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-[#5C606E] dark:text-[#9499A8] hover:text-[#191B22] dark:hover:text-[#F4F5F8] bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg transition-colors flex items-center gap-1.5"
            title="Import products from CSV"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#455BFF] hover:bg-[#3448E0] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add SKU</span>
          </button>
        </div>
      </div>

      {/* Cards View Mode */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const marginPct = ((p.selling_price - p.unit_cost) / p.selling_price) * 100;
            const priceDiff = p.competitor_price - p.selling_price;

            return (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] hover:border-[#455BFF]/40 transition-all flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-[#455BFF] font-semibold">{p.id}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        p.overstock_risk === 'High'
                          ? 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/25'
                          : 'bg-[#10B981]/15 text-[#10B981] dark:text-[#D8F878] border border-[#10B981]/25'
                      }`}
                    >
                      {p.overstock_risk} Overstock
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-[#191B22] dark:text-[#F4F5F8] line-clamp-1">{p.name}</h3>
                  <div className="text-[11px] text-[#8B8F9E] mt-0.5">{p.category} · {p.region}</div>

                  <div className="grid grid-cols-2 gap-2 mt-3 p-2 rounded-lg bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-[#8B8F9E] font-sans block">Price</span>
                      <span className="font-bold text-[#191B22] dark:text-[#F4F5F8]">₹{p.selling_price.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8B8F9E] font-sans block">Cost</span>
                      <span className="text-[#5C606E] dark:text-[#9499A8]">₹{p.unit_cost.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8B8F9E] font-sans block">Margin</span>
                      <span className="font-bold text-[#10B981] dark:text-[#D8F878]">{marginPct.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8B8F9E] font-sans block">Stock</span>
                      <span className="font-bold text-[#191B22] dark:text-[#F4F5F8]">{p.current_stock}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E4E2D8] dark:border-[#202432]">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-[#5C606E] dark:text-[#9499A8] hover:text-[#191B22] dark:hover:text-[#F4F5F8] hover:bg-[#F0EFEA] dark:hover:bg-[#1C202C] rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingProductId(p.id)}
                      className="p-1.5 text-[#8B8F9E] hover:text-rose-600 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onPlanPromotion(p.id)}
                    className="px-2.5 py-1 text-xs font-semibold text-[#455BFF] bg-[#EEF1FF] dark:bg-[#455BFF]/15 hover:bg-[#455BFF] hover:text-white rounded-md transition-colors"
                  >
                    Plan Promo →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View Mode (Refined Swiss Table) */}
      {viewMode === 'table' && (
        <div className="rounded-xl bg-white dark:bg-[#141722] border border-[#E4E2D8] dark:border-[#202432] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FDFCF7] dark:bg-[#11141C] border-b border-[#E4E2D8] dark:border-[#202432] text-[#8B8F9E] font-semibold select-none">
                  <th
                    onClick={() => handleSort('id')}
                    className="py-3 px-4 cursor-pointer hover:text-[#191B22] dark:hover:text-[#F4F5F8]"
                  >
                    <div className="flex items-center gap-1">
                      <span>ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3 px-4 cursor-pointer hover:text-[#191B22] dark:hover:text-[#F4F5F8]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Product Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Category</th>
                  <th
                    onClick={() => handleSort('selling_price')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-[#191B22] dark:hover:text-[#F4F5F8]"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Price</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Cost</th>
                  <th className="py-3 px-4 text-right">Margin</th>
                  <th
                    onClick={() => handleSort('current_stock')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-[#191B22] dark:hover:text-[#F4F5F8]"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Stock / Target</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Overstock Tier</th>
                  <th className="py-3 px-4 text-center">Relations</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2D8]/70 dark:divide-[#202432] font-mono">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-[#8B8F9E] font-sans">
                      No products match your search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const marginPct = ((p.selling_price - p.unit_cost) / p.selling_price) * 100;
                    const stockPct = p.target_stock > 0 ? (p.current_stock / p.target_stock) * 100 : 100;

                    return (
                      <tr key={p.id} className="hover:bg-[#F7F6F0]/70 dark:hover:bg-[#181B24]/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#455BFF]">{p.id}</td>
                        <td className="py-3 px-4 font-sans font-bold text-[#191B22] dark:text-[#F4F5F8]">
                          {p.name}
                        </td>
                        <td className="py-3 px-4 font-sans text-[#5C606E] dark:text-[#9499A8]">
                          {p.category}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#191B22] dark:text-[#F4F5F8] font-bold">
                          ₹{p.selling_price.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#5C606E] dark:text-[#9499A8]">
                          ₹{p.unit_cost.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#10B981] dark:text-[#D8F878] font-bold">
                          {marginPct.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums">
                          <span className="font-bold text-[#191B22] dark:text-[#F4F5F8]">{p.current_stock}</span>{' '}
                          <span className="text-[#8B8F9E]">/ {p.target_stock}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              p.overstock_risk === 'High'
                                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-[#10B981]/15 text-[#10B981] dark:text-[#D8F878] border border-[#10B981]/30'
                            }`}
                          >
                            {p.overstock_risk}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <div className="flex items-center justify-center gap-1 text-[10px]">
                            {p.substitute_product_id && (
                              <span className="text-[#5C606E] dark:text-[#9499A8] bg-[#F0EFEA] dark:bg-[#1B1E2B] px-1.5 py-0.2 rounded border border-[#E4E2D8] dark:border-[#202432]" title={`Substitute: ${p.substitute_product_id}`}>
                                Sub
                              </span>
                            )}
                            {p.complementary_product_id && (
                              <span className="text-[#455BFF] bg-[#EEF1FF] dark:bg-[#455BFF]/15 px-1.5 py-0.2 rounded border border-[#455BFF]/30" title={`Bundle: ${p.complementary_product_id}`}>
                                Bundle
                              </span>
                            )}
                            {!p.substitute_product_id && !p.complementary_product_id && (
                              <span className="text-[#8B8F9E]">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-sans">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onPlanPromotion(p.id)}
                              className="p-1 text-[#455BFF] hover:bg-[#EEF1FF] dark:hover:bg-[#455BFF]/20 rounded transition-colors"
                              title="Plan Promotion"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1 text-[#5C606E] dark:text-[#9499A8] hover:text-[#191B22] dark:hover:text-[#F4F5F8] hover:bg-[#F0EFEA] dark:hover:bg-[#1C202C] rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingProductId(p.id)}
                              className="p-1 text-[#8B8F9E] hover:text-rose-600 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#FDFCF7] dark:bg-[#11141C] border-t border-[#E4E2D8] dark:border-[#202432] text-xs text-[#8B8F9E] flex items-center justify-between">
            <span>Showing {filteredProducts.length} of {products.length} catalog items</span>
            <span className="font-mono text-[11px]">Pricing currency: INR (₹)</span>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-[#191B22]/40 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141722] rounded-xl border border-[#E4E2D8] dark:border-[#202432] shadow-2xl max-w-xl w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
              <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">
                {editingProduct ? `Edit Product: ${editingProduct.id}` : 'Create New Retail SKU'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-[#8B8F9E] hover:text-[#191B22] dark:hover:text-[#F4F5F8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[#191B22] dark:text-[#F4F5F8] font-medium mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8]"
                    placeholder="AeroSound Pro Wireless Earbuds"
                  />
                </div>

                <div>
                  <label className="block text-[#191B22] dark:text-[#F4F5F8] font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8]"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home Essentials">Home Essentials</option>
                    <option value="Personal Care">Personal Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#191B22] dark:text-[#F4F5F8] font-medium mb-1">Region</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8]"
                  >
                    <option value="Pan-India">Pan-India</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="West">West</option>
                    <option value="East">East</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#191B22] dark:text-[#F4F5F8] font-medium mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#191B22] dark:text-[#F4F5F8] font-medium mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#191B22] dark:text-[#F4F5F8] font-medium mb-1">Current Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#191B22] dark:text-[#F4F5F8] font-medium mb-1">Target Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.target_stock}
                    onChange={(e) => setFormData({ ...formData, target_stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#191B22] dark:text-[#F4F5F8] font-medium mb-1">Competitor Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.competitor_price}
                    onChange={(e) => setFormData({ ...formData, competitor_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#191B22] dark:text-[#F4F5F8] font-medium mb-1">Min Margin (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.min_margin}
                    onChange={(e) => setFormData({ ...formData, min_margin: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg text-[#191B22] dark:text-[#F4F5F8] font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E2D8] dark:border-[#202432]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border border-[#E4E2D8] dark:border-[#202432] text-[#5C606E] dark:text-[#9499A8] hover:text-[#191B22] dark:hover:text-[#F4F5F8] rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#455BFF] hover:bg-[#3448E0] text-white rounded-lg font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 bg-[#191B22]/40 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141722] rounded-xl border border-[#E4E2D8] dark:border-[#202432] shadow-2xl max-w-sm w-full p-5 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Confirm SKU Removal</span>
            </h3>
            <p className="text-[#5C606E] dark:text-[#9499A8]">
              Are you sure you want to delete product <strong className="font-mono text-[#191B22] dark:text-[#F4F5F8]">{deletingProductId}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E2D8] dark:border-[#202432]">
              <button
                onClick={() => setDeletingProductId(null)}
                className="px-3 py-1.5 border border-[#E4E2D8] dark:border-[#202432] text-[#5C606E] dark:text-[#9499A8] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700"
              >
                {isSubmitting ? 'Deleting...' : 'Delete SKU'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#191B22]/40 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141722] rounded-xl border border-[#E4E2D8] dark:border-[#202432] shadow-2xl max-w-xl w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E2D8] dark:border-[#202432]">
              <h3 className="text-sm font-bold text-[#191B22] dark:text-[#F4F5F8]">Import Products from CSV</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-[#8B8F9E] hover:text-[#191B22] dark:hover:text-[#F4F5F8]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[#5C606E] dark:text-[#9499A8]">
              Paste CSV data with headers (e.g. name, category, selling_price, unit_cost, current_stock, target_stock, min_margin, competitor_price, region):
            </p>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="name,category,selling_price,unit_cost,current_stock,target_stock,min_margin,competitor_price,region&#10;Smart Speaker,Electronics,3499,2200,800,300,18,3299,Pan-India"
              className="w-full p-3 bg-[#F7F6F0] dark:bg-[#0D1017] border border-[#E4E2D8] dark:border-[#202432] rounded-lg font-mono text-xs text-[#191B22] dark:text-[#F4F5F8]"
            />

            {importResult && (
              <div
                className={`p-3 rounded-lg border text-xs ${
                  importResult.imported > 0
                    ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981] dark:text-[#D8F878]'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                }`}
              >
                Imported: {importResult.imported} · Failed: {importResult.failed}
                {importResult.errors.length > 0 && (
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E2D8] dark:border-[#202432]">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 border border-[#E4E2D8] dark:border-[#202432] text-[#5C606E] dark:text-[#9499A8] rounded-lg"
              >
                Done
              </button>
              <button
                onClick={handleProcessImportCSV}
                disabled={isSubmitting || !importText.trim()}
                className="px-4 py-2 bg-[#455BFF] hover:bg-[#3448E0] text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {isSubmitting ? 'Importing...' : 'Parse & Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
