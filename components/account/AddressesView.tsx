"use client";

import { useEffect, useRef, useState } from "react";
import Field from "@/components/account/Field";
import { useCart } from "@/lib/cart-context";
import { INDIAN_STATES } from "@/lib/constants";
import {
  EMPTY_ADDRESS_FORM,
  MAX_ADDRESSES,
  addressToForm,
  deleteAddress,
  loadAddresses,
  saveAddress,
  setDefaultAddress,
  validateAddressForm,
  type AddressForm,
  type AddressFormErrors,
} from "@/lib/addresses";
import { loadProfile } from "@/lib/profile";
import type { Address } from "@/lib/types";

const FIELD_ORDER: (keyof AddressForm)[] = ["fullName", "phone", "pincode", "line1", "line2", "city", "state"];

/** /account/addresses: add, edit, delete and choose a default address (max 5, saved on this device). */
export default function AddressesView() {
  const { showToast } = useCart();
  // null = still reading the browser's saved addresses
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  // null = showing the list; otherwise the form is open ("new" or the id being edited)
  const [editing, setEditing] = useState<"new" | string | null>(null);
  const [form, setForm] = useState<AddressForm>(EMPTY_ADDRESS_FORM);
  const [errors, setErrors] = useState<AddressFormErrors>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const formTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setAddresses(loadAddresses());
  }, []);

  // when the form opens, move focus to its title so screen readers and keyboards land there
  useEffect(() => {
    if (editing !== null) formTitleRef.current?.focus();
  }, [editing]);

  if (addresses === null) {
    return (
      <div className="space-y-4" aria-busy="true">
        <p className="sr-only" role="status">
          Loading your addresses
        </p>
        <div className="skeleton h-36 rounded-card" />
        <div className="skeleton h-36 rounded-card" />
      </div>
    );
  }

  const atLimit = addresses.length >= MAX_ADDRESSES;

  function openNew() {
    const profile = loadProfile(); // saves typing: name and mobile from "My profile", if there
    setForm({ ...EMPTY_ADDRESS_FORM, fullName: profile?.name ?? "", phone: profile?.phone ?? "" });
    setErrors({});
    setDeletingId(null);
    setEditing("new");
  }

  function openEdit(a: Address) {
    setForm(addressToForm(a));
    setErrors({});
    setDeletingId(null);
    setEditing(a.id);
  }

  function closeForm() {
    setEditing(null);
    setErrors({});
    // the button that opened the form is gone from the page, so put focus on the list heading
    setTimeout(() => statusRef.current?.focus(), 0);
  }

  function change<K extends keyof AddressForm>(name: K, value: AddressForm[K]) {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  /** Check one field when the person leaves it (only if they typed something). */
  function blur(name: keyof AddressForm) {
    if (name === "addressType" || !form[name]) return;
    const message = validateAddressForm(form)[name];
    setErrors((e) => ({ ...e, [name]: message }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateAddressForm(form);
    setErrors(found);
    const firstBad = FIELD_ORDER.find((n) => found[n]);
    if (firstBad) {
      document.getElementById(`addr-${firstBad}`)?.focus();
      return;
    }
    const isNew = editing === "new";
    const result = saveAddress(form, isNew ? null : editing);
    if (result.ok) {
      setAddresses(result.addresses);
      showToast(isNew ? "Address saved" : "Address updated");
      closeForm();
      return;
    }
    if (result.reason === "limit") {
      showToast(`You can save up to ${MAX_ADDRESSES} addresses. Delete one first.`, "error");
    } else if (result.reason === "missing") {
      showToast("This address no longer exists.", "error");
      setAddresses(loadAddresses());
      closeForm();
    } else {
      showToast("We couldn't save this address on your device. Please try again.", "error");
    }
  }

  function onDelete(id: string) {
    const next = deleteAddress(id);
    setDeletingId(null);
    if (next) {
      setAddresses(next);
      showToast("Address deleted");
      setTimeout(() => statusRef.current?.focus(), 0);
    } else {
      showToast("We couldn't delete this address. Please try again.", "error");
    }
  }

  function onMakeDefault(id: string) {
    const next = setDefaultAddress(id);
    if (next) {
      setAddresses(next);
      showToast("Default address changed");
    } else {
      showToast("We couldn't change the default address. Please try again.", "error");
    }
  }

  // ---------------------------------------------------------------- form
  if (editing !== null) {
    return (
      <section className="card p-4 sm:p-5" aria-labelledby="addr-form-title">
        <h2
          id="addr-form-title"
          ref={formTitleRef}
          tabIndex={-1}
          className="font-heading text-lg font-bold text-heading outline-none"
        >
          {editing === "new" ? "Add a new address" : "Edit address"}
        </h2>
        <form onSubmit={onSubmit} noValidate className="mt-4">
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field
              id="addr-fullName"
              label="Full name"
              value={form.fullName}
              error={errors.fullName}
              autoComplete="name"
              onChange={(v) => change("fullName", v)}
              onBlur={() => blur("fullName")}
            />
            <Field
              id="addr-phone"
              label="Mobile number"
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
              id="addr-pincode"
              label="Pincode"
              value={form.pincode}
              error={errors.pincode}
              inputMode="numeric"
              maxLength={6}
              autoComplete="postal-code"
              onChange={(v) => change("pincode", v.replace(/\D/g, "").slice(0, 6))}
              onBlur={() => blur("pincode")}
            />
            <Field
              id="addr-city"
              label="City"
              value={form.city}
              error={errors.city}
              autoComplete="address-level2"
              onChange={(v) => change("city", v)}
              onBlur={() => blur("city")}
            />
          </div>
          <Field
            id="addr-line1"
            label="House or flat number and street"
            value={form.line1}
            error={errors.line1}
            autoComplete="address-line1"
            onChange={(v) => change("line1", v)}
            onBlur={() => blur("line1")}
          />
          <Field
            id="addr-line2"
            label="Area or locality"
            optional
            value={form.line2}
            error={errors.line2}
            autoComplete="address-line2"
            onChange={(v) => change("line2", v)}
          />

          <div>
            <label htmlFor="addr-state" className="text-sm font-semibold text-ink">
              State or union territory
            </label>
            <select
              id="addr-state"
              value={form.state}
              aria-invalid={errors.state ? true : undefined}
              aria-describedby={errors.state ? "addr-state-error" : undefined}
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
            <p id="addr-state-error" className="min-h-5 pt-1 text-xs font-semibold text-redtext">
              {errors.state}
            </p>
          </div>

          <fieldset className="mt-1">
            <legend className="text-sm font-semibold text-ink">Address type</legend>
            <div className="mt-2 flex flex-wrap gap-4">
              {(["home", "work"] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="addr-type"
                    value={t}
                    checked={form.addressType === t}
                    onChange={() => change("addressType", t)}
                    className="h-4 w-4 accent-brand-purple"
                  />
                  {t === "home" ? "Home" : "Work"}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              Save address
            </button>
            <button type="button" onClick={closeForm} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      </section>
    );
  }

  // ---------------------------------------------------------------- empty
  if (addresses.length === 0) {
    return (
      <div className="card px-6 py-10 text-center">
        <p aria-hidden="true" className="text-5xl">
          📍
        </p>
        <h2 className="mt-3 font-heading text-lg font-bold text-heading">No saved addresses yet</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          Save an address here and checkout will fill it in for you. Addresses are kept on this device only.
        </p>
        <button type="button" onClick={openNew} className="btn-primary mt-5">
          Add new address
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------- list
  return (
    <section aria-label="Your saved addresses">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p ref={statusRef} tabIndex={-1} role="status" className="text-sm text-muted outline-none">
          {addresses.length} of {MAX_ADDRESSES} addresses saved
        </p>
        {!atLimit && (
          <button type="button" onClick={openNew} className="btn-primary !py-2 text-sm">
            Add new address
          </button>
        )}
      </div>
      {atLimit && (
        <p className="mb-4 rounded-field bg-tint px-4 py-3 text-sm text-ink">
          You have saved the maximum of {MAX_ADDRESSES} addresses. Delete one to add another.
        </p>
      )}

      <ul className="space-y-4">
        {addresses.map((a) => (
          <li key={a.id} className="card min-w-0 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-line px-3 py-0.5 text-xs font-semibold text-ink">
                {a.addressType === "work" ? "Work" : "Home"}
              </span>
              {a.isDefault && (
                <span className="rounded-full border-2 border-brand-purple px-3 py-0.5 text-xs font-bold text-heading">
                  Default
                </span>
              )}
            </div>

            <address className="mt-3 break-words text-sm not-italic text-muted">
              <span className="font-semibold text-ink">{a.fullName}</span>
              <br />
              {a.line1}
              {a.line2 && (
                <>
                  <br />
                  {a.line2}
                </>
              )}
              <br />
              {a.city}, {a.state} {a.pincode}
              <br />
              Mobile: {a.phone}
            </address>

            {deletingId === a.id ? (
              <div role="alertdialog" aria-labelledby={`del-${a.id}`} className="mt-4 rounded-field bg-tint p-4">
                <p id={`del-${a.id}`} className="text-sm font-semibold text-ink">
                  Delete this address? This can&apos;t be undone.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button type="button" onClick={() => onDelete(a.id)} className="btn-primary !py-2 text-sm">
                    Yes, delete
                  </button>
                  <button type="button" onClick={() => setDeletingId(null)} className="btn-outline !py-2 text-sm">
                    Keep address
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(a)}
                  aria-label={`Edit address for ${a.fullName}, ${a.city}`}
                  className="btn-outline !py-2 text-sm"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(a.id)}
                  aria-label={`Delete address for ${a.fullName}, ${a.city}`}
                  className="btn-outline !py-2 text-sm"
                >
                  Delete
                </button>
                {!a.isDefault && (
                  <button
                    type="button"
                    onClick={() => onMakeDefault(a.id)}
                    aria-label={`Make address for ${a.fullName}, ${a.city} the default`}
                    className="btn-outline !py-2 text-sm"
                  >
                    Set as default
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
