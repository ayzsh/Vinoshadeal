"use client";

// ONE place for cart, wishlist, compare list, recently viewed and toasts.
// Everything is saved in the browser (localStorage) for now.
// Round 2: replace the localStorage reading/writing below with database calls.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CartItem } from "@/lib/types";
import { products } from "@/lib/data";
import Toast, { type ToastTone } from "@/components/Toast";

/** e.g. { Colour: "Black", Storage: "256GB" } */
export type VariantSelection = Record<string, string>;

/** A cart row: the shared CartItem plus the chosen variant options. */
export interface CartLine extends CartItem {
  variant?: VariantSelection;
}

export const MAX_COMPARE = 3;
const MAX_RECENT = 10;
const STORAGE_KEY = "vinoshadeal-state-v1";

interface StoredState {
  cart: CartLine[];
  wishlist: string[];
  compare: string[];
  recent: string[];
  /** coupon applied in the cart (also used by checkout), or null */
  couponCode: string | null;
}

const EMPTY: StoredState = { cart: [], wishlist: [], compare: [], recent: [], couponCode: null };

/** Unique id of a cart row: same product + same variant = same row. */
export function lineKey(productId: string, variant?: VariantSelection): string {
  if (!variant) return productId;
  const parts = Object.keys(variant)
    .sort()
    .map((k) => `${k}=${variant[k]}`);
  return parts.length ? `${productId}|${parts.join("|")}` : productId;
}

function stockOf(productId: string): number {
  return products.find((p) => p.id === productId)?.stock ?? 0;
}

function idList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && products.some((p) => p.id === x));
}

/** Reads saved data and throws away anything broken or pointing to a removed product. */
function readStored(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const d = JSON.parse(raw);
    const cart: CartLine[] = Array.isArray(d?.cart)
      ? d.cart.filter(
          (l: CartLine) =>
            l &&
            typeof l.productId === "string" &&
            Number.isInteger(l.quantity) &&
            l.quantity > 0 &&
            products.some((p) => p.id === l.productId)
        )
      : [];
    return {
      cart,
      wishlist: idList(d?.wishlist),
      compare: idList(d?.compare).slice(0, MAX_COMPARE),
      recent: idList(d?.recent).slice(0, MAX_RECENT),
      couponCode:
        typeof d?.couponCode === "string" && d.couponCode.trim()
          ? d.couponCode.trim().toUpperCase().slice(0, 40)
          : null,
    };
  } catch {
    return EMPTY;
  }
}

interface CartContextValue {
  /** false until saved data has been loaded in the browser */
  ready: boolean;
  // cart
  items: CartLine[];
  /** total quantity of items in the cart (not counting "saved for later") */
  cartCount: number;
  addToCart: (productId: string, quantity?: number, variant?: VariantSelection) => boolean;
  updateQuantity: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  toggleSaveForLater: (key: string) => void;
  /** coupon code applied in the cart (shared with checkout), or null */
  couponCode: string | null;
  setCouponCode: (code: string | null) => void;
  /** removes the lines in the cart, keeps "saved for later" items, clears the coupon */
  clearCart: () => void;
  // wishlist
  wishlist: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  // compare
  compare: string[];
  isInCompare: (productId: string) => boolean;
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;
  // recently viewed (newest first)
  recentlyViewed: string[];
  addRecentlyViewed: (productId: string) => void;
  // toast
  showToast: (message: string, tone?: ToastTone) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredState>(EMPTY);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved data once, and keep other open tabs in sync.
  useEffect(() => {
    setState(readStored());
    setReady(true);
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setState(readStored());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Save whenever something changes (but only after the first load, so we never overwrite with empty data).
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked: ignore */
    }
  }, [state, ready]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const showToast = useCallback((message: string, tone: ToastTone = "default") => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, tone });
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ---------- cart ----------
  const addToCart = useCallback(
    (productId: string, quantity = 1, variant?: VariantSelection): boolean => {
      const stock = stockOf(productId);
      if (stock <= 0) {
        showToast("Sorry, this item is out of stock", "error");
        return false;
      }
      const key = lineKey(productId, variant);
      const existing = state.cart.find((l) => lineKey(l.productId, l.variant) === key);
      const already = existing && !existing.savedForLater ? existing.quantity : 0;
      if (already >= stock) {
        showToast(`Only ${stock} available. You already have all of them in your cart`, "error");
        return false;
      }
      const nextQty = Math.min(stock, already + Math.max(1, quantity));

      setState((prev) => {
        const has = prev.cart.some((l) => lineKey(l.productId, l.variant) === key);
        const cart = has
          ? prev.cart.map((l) =>
              lineKey(l.productId, l.variant) === key
                ? { ...l, quantity: nextQty, savedForLater: false }
                : l
            )
          : [...prev.cart, { productId, quantity: nextQty, savedForLater: false, variant }];
        return { ...prev, cart };
      });
      showToast(nextQty < already + quantity ? `Added (limited to ${stock} in stock)` : "Added to cart");
      return true;
    },
    [state.cart, showToast]
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setState((prev) => {
      if (quantity < 1) {
        return { ...prev, cart: prev.cart.filter((l) => lineKey(l.productId, l.variant) !== key) };
      }
      return {
        ...prev,
        cart: prev.cart.map((l) =>
          lineKey(l.productId, l.variant) === key
            ? { ...l, quantity: Math.min(quantity, Math.max(1, stockOf(l.productId))) }
            : l
        ),
      };
    });
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter((l) => lineKey(l.productId, l.variant) !== key),
    }));
  }, []);

  const toggleSaveForLater = useCallback(
    (key: string) => {
      const line = state.cart.find((l) => lineKey(l.productId, l.variant) === key);
      if (!line) return;
      setState((prev) => ({
        ...prev,
        cart: prev.cart.map((l) =>
          lineKey(l.productId, l.variant) === key ? { ...l, savedForLater: !l.savedForLater } : l
        ),
      }));
      showToast(line.savedForLater ? "Moved back to cart" : "Saved for later");
    },
    [state.cart, showToast]
  );

  const setCouponCode = useCallback((code: string | null) => {
    setState((prev) => ({
      ...prev,
      couponCode: code && code.trim() ? code.trim().toUpperCase() : null,
    }));
  }, []);

  const clearCart = useCallback(() => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter((l) => l.savedForLater),
      couponCode: null,
    }));
  }, []);

  // ---------- wishlist ----------
  const toggleWishlist = useCallback(
    (productId: string) => {
      const has = state.wishlist.includes(productId);
      setState((prev) => ({
        ...prev,
        wishlist: has ? prev.wishlist.filter((id) => id !== productId) : [...prev.wishlist, productId],
      }));
      showToast(has ? "Removed from wishlist" : "Added to wishlist");
    },
    [state.wishlist, showToast]
  );

  // ---------- compare ----------
  const toggleCompare = useCallback(
    (productId: string) => {
      if (state.compare.includes(productId)) {
        setState((prev) => ({ ...prev, compare: prev.compare.filter((id) => id !== productId) }));
        showToast("Removed from compare");
        return;
      }
      if (state.compare.length >= MAX_COMPARE) {
        showToast(`You can compare up to ${MAX_COMPARE} products. Remove one first.`, "error");
        return;
      }
      setState((prev) => ({ ...prev, compare: [...prev.compare, productId] }));
      showToast("Added to compare");
    },
    [state.compare, showToast]
  );

  const clearCompare = useCallback(() => {
    setState((prev) => ({ ...prev, compare: [] }));
  }, []);

  // ---------- recently viewed ----------
  const addRecentlyViewed = useCallback((productId: string) => {
    setState((prev) => {
      if (prev.recent[0] === productId) return prev; // nothing to change
      const recent = [productId, ...prev.recent.filter((id) => id !== productId)].slice(0, MAX_RECENT);
      return { ...prev, recent };
    });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      ready,
      items: state.cart,
      cartCount: state.cart.reduce((sum, l) => (l.savedForLater ? sum : sum + l.quantity), 0),
      addToCart,
      updateQuantity,
      removeFromCart,
      toggleSaveForLater,
      couponCode: state.couponCode,
      setCouponCode,
      clearCart,
      wishlist: state.wishlist,
      isWishlisted: (id: string) => state.wishlist.includes(id),
      toggleWishlist,
      compare: state.compare,
      isInCompare: (id: string) => state.compare.includes(id),
      toggleCompare,
      clearCompare,
      recentlyViewed: state.recent,
      addRecentlyViewed,
      showToast,
    }),
    [
      ready,
      state,
      addToCart,
      updateQuantity,
      removeFromCart,
      toggleSaveForLater,
      setCouponCode,
      clearCart,
      toggleWishlist,
      toggleCompare,
      clearCompare,
      addRecentlyViewed,
      showToast,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <Toast message={toast?.message ?? null} tone={toast?.tone} />
    </CartContext.Provider>
  );
}