import { cn } from "@/lib/utils";
import { InboxIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon: Icon = InboxIcon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-slate-600 mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-slate-400 max-w-sm leading-relaxed">{description}</p>
      )}

      {/* Action */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
