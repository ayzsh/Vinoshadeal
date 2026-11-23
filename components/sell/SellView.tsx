"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import Field from "@/components/account/Field";
import Breadcrumbs from "@/components/listing/Breadcrumbs";
import { useCart } from "@/lib/cart-context";
import { DEMO_MODE, INDIAN_STATES } from "@/lib/constants";
import { categories, getCategoryName } from "@/lib/data";
import { loadProfile } from "@/lib/profile";
import {
  ABOUT_MAX,
  EMPTY_SELLER_FORM,
  PRODUCT_COUNTS,
  SELLER_FIELD_ORDER,
  applicationToForm,
  clearApplication,
  loadApplication,
  saveApplication,
  validateSellerField,
  validateSellerForm,
  type SellerErrors,
  type SellerForm,
} from "@/lib/seller";
import type { SellerApplication } from "@/lib/types";

/** The planned steps (not live yet). The order matters here, so they are numbered. */
const STEPS = [
  { title: "Send your application", text: "Tell us who you are and what you would like to sell." },
  { title: "We look at it", text: "Our team checks your details and may contact you." },
  { title: "Add your products", text: "Once approved, you list your products with prices and stock." },
  { title: "Receive orders", text: "Orders for your products reach you to pack and ship." },
];

/** DOM id used to move the keyboard focus to the first field with an error. */
const FOCUS_ID: Record<string, string> = {
  businessName: "sell-businessName",
  contactName: "sell-contactName",
  phone: "sell-phone",
  email: "sell-email",
  city: "sell-city",
  state: "sell-state",
  sellerType: "sell-sellerType-first",
  categorySlugs: "sell-category-first",
  productCount: "sell-productCount",
  gstin: "sell-gstin",
  agree: "sell-agree",
};

export default function SellView() {
  const { showToast } = useCart();
  // undefined = still reading the browser's saved data, null = nothing saved
  const [saved, setSaved] = useState<SellerApplication | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [form, setForm] = useState<SellerForm>(EMPTY_SELLER_FORM);
  const [errors, setErrors] = useState<SellerErrors>({});
  const [errorNote, setErrorNote] = useState("");
  const savedTitleRef = useRef<HTMLHeadingElement>(null);
  const formTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const app = loadApplication();
    setSaved(app);
    if (!app) setForm(blankForm());
  }, []);

  // after the form or the saved card opens, move the focus to its title
  const showingForm = saved === null || editing;
  useEffect(() => {
    if (saved === undefined) return;
    (showingForm ? formTitleRef : savedTitleRef).current?.focus();
    // only when we switch between the form and the saved card, not on every keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showingForm]);

  /** A new, empty form. Name, mobile and email are filled from "My profile" if it has them. */
  function blankForm(): SellerForm {
    const p = loadProfile();
    return { ...EMPTY_SELLER_FORM, contactName: p?.name ?? "", phone: p?.phone ?? "", email: p?.email ?? "" };
  }

  function change<K extends keyof SellerForm>(name: K, value: SellerForm[K]) {
    const next = { ...form, [name]: value };
    setForm(next);
    // once a field shows an error, re-check it while typing so the message goes away when fixed
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: validateSellerField(next, name) }));
  }

  function blur(name: keyof SellerForm) {
    const v = form[name];
    if (v === "" || (Array.isArray(v) && v.length === 0)) return; // empty fields are checked on submit
    setErrors((prev) => ({ ...prev, [name]: validateSellerField(form, name) }));
  }

  function toggleCategory(slug: string) {
    const has = form.categorySlugs.includes(slug);
    change("categorySlugs", has ? form.categorySlugs.filter((s) => s !== slug) : [...form.categorySlugs, slug]);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateSellerForm(form);
    setErrors(found);
    const problems = Object.keys(found).length;
    if (problems > 0) {
      setErrorNote(`Please fix ${problems} ${problems === 1 ? "thing" : "things"} to continue.`);
      const first = SELLER_FIELD_ORDER.find((k) => found[k]);
      if (first) document.getElementById(FOCUS_ID[first])?.focus();
      return;
    }
    setErrorNote("");
    const app = saveApplication(form);
    if (!app) {
      // Never pretend: nothing was saved.
      showToast("We couldn't save your application on this device. Please try again.", "error");
      return;
    }
    setSaved(app);
    setEditing(false);
    showToast("Application saved on this device");
  }

  function onRemove() {
    setRemoving(false);
    if (clearApplication()) {
      setSaved(null);
      setEditing(false);
      setErrors({});
      setErrorNote("");
      setForm(blankForm());
      showToast("Application removed from this device");
    } else {
      showToast("We couldn't remove it. Please try again.", "error");
    }
  }

  return (
    <div className="container-page py-6 pb-24 md:pb-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Sell on Vinoshadeal" }]} />
      <h1 className="mt-3 font-heading text-2xl font-bold text-heading">Sell on Vinoshadeal</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Do you make or sell products? Tell us about yourself and what you would like to sell on Vinoshadeal, a
        Vinosha Group company.
      </p>

      {DEMO_MODE && (
        <div
          role="note"
          className="mt-4 flex items-start gap-2 rounded-field border border-line bg-tint px-4 py-3 text-sm font-semibold text-ink"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            Demo mode: seller sign-up is not switched on yet. Your application is saved on this device only and
            is not sent to anyone.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="min-w-0">
          {saved === undefined ? (
            <div className="space-y-4" aria-busy="true">
              <p className="sr-only" role="status">
                Loading
              </p>
              <div className="skeleton h-72 rounded-card" />
            </div>
          ) : !showingForm && saved ? (
            <SavedCard
              app={saved}
              titleRef={savedTitleRef}
              removing={removing}
              onEdit={() => {
                setForm(applicationToForm(saved));
                setErrors({});
                setErrorNote("");
                setEditing(true);
              }}
              onAskRemove={() => setRemoving(true)}
              onCancelRemove={() => setRemoving(false)}
              onRemove={onRemove}
            />
          ) : (
            <section className="card p-4 sm:p-5" aria-labelledby="sell-form-title">
              <h2
                id="sell-form-title"
                ref={formTitleRef}
                tabIndex={-1}
                className="font-heading text-lg font-bold text-heading outline-none"
              >
                {saved ? "Edit your application" : "Seller application"}
              </h2>

              <form onSubmit={onSubmit} noValidate className="mt-4">
                <p role="status" className="sr-only">
                  {errorNote}
                </p>
                {errorNote && (
                  <p className="mb-4 rounded-field border border-line bg-tint px-4 py-3 text-sm font-semibold text-redtext">
                    {errorNote}
                  </p>
                )}

                <h3 className="font-heading text-base font-bold text-heading">Your details</h3>
                <div className="mt-3 grid gap-x-4 sm:grid-cols-2">
                  <Field
                    id="sell-businessName"
                    label="Shop or brand name"
                    value={form.businessName}
                    error={errors.businessName}
                    onChange={(v) => change("businessName", v)}
                    onBlur={() => blur("businessName")}
                  />
                  <Field
                    id="sell-contactName"
                    label="Contact person"
                    value={form.contactName}
                    error={errors.contactName}
                    autoComplete="name"
                    onChange={(v) => change("contactName", v)}
                    onBlur={() => blur("contactName")}
                  />
                  <Field
                    id="sell-phone"
                    label="Mobile number"
                    hint="10 digits, no +91"
                    value={form.phone}
                    error={errors.phone}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel-national"
                    onChange={(v) => change("phone", v.replace(/\D/g, "").slice(0, 10))}
                    onBlur={() => blur("phone")}
                  />
                  <Field
                    id="sell-email"
                    label="Email"
                    value={form.email}
                    error={errors.email}
                    type="email"
                    autoComplete="email"
                    onChange={(v) => change("email", v)}
                    onBlur={() => blur("email")}
                  />
                  <Field
                    id="sell-city"
                    label="City"
                    value={form.city}
                    error={errors.city}
                    autoComplete="address-level2"
                    onChange={(v) => change("city", v)}
                    onBlur={() => blur("city")}
                  />
                  <div>
                    <label htmlFor="sell-state" className="text-sm font-semibold text-ink">
                      State or union territory
                    </label>
                    <select
                      id="sell-state"
                      value={form.state}
                      autoComplete="address-level1"
                      aria-invalid={errors.state ? true : undefined}
                      aria-describedby={errors.state ? "sell-state-error" : undefined}
                      onChange={(e) => change("state", e.target.value)}
                      onBlur={() => blur("state")}
                      className={`mt-1 w-full rounded-field border bg-page px-3 py-2.5 text-sm text-ink ${
                        errors.state ? "border-brand-red-dark" : "border-line"
                      }`}
                    >
                      <option value="">Choose…</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <p id="sell-state-error" className="min-h-5 pt-1 text-xs font-semibold text-redtext">
                      {errors.state}
                    </p>
                  </div>
                </div>

                <h3 className="mt-4 font-heading text-base font-bold text-heading">What you sell</h3>

                <fieldset className="mt-3" aria-describedby={errors.sellerType ? "sell-sellerType-error" : undefined}>
                  <legend className="text-sm font-semibold text-ink">I will sell as</legend>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                    {(
                      [
                        ["individual", "An individual"],
                        ["business", "A registered business"],
                      ] as const
                    ).map(([value, label], n) => (
                      <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                        <input
                          id={n === 0 ? "sell-sellerType-first" : undefined}
                          type="radio"
                          name="sell-sellerType"
                          value={value}
                          checked={form.sellerType === value}
                          onChange={() => change("sellerType", value)}
                          className="h-4 w-4 accent-brand-red-dark"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <p id="sell-sellerType-error" className="min-h-5 pt-1 text-xs font-semibold text-redtext">
                    {errors.sellerType}
                  </p>
                </fieldset>

                <fieldset aria-describedby={errors.categorySlugs ? "sell-categories-error" : undefined}>
                  <legend className="text-sm font-semibold text-ink">Categories you would like to sell in</legend>
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {categories.map((c, n) => (
                      <li key={c.slug}>
                        <label
                          className={`flex cursor-pointer items-center gap-3 rounded-field border px-3 py-2 text-sm text-ink ${
                            form.categorySlugs.includes(c.slug) ? "border-brand-red-dark bg-tint" : "border-line"
                          }`}
                        >
                          <input
                            id={n === 0 ? "sell-category-first" : undefined}
                            type="checkbox"
                            checked={form.categorySlugs.includes(c.slug)}
                            onChange={() => toggleCategory(c.slug)}
                            className="h-4 w-4 shrink-0 accent-brand-red-dark"
                          />
                          <span className="min-w-0 break-words">{c.name}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <p id="sell-categories-error" className="min-h-5 pt-1 text-xs font-semibold text-redtext">
                    {errors.categorySlugs}
                  </p>
                </fieldset>

                <div className="grid gap-x-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sell-productCount" className="text-sm font-semibold text-ink">
                      How many products do you plan to list?
                    </label>
                    <select
                      id="sell-productCount"
                      value={form.productCount}
                      aria-invalid={errors.productCount ? true : undefined}
                      aria-describedby={errors.productCount ? "sell-productCount-error" : undefined}
                      onChange={(e) => change("productCount", e.target.value)}
                      onBlur={() => blur("productCount")}
                      className={`mt-1 w-full rounded-field border bg-page px-3 py-2.5 text-sm text-ink ${
                        errors.productCount ? "border-brand-red-dark" : "border-line"
                      }`}
                    >
                      <option value="">Choose…</option>
                      {PRODUCT_COUNTS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <p id="sell-productCount-error" className="min-h-5 pt-1 text-xs font-semibold text-redtext">
                      {errors.productCount}
                    </p>
                  </div>
                  <Field
                    id="sell-gstin"
                    label="GST number"
                    optional
                    hint="15 characters. You can add it later."
                    value={form.gstin}
                    error={errors.gstin}
                    maxLength={15}
                    onChange={(v) => change("gstin", v.toUpperCase().replace(/\s/g, ""))}
                    onBlur={() => blur("gstin")}
                  />
                </div>

                <div>
                  <label htmlFor="sell-about" className="text-sm font-semibold text-ink">
                    Tell us about your products <span className="font-normal text-muted">(optional)</span>
                  </label>
                  <textarea
                    id="sell-about"
                    value={form.about}
                    maxLength={ABOUT_MAX}
                    rows={4}
                    onChange={(e) => change("about", e.target.value)}
                    aria-describedby="sell-about-hint"
                    className="mt-1 w-full rounded-field border border-line bg-page px-3 py-2.5 text-sm text-ink placeholder:text-muted"
                  />
                  <p id="sell-about-hint" className="pt-1 text-xs text-muted">
                    Up to {ABOUT_MAX} characters.
                  </p>
                </div>

                <div className="mt-3">
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
                    <input
                      id="sell-agree"
                      type="checkbox"
                      checked={form.agree}
                      aria-invalid={errors.agree ? true : undefined}
                      aria-describedby={errors.agree ? "sell-agree-error" : undefined}
                      onChange={(e) => change("agree", e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-brand-red-dark"
                    />
                    <span>I confirm that the details above are correct.</span>
                  </label>
                  <p id="sell-agree-error" className="min-h-5 pt-1 text-xs font-semibold text-redtext">
                    {errors.agree}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-3">
                  <button type="submit" className="btn-primary">
                    {DEMO_MODE ? "Save application on this device" : "Send application"}
                  </button>
                  {saved && (
                    <button type="button" onClick={() => setEditing(false)} className="btn-outline">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>
          )}
        </div>

        <aside aria-labelledby="sell-steps" className="card p-4 sm:p-5">
          <h2 id="sell-steps" className="font-heading text-lg font-bold text-heading">
            How selling will work
          </h2>
          <p className="mt-1 text-xs text-muted">
            This is the plan. It starts when seller accounts are switched on.
          </p>
          <ol className="mt-4 space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-purple text-sm font-bold text-white"
                >
                  {i + 1}
                </span>
                <span className="min-w-0 text-sm">
                  <span className="block font-semibold text-ink">{s.title}</span>
                  <span className="block text-muted">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}

function SavedCard({
  app,
  titleRef,
  removing,
  onEdit,
  onAskRemove,
  onCancelRemove,
  onRemove,
}: {
  app: SellerApplication;
  titleRef: React.RefObject<HTMLHeadingElement | null>;
  removing: boolean;
  onEdit: () => void;
  onAskRemove: () => void;
  onCancelRemove: () => void;
  onRemove: () => void;
}) {
  const saved = new Date(app.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  const rows: [string, string][] = [
    ["Shop or brand name", app.businessName],
    ["Contact person", app.contactName],
    ["Mobile", app.phone],
    ["Email", app.email],
    ["Location", `${app.city}, ${app.state}`],
    ["Selling as", app.sellerType === "business" ? "A registered business" : "An individual"],
    ["Categories", app.categorySlugs.map(getCategoryName).join(", ")],
    ["Products planned", app.productCount],
  ];
  if (app.gstin) rows.push(["GST number", app.gstin]);
  if (app.about) rows.push(["About your products", app.about]);

  return (
    <section className="card p-4 sm:p-5" aria-labelledby="sell-saved-title">
      <span className="inline-block rounded-full border-2 border-brand-purple px-3 py-0.5 text-xs font-bold text-heading">
        Saved on this device. Not sent.
      </span>
      <h2
        id="sell-saved-title"
        ref={titleRef}
        tabIndex={-1}
        className="mt-2 font-heading text-lg font-bold text-heading outline-none"
      >
        Your application is saved
      </h2>
      <p className="mt-1 text-sm text-muted">
        Last saved {saved}.{" "}
        {app.isDemo
          ? "Because the site is in demo mode, nobody has received it and nobody will contact you about it."
          : ""}
      </p>

      <dl className="mt-4 divide-y divide-line text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 py-2 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-3">
            <dt className="text-muted">{label}</dt>
            <dd className="break-words font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      {removing ? (
        <div role="alertdialog" aria-labelledby="sell-remove-q" className="mt-4 rounded-field bg-tint p-4">
          <p id="sell-remove-q" className="text-sm font-semibold text-ink">
            Remove this application from this device? This can&apos;t be undone.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={onRemove} className="btn-primary !py-2 text-sm">
              Yes, remove it
            </button>
            <button type="button" onClick={onCancelRemove} className="btn-outline !py-2 text-sm">
              Keep it
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={onEdit} className="btn-outline">
            Edit application
          </button>
          <button type="button" onClick={onAskRemove} className="btn-outline">
            Remove
          </button>
        </div>
      )}
    </section>
  );
}
