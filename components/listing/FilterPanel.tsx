"use client";

import type { ReactNode } from "react";
import { toggleValue, type Filters } from "./listing-utils";

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

const RATING_OPTIONS = [
  { value: 0, label: "Any rating" },
  { value: 4, label: "4★ & above" },
  { value: 3, label: "3★ & above" },
];

const DISCOUNT_OPTIONS = [
  { value: 0, label: "Any discount" },
  { value: 10, label: "10% or more" },
  { value: 30, label: "30% or more" },
  { value: 50, label: "50% or more" },
];

/**
 * The filter controls. Used twice: in the desktop sidebar and in the mobile drawer.
 * `idPrefix` keeps the form field ids/names unique when both exist on the page.
 */
export default function FilterPanel({
  idPrefix,
  filters,
  onChange,
  groupOptions,
  brandOptions,
}: {
  idPrefix: string;
  filters: Filters;
  onChange: (next: Filters) => void;
  groupOptions?: FilterOption[]; // categories (search page only)
  brandOptions: FilterOption[];
}) {
  const digits = (v: string) => v.replace(/\D/g, "").slice(0, 7);

  return (
    <div>
      {groupOptions && groupOptions.length > 1 && (
        <Section title="Category">
          <CheckList
            options={groupOptions}
            selected={filters.groups}
            idPrefix={`${idPrefix}-cat`}
            onToggle={(v) => onChange({ ...filters, groups: toggleValue(filters.groups, v) })}
          />
        </Section>
      )}

      {brandOptions.length > 1 && (
        <Section title="Brand">
          <CheckList
            options={brandOptions}
            selected={filters.brands}
            idPrefix={`${idPrefix}-brand`}
            onToggle={(v) => onChange({ ...filters, brands: toggleValue(filters.brands, v) })}
          />
        </Section>
      )}

      <Section title="Price (₹)">
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={`${idPrefix}-min`}>
            Minimum price
          </label>
          <input
            id={`${idPrefix}-min`}
            inputMode="numeric"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onChange({ ...filters, minPrice: digits(e.target.value) })}
            className="w-full rounded-field border border-line bg-page px-3 py-2 text-sm"
          />
          <span className="text-muted" aria-hidden="true">
            to
          </span>
          <label className="sr-only" htmlFor={`${idPrefix}-max`}>
            Maximum price
          </label>
          <input
            id={`${idPrefix}-max`}
            inputMode="numeric"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: digits(e.target.value) })}
            className="w-full rounded-field border border-line bg-page px-3 py-2 text-sm"
          />
        </div>
      </Section>

      <Section title="Customer rating">
        {RATING_OPTIONS.map((o) => (
          <RadioRow
            key={o.value}
            name={`${idPrefix}-rating`}
            label={o.label}
            checked={filters.minRating === o.value}
            onSelect={() => onChange({ ...filters, minRating: o.value })}
          />
        ))}
      </Section>

      <Section title="Discount">
        {DISCOUNT_OPTIONS.map((o) => (
          <RadioRow
            key={o.value}
            name={`${idPrefix}-discount`}
            label={o.label}
            checked={filters.minDiscount === o.value}
            onSelect={() => onChange({ ...filters, minDiscount: o.value })}
          />
        ))}
      </Section>

      <Section title="Availability" last>
        <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
            className="h-4 w-4 accent-brand-red"
          />
          In stock only
        </label>
      </Section>
    </div>
  );
}

function Section({ title, children, last }: { title: string; children: ReactNode; last?: boolean }) {
  return (
    <fieldset className={`min-w-0 py-4 first:pt-0 ${last ? "" : "border-b border-line"}`}>
      <legend className="mb-2 font-heading text-sm font-semibold text-heading">{title}</legend>
      <div className="space-y-0.5">{children}</div>
    </fieldset>
  );
}

function CheckList({
  options,
  selected,
  idPrefix,
  onToggle,
}: {
  options: FilterOption[];
  selected: string[];
  idPrefix: string;
  onToggle: (value: string) => void;
}) {
  return (
    <div className="max-h-52 space-y-0.5 overflow-y-auto pr-1">
      {options.map((o) => (
        <label key={o.value} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
          <input
            id={`${idPrefix}-${o.value}`}
            type="checkbox"
            checked={selected.includes(o.value)}
            onChange={() => onToggle(o.value)}
            className="h-4 w-4 accent-brand-red"
          />
          <span className="flex-1">{o.label}</span>
          <span className="text-xs text-muted">{o.count}</span>
        </label>
      ))}
    </div>
  );
}

function RadioRow({
  name,
  label,
  checked,
  onSelect,
}: {
  name: string;
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
        className="h-4 w-4 accent-brand-red"
      />
      {label}
    </label>
  );
}
