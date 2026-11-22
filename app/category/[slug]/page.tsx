import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/listing/Breadcrumbs";
import ProductListing from "@/components/listing/ProductListing";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/data";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string | string[] }>;
};

function pickSub(raw: string | string[] | undefined, valid: string[]): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && valid.includes(value) ? value : undefined;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  const sub = pickSub((await searchParams).sub, category.subcategories);
  const title = sub ? `${sub} in ${category.name}` : category.name;
  return {
    title,
    description: `Shop ${title} online at Vinoshadeal. ${category.subcategories.join(", ")} and more. Free delivery on orders above ₹499.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const sub = pickSub((await searchParams).sub, category.subcategories);
  const products = getProductsByCategory(slug, sub);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: category.name, href: sub ? `/category/${slug}` : undefined },
    ...(sub ? [{ label: sub }] : []),
  ];

  return (
    <div className="container-page py-6">
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{sub ?? category.name}</h1>

      {/* Subcategory pills */}
      <ul className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2" aria-label={`${category.name} subcategories`}>
        <li className="shrink-0">
          <Pill href={`/category/${slug}`} active={!sub}>
            All
          </Pill>
        </li>
        {category.subcategories.map((s) => (
          <li key={s} className="shrink-0">
            <Pill href={`/category/${slug}?sub=${encodeURIComponent(s)}`} active={sub === s}>
              {s}
            </Pill>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <ProductListing key={`${slug}|${sub ?? ""}`} products={products} />
      </div>
    </div>
  );
}

function Pill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-block rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
        active
          ? "border-brand-purple bg-brand-purple text-white"
          : "border-line bg-surface text-ink hover:border-brand-red hover:text-redtext"
      }`}
    >
      {children}
    </Link>
  );
}
