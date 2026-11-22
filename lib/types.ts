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
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
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
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses?: Address[];
  wishlist?: string[];
}
