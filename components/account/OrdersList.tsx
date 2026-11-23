"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import { loadOrders } from "@/lib/orders";
import type { Order } from "@/lib/types";
import { formatINR } from "@/lib/utils";

/** /account/orders: every order saved on this device, newest first. */
export default function OrdersList() {
  // null = still reading the browser's saved orders
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  if (orders === null) {
    return (
      <div className="space-y-4" aria-busy="true">
        <p className="sr-only" role="status">
          Loading your orders
        </p>
        <div className="skeleton h-28 rounded-card" />
        <div className="skeleton h-28 rounded-card" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="card px-6 py-10 text-center">
        <p aria-hidden="true" className="text-5xl">
          📦
        </p>
        <h2 className="mt-3 font-heading text-lg font-bold text-heading">No orders on this device yet</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          Orders you place are saved here, on this device only, while the site is in demo mode.
        </p>
        <Link href="/" className="btn-primary mt-5 inline-block">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <section aria-label="Your orders">
      <p className="mb-4 text-sm text-muted" role="status">
        {orders.length} {orders.length === 1 ? "order" : "orders"} on this device
      </p>
      <ul className="space-y-4">
        {orders.map((o) => {
          const count = o.items.reduce((s, i) => s + i.quantity, 0);
          const placedOn = new Date(o.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" });
          return (
            <li key={o.id}>
              <Link
                href={`/account/orders/${encodeURIComponent(o.id)}`}
                className="card card-hover block p-4 sm:p-5"
              >
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="break-all font-heading font-bold text-heading">{o.id}</span>
                  <OrderStatusBadge status={o.status} />
                </span>
                <span className="mt-1 block text-sm text-muted">
                  Placed on {placedOn}
                  {o.isDemo ? " · Demo order" : ""}
                </span>
                <span className="mt-3 flex items-center gap-3">
                  <span aria-hidden="true" className="flex gap-1 text-2xl">
                    {o.items.slice(0, 4).map((i, idx) => (
                      <span
                        key={`${i.productId}-${idx}`}
                        className="flex h-11 w-11 items-center justify-center rounded-field bg-tint"
                      >
                        {i.emoji ?? "📦"}
                      </span>
                    ))}
                  </span>
                  {o.items.length > 4 && <span className="text-xs text-muted">+{o.items.length - 4} more</span>}
                </span>
                <span className="mt-3 flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-muted">
                    {count} {count === 1 ? "item" : "items"}
                  </span>
                  <span className="font-heading text-base font-bold text-ink">{formatINR(o.total)}</span>
                </span>
                <span className="mt-2 block text-sm font-semibold text-redtext">View details</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
