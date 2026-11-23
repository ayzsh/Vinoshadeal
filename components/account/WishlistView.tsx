"use client";

import Link from "next/link";
import { useRef } from "react";
import { Star } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { products } from "@/lib/data";
import { defaultSelection, priceFor } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import { discountPercent, formatINR } from "@/lib/utils";

/**
 * /account/wishlist: every product hearted on this device (newest first).
 * - No options: "Add to cart".
 * - Has options (colour, storage...): "Choose options", which opens the product page,
 *   because the options change the price.
 * Both have "Remove". The list is kept in cart-context (localStorage), so nothing new is stored here.
 */
export default function WishlistView() {
  const { ready, wishlist, toggleWishlist, addToCart } = useCart();
  const statusRef = useRef<HTMLParagraphElement>(null);

  // newest first; ids of products that no longer exist are skipped
  const list: Product[] = [...wishlist]
    .reverse()
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p);

  if (!ready) {
    return (
      <div className="space-y-4" aria-busy="true">
        <p className="sr-only" role="status">
          Loading your wishlist
        </p>
        <div className="skeleton h-40 rounded-card" />
        <div className="skeleton h-40 rounded-card" />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="card px-6 py-10 text-center">
        <p aria-hidden="true" className="text-5xl">
          ❤️
        </p>
        <h2 className="mt-3 font-heading text-lg font-bold text-heading">Your wishlist is empty</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          Tap the heart on any product to save it here. Your wishlist is kept on this device only.
        </p>
        <Link href="/" className="btn-primary mt-5 inline-block">
          Start shopping
        </Link>
      </div>
    );
  }

  function remove(p: Product) {
    toggleWishlist(p.id); // the toast "Removed from wishlist" comes from the cart context
    // the button the person pressed disappears, so move the keyboard focus somewhere sensible
    statusRef.current?.focus();
  }

  return (
    <section aria-label="Your wishlist">
      <p
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="mb-4 text-sm text-muted outline-none"
      >
        {list.length} saved {list.length === 1 ? "item" : "items"}
      </p>

      <ul className="space-y-4">
        {list.map((p) => {
          const hasOptions = (p.variants?.length ?? 0) > 0;
          const outOfStock = p.stock <= 0;
          const lowStock = !outOfStock && p.stock <= 6;
          // with options we show the price of the pre-selected options, the same as the product page
          const { price, mrp } = hasOptions ? priceFor(p, defaultSelection(p)) : { price: p.price, mrp: p.mrp };
          const off = discountPercent(price, mrp);

          return (
            <li key={p.id} className="card p-4 sm:p-5">
              <div className="flex gap-3 sm:gap-4">
                <Link
                  href={`/product/${p.slug}`}
                  aria-hidden="true"
                  tabIndex={-1}
                  className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-field bg-tint text-4xl sm:h-24 sm:w-24 sm:text-5xl ${
                    outOfStock ? "opacity-50 grayscale" : ""
                  }`}
                >
                  {p.emoji}
                </Link>

                <div className="min-w-0 flex-1 text-sm">
                  <p className="text-xs font-medium text-muted">{p.brand}</p>
                  <Link
                    href={`/product/${p.slug}`}
                    className="line-clamp-2 break-words font-semibold text-ink hover:text-redtext hover:underline"
                  >
                    {p.name}
                  </Link>

                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <span className="inline-flex items-center gap-0.5 rounded bg-success px-1.5 py-0.5 font-bold text-white">
                      {p.rating.toFixed(1)}
                      <Star className="h-3 w-3 fill-white" aria-hidden="true" />
                    </span>
                    <span>({p.reviewCount.toLocaleString("en-IN")})</span>
                  </p>

                  <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
                    <span className={`text-base font-bold ${outOfStock ? "text-muted" : "text-ink"}`}>
                      {formatINR(price)}
                    </span>
                    {mrp > price && <span className="text-xs text-muted line-through">{formatINR(mrp)}</span>}
                    {off > 0 && !outOfStock && <span className="text-xs font-semibold text-success">{off}% off</span>}
                  </p>

                  {hasOptions && !outOfStock && (
                    <p className="mt-0.5 text-xs text-muted">Price changes with the options you choose.</p>
                  )}
                  {outOfStock && <p className="mt-1 text-xs font-semibold text-redtext">Out of stock</p>}
                  {lowStock && <p className="mt-1 text-xs font-semibold text-redtext">Only {p.stock} left</p>}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {outOfStock ? (
                  <button type="button" disabled className="btn-primary !py-2 text-sm opacity-50">
                    Out of stock
                  </button>
                ) : hasOptions ? (
                  <Link href={`/product/${p.slug}`} className="btn-primary inline-block !py-2 text-sm">
                    Choose options
                  </Link>
                ) : (
                  <button type="button" onClick={() => addToCart(p.id, 1)} className="btn-primary !py-2 text-sm">
                    Add to cart
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(p)}
                  aria-label={`Remove ${p.name} from wishlist`}
                  className="btn-outline !py-2 text-sm"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
