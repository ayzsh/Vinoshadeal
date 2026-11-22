"use client";

import { useMemo } from "react";
import ProductShelf from "@/components/product/ProductShelf";
import { products } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

/** "Recently viewed" row. Reads the list saved by the cart context; hides the product being viewed. */
export default function RecentlyViewed({ currentId }: { currentId: string }) {
  const { recentlyViewed } = useCart();

  const list = useMemo(
    () =>
      recentlyViewed
        .filter((id) => id !== currentId)
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [recentlyViewed, currentId]
  );

  if (list.length === 0) return null;
  return <ProductShelf id="recently-viewed" title="Recently viewed" products={list} />;
}
