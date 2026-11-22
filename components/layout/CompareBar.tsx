"use client";

// Floating "Compare" bar. Mounted once in app/layout.tsx.
// Shows up when 1 or more products are in the compare list, and hides on /compare itself.
//
// Position (so it never sits on top of other fixed things):
//  - Phone: left side, 9rem (bottom-36) from the bottom. That is above the bottom nav (4rem),
//    above the product page's sticky Add to Cart bar (about 8.5rem tall in total),
//    and above the Toast (bottom-20), so none of them cover it or get covered.
//    The WhatsApp button is on the right, so it never touches this bar.
//  - Desktop: left side, 6rem (md:bottom-24) from the bottom, clear of the centred Toast.

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { products } from "@/lib/data";
import { useCart } from "@/lib/cart-context";

export default function CompareBar() {
  const pathname = usePathname();
  const { ready, compare, toggleCompare } = useCart();

  // Turn the saved product ids into real products (ignores any id that no longer exists).
  const items = useMemo(
    () =>
      compare
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [compare]
  );

  const onComparePage = pathname === "/compare" || pathname.startsWith("/compare/");
  const visible = ready && items.length > 0 && !onComparePage;

  return (
    <>
      {/* Always on the page so screen readers announce when the count changes. */}
      <p role="status" aria-live="polite" className="sr-only">
        {visible ? `${items.length} of 3 products in your compare list` : ""}
      </p>

      {visible && (
        <div className="fixed bottom-36 left-4 z-40 max-w-[calc(100vw-2rem)] md:bottom-24 md:left-6">
          <section
            aria-label="Compare products"
            className="flex items-center gap-3 rounded-card border border-line bg-surface p-2 pl-3 shadow-lift"
          >
            <ul className="flex items-center gap-2.5">
              {items.map((p) => (
                <li key={p.id} className="relative">
                  <span
                    title={p.name}
                    className="flex h-11 w-11 items-center justify-center rounded-field bg-tint text-2xl"
                  >
                    <span aria-hidden="true">{p.emoji}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCompare(p.id)}
                    aria-label={`Remove ${p.name} from compare`}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-soft transition hover:bg-tint"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <Link href="/compare" className="btn-primary whitespace-nowrap !px-4 !py-2.5 text-sm">
              Compare ({items.length})
            </Link>
          </section>
        </div>
      )}
    </>
  );
}
