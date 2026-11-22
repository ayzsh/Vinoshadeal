// Turns raw cart rows into "ready to show" rows (product, real price, safe quantity).
// The cart page uses it now. In Step D2 the price breakdown function is added to this
// same file, and checkout reuses it later. It reads no data itself: you pass the products in.

import type { Product } from "@/lib/types";
import type { CartLine } from "@/lib/cart-context";
import { priceFor } from "@/lib/pricing";
import { DELIVERY_FEE, FREE_DELIVERY_MIN, evaluateCoupon, type CouponResult } from "@/lib/coupons";

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

// ---------------------------------------------------------------------------
// Price breakdown (Step D2). Checkout will reuse this same function.
// ---------------------------------------------------------------------------

export interface CartTotals {
  /** number of units that are counted (in the cart, not saved, available) */
  itemCount: number;
  /** all counted items at MRP */
  mrpTotal: number;
  /** all counted items at selling price (the "item total"; the free-delivery rule uses this) */
  itemTotal: number;
  /** mrpTotal - itemTotal */
  productDiscount: number;
  /** result of the coupon check, or null if no code is applied */
  coupon: CouponResult | null;
  /** rupees taken off by the coupon (0 if none or not valid) */
  couponDiscount: number;
  deliveryFee: number;
  /** how much more item total is needed for free delivery (0 when already free or cart is empty) */
  amountForFreeDelivery: number;
  /** what the shopper pays */
  total: number;
  /** productDiscount + couponDiscount */
  totalSavings: number;
}

export function computeTotals(lines: ResolvedLine[], couponCode?: string | null): CartTotals {
  const counted = lines.filter((l) => !l.line.savedForLater && !l.unavailable);
  const itemCount = counted.reduce((s, l) => s + l.quantity, 0);
  const mrpTotal = counted.reduce((s, l) => s + l.unitMrp * l.quantity, 0);
  const itemTotal = counted.reduce((s, l) => s + l.lineTotal, 0);
  const productDiscount = Math.max(0, mrpTotal - itemTotal);

  const coupon = couponCode ? evaluateCoupon(couponCode, lines) : null;
  const couponDiscount = coupon && coupon.ok ? coupon.discount : 0;

  const hasItems = itemTotal > 0;
  const deliveryFee = hasItems && itemTotal < FREE_DELIVERY_MIN ? DELIVERY_FEE : 0;
  const amountForFreeDelivery = hasItems ? Math.max(0, FREE_DELIVERY_MIN - itemTotal) : 0;

  return {
    itemCount,
    mrpTotal,
    itemTotal,
    productDiscount,
    coupon,
    couponDiscount,
    deliveryFee,
    amountForFreeDelivery,
    total: Math.max(0, itemTotal - couponDiscount + deliveryFee),
    totalSavings: productDiscount + couponDiscount,
  };
}
