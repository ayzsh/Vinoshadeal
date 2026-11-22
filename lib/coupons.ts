// Delivery rule + SAMPLE coupons + the coupon checker.
// Everything here is SAMPLE data for Round 1: the codes below are made up for testing
// and do not exist anywhere real. In Round 2 the coupon list comes from the database
// (admin dashboard), and `evaluateCoupon` should be re-checked on the server at checkout.

import type { ResolvedLine } from "@/lib/cart-totals";
import { getCategoryName } from "@/lib/data";
import { formatINR } from "@/lib/utils";

// ---------- delivery rule (change it here and the whole site follows) ----------
/** Orders with an item total of this much or more get free delivery (counted BEFORE any coupon). */
export const FREE_DELIVERY_MIN = 499;
/** Delivery charge for orders below the free-delivery amount. */
export const DELIVERY_FEE = 40;

// ---------- coupons ----------
export interface Coupon {
  code: string;
  /** short text shown to the shopper */
  description: string;
  type: "percent" | "flat";
  /** percent (e.g. 10) or rupees (e.g. 100) */
  value: number;
  /** highest discount in rupees (mainly for percent codes) */
  maxDiscount?: number;
  /** minimum item total (of the eligible items) in rupees */
  minOrder?: number;
  /** if set, the code only counts items from this category */
  categorySlug?: string;
}

// SAMPLE codes (not real).
export const SAMPLE_COUPONS: Coupon[] = [
  {
    code: "SAVE10",
    description: "10% off, up to ₹150",
    type: "percent",
    value: 10,
    maxDiscount: 150,
  },
  {
    code: "FLAT100",
    description: "₹100 off on orders of ₹999 or more",
    type: "flat",
    value: 100,
    minOrder: 999,
  },
  {
    code: "BEAUTY15",
    description: "15% off Beauty items, up to ₹200",
    type: "percent",
    value: 15,
    maxDiscount: 200,
    categorySlug: "beauty",
  },
];

export type CouponResult =
  | { ok: true; coupon: Coupon; discount: number; eligibleTotal: number }
  | { ok: false; reason: string };

/**
 * Checks a code against the cart. Never says "ok" unless the code really applies.
 * Saved-for-later and unavailable items are ignored.
 */
export function evaluateCoupon(code: string, lines: ResolvedLine[]): CouponResult {
  const typed = code.trim().toUpperCase();
  if (!typed) return { ok: false, reason: "Enter a coupon code." };

  const coupon = SAMPLE_COUPONS.find((c) => c.code === typed);
  if (!coupon) return { ok: false, reason: "This code is not valid. Check it and try again." };

  const active = lines.filter((l) => !l.line.savedForLater && !l.unavailable);
  if (active.length === 0) {
    return { ok: false, reason: "Add an item to your cart to use this code." };
  }

  const eligible = coupon.categorySlug
    ? active.filter((l) => l.product?.categorySlug === coupon.categorySlug)
    : active;
  const catName = coupon.categorySlug ? getCategoryName(coupon.categorySlug) : "";

  if (eligible.length === 0) {
    return {
      ok: false,
      reason: `This code works only on ${catName} items. Add a ${catName} item to use it.`,
    };
  }

  const eligibleTotal = eligible.reduce((sum, l) => sum + l.lineTotal, 0);
  if (coupon.minOrder && eligibleTotal < coupon.minOrder) {
    const need = formatINR(coupon.minOrder - eligibleTotal);
    return {
      ok: false,
      reason: catName
        ? `Add ${need} more of ${catName} items to use this code.`
        : `Add ${need} more to use this code.`,
    };
  }

  let discount =
    coupon.type === "percent" ? Math.round((eligibleTotal * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, eligibleTotal);

  return { ok: true, coupon, discount, eligibleTotal };
}
