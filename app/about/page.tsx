import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/pages/PageShell";
import { DEMO_MODE } from "@/lib/constants";
import { categories } from "@/lib/data";
import { CONTENT_IS_DRAFT, PARENT_SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About us",
  description: "Vinoshadeal is an online store from Vinosha Group. Every deal. Every day.",
  robots: { index: !CONTENT_IS_DRAFT, follow: true },
};

export default function AboutPage() {
  return (
    <PageShell
      title="About Vinoshadeal"
      crumb="About us"
      intro="Vinoshadeal is an online store from Vinosha Group. Our tagline says it all: every deal, every day."
    >
      <section aria-labelledby="about-who">
        <h2 id="about-who" className="font-heading text-lg font-bold text-heading">
          Who we are
        </h2>
        <p className="mt-2 text-ink">
          Vinoshadeal is a Vinosha Group company. You can learn more about the group on its own website,{" "}
          <a
            href={PARENT_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-redtext underline"
          >
            vinosha.in
          </a>
          .
        </p>
      </section>

      <section aria-labelledby="about-shop">
        <h2 id="about-shop" className="font-heading text-lg font-bold text-heading">
          What you can shop
        </h2>
        <p className="mt-2 text-ink">
          Everyday things for the whole family, in {categories.length} categories:
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`} className="btn-outline !px-4 !py-1.5 text-sm">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="about-feel">
        <h2 id="about-feel" className="font-heading text-lg font-bold text-heading">
          How we want shopping to feel
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-ink">
          <li>Clear prices: you see the price, the MRP and how much you save on every product.</li>
          <li>No surprises at the end: the delivery charge is shown before you place your order.</li>
          <li>Easy returns: you can ask for a return within 7 days of delivery.</li>
          <li>No account needed: you can check out as a guest.</li>
        </ul>
      </section>

      {DEMO_MODE && (
        <section aria-labelledby="about-today">
          <h2 id="about-today" className="font-heading text-lg font-bold text-heading">
            Where we are today
          </h2>
          <p className="mt-2 text-ink">
            Vinoshadeal is still being built. The products you see are samples, orders are practice orders, no
            payment is taken and nothing is shipped. Our{" "}
            <Link href="/help" className="font-semibold text-redtext underline">
              Help page
            </Link>{" "}
            explains what works today.
          </p>
        </section>
      )}

      <section aria-labelledby="about-sell">
        <h2 id="about-sell" className="font-heading text-lg font-bold text-heading">
          Want to sell with us?
        </h2>
        <p className="mt-2 text-ink">
          If you make or sell products, you can tell us about them.{" "}
          <Link href="/sell" className="font-semibold text-redtext underline">
            Sell on Vinoshadeal
          </Link>
          .
        </p>
      </section>
    </PageShell>
  );
}
