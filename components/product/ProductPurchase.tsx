"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart, Minus, Plus, Scale, ShoppingCart, Star, Truck, Zap } from "lucide-react";
import type { Product } from "@/lib/types";
import { discountPercent, formatINR } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { defaultSelection, priceFor } from "@/lib/pricing";

// SAMPLE ONLY: this is NOT a real delivery promise. It makes up a date 2 to 5 days
// from today, based on the digits of the pincode. Round 2 will use a real courier/pincode service.
function sampleDelivery(pincode: string): { pincode: string; date: string } {
  const digitSum = pincode.split("").reduce((sum, d) => sum + Number(d), 0);
  const d = new Date();
  d.setDate(d.getDate() + 2 + (digitSum % 4));
  return {
    pincode,
    date: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
  };
}

export default function ProductPurchase({ product }: { product: Product }) {
  const router = useRouter();
  const { ready, addToCart, isWishlisted, toggleWishlist, isInCompare, toggleCompare, addRecentlyViewed } =
    useCart();

  const [selection, setSelection] = useState<Record<string, string>>(() => defaultSelection(product));
  const [qty, setQty] = useState(1);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [delivery, setDelivery] = useState<{ pincode: string; date: string } | null>(null);
  const [showBar, setShowBar] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 6;
  const maxQty = Math.max(1, product.stock);
  const { price, mrp } = priceFor(product, selection);
  const off = discountPercent(price, mrp);
  const wished = isWishlisted(product.id);
  const comparing = isInCompare(product.id);
  const variantArg = Object.keys(selection).length > 0 ? selection : undefined;

  // Remember this product as "recently viewed" (waits until saved data has loaded).
  useEffect(() => {
    if (ready) addRecentlyViewed(product.id);
  }, [ready, product.id, addRecentlyViewed]);

  // Reuse the pincode saved by the header (same "pincode" key).
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pincode") ?? "";
      if (/^\d{6}$/.test(saved)) {
        setPinInput(saved);
        setDelivery(sampleDelivery(saved));
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Show the sticky mobile bar only while the main buttons are off screen.
  useEffect(() => {
    const el = actionsRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function checkPincode(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pinInput)) {
      setPinError("Enter a valid 6-digit pincode");
      setDelivery(null);
      return;
    }
    setPinError("");
    setDelivery(sampleDelivery(pinInput));
    try {
      localStorage.setItem("pincode", pinInput);
    } catch {
      /* ignore */
    }
  }

  function handleAdd() {
    addToCart(product.id, qty, variantArg);
  }

  function handleBuyNow() {
    // /checkout doesn't exist yet, so Buy Now goes to the cart for now.
    if (addToCart(product.id, qty, variantArg)) router.push("/cart");
  }

  const stepBtn =
    "flex h-10 w-10 items-center justify-center text-ink transition hover:bg-tint disabled:cursor-not-allowed disabled:opacity-40";
  const chipBtn =
    "inline-flex items-center gap-2 rounded-field border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-tint";

  return (
    <>
      <div>
        <p className="text-sm font-medium text-muted">{product.brand}</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-heading sm:text-3xl">{product.name}</h1>

        <div className="mt-3 flex items-center gap-2 text-sm">
          <a
            href="#reviews"
            className="inline-flex items-center gap-0.5 rounded bg-success px-1.5 py-0.5 font-bold text-white"
          >
            {product.rating.toFixed(1)}
            <Star className="h-3 w-3 fill-white" aria-hidden="true" />
          </a>
          <span className="text-muted">{product.reviewCount.toLocaleString("en-IN")} ratings</span>
        </div>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-bold text-ink">{formatINR(price)}</span>
          {mrp > price && <span className="text-base text-muted line-through">{formatINR(mrp)}</span>}
          {off > 0 && (
            <span className="text-sm font-bold text-green-700 dark:text-green-400">{off}% off</span>
          )}
        </div>

        {outOfStock ? (
          <p className="mt-3 text-sm font-bold text-redtext">Out of stock</p>
        ) : lowStock ? (
          <p className="mt-3 text-sm font-bold text-redtext">Only {product.stock} left</p>
        ) : (
          <p className="mt-3 text-sm font-bold text-green-700 dark:text-green-400">In stock</p>
        )}

        {/* variants */}
        {product.variants?.map((group) => (
          <fieldset key={group.name} className="mt-5">
            <legend className="text-sm font-semibold text-ink">
              {group.name}: <span className="font-normal text-muted">{selection[group.name]}</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.options.map((o) => {
                const active = selection[group.name] === o.label;
                return (
                  <button
                    key={o.label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelection((s) => ({ ...s, [group.name]: o.label }))}
                    className={`rounded-field border-2 px-4 py-2 text-sm font-semibold text-ink transition ${
                      active ? "border-brand-red bg-tint" : "border-line hover:border-muted"
                    }`}
                  >
                    {o.label}
                    {o.priceDelta ? (
                      <span className="ml-1 text-xs font-normal text-muted">
                        ({o.priceDelta > 0 ? "+" : "−"}
                        {formatINR(Math.abs(o.priceDelta))})
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

        {/* quantity */}
        <div className="mt-5 flex items-center gap-3">
          <span id="qty-label" className="text-sm font-semibold text-ink">
            Quantity
          </span>
          <div role="group" aria-labelledby="qty-label" className="inline-flex items-center rounded-field border border-line">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={outOfStock || qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className={stepBtn}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span aria-live="polite" className="w-10 text-center text-sm font-bold text-ink">
              {qty}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={outOfStock || qty >= maxQty}
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              className={stepBtn}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* main buttons */}
        <div ref={actionsRef} className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className="btn-outline flex flex-1 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            Add to Cart
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={outOfStock}
            className="btn-primary flex flex-1 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Zap className="h-5 w-5" aria-hidden="true" />
            Buy Now
          </button>
        </div>

        {/* wishlist + compare */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => toggleWishlist(product.id)} aria-pressed={wished} className={chipBtn}>
            <Heart className={`h-4 w-4 ${wished ? "fill-brand-red text-brand-red" : ""}`} aria-hidden="true" />
            {wished ? "In wishlist" : "Add to wishlist"}
          </button>
          <button type="button" onClick={() => toggleCompare(product.id)} aria-pressed={comparing} className={chipBtn}>
            <Scale className="h-4 w-4" aria-hidden="true" />
            {comparing ? "Added to compare" : "Add to compare"}
          </button>
        </div>

        {/* delivery check */}
        <form onSubmit={checkPincode} className="mt-6 rounded-card border border-line p-4">
          <label htmlFor="pdp-pin" className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Truck className="h-5 w-5" aria-hidden="true" />
            Check delivery
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="pdp-pin"
              inputMode="numeric"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit pincode"
              className="min-w-0 flex-1 rounded-field border border-line bg-page px-3 py-2 text-sm text-ink"
            />
            <button type="submit" className="btn-outline !py-2 text-sm">
              Check
            </button>
          </div>
          {pinError && (
            <p role="alert" className="mt-2 text-xs text-redtext">
              {pinError}
            </p>
          )}
          {delivery && !pinError && (
            <p className="mt-2 text-sm text-ink">
              Delivery to <span className="font-bold">{delivery.pincode}</span> by{" "}
              <span className="font-bold">{delivery.date}</span>{" "}
              <span className="text-muted">(sample estimate)</span>
            </p>
          )}
          <p className="mt-2 text-xs text-muted">Free delivery on orders above ₹499</p>
        </form>
      </div>

      {/* sticky bar for phones: sits ABOVE the bottom nav, and leaves room on the right for the WhatsApp button */}
      {showBar && (
        <div className="fixed inset-x-0 bottom-16 z-30 flex items-center gap-3 border-t border-line bg-surface py-3 pl-4 pr-20 shadow-lift md:hidden">
          <div className="min-w-0">
            <p className="text-lg font-bold leading-tight text-ink">{formatINR(price)}</p>
            {mrp > price && <p className="text-xs text-muted line-through">{formatINR(mrp)}</p>}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className="btn-primary ml-auto flex-1 !py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {outOfStock ? "Out of stock" : "Add to Cart"}
          </button>
        </div>
      )}
    </>
  );
}