import type { Order } from "@/lib/types";

export const STATUS_LABEL: Record<Order["status"], string> = {
  placed: "Order placed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Status as text in a pill (never colour alone). */
export default function OrderStatusBadge({ status }: { status: Order["status"] }) {
  const tone =
    status === "cancelled"
      ? "border-brand-red-dark text-redtext"
      : status === "delivered"
        ? "border-success text-success"
        : "border-line text-ink";
  return (
    <span className={`inline-block rounded-full border-2 px-3 py-0.5 text-xs font-bold ${tone}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
