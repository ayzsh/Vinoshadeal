import type { Metadata } from "next";
import AddressesView from "@/components/account/AddressesView";

export const metadata: Metadata = {
  title: "Saved addresses",
  robots: { index: false, follow: true },
};

export default function AddressesPage() {
  return <AddressesView />;
}
