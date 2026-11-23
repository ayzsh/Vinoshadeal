// "Sell on Vinoshadeal" application, kept in THIS browser only (localStorage) while the site is in DEMO MODE.
// It is NOT sent to anyone. Round 2: save it to the database so an admin can review it.

import { EMPTY_FORM, validateField } from "@/lib/checkout";
import { DEMO_MODE, INDIAN_STATES, SELLER_STORAGE_KEY } from "@/lib/constants";
import { categories } from "@/lib/data";
import type { SellerApplication, SellerType } from "@/lib/types";

export const PRODUCT_COUNTS = ["1 to 10", "11 to 50", "51 to 200", "More than 200"];
export const ABOUT_MAX = 500;

export interface SellerForm {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  /** "" = not chosen yet */
  sellerType: SellerType | "";
  categorySlugs: string[];
  productCount: string;
  gstin: string;
  about: string;
  /** "the details are correct" tick box */
  agree: boolean;
}

export const EMPTY_SELLER_FORM: SellerForm = {
  businessName: "",
  contactName: "",
  phone: "",
  email: "",
  city: "",
  state: "",
  sellerType: "",
  categorySlugs: [],
  productCount: "",
  gstin: "",
  about: "",
  agree: false,
};

export type SellerErrors = Partial<Record<keyof SellerForm, string>>;

/** Order of the fields on screen: the first one with an error gets the keyboard focus. */
export const SELLER_FIELD_ORDER: (keyof SellerForm)[] = [
  "businessName",
  "contactName",
  "phone",
  "email",
  "city",
  "state",
  "sellerType",
  "categorySlugs",
  "productCount",
  "gstin",
  "agree",
];

const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export function validateSellerField(form: SellerForm, name: keyof SellerForm): string | undefined {
  // name, mobile, city and state use the same rules as checkout
  const shared = { ...EMPTY_FORM, fullName: form.contactName, phone: form.phone, city: form.city, state: form.state };
  switch (name) {
    case "businessName":
      return form.businessName.trim().length < 2 ? "Enter your shop or brand name." : undefined;
    case "contactName":
      return validateField(shared, "fullName")?.replace("your full name", "the contact person's name");
    case "phone":
      return validateField(shared, "phone");
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()) ? undefined : "Enter a valid email address.";
    case "city":
      return validateField(shared, "city");
    case "state":
      return INDIAN_STATES.includes(form.state) ? undefined : "Choose your state or union territory.";
    case "sellerType":
      return form.sellerType ? undefined : "Choose how you will sell.";
    case "categorySlugs":
      return form.categorySlugs.length > 0 ? undefined : "Choose at least one category.";
    case "productCount":
      return PRODUCT_COUNTS.includes(form.productCount) ? undefined : "Choose how many products you plan to list.";
    case "gstin": {
      const v = form.gstin.trim().toUpperCase();
      if (!v) return undefined; // optional
      return GSTIN.test(v) ? undefined : "Enter a valid 15-character GST number, or leave this empty.";
    }
    case "agree":
      return form.agree ? undefined : "Please confirm that the details are correct.";
    default:
      return undefined; // about needs no check
  }
}

export function validateSellerForm(form: SellerForm): SellerErrors {
  const errors: SellerErrors = {};
  for (const name of SELLER_FIELD_ORDER) {
    const message = validateSellerField(form, name);
    if (message) errors[name] = message;
  }
  return errors;
}

export function applicationToForm(a: SellerApplication): SellerForm {
  return {
    businessName: a.businessName,
    contactName: a.contactName,
    phone: a.phone,
    email: a.email,
    city: a.city,
    state: a.state,
    sellerType: a.sellerType,
    categorySlugs: a.categorySlugs,
    productCount: a.productCount,
    gstin: a.gstin ?? "",
    about: a.about ?? "",
    agree: true, // they confirmed when they saved it
  };
}

/** The saved application on this device, or null. Broken data is ignored. */
export function loadApplication(): SellerApplication | null {
  try {
    const raw = localStorage.getItem(SELLER_STORAGE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || typeof d !== "object") return null;
    const str = (v: unknown) => (typeof v === "string" ? v : "");
    const type = d.sellerType === "business" ? "business" : d.sellerType === "individual" ? "individual" : null;
    if (!type || !str(d.businessName) || !str(d.createdAt)) return null;
    const known = categories.map((c) => c.slug);
    return {
      businessName: str(d.businessName),
      contactName: str(d.contactName),
      phone: str(d.phone).replace(/\D/g, "").slice(0, 10),
      email: str(d.email),
      city: str(d.city),
      state: str(d.state),
      sellerType: type,
      categorySlugs: Array.isArray(d.categorySlugs)
        ? d.categorySlugs.filter((s: unknown): s is string => typeof s === "string" && known.includes(s))
        : [],
      productCount: str(d.productCount),
      gstin: str(d.gstin) || undefined,
      about: str(d.about) || undefined,
      createdAt: str(d.createdAt),
      updatedAt: str(d.updatedAt) || str(d.createdAt),
      isDemo: d.isDemo === true,
    };
  } catch {
    return null;
  }
}

/** Saves the application on this device. Returns it, or null if the browser could not store it. */
export function saveApplication(form: SellerForm): SellerApplication | null {
  if (!form.sellerType) return null;
  const now = new Date().toISOString();
  const before = loadApplication();
  const app: SellerApplication = {
    businessName: form.businessName.trim(),
    contactName: form.contactName.trim(),
    phone: form.phone,
    email: form.email.trim(),
    city: form.city.trim(),
    state: form.state,
    sellerType: form.sellerType,
    categorySlugs: form.categorySlugs,
    productCount: form.productCount,
    gstin: form.gstin.trim().toUpperCase() || undefined,
    about: form.about.trim().slice(0, ABOUT_MAX) || undefined,
    createdAt: before?.createdAt ?? now,
    updatedAt: now,
    isDemo: DEMO_MODE,
  };
  try {
    localStorage.setItem(SELLER_STORAGE_KEY, JSON.stringify(app));
    // read it back, so we only say "saved" when it really is
    return loadApplication()?.updatedAt === app.updatedAt ? app : null;
  } catch {
    return null;
  }
}

export function clearApplication(): boolean {
  try {
    localStorage.removeItem(SELLER_STORAGE_KEY);
    return loadApplication() === null;
  } catch {
    return false;
  }
}
