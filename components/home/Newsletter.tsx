"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Round 2: save the email to the database.
    setDone(true);
  }

  return (
    <section aria-labelledby="newsletter" className="container-page pt-10">
      <div className="rounded-card bg-tint px-6 py-8 text-center sm:px-12">
        <Mail className="mx-auto h-8 w-8 text-redtext" aria-hidden="true" />
        <h2 id="newsletter" className="mt-2 text-xl font-bold sm:text-2xl">
          Get the best deals in your inbox
        </h2>
        <p className="mt-1 text-sm text-muted">Join for offers, new arrivals and sale alerts. No spam.</p>
        {done ? (
          <p role="status" className="mt-5 font-semibold text-success">
            Thanks for subscribing!
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mx-auto mt-5 flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="nl-email" className="sr-only">
              Email address
            </label>
            <input
              id="nl-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-field border border-line bg-surface px-4 py-2.5 text-sm"
            />
            <button type="submit" className="btn-primary">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
