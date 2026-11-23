"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { DEMO_MODE } from "@/lib/constants";
import { loadOrders } from "@/lib/orders";
import {
  RETURN_NOTE_MAX,
  RETURN_REASONS,
  RETURN_WINDOW_DAYS,
  loadReturns,
  reasonLabel,
  returnState,
  submitReturn,
} from "@/lib/returns";
import type { Order, ReturnReason, ReturnRequest } from "@/lib/types";

const fmtDate = (d: Date | string) => new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" });
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

interface FormErrors {
  items?: string;
  reason?: string;
}

/**
 * /account/returns:
 * - delivered orders that can still be returned (7 days from the delivered date) with "Request return"
 * - the return request form (pick items, reason, optional note)
 * - the list of requests already made on this device
 * Everything is saved on this device only. In demo mode nothing is picked up and nothing is refunded.
 */
export default function ReturnsView() {
  const { showToast } = useCart();
  // null = still reading the browser's saved data
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [now, setNow] = useState<Date>(new Date());

  // null = the list is showing; otherwise the id of the order being returned
  const [formOrderId, setFormOrderId] = useState<string | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [reason, setReason] = useState<ReturnReason | "">("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const statusRef = useRef<HTMLParagraphElement>(null);
  const formTitleRef = useRef<HTMLHeadingElement>(null);

  function reload() {
    setOrders(loadOrders());
    setReturns(loadReturns());
    setNow(new Date());
  }

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    if (formOrderId !== null) formTitleRef.current?.focus();
  }, [formOrderId]);

  if (orders === null) {
    return (
      <div className="space-y-4" aria-busy="true">
        <p className="sr-only" role="status">
          Loading your returns
        </p>
        <div className="skeleton h-28 rounded-card" />
        <div className="skeleton h-28 rounded-card" />
      </div>
    );
  }

  function openForm(order: Order) {
    setFormOrderId(order.id);
    setSelected([]);
    setReason("");
    setNote("");
    setErrors({});
  }

  function closeForm() {
    setFormOrderId(null);
    setErrors({});
    setTimeout(() => statusRef.current?.focus(), 0);
  }

  function toggleItem(i: number) {
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
    if (errors.items) setErrors((e) => ({ ...e, items: undefined }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formOrderId === null) return;
    const found: FormErrors = {};
    if (selected.length === 0) found.items = "Choose at least one item to return.";
    if (!reason) found.reason = "Choose a reason for the return.";
    setErrors(found);
    if (found.items) {
      document.getElementById("ret-item-first")?.focus();
      return;
    }
    if (found.reason || !reason) {
      document.getElementById("ret-reason-first")?.focus();
      return;
    }

    const result = submitReturn({ orderId: formOrderId, itemIndexes: selected, reason, note });
    if (result.ok) {
      reload();
      showToast("Return request received");
      closeForm();
      return;
    }
    // Never pretend: say what really happened, then show the up-to-date list.
    if (result.reason === "storage") {
      showToast("We couldn't save your request on this device. Please try again.", "error");
      return;
    }
    if (result.reason === "nothing_selected") {
      setErrors({ items: "Choose at least one item to return." });
      return;
    }
    showToast(
      result.reason === "missing"
        ? "We couldn't find this order any more."
        : "This order can't be returned any more (the return window may have closed).",
      "error"
    );
    reload();
    closeForm();
  }

  // ------------------------------------------------------------------ form
  const formOrder = formOrderId ? orders.find((o) => o.id === formOrderId) ?? null : null;
  if (formOrderId !== null && formOrder) {
    const state = returnState(formOrder, returns, now);
    const open = state.kind === "eligible" ? state.availableIndexes : [];
    return (
      <section className="card p-4 sm:p-5" aria-labelledby="ret-form-title">
        <h2
          id="ret-form-title"
          ref={formTitleRef}
          tabIndex={-1}
          className="font-heading text-lg font-bold text-heading outline-none"
        >
          Request a return
        </h2>
        <p className="mt-1 break-all text-sm text-muted">Order {formOrder.id}</p>
        {state.kind === "eligible" && (
          <p className="mt-1 text-sm text-muted">You can return items until {fmtDate(state.deadline)}.</p>
        )}
        {DEMO_MODE && (
          <p className="mt-3 rounded-field bg-tint px-3 py-2 text-sm text-ink">
            Demo only: your request is saved on this device. No pickup will be arranged and no refund will be made.
          </p>
        )}

        <form onSubmit={onSubmit} noValidate className="mt-5 space-y-6">
          <fieldset aria-describedby={errors.items ? "ret-items-error" : undefined}>
            <legend className="text-sm font-semibold text-ink">Which items do you want to return?</legend>
            <ul className="mt-2 space-y-2">
              {open.map((i, n) => {
                const it = formOrder.items[i];
                const variant =
                  it.variant && Object.keys(it.variant).length > 0
                    ? Object.entries(it.variant)
                        .map(([g, l]) => `${g}: ${l}`)
                        .join(", ")
                    : "";
                return (
                  <li key={i}>
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-field border p-3 ${
                        selected.includes(i) ? "border-brand-red-dark bg-tint" : "border-line"
                      }`}
                    >
                      <input
                        id={n === 0 ? "ret-item-first" : undefined}
                        type="checkbox"
                        checked={selected.includes(i)}
                        onChange={() => toggleItem(i)}
                        className="mt-1 h-4 w-4 shrink-0 accent-brand-red-dark"
                      />
                      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field bg-tint text-2xl">
                        {it.emoji ?? "📦"}
                      </span>
                      <span className="min-w-0 flex-1 text-sm">
                        <span className="line-clamp-2 break-words font-semibold text-ink">{it.name}</span>
                        {variant && <span className="block text-xs text-muted">{variant}</span>}
                        <span className="block text-xs text-muted">Qty {it.quantity}</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <p id="ret-items-error" className="min-h-5 pt-1 text-xs font-semibold text-redtext">
              {errors.items}
            </p>
          </fieldset>

          <fieldset aria-describedby={errors.reason ? "ret-reason-error" : undefined}>
            <legend className="text-sm font-semibold text-ink">Why are you returning it?</legend>
            <div className="mt-2 space-y-2">
              {RETURN_REASONS.map((r, n) => (
                <label key={r.id} className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                  <input
                    id={n === 0 ? "ret-reason-first" : undefined}
                    type="radio"
                    name="ret-reason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={() => {
                      setReason(r.id);
                      if (errors.reason) setErrors((e) => ({ ...e, reason: undefined }));
                    }}
                    className="h-4 w-4 shrink-0 accent-brand-red-dark"
                  />
                  {r.label}
                </label>
              ))}
            </div>
            <p id="ret-reason-error" className="min-h-5 pt-1 text-xs font-semibold text-redtext">
              {errors.reason}
            </p>
          </fieldset>

          <div>
            <label htmlFor="ret-note" className="text-sm font-semibold text-ink">
              Anything we should know? <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="ret-note"
              value={note}
              maxLength={RETURN_NOTE_MAX}
              rows={3}
              onChange={(e) => setNote(e.target.value)}
              aria-describedby="ret-note-hint"
              className="mt-1 w-full rounded-field border border-line bg-page px-3 py-2.5 text-sm text-ink placeholder:text-muted"
            />
            <p id="ret-note-hint" className="pt-1 text-xs text-muted">
              Up to {RETURN_NOTE_MAX} characters.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              Submit return request
            </button>
            <button type="button" onClick={closeForm} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      </section>
    );
  }

  // ------------------------------------------------------------------ lists
  const delivered = orders.filter((o) => o.status === "delivered");

  return (
    <div className="space-y-8">
      <div>
        <p ref={statusRef} tabIndex={-1} className="text-sm text-muted outline-none">
          You can return delivered items within {RETURN_WINDOW_DAYS} days of delivery.
        </p>
        {DEMO_MODE && (
          <p role="note" className="mt-3 rounded-field border border-line bg-tint px-4 py-3 text-sm text-ink">
            Demo only: return requests are saved on this device. No pickup is arranged and no refund is made.
          </p>
        )}
      </div>

      {/* orders that can be returned */}
      <section aria-labelledby="ret-orders">
        <h2 id="ret-orders" className="font-heading text-lg font-bold text-heading">
          Delivered orders
        </h2>
        {delivered.length === 0 ? (
          <div className="card mt-3 px-6 py-8 text-center">
            <p aria-hidden="true" className="text-4xl">
              📦
            </p>
            <p className="mt-2 font-semibold text-ink">No delivered orders yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              Only delivered orders can be returned.
              {DEMO_MODE &&
                " To try this in demo mode, open an order and press “Mark as delivered (demo)”."}
            </p>
            <Link href="/account/orders" className="btn-outline mt-4 inline-block">
              Go to my orders
            </Link>
          </div>
        ) : (
          <ul className="mt-3 space-y-4">
            {delivered.map((o) => {
              const state = returnState(o, returns, now);
              return (
                <li key={o.id} className="card min-w-0 p-4 sm:p-5">
                  <p className="break-all font-heading font-bold text-heading">{o.id}</p>
                  <p className="mt-1 text-sm text-muted">
                    {o.deliveredAt ? `Delivered on ${fmtDate(o.deliveredAt)}` : "Delivered"}
                    {o.isDemo ? " (marked by hand, demo)" : ""}
                  </p>
                  <span aria-hidden="true" className="mt-3 flex flex-wrap gap-1 text-2xl">
                    {o.items.slice(0, 4).map((i, idx) => (
                      <span key={idx} className="flex h-11 w-11 items-center justify-center rounded-field bg-tint">
                        {i.emoji ?? "📦"}
                      </span>
                    ))}
                  </span>

                  {state.kind === "eligible" && (
                    <>
                      <p className="mt-3 text-sm text-ink">You can return items until {fmtDate(state.deadline)}.</p>
                      <button
                        type="button"
                        onClick={() => openForm(o)}
                        aria-label={`Request a return for order ${o.id}`}
                        className="btn-primary mt-3 !py-2 text-sm"
                      >
                        Request return
                      </button>
                    </>
                  )}
                  {state.kind === "expired" && (
                    <p className="mt-3 text-sm text-muted">
                      The {RETURN_WINDOW_DAYS}-day return window closed on {fmtDate(state.deadline)}.
                    </p>
                  )}
                  {state.kind === "all_requested" && (
                    <p className="mt-3 text-sm text-muted">A return has already been requested for every item.</p>
                  )}
                  {state.kind === "no_date" && (
                    <p className="mt-3 text-sm text-muted">
                      This order has no delivery date, so it can&apos;t be returned here.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* requests already made */}
      <section aria-labelledby="ret-requests">
        <h2 id="ret-requests" className="font-heading text-lg font-bold text-heading">
          Your return requests
        </h2>
        {returns.length === 0 ? (
          <p className="mt-3 text-sm text-muted">You haven&apos;t requested any returns on this device.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {returns.map((r) => (
              <li key={r.id} className="card min-w-0 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="break-all font-heading font-bold text-heading">{r.id}</p>
                  <span className="rounded-full border border-line px-3 py-0.5 text-xs font-semibold text-ink">
                    Request received
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">Requested on {fmtDateTime(r.createdAt)}</p>
                <p className="mt-1 text-sm text-muted">
                  Order{" "}
                  <Link
                    href={`/account/orders/${encodeURIComponent(r.orderId)}`}
                    className="break-all font-semibold text-redtext hover:underline"
                  >
                    {r.orderId}
                  </Link>
                </p>
                <ul className="mt-3 space-y-2">
                  {r.items.map((i) => (
                    <li key={i.orderItemIndex} className="flex items-center gap-3 text-sm">
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field bg-tint text-2xl"
                      >
                        {i.emoji ?? "📦"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 break-words font-semibold text-ink">{i.name}</span>
                        <span className="block text-xs text-muted">Qty {i.quantity}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-ink">
                  <span className="text-muted">Reason: </span>
                  {reasonLabel(r.reason)}
                </p>
                {r.note && <p className="mt-1 break-words text-sm text-ink"><span className="text-muted">Your note: </span>{r.note}</p>}
                {r.isDemo && (
                  <p className="mt-3 rounded-field bg-tint px-3 py-2 text-xs text-muted">
                    Demo only: no pickup is arranged and no refund will be made.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
