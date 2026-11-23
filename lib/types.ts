// Data shapes for Vinoshadeal.
// Round 2 database tables will copy these. Only ADD optional fields; don't rename existing ones.

export type ProductTag = "deal" | "trending" | "new" | "flash";

/** One row of the specs table, e.g. { key: "Battery", value: "5000mAh" } */
export interface ProductSpec {
  key: string;
  value: string;
}

/** One choice inside a variant group, e.g. "256GB" (+ ₹2,500) */
export interface VariantOption {
  label: string;
  /** Added to the product price when this option is picked */
  priceDelta?: number;
  /** Added to the MRP when this option is picked */
  mrpDelta?: number;
}

/** A group of choices, e.g. "Colour" or "Storage" */
export interface VariantGroup {
  name: string;
  options: VariantOption[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  price: number;
  mrp: number;
  rating: number;
  reviewCount: number;
  stock: number;
  emoji: string;
  images: string[];
  tags: ProductTag[];
  // ---- added in Stage 2 (all optional) ----
  subcategory?: string;
  description?: string;
  specs?: ProductSpec[];
  variants?: VariantGroup[];
  /** ISO date, e.g. "2026-11-10". Used for "Newest" sorting. */
  createdAt?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  subcategories: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  savedForLater: boolean;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  /** house / flat number and street */
  line1: string;
  /** area / locality (optional) */
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
  // ---- added in Step E (optional) ----
  addressType?: "home" | "work";
}

// ---- added in Step E (all optional / new) ----
export type DeliveryOption = "standard" | "express";
export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet" | "cod";

/** Who to contact about an order (guest checkout). */
export interface OrderContact {
  name: string;
  phone: string;
  email?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  // ---- added in Step E (optional) ----
  slug?: string;
  emoji?: string;
  mrp?: number;
  /** chosen options, e.g. { Storage: "256GB" } */
  variant?: Record<string, string>;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "placed" | "packed" | "shipped" | "delivered" | "cancelled";
  address: Address;
  createdAt: string;
  paymentId?: string;
  // ---- added in Step E (optional) ----
  /** true while the site runs in demo mode (lib/constants.ts) */
  isDemo?: boolean;
  deliveryOption?: DeliveryOption;
  deliveryCharge?: number;
  /** sample estimate text, e.g. "Fri, 27 Nov to Sun, 29 Nov" */
  estimatedDelivery?: string;
  couponCode?: string;
  couponDiscount?: number;
  contact?: OrderContact;
  paymentMethod?: PaymentMethod;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses?: Address[];
  wishlist?: string[];
}
