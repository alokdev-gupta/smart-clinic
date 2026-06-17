"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { PackagePlus, Edit2, AlertCircle, TrendingDown } from "lucide-react";
import DataTable from "@/components/shared/DataTable";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface InventoryItem {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  expiryDate?: string | null;
  supplier?: string | null;
  costPerUnit: number;
}

const CAT_COLORS: Record<string, string> = {
  Medicine: "bg-blue-50 text-blue-700",
  Equipment: "bg-purple-50 text-purple-700",
  Supplies: "bg-orange-50 text-orange-700",
  Other: "bg-slate-100 text-slate-700",
};

const inputCls = "w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<Partial<InventoryItem>>({});
  const [saving, setSaving] = useState(false);

  // Delete Dialog
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const stats = useMemo(() => {
    const totalItems = items.length;
    const lowStock = items.filter(i => i.quantity <= i.reorderLevel).length;
    const totalValue = items.reduce((sum, i) => sum + (i.quantity * i.costPerUnit), 0);
    return { totalItems, lowStock, totalValue };
  }, [items]);

  const openForm = (item?: InventoryItem) => {
    if (item) {
      setForm({ ...item, expiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : "" });
    } else {
      setForm({ category: "Medicine", quantity: 0, reorderLevel: 10, costPerUnit: 0, unit: "pieces" });
    }
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `/api/inventory/${form.id}` : "/api/inventory";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(`Item ${form.id ? "updated" : "added"} successfully`);
      setIsFormOpen(false);
      fetchItems();
    } catch {
      toast.error("Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/inventory/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("Item deleted");
      setDeleteTarget(null);
      fetchItems();
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "itemName",
      label: "Item Name",
      render: (_: unknown, row: InventoryItem) => <span className="font-semibold text-slate-800">{row.itemName}</span>,
    },
    {
      key: "category",
      label: "Category",
      render: (_: unknown, row: InventoryItem) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CAT_COLORS[row.category] ?? CAT_COLORS.Other}`}>
          {row.category}
        </span>
      ),
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (_: unknown, row: InventoryItem) => (
        <span className="font-medium text-slate-700">{row.quantity} <span className="text-slate-400 text-xs font-normal">{row.unit}</span></span>
      ),
    },
    {
      key: "reorderLevel",
      label: "Reorder Lvl",
      render: (_: unknown, row: InventoryItem) => <span className="text-slate-500">{row.reorderLevel}</span>,
    },
    {
      key: "costPerUnit",
      label: "Cost/Unit",
      render: (_: unknown, row: InventoryItem) => <span className="text-slate-600">{formatCurrency(row.costPerUnit)}</span>,
    },
    {
      key: "expiryDate",
      label: "Expiry",
      render: (_: unknown, row: InventoryItem) => (
        <span className="text-slate-500 text-sm">{row.expiryDate ? formatDate(row.expiryDate) : "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Stock Status",
      render: (_: unknown, row: InventoryItem) => {
        if (row.quantity === 0) return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">Out of Stock</span>;
        if (row.quantity <= row.reorderLevel) return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">Low Stock</span>;
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">In Stock</span>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: InventoryItem) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openForm(row)} className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            Edit
          </button>
          <button onClick={() => setDeleteTarget(row)} className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage stock, medicines, and equipment</p>
        </div>
        <button
          onClick={() => openForm()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm"
          style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
        >
          <PackagePlus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><PackagePlus className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Items</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalItems}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600"><AlertCircle className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Low Stock Items</p>
            <p className="text-2xl font-bold text-slate-800">{stats.lowStock}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><TrendingDown className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Value</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalValue)}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable
          columns={columns as unknown as Parameters<typeof DataTable>[0]["columns"]}
          data={items as unknown as Record<string, unknown>[]}
          searchable
          searchPlaceholder="Search items..."
          emptyMessage="No inventory items found"
          // rowClassName logic inside DataTable isn't directly supported by standard DataTable component we built,
          // so we rely on status badge column. We can add minimal global CSS if we really needed full row highlight, 
          // but badge handles visual effectively.
        />
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Edit2 className="h-4 w-4 text-emerald-500" />
              {form.id ? "Edit Item" : "Add Inventory Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Item Name *</label>
                <input required className={inputCls} value={form.itemName || ""} onChange={e => setForm({...form, itemName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Category *</label>
                <select required className={inputCls} value={form.category || "Medicine"} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="Medicine">Medicine</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Unit *</label>
                <input required placeholder="boxes, ml, pieces" className={inputCls} value={form.unit || ""} onChange={e => setForm({...form, unit: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Quantity *</label>
                <input required type="number" min="0" className={inputCls} value={form.quantity ?? ""} onChange={e => setForm({...form, quantity: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Reorder Level *</label>
                <input required type="number" min="0" className={inputCls} value={form.reorderLevel ?? ""} onChange={e => setForm({...form, reorderLevel: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Cost Per Unit (NPR) *</label>
                <input required type="number" min="0" step="0.01" className={inputCls} value={form.costPerUnit ?? ""} onChange={e => setForm({...form, costPerUnit: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Expiry Date</label>
                <input type="date" className={inputCls} value={form.expiryDate || ""} onChange={e => setForm({...form, expiryDate: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Supplier</label>
                <input className={inputCls} value={form.supplier || ""} onChange={e => setForm({...form, supplier: e.target.value})} />
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl disabled:opacity-50">
                {saving ? "Saving..." : "Save Item"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Item"
        description={`Are you sure you want to delete ${deleteTarget?.itemName}?`}
        confirmLabel="Delete"
        isLoading={deleting}
      />
    </div>
  );
}
