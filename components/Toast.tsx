"use client";

import { usePathname } from "next/navigation";

export type ToastTone = "default" | "error";

/**
 * The small message bubble. Rendered once by CartProvider.
 * The wrapper (role="status") is always on the page so screen readers announce new messages.
 * bottom-20 keeps it above the mobile bottom nav.
 * On /cart (phones) the sticky checkout bar is there too, so the message sits higher (bottom-36)
 * and never covers the Proceed button.
 */
export default function Toast({
  message,
  tone = "default",
}: {
  message: string | null;
  tone?: ToastTone;
}) {
  const pathname = usePathname();
  const position = pathname === "/cart" ? "bottom-36" : "bottom-20";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 ${position} z-[70] flex justify-center px-4 md:bottom-6`}
    >
      {message && (
        <p
          className={`pointer-events-auto max-w-sm rounded-field px-4 py-3 text-sm font-semibold shadow-lift ${
            tone === "error" ? "bg-brand-red-dark text-white" : "bg-ink text-page"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
