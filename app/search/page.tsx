import type { Metadata } from "next";
import Breadcrumbs from "@/components/listing/Breadcrumbs";
import ProductListing from "@/components/listing/ProductListing";
import { searchProducts } from "@/lib/data";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

async function getQuery(searchParams: Props["searchParams"]): Promise<string> {
  const raw = (await searchParams).q;
  return ((Array.isArray(raw) ? raw[0] : raw) ?? "").trim();
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = await getQuery(searchParams);
  return {
    title: q ? `Search results for "${q}"` : "All products",
    robots: { index: false }, // search result pages shouldn't appear in Google
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const q = await getQuery(searchParams);
  const results = searchProducts(q);

  return (
    <div className="container-page py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
        {q ? <>Results for “{q}”</> : "All products"}
      </h1>
      <div className="mt-6">
        <ProductListing key={q} products={results} groupBy="category" />
      </div>
    </div>
  );
}
