"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Printer, Download } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Invoice {
  id: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
  paymentMethod?: string | null;
  issuedAt: string;
  patient: { user: { name: string }; phone?: string | null; address?: string | null };
  appointment: {
    doctor: { user: { name: string }; specialization: string };
  };
}

interface ClinicSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<ClinicSettings | null>(null);

  const fetchInvoice = useCallback(async () => {
    try {
      const [res, settingsRes] = await Promise.all([
        fetch(`/api/billing/${id}`),
        fetch('/api/settings/clinic')
      ]);
      if (!res.ok) throw new Error();
      setInvoice(await res.json());
      if (settingsRes.ok) {
        setSettings(await settingsRes.json());
      }
    } catch {
      toast.error("Failed to load invoice");
      router.push("/dashboard/billing");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchInvoice(); }, [fetchInvoice]);

  if (loading) return <div className="flex justify-center items-center h-64 print:hidden"><LoadingSpinner size="lg" /></div>;
  if (!invoice) return null;

  const invoiceNum = invoice.id.slice(0, 8).toUpperCase();
  const taxAmount = (invoice.amount * invoice.tax) / 100;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `${invoice.patient.user.name}_Invoice`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 print:m-0 print:max-w-none print:space-y-0 print:p-0">
      {/* Screen-only Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/billing" className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Invoice #{invoiceNum}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            <Printer className="h-4 w-4" /> Print Invoice
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-12 print:border-none print:shadow-none print:p-12 print:w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-slate-100 pb-8 mb-8 print:flex-row print:pb-6 print:mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">C</div>
              <span className="text-2xl font-bold text-slate-800 tracking-tight">{settings?.name || "ClinicOS"}</span>
            </div>
            <p className="text-slate-500 text-sm">{settings?.address || "Biratnagar-1, Koshi Province, Nepal"}</p>
            <p className="text-slate-500 text-sm">Phone: {settings?.phone || "021-555555"} | {settings?.email || "clinic@clinicos.com"}</p>
          </div>
          <div className="mt-6 md:mt-0 md:text-right print:mt-0 print:text-right">
            <h2 className="text-3xl font-bold text-slate-200 uppercase tracking-widest print:text-slate-300">Invoice</h2>
            <p className="text-slate-800 font-semibold mt-1">#{invoiceNum}</p>
            <p className="text-slate-500 text-sm mt-1">Date: {formatDate(invoice.issuedAt)}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:grid-cols-2 print:gap-8 print:mb-8">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</h3>
            <p className="font-semibold text-slate-800 text-lg">{invoice.patient.user.name}</p>
            {invoice.patient.phone && <p className="text-slate-500 text-sm mt-1">{invoice.patient.phone}</p>}
            {invoice.patient.address && <p className="text-slate-500 text-sm mt-1">{invoice.patient.address}</p>}
          </div>
          <div className="md:text-right print:text-right">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Consulting Doctor</h3>
            <p className="font-semibold text-slate-800 text-lg">{invoice.appointment.doctor.user.name}</p>
            <p className="text-slate-500 text-sm mt-1">{invoice.appointment.doctor.specialization}</p>
          </div>
        </div>

        {/* Services Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="text-left py-3 px-2 text-sm font-bold text-slate-700">Description</th>
              <th className="text-right py-3 px-2 text-sm font-bold text-slate-700">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-4 px-2 text-slate-700 font-medium">
                Consultation Fee - {invoice.appointment.doctor.specialization}
              </td>
              <td className="py-4 px-2 text-right text-slate-700 font-medium">
                {formatCurrency(invoice.amount)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 print:flex-row">
          <div className="w-full md:w-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Details</h3>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-slate-500">Status:</span>
              <div className="print:hidden"><StatusBadge status={invoice.status} /></div>
              {/* Fallback for print (badges lose background colors in some print settings) */}
              <span className="hidden print:inline-block font-bold text-sm" style={{ color: invoice.status === "PAID" ? "#10B981" : "#F59E0B" }}>
                {invoice.status}
              </span>
            </div>
            {invoice.paymentMethod && (
              <p className="text-sm text-slate-500">Method: <span className="font-semibold text-slate-700">{invoice.paymentMethod}</span></p>
            )}
          </div>

          <div className="w-full md:w-1/3 space-y-3 print:w-1/3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-700">{formatCurrency(invoice.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tax ({invoice.tax}%)</span>
              <span className="font-medium text-slate-700">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-slate-200 pt-3">
              <span className="font-bold text-slate-800 text-lg">Total</span>
              <span className="font-bold text-emerald-600 text-xl">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-100 text-center print:mt-12 print:pt-6">
          <p className="text-sm font-medium text-slate-800">Thank you for choosing ClinicOS.</p>
          <p className="text-xs text-slate-400 mt-1">Generated electronically on {formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    </div>
  );
}
