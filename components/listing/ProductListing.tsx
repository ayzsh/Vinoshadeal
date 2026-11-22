"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List, SearchX, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import FilterPanel, { type FilterOption } from "./FilterPanel";
import {
  EMPTY_FILTERS,
  SORT_OPTIONS,
  activeCount,
  filterProducts,
  sortProducts,
  type Filters,
  type SortKey,
} from "./listing-utils";
import { categories, getCategoryName } from "@/lib/data";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 12;

interface Chip {
  key: string;
  label: string;
  remove: (f: Filters) => Filters;
}

/**
 * Filters + sorting + grid/list for any list of products.
 * Used by the category page and the search page.
 * groupBy="category" adds a Category filter (search page).
 */
export default function ProductListing({
  products,
  groupBy,
}: {
  products: Product[];
  groupBy?: "category";
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS); // mobile drawer edits
  const [sort, setSort] = useState<SortKey>("relevance");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Filter options come from the products we were given
  const brandOptions: FilterOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1));
    return [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([value, count]) => ({ value, label: value, count }));
  }, [products]);

  const groupOptions: FilterOption[] | undefined = useMemo(() => {
    if (groupBy !== "category") return undefined;
    const counts = new Map<string, number>();
    products.forEach((p) => counts.set(p.categorySlug, (counts.get(p.categorySlug) ?? 0) + 1));
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, label: getCategoryName(value), count }));
  }, [products, groupBy]);

  const results = useMemo(
    () => sortProducts(filterProducts(products, filters), sort),
    [products, filters, sort],
  );
  const draftCount = useMemo(
    () => (drawerOpen ? filterProducts(products, draft).length : 0),
    [products, draft, drawerOpen],
  );

  // Start from the first page again whenever the list changes
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [filters, sort]);

  // Mobile drawer: lock page scroll, close on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  const chips: Chip[] = [];
  filters.groups.forEach((g) =>
    chips.push({
      key: `g-${g}`,
      label: getCategoryName(g),
      remove: (f) => ({ ...f, groups: f.groups.filter((x) => x !== g) }),
    }),
  );
  filters.brands.forEach((b) =>
    chips.push({
      key: `b-${b}`,
      label: b,
      remove: (f) => ({ ...f, brands: f.brands.filter((x) => x !== b) }),
    }),
  );
  if (filters.minPrice || filters.maxPrice) {
    const lo = filters.minPrice ? formatINR(Number(filters.minPrice)) : "";
    const hi = filters.maxPrice ? formatINR(Number(filters.maxPrice)) : "";
    chips.push({
      key: "price",
      label: lo && hi ? `${lo} – ${hi}` : lo ? `Above ${lo}` : `Under ${hi}`,
      remove: (f) => ({ ...f, minPrice: "", maxPrice: "" }),
    });
  }
  if (filters.minRating > 0)
    chips.push({
      key: "rating",
      label: `${filters.minRating}★ & above`,
      remove: (f) => ({ ...f, minRating: 0 }),
    });
  if (filters.minDiscount > 0)
    chips.push({
      key: "discount",
      label: `${filters.minDiscount}% off or more`,
      remove: (f) => ({ ...f, minDiscount: 0 }),
    });
  if (filters.inStockOnly)
    chips.push({ key: "stock", label: "In stock", remove: (f) => ({ ...f, inStockOnly: false }) });

  const filterCount = activeCount(filters);
  const shown = results.slice(0, visible);

  function openDrawer() {
    setDraft(filters);
    setDrawerOpen(true);
  }

  return (
    <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-8">
      {/* Desktop sidebar */}
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="card sticky top-44 max-h-[calc(100vh-12rem)] overflow-y-auto p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-base font-bold">Filters</h2>
            {filterCount > 0 && (
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="text-sm font-semibold text-redtext hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <FilterPanel
            idPrefix="side"
            filters={filters}
            onChange={setFilters}
            groupOptions={groupOptions}
            brandOptions={brandOptions}
          />
        </div>
      </aside>

      <div className="min-w-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <p aria-live="polite" className="mr-auto text-sm text-muted">
            <span className="font-semibold text-ink">{results.length}</span>{" "}
            {results.length === 1 ? "product" : "products"}
          </p>

          <button
            type="button"
            onClick={openDrawer}
            className="btn-outline !px-3 !py-2 text-sm lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
            {filterCount > 0 && (
              <span className="rounded-full bg-brand-red px-1.5 text-xs font-bold text-white">
                {filterCount}
              </span>
            )}
          </button>

          <label className="flex items-center gap-2 text-sm">
            <span className="sr-only sm:not-sr-only text-muted">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-field border border-line bg-surface px-3 py-2 text-sm font-medium"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex overflow-hidden rounded-field border border-line" role="group" aria-label="View">
            {(
              [
                ["grid", LayoutGrid, "Grid view"],
                ["list", List, "List view"],
              ] as const
            ).map(([v, Icon, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-label={label}
                aria-pressed={view === v}
                className={`p-2 transition ${
                  view === v ? "bg-brand-purple text-white" : "bg-surface text-muted hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label="Active filters">
            {chips.map((c) => (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => setFilters((f) => c.remove(f))}
                  aria-label={`Remove filter ${c.label}`}
                  className="inline-flex items-center gap-1 rounded-full bg-tint px-3 py-1 text-xs font-semibold text-heading transition hover:bg-brand-red hover:text-white"
                >
                  {c.label}
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="text-xs font-semibold text-redtext hover:underline"
              >
                Clear all
              </button>
            </li>
          </ul>
        )}

        {/* Results */}
        {results.length === 0 ? (
          <div className="card mt-6 flex flex-col items-center px-6 py-14 text-center">
            <SearchX className="h-12 w-12 text-muted" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold">No products found</h2>
            <p className="mt-1 max-w-sm text-sm text-muted">
              {filterCount > 0
                ? "Try removing some filters to see more products."
                : "We couldn't find anything here. Try a different search or browse our categories."}
            </p>
            {filterCount > 0 ? (
              <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="btn-primary mt-5">
                Clear all filters
              </button>
            ) : (
              <ul className="mt-5 flex flex-wrap justify-center gap-2">
                {categories.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/category/${c.slug}`}
                      className="rounded-full bg-tint px-3 py-1.5 text-sm font-semibold text-heading hover:bg-brand-red hover:text-white"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <>
            <div
              className={
                view === "grid"
                  ? "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4"
                  : "mt-4 flex flex-col gap-3"
              }
            >
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} variant={view} />
              ))}
            </div>
            {results.length > shown.length && (
              <div className="mt-8 text-center">
                <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn-outline">
                  Show more ({results.length - shown.length} left)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="animate-fade-in absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="animate-sheet-up absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-card bg-surface shadow-lift">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="font-heading text-base font-bold">Filters</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="rounded-full p-1.5 hover:bg-tint"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <FilterPanel
                idPrefix="drawer"
                filters={draft}
                onChange={setDraft}
                groupOptions={groupOptions}
                brandOptions={brandOptions}
              />
            </div>
            <div className="flex gap-3 border-t border-line px-4 py-3">
              <button type="button" onClick={() => setDraft(EMPTY_FILTERS)} className="btn-outline flex-1">
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilters(draft);
                  setDrawerOpen(false);
                }}
                className="btn-primary flex-[2]"
              >
                Show {draftCount} {draftCount === 1 ? "product" : "products"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
