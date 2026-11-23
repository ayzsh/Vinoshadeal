"use client";

// Sign-in and sign-up SCREENS only. There is no backend yet, so submitting checks the fields and then says
// clearly that accounts are not switched on. Nothing is sent, stored or "signed in". Round 2: Supabase auth.

import Link from "next/link";
import { useState } from "react";
import { Info } from "lucide-react";
import Breadcrumbs from "@/components/listing/Breadcrumbs";
import Field from "@/components/account/Field";
import { EMPTY_FORM, validateField } from "@/lib/checkout";

type Mode = "login" | "signup";
type Values = { name: string; phone: string; email: string; password: string };
type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = { name: "", phone: "", email: "", password: "" };

function check(mode: Mode, v: Values): Errors {
  const e: Errors = {};
  if (mode === "signup") {
    const f = { ...EMPTY_FORM, fullName: v.name, phone: v.phone };
    const n = validateField(f, "fullName");
    const p = validateField(f, "phone");
    if (n) e.name = n;
    if (p) e.phone = p;
  }
  if (!v.email.trim()) e.email = "Enter your email address.";
  else {
    const m = validateField({ ...EMPTY_FORM, email: v.email }, "email");
    if (m) e.email = m;
  }
  if (!v.password) e.password = mode === "login" ? "Enter your password." : "Choose a password.";
  else if (mode === "signup" && v.password.length < 8) e.password = "Use at least 8 characters.";
  return e;
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const signup = mode === "signup";
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState(false);

  const order: (keyof Values)[] = signup ? ["name", "phone", "email", "password"] : ["email", "password"];

  function change(name: keyof Values, value: string) {
    const next = { ...values, [name]: value };
    setValues(next);
    setNotice(false);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: check(mode, next)[name] }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = check(mode, values);
    setErrors(found);
    const first = order.find((k) => found[k]);
    if (first) {
      setNotice(false);
      document.getElementById(`au-${first}`)?.focus();
      return;
    }
    // Nothing is sent or saved. Clear the password and say so.
    setValues((v) => ({ ...v, password: "" }));
    setNotice(true);
  }

  return (
    <div className="container-page py-6 pb-24 md:pb-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: signup ? "Create account" : "Sign in" }]} />

      <div className="mx-auto mt-4 max-w-md">
        <h1 className="font-heading text-2xl font-bold text-heading">{signup ? "Create account" : "Sign in"}</h1>

        <div
          role="note"
          className="mt-4 flex items-start gap-2 rounded-field border border-line bg-tint px-4 py-3 text-sm font-semibold text-ink"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            Demo: {signup ? "creating an account" : "signing in"} is not switched on yet. Please don&apos;t enter
            a real password. Nothing is sent or saved.
          </p>
        </div>

        <form onSubmit={submit} noValidate className="card mt-4 p-5">
          {signup && (
            <>
              <Field
                id="au-name"
                label="Full name"
                value={values.name}
                error={errors.name}
                autoComplete="name"
                onChange={(v) => change("name", v)}
              />
              <Field
                id="au-phone"
                label="Mobile number"
                hint="10 digits, no +91"
                value={values.phone}
                error={errors.phone}
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel-national"
                onChange={(v) => change("phone", v.replace(/\D/g, ""))}
              />
            </>
          )}
          <Field
            id="au-email"
            label="Email"
            type="email"
            value={values.email}
            error={errors.email}
            autoComplete="email"
            onChange={(v) => change("email", v)}
          />
          <Field
            id="au-password"
            label="Password"
            type="password"
            hint={signup ? "At least 8 characters" : undefined}
            value={values.password}
            error={errors.password}
            autoComplete={signup ? "new-password" : "current-password"}
            onChange={(v) => change("password", v)}
          />

          <button type="submit" className="btn-primary mt-1 w-full">
            {signup ? "Create account" : "Sign in"}
          </button>

          <div role="status" aria-live="polite">
            {notice && (
              <p className="mt-4 rounded-field border border-line bg-tint px-3 py-3 text-sm font-semibold text-ink">
                {signup ? "Account creation" : "Sign-in"} isn&apos;t switched on yet. Nothing was sent or saved, and
                you don&apos;t need an account to shop or check out.{" "}
                <Link href="/" className="text-redtext underline">
                  Continue shopping
                </Link>
              </p>
            )}
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          {signup ? "Already have an account? " : "New to Vinoshadeal? "}
          <Link href={signup ? "/login" : "/signup"} className="font-semibold text-redtext hover:underline">
            {signup ? "Sign in" : "Create account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
