"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2, CalendarPlus, ChevronDown, Search, Check } from "lucide-react";
import { format, addDays } from "date-fns";

interface Patient { id: string; user: { name: string } }
interface Doctor { id: string; specialization: string; user: { name: string }; consultationFee: number }

// Generate time slots 09:00 – 17:00 in 30-min increments
const ALL_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const hour = 9 + Math.floor(i / 2);
  const min = i % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${min}`;
});

function ComboBox({
  id,
  placeholder,
  options,
  value,
  onChange,
}: {
  id: string;
  placeholder: string;
  options: { value: string; label: string; sub?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(query.toLowerCase()) ||
      (o.sub && o.sub.toLowerCase().includes(query.toLowerCase()))
  );

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50
          text-sm text-left outline-none focus:border-emerald-500 transition-all hover:bg-white"
      >
        <span className={selected ? "text-slate-900" : "text-slate-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 w-full mt-1 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  autoFocus
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm outline-none bg-slate-50 rounded-lg border border-slate-200 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">No results</div>
              ) : (
                filtered.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{o.label}</p>
                      {o.sub && <p className="text-xs text-slate-400">{o.sub}</p>}
                    </div>
                    {value === o.value && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{children}</h2>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  // Fetch patients + doctors
  useEffect(() => {
    Promise.all([fetch("/api/patients"), fetch("/api/doctors")])
      .then(async ([p, d]) => {
        setPatients(await p.json());
        setDoctors(await d.json());
      })
      .catch(() => toast.error("Failed to load data"));
  }, []);

  // Fetch booked slots when doctor+date changes
  const fetchBookedSlots = useCallback(async () => {
    if (!doctorId || !date) { setBookedSlots([]); return; }
    try {
      const res = await fetch(`/api/appointments?doctorId=${doctorId}&date=${date}`);
      const appts: { time: string; status: string }[] = await res.json();
      setBookedSlots(appts.filter((a) => a.status !== "CANCELLED").map((a) => a.time));
    } catch {
      setBookedSlots([]);
    }
  }, [doctorId, date]);

  useEffect(() => { fetchBookedSlots(); }, [fetchBookedSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !doctorId || !date || !time) {
      toast.error("Please fill all required fields and select a time slot.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, doctorId, date, time, reason }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to book appointment");
        return;
      }
      toast.success("Appointment booked successfully!");
      router.push("/dashboard/appointments");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white";



  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/appointments" className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Book Appointment</h1>
          <p className="text-slate-500 text-sm mt-0.5">Schedule a new patient appointment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Patient & Doctor */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionTitle>Select Patient & Doctor</SectionTitle>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Patient <span className="text-red-500">*</span>
              </label>
              <ComboBox
                id="select-patient"
                placeholder="Search and select patient..."
                options={patients.map((p) => ({ value: p.id, label: p.user.name }))}
                value={patientId}
                onChange={setPatientId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Doctor <span className="text-red-500">*</span>
              </label>
              <ComboBox
                id="select-doctor"
                placeholder="Search and select doctor..."
                options={doctors.map((d) => ({
                  value: d.id,
                  label: d.user.name,
                  sub: d.specialization,
                }))}
                value={doctorId}
                onChange={(v) => { setDoctorId(v); setTime(""); }}
              />
              {selectedDoctor && (
                <p className="mt-1.5 text-xs text-emerald-600 font-medium">
                  {selectedDoctor.specialization} · Consultation: NPR {selectedDoctor.consultationFee.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionTitle>Select Date</SectionTitle>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Appointment Date <span className="text-red-500">*</span>
            </label>
            <input
              id="appointment-date"
              type="date"
              value={date}
              min={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => { setDate(e.target.value); setTime(""); }}
              className={inputCls + " cursor-pointer"}
            />
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionTitle>Select Time Slot</SectionTitle>
          {!doctorId || !date ? (
            <p className="text-sm text-slate-400 italic">Please select a doctor and date first.</p>
          ) : (
            <>
              <p className="text-xs text-slate-500 mb-3">
                Green = available · Gray = booked · Click to select
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {ALL_SLOTS.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setTime(slot)}
                      className={`py-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                        isBooked
                          ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through"
                          : isSelected
                          ? "border-emerald-500 text-white"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      }`}
                      style={isSelected ? { background: "#10B981" } : {}}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              {time && (
                <p className="mt-3 text-sm font-semibold text-emerald-600">
                  ✓ Selected: {time}
                </p>
              )}
            </>
          )}
        </div>

        {/* Reason */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionTitle>Reason for Visit</SectionTitle>
          <textarea
            id="appointment-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the reason for this appointment (optional)..."
            className={inputCls + " resize-none"}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/appointments" className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-70 hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            {isSubmitting
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Booking...</>
              : <><CalendarPlus className="h-4 w-4" /> Book Appointment</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
