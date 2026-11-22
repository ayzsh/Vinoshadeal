/**
 * Data shapes for Vinoshadeal.
 * Round 2 (Supabase) tables will mirror these types, so keep them stable.
 */

export type ProductTag = "deal" | "trending" | "new" | "flash";

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string; // key used by components/CategoryIcon.tsx
  subcategories: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  price: number; // selling price in INR
  mrp: number; // maximum retail price in INR
  rating: number; // 0-5
  reviewCount: number;
  stock: number;
  emoji: string; // placeholder picture until real images are added
  images: string[]; // real image URLs (empty for now)
  tags: ProductTag[];
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
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

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
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "upi" | "card" | "netbanking" | "wallet" | "cod";
  status: OrderStatus;
  address: Address;
  createdAt: string; // ISO date
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  addresses: Address[];
  wishlist: string[]; // product ids
}
