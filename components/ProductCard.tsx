"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { discountPercent, formatINR } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const [wished, setWished] = useState(false);
  const off = discountPercent(product.price, product.mrp);

  return (
    <article className="card card-hover relative flex h-full w-44 shrink-0 flex-col overflow-hidden sm:w-52">
      {off > 0 && (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-brand-red px-2 py-0.5 text-xs font-bold text-white">
          {off}% OFF
        </span>
      )}
      <button
        type="button"
        onClick={() => setWished((w) => !w)}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wished}
        className="absolute right-2 top-2 z-10 rounded-full bg-surface/90 p-1.5 shadow-soft transition hover:scale-110"
      >
        <Heart
          className={`h-4 w-4 ${wished ? "fill-brand-red text-brand-red" : "text-muted"}`}
        />
      </button>

      <Link href={`/product/${product.slug}`} className="flex flex-1 flex-col">
        <div className="flex aspect-square items-center justify-center bg-tint text-6xl">
          <span aria-hidden="true">{product.emoji}</span>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <p className="text-xs font-medium text-muted">{product.brand}</p>
          <h3 className="line-clamp-2 min-h-[2.5rem] font-sans text-sm font-semibold text-ink">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 text-xs">
            <span className="inline-flex items-center gap-0.5 rounded bg-success px-1.5 py-0.5 font-bold text-white">
              {product.rating.toFixed(1)}
              <Star className="h-3 w-3 fill-white" aria-hidden="true" />
            </span>
            <span className="text-muted">({product.reviewCount.toLocaleString("en-IN")})</span>
          </div>
          <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
            <span className="text-base font-bold text-ink">{formatINR(product.price)}</span>
            <span className="text-xs text-muted line-through">{formatINR(product.mrp)}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
