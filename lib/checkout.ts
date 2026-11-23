// Everything checkout needs that is not on screen: form checks, totals, saved address, sample dates.
// Totals are built on computeTotals (lib/cart-totals.ts), so the cart and checkout always agree.

import { computeTotals, type CartTotals, type ResolvedLine } from "@/lib/cart-totals";
import { ADDRESS_STORAGE_KEY, EXPRESS_DELIVERY_FEE, INDIAN_STATES } from "@/lib/constants";
import type { Address, DeliveryOption } from "@/lib/types";

// ---------------------------------------------------------------------------
// The form
// ---------------------------------------------------------------------------

export interface CheckoutForm {
  fullName: string;
  phone: string;
  email: string;
  pincode: string;
  /** house / flat + street */
  line1: string;
  /** area / locality (optional) */
  line2: string;
  city: string;
  state: string;
  addressType: "home" | "work";
}

export const EMPTY_FORM: CheckoutForm = {
  fullName: "",
  phone: "",
  email: "",
  pincode: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  addressType: "home",
};

export type FormErrors = Partial<Record<keyof CheckoutForm, string>>;

/** Order of the fields on screen: the first one with an error gets the keyboard focus. */
export const FIELD_ORDER: (keyof CheckoutForm)[] = [
  "fullName",
  "phone",
  "email",
  "pincode",
  "line1",
  "line2",
  "city",
  "state",
];

export function validateField(form: CheckoutForm, name: keyof CheckoutForm): string | undefined {
  switch (name) {
    case "fullName":
      return form.fullName.trim().length < 2 ? "Enter your full name." : undefined;
    case "phone":
      return /^[6-9]\d{9}$/.test(form.phone)
        ? undefined
        : "Enter a 10-digit mobile number that starts with 6, 7, 8 or 9.";
    case "email": {
      const v = form.email.trim();
      if (!v) return undefined; // optional
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
        ? undefined
        : "Enter a valid email address, or leave this empty.";
    }
    case "pincode":
      return /^[1-9]\d{5}$/.test(form.pincode) ? undefined : "Enter a valid 6-digit pincode.";
    case "line1":
      return form.line1.trim().length < 3
        ? "Enter your house or flat number and street."
        : undefined;
    case "city":
      return form.city.trim().length < 2 ? "Enter your city." : undefined;
    case "state":
      return INDIAN_STATES.includes(form.state) ? undefined : "Choose your state or union territory.";
    default:
      return undefined; // line2 and addressType need no check
  }
}

export function validateForm(form: CheckoutForm): FormErrors {
  const errors: FormErrors = {};
  for (const name of FIELD_ORDER) {
    const message = validateField(form, name);
    if (message) errors[name] = message;
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Remember the last address on THIS device only (localStorage). Round 2: saved addresses in the database.
// ---------------------------------------------------------------------------

export function formToAddress(form: CheckoutForm): Address {
  return {
    id: "last-used",
    fullName: form.fullName.trim(),
    phone: form.phone,
    line1: form.line1.trim(),
    line2: form.line2.trim() || undefined,
    city: form.city.trim(),
    state: form.state,
    pincode: form.pincode,
    addressType: form.addressType,
  };
}

export function saveForm(form: CheckoutForm): void {
  try {
    localStorage.setItem(
      ADDRESS_STORAGE_KEY,
      JSON.stringify({ address: formToAddress(form), email: form.email.trim() })
    );
  } catch {
    /* storage full or blocked: ignore */
  }
}

/** The last saved address as form values, or null. Broken or odd data is cleaned or ignored. */
export function loadSavedForm(): CheckoutForm | null {
  try {
    const raw = localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    const a = d?.address;
    if (!a || typeof a !== "object") return null;
    const str = (v: unknown) => (typeof v === "string" ? v : "");
    return {
      fullName: str(a.fullName),
      phone: str(a.phone).replace(/\D/g, "").slice(0, 10),
      email: str(d.email),
      pincode: str(a.pincode).replace(/\D/g, "").slice(0, 6),
      line1: str(a.line1),
      line2: str(a.line2),
      city: str(a.city),
      state: INDIAN_STATES.includes(str(a.state)) ? str(a.state) : "",
      addressType: a.addressType === "work" ? "work" : "home",
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Totals
// ---------------------------------------------------------------------------

export interface CheckoutTotals extends CartTotals {
  deliveryOption: DeliveryOption;
  /** the standard delivery charge from the cart rule (free from ₹499, otherwise ₹40) */
  standardFee: number;
  /** extra charge for Express (0 for Standard) */
  expressExtra: number;
  /** the full delivery charge for the chosen option */
  deliveryCharge: number;
  /** what the shopper pays at checkout: use THIS, not `total` */
  grandTotal: number;
}

export function computeCheckoutTotals(
  lines: ResolvedLine[],
  couponCode: string | null | undefined,
  option: DeliveryOption
): CheckoutTotals {
  const cart = computeTotals(lines, couponCode);
  const standardFee = cart.deliveryFee;
  const expressExtra = option === "express" && cart.itemCount > 0 ? EXPRESS_DELIVERY_FEE : 0;
  const deliveryCharge = standardFee + expressExtra;
  return {
    ...cart,
    deliveryOption: option,
    standardFee,
    expressExtra,
    deliveryCharge,
    grandTotal: Math.max(0, cart.itemTotal - cart.couponDiscount + deliveryCharge),
  };
}

// ---------------------------------------------------------------------------
// Estimated delivery dates: SAMPLE. These windows are made up for the demo and are
// not connected to any real courier. Round 2: real delivery estimates.
// ---------------------------------------------------------------------------

const DELIVERY_DAYS: Record<DeliveryOption, [number, number]> = {
  standard: [4, 6],
  express: [1, 2],
};

/** e.g. "Fri, 27 Nov to Sun, 29 Nov" (SAMPLE) */
export function estimatedDelivery(option: DeliveryOption, from: Date = new Date()): string {
  const [min, max] = DELIVERY_DAYS[option];
  const fmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const day = (n: number) => {
    const d = new Date(from);
    d.setDate(d.getDate() + n);
    return fmt.format(d);
  };
  return `${day(min)} to ${day(max)}`;
}
