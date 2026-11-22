import Link from "next/link";
import { brands } from "@/lib/data";

/** Text placeholders for now. Swap in real brand logos when you have them. */
export default function BrandStrip() {
  return (
    <section aria-labelledby="top-brands" className="container-page pt-10">
      <h2 id="top-brands" className="section-title">
        Top brands
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {brands.map((b) => (
          <li key={b}>
            <Link
              href={`/search?q=${encodeURIComponent(b)}`}
              className="card card-hover flex h-16 items-center justify-center font-heading text-lg font-bold text-heading"
            >
              {b}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
