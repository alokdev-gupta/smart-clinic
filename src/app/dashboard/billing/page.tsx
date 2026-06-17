"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Receipt, CheckCircle, X, Plus, Loader2 } from "lucide-react";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Invoice {
  id: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
  paymentMethod?: string | null;
  issuedAt: string;
  patient: { user: { name: string } };
}

interface Patient {
  id: string;
  user: { name: string; email: string };
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  reason?: string | null;
  patient: { user: { name: string } };
  doctor: { user: { name: string } };
}

// Format invoice display ID: INV-XXXXXXXX (last 8 chars uppercased)
function formatInvoiceId(id: string) {
  return `INV-${id.slice(-8).toUpperCase()}`;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Mark as Paid dialog
  const [payingTarget, setPayingTarget] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [updating, setUpdating] = useState(false);

  // Create Invoice modal
  const [showCreate, setShowCreate] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [creating, setCreating] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    patientId: "",
    appointmentId: "",
    amount: "",
    tax: "13",
    paymentMethod: "",
  });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing");
      if (!res.ok) throw new Error();
      setInvoices(await res.json());
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const openCreateModal = async () => {
    setShowCreate(true);
    setInvoiceForm({ patientId: "", appointmentId: "", amount: "", tax: "", paymentMethod: "" });
    try {
      const [pRes, aRes] = await Promise.all([
        fetch("/api/patients"),
        fetch("/api/appointments"),
      ]);
      if (pRes.ok) setPatients(await pRes.json());
      if (aRes.ok) {
        const appts: Appointment[] = await aRes.json();
        // Only show appointments that don't have an invoice yet
        const invoiceApptIds = new Set(invoices.map((inv) => inv.appointment?.id).filter(Boolean));
        setAppointments(appts.filter((a) => !invoiceApptIds.has(a.id)));
      }
    } catch {
      // ignore
    }
  };

  const handleCreateInvoice = async () => {
    if (!invoiceForm.patientId || !invoiceForm.appointmentId || !invoiceForm.amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: invoiceForm.patientId,
          appointmentId: invoiceForm.appointmentId,
          amount: parseFloat(invoiceForm.amount),
          tax: parseFloat(invoiceForm.tax) || 0,
          paymentMethod: invoiceForm.paymentMethod || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create invoice");
        return;
      }
      toast.success(`Invoice ${formatInvoiceId(data.id)} created successfully!`);
      setShowCreate(false);
      fetchInvoices();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return invoices;
    return invoices.filter((inv) => inv.status === statusFilter);
  }, [invoices, statusFilter]);

  const totalRevenue = useMemo(() => {
    return invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.total, 0);
  }, [invoices]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/billing/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("Invoice deleted");
      setDeleteTarget(null);
      fetchInvoices();
    } catch {
      toast.error("Failed to delete invoice");
    } finally {
      setDeleting(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!payingTarget || !paymentMethod) return;
    setUpdating(true);
    try {
      await fetch(`/api/billing/${payingTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID", paymentMethod }),
      });
      toast.success("Invoice marked as PAID");
      setPayingTarget(null);
      setPaymentMethod("");
      fetchInvoices();
    } catch {
      toast.error("Failed to update invoice");
    } finally {
      setUpdating(false);
    }
  };

  // Filtered appointments by selected patient
  const filteredAppointments = useMemo(() => {
    if (!invoiceForm.patientId) return appointments;
    return appointments.filter(a => a.patient?.user && invoiceForm.patientId);
  }, [appointments, invoiceForm.patientId]);

  const baseAmount = parseFloat(invoiceForm.amount) || 0;
  const taxAmount = (baseAmount * (parseFloat(invoiceForm.tax) || 0)) / 100;
  const totalAmount = baseAmount + taxAmount;

  const columns = [
    {
      key: "id",
      label: "Invoice ID",
      render: (_: unknown, row: Invoice) => (
        <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
          {formatInvoiceId(row.id)}
        </span>
      ),
    },
    {
      key: "patient",
      label: "Patient",
      render: (_: unknown, row: Invoice) => (
        <span className="font-medium text-slate-800">{row.patient.user.name}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (_: unknown, row: Invoice) => <span className="text-slate-600">{formatCurrency(row.amount)}</span>,
    },
    {
      key: "tax",
      label: "Tax",
      render: (_: unknown, row: Invoice) => <span className="text-slate-500">{row.tax}%</span>,
    },
    {
      key: "total",
      label: "Total",
      render: (_: unknown, row: Invoice) => <span className="font-semibold text-slate-800">{formatCurrency(row.total)}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (_: unknown, row: Invoice) => <StatusBadge status={row.status} />,
    },
    {
      key: "paymentMethod",
      label: "Method",
      render: (_: unknown, row: Invoice) => (
        <span className="text-slate-500 text-sm">{row.paymentMethod || "—"}</span>
      ),
    },
    {
      key: "issuedAt",
      label: "Date",
      render: (_: unknown, row: Invoice) => <span className="text-slate-500 text-sm">{formatDate(row.issuedAt)}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: Invoice) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/billing/${row.id}`}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            View
          </Link>
          {row.status === "PENDING" && (
            <button
              onClick={() => setPayingTarget(row)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle className="h-3.5 w-3.5" /> Pay
            </button>
          )}
          <button
            onClick={() => setDeleteTarget(row)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
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
          <h1 className="text-2xl font-bold text-slate-800">Billing &amp; Invoices</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage patient billing and payments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Revenue</span>
            <span className="text-lg font-bold text-emerald-600">{formatCurrency(totalRevenue)}</span>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
            onClick={openCreateModal}
          >
            <Plus className="h-4 w-4" /> Create Invoice
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {["ALL", "PAID", "PENDING", "CANCELLED"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              statusFilter === status
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <DataTable
          columns={columns as unknown as Parameters<typeof DataTable>[0]["columns"]}
          data={filtered as unknown as Record<string, unknown>[]}
          searchable
          searchPlaceholder="Search invoices..."
          emptyMessage="No invoices found"
        />
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        description={`Are you sure you want to delete invoice ${deleteTarget ? formatInvoiceId(deleteTarget.id) : ""}?`}
        confirmLabel="Delete"
        isLoading={deleting}
      />

      {/* Mark Paid Dialog */}
      {payingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Process Payment</h3>
              <button onClick={() => setPayingTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-medium text-slate-600">Total Amount</span>
                <span className="text-lg font-bold text-emerald-600">{formatCurrency(payingTarget.total)}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select method...</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="eSewa">eSewa</option>
                  <option value="Khalti">Khalti</option>
                  <option value="Online Transfer">Online Transfer</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setPayingTarget(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkPaid}
                disabled={updating || !paymentMethod}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all disabled:opacity-50"
              >
                {updating ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Create Invoice</h3>
                  <p className="text-xs text-slate-400">Generate a new patient invoice</p>
                </div>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4">
              {/* Patient */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Patient <span className="text-red-500">*</span>
                </label>
                <select
                  value={invoiceForm.patientId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, patientId: e.target.value, appointmentId: "" })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.user.name}</option>
                  ))}
                </select>
              </div>

              {/* Appointment */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Appointment <span className="text-red-500">*</span>
                </label>
                <select
                  value={invoiceForm.appointmentId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, appointmentId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  disabled={!invoiceForm.patientId}
                >
                  <option value="">Select appointment...</option>
                  {filteredAppointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {formatDate(a.date)} {a.time} — {a.doctor.user.name}{a.reason ? ` (${a.reason})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount & Tax */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Amount (NPR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={invoiceForm.amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tax (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={invoiceForm.tax}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, tax: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
                <select
                  value={invoiceForm.paymentMethod}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select payment method...</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="eSewa">eSewa</option>
                  <option value="Khalti">Khalti</option>
                  <option value="Online Transfer">Online Transfer</option>
                </select>
              </div>

              {/* Total Preview */}
              {invoiceForm.amount && (
                <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="text-sm text-slate-600 space-y-0.5">
                    <p>Base: <span className="font-medium">NPR {baseAmount.toFixed(2)}</span></p>
                    <p>Tax ({invoiceForm.tax}%): <span className="font-medium">NPR {taxAmount.toFixed(2)}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-600 font-medium">Total</p>
                    <p className="text-xl font-bold text-emerald-700">NPR {totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInvoice}
                disabled={creating || !invoiceForm.patientId || !invoiceForm.appointmentId || !invoiceForm.amount}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : <><Receipt className="h-4 w-4" /> Create Invoice</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
