"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarDays, List, ChevronLeft, ChevronRight, CalendarPlus, X
} from "lucide-react";
import { useSession } from "next-auth/react";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/utils";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameDay, isSameMonth, addMonths, subMonths,
} from "date-fns";

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  reason?: string | null;
  patient: { user: { name: string } };
  doctor: { id: string; user: { name: string } };
}

interface Doctor { id: string; user: { name: string } }

const STATUS_DOT: Record<string, string> = {
  CONFIRMED: "#10B981",
  PENDING: "#F59E0B",
  CANCELLED: "#EF4444",
  COMPLETED: "#94A3B8",
};

const STATUS_OPTIONS = ["", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const isPatient = session?.user?.role === "PATIENT";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "calendar">("list");

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Status update
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [apptRes, docRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/doctors"),
      ]);
      setAppointments(await apptRes.json());
      setDoctors(await docRes.json());
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (doctorFilter && a.doctor.id !== doctorFilter) return false;
      return true;
    });
  }, [appointments, statusFilter, doctorFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/appointments/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("Appointment deleted");
      setDeleteTarget(null);
      fetchAll();
    } catch {
      toast.error("Failed to delete appointment");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast.success(`Status updated to ${status}`);
      fetchAll();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const appointmentsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    filtered.forEach((a) => {
      const key = format(new Date(a.date), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return map;
  }, [filtered]);

  const selectedDayAppts = selectedDay
    ? filtered.filter((a) => isSameDay(new Date(a.date), selectedDay))
    : [];

  // Table columns
  const columns = [
    {
      key: "patient",
      label: "Patient",
      render: (_: unknown, row: Appointment) => (
        <span className="font-medium text-slate-800">{row.patient.user.name}</span>
      ),
    },
    {
      key: "doctor",
      label: "Doctor",
      render: (_: unknown, row: Appointment) => (
        <span className="text-slate-600">{row.doctor.user.name}</span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (_: unknown, row: Appointment) => (
        <span className="text-slate-600">{formatDate(row.date)}</span>
      ),
    },
    {
      key: "time",
      label: "Time",
      render: (_: unknown, row: Appointment) => (
        <span className="text-slate-600">{row.time}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_: unknown, row: Appointment) => <StatusBadge status={row.status} />,
    },
    {
      key: "reason",
      label: "Reason",
      render: (_: unknown, row: Appointment) => (
        <span className="text-slate-500 text-sm truncate max-w-[150px] block">{row.reason || "—"}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: Appointment) => (
        <div className="flex items-center gap-2">
          {!isPatient && (
            <select
              disabled={updatingId === row.id}
              value={row.status}
              onChange={(e) => handleStatusUpdate(row.id, e.target.value)}
              className="text-xs rounded-lg border border-slate-200 px-2 py-1.5 bg-white text-slate-700 outline-none cursor-pointer focus:border-emerald-500"
            >
              {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
          {isAdmin && (
            <button
              onClick={() => setDeleteTarget(row)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          )}
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
          <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} appointments</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === "list" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === "calendar" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <CalendarDays className="h-3.5 w-3.5" /> Calendar
            </button>
          </div>
          <Link
            href="/dashboard/appointments/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            <CalendarPlus className="h-4 w-4" /> New Appointment
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="">All Doctors</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.user.name}</option>)}
        </select>
        {(statusFilter || doctorFilter) && (
          <button
            onClick={() => { setStatusFilter(""); setDoctorFilter(""); }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <DataTable
            columns={columns as unknown as Parameters<typeof DataTable>[0]["columns"]}
            data={filtered as unknown as Record<string, unknown>[]}
            searchable
            searchPlaceholder="Search by patient or doctor name..."
            emptyMessage="No appointments found"
          />
        </div>
      )}

      {/* CALENDAR VIEW */}
      {view === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all">
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <h3 className="font-semibold text-slate-800">{format(currentMonth, "MMMM yyyy")}</h3>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all">
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayAppts = appointmentsByDay[key] || [];
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDay && isSameDay(day, selectedDay);

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(0)) ? null : day)}
                    className={`min-h-[60px] p-1.5 border border-slate-100 text-left transition-all hover:bg-slate-50 ${
                      isSelected ? "bg-emerald-50 border-emerald-200" : ""
                    }`}
                  >
                    <span className={`text-xs font-medium block mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? "bg-emerald-500 text-white" :
                      isCurrentMonth ? "text-slate-700" : "text-slate-300"
                    }`}>
                      {format(day, "d")}
                    </span>
                    <div className="flex flex-wrap gap-0.5">
                      {dayAppts.slice(0, 3).map((a, i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ background: STATUS_DOT[a.status] ?? "#94A3B8" }}
                        />
                      ))}
                      {dayAppts.length > 3 && (
                        <span className="text-[9px] text-slate-400">+{dayAppts.length - 3}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
              {Object.entries(STATUS_DOT).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-xs text-slate-500 capitalize">{status.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            {selectedDay ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">{format(selectedDay, "dd MMM yyyy")}</h3>
                  <span className="text-xs text-slate-400">{selectedDayAppts.length} appt{selectedDayAppts.length !== 1 ? "s" : ""}</span>
                </div>
                {selectedDayAppts.length === 0 ? (
                  <EmptyState title="No appointments" description="Nothing scheduled for this day." />
                ) : (
                  <div className="space-y-3">
                    {selectedDayAppts.map((a) => (
                      <div key={a.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-emerald-200 transition-colors">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-semibold text-slate-800">{a.patient.user.name}</p>
                          <StatusBadge status={a.status} />
                        </div>
                        <p className="text-xs text-slate-500">{a.doctor.user.name}</p>
                        <p className="text-xs font-medium text-emerald-600 mt-1">{a.time}</p>
                        {a.reason && <p className="text-xs text-slate-400 mt-1 truncate">{a.reason}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="Select a day"
                description="Click on any day in the calendar to see appointments."
              />
            )}
          </div>
        </div>
      )}

      {isAdmin && (
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Appointment"
          description={`Delete this appointment for "${deleteTarget?.patient.user.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          isLoading={deleting}
        />
      )}
    </div>
  );
}
