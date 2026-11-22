import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/listing/Breadcrumbs";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchase from "@/components/product/ProductPurchase";
import { getCategoryName, getProductBySlug, products } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description:
      product.description?.slice(0, 155) ?? `Buy ${product.name} by ${product.brand} at Vinoshadeal.`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const crumbs = [
    { label: "Home", href: "/" },
    { label: getCategoryName(product.categorySlug), href: `/category/${product.categorySlug}` },
    ...(product.subcategory
      ? [
          {
            label: product.subcategory,
            href: `/category/${product.categorySlug}?sub=${encodeURIComponent(product.subcategory)}`,
          },
        ]
      : []),
    { label: product.name },
  ];

  return (
    <div className="container-page py-4 sm:py-6">
      <Breadcrumbs items={crumbs} />

      <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="lg:sticky lg:top-40 lg:self-start">
          <ProductGallery key={product.id} product={product} />
        </div>
        <ProductPurchase key={product.id} product={product} />
      </div>

      {product.description && (
        <section id="description" aria-labelledby="description-title" className="mt-10">
          <h2 id="description-title" className="section-title">
            About this product
          </h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-ink">{product.description}</p>
        </section>
      )}

      {product.specs && product.specs.length > 0 && (
        <section id="specs" aria-labelledby="specs-title" className="mt-10">
          <h2 id="specs-title" className="section-title">
            Specifications
          </h2>
          <div className="mt-3 max-w-3xl overflow-hidden rounded-card border border-line">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Specifications of {product.name}</caption>
              <tbody>
                {product.specs.map((s, i) => (
                  <tr key={s.key} className={i % 2 === 0 ? "bg-tint" : ""}>
                    <th scope="row" className="w-2/5 px-4 py-2.5 text-left font-semibold text-ink">
                      {s.key}
                    </th>
                    <td className="px-4 py-2.5 text-ink">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* room so the sticky phone bar never covers the end of the page */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}