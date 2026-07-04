import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  type?: "order" | "product" | "default";
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-700",
  DISCONTINUED: "bg-red-100 text-red-700",
};

export function StatusBadge({ status, type = "order" }: StatusBadgeProps) {
  const label = type === "order" ? ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] : status;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusColors[status] || "bg-gray-100 text-gray-700"
      )}
    >
      {label || status}
    </span>
  );
}
