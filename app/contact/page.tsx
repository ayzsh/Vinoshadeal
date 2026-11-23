import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/pages/PageShell";
import { DEMO_MODE } from "@/lib/constants";
import { CONTENT_IS_DRAFT, PARENT_SITE_URL, SITE_CONTACT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  robots: { index: !CONTENT_IS_DRAFT, follow: true },
};

export default function ContactPage() {
  const c = SITE_CONTACT;
  // only real values are shown: an empty value is skipped
  const details: { label: string; node: React.ReactNode }[] = [];
  if (c.email) {
    details.push({
      label: "Email",
      node: (
        <a href={`mailto:${c.email}`} className="break-all font-semibold text-redtext underline">
          {c.email}
        </a>
      ),
    });
  }
  if (c.phone) {
    details.push({
      label: "Phone",
      node: (
        <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className="font-semibold text-redtext underline">
          {c.phone}
        </a>
      ),
    });
  }
  if (c.whatsapp) {
    details.push({
      label: "WhatsApp",
      node: (
        <a
          href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-redtext underline"
        >
          Chat on WhatsApp
        </a>
      ),
    });
  }
  if (c.address) details.push({ label: "Address", node: <span className="break-words">{c.address}</span> });
  if (c.hours) details.push({ label: "Support hours", node: <span>{c.hours}</span> });

  return (
    <PageShell title="Contact us" intro="Questions about an order, a return or the site? Start here.">
      <section aria-labelledby="contact-quick">
        <h2 id="contact-quick" className="font-heading text-lg font-bold text-heading">
          Quick answers
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            { href: "/help", title: "Help and FAQ", text: "Answers to common questions." },
            { href: "/account/orders", title: "My orders", text: "See your orders and their status." },
            { href: "/account/returns", title: "Returns", text: "Ask for a return." },
          ].map((l) => (
            <li key={l.href} className="min-w-0">
              <Link href={l.href} className="card card-hover block h-full p-4">
                <span className="block font-heading font-bold text-heading">{l.title}</span>
                <span className="mt-1 block text-sm text-muted">{l.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="contact-details">
        <h2 id="contact-details" className="font-heading text-lg font-bold text-heading">
          Contact details
        </h2>
        {details.length > 0 ? (
          <dl className="card mt-3 divide-y divide-line px-4 text-sm">
            {details.map((d) => (
              <div key={d.label} className="grid gap-1 py-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-3">
                <dt className="text-muted">{d.label}</dt>
                <dd className="text-ink">{d.node}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-2 text-ink">Our contact details will be added here before launch.</p>
        )}
        {DEMO_MODE && (
          <p className="mt-3 text-sm text-muted">
            A contact form and live chat are not available yet. While the site is in demo mode, nobody is waiting
            to answer messages.
          </p>
        )}
      </section>

      <section aria-labelledby="contact-group">
        <h2 id="contact-group" className="font-heading text-lg font-bold text-heading">
          Part of Vinosha Group
        </h2>
        <p className="mt-2 text-ink">
          Vinoshadeal is a Vinosha Group company. The group&apos;s own website is{" "}
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
    </PageShell>
  );
}
