// Small price helper shared by the product page now and the cart page later.
// It does not read any data, so it can stay as it is in Round 2.

import type { Product } from "@/lib/types";

/** e.g. { Colour: "Black", Storage: "256GB" } */
type Selection = Record<string, string>;

/** The first option of every variant group (what is pre-selected on the page). */
export function defaultSelection(product: Product): Selection {
  const selection: Selection = {};
  for (const group of product.variants ?? []) {
    if (group.options.length > 0) selection[group.name] = group.options[0].label;
  }
  return selection;
}

/** Price and MRP after adding the price/MRP differences of the chosen options. */
export function priceFor(product: Product, selection?: Selection): { price: number; mrp: number } {
  let price = product.price;
  let mrp = product.mrp;
  for (const group of product.variants ?? []) {
    const option = group.options.find((o) => o.label === selection?.[group.name]);
    if (option) {
      price += option.priceDelta ?? 0;
      mrp += option.mrpDelta ?? 0;
    }
  }
  return { price, mrp: Math.max(mrp, price) };
}