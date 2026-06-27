"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { UserPlus, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { formatDate } from "@/lib/utils";

interface Patient {
  id: string;
  bloodGroup?: string | null;
  gender?: string | null;
  phone?: string | null;
  user: { id: string; name: string; email: string; createdAt: string };
}

const BLOOD_GROUP_COLORS: Record<string, string> = {
  "A+": "bg-red-100 text-red-700",
  "A-": "bg-red-100 text-red-700",
  "B+": "bg-blue-100 text-blue-700",
  "B-": "bg-blue-100 text-blue-700",
  "AB+": "bg-purple-100 text-purple-700",
  "AB-": "bg-purple-100 text-purple-700",
  "O+": "bg-emerald-100 text-emerald-700",
  "O-": "bg-emerald-100 text-emerald-700",
};

export default function PatientsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/patients");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPatients(data);
    } catch {
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/patients/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success(`${deleteTarget.user.name} removed successfully`);
      setDeleteTarget(null);
      fetchPatients();
    } catch {
      toast.error("Failed to delete patient");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Patient",
      render: (_: unknown, row: Patient) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            {row.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-800">{row.user.name}</p>
            <p className="text-xs text-slate-400">{row.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (_: unknown, row: Patient) => (
        <span className="text-slate-600">{row.phone || <span className="text-slate-300">—</span>}</span>
      ),
    },
    {
      key: "bloodGroup",
      label: "Blood Group",
      render: (_: unknown, row: Patient) =>
        row.bloodGroup ? (
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${BLOOD_GROUP_COLORS[row.bloodGroup] ?? "bg-slate-100 text-slate-600"}`}>
            {row.bloodGroup}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      key: "gender",
      label: "Gender",
      render: (_: unknown, row: Patient) => (
        <span className="text-slate-600 capitalize">{row.gender || <span className="text-slate-300">—</span>}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Registered",
      render: (_: unknown, row: Patient) => (
        <span className="text-slate-500 text-sm">{formatDate(row.user.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: Patient) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/patients/${row.id}`}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700
              hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
          >
            View
          </Link>
          {/* Delete button — ADMIN only */}
          {isAdmin && (
            <button
              onClick={() => setDeleteTarget(row)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600
                hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isAdmin ? "Manage and view all registered patients" : "View patient records"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
            <Users className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">{patients.length} Total</span>
          </div>
          {/* Register button — ADMIN only */}
          {isAdmin && (
            <Link
              href="/dashboard/patients/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                transition-all hover:opacity-90 hover:shadow-md"
              style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
            >
              <UserPlus className="h-4 w-4" />
              Register Patient
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <DataTable
          columns={columns as unknown as Parameters<typeof DataTable>[0]["columns"]}
          data={patients as unknown as Record<string, unknown>[]}
          searchable
          searchPlaceholder="Search patients by name or email..."
          emptyMessage="No patients registered yet"
        />
      </div>

      {isAdmin && (
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Patient"
          description={`Are you sure you want to delete "${deleteTarget?.user.name}"? This will also delete their user account and cannot be undone.`}
          confirmLabel="Delete Patient"
          isLoading={deleting}
        />
      )}
    </div>
  );
}
