import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-[3px]",
};

export default function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "rounded-full animate-spin border-t-transparent",
          sizeMap[size]
        )}
        style={{
          borderColor: "#10B981",
          borderTopColor: "transparent",
        }}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
