import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

/** A titled, horizontally scrolling row of product cards. */
export default function ProductRow({
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
