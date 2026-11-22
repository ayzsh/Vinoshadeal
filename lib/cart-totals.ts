// Turns raw cart rows into "ready to show" rows (product, real price, safe quantity).
// The cart page uses it now. In Step D2 the price breakdown function is added to this
// same file, and checkout reuses it later. It reads no data itself: you pass the products in.

import type { Product } from "@/lib/types";
import type { CartLine } from "@/lib/cart-context";
import { priceFor } from "@/lib/pricing";

export interface ResolvedLine {
  /** the raw cart row */
  line: CartLine;
  /** null if the product no longer exists in the data */
  product: Product | null;
  /** true when the product is missing or out of stock: never counted in totals */
  unavailable: boolean;
  /** price and MRP of ONE unit, with the chosen options included */
  unitPrice: number;
  unitMrp: number;
  /** quantity we actually count (never more than the stock) */
  quantity: number;
  /** true when the saved quantity was higher than the stock and we lowered it */
  quantityReduced: boolean;
  /** unitPrice x quantity (0 when unavailable) */
  lineTotal: number;
}

export function resolveCartLines(lines: CartLine[], catalog: Product[]): ResolvedLine[] {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  return lines.map((line) => {
    const product = byId.get(line.productId) ?? null;
    if (!product || product.stock <= 0) {
      const { price, mrp } = product ? priceFor(product, line.variant) : { price: 0, mrp: 0 };
      return {
        line,
        product,
        unavailable: true,
        unitPrice: price,
        unitMrp: mrp,
        quantity: line.quantity,
        quantityReduced: false,
        lineTotal: 0,
      };
    }
    const { price, mrp } = priceFor(product, line.variant);
    const quantity = Math.min(line.quantity, product.stock);
    return {
      line,
      product,
      unavailable: false,
      unitPrice: price,
      unitMrp: mrp,
      quantity,
      quantityReduced: line.quantity > product.stock,
      lineTotal: price * quantity,
    };
  });
}
