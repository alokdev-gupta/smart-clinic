import StatCard from "@/components/shared/StatCard";
import {
  Users,
  Calendar,
  UserCheck,
  DollarSign,
  Building2,
  Receipt,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  availableDoctors: number;
  monthlyRevenue: number;
  bedOccupancyPercent: number;
  pendingInvoices: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Patients",
      value: stats.totalPatients.toLocaleString(),
      icon: Users,
      color: "blue" as const,
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments.toLocaleString(),
      icon: Calendar,
      color: "emerald" as const,
    },
    {
      title: "Available Doctors",
      value: stats.availableDoctors.toLocaleString(),
      icon: UserCheck,
      color: "purple" as const,
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.monthlyRevenue),
      icon: DollarSign,
      color: "green" as const,
    },
    {
      title: "Bed Occupancy",
      value: `${stats.bedOccupancyPercent}%`,
      icon: Building2,
      color: "orange" as const,
    },
    {
      title: "Pending Invoices",
      value: stats.pendingInvoices.toLocaleString(),
      icon: Receipt,
      color: "red" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
        />
      ))}
    </div>
  );
}
