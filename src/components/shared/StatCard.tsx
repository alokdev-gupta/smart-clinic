import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: "blue" | "emerald" | "purple" | "green" | "orange" | "red" | "yellow";
  trend?: string;
  trendUp?: boolean;
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    icon: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
    border: "border-blue-100",
    accent: "#3B82F6",
  },
  emerald: {
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    icon: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-100",
    accent: "#10B981",
  },
  purple: {
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    icon: "text-purple-600",
    badge: "bg-purple-100 text-purple-700",
    border: "border-purple-100",
    accent: "#8B5CF6",
  },
  green: {
    bg: "bg-green-50",
    iconBg: "bg-green-100",
    icon: "text-green-600",
    badge: "bg-green-100 text-green-700",
    border: "border-green-100",
    accent: "#16A34A",
  },
  orange: {
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    icon: "text-orange-600",
    badge: "bg-orange-100 text-orange-700",
    border: "border-orange-100",
    accent: "#F97316",
  },
  red: {
    bg: "bg-red-50",
    iconBg: "bg-red-100",
    icon: "text-red-600",
    badge: "bg-red-100 text-red-700",
    border: "border-red-100",
    accent: "#EF4444",
  },
  yellow: {
    bg: "bg-yellow-50",
    iconBg: "bg-yellow-100",
    icon: "text-yellow-600",
    badge: "bg-yellow-100 text-yellow-700",
    border: "border-yellow-100",
    accent: "#EAB308",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendUp,
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 border flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden",
        colors.border
      )}
    >
      {/* Decorative top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: colors.accent }}
      />

      {/* Icon + Trend Row */}
      <div className="flex items-start justify-between">
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", colors.iconBg)}>
          <Icon className={cn("h-5 w-5", colors.icon)} />
        </div>

        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
              trendUp
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            )}
          >
            {trendUp ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend}
          </div>
        )}
      </div>

      {/* Value + Title */}
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none tracking-tight">
          {value}
        </p>
        <p className="text-sm text-slate-500 mt-1.5 font-medium">{title}</p>
      </div>
    </div>
  );
}
