import type { Product } from "@/lib/types";
import { discountPercent } from "@/lib/utils";

export type SortKey = "relevance" | "price-asc" | "price-desc" | "discount" | "rating" | "newest";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "discount", label: "Biggest Discount" },
  { value: "rating", label: "Customer Rating" },
  { value: "newest", label: "Newest First" },
];

export interface Filters {
  groups: string[]; // category slugs (search page only)
  brands: string[];
  minPrice: string; // digits only, "" = no limit
  maxPrice: string;
  minRating: number; // 0 = any
  minDiscount: number; // 0 = any
  inStockOnly: boolean;
}

export const EMPTY_FILTERS: Filters = {
  groups: [],
  brands: [],
  minPrice: "",
  maxPrice: "",
  minRating: 0,
  minDiscount: 0,
  inStockOnly: false,
};

export function activeCount(f: Filters): number {
  return (
    f.groups.length +
    f.brands.length +
    (f.minPrice ? 1 : 0) +
    (f.maxPrice ? 1 : 0) +
    (f.minRating ? 1 : 0) +
    (f.minDiscount ? 1 : 0) +
    (f.inStockOnly ? 1 : 0)
  );
}

export function filterProducts(list: Product[], f: Filters): Product[] {
  const min = f.minPrice ? Number(f.minPrice) : 0;
  const max = f.maxPrice ? Number(f.maxPrice) : Number.POSITIVE_INFINITY;
  return list.filter((p) => {
    if (f.groups.length > 0 && !f.groups.includes(p.categorySlug)) return false;
    if (f.brands.length > 0 && !f.brands.includes(p.brand)) return false;
    if (p.price < min || p.price > max) return false;
    if (f.minRating > 0 && p.rating < f.minRating) return false;
    if (f.minDiscount > 0 && discountPercent(p.price, p.mrp) < f.minDiscount) return false;
    if (f.inStockOnly && p.stock <= 0) return false;
    return true;
  });
}

export function sortProducts(list: Product[], key: SortKey): Product[] {
  const arr = [...list];
  const created = (p: Product) => (p.createdAt ? Date.parse(p.createdAt) || 0 : 0);
  switch (key) {
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price);
    case "discount":
      return arr.sort(
        (a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp),
      );
    case "rating":
      return arr.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "newest":
      return arr.sort((a, b) => created(b) - created(a));
    default:
      return arr; // relevance: keep the order we were given
  }
}

export function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}
