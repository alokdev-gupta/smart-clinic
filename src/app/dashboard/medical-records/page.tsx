"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { FileText, Eye, X, Pill } from "lucide-react";
import DataTable from "@/components/shared/DataTable";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Prescription {
  id: string;
  medicineName: string;
  dosage: string;
  duration: string;
  instructions?: string | null;
}

interface MedicalRecord {
  id: string;
  diagnosis: string;
  prescription?: string | null;
  labResults?: string | null;
  followUpDate?: string | null;
  createdAt: string;
  patient: { user: { name: string } };
  doctor: { user: { name: string } };
  prescriptions: Prescription[];
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MedicalRecord | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/medical-records");
      if (!res.ok) throw new Error();
      setRecords(await res.json());
    } catch {
      toast.error("Failed to load medical records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const columns = [
    {
      key: "patient",
      label: "Patient",
      render: (_: unknown, row: MedicalRecord) => (
        <span className="font-medium text-slate-800">{row.patient.user.name}</span>
      ),
    },
    {
      key: "doctor",
      label: "Doctor",
      render: (_: unknown, row: MedicalRecord) => (
        <span className="text-slate-600">{row.doctor.user.name}</span>
      ),
    },
    {
      key: "diagnosis",
      label: "Diagnosis",
      render: (_: unknown, row: MedicalRecord) => (
        <span className="text-slate-700 block max-w-[220px] truncate" title={row.diagnosis}>
          {row.diagnosis.length > 50 ? row.diagnosis.slice(0, 50) + "…" : row.diagnosis}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (_: unknown, row: MedicalRecord) => (
        <span className="text-slate-500 text-sm">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: "followUpDate",
      label: "Follow Up",
      render: (_: unknown, row: MedicalRecord) => (
        <span className="text-slate-500 text-sm">
          {row.followUpDate ? formatDate(row.followUpDate) : <span className="text-slate-300">—</span>}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: MedicalRecord) => (
        <button
          onClick={() => setSelected(row)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700
            hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" /> View
        </button>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Medical Records</h1>
        <p className="text-slate-500 text-sm mt-0.5">{records.length} records total</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <DataTable
          columns={columns as unknown as Parameters<typeof DataTable>[0]["columns"]}
          data={records as unknown as Record<string, unknown>[]}
          searchable
          searchPlaceholder="Search by patient name..."
          emptyMessage="No medical records found"
        />
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-500" />
              Medical Record Details
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-0.5">Patient</p>
                  <p className="text-sm font-semibold text-slate-800">{selected.patient.user.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-0.5">Doctor</p>
                  <p className="text-sm font-semibold text-slate-800">{selected.doctor.user.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-0.5">Date</p>
                  <p className="text-sm text-slate-700">{formatDate(selected.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-0.5">Follow Up</p>
                  <p className="text-sm text-slate-700">
                    {selected.followUpDate ? formatDate(selected.followUpDate) : "—"}
                  </p>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Diagnosis</h3>
                <p className="text-sm text-slate-700 bg-red-50 border border-red-100 rounded-xl p-3">
                  {selected.diagnosis}
                </p>
              </div>

              {/* Prescription notes */}
              {selected.prescription && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Prescription Notes</h3>
                  <p className="text-sm text-slate-600 bg-blue-50 border border-blue-100 rounded-xl p-3 whitespace-pre-wrap">
                    {selected.prescription}
                  </p>
                </div>
              )}

              {/* Lab Results */}
              {selected.labResults && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Lab Results</h3>
                  <p className="text-sm text-slate-600 bg-yellow-50 border border-yellow-100 rounded-xl p-3 whitespace-pre-wrap">
                    {selected.labResults}
                  </p>
                </div>
              )}

              {/* Prescriptions */}
              {selected.prescriptions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Pill className="h-4 w-4 text-emerald-500" />
                    Prescribed Medicines ({selected.prescriptions.length})
                  </h3>
                  <div className="space-y-2">
                    {selected.prescriptions.map((rx) => (
                      <div key={rx.id} className="p-3 rounded-xl border border-slate-200 bg-white">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-slate-800">{rx.medicineName}</p>
                          <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                            {rx.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>Dosage: <span className="font-medium text-slate-700">{rx.dosage}</span></span>
                          {rx.instructions && <span>· {rx.instructions}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
