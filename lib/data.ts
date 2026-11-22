import categoriesJson from "@/data/categories.json";
import productsJson from "@/data/products.json";
import type { Category, Product, ProductTag } from "./types";

/**
 * Round 1: data comes from simple JSON files.
 * Round 2: only THIS file changes, to call the Supabase database instead.
 */
export const categories = categoriesJson as unknown as Category[];
export const products = productsJson as unknown as Product[];

export function getProductsByTag(tag: ProductTag): Product[] {
  return products.filter((p) => p.tags.includes(tag));
}

export function getCategoryName(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

export const brands = ["Zenix", "Tronix", "Aurora", "Urbanly", "Kiraa", "Pure&Co", "Bloom", "Nova"];
