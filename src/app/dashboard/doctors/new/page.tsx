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
  specialization: z.string().min(1, "Specialization is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  experience: z.string().min(1, "Experience is required"),
  consultationFee: z.string().min(1, "Fee is required"),
});

type FormValues = z.infer<typeof schema>;

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white placeholder-slate-400";

const SPECIALIZATIONS = [
  "Cardiology", "Orthopedics", "General Medicine", "Pediatrics",
  "Dermatology", "Neurology", "ENT", "Gynecology",
];

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
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function NewDoctorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { experience: "0", consultationFee: "0" },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        experience: Number(data.experience),
        consultationFee: Number(data.consultationFee),
      };
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to add doctor");
        return;
      }
      toast.success("Doctor added successfully!");
      router.push("/dashboard/doctors");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/doctors" className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Add New Doctor</h1>
          <p className="text-slate-500 text-sm mt-0.5">Register a new doctor to the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionTitle>Account Information</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full Name" required error={errors.name?.message}>
              <input {...register("name")} placeholder="Doctor Name" className={inputCls} />
            </FormField>
            <FormField label="Email Address" required error={errors.email?.message}>
              <input {...register("email")} type="email" placeholder="" className={inputCls} />
            </FormField>
          </div>
        </div>

        {/* Professional Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionTitle>Professional Information</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Specialization" required error={errors.specialization?.message}>
              <select {...register("specialization")} className={inputCls + " cursor-pointer"}>
                <option value="">Select specialization</option>
                {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="License Number (NMC)" required error={errors.licenseNumber?.message}>
              <input {...register("licenseNumber")} placeholder="NMC-12345" className={inputCls} />
            </FormField>
            <FormField label="Years of Experience" required error={errors.experience?.message}>
              <input {...register("experience")} type="number" min={0} placeholder="5" className={inputCls} />
            </FormField>
            <FormField label="Consultation Fee (NPR)" required error={errors.consultationFee?.message}>
              <input {...register("consultationFee")} type="number" min={0} placeholder="1500" className={inputCls} />
            </FormField>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/doctors" className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
            Cancel
          </Link>
          <button type="submit" disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-70 hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</> : <><UserPlus className="h-4 w-4" /> Add Doctor</>}
          </button>
        </div>
      </form>
    </div>
  );
}
