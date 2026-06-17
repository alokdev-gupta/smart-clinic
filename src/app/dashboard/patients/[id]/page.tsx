"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Edit2, Save, X, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/shared/StatusBadge";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Patient {
  id: string;
  phone?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  medicalHistory?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  dateOfBirth?: string | null;
  user: { id: string; name: string; email: string; createdAt: string };
  appointments: Array<{
    id: string; date: string; time: string; status: string; reason?: string | null;
    doctor: { user: { name: string } };
  }>;
  medicalRecords: Array<{
    id: string; diagnosis: string; createdAt: string; followUpDate?: string | null;
    doctor: { user: { name: string } };
  }>;
  invoices: Array<{
    id: string; amount: number; tax: number; total: number; status: string; issuedAt: string;
  }>;
}

const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-slate-800">{value || <span className="text-slate-300 italic">Not provided</span>}</p>
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", emergencyContact: "", medicalHistory: "" });

  const fetchPatient = useCallback(async () => {
    try {
      const res = await fetch(`/api/patients/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPatient(data);
      setForm({
        name: data.user.name,
        phone: data.phone || "",
        address: data.address || "",
        emergencyContact: data.emergencyContact || "",
        medicalHistory: data.medicalHistory || "",
      });
    } catch {
      toast.error("Failed to load patient");
      router.push("/dashboard/patients");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchPatient(); }, [fetchPatient]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Patient updated successfully");
      setEditing(false);
      fetchPatient();
    } catch {
      toast.error("Failed to update patient");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
  if (!patient) return null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patients" className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{patient.user.name}</h1>
          <p className="text-slate-500 text-sm">{patient.user.email}</p>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl h-auto gap-1">
          {["profile", "appointments", "medical-records", "invoices"].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="rounded-lg px-4 py-2 text-sm font-medium capitalize data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              {tab.replace("-", " ")}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {/* Avatar & edit button */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                  style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
                  {patient.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{patient.user.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {patient.bloodGroup && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full">{patient.bloodGroup}</span>
                    )}
                    {patient.gender && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full capitalize">{patient.gender}</span>
                    )}
                  </div>
                </div>
              </div>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ background: "#10B981" }}>
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Full Name", key: "name" },
                  { label: "Phone", key: "phone" },
                  { label: "Emergency Contact", key: "emergencyContact" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                    <input className={inputCls} value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Address</label>
                  <textarea className={inputCls + " resize-none"} rows={2} value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Medical History</label>
                  <textarea className={inputCls + " resize-none"} rows={3} value={form.medicalHistory}
                    onChange={(e) => setForm((f) => ({ ...f, medicalHistory: e.target.value }))} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <div>
                  <InfoRow label="Full Name" value={patient.user.name} />
                  <InfoRow label="Email" value={patient.user.email} />
                  <InfoRow label="Phone" value={patient.phone} />
                  <InfoRow label="Gender" value={patient.gender} />
                  <InfoRow label="Blood Group" value={patient.bloodGroup} />
                </div>
                <div>
                  <InfoRow label="Date of Birth" value={patient.dateOfBirth ? formatDate(patient.dateOfBirth) : null} />
                  <InfoRow label="Address" value={patient.address} />
                  <InfoRow label="Emergency Contact" value={patient.emergencyContact} />
                  <InfoRow label="Registered" value={formatDate(patient.user.createdAt)} />
                  <InfoRow label="Medical History" value={patient.medicalHistory} />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="mt-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Appointment History ({patient.appointments.length})</h3>
            </div>
            {patient.appointments.length === 0 ? (
              <EmptyState title="No appointments yet" description="This patient has no appointment history." />
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["Doctor", "Date", "Time", "Status", "Reason"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {patient.appointments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{a.doctor.user.name}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(a.date)}</td>
                      <td className="px-4 py-3 text-slate-600">{a.time}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3 text-slate-500">{a.reason || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        {/* Medical Records Tab */}
        <TabsContent value="medical-records" className="mt-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Medical Records ({patient.medicalRecords.length})</h3>
            </div>
            {patient.medicalRecords.length === 0 ? (
              <EmptyState title="No medical records" description="No medical records found for this patient." />
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["Doctor", "Diagnosis", "Date", "Follow Up"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {patient.medicalRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{r.doctor.user.name}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{r.diagnosis}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3 text-slate-500">{r.followUpDate ? formatDate(r.followUpDate) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="mt-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Billing History ({patient.invoices.length})</h3>
            </div>
            {patient.invoices.length === 0 ? (
              <EmptyState title="No invoices" description="No billing records found for this patient." />
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["Invoice ID", "Amount", "Tax", "Total", "Status", "Date"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {patient.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{inv.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3 text-slate-700">{formatCurrency(inv.amount)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(inv.tax)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(inv.total)}</td>
                      <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(inv.issuedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
