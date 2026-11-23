"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import Breadcrumbs from "@/components/listing/Breadcrumbs";
import DemoBanner from "@/components/checkout/DemoBanner";
import { useCart } from "@/lib/cart-context";
import { products } from "@/lib/data";
import { resolveCartLines, type ResolvedLine } from "@/lib/cart-totals";
import {
  EMPTY_FORM,
  FIELD_ORDER,
  computeCheckoutTotals,
  estimatedDelivery,
  loadSavedForm,
  saveForm,
  validateField,
  validateForm,
  type CheckoutForm,
  type CheckoutTotals,
  type FormErrors,
} from "@/lib/checkout";
import { DEMO_MODE, EXPRESS_DELIVERY_FEE, INDIAN_STATES } from "@/lib/constants";
import { addressToForm, loadAddresses } from "@/lib/addresses";
import { buildOrder, saveOrder } from "@/lib/orders";
import { PAYMENT_METHODS } from "@/lib/payment";
import { loadProfile } from "@/lib/profile";
import type { Address, DeliveryOption, PaymentMethod } from "@/lib/types";
import { formatINR } from "@/lib/utils";

export default function CheckoutView() {
  const router = useRouter();
  const { ready, items, couponCode, clearCart } = useCart();

  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [errorNote, setErrorNote] = useState("");
  const [delivery, setDelivery] = useState<DeliveryOption>("standard");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [paymentError, setPaymentError] = useState("");
  /** a problem found when placing the order (out of stock, storage blocked...) */
  const [placeError, setPlaceError] = useState<{ text: string; toCart: boolean } | null>(null);
  const [placing, setPlacing] = useState(false);
  /** addresses saved in "My account" on this device (Step F3b) */
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  /** id of the saved address the form was filled from, "" = a different address */
  const [chosenAddressId, setChosenAddressId] = useState("");

  // Prefill once, in this order:
  // 1. the DEFAULT saved address (name, mobile and address from it; email from "My profile",
  //    otherwise from the last checkout),
  // 2. otherwise the last address used at checkout on this device (used as it is),
  // 3. otherwise the details in "My profile" plus the pincode picked in the header.
  useEffect(() => {
    const addresses = loadAddresses();
    setSavedAddresses(addresses);
    const last = loadSavedForm();
    const profile = loadProfile();

    const def = addresses.find((a) => a.isDefault);
    if (def) {
      setForm({ ...addressToForm(def), email: profile?.email || last?.email || "" });
      setChosenAddressId(def.id);
      return;
    }
    if (last) {
      setForm(last);
      return;
    }
    let pin = "";
    try {
      const p = localStorage.getItem("pincode");
      if (p && /^\d{6}$/.test(p)) pin = p;
    } catch {
      /* ignore */
    }
    setForm((f) => ({
      ...f,
      fullName: profile?.name ?? f.fullName,
      phone: profile?.phone ?? f.phone,
      email: profile?.email ?? f.email,
      pincode: pin || f.pincode,
    }));
  }, []);

  useEffect(() => {
    if (placeError) document.getElementById("co-place-error")?.focus();
  }, [placeError]);

  const resolved = useMemo(() => resolveCartLines(items, products), [items]);
  const totals = useMemo(
    () => computeCheckoutTotals(resolved, couponCode, delivery),
    [resolved, couponCode, delivery]
  );
  const counted = resolved.filter((r) => !r.line.savedForLater && !r.unavailable);
  const blocked = resolved.filter((r) => !r.line.savedForLater && r.unavailable);

  // SAMPLE estimates: computed once the page is ready, so server and browser always agree.
  const estimates = useMemo(
    () => ({
      standard: estimatedDelivery("standard"),
      express: estimatedDelivery("express"),
    }),
    []
  );

  function change<K extends keyof CheckoutForm>(name: K, value: CheckoutForm[K]) {
    const next = { ...form, [name]: value };
    setForm(next);
    if (name !== "email" && chosenAddressId) setChosenAddressId("");
    // Once a field shows an error, re-check it while typing so the message goes away as soon as it is fixed.
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: validateField(next, name) }));
  }

  /** "Use a saved address": fills the form from it (the email stays as it is). */
  function chooseSavedAddress(id: string) {
    setChosenAddressId(id);
    setErrors({});
    setErrorNote("");
    const a = savedAddresses.find((x) => x.id === id);
    setForm((f) =>
      a
        ? { ...addressToForm(a), email: f.email }
        : { ...EMPTY_FORM, email: f.email } // "enter a different address": start with empty address fields
    );
  }

  function blur(name: keyof CheckoutForm) {
    if (form[name] === "") return; // empty fields are checked on "Place order"
    setErrors((prev) => ({ ...prev, [name]: validateField(form, name) }));
  }

  function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (placing) return;
    setPlaceError(null);

    // 1. the form and the payment choice
    const found = validateForm(form);
    setErrors(found);
    const missingPayment = payment === null;
    setPaymentError(missingPayment ? "Choose a payment method." : "");
    const problems = Object.keys(found).length + (missingPayment ? 1 : 0);
    if (problems > 0) {
      setErrorNote(`Please fix ${problems} ${problems === 1 ? "thing" : "things"} to continue.`);
      const first = FIELD_ORDER.find((k) => found[k]);
      if (first) document.getElementById(`co-${first}`)?.focus();
      else document.getElementById("co-payment-first")?.focus();
      return;
    }
    setErrorNote("");

    // 2. check stock and availability again, from the catalog, right now
    const fresh = resolveCartLines(items, products);
    const inCart = fresh.filter((r) => !r.line.savedForLater);
    const bad = inCart.filter((r) => r.unavailable || r.quantityReduced);
    if (bad.length > 0) {
      const names = bad.map((r) => {
        if (!r.product) return "an item that is no longer sold";
        return r.unavailable
          ? `${r.product.name} is out of stock`
          : `only ${r.product.stock} of ${r.product.name} ${r.product.stock === 1 ? "is" : "are"} left`;
      });
      setPlaceError({
        text: `We can't place this order yet: ${names.join("; ")}. Please update your cart.`,
        toCart: true,
      });
      return;
    }
    if (inCart.length === 0 || payment === null) {
      setPlaceError({ text: "Your cart is empty, so there is nothing to order.", toCart: true });
      return;
    }

    // 3. build and save the order (demo mode: in this browser only)
    const finalTotals = computeCheckoutTotals(fresh, couponCode, delivery);
    const order = buildOrder({
      lines: fresh,
      totals: finalTotals,
      form,
      paymentMethod: payment,
      estimatedDelivery: estimates[delivery],
    });
    if (!saveOrder(order)) {
      // Never pretend: the order was NOT saved, so the cart is kept as it is.
      setPlaceError({
        text: "We couldn't save your order because your browser blocked or filled its storage. Nothing was placed and your cart is unchanged.",
        toCart: false,
      });
      return;
    }
    saveForm(form);
    setPlacing(true); // shows "Placing your order" so the empty-cart screen never flashes
    clearCart(); // removes the cart lines, keeps "saved for later" items, clears the coupon
    router.push(`/order-confirmation/${order.id}`);
  }

  const showBar = ready && !placing && totals.itemCount > 0;

  return (
    // pb-44 on phones leaves room for the bottom nav (4rem) + the sticky bar (about 4rem).
    <div className={`container-page py-6 md:pb-10 ${showBar ? "pb-44" : "pb-24"}`}>
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]}
      />
      <h1 className="mt-3 font-heading text-2xl font-bold text-heading">Checkout</h1>
      <DemoBanner />

      {!ready ? (
        <CheckoutSkeleton />
      ) : placing ? (
        <div role="status" className="card mt-6 px-6 py-10 text-center">
          <p className="font-heading text-xl font-bold text-heading">Placing your order…</p>
          <p className="mt-1 text-sm text-muted">Please wait a moment.</p>
        </div>
      ) : totals.itemCount === 0 ? (
        <div className="card mt-6 px-6 py-10 text-center">
          <p aria-hidden="true" className="text-5xl">
            🛒
          </p>
          <p className="mt-3 font-heading text-xl font-bold text-heading">Nothing to check out yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            {blocked.length > 0
              ? "The items in your cart can't be bought right now. Remove them in your cart and add something else."
              : "Your cart has no items. Add something you like first."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/cart" className="btn-primary inline-block">
              Go to cart
            </Link>
            <Link href="/" className="btn-outline inline-block">
              Continue shopping
            </Link>
          </div>
        </div>
      ) : (
        <>
          {blocked.length > 0 && (
            <p role="alert" className="mt-4 rounded-field border border-line bg-tint px-4 py-3 text-sm font-semibold text-redtext">
              {blocked.length} {blocked.length === 1 ? "item" : "items"} in your cart can&apos;t be bought right
              now. Remove {blocked.length === 1 ? "it" : "them"} in your cart before placing your order.{" "}
              <Link href="/cart" className="underline">
                Go to cart
              </Link>
            </p>
          )}

          {placeError && (
            <p
              id="co-place-error"
              tabIndex={-1}
              role="alert"
              className="mt-4 rounded-field border border-line bg-tint px-4 py-3 text-sm font-semibold text-redtext outline-none"
            >
              {placeError.text}{" "}
              {placeError.toCart && (
                <Link href="/cart" className="underline">
                  Go to cart
                </Link>
              )}
            </p>
          )}

          {/* phones and tablets: collapsible summary at the top */}
          <div className="card mt-4 lg:hidden">
            <button
              type="button"
              aria-expanded={summaryOpen}
              aria-controls="mobile-summary"
              onClick={() => setSummaryOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
            >
              <span>
                <span className="block font-heading font-bold text-heading">Order summary</span>
                <span className="text-sm text-muted">
                  {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span aria-live="polite" className="font-heading text-lg font-bold text-ink">
                  {formatINR(totals.grandTotal)}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-muted transition ${summaryOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </span>
            </button>
            {summaryOpen && (
              <div id="mobile-summary" className="border-t border-line p-4">
                <SummaryBody lines={counted} totals={totals} />
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start">
            <form id="checkout-form" onSubmit={placeOrder} noValidate className="min-w-0 space-y-6">
              <p role="status" className="sr-only">
                {errorNote}
              </p>
              {errorNote && (
                <p className="rounded-field border border-line bg-tint px-4 py-3 text-sm font-semibold text-redtext">
                  {errorNote}
                </p>
              )}

              {/* ---------- 1. Contact and address ---------- */}
              <section aria-labelledby="sec-address" className="card p-5">
                <SectionTitle id="sec-address" n={1}>
                  Contact and address
                </SectionTitle>
                {savedAddresses.length > 0 && (
                  <div className="mt-4">
                    <label htmlFor="co-saved-address" className="text-sm font-semibold text-ink">
                      Use a saved address
                    </label>
                    <select
                      id="co-saved-address"
                      value={chosenAddressId}
                      onChange={(e) => chooseSavedAddress(e.target.value)}
                      className="mt-1 w-full min-w-0 rounded-field border border-line bg-page px-3 py-2.5 text-sm text-ink"
                    >
                      {savedAddresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.fullName}, {a.line1}, {a.city} {a.pincode}
                          {a.isDefault ? " (default)" : ""}
                        </option>
                      ))}
                      <option value="">Enter a different address</option>
                    </select>
                    <p className="pt-1 text-xs text-muted">
                      Saved on this device.{" "}
                      <Link href="/account/addresses" className="font-semibold text-redtext underline">
                        Manage saved addresses
                      </Link>
                    </p>
                  </div>
                )}
                <div className="mt-4 grid gap-x-4 sm:grid-cols-2">
                  <TextField
                    name="fullName"
                    label="Full name"
                    value={form.fullName}
                    error={errors.fullName}
                    autoComplete="name"
                    onChange={(v) => change("fullName", v)}
                    onBlur={() => blur("fullName")}
                  />
                  <TextField
                    name="phone"
                    label="Mobile number"
                    hint="10 digits, no +91"
                    value={form.phone}
                    error={errors.phone}
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel-national"
                    onChange={(v) => change("phone", v.replace(/\D/g, ""))}
                    onBlur={() => blur("phone")}
                  />
                  <div className="sm:col-span-2">
                    <TextField
                      name="email"
                      label="Email"
                      optional
                      type="email"
                      value={form.email}
                      error={errors.email}
                      autoComplete="email"
                      onChange={(v) => change("email", v)}
                      onBlur={() => blur("email")}
                    />
                  </div>
                  <TextField
                    name="pincode"
                    label="Pincode"
                    value={form.pincode}
                    error={errors.pincode}
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="postal-code"
                    onChange={(v) => change("pincode", v.replace(/\D/g, ""))}
                    onBlur={() => blur("pincode")}
                  />
                  <TextField
                    name="city"
                    label="City"
                    value={form.city}
                    error={errors.city}
                    autoComplete="address-level2"
                    onChange={(v) => change("city", v)}
                    onBlur={() => blur("city")}
                  />
                  <div className="sm:col-span-2">
                    <TextField
                      name="line1"
                      label="House or flat number and street"
                      value={form.line1}
                      error={errors.line1}
                      autoComplete="address-line1"
                      onChange={(v) => change("line1", v)}
                      onBlur={() => blur("line1")}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <TextField
                      name="line2"
                      label="Area or locality"
                      optional
                      value={form.line2}
                      error={errors.line2}
                      autoComplete="address-line2"
                      onChange={(v) => change("line2", v)}
                      onBlur={() => blur("line2")}
                    />
                  </div>

                  <div>
                    <label htmlFor="co-state" className="text-sm font-semibold text-ink">
                      State or union territory
                    </label>
                    <select
                      id="co-state"
                      value={form.state}
                      autoComplete="address-level1"
                      aria-invalid={errors.state ? true : undefined}
                      aria-describedby={errors.state ? "co-state-error" : undefined}
                      onChange={(e) => change("state", e.target.value)}
                      onBlur={() => blur("state")}
                      className={`mt-1 w-full rounded-field border bg-page px-3 py-2.5 text-sm text-ink ${
                        errors.state ? "border-brand-red-dark" : "border-line"
                      }`}
                    >
                      <option value="">Choose…</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <p id="co-state-error" className="min-h-5 pt-1 text-xs font-semibold text-redtext">
                      {errors.state}
                    </p>
                  </div>

                  <fieldset>
                    <legend className="text-sm font-semibold text-ink">Address type</legend>
                    <div className="mt-1 flex gap-3">
                      {(["home", "work"] as const).map((t) => (
                        <label
                          key={t}
                          className={`flex min-h-11 flex-1 cursor-pointer items-center gap-2 rounded-field border px-3 text-sm font-semibold text-ink ${
                            form.addressType === t ? "border-brand-red-dark bg-tint" : "border-line"
                          }`}
                        >
                          <input
                            type="radio"
                            name="addressType"
                            value={t}
                            checked={form.addressType === t}
                            onChange={() => change("addressType", t)}
                            className="h-4 w-4 accent-brand-red-dark"
                          />
                          {t === "home" ? "Home" : "Work"}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
                <p className="mt-2 text-xs text-muted">
                  We remember your last address on this device only, so you don&apos;t have to type it again.
                </p>
              </section>

              {/* ---------- 2. Delivery ---------- */}
              <section aria-labelledby="sec-delivery" className="card p-5">
                <SectionTitle id="sec-delivery" n={2}>
                  Delivery
                </SectionTitle>
                <fieldset className="mt-4">
                  <legend className="sr-only">Delivery option</legend>
                  <div className="space-y-3">
                    <DeliveryChoice
                      value="standard"
                      selected={delivery === "standard"}
                      onSelect={() => setDelivery("standard")}
                      title="Standard delivery"
                      price={totals.standardFee === 0 ? "Free" : formatINR(totals.standardFee)}
                      detail={`Estimated arrival: ${estimates.standard}`}
                    />
                    <DeliveryChoice
                      value="express"
                      selected={delivery === "express"}
                      onSelect={() => setDelivery("express")}
                      title="Express delivery"
                      price={formatINR(totals.standardFee + EXPRESS_DELIVERY_FEE)}
                      detail={`1 to 2 days, ${formatINR(EXPRESS_DELIVERY_FEE)} extra. Estimated arrival: ${estimates.express}`}
                    />
                  </div>
                </fieldset>
                {DEMO_MODE && (
                  <p className="mt-3 text-xs text-muted">Delivery dates are samples while the site is in demo mode.</p>
                )}
              </section>

              {/* ---------- 3. Payment ---------- */}
              <section aria-labelledby="sec-payment" className="card p-5">
                <SectionTitle id="sec-payment" n={3}>
                  Payment
                </SectionTitle>
                {/* Only a list to choose from. The site never asks for card, UPI or bank details. */}
                <fieldset aria-describedby={paymentError ? "co-payment-error" : undefined} className="mt-4">
                  <legend className="sr-only">Payment method</legend>
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((m, i) => (
                      <label
                        key={m.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-field border p-4 ${
                          payment === m.id ? "border-brand-red-dark bg-tint" : "border-line"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          id={i === 0 ? "co-payment-first" : undefined}
                          value={m.id}
                          checked={payment === m.id}
                          onChange={() => {
                            setPayment(m.id);
                            setPaymentError("");
                          }}
                          className="mt-1 h-4 w-4 accent-brand-red-dark"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-ink">{m.label}</span>
                          <span className="block text-sm text-muted">{m.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <p id="co-payment-error" className="min-h-5 pt-1 text-xs font-semibold text-redtext">
                    {paymentError}
                  </p>
                </fieldset>
                <p className="mt-2 text-xs text-muted">
                  Real online payment (UPI, card, net banking, wallets) will be switched on with Razorpay. It
                  opens its own secure window, so this site never asks for your card, UPI or bank details.
                </p>
              </section>

              {/* tablets: the button sits under the form (phones have the bottom bar, desktop has the summary card) */}
              <div className="hidden md:block lg:hidden">
                <button type="submit" className="btn-primary w-full">
                  Place order
                </button>
              </div>
            </form>

            {/* desktop: sticky summary */}
            <aside
              aria-label="Order summary"
              className="hidden lg:sticky lg:top-44 lg:block lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto"
            >
              <div className="card p-5">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-heading text-lg font-bold text-heading">Order summary</h2>
                  <Link href="/cart" className="text-sm font-semibold text-redtext hover:underline">
                    Edit cart
                  </Link>
                </div>
                <div className="mt-4">
                  <SummaryBody lines={counted} totals={totals} />
                </div>
                <button type="submit" form="checkout-form" className="btn-primary mt-4 w-full">
                  Place order
                </button>
              </div>
            </aside>
          </div>
        </>
      )}

      {/*
        Mobile bar: same stacking as /cart. bottom-16 sits on top of the bottom nav, z-30,
        and pr-24 keeps the button clear of the round WhatsApp button (right-4).
      */}
      {showBar && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-surface md:hidden">
          <div className="flex items-center justify-between gap-3 py-2.5 pl-4 pr-24">
            <div className="min-w-0">
              <p className="text-xs text-muted">Total</p>
              <p aria-live="polite" className="font-heading text-lg font-bold leading-tight text-ink">
                {formatINR(totals.grandTotal)}
              </p>
            </div>
            <button type="submit" form="checkout-form" className="btn-primary whitespace-nowrap !px-4 !py-2.5 text-sm">
              Place order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SectionTitle({ id, n, children }: { id: string; n: number; children: React.ReactNode }) {
  return (
    <h2 id={id} className="flex items-center gap-3 font-heading text-lg font-bold text-heading">
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-purple text-sm text-white"
      >
        {n}
      </span>
      {children}
    </h2>
  );
}

function TextField({
  name,
  label,
  value,
  error,
  hint,
  optional,
  type = "text",
  inputMode,
  maxLength,
  autoComplete,
  onChange,
  onBlur,
}: {
  name: string;
  label: string;
  value: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  type?: string;
  inputMode?: "numeric" | "text";
  maxLength?: number;
  autoComplete?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  const id = `co-${name}`;
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ");
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`mt-1 w-full rounded-field border bg-page px-3 py-2.5 text-sm text-ink placeholder:text-muted ${
          error ? "border-brand-red-dark" : "border-line"
        }`}
      />
      {hint && (
        <p id={`${id}-hint`} className="pt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {/* always on the page (with a minimum height) so an error never makes the form jump */}
      <p id={`${id}-error`} className="min-h-5 pt-1 text-xs font-semibold text-redtext">
        {error}
      </p>
    </div>
  );
}

function DeliveryChoice({
  value,
  selected,
  onSelect,
  title,
  price,
  detail,
}: {
  value: DeliveryOption;
  selected: boolean;
  onSelect: () => void;
  title: string;
  price: string;
  detail: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-field border p-4 ${
        selected ? "border-brand-red-dark bg-tint" : "border-line"
      }`}
    >
      <input
        type="radio"
        name="delivery"
        value={value}
        checked={selected}
        onChange={onSelect}
        className="mt-1 h-4 w-4 accent-brand-red-dark"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="font-semibold text-ink">{title}</span>
          <span className={`font-semibold ${price === "Free" ? "text-success" : "text-ink"}`}>{price}</span>
        </span>
        <span className="mt-0.5 block text-sm text-muted">{detail}</span>
      </span>
    </label>
  );
}

function SummaryBody({ lines, totals }: { lines: ResolvedLine[]; totals: CheckoutTotals }) {
  const t = totals;
  return (
    <div>
      <ul className="space-y-3">
        {lines.map((r) => (
          <li key={`${r.line.productId}|${JSON.stringify(r.line.variant ?? {})}`} className="flex gap-3">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-field bg-tint text-2xl"
            >
              {r.product?.emoji ?? "📦"}
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="line-clamp-1 font-semibold text-ink">{r.product?.name}</span>
              {r.line.variant && (
                <span className="block text-xs text-muted">
                  {Object.entries(r.line.variant)
                    .map(([g, l]) => `${g}: ${l}`)
                    .join(", ")}
                </span>
              )}
              <span className="block text-xs text-muted">
                Qty {r.quantity} × {formatINR(r.unitPrice)}
              </span>
            </span>
            <span className="text-sm font-semibold text-ink">{formatINR(r.lineTotal)}</span>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
        <Row
          label={`Price (${t.itemCount} ${t.itemCount === 1 ? "item" : "items"}, at MRP)`}
          value={formatINR(t.mrpTotal)}
        />
        {t.productDiscount > 0 && <Row label="Discount on MRP" value={`−${formatINR(t.productDiscount)}`} good />}
        {t.couponDiscount > 0 && t.coupon?.ok && (
          <Row label={`Coupon (${t.coupon.coupon.code})`} value={`−${formatINR(t.couponDiscount)}`} good />
        )}
        <Row
          label={`Delivery (${t.deliveryOption === "express" ? "Express" : "Standard"})`}
          value={t.deliveryCharge === 0 ? "Free" : formatINR(t.deliveryCharge)}
          good={t.deliveryCharge === 0}
        />
      </dl>

      {t.coupon && !t.coupon.ok && (
        <p className="mt-3 text-sm font-semibold text-redtext">
          Your coupon is not applied: {t.coupon.reason}{" "}
          <Link href="/cart" className="underline">
            Go to cart
          </Link>
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="font-heading font-bold text-heading">Total</span>
        <span aria-live="polite" className="font-heading text-xl font-bold text-ink">
          {formatINR(t.grandTotal)}
        </span>
      </div>

      {t.totalSavings > 0 && (
        <p aria-live="polite" className="mt-3 rounded-field bg-tint px-3 py-2 text-sm font-semibold text-success">
          You will save {formatINR(t.totalSavings)} on this order
        </p>
      )}
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

function CheckoutSkeleton() {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_24rem]" aria-busy="true">
      <p className="sr-only" role="status">
        Loading checkout
      </p>
      <div className="space-y-4">
        <div className="skeleton h-96 rounded-card" />
        <div className="skeleton h-40 rounded-card" />
      </div>
      <div className="skeleton hidden h-72 rounded-card lg:block" />
    </div>
  );
}
