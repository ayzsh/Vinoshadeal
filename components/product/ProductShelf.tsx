import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

/**
 * A titled, horizontally scrolling row of product cards.
 * Same look as the home page's ProductRow, kept as its own small file so the
 * product page does not depend on where ProductRow lives.
 */
export default function ProductShelf({
  id,
  title,
  products,
  href,
}: {
  id: string;
  title: string;
  products: Product[];
  href?: string;
}) {
  if (products.length === 0) return null;
  return (
    <section aria-labelledby={id} className="container-page pt-10">
      <div className="flex items-end justify-between">
        <h2 id={id} className="section-title">
          {title}
        </h2>
        {href && (
          <Link href={href} className="text-sm font-semibold text-redtext hover:underline">
            View all
          </Link>
        )}
      </div>
      <div className="no-scrollbar -mx-4 mt-4 flex gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
