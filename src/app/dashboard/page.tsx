import Link from "next/link";
import { Calendar, Users, Receipt, ArrowRight } from "lucide-react";
import StatsCards from "@/components/dashboard/StatsCards";
import AppointmentChart from "@/components/dashboard/AppointmentChart";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentAppointments from "@/components/dashboard/RecentAppointments";
import { auth } from "@/lib/auth";

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  availableDoctors: number;
  monthlyRevenue: number;
  bedOccupancyPercent: number;
  pendingInvoices: number;
  weeklyAppointments: { day: string; count: number }[];
  monthlyRevenueTrend: { month: string; revenue: number }[];
  recentAppointments: {
    id: string;
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    status: string;
  }[];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

async function fetchStats(baseUrl: string): Promise<DashboardStats | null> {
  try {
    const res = await fetch(`${baseUrl}/api/dashboard/stats`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const quickActions = [
  {
    label: "New Appointment",
    href: "/dashboard/appointments/new",
    icon: Calendar,
    color: "#10B981",
    bgColor: "rgba(16,185,129,0.08)",
  },
  {
    label: "Register Patient",
    href: "/dashboard/patients/new",
    icon: Users,
    color: "#3B82F6",
    bgColor: "rgba(59,130,246,0.08)",
  },
  {
    label: "Create Invoice",
    href: "/dashboard/billing",
    icon: Receipt,
    color: "#8B5CF6",
    bgColor: "rgba(139,92,246,0.08)",
  },
];

// Fallback stats when DB is unavailable
const emptyStats: DashboardStats = {
  totalPatients: 0,
  todayAppointments: 0,
  availableDoctors: 0,
  monthlyRevenue: 0,
  bedOccupancyPercent: 0,
  pendingInvoices: 0,
  weeklyAppointments: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (day) => ({ day, count: 0 })
  ),
  monthlyRevenueTrend: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(
    (month) => ({ month, revenue: 0 })
  ),
  recentAppointments: [],
};

export default async function DashboardPage() {
  const session = await auth();
  const greeting = getGreeting();
  const userName = session?.user?.name ?? "User";

  // Fetch stats server-side
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXTAUTH_URL || "http://localhost:3000";

  const stats = (await fetchStats(baseUrl)) ?? emptyStats;

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Here&apos;s what&apos;s happening at Madan Bhandari Clinic today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                  border border-slate-200 bg-white hover:shadow-sm hover:scale-[1.02]
                  transition-all duration-150 group"
                style={{ color: action.color }}
              >
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: action.bgColor }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {action.label}
                <ArrowRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats Cards Row */}
      <StatsCards stats={stats} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppointmentChart data={stats.weeklyAppointments} />
        <RevenueChart data={stats.monthlyRevenueTrend} />
      </div>

      {/* Recent Appointments */}
      <RecentAppointments appointments={stats.recentAppointments} />
    </div>
  );
}
