import Link from "next/link";
import CategoryIcon from "@/components/CategoryIcon";
import { categories } from "@/lib/data";

export default function CategoryStrip() {
  return (
    <section aria-labelledby="shop-by-category" className="container-page pt-8">
      <h2 id="shop-by-category" className="section-title">
        Shop by category
      </h2>
      <ul className="no-scrollbar mt-4 flex gap-4 overflow-x-auto pb-2 sm:gap-6">
        {categories.map((c) => (
          <li key={c.id} className="shrink-0">
            <Link href={`/category/${c.slug}`} className="group flex w-20 flex-col items-center gap-2 sm:w-24">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-tint text-heading transition group-hover:bg-brand-red group-hover:text-white sm:h-20 sm:w-20">
                <CategoryIcon name={c.icon} className="h-7 w-7 sm:h-8 sm:w-8" />
              </span>
              <span className="text-center text-xs font-medium text-ink sm:text-sm">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
