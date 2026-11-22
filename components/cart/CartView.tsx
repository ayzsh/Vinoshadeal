"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Minus, Plus, Tag, X } from "lucide-react";
import Breadcrumbs from "@/components/listing/Breadcrumbs";
import { lineKey, useCart } from "@/lib/cart-context";
import { categories, products } from "@/lib/data";
import { computeTotals, resolveCartLines, type CartTotals, type ResolvedLine } from "@/lib/cart-totals";
import { FREE_DELIVERY_MIN, SAMPLE_COUPONS, evaluateCoupon } from "@/lib/coupons";
import { discountPercent, formatINR } from "@/lib/utils";

const LOW_STOCK = 6;

export default function CartView() {
  const { ready, items, updateQuantity, removeFromCart, toggleSaveForLater, showToast } = useCart();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const resolved = useMemo(() => resolveCartLines(items, products), [items]);
  const inCart = resolved.filter((r) => !r.line.savedForLater);
  const saved = resolved.filter((r) => r.line.savedForLater);

  // The applied coupon code lives here (cart page state), not in cart-context.
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const totals = useMemo(() => computeTotals(resolved, appliedCode), [resolved, appliedCode]);
  const itemCount = totals.itemCount;

  function applyCoupon(raw: string) {
    const result = evaluateCoupon(raw, resolved);
    if (!result.ok) {
      setCouponError(result.reason);
      return;
    }
    setAppliedCode(result.coupon.code);
    setCouponInput("");
    setCouponError("");
    showToast(`Coupon ${result.coupon.code} applied`);
  }

  function removeCoupon() {
    setAppliedCode(null);
    setCouponError("");
    showToast("Coupon removed");
  }

  function remove(r: ResolvedLine) {
    removeFromCart(lineKey(r.line.productId, r.line.variant));
    showToast("Removed from cart");
    // The clicked button disappears, so move keyboard/screen-reader focus to the page title.
    headingRef.current?.focus();
  }

  function removeSaved(r: ResolvedLine) {
    removeFromCart(lineKey(r.line.productId, r.line.variant));
    showToast("Removed from saved items");
    headingRef.current?.focus();
  }

  return (
    // pb-44 on phones leaves room for the bottom nav (4rem) + the checkout bar (about 4rem).
    <div className={`container-page py-6 md:pb-10 ${ready && itemCount > 0 ? "pb-44" : "pb-24"}`}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 font-heading text-2xl font-bold text-heading outline-none"
      >
        Your cart
        {ready && itemCount > 0 && (
          <span aria-live="polite" className="ml-2 text-base font-normal text-muted">
            ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
        )}
      </h1>

      {!ready ? (
        <CartSkeleton />
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div className="min-w-0 space-y-8">
            {/* ---------- lines in the cart ---------- */}
            <section aria-label="Items in your cart">
              {inCart.length === 0 ? (
                <div className="card px-6 py-10 text-center">
                  <p aria-hidden="true" className="text-5xl">
                    🛒
                  </p>
                  <p className="mt-3 font-heading text-xl font-bold text-heading">Your cart is empty</p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
                    {saved.length > 0
                      ? "Your saved items are below. Move one to your cart, or keep shopping."
                      : "Add something you like and it will show up here."}
                  </p>
                  <Link href="/" className="btn-primary mt-5 inline-block">
                    Continue shopping
                  </Link>
                  <nav aria-label="Shop by category" className="mt-6">
                    <p className="text-sm font-semibold text-ink">Or browse a category</p>
                    <ul className="mt-3 flex flex-wrap justify-center gap-2">
                      {categories.slice(0, 6).map((c) => (
                        <li key={c.id}>
                          <Link
                            href={`/category/${c.slug}`}
                            className="inline-block rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-tint hover:text-redtext"
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              ) : (
                <ul className="space-y-4">
                  {inCart.map((r) => (
                    <CartLineCard
                      key={lineKey(r.line.productId, r.line.variant)}
                      r={r}
                      onQuantity={(q) => updateQuantity(lineKey(r.line.productId, r.line.variant), q)}
                      onRemove={() => remove(r)}
                      onSave={() => toggleSaveForLater(lineKey(r.line.productId, r.line.variant))}
                    />
                  ))}
                </ul>
              )}
              {inCart.length > 0 && itemCount === 0 && (
                <p role="status" className="mt-4 text-sm font-semibold text-redtext">
                  None of these items can be bought right now. Remove them to continue shopping.
                </p>
              )}
            </section>

            {/* ---------- saved for later ---------- */}
            {saved.length > 0 && (
              <section aria-labelledby="saved-title">
                <h2 id="saved-title" className="font-heading text-lg font-bold text-heading">
                  Saved for later ({saved.length})
                </h2>
                <p className="mt-1 text-sm text-muted">Saved items are not counted in your total.</p>
                <ul className="mt-3 space-y-4">
                  {saved.map((r) => (
                    <SavedLineCard
                      key={lineKey(r.line.productId, r.line.variant)}
                      r={r}
                      onMove={() => toggleSaveForLater(lineKey(r.line.productId, r.line.variant))}
                      onRemove={() => removeSaved(r)}
                    />
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* ---------- right column ---------- */}
          {itemCount > 0 && (
            <aside
              aria-label="Coupon and price details"
              className="space-y-4 lg:sticky lg:top-44 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto"
            >
              <CouponBox
                appliedCode={appliedCode}
                totals={totals}
                input={couponInput}
                error={couponError}
                onInput={(v) => {
                  setCouponInput(v);
                  setCouponError("");
                }}
                onApply={applyCoupon}
                onRemove={removeCoupon}
              />
              <PriceCard totals={totals} />
            </aside>
          )}
        </div>
      )}

      {/*
        Mobile checkout bar. bottom-16 sits right on top of the bottom nav, z-30 like the product page bar.
        pr-24 keeps the Proceed button clear of the round WhatsApp button (right-4, floats over this bar).
        Phones only: from md up, the button is inside the Price details card.
      */}
      {ready && itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-surface md:hidden">
          <div className="flex items-center justify-between gap-3 py-2.5 pl-4 pr-24">
            <div className="min-w-0">
              <p className="text-xs text-muted">Total</p>
              <p aria-live="polite" className="font-heading text-lg font-bold leading-tight text-ink">
                {formatINR(totals.total)}
              </p>
            </div>
            <Link href="/checkout" className="btn-primary whitespace-nowrap !px-4 !py-2.5 text-sm">
              Proceed to checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function optionText(r: ResolvedLine): string {
  const v = r.line.variant;
  if (!v) return "";
  return Object.entries(v)
    .map(([group, label]) => `${group}: ${label}`)
    .join(", ");
}

function CartLineCard({
  r,
  onQuantity,
  onRemove,
  onSave,
}: {
  r: ResolvedLine;
  onQuantity: (q: number) => void;
  onRemove: () => void;
  onSave: () => void;
}) {
  const { product } = r;
  const name = product?.name ?? "This product is no longer available";
  const options = optionText(r);

  if (r.unavailable) {
    return (
      <li className="card p-4">
        <div className="flex gap-4">
          <Picture emoji={product?.emoji} dim />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-muted">{name}</p>
            {options && <p className="mt-0.5 text-sm text-muted">{options}</p>}
            <p className="mt-2 text-sm font-semibold text-redtext">
              {product ? "Out of stock" : "Not available"}. This item is not counted in your total.
            </p>
          </div>
        </div>
        <div className="mt-3 flex border-t border-line pt-3">
          <ActionButton onClick={onRemove} label={`Remove ${name} from cart`}>
            Remove
          </ActionButton>
        </div>
      </li>
    );
  }

  const stock = product!.stock;
  const atMax = r.quantity >= stock;
  const off = discountPercent(r.unitPrice, r.unitMrp);

  return (
    <li className="card p-4">
      <div className="flex gap-4">
        <Link
          href={`/product/${product!.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="shrink-0"
        >
          <Picture emoji={product!.emoji} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/product/${product!.slug}`}
            className="line-clamp-2 font-semibold text-ink hover:text-redtext hover:underline"
          >
            {product!.name}
          </Link>
          <p className="mt-0.5 text-sm text-muted">{product!.brand}</p>
          {options && <p className="mt-0.5 text-sm text-muted">{options}</p>}
          <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
            <span className="font-heading text-lg font-bold text-ink">{formatINR(r.unitPrice)}</span>
            {off > 0 && (
              <>
                <span className="text-sm text-muted line-through">
                  <span className="sr-only">MRP </span>
                  {formatINR(r.unitMrp)}
                </span>
                <span className="text-sm font-semibold text-success">{off}% off</span>
              </>
            )}
          </p>
          {stock <= LOW_STOCK && !atMax && (
            <p className="mt-1 text-xs font-semibold text-redtext">Only {stock} left</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-3">
        <div>
          <div role="group" aria-label={`Quantity for ${product!.name}`} className="flex items-center">
            <button
              type="button"
              onClick={() => onQuantity(r.quantity - 1)}
              disabled={r.quantity <= 1}
              aria-label={`Decrease quantity of ${product!.name}`}
              className="flex h-10 w-10 items-center justify-center rounded-l-field border border-line bg-surface text-ink transition hover:bg-tint disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span
              aria-live="polite"
              className="flex h-10 min-w-12 items-center justify-center border-y border-line bg-surface px-2 font-semibold text-ink"
            >
              {r.quantity}
              <span className="sr-only"> in cart</span>
            </span>
            <button
              type="button"
              onClick={() => onQuantity(r.quantity + 1)}
              disabled={atMax}
              aria-label={`Increase quantity of ${product!.name}`}
              className="flex h-10 w-10 items-center justify-center rounded-r-field border border-line bg-surface text-ink transition hover:bg-tint disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p aria-live="polite" className="mt-1 text-xs font-semibold text-redtext">
            {r.quantityReduced
              ? `Only ${stock} available, so we lowered your quantity to ${r.quantity}.`
              : atMax
                ? `Only ${stock} available. You have the maximum.`
                : ""}
          </p>
        </div>

        <p className="text-sm text-muted">
          Item total{" "}
          <span aria-live="polite" className="font-heading text-lg font-bold text-ink">
            {formatINR(r.lineTotal)}
          </span>
        </p>

        <div className="flex items-center gap-1">
          <ActionButton onClick={onSave} label={`Save ${product!.name} for later`}>
            Save for later
          </ActionButton>
          <ActionButton onClick={onRemove} label={`Remove ${product!.name} from cart`}>
            Remove
          </ActionButton>
        </div>
      </div>
    </li>
  );
}

function SavedLineCard({
  r,
  onMove,
  onRemove,
}: {
  r: ResolvedLine;
  onMove: () => void;
  onRemove: () => void;
}) {
  const { product } = r;
  const name = product?.name ?? "This product is no longer available";
  const options = optionText(r);

  return (
    <li className="card p-4">
      <div className="flex gap-4">
        {product && !r.unavailable ? (
          <Link href={`/product/${product.slug}`} tabIndex={-1} aria-hidden="true" className="shrink-0">
            <Picture emoji={product.emoji} />
          </Link>
        ) : (
          <Picture emoji={product?.emoji} dim />
        )}
        <div className="min-w-0 flex-1">
          {product && !r.unavailable ? (
            <Link
              href={`/product/${product.slug}`}
              className="line-clamp-2 font-semibold text-ink hover:text-redtext hover:underline"
            >
              {name}
            </Link>
          ) : (
            <p className="font-semibold text-muted">{name}</p>
          )}
          {product && <p className="mt-0.5 text-sm text-muted">{product.brand}</p>}
          {options && <p className="mt-0.5 text-sm text-muted">{options}</p>}
          {r.unavailable ? (
            <p className="mt-2 text-sm font-semibold text-redtext">
              {product ? "Out of stock" : "Not available"}
            </p>
          ) : (
            <p className="mt-2 font-heading text-lg font-bold text-ink">{formatINR(r.unitPrice)}</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-line pt-3">
        {!r.unavailable && (
          <ActionButton onClick={onMove} label={`Move ${name} to cart`}>
            Move to cart
          </ActionButton>
        )}
        <ActionButton onClick={onRemove} label={`Remove ${name} from saved items`}>
          Remove
        </ActionButton>
      </div>
    </li>
  );
}

function Picture({ emoji, dim = false }: { emoji?: string; dim?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-field bg-tint text-5xl ${
        dim ? "opacity-50 grayscale" : ""
      }`}
    >
      {emoji ?? "📦"}
    </span>
  );
}

function ActionButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="min-h-10 rounded-field px-3 text-sm font-semibold text-redtext transition hover:bg-tint hover:underline"
    >
      {children}
    </button>
  );
}

function CartSkeleton() {
  return (
    <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_22rem]" aria-busy="true">
      <p className="sr-only" role="status">
        Loading your cart
      </p>
      <div className="space-y-4">
        <div className="skeleton h-44 rounded-card" />
        <div className="skeleton h-44 rounded-card" />
      </div>
      <div className="skeleton hidden h-40 rounded-card lg:block" />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PriceCard({ totals }: { totals: CartTotals }) {
  const t = totals;
  const progress = Math.min(100, Math.round((t.itemTotal / FREE_DELIVERY_MIN) * 100));
  return (
    <div className="card p-5">
      <h2 className="font-heading text-lg font-bold text-heading">Price details</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <Row
          label={`Price (${t.itemCount} ${t.itemCount === 1 ? "item" : "items"}, at MRP)`}
          value={formatINR(t.mrpTotal)}
        />
        {t.productDiscount > 0 && (
          <Row label="Discount on MRP" value={`−${formatINR(t.productDiscount)}`} good />
        )}
        {t.couponDiscount > 0 && t.coupon?.ok && (
          <Row label={`Coupon (${t.coupon.coupon.code})`} value={`−${formatINR(t.couponDiscount)}`} good />
        )}
        <Row
          label="Delivery fee"
          value={t.deliveryFee === 0 ? "Free" : formatINR(t.deliveryFee)}
          good={t.deliveryFee === 0}
        />
      </dl>

      <div aria-live="polite" className="mt-3">
        {t.amountForFreeDelivery > 0 ? (
          <>
            <p className="text-sm text-ink">
              Add <span className="font-semibold">{formatINR(t.amountForFreeDelivery)}</span> more for free
              delivery
            </p>
            <div
              role="progressbar"
              aria-label="Progress towards free delivery"
              aria-valuemin={0}
              aria-valuemax={FREE_DELIVERY_MIN}
              aria-valuenow={Math.min(t.itemTotal, FREE_DELIVERY_MIN)}
              className="mt-1.5 h-2 overflow-hidden rounded-full bg-line"
            >
              <div className="h-full rounded-full bg-brand-red transition-all" style={{ width: `${progress}%` }} />
            </div>
          </>
        ) : (
          <p className="text-sm font-semibold text-success">You get free delivery on this order</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="font-heading font-bold text-heading">Total</span>
        <span aria-live="polite" className="font-heading text-xl font-bold text-ink">
          {formatINR(t.total)}
        </span>
      </div>

      {t.totalSavings > 0 && (
        <p aria-live="polite" className="mt-3 rounded-field bg-tint px-3 py-2 text-sm font-semibold text-success">
          You will save {formatINR(t.totalSavings)} on this order
        </p>
      )}

      {/* On phones the sticky bottom bar has this button instead. */}
      <div className="mt-4 hidden md:block">
        <Link href="/checkout" className="btn-primary block w-full text-center">
          Proceed to checkout
        </Link>
      </div>
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

function CouponBox({
  appliedCode,
  totals,
  input,
  error,
  onInput,
  onApply,
  onRemove,
}: {
  appliedCode: string | null;
  totals: CartTotals;
  input: string;
  error: string;
  onInput: (v: string) => void;
  onApply: (code: string) => void;
  onRemove: () => void;
}) {
  const result = totals.coupon;
  return (
    <div className="card p-5">
      <h2 className="font-heading text-lg font-bold text-heading">Coupon</h2>

      {appliedCode && (
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-tint py-1 pl-3 pr-1 text-sm font-semibold text-ink">
            <Tag className="h-4 w-4" aria-hidden="true" />
            {appliedCode}
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove coupon ${appliedCode}`}
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-line"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </span>
          {/* If the cart changes so the code no longer qualifies, we say so instead of pretending. */}
          <p aria-live="polite" className="mt-2 text-sm">
            {result?.ok ? (
              <span className="font-semibold text-success">You saved {formatINR(result.discount)} with this code</span>
            ) : (
              <span className="font-semibold text-redtext">Not applied: {result && !result.ok ? result.reason : ""}</span>
            )}
          </p>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onApply(input);
        }}
        className="mt-3 flex gap-2"
      >
        <label htmlFor="coupon-code" className="sr-only">
          Coupon code
        </label>
        <input
          id="coupon-code"
          value={input}
          onChange={(e) => onInput(e.target.value)}
          placeholder="Enter coupon code"
          autoComplete="off"
          autoCapitalize="characters"
          aria-describedby="coupon-message"
          className="min-w-0 flex-1 rounded-field border border-line bg-page px-3 py-2.5 text-sm uppercase text-ink placeholder:normal-case placeholder:text-muted"
        />
        <button type="submit" className="btn-outline !py-2.5 text-sm">
          Apply
        </button>
      </form>
      <p id="coupon-message" aria-live="polite" className="mt-2 text-sm font-semibold text-redtext">
        {error}
      </p>

      <div className="mt-3 border-t border-line pt-3">
        <p className="text-xs font-semibold text-muted">SAMPLE codes (for testing only, not real offers)</p>
        <ul className="mt-2 space-y-2">
          {SAMPLE_COUPONS.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => onApply(c.code)}
                className="w-full rounded-field border border-dashed border-line px-3 py-2 text-left transition hover:bg-tint"
              >
                <span className="font-semibold text-ink">{c.code}</span>
                <span className="block text-xs text-muted">{c.description}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
