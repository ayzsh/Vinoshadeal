// Orders are saved in this browser only (localStorage) while the site is in DEMO MODE.
// Round 2: replace the functions below with Supabase calls and real order numbers from the server.

import type { Order, OrderItem, PaymentMethod } from "@/lib/types";
import type { ResolvedLine } from "@/lib/cart-totals";
import { formToAddress, type CheckoutForm, type CheckoutTotals } from "@/lib/checkout";
import { DEMO_MODE, ORDERS_STORAGE_KEY } from "@/lib/constants";

const MAX_ORDERS = 50;

/** e.g. "DEMO-261123-K7Q2M9" (demo) or "VD-261123-K7Q2M9" (real, later) */
export function createOrderId(now: Date = new Date()): string {
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I, easier to read out loud
  const bytes = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  const rand = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `${DEMO_MODE ? "DEMO" : "VD"}-${yy}${mm}${dd}-${rand}`;
}

/** Turns the checked cart lines + form into an Order. Only lines that can be bought are included. */
export function buildOrder(args: {
  lines: ResolvedLine[];
  totals: CheckoutTotals;
  form: CheckoutForm;
  paymentMethod: PaymentMethod;
  /** the SAMPLE estimate text shown at checkout */
  estimatedDelivery: string;
}): Order {
  const { lines, totals, form, paymentMethod, estimatedDelivery } = args;
  const id = createOrderId();

  const items: OrderItem[] = lines
    .filter((r) => !r.line.savedForLater && !r.unavailable && r.product)
    .map((r) => ({
      productId: r.line.productId,
      name: r.product!.name,
      price: r.unitPrice,
      quantity: r.quantity,
      slug: r.product!.slug,
      emoji: r.product!.emoji,
      mrp: r.unitMrp,
      variant: r.line.variant,
    }));

  const couponOk = totals.coupon && totals.coupon.ok ? totals.coupon : null;

  return {
    id,
    userId: "guest", // guest checkout only for now
    items,
    total: totals.grandTotal,
    status: "placed",
    address: { ...formToAddress(form), id: `${id}-address` },
    createdAt: new Date().toISOString(),
    isDemo: DEMO_MODE,
    deliveryOption: totals.deliveryOption,
    deliveryCharge: totals.deliveryCharge,
    estimatedDelivery,
    couponCode: couponOk?.coupon.code,
    couponDiscount: couponOk ? couponOk.discount : 0,
    contact: {
      name: form.fullName.trim(),
      phone: form.phone,
      email: form.email.trim() || undefined,
    },
    paymentMethod,
  };
}

/** All saved orders, newest first. Broken data is ignored. */
export function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(
      (o): o is Order =>
        o &&
        typeof o.id === "string" &&
        Array.isArray(o.items) &&
        typeof o.total === "number" &&
        o.address &&
        typeof o.address === "object"
    );
  } catch {
    return [];
  }
}

export function getOrderById(id: string): Order | null {
  return loadOrders().find((o) => o.id === id) ?? null;
}

/** Saves a new order. Returns false if the browser could not store it (nothing was saved). */
export function saveOrder(order: Order): boolean {
  try {
    const next = [order, ...loadOrders().filter((o) => o.id !== order.id)].slice(0, MAX_ORDERS);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(next));
    // read it back, so we only say "saved" when it really is
    return getOrderById(order.id) !== null;
  } catch {
    return false;
  }
}
