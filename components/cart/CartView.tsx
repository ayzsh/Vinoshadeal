"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { Minus, Plus } from "lucide-react";
import Breadcrumbs from "@/components/listing/Breadcrumbs";
import { lineKey, useCart } from "@/lib/cart-context";
import { products } from "@/lib/data";
import { resolveCartLines, type ResolvedLine } from "@/lib/cart-totals";
import { discountPercent, formatINR } from "@/lib/utils";

const LOW_STOCK = 6;

export default function CartView() {
  const { ready, items, updateQuantity, removeFromCart, toggleSaveForLater, showToast } = useCart();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const resolved = useMemo(() => resolveCartLines(items, products), [items]);
  const inCart = resolved.filter((r) => !r.line.savedForLater);
  const saved = resolved.filter((r) => r.line.savedForLater);
  const buyable = inCart.filter((r) => !r.unavailable);
  const itemCount = buyable.reduce((sum, r) => sum + r.quantity, 0);
  const subtotal = buyable.reduce((sum, r) => sum + r.lineTotal, 0);

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
    <div className="container-page py-6 pb-24 md:pb-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 font-heading text-2xl font-bold text-heading outline-none"
      >
        Your cart
        {ready && buyable.length > 0 && (
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
                // Simple version. Step D3 replaces this with the full empty state.
                <div className="card p-6 text-center">
                  <p className="font-heading text-lg font-semibold text-heading">Your cart is empty</p>
                  <p className="mt-1 text-sm text-muted">
                    {saved.length > 0
                      ? "Move something from Saved for later, or keep shopping."
                      : "Add something you like and it will show up here."}
                  </p>
                  <Link href="/" className="btn-primary mt-4 inline-block">
                    Continue shopping
                  </Link>
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
          {buyable.length > 0 && (
            <aside aria-label="Order summary" className="lg:sticky lg:top-44">
              {/* Step D1 shows only the item total. Step D2 replaces this card with the full price breakdown. */}
              <div className="card p-5">
                <h2 className="font-heading text-lg font-bold text-heading">Order summary</h2>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted">
                    Items total ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                  <span aria-live="polite" className="font-heading text-lg font-bold text-ink">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  Delivery, coupons and the final total come in the next step.
                </p>
              </div>
            </aside>
          )}
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
