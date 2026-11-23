import { Info } from "lucide-react";
import { DEMO_MODE } from "@/lib/constants";

/** Shown on every checkout page while DEMO_MODE is true (lib/constants.ts). */
export default function DemoBanner() {
  if (!DEMO_MODE) return null;
  return (
    <div
      role="note"
      className="mt-4 flex items-start gap-2 rounded-field border border-line bg-tint px-4 py-3 text-sm font-semibold text-ink"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>Demo mode: no real order is placed and no payment is taken.</p>
    </div>
  );
}
