// Saved delivery addresses, kept in THIS browser only (localStorage), while the site is in DEMO MODE.
// Round 2: replace the functions below with database calls (the addresses live in the user's account).
// Checkout (Step F3c) uses getDefaultAddress() and loadAddresses().

import { ADDRESSES_STORAGE_KEY } from "@/lib/constants";
import { EMPTY_FORM, validateForm, type CheckoutForm, type FormErrors } from "@/lib/checkout";
import type { Address } from "@/lib/types";

export const MAX_ADDRESSES = 5;

/** The address form has the same fields as checkout, without email. */
export type AddressForm = Omit<CheckoutForm, "email">;

export const EMPTY_ADDRESS_FORM: AddressForm = {
  fullName: "",
  phone: "",
  pincode: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  addressType: "home",
};

export type AddressFormErrors = Omit<FormErrors, "email">;

/** Same rules as checkout (they come from validateForm in lib/checkout.ts). */
export function validateAddressForm(form: AddressForm): AddressFormErrors {
  const errors = validateForm({ ...EMPTY_FORM, ...form, email: "" });
  delete errors.email;
  return errors;
}

export function addressToForm(a: Address): AddressForm {
  return {
    fullName: a.fullName,
    phone: a.phone,
    pincode: a.pincode,
    line1: a.line1,
    line2: a.line2 ?? "",
    city: a.city,
    state: a.state,
    addressType: a.addressType === "work" ? "work" : "home",
  };
}

function createAddressId(): string {
  const bytes = new Uint8Array(5);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return "addr-" + Date.now().toString(36) + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Keeps at most MAX_ADDRESSES and exactly one default (the first one marked, or the first in the list). */
function normalize(list: Address[]): Address[] {
  const limited = list.slice(0, MAX_ADDRESSES);
  if (limited.length === 0) return [];
  const defaultIndex = Math.max(0, limited.findIndex((a) => a.isDefault));
  return limited.map((a, i) => ({ ...a, isDefault: i === defaultIndex }));
}

/** All saved addresses (the default one first). Broken data is ignored. */
export function loadAddresses(): Address[] {
  try {
    const raw = localStorage.getItem(ADDRESSES_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const str = (v: unknown) => (typeof v === "string" ? v : "");
    const clean: Address[] = [];
    for (const a of data) {
      if (!a || typeof a !== "object" || typeof a.id !== "string" || !a.id) continue;
      if (clean.some((c) => c.id === a.id)) continue;
      clean.push({
        id: a.id,
        fullName: str(a.fullName),
        phone: str(a.phone).replace(/\D/g, "").slice(0, 10),
        line1: str(a.line1),
        line2: str(a.line2) || undefined,
        city: str(a.city),
        state: str(a.state),
        pincode: str(a.pincode).replace(/\D/g, "").slice(0, 6),
        isDefault: a.isDefault === true,
        addressType: a.addressType === "work" ? "work" : "home",
      });
    }
    const list = normalize(clean);
    return [...list.filter((a) => a.isDefault), ...list.filter((a) => !a.isDefault)];
  } catch {
    return [];
  }
}

export function getDefaultAddress(): Address | null {
  return loadAddresses().find((a) => a.isDefault) ?? null;
}

/** Writes the list and reads it back, so we only say "saved" when it really is. */
function write(list: Address[]): Address[] | null {
  try {
    const next = normalize(list);
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(next));
    const back = loadAddresses();
    return back.length === next.length ? back : null;
  } catch {
    return null;
  }
}

export type SaveResult =
  | { ok: true; addresses: Address[]; saved: Address }
  | { ok: false; reason: "limit" | "missing" | "storage" };

/** Adds a new address (editingId = null) or changes an existing one. The first address becomes the default. */
export function saveAddress(form: AddressForm, editingId: string | null): SaveResult {
  const current = loadAddresses();
  const base: Omit<Address, "id"> = {
    fullName: form.fullName.trim(),
    phone: form.phone,
    line1: form.line1.trim(),
    line2: form.line2.trim() || undefined,
    city: form.city.trim(),
    state: form.state,
    pincode: form.pincode,
    addressType: form.addressType,
  };

  if (editingId) {
    const existing = current.find((a) => a.id === editingId);
    if (!existing) return { ok: false, reason: "missing" };
    const saved: Address = { ...base, id: existing.id, isDefault: existing.isDefault };
    const next = write(current.map((a) => (a.id === editingId ? saved : a)));
    return next ? { ok: true, addresses: next, saved } : { ok: false, reason: "storage" };
  }

  if (current.length >= MAX_ADDRESSES) return { ok: false, reason: "limit" };
  const saved: Address = { ...base, id: createAddressId(), isDefault: current.length === 0 };
  const next = write([...current, saved]);
  return next ? { ok: true, addresses: next, saved } : { ok: false, reason: "storage" };
}

/** Deletes one address. If it was the default, the first remaining address becomes the default. */
export function deleteAddress(id: string): Address[] | null {
  const current = loadAddresses();
  if (!current.some((a) => a.id === id)) return null;
  const rest = current.filter((a) => a.id !== id);
  const next = write(rest.some((a) => a.isDefault) ? rest : rest.map((a, i) => ({ ...a, isDefault: i === 0 })));
  if (next && next.some((a) => a.id === id)) return null;
  return next;
}

export function setDefaultAddress(id: string): Address[] | null {
  const current = loadAddresses();
  if (!current.some((a) => a.id === id)) return null;
  const next = write(current.map((a) => ({ ...a, isDefault: a.id === id })));
  return next && next.find((a) => a.id === id)?.isDefault ? next : null;
}
