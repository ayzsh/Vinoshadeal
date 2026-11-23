import type { Metadata } from "next";
import OrderDetails from "@/components/account/OrderDetails";

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false, follow: true },
};

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetails id={decodeURIComponent(id)} />;
}
