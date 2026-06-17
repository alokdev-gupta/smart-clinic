import Link from "next/link";
import { ArrowRight } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { Calendar } from "lucide-react";

interface RecentAppointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
}

interface RecentAppointmentsProps {
  appointments: RecentAppointment[];
}

export default function RecentAppointments({ appointments }: RecentAppointmentsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            Recent Appointments
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Latest 5 appointments</p>
        </div>
        <Link
          href="/dashboard/appointments"
          className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "#10B981" }}
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Table */}
      {appointments.length === 0 ? (
        <EmptyState
          title="No appointments yet"
          description="Appointments will appear here once created."
          icon={Calendar}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F8FAFC" }} className="border-b border-slate-100">
                {["Patient", "Doctor", "Date", "Time", "Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {appointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{
                          background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                        }}
                      >
                        {appt.patientName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">
                        {appt.patientName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {appt.doctorName}
                  </td>
                  <td className="px-6 py-4 text-slate-600 tabular-nums">
                    {appt.date}
                  </td>
                  <td className="px-6 py-4 text-slate-600 tabular-nums">
                    {appt.time}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={appt.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
