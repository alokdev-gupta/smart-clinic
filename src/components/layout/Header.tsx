"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Bell, ChevronDown, User, LogOut, Menu } from "lucide-react";
import { formatDate } from "@/lib/utils";
import MobileNav from "./MobileNav";
import { useSidebar } from "./SidebarContext";

interface HeaderProps {
  pageTitle?: string;
  userName?: string | null;
  userRole?: string | null;
}

export default function Header({ pageTitle = "Dashboard", userName, userRole }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { toggle } = useSidebar();

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatNepalTime = (date: Date) => {
    return date.toLocaleTimeString("en-NP", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const avatarLetter = userName ? userName.charAt(0).toUpperCase() : "U";

  const formatRole = (role?: string | null) => {
    if (!role) return "User";
    return role.charAt(0) + role.slice(1).toLowerCase();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center px-4 md:px-6 gap-4 sticky top-0 z-40 print:hidden">
      {/* Mobile nav (sheet) - only on small screens */}
      <div className="md:hidden">
        <MobileNav userName={userName} userRole={userRole} />
      </div>

      {/* Desktop sidebar toggle button */}
      <button
        onClick={toggle}
        className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page Title */}
      <div className="flex-1 truncate">
        <h2 className="text-lg font-semibold text-slate-800 truncate">{pageTitle}</h2>
      </div>

      {/* Live Clock */}
      <div className="hidden md:flex flex-col items-center">
        <p className="text-xs font-medium text-slate-800 tabular-nums">
          {currentTime ? formatNepalTime(currentTime) : "--:--:--"}
        </p>
        <p className="text-[10px] text-slate-400">
          {currentTime ? formatDate(currentTime) : "--/--/----"}
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          id="header-notifications-btn"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500
            hover:text-slate-700 hover:bg-slate-100 transition-all"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "#10B981" }}
          />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            id="header-user-menu-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-all"
            aria-label="User menu"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
            >
              {avatarLetter}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium text-slate-700 leading-none">
                {userName || "User"}
              </span>
              <span className="text-[10px] text-slate-400 leading-none mt-0.5">
                {formatRole(userRole)}
              </span>
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">{userName}</p>
                  <p className="text-xs text-slate-400">{formatRole(userRole)}</p>
                </div>
                <a
                  href="/dashboard/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600
                    hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </a>
                <button
                  id="header-logout-btn"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500
                    hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
