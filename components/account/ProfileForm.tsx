"use client";

import { useEffect, useState } from "react";
import Field from "@/components/account/Field";
import { useCart } from "@/lib/cart-context";
import {
  EMPTY_PROFILE,
  clearProfile,
  loadProfile,
  saveProfile,
  validateProfile,
  type Profile,
  type ProfileErrors,
} from "@/lib/profile";

const ORDER: (keyof Profile)[] = ["name", "phone", "email"];

export default function ProfileForm() {
  const { showToast } = useCart();
  const [form, setForm] = useState<Profile>(EMPTY_PROFILE);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadProfile();
    if (saved) setForm(saved);
    setLoaded(true);
  }, []);

  function change(name: keyof Profile, value: string) {
    const next = { ...form, [name]: value };
    setForm(next);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: validateProfile(next)[name] }));
  }

  function blur(name: keyof Profile) {
    if (form[name] === "") return; // empty fields are checked on Save
    setErrors((prev) => ({ ...prev, [name]: validateProfile(form)[name] }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateProfile(form);
    setErrors(found);
    const first = ORDER.find((k) => found[k]);
    if (first) {
      document.getElementById(`pf-${first}`)?.focus();
      return;
    }
    if (saveProfile(form)) showToast("Profile saved on this device");
    else showToast("Couldn't save: your browser blocked its storage", "error");
  }

  function remove() {
    clearProfile();
    setForm(EMPTY_PROFILE);
    setErrors({});
    showToast("Your details were removed from this device");
  }

  if (!loaded) {
    return (
      <div aria-busy="true">
        <p className="sr-only" role="status">
          Loading your details
        </p>
        <div className="skeleton h-72 rounded-card" />
      </div>
    );
  }

  return (
    <section className="card p-5" aria-labelledby="pf-title">
      <h2 id="pf-title" className="font-heading text-lg font-bold text-heading">
        Your details
      </h2>
      <p className="mt-1 text-sm text-muted">Saved on this device only. We never send them anywhere in demo mode.</p>

      <form onSubmit={submit} noValidate className="mt-4 max-w-md">
        <Field
          id="pf-name"
          label="Full name"
          value={form.name}
          error={errors.name}
          autoComplete="name"
          onChange={(v) => change("name", v)}
          onBlur={() => blur("name")}
        />
        <Field
          id="pf-phone"
          label="Mobile number"
          hint="10 digits, no +91"
          value={form.phone}
          error={errors.phone}
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel-national"
          onChange={(v) => change("phone", v.replace(/\D/g, ""))}
          onBlur={() => blur("phone")}
        />
        <Field
          id="pf-email"
          label="Email"
          optional
          type="email"
          value={form.email}
          error={errors.email}
          autoComplete="email"
          onChange={(v) => change("email", v)}
          onBlur={() => blur("email")}
        />
        <div className="mt-2 flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">
            Save details
          </button>
          <button type="button" onClick={remove} className="btn-outline">
            Remove my details
          </button>
        </div>
      </form>
    </section>
  );
}
