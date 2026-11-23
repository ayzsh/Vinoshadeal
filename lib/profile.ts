// "My details" saved in THIS browser only (localStorage). Round 2: the profile lives in the user's account.

import { EMPTY_FORM, validateField } from "@/lib/checkout";
import { PROFILE_STORAGE_KEY } from "@/lib/constants";

export interface Profile {
  name: string;
  phone: string;
  email: string;
}

export type ProfileErrors = Partial<Record<keyof Profile, string>>;

export const EMPTY_PROFILE: Profile = { name: "", phone: "", email: "" };

/** Same rules as checkout: name and mobile are required, email is optional. */
export function validateProfile(p: Profile): ProfileErrors {
  const f = { ...EMPTY_FORM, fullName: p.name, phone: p.phone, email: p.email };
  const errors: ProfileErrors = {};
  const name = validateField(f, "fullName");
  const phone = validateField(f, "phone");
  const email = validateField(f, "email");
  if (name) errors.name = name;
  if (phone) errors.phone = phone;
  if (email) errors.email = email;
  return errors;
}

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    const str = (v: unknown) => (typeof v === "string" ? v : "");
    return {
      name: str(d?.name),
      phone: str(d?.phone).replace(/\D/g, "").slice(0, 10),
      email: str(d?.email),
    };
  } catch {
    return null;
  }
}

/** Returns false if the browser could not store it. */
export function saveProfile(p: Profile): boolean {
  try {
    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ name: p.name.trim(), phone: p.phone, email: p.email.trim() })
    );
    return loadProfile() !== null;
  } catch {
    return false;
  }
}

export function clearProfile(): void {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
