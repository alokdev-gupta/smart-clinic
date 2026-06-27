"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Receipt,
  Package,
  Building2,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles: string[]; // which roles can see this item
}

interface NavGroup {
  title: string;
  items: NavItem[];
  roles: string[]; // which roles can see this group
}

const navGroups: NavGroup[] = [
  {
    title: "OVERVIEW",
    roles: ["ADMIN", "DOCTOR", "PATIENT"],
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: ["ADMIN", "DOCTOR", "PATIENT"] },
    ],
  },
  {
    title: "CLINICAL",
    roles: ["ADMIN", "DOCTOR", "PATIENT"],
    items: [
      { icon: Users, label: "Patients", href: "/dashboard/patients", roles: ["ADMIN", "DOCTOR"] },
      { icon: UserCheck, label: "Doctors", href: "/dashboard/doctors", roles: ["ADMIN", "DOCTOR", "PATIENT"] },
      { icon: Calendar, label: "Appointments", href: "/dashboard/appointments", roles: ["ADMIN", "DOCTOR", "PATIENT"] },
      { icon: FileText, label: "Medical Records", href: "/dashboard/medical-records", roles: ["ADMIN", "DOCTOR", "PATIENT"] },
    ],
  },
  {
    title: "ADMINISTRATIVE",
    roles: ["ADMIN"],
    items: [
      { icon: Receipt, label: "Billing", href: "/dashboard/billing", roles: ["ADMIN"] },
      { icon: Package, label: "Inventory", href: "/dashboard/inventory", roles: ["ADMIN"] },
      { icon: Building2, label: "Wards", href: "/dashboard/wards", roles: ["ADMIN"] },
    ],
  },
  {
    title: "SETTINGS",
    roles: ["ADMIN", "DOCTOR", "PATIENT"],
    items: [
      { icon: Settings, label: "Settings", href: "/dashboard/settings", roles: ["ADMIN", "DOCTOR", "PATIENT"] },
    ],
  },
];

// Role badge colors
const ROLE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  ADMIN: { bg: "rgba(239,68,68,0.15)", color: "#EF4444", label: "Admin" },
  DOCTOR: { bg: "rgba(59,130,246,0.15)", color: "#3B82F6", label: "Doctor" },
  PATIENT: { bg: "rgba(16,185,129,0.15)", color: "#10B981", label: "Patient" },
  RECEPTIONIST: { bg: "rgba(245,158,11,0.15)", color: "#F59E0B", label: "Receptionist" },
};

interface SidebarProps {
  userName?: string | null;
  userRole?: string | null;
  isMobile?: boolean;
}

export default function Sidebar({ userName, userRole, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const role = userRole ?? "PATIENT";
  const { isOpen } = useSidebar();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const avatarLetter = userName ? userName.charAt(0).toUpperCase() : "U";
  const roleStyle = ROLE_STYLES[role] ?? ROLE_STYLES.PATIENT;

  // Filter nav groups and items by the current user's role
  const visibleGroups = navGroups
    .filter((g) => g.roles.includes(role))
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen w-64 flex-col z-50 transition-transform duration-300",
        isMobile ? "flex" : "hidden md:flex",
        !isMobile && !isOpen && "-translate-x-full"
      )}
      style={{ background: "#0F172A" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-10 h-10 shrink-0 relative flex items-center justify-center bg-white/10 rounded-lg p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/star-logo.png" alt="Madan Bhandari Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-white font-bold text-sm tracking-tight leading-tight" style={{ color: "#10B981" }}>
            Madan Bhandari
          </span>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider leading-tight mt-0.5">
            Clinic Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {visibleGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                        active
                          ? "text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-700/60"
                      )}
                      style={
                        active
                          ? { background: "#10B981", color: "#ffffff" }
                          : undefined
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-white/10 px-3 py-4 space-y-3">
        {/* User Info */}
        <div className="flex items-center gap-3 px-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            {avatarLetter}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {userName || "Unknown User"}
            </p>
            <span
              className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
              style={{ background: roleStyle.bg, color: roleStyle.color }}
            >
              {roleStyle.label}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-2 mt-2 border-t border-white/5">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400
              transition-all duration-150"
            id="sidebar-logout-btn"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="truncate">Sign Out</span>
          </button>
        </div>

        {/* Copyright Footer */}
        <div className="pt-3 pb-1 text-center">
          <p className="text-[10px] text-slate-500/80">
            &copy; 2026 Madan Bhandari Clinic. All rights reserved.
          </p>
        </div>
      </div>
    </aside>
  );
}
