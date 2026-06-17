"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User, Info, Save, Loader2, Eye, EyeOff } from "lucide-react";

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 pr-11";

export default function SettingsPage() {
  const [savingClinic, setSavingClinic] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [loading, setLoading] = useState(true);

  const [clinic, setClinic] = useState({
    name: "Madan Bhandari Clinic",
    address: "Biratnagar, Nepal",
    phone: "021-555555",
    email: "info@madanbhandariclinic.com",
    website: "www.madanbhandariclinic.com",
  });

  const [pwd, setPwd] = useState({ current: "", new: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    fetch("/api/settings/clinic")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setClinic({
            name: data.name || "",
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || "",
            website: data.website || ""
          });
        }
      })
      .catch(err => console.error("Failed to load settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingClinic(true);
    try {
      const res = await fetch("/api/settings/clinic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clinic)
      });
      if (res.ok) {
        toast.success("Clinic information updated successfully");
      } else {
        toast.error("Failed to update clinic information");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSavingClinic(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.new !== pwd.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPwd(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.new }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password changed successfully");
        setPwd({ current: "", new: "", confirm: "" });
        setShowPwd({ current: false, new: false, confirm: false });
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your clinic preferences and account settings</p>
      </div>

      <Tabs defaultValue="clinic" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <TabsList className="bg-slate-100 p-1 rounded-xl h-auto flex max-w-md">
            <TabsTrigger value="clinic" className="flex-1 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Building2 className="w-4 h-4 mr-2 inline-block" /> Clinic Info
            </TabsTrigger>
            <TabsTrigger value="account" className="flex-1 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <User className="w-4 h-4 mr-2 inline-block" /> Account
            </TabsTrigger>
            <TabsTrigger value="about" className="flex-1 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Info className="w-4 h-4 mr-2 inline-block" /> About
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-6">
          <TabsContent value="clinic" className="mt-0 outline-none">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Clinic Details</h2>
            <form onSubmit={handleSaveClinic} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Clinic Name</label>
                  <input className={inputCls} value={clinic.name} onChange={e => setClinic({...clinic, name: e.target.value})} required />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                  <input className={inputCls} value={clinic.address} onChange={e => setClinic({...clinic, address: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                  <input className={inputCls} value={clinic.phone} onChange={e => setClinic({...clinic, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <input type="email" className={inputCls} value={clinic.email} onChange={e => setClinic({...clinic, email: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
                  <input className={inputCls} value={clinic.website} onChange={e => setClinic({...clinic, website: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={savingClinic} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all bg-emerald-500 disabled:opacity-50">
                  {savingClinic ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                </button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="account" className="mt-0 outline-none">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Change Password</h2>
            <form onSubmit={handleSavePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                <div className="relative">
                  <input
                    type={showPwd.current ? "text" : "password"}
                    required
                    className={inputCls}
                    value={pwd.current}
                    onChange={e => setPwd({...pwd, current: e.target.value})}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(s => ({...s, current: !s.current}))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPwd.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPwd.new ? "text" : "password"}
                    required
                    minLength={6}
                    className={inputCls}
                    value={pwd.new}
                    onChange={e => setPwd({...pwd, new: e.target.value})}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(s => ({...s, new: !s.new}))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPwd.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPwd.confirm ? "text" : "password"}
                    required
                    minLength={6}
                    className={inputCls}
                    value={pwd.confirm}
                    onChange={e => setPwd({...pwd, confirm: e.target.value})}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(s => ({...s, confirm: !s.confirm}))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPwd.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" disabled={savingPwd} className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all bg-emerald-500 disabled:opacity-50">
                  {savingPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                </button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="about" className="mt-0 outline-none">
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-emerald-500/20">
                  {clinic.name ? clinic.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{clinic.name || "Madan Bhandari Clinic"}</h2>
                  <p className="text-slate-500">Version 1.0.0</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">About the System</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {clinic.name || "Madan Bhandari Clinic"} is a comprehensive Smart Clinic Management System designed to streamline healthcare operations. It handles patient records, appointments, doctor schedules, medical records, billing, inventory, and ward management in a single unified interface.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Technology Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {["Next.js 16", "React", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL", "NextAuth.js", "shadcn/ui"].map(tech => (
                    <span key={tech} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">{tech}</span>
                  ))}
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-400">© 2026 {clinic.name || "Madan Bhandari Clinic"}. All rights reserved.</p>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
