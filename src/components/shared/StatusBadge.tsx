import { cn } from "@/lib/utils";

type StatusType =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "PAID";

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-800 border border-blue-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border border-red-200",
  },
  PAID: {
    label: "Paid",
    className: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status as StatusType] ?? {
    label: status,
    className: "bg-slate-100 text-slate-700 border border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
