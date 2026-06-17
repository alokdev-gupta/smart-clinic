"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/shared/StatusBadge";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Doctor {
  id: string;
  specialization: string;
  licenseNumber: string;
  experience: number;
  consultationFee: number;
  user: { id: string; name: string; email: string; createdAt: string };
  appointments: Array<{
    id: string; date: string; time: string; status: string; reason?: string | null;
    patient: { user: { name: string } };
  }>;
  medicalRecords: Array<{
    id: string; diagnosis: string; createdAt: string;
    patient: { user: { name: string } };
  }>;
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-slate-800">{value ?? <span className="text-slate-300 italic">Not provided</span>}</p>
    </div>
  );
}

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDoctor = useCallback(async () => {
    try {
      const res = await fetch(`/api/doctors/${id}`);
      if (!res.ok) throw new Error();
      setDoctor(await res.json());
    } catch {
      toast.error("Failed to load doctor");
      router.push("/dashboard/doctors");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchDoctor(); }, [fetchDoctor]);

  if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
  if (!doctor) return null;

  // Unique patients from appointments
  const uniquePatients = Array.from(
    new Map(doctor.appointments.map((a) => [a.patient.user.name, a])).values()
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/doctors" className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{doctor.user.name}</h1>
          <p className="text-slate-500 text-sm">{doctor.specialization} · {doctor.licenseNumber}</p>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl h-auto gap-1">
          {["profile", "appointments", "patients"].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="rounded-lg px-4 py-2 text-sm font-medium capitalize data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
                {doctor.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{doctor.user.name}</h2>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">{doctor.specialization}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div>
                <InfoRow label="Full Name" value={doctor.user.name} />
                <InfoRow label="Email" value={doctor.user.email} />
                <InfoRow label="Specialization" value={doctor.specialization} />
                <InfoRow label="License Number" value={doctor.licenseNumber} />
              </div>
              <div>
                <InfoRow label="Experience" value={`${doctor.experience} years`} />
                <InfoRow label="Consultation Fee" value={formatCurrency(doctor.consultationFee)} />
                <InfoRow label="Joined" value={formatDate(doctor.user.createdAt)} />
                <InfoRow label="Total Appointments" value={doctor.appointments.length} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="mt-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Appointments ({doctor.appointments.length})</h3>
            </div>
            {doctor.appointments.length === 0 ? (
              <EmptyState title="No appointments" description="This doctor has no appointments yet." />
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["Patient", "Date", "Time", "Status", "Reason"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {doctor.appointments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{a.patient.user.name}</td>
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

        <TabsContent value="patients" className="mt-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Unique Patients Seen ({uniquePatients.length})</h3>
            </div>
            {uniquePatients.length === 0 ? (
              <EmptyState title="No patients yet" description="This doctor hasn't seen any patients yet." />
            ) : (
              <div className="divide-y divide-slate-100">
                {uniquePatients.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
                      {a.patient.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{a.patient.user.name}</span>
                    <span className="ml-auto text-xs text-slate-400">{formatDate(a.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
