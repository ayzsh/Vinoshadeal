"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Heart, MapPin, Search, ShoppingCart, User } from "lucide-react";
import Logo from "@/components/Logo";
import CategoryIcon from "@/components/CategoryIcon";
import ThemeToggle from "./ThemeToggle";
import { categories, products } from "@/lib/data";

// Demo numbers. Round 2 will read the real cart and wishlist.
const DEMO_CART_COUNT = 2;
const DEMO_WISHLIST_COUNT = 3;

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pinOpen, setPinOpen] = useState(false);
  const [pinDraft, setPinDraft] = useState("");
  const [pinError, setPinError] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setPincode(localStorage.getItem("pincode") ?? "");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return products
      .filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(q))
      .slice(0, 5);
  }, [query]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setFocused(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function savePincode(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pinDraft)) {
      setPinError("Enter a valid 6-digit pincode");
      return;
    }
    setPincode(pinDraft);
    setPinError("");
    setPinOpen(false);
    try {
      localStorage.setItem("pincode", pinDraft);
    } catch {
      /* ignore */
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-brand-purple text-white shadow-soft">
      {/* announcement bar */}
      <div className="hidden bg-black/25 text-center text-xs sm:block">
        <p className="container-page py-1.5">
          Free delivery on orders above ₹499 &nbsp;·&nbsp; 7-day easy returns &nbsp;·&nbsp; A Vinosha Group company
        </p>
      </div>

      <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-2 py-3 lg:flex-nowrap lg:gap-x-5">
        <Link href="/" aria-label="Vinoshadeal home" className="shrink-0">
          <Logo variant="onDark" />
        </Link>

        {/* pincode */}
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => {
              setPinDraft(pincode);
              setPinOpen((o) => !o);
            }}
            className="flex items-center gap-1.5 rounded-field px-2 py-1.5 text-left text-sm transition hover:bg-white/10"
            aria-expanded={pinOpen}
          >
            <MapPin className="h-5 w-5 text-[#FF8A8A]" aria-hidden="true" />
            <span className="leading-tight">
              <span className="block text-[11px] text-white/75">Deliver to</span>
              <span className="block font-semibold">{pincode || "Select pincode"}</span>
            </span>
          </button>
          {pinOpen && (
            <form
              onSubmit={savePincode}
              className="absolute left-0 top-full mt-2 w-64 rounded-card bg-surface p-4 text-ink shadow-lift"
            >
              <label htmlFor="pin" className="text-sm font-semibold">
                Check delivery pincode
              </label>
              <input
                id="pin"
                inputMode="numeric"
                maxLength={6}
                value={pinDraft}
                onChange={(e) => setPinDraft(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 273001"
                className="mt-2 w-full rounded-field border border-line bg-page px-3 py-2 text-sm"
              />
              {pinError && <p className="mt-1 text-xs text-redtext">{pinError}</p>}
              <button type="submit" className="btn-primary mt-3 w-full !py-2 text-sm">
                Apply
              </button>
            </form>
          )}
        </div>

        {/* search */}
        <div ref={searchRef} className="relative order-last w-full lg:order-none lg:flex-1">
          <form onSubmit={submitSearch} role="search">
            <label htmlFor="site-search" className="sr-only">
              Search for products
            </label>
            <input
              id="site-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Search for mobiles, fashion, groceries and more"
              autoComplete="off"
              className="w-full rounded-field border-0 bg-white py-2.5 pl-4 pr-12 text-sm text-[#1A1A2E] placeholder:text-[#6B6B80]"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1 top-1 rounded-lg bg-brand-red p-2 text-white transition hover:bg-brand-red-dark"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
          {focused && suggestions.length > 0 && (
            <ul className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-card bg-surface text-ink shadow-lift">
              {suggestions.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/product/${p.slug}`}
                    onClick={() => setFocused(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-tint"
                  >
                    <span className="text-xl" aria-hidden="true">
                      {p.emoji}
                    </span>
                    <span className="line-clamp-1">{p.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* actions */}
        <nav aria-label="Account and cart" className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0">
          <ThemeToggle />
          <Link
            href="/account"
            className="hidden items-center gap-1.5 rounded-field px-2.5 py-2 text-sm font-semibold transition hover:bg-white/10 sm:flex"
          >
            <User className="h-5 w-5" aria-hidden="true" />
            Account
          </Link>
          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className="relative hidden rounded-full p-2 transition hover:bg-white/10 sm:block"
          >
            <Heart className="h-5 w-5" />
            {DEMO_WISHLIST_COUNT > 0 && <Badge n={DEMO_WISHLIST_COUNT} />}
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex items-center gap-1.5 rounded-field px-2.5 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Cart</span>
            {DEMO_CART_COUNT > 0 && <Badge n={DEMO_CART_COUNT} />}
          </Link>
        </nav>
      </div>

      {/* desktop category bar + mega menu */}
      <div className="hidden border-t border-white/10 lg:block">
        <div className="container-page flex items-center gap-1 text-sm">
          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1.5 bg-brand-red px-4 py-2.5 font-bold text-white"
            >
              All Categories <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 w-[min(900px,90vw)] translate-y-1 rounded-b-card bg-surface p-6 text-ink opacity-0 shadow-lift transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="grid grid-cols-3 gap-x-8 gap-y-6 xl:grid-cols-4">
                {categories.map((c) => (
                  <div key={c.id}>
                    <Link
                      href={`/category/${c.slug}`}
                      className="flex items-center gap-2 font-heading font-semibold text-heading hover:text-redtext"
                    >
                      <CategoryIcon name={c.icon} className="h-4 w-4" />
                      {c.name}
                    </Link>
                    <ul className="mt-2 space-y-1">
                      {c.subcategories.map((s) => (
                        <li key={s}>
                          <Link
                            href={`/category/${c.slug}`}
                            className="text-sm text-muted hover:text-redtext"
                          >
                            {s}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {categories.slice(0, 8).map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="rounded-md px-3 py-2.5 text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              {c.name}
            </Link>
          ))}
          <Link
            href="/sell"
            className="ml-auto rounded-md px-3 py-2.5 font-semibold text-[#FFB3B3] hover:bg-white/10"
          >
            Sell on Vinoshadeal
          </Link>
        </div>
      </div>
    </header>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1 text-[11px] font-bold text-white">
      {n}
    </span>
  );
}
