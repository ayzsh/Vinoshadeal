"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import { useCart } from "@/lib/cart-context";
import { DEMO_MODE } from "@/lib/constants";
import { cancelOrder, getOrderById, markDeliveredDemo } from "@/lib/orders";
import { paymentOption } from "@/lib/payment";
import type { Order } from "@/lib/types";
import { formatINR } from "@/lib/utils";

const STEPS: { status: Order["status"]; label: string }[] = [
  { status: "placed", label: "Order placed" },
  { status: "packed", label: "Packed" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

function when(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

/** /account/orders/[id]: one order, its timeline, and Cancel / Mark as delivered (demo). */
export default function OrderDetails({ id }: { id: string }) {
  const { showToast } = useCart();
  // undefined = still reading the browser's saved orders, null = no such order
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [confirming, setConfirming] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setOrder(getOrderById(id));
  }, [id]);

  useEffect(() => {
    if (order !== undefined) headingRef.current?.focus();
    // only when the order first loads, not after every change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order === undefined]);

  if (order === undefined) {
    return (
      <div className="space-y-4" aria-busy="true">
        <p className="sr-only" role="status">
          Loading your order
        </p>
        <div className="skeleton h-28 rounded-card" />
        <div className="skeleton h-56 rounded-card" />
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="card px-6 py-10 text-center">
        <h2 ref={headingRef} tabIndex={-1} className="font-heading text-xl font-bold text-heading outline-none">
          We couldn&apos;t find this order
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Check the link and try again. While the site is in demo mode, orders are saved only on the device
          where they were placed.
        </p>
        <Link href="/account/orders" className="btn-primary mt-5 inline-block">
          Back to my orders
        </Link>
      </div>
    );
  }

  const o = order;

  function onCancel() {
    const updated = cancelOrder(o.id);
    setConfirming(false);
    if (updated) {
      setOrder(updated);
      showToast("Order cancelled");
    } else {
      showToast("We couldn't cancel this order. Please try again.", "error");
    }
  }

  function onDeliver() {
    const updated = markDeliveredDemo(o.id);
    if (updated) {
      setOrder(updated);
      showToast("Marked as delivered (demo)");
    } else {
      showToast("We couldn't update this order. Please try again.", "error");
    }
  }

  const pay = paymentOption(o.paymentMethod);
  const a = o.address;
  const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
  const mrpTotal = o.items.reduce((s, i) => s + (i.mrp ?? i.price) * i.quantity, 0);
  const itemTotal = o.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const productDiscount = Math.max(0, mrpTotal - itemTotal);
  const couponDiscount = o.couponDiscount ?? 0;
  const deliveryCharge = o.deliveryCharge ?? 0;
  const expressChosen = o.deliveryOption === "express";

  const statusIndex = STEPS.findIndex((s) => s.status === o.status);
  // Demo orders are never shipped, so only "Order placed" (and "Delivered" if marked by hand) is real.
  function reached(step: Order["status"], index: number): boolean {
    if (o.isDemo) return step === "placed" || (step === "delivered" && o.status === "delivered");
    return statusIndex >= 0 && index <= statusIndex;
  }
  const canCancel = o.status === "placed";
  const canDeliverDemo = DEMO_MODE && (o.status === "placed" || o.status === "packed" || o.status === "shipped");

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="inline-block text-sm font-semibold text-redtext hover:underline">
        Back to my orders
      </Link>

      {/* header */}
      <section className="card p-4 sm:p-5" aria-labelledby="od-title">
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={o.status} />
          {o.isDemo && (
            <span className="inline-block rounded-full border-2 border-brand-purple px-3 py-0.5 text-xs font-bold text-heading">
              Demo order
            </span>
          )}
        </div>
        <h2
          id="od-title"
          ref={headingRef}
          tabIndex={-1}
          className="mt-2 break-all font-heading text-xl font-bold text-heading outline-none"
        >
          {o.id}
        </h2>
        <p className="mt-1 text-sm text-muted">Placed on {when(o.createdAt)}</p>
        {o.isDemo && (
          <p className="mt-2 text-sm text-muted">
            This was a practice order. Nothing will be shipped and no payment was taken.
          </p>
        )}
      </section>

      {/* tracking */}
      <section className="card p-4 sm:p-5" aria-labelledby="od-track">
        <h2 id="od-track" className="font-heading text-lg font-bold text-heading">
          Order status
        </h2>
        <p role="status" className="sr-only">
          Current status: {o.status}
        </p>
        <ol className="mt-4 space-y-4">
          {STEPS.map((s, i) => {
            const done = reached(s.status, i);
            let note = "";
            if (s.status === "placed") note = when(o.createdAt);
            else if (s.status === "delivered" && o.status === "delivered") {
              note = `${when(o.deliveredAt)}${o.isDemo ? " (marked by hand, demo)" : ""}`;
            } else if (!done && o.isDemo && s.status !== "delivered") note = "Not tracked: demo orders are not shipped";
            else if (!done && o.status !== "cancelled" && !o.isDemo) note = "Waiting";
            return (
              <li key={s.status} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    done ? "border-success bg-success text-white" : "border-line text-muted"
                  }`}
                >
                  {done ? "✓" : ""}
                </span>
                <span className="text-sm">
                  <span className={`font-semibold ${done ? "text-ink" : "text-muted"}`}>
                    {s.label}
                    <span className="sr-only">{done ? " (done)" : " (not done)"}</span>
                  </span>
                  {note && <span className="block text-xs text-muted">{note}</span>}
                </span>
              </li>
            );
          })}
          {o.status === "cancelled" && (
            <li className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-brand-red-dark bg-brand-red-dark text-xs font-bold text-white"
              >
                ✕
              </span>
              <span className="text-sm">
                <span className="font-semibold text-redtext">Cancelled</span>
                <span className="block text-xs text-muted">You cancelled this order on this device.</span>
              </span>
            </li>
          )}
        </ol>

        {(canCancel || canDeliverDemo) && (
          <div className="mt-5 border-t border-line pt-4">
            {confirming ? (
              <div role="alertdialog" aria-labelledby="od-cancel-q" className="rounded-field bg-tint p-4">
                <p id="od-cancel-q" className="text-sm font-semibold text-ink">
                  Cancel this order? This can&apos;t be undone.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button type="button" onClick={onCancel} className="btn-primary">
                    Yes, cancel order
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} className="btn-outline">
                    Keep order
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {canCancel && (
                  <button type="button" onClick={() => setConfirming(true)} className="btn-outline">
                    Cancel order
                  </button>
                )}
                {canDeliverDemo && (
                  <button type="button" onClick={onDeliver} className="btn-outline">
                    Mark as delivered (demo)
                  </button>
                )}
              </div>
            )}
            {canDeliverDemo && !confirming && (
              <p className="mt-2 text-xs text-muted">
                &quot;Mark as delivered (demo)&quot; is only for testing, so you can try returns. It is not real tracking.
              </p>
            )}
          </div>
        )}
      </section>

      {/* items */}
      <section className="card p-4 sm:p-5" aria-labelledby="od-items">
        <h2 id="od-items" className="font-heading text-lg font-bold text-heading">
          Items ({itemCount})
        </h2>
        <ul className="mt-4 space-y-4">
          {o.items.map((i, idx) => (
            <li key={`${i.productId}-${idx}`} className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-field bg-tint text-3xl"
              >
                {i.emoji ?? "📦"}
              </span>
              <span className="min-w-0 flex-1 text-sm">
                {i.slug ? (
                  <Link
                    href={`/product/${i.slug}`}
                    className="line-clamp-2 font-semibold text-ink hover:text-redtext hover:underline"
                  >
                    {i.name}
                  </Link>
                ) : (
                  <span className="line-clamp-2 font-semibold text-ink">{i.name}</span>
                )}
                {i.variant && Object.keys(i.variant).length > 0 && (
                  <span className="block text-xs text-muted">
                    {Object.entries(i.variant)
                      .map(([g, l]) => `${g}: ${l}`)
                      .join(", ")}
                  </span>
                )}
                <span className="block text-xs text-muted">
                  Qty {i.quantity} × {formatINR(i.price)}
                </span>
              </span>
              <span className="text-sm font-semibold text-ink">{formatINR(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* delivery and payment */}
      <section className="card p-4 sm:p-5" aria-labelledby="od-ship">
        <h2 id="od-ship" className="font-heading text-lg font-bold text-heading">
          Delivery and payment
        </h2>
        <div className="mt-4 grid gap-6 text-sm sm:grid-cols-2">
          <div>
            <h3 className="font-semibold text-ink">
              Delivery address{a.addressType ? ` (${a.addressType === "work" ? "Work" : "Home"})` : ""}
            </h3>
            <address className="mt-1 not-italic text-muted">
              {a.fullName}
              <br />
              {a.line1}
              {a.line2 && (
                <>
                  <br />
                  {a.line2}
                </>
              )}
              <br />
              {a.city}, {a.state} {a.pincode}
              <br />
              Mobile: {a.phone}
              {o.contact?.email && (
                <>
                  <br />
                  Email: {o.contact.email}
                </>
              )}
            </address>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-ink">{expressChosen ? "Express delivery" : "Standard delivery"}</h3>
              {/* SAMPLE estimate made up at checkout, not from a real courier */}
              {o.estimatedDelivery && (
                <p className="mt-1 text-muted">
                  Estimated arrival: {o.estimatedDelivery}
                  {o.isDemo ? " (sample dates)" : ""}
                </p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-ink">Payment method</h3>
              <p className="mt-1 text-muted">{pay?.label ?? "Not recorded"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* totals */}
      <section className="card p-4 sm:p-5" aria-labelledby="od-total">
        <h2 id="od-total" className="font-heading text-lg font-bold text-heading">
          Order total
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          <Row label={`Price (${itemCount} ${itemCount === 1 ? "item" : "items"}, at MRP)`} value={formatINR(mrpTotal)} />
          {productDiscount > 0 && <Row label="Discount on MRP" value={`−${formatINR(productDiscount)}`} good />}
          {couponDiscount > 0 && (
            <Row label={`Coupon${o.couponCode ? ` (${o.couponCode})` : ""}`} value={`−${formatINR(couponDiscount)}`} good />
          )}
          <Row
            label={`Delivery (${expressChosen ? "Express" : "Standard"})`}
            value={deliveryCharge === 0 ? "Free" : formatINR(deliveryCharge)}
            good={deliveryCharge === 0}
          />
        </dl>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="font-heading font-bold text-heading">Total</span>
          <span className="font-heading text-xl font-bold text-ink">{formatINR(o.total)}</span>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, good = false }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className={`font-semibold ${good ? "text-success" : "text-ink"}`}>{value}</dd>
    </div>
  );
}
