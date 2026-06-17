"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  medicalHistory: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{children}</h2>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function FormField({ label, required, children, error }: { label: string; required?: boolean; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white placeholder-slate-400";
const selectCls = inputCls + " cursor-pointer";

export default function NewPatientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to register patient");
        return;
      }
      toast.success("Patient registered successfully!");
      router.push("/dashboard/patients");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/patients"
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-500
            hover:text-slate-700 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Register New Patient</h1>
          <p className="text-slate-500 text-sm mt-0.5">Create a new patient record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Personal Information */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionTitle>Personal Information</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full Name" required error={errors.name?.message}>
              <input {...register("name")} placeholder="Patient full name" className={inputCls} />
            </FormField>
            <FormField label="Email Address" required error={errors.email?.message}>
              <input {...register("email")} type="email" placeholder="patient@email.com" className={inputCls} />
            </FormField>
            <FormField label="Date of Birth" error={errors.dateOfBirth?.message}>
              <input {...register("dateOfBirth")} type="date" className={selectCls} />
            </FormField>
            <FormField label="Gender" error={errors.gender?.message}>
              <select {...register("gender")} className={selectCls}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
            <FormField label="Blood Group" error={errors.bloodGroup?.message}>
              <select {...register("bloodGroup")} className={selectCls}>
                <option value="">Select blood group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionTitle>Contact Information</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Phone Number" error={errors.phone?.message}>
              <input {...register("phone")} placeholder="+977-98XXXXXXXX" className={inputCls} />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Address" error={errors.address?.message}>
                <textarea {...register("address")} rows={2} placeholder="Street, City, Province" className={inputCls + " resize-none"} />
              </FormField>
            </div>
          </div>
        </div>

        {/* Section 3: Medical History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionTitle>Medical History</SectionTitle>
          <FormField label="Medical History" error={errors.medicalHistory?.message}>
            <textarea
              {...register("medicalHistory")}
              rows={4}
              placeholder="List any pre-existing conditions, allergies, past surgeries, or chronic diseases..."
              className={inputCls + " resize-none"}
            />
          </FormField>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/dashboard/patients"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white
              disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Registering...</>
            ) : (
              <><UserPlus className="h-4 w-4" /> Register Patient</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
