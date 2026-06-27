"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials. Please check your email and password.");
      } else if (result?.ok) {
        toast.success("Login successful! Redirecting...");
        // Use window.location to force a hard navigation and ensure the session cookie is sent
        window.location.href = "/dashboard";
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      {/* Card */}
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 w-full"
        style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 mb-4 flex items-center justify-center">
            <img 
              src="/star-logo.png" 
              alt="Madan Bhandari Clinic Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1
            className="text-2xl font-bold tracking-tight text-center"
            style={{ color: "#10B981" }}
          >
            Madan Bhandari Clinic
          </h1>
          <p className="text-slate-500 text-sm mt-1 text-center">
            Smart Clinic Management System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@clinic.com"
                {...register("email")}
                className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none
                  border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                {...register("password")}
                className="w-full pl-10 pr-12 py-3 rounded-xl border text-sm transition-all outline-none
                  border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white text-sm transition-all duration-200
              flex items-center justify-center gap-2 mt-2
              disabled:opacity-70 disabled:cursor-not-allowed
              hover:opacity-90 active:scale-[0.99]"
            style={{
              background: isLoading
                ? "#10B981"
                : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.4)",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Login Info */}
        <div className="mt-5 p-3 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1.5">
          <p className="text-xs text-emerald-700 font-semibold text-center mb-2">🔐 Role-Based Access</p>
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Admin</span>
            <span className="text-slate-500">Full access + delete</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">Doctor</span>
            <span className="text-slate-500">Read + Create + Update</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Patient</span>
            <span className="text-slate-500">View own data + Book</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">📍 Morang, Nepal</p>
        </div>
      </div>

      {/* Version tag */}
      <p className="text-center text-slate-500 text-xs mt-4 opacity-60">
        Madan Bhandari Clinic v1.0 &mdash; © 2026 All rights reserved
      </p>
    </div>
  );
}
