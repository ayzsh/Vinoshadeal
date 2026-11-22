"use client";

// The /compare page content: side-by-side table for up to 3 products.
// Reads the compare list from useCart() (saved in the browser for now).

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Star, X } from "lucide-react";
import Breadcrumbs from "@/components/listing/Breadcrumbs";
import { categories, products } from "@/lib/data";
import { useCart, MAX_COMPARE } from "@/lib/cart-context";
import { discountPercent, formatINR } from "@/lib/utils";
import { defaultSelection, priceFor } from "@/lib/pricing";
import type { Product } from "@/lib/types";

const LOW_STOCK = 6;

function stockLabel(stock: number): { text: string; tone: "ok" | "low" | "out" } {
  if (stock <= 0) return { text: "Out of stock", tone: "out" };
  if (stock <= LOW_STOCK) return { text: `Only ${stock} left`, tone: "low" };
  return { text: "In stock", tone: "ok" };
}

function specValue(p: Product, key: string): string | undefined {
  return p.specs?.find((s) => s.key === key)?.value;
}

export default function CompareTable() {
  const { ready, compare, toggleCompare, clearCompare, addToCart, showToast } = useCart();

  // Option choices per product, e.g. { p01: { Storage: "256GB" } }.
  // Kept only while you are on this page. Products you have not touched use their first option.
  const [choices, setChoices] = useState<Record<string, Record<string, string>>>({});

  function selectionOf(p: Product): Record<string, string> {
    return { ...defaultSelection(p), ...(choices[p.id] ?? {}) };
  }

  function choose(p: Product, group: string, label: string) {
    setChoices((c) => ({ ...c, [p.id]: { ...selectionOf(p), [group]: label } }));
  }

  const items = useMemo(
    () =>
      compare
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [compare]
  );

  // One row per spec name used by any of the products (in the order first seen).
  const specKeys = useMemo(() => {
    const keys: string[] = [];
    for (const p of items) {
      for (const s of p.specs ?? []) {
        if (!keys.includes(s.key)) keys.push(s.key);
      }
    }
    return keys;
  }, [items]);

  // One row per option group (Storage, Colour...) used by any of the products.
  const optionGroups = useMemo(() => {
    const names: string[] = [];
    for (const p of items) {
      for (const g of p.variants ?? []) {
        if (!names.includes(g.name)) names.push(g.name);
      }
    }
    return names;
  }, [items]);

  // "Best" markers only make sense with 2+ products whose values actually differ.
  // The price used is the one for the options currently chosen.
  const best = useMemo(() => {
    if (items.length < 2) return { price: null as number | null, rating: null as number | null };
    const prices = items.map((p) => priceFor(p, { ...defaultSelection(p), ...(choices[p.id] ?? {}) }).price);
    const ratings = items.map((p) => p.rating);
    const minPrice = Math.min(...prices);
    const maxRating = Math.max(...ratings);
    return {
      price: prices.some((v) => v !== minPrice) ? minPrice : null,
      rating: ratings.some((v) => v !== maxRating) ? maxRating : null,
    };
  }, [items, choices]);

  const anyVariants = items.some((p) => (p.variants?.length ?? 0) > 0);

  const crumbs = [{ label: "Home", href: "/" }, { label: "Compare" }];

  // ---------- loading ----------
  if (!ready) {
    return (
      <div className="container-page py-6">
        <Breadcrumbs items={crumbs} />
        <div className="skeleton mt-4 h-8 w-56" />
        <div className="skeleton mt-6 h-72 w-full" />
      </div>
    );
  }

  // ---------- empty ----------
  if (items.length === 0) {
    return (
      <div className="container-page py-6">
        <Breadcrumbs items={crumbs} />
        <h1 className="section-title mt-4">Compare products</h1>
        <div className="card mt-6 p-8 text-center">
          <p className="text-5xl" aria-hidden="true">
            ⚖️
          </p>
          <h2 className="mt-3 font-heading text-lg font-semibold text-heading">
            Nothing to compare yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            Open any product and choose &quot;Add to compare&quot;. You can compare up to {MAX_COMPARE}{" "}
            products side by side.
          </p>
          <CategoryLinks />
        </div>
      </div>
    );
  }

  // ---------- table ----------
  return (
    <div className="container-page py-6">
      <Breadcrumbs items={crumbs} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="section-title !mb-0">Compare products</h1>
        <button
          type="button"
          onClick={() => {
            clearCompare();
            showToast("Compare list cleared");
          }}
          className="btn-outline !px-4 !py-2 text-sm"
        >
          Clear all
        </button>
      </div>

      <p role="status" aria-live="polite" className="mt-2 text-sm text-muted">
        {items.length} of {MAX_COMPARE} products selected
      </p>

      {items.length === 1 && (
        <div className="card mt-4 p-4 text-sm">
          <p className="font-semibold text-heading">Add one more product to compare</p>
          <p className="mt-1 text-muted">
            Open another product and choose &quot;Add to compare&quot;, or browse a category:
          </p>
          <CategoryLinks />
        </div>
      )}

      <div
        role="region"
        aria-label="Product comparison table, scroll sideways to see more"
        tabIndex={0}
        className="card mt-4 overflow-x-auto"
      >
        <table className="w-full border-separate border-spacing-0 text-left text-sm">
          <caption className="sr-only">
            Side-by-side comparison of {items.length} products
          </caption>

          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-20 w-28 min-w-[7rem] border-b border-r border-line bg-surface p-3 align-bottom text-xs font-semibold text-muted sm:w-40 sm:min-w-[10rem]"
              >
                Product
              </th>
              {items.map((p) => (
                <th
                  key={p.id}
                  scope="col"
                  className="relative min-w-[11rem] border-b border-line bg-surface p-3 align-top font-normal"
                >
                  <button
                    type="button"
                    onClick={() => toggleCompare(p.id)}
                    aria-label={`Remove ${p.name} from compare`}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:bg-tint"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <Link href={`/product/${p.slug}`} className="group block pr-8">
                    <span
                      className="flex h-20 w-20 items-center justify-center rounded-field bg-tint text-5xl"
                      aria-hidden="true"
                    >
                      {p.emoji}
                    </span>
                    <span className="mt-2 line-clamp-3 block font-semibold text-heading group-hover:text-redtext group-hover:underline">
                      {p.name}
                    </span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <Row label="Brand">
              {items.map((p) => (
                <Cell key={p.id}>{p.brand}</Cell>
              ))}
            </Row>

            <Row label="Price">
              {items.map((p) => {
                const { price, mrp } = priceFor(p, selectionOf(p));
                const off = discountPercent(price, mrp);
                return (
                  <Cell key={p.id}>
                    {/* aria-live: the price changes when you pick another option */}
                    <div aria-live="polite">
                      <span className="block text-base font-bold text-heading">
                        {formatINR(price)}
                      </span>
                      {off > 0 && (
                        <span className="block text-xs text-muted">
                          <span className="line-through">{formatINR(mrp)}</span>{" "}
                          <span className="font-semibold text-redtext">{off}% off</span>
                        </span>
                      )}
                      {best.price === price && <BestBadge>Lowest price</BestBadge>}
                    </div>
                  </Cell>
                );
              })}
            </Row>

            {optionGroups.map((name) => (
              <Row key={`opt-${name}`} label={name}>
                {items.map((p) => {
                  const group = p.variants?.find((g) => g.name === name);
                  if (!group) {
                    return (
                      <Cell key={p.id}>
                        <span aria-hidden="true">-</span>
                        <span className="sr-only">Not available</span>
                      </Cell>
                    );
                  }
                  const id = `opt-${p.id}-${name}`.replace(/\s+/g, "-");
                  return (
                    <Cell key={p.id}>
                      <label htmlFor={id} className="sr-only">
                        {name} for {p.name}
                      </label>
                      <select
                        id={id}
                        value={selectionOf(p)[name]}
                        onChange={(e) => choose(p, name, e.target.value)}
                        className="w-full rounded-field border border-line bg-page px-2 py-2 text-sm text-ink"
                      >
                        {group.options.map((o) => (
                          <option key={o.label} value={o.label}>
                            {o.label}
                            {o.priceDelta
                              ? ` (${o.priceDelta > 0 ? "+" : "-"}${formatINR(Math.abs(o.priceDelta))})`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </Cell>
                  );
                })}
              </Row>
            ))}

            <Row label="Rating">
              {items.map((p) => (
                <Cell key={p.id}>
                  <span className="inline-flex items-center gap-1 font-semibold text-heading">
                    <Star className="h-4 w-4 fill-gold text-gold" aria-hidden="true" />
                    {p.rating.toFixed(1)}
                    <span className="sr-only"> out of 5</span>
                  </span>
                  <span className="block text-xs text-muted">
                    {p.reviewCount.toLocaleString("en-IN")} ratings
                  </span>
                  {best.rating === p.rating && <BestBadge>Top rated</BestBadge>}
                </Cell>
              ))}
            </Row>

            <Row label="Availability">
              {items.map((p) => {
                const s = stockLabel(p.stock);
                return (
                  <Cell key={p.id}>
                    <span
                      className={
                        s.tone === "ok"
                          ? "font-semibold text-heading"
                          : "font-semibold text-redtext"
                      }
                    >
                      {s.text}
                    </span>
                  </Cell>
                );
              })}
            </Row>

            {specKeys.map((key) => (
              <Row key={key} label={key}>
                {items.map((p) => {
                  const v = specValue(p, key);
                  return (
                    <Cell key={p.id}>
                      {v ?? (
                        <>
                          <span aria-hidden="true">-</span>
                          <span className="sr-only">Not listed</span>
                        </>
                      )}
                    </Cell>
                  );
                })}
              </Row>
            ))}

            <Row label="Buy" last>
              {items.map((p) => (
                <Cell key={p.id} last>
                  <div className="flex flex-col gap-2">
                    {p.stock <= 0 ? (
                      <button
                        type="button"
                        disabled
                        className="btn-outline cursor-not-allowed !px-3 !py-2 text-sm opacity-60"
                      >
                        Out of stock
                      </button>
                    ) : (
                      <button
                        type="button"
                        // Adds the exact options picked in the table above.
                        onClick={() =>
                          addToCart(
                            p.id,
                            1,
                            Object.keys(selectionOf(p)).length > 0 ? selectionOf(p) : undefined
                          )
                        }
                        className="btn-primary !px-3 !py-2 text-sm"
                      >
                        Add to Cart
                      </button>
                    )}
                    <Link
                      href={`/product/${p.slug}`}
                      className="text-center text-xs font-semibold text-redtext hover:underline"
                    >
                      View product
                    </Link>
                  </div>
                </Cell>
              ))}
            </Row>
          </tbody>
        </table>
      </div>

      {anyVariants && (
        <p className="mt-3 text-xs text-muted">
          Pick storage or colour in the table and the price updates. The specs listed are for the
          standard model.
        </p>
      )}
    </div>
  );
}

// ---------- small helpers ----------

function Row({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <tr>
      <th
        scope="row"
        className={`sticky left-0 z-10 border-r border-line bg-surface p-3 align-top text-xs font-semibold text-muted ${
          last ? "" : "border-b"
        }`}
      >
        {label}
      </th>
      {children}
    </tr>
  );
}

function Cell({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <td className={`p-3 align-top text-ink ${last ? "" : "border-b border-line"}`}>{children}</td>
  );
}

// Text + icon (not colour alone) so it works for everyone.
function BestBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-line bg-tint px-2 py-0.5 text-xs font-semibold text-heading">
      <Check className="h-3 w-3" aria-hidden="true" />
      {children}
    </span>
  );
}

function CategoryLinks() {
  return (
    <ul className="mt-4 flex flex-wrap justify-center gap-2">
      {categories.map((c) => (
        <li key={c.id}>
          <Link
            href={`/category/${c.slug}`}
            className="inline-block rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink transition hover:bg-tint hover:text-redtext"
          >
            {c.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
