"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ACCOUNT_SECTIONS } from "@/components/account/nav";
import { useCart } from "@/lib/cart-context";
import { loadOrders } from "@/lib/orders";
import { loadProfile } from "@/lib/profile";

export default function AccountOverview() {
  const { wishlist } = useCart();
  const [name, setName] = useState("");
  const [orderCount, setOrderCount] = useState<number | null>(null);

  useEffect(() => {
    setName(loadProfile()?.name ?? "");
    setOrderCount(loadOrders().length);
  }, []);

  const first = name.trim().split(/\s+/)[0];

  function detail(href: string, fallback: string): string {
    if (href === "/account/orders" && orderCount !== null) {
      return orderCount === 0 ? "No orders on this device yet." : `${orderCount} ${orderCount === 1 ? "order" : "orders"} on this device.`;
    }
    if (href === "/account/wishlist") {
      return wishlist.length === 0 ? "Nothing saved yet." : `${wishlist.length} saved ${wishlist.length === 1 ? "item" : "items"}.`;
    }
    return fallback;
  }

  return (
    <div className="space-y-6">
      <section className="card p-4 sm:p-5" aria-labelledby="ov-hello">
        <h2 id="ov-hello" className="font-heading text-lg font-bold text-heading">
          {first ? `Hello, ${first}` : "Welcome"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {first
            ? "Here is everything saved on this device."
            : "Add your details in Profile so we can fill them in for you."}
        </p>
      </section>

      <section aria-label="Account sections">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {ACCOUNT_SECTIONS.filter((s) => s.href !== "/account").map((s) => {
            const Icon = s.icon;
            const body = (
              <>
                <span className="flex flex-wrap items-center gap-x-2 font-heading font-bold text-heading">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {s.label}
                  {!s.available && <span className="text-xs font-normal text-muted">(soon)</span>}
                </span>
                <span className="mt-1 block text-sm text-muted">{detail(s.href, s.description)}</span>
              </>
            );
            return (
              <li key={s.href} className="min-w-0">
                {s.available ? (
                  <Link href={s.href} className="card card-hover block h-full p-4 sm:p-5">
                    {body}
                  </Link>
                ) : (
                  <div aria-disabled="true" className="card block h-full border-dashed p-4 opacity-80 sm:p-5">
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card p-4 sm:p-5" aria-labelledby="ov-signin">
        <h2 id="ov-signin" className="font-heading text-lg font-bold text-heading">
          Sign in or create an account
        </h2>
        <p className="mt-1 text-sm text-muted">
          Accounts are not switched on yet. You don&apos;t need one to shop or check out.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/login" className="btn-outline inline-block">
            Sign in
          </Link>
          <Link href="/signup" className="btn-outline inline-block">
            Create account
          </Link>
        </div>
      </section>
    </div>
  );
}
