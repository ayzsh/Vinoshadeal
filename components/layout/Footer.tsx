import Link from "next/link";
import Logo from "@/components/Logo";
import { categories } from "@/lib/data";

const help = [
  { label: "Help / FAQ", href: "/help" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns & Refunds", href: "/returns" },
  { label: "Contact Us", href: "/contact" },
];
const company = [
  { label: "About Us", href: "/about" },
  { label: "Sell on Vinoshadeal", href: "/sell" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-brand-purple pb-20 text-white md:pb-0">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo variant="onDark" />
          <p className="mt-3 text-sm font-semibold text-[#FFB3B3]">Every deal. Every day.</p>
          <p className="mt-3 text-sm text-white/80">
            Your one-stop online store for everyday essentials: electronics, fashion, home,
            groceries and more.
          </p>
        </div>

        <FooterList title="Shop" links={categories.slice(0, 6).map((c) => ({ label: c.name, href: `/category/${c.slug}` }))} />
        <FooterList title="Help" links={help} />
        <FooterList title="Company" links={company} />
      </div>

      <div className="border-t border-white/15">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-5 text-sm text-white/80 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Vinoshadeal. A{" "}
            <a
              href="https://vinosha.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white underline underline-offset-2"
            >
              Vinosha Group
            </a>{" "}
            company.
          </p>
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-white p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/vinosha-group-logo.png" alt="Vinosha Group" className="h-8 w-auto" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="font-heading text-base font-semibold text-white">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="text-white/80 transition hover:text-white hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
