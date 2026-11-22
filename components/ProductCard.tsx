"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { discountPercent, formatINR } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

/**
 * variant="scroll" (default): fixed width, for horizontal rows on the home page
 * variant="grid":   fills its grid cell (category / search results)
 * variant="list":   horizontal layout (list view)
 */
export default function ProductCard({
  product,
  variant = "scroll",
}: {
  product: Product;
  variant?: "scroll" | "grid" | "list";
}) {
  const { isWishlisted, toggleWishlist } = useCart();
  const wished = isWishlisted(product.id);
  const off = discountPercent(product.price, product.mrp);
  const isList = variant === "list";
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 6;

  const width = variant === "scroll" ? "w-44 shrink-0 sm:w-52" : "w-full";

  return (
    <article
      className={`card card-hover relative flex h-full overflow-hidden ${isList ? "flex-row" : "flex-col"} ${width}`}
    >
      {off > 0 && !outOfStock && (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-brand-red px-2 py-0.5 text-xs font-bold text-white">
          {off}% OFF
        </span>
      )}
      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wished}
        className="absolute right-2 top-2 z-10 rounded-full bg-surface/90 p-1.5 shadow-soft transition hover:scale-110"
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-brand-red text-brand-red" : "text-muted"}`} />
      </button>

      <Link href={`/product/${product.slug}`} className={`flex flex-1 ${isList ? "flex-row" : "flex-col"}`}>
        <div
          className={`relative flex items-center justify-center bg-tint text-6xl ${
            isList ? "min-h-[8rem] w-32 shrink-0 sm:w-44" : "aspect-square"
          }`}
        >
          <span aria-hidden="true" className={outOfStock ? "opacity-40 grayscale" : ""}>
            {product.emoji}
          </span>
          {outOfStock && (
            <span className="absolute inset-x-0 bottom-2 mx-auto w-fit rounded-full bg-ink px-3 py-1 text-xs font-bold text-page">
              Out of stock
            </span>
          )}
        </div>
        <div className={`flex flex-1 flex-col gap-1 p-3 ${isList ? "sm:p-4" : ""}`}>
          <p className="text-xs font-medium text-muted">{product.brand}</p>
          <h3 className="line-clamp-2 min-h-[2.5rem] font-sans text-sm font-semibold text-ink">
            {product.name}
          </h3>
          {isList && product.description && (
            <p className="hidden line-clamp-2 text-xs text-muted sm:block">{product.description}</p>
          )}
          <div className="flex items-center gap-1 text-xs">
            <span className="inline-flex items-center gap-0.5 rounded bg-success px-1.5 py-0.5 font-bold text-white">
              {product.rating.toFixed(1)}
              <Star className="h-3 w-3 fill-white" aria-hidden="true" />
            </span>
            <span className="text-muted">({product.reviewCount.toLocaleString("en-IN")})</span>
          </div>
          <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
            <span className={`text-base font-bold ${outOfStock ? "text-muted" : "text-ink"}`}>
              {formatINR(product.price)}
            </span>
            <span className="text-xs text-muted line-through">{formatINR(product.mrp)}</span>
          </div>
          {lowStock && <p className="text-xs font-semibold text-redtext">Only {product.stock} left</p>}
        </div>
      </Link>
    </article>
  );
}