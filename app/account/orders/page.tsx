import type { Metadata } from "next";
import OrdersList from "@/components/account/OrdersList";

export const metadata: Metadata = {
  title: "My orders",
  robots: { index: false, follow: true },
};

export default function OrdersPage() {
  return <OrdersList />;
}
