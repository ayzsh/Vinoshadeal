import type { Metadata } from "next";
import ReturnsView from "@/components/account/ReturnsView";

export const metadata: Metadata = {
  title: "Returns",
  robots: { index: false, follow: true },
};

export default function ReturnsPage() {
  return <ReturnsView />;
}
