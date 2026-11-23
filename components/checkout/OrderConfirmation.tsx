"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Breadcrumbs from "@/components/listing/Breadcrumbs";
import DemoBanner from "@/components/checkout/DemoBanner";
import { getOrderById } from "@/lib/orders";
import { paymentOption } from "@/lib/payment";
import type { Order } from "@/lib/types";
import { formatINR } from "@/lib/utils";

export default function OrderConfirmation({ id }: { id: string }) {
  // undefined = still reading the browser's saved orders, null = no such order
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setOrder(getOrderById(id));
  }, [id]);

  // After the page change, move keyboard / screen-reader focus to the title.
  useEffect(() => {
    if (order !== undefined) headingRef.current?.focus();
  }, [order]);

  return (
    <div className="container-page py-6 pb-24 md:pb-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Order confirmation" }]} />
      <DemoBanner />

      {order === undefined ? (
        <div className="mt-6 space-y-4" aria-busy="true">
          <p className="sr-only" role="status">
            Loading your order
          </p>
          <div className="skeleton h-32 rounded-card" />
          <div className="skeleton h-56 rounded-card" />
        </div>
      ) : order === null ? (
        <div className="card mt-6 px-6 py-10 text-center">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-heading text-xl font-bold text-heading outline-none"
          >
            We couldn&apos;t find this order
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Check the link and try again. While the site is in demo mode, orders are saved only in the
            browser (and on the device) where they were placed.
          </p>
          <Link href="/" className="btn-primary mt-5 inline-block">
            Continue shopping
          </Link>
        </div>
      ) : (
        <Details order={order} headingRef={headingRef} />
      )}
    </div>
  );
}

function Details({
  order,
  headingRef,
}: {
  order: Order;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const pay = paymentOption(order.paymentMethod);
  const a = order.address;
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const mrpTotal = order.items.reduce((s, i) => s + (i.mrp ?? i.price) * i.quantity, 0);
  const itemTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const productDiscount = Math.max(0, mrpTotal - itemTotal);
  const couponDiscount = order.couponDiscount ?? 0;
  const deliveryCharge = order.deliveryCharge ?? 0;
  const placedOn = new Date(order.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const expressChosen = order.deliveryOption === "express";

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="min-w-0 space-y-6">
        {/* header */}
        <section className="card p-5" aria-labelledby="oc-title">
          {order.isDemo && (
            <p className="inline-block rounded-full border-2 border-brand-purple px-3 py-1 text-xs font-bold uppercase tracking-wide text-heading">
              Demo order
            </p>
          )}
          <h1
            id="oc-title"
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 font-heading text-2xl font-bold text-heading outline-none"
          >
            {order.isDemo ? "Your demo order is placed" : "Your order is placed"}
          </h1>
          {order.isDemo && (
            <p className="mt-2 text-sm text-muted">
              This was a practice order. No real order was placed, nothing will be shipped and no payment was
              taken.
            </p>
          )}
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Order ID</dt>
              <dd className="break-all font-heading font-bold text-ink">{order.id}</dd>
            </div>
            <div>
              <dt className="text-muted">Placed on</dt>
              <dd className="font-semibold text-ink">{placedOn}</dd>
            </div>
          </dl>
          <Link href={`/account/orders/${encodeURIComponent(order.id)}`} className="btn-outline mt-4 inline-block">
            View order
          </Link>
        </section>

        {/* items */}
        <section className="card p-5" aria-labelledby="oc-items">
          <h2 id="oc-items" className="font-heading text-lg font-bold text-heading">
            Items ({itemCount})
          </h2>
          <ul className="mt-4 space-y-4">
            {order.items.map((i, idx) => (
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

        {/* address, delivery, payment */}
        <section className="card p-5" aria-labelledby="oc-ship">
          <h2 id="oc-ship" className="font-heading text-lg font-bold text-heading">
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
                {order.contact?.email && (
                  <>
                    <br />
                    Email: {order.contact.email}
                  </>
                )}
              </address>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-ink">{expressChosen ? "Express delivery" : "Standard delivery"}</h3>
                {/* the date is a SAMPLE estimate made up at checkout, not from a real courier */}
                {order.estimatedDelivery && (
                  <p className="mt-1 text-muted">
                    Estimated arrival: {order.estimatedDelivery}
                    {order.isDemo ? " (sample dates)" : ""}
                  </p>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-ink">Payment method</h3>
                <p className="mt-1 text-muted">{pay?.label ?? "Not recorded"}</p>
                {order.isDemo && (
                  <p className="mt-1 text-muted">
                    {pay?.online
                      ? "No payment was taken. Real online payment will be switched on with Razorpay."
                      : "Nothing to pay: this was a demo order."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* totals */}
      <aside aria-label="Order totals" className="lg:sticky lg:top-44">
        <div className="card p-5">
          <h2 className="font-heading text-lg font-bold text-heading">Order total</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label={`Price (${itemCount} ${itemCount === 1 ? "item" : "items"}, at MRP)`} value={formatINR(mrpTotal)} />
            {productDiscount > 0 && <Row label="Discount on MRP" value={`−${formatINR(productDiscount)}`} good />}
            {couponDiscount > 0 && (
              <Row label={`Coupon${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`−${formatINR(couponDiscount)}`} good />
            )}
            <Row
              label={`Delivery (${expressChosen ? "Express" : "Standard"})`}
              value={deliveryCharge === 0 ? "Free" : formatINR(deliveryCharge)}
              good={deliveryCharge === 0}
            />
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="font-heading font-bold text-heading">Total</span>
            <span className="font-heading text-xl font-bold text-ink">{formatINR(order.total)}</span>
          </div>
          {productDiscount + couponDiscount > 0 && (
            <p className="mt-3 rounded-field bg-tint px-3 py-2 text-sm font-semibold text-success">
              You saved {formatINR(productDiscount + couponDiscount)} on this order
            </p>
          )}
          <Link href="/" className="btn-primary mt-4 block w-full text-center">
            Continue shopping
          </Link>
        </div>
      </aside>
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
