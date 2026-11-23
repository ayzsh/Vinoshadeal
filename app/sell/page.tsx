import type { Metadata } from "next";
import SellView from "@/components/sell/SellView";
import { DEMO_MODE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sell on Vinoshadeal",
  description: "Tell us what you would like to sell on Vinoshadeal, a Vinosha Group company.",
  // while the form does not send anything yet, keep the page out of search results
  robots: { index: !DEMO_MODE, follow: true },
};

export default function SellPage() {
  return <SellView />;
}
