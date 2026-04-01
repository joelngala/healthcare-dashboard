import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";

interface BadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        STATUS_COLORS[status] || "bg-gray-100 text-gray-600",
        className
      )}
    >
      {status}
    </span>
  );
}
