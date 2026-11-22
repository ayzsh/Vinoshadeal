// Server page: it only exists so we can set the page title and "noindex".
// All the real work happens in components/compare/CompareTable.tsx (a client component).

import type { Metadata } from "next";
import CompareTable from "@/components/compare/CompareTable";

export const metadata: Metadata = {
  title: "Compare products",
  description: "Compare up to 3 products side by side on Vinoshadeal.",
  robots: { index: false, follow: true },
};

export default function ComparePage() {
  return <CompareTable />;
}
