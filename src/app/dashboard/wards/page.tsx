"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { BedDouble, Plus, AlertCircle, Building2 } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EmptyState from "@/components/shared/EmptyState";

interface Ward {
  id: string;
  name: string;
  floor: number;
  totalBeds: number;
  availableBeds: number;
  type: string;
  beds: Array<{
    id: string;
    bedNumber: string;
    isOccupied: boolean;
    patient?: { id: string; user: { name: string } } | null;
  }>;
}

interface Patient { id: string; user: { name: string } }

const WARD_COLORS: Record<string, string> = {
  GENERAL: "bg-blue-50 text-blue-700",
  ICU: "bg-red-50 text-red-700",
  PRIVATE: "bg-purple-50 text-purple-700",
  EMERGENCY: "bg-orange-50 text-orange-700",
};

const inputCls = "w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

export default function WardsPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Add Ward form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", floor: 1, totalBeds: 10, type: "GENERAL" });

  // Admit/Discharge Dialogs
  const [admitBed, setAdmitBed] = useState<{ id: string; bedNumber: string } | null>(null);
  const [admitPatientId, setAdmitPatientId] = useState("");
  const [dischargeBed, setDischargeBed] = useState<{ id: string; bedNumber: string; patientName: string } | null>(null);
  const [updatingBed, setUpdatingBed] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [wRes, pRes] = await Promise.all([fetch("/api/wards"), fetch("/api/patients")]);
      setWards(await wRes.json());
      setPatients(await pRes.json());
    } catch {
      toast.error("Failed to load wards data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Available patients (not admitted)
  const availablePatients = useMemo(() => {
    const admittedIds = new Set(
      wards.flatMap((w) => w.beds.filter((b) => b.isOccupied && b.patient).map((b) => b.patient!.id))
    );
    return patients.filter((p) => !admittedIds.has(p.id));
  }, [patients, wards]);

  const handleAddWard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/wards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Ward added successfully");
      setIsFormOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to create ward");
    } finally {
      setSaving(false);
    }
  };

  const handleAdmit = async () => {
    if (!admitBed || !admitPatientId) return;
    setUpdatingBed(true);
    try {
      await fetch(`/api/wards/beds/${admitBed.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "admit", patientId: admitPatientId }),
      });
      toast.success("Patient admitted to bed");
      setAdmitBed(null);
      setAdmitPatientId("");
      fetchData();
    } catch {
      toast.error("Failed to admit patient");
    } finally {
      setUpdatingBed(false);
    }
  };

  const handleDischarge = async () => {
    if (!dischargeBed) return;
    setUpdatingBed(true);
    try {
      await fetch(`/api/wards/beds/${dischargeBed.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "discharge" }),
      });
      toast.success("Patient discharged");
      setDischargeBed(null);
      fetchData();
    } catch {
      toast.error("Failed to discharge patient");
    } finally {
      setUpdatingBed(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ward & Bed Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage inpatient wards and bed occupancy</p>
        </div>
        <button
          onClick={() => { setForm({ name: "", floor: 1, totalBeds: 10, type: "GENERAL" }); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm"
          style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
        >
          <Building2 className="h-4 w-4" /> Add Ward
        </button>
      </div>

      {wards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12">
          <EmptyState
            title="No wards configured"
            description="Create your first ward to start admitting patients."
            icon={Building2}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {wards.map((ward) => {
            const occPercent = Math.round(((ward.totalBeds - ward.availableBeds) / ward.totalBeds) * 100);
            return (
              <div key={ward.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 text-lg">{ward.name}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${WARD_COLORS[ward.type] || "bg-slate-100"}`}>
                        {ward.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">Floor {ward.floor}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      <span className="text-lg font-bold text-slate-800">{ward.availableBeds}</span> / {ward.totalBeds} Available
                    </p>
                    <div className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${occPercent}%`, background: occPercent > 90 ? "#EF4444" : "#10B981" }} />
                    </div>
                  </div>
                </div>

                {/* Bed Grid */}
                <div className="p-5 bg-slate-50/50 flex-1">
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 xl:grid-cols-8 gap-3">
                    {ward.beds.map((bed) => (
                      <button
                        key={bed.id}
                        onClick={() => {
                          if (bed.isOccupied) setDischargeBed({ id: bed.id, bedNumber: bed.bedNumber, patientName: bed.patient?.user.name || "Unknown" });
                          else setAdmitBed({ id: bed.id, bedNumber: bed.bedNumber });
                        }}
                        className={`group relative aspect-square rounded-full flex flex-col items-center justify-center border-2 transition-all hover:scale-105 shadow-sm ${
                          bed.isOccupied
                            ? "bg-red-50 border-red-500 text-red-700 hover:bg-red-100"
                            : "bg-emerald-50 border-emerald-500 text-emerald-700 hover:bg-emerald-100"
                        }`}
                        title={bed.isOccupied ? `Occupied by ${bed.patient?.user.name}` : "Available"}
                      >
                        <BedDouble className="h-4 w-4 mb-0.5 opacity-80" />
                        <span className="text-[10px] font-bold tracking-tighter">{bed.bedNumber}</span>
                        {/* Tooltip */}
                        {bed.isOccupied && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                            {bed.patient?.user.name}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Ward Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New Ward</DialogTitle></DialogHeader>
          <form onSubmit={handleAddWard} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Ward Name *</label>
              <input required placeholder="e.g. Ward A" className={inputCls} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Floor *</label>
                <input required type="number" min="0" className={inputCls} value={form.floor} onChange={e => setForm({...form, floor: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Total Beds *</label>
                <input required type="number" min="1" max="100" className={inputCls} value={form.totalBeds} onChange={e => setForm({...form, totalBeds: Number(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Ward Type *</label>
              <select className={inputCls} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="GENERAL">General Ward</option>
                <option value="ICU">Intensive Care Unit (ICU)</option>
                <option value="PRIVATE">Private Room</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl disabled:opacity-50">
                {saving ? "Saving..." : "Create Ward"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admit Patient Dialog */}
      <Dialog open={!!admitBed} onOpenChange={(open) => !open && setAdmitBed(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Admit Patient to {admitBed?.bedNumber}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            {availablePatients.length === 0 ? (
              <div className="p-4 bg-orange-50 text-orange-700 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">No eligible patients available to admit. All registered patients are currently admitted.</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Patient</label>
                <select className={inputCls} value={admitPatientId} onChange={e => setAdmitPatientId(e.target.value)}>
                  <option value="">Select a patient...</option>
                  {availablePatients.map(p => <option key={p.id} value={p.id}>{p.user.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setAdmitBed(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
              <button
                onClick={handleAdmit}
                disabled={!admitPatientId || updatingBed}
                className="px-4 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg disabled:opacity-50 transition-colors"
              >
                {updatingBed ? "Admitting..." : "Admit Patient"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discharge Patient Dialog */}
      <Dialog open={!!dischargeBed} onOpenChange={(open) => !open && setDischargeBed(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Discharge Patient</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 text-sm mb-6">
              Are you sure you want to discharge <span className="font-bold text-slate-800">{dischargeBed?.patientName}</span> from bed <span className="font-bold">{dischargeBed?.bedNumber}</span>? This will make the bed available.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDischargeBed(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
              <button
                onClick={handleDischarge}
                disabled={updatingBed}
                className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50 transition-colors"
              >
                {updatingBed ? "Discharging..." : "Confirm Discharge"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
