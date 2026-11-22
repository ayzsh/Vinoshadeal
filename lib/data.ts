// The ONLY file that reads product/category data.
// In Round 2 we will swap the JSON imports below for Supabase calls.

import categoriesData from "../data/categories.json";
import productsData from "../data/products.json";
import type { Category, Product, ProductTag } from "./types";

export const categories = categoriesData as unknown as Category[];
export const products = productsData as unknown as Product[];

// Brand names shown in the "Top brands" strip on the home page.
export const brands: string[] = [
  "Zenix",
  "Tronix",
  "Aurora",
  "Urbanly",
  "Kiraa",
  "Pure&Co",
  "Bloom",
  "Nova",
];

/** Name of a category from its slug (falls back to the slug itself). */
export function getCategoryName(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

/** Products with a given tag. Never returns the same product twice. */
export function getProductsByTag(tag: ProductTag, limit?: number): Product[] {
  const seen = new Set<string>();
  const list = products.filter((p) => {
    if (!p.tags.includes(tag) || seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** All products in a category, optionally only one subcategory. */
export function getProductsByCategory(
  categorySlug: string,
  subcategory?: string
): Product[] {
  return products.filter(
    (p) =>
      p.categorySlug === categorySlug &&
      (!subcategory || p.subcategory === subcategory)
  );
}

// Words that mean "show me products with this tag" (the home page "View all" links use these).
const TAG_WORDS: Record<string, ProductTag> = {
  deal: "deal",
  deals: "deal",
  flash: "flash",
  trending: "trending",
  new: "new",
};

/**
 * Simple search. Every word you type must match somewhere in the product's
 * name, brand, category, subcategory or description. Best matches come first.
 * An empty search returns all products.
 */
export function searchProducts(query: string): Product[] {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
  if (words.length === 0) return products.slice();

  const scored: { product: Product; score: number }[] = [];

  for (const p of products) {
    const name = p.name.toLowerCase();
    const brand = p.brand.toLowerCase();
    const category = getCategoryName(p.categorySlug).toLowerCase();
    const sub = (p.subcategory ?? "").toLowerCase();
    const desc = (p.description ?? "").toLowerCase();

    let score = 0;
    let allMatched = true;

    for (const w of words) {
      let wordScore = 0;
      if (name.includes(w)) wordScore += 10;
      if (brand.includes(w)) wordScore += 8;
      if (sub.includes(w)) wordScore += 5;
      if (category.includes(w)) wordScore += 4;
      if (desc.includes(w)) wordScore += 1;
      const tag = TAG_WORDS[w];
      if (tag && p.tags.includes(tag)) wordScore += 6;

      if (wordScore === 0) {
        allMatched = false;
        break;
      }
      score += wordScore;
    }

    if (allMatched) scored.push({ product: p, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating)
    .map((s) => s.product);
}

/**
 * Products similar to the given one: same subcategory first, then same
 * category, then the best-rated of the rest. Never includes the product itself.
 */
export function getRelatedProducts(product: Product, limit = 6): Product[] {
  const others = products.filter((p) => p.id !== product.id);
  const sameSub = others.filter(
    (p) =>
      p.categorySlug === product.categorySlug &&
      !!product.subcategory &&
      p.subcategory === product.subcategory
  );
  const sameCat = others.filter(
    (p) => p.categorySlug === product.categorySlug && !sameSub.includes(p)
  );
  const rest = others
    .filter((p) => p.categorySlug !== product.categorySlug)
    .sort((a, b) => b.rating - a.rating);

  return [...sameSub, ...sameCat, ...rest].slice(0, limit);
}
