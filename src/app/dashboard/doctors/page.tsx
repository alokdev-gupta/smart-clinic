"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { UserPlus, Search, Stethoscope } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { formatCurrency } from "@/lib/utils";

interface Doctor {
  id: string;
  specialization: string;
  licenseNumber: string;
  experience: number;
  consultationFee: number;
  user: { name: string; email: string };
}

const SPEC_COLORS: Record<string, { bg: string; text: string; avatar: string }> = {
  Cardiology: { bg: "bg-red-50", text: "text-red-700", avatar: "#EF4444" },
  Orthopedics: { bg: "bg-blue-50", text: "text-blue-700", avatar: "#3B82F6" },
  "General Medicine": { bg: "bg-emerald-50", text: "text-emerald-700", avatar: "#10B981" },
  Pediatrics: { bg: "bg-yellow-50", text: "text-yellow-700", avatar: "#F59E0B" },
  Dermatology: { bg: "bg-pink-50", text: "text-pink-700", avatar: "#EC4899" },
  Neurology: { bg: "bg-purple-50", text: "text-purple-700", avatar: "#8B5CF6" },
  ENT: { bg: "bg-orange-50", text: "text-orange-700", avatar: "#F97316" },
  Gynecology: { bg: "bg-rose-50", text: "text-rose-700", avatar: "#F43F5E" },
};

const getSpecColor = (spec: string) =>
  SPEC_COLORS[spec] ?? { bg: "bg-slate-50", text: "text-slate-700", avatar: "#64748B" };

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/doctors");
      if (!res.ok) throw new Error();
      setDoctors(await res.json());
    } catch {
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const filtered = doctors.filter(
    (d) =>
      d.user.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Doctors</h1>
          <p className="text-slate-500 text-sm mt-0.5">{doctors.length} doctors on staff</p>
        </div>
        <Link
          href="/dashboard/doctors/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
        >
          <UserPlus className="h-4 w-4" /> Add Doctor
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-700
            outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      {/* Doctor Cards Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title={search ? "No doctors found" : "No doctors yet"}
          description={search ? `No results for "${search}"` : "Add your first doctor to get started."}
          icon={Stethoscope}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((doctor) => {
            const colors = getSpecColor(doctor.specialization);
            return (
              <div key={doctor.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col">
                {/* Avatar */}
                <div className="flex flex-col items-center text-center mb-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-3"
                    style={{ background: `linear-gradient(135deg, ${colors.avatar}, ${colors.avatar}CC)` }}
                  >
                    {doctor.user.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm leading-tight">{doctor.user.name}</h3>
                  <span className={`mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                    {doctor.specialization}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-2 flex-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Experience</span>
                    <span className="font-medium text-slate-700">{doctor.experience} yrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fee</span>
                    <span className="font-semibold text-emerald-600">{formatCurrency(doctor.consultationFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">License</span>
                    <span className="font-mono text-xs text-slate-500">{doctor.licenseNumber}</span>
                  </div>
                </div>

                {/* Action */}
                <Link
                  href={`/dashboard/doctors/${doctor.id}`}
                  className="mt-4 w-full py-2 rounded-xl text-xs font-semibold text-center transition-all
                    border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  View Profile
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
