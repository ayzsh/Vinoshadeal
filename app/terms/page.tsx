import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/pages/PageShell";
import ReviewerNotes from "@/components/pages/ReviewerNotes";
import Section from "@/components/pages/Section";
import Tbc from "@/components/pages/Tbc";
import { DEMO_MODE } from "@/lib/constants";
import { CONTENT_IS_DRAFT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  robots: { index: !CONTENT_IS_DRAFT, follow: true },
};

const link = "font-semibold text-redtext underline";

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of Use"
      intro="The rules for using Vinoshadeal and buying from it."
      legal
    >
      <Section id="tm-about" title="About these terms">
        <p>
          These terms apply when you use Vinoshadeal. The store is run by <Tbc>legal entity name</Tbc>, a Vinosha
          Group company. By using the site you agree to these terms.
        </p>
        {DEMO_MODE && (
          <p>
            Vinoshadeal is currently in demo mode: products are samples, orders are practice orders, no payment is
            taken and nothing is shipped. Nothing in demo mode creates a real sale or a real obligation.
          </p>
        )}
      </Section>

      <Section id="tm-products" title="Products and prices">
        <ul className="list-disc space-y-2 pl-5">
          <li>Prices are in Indian rupees (₹). Each product shows its price, its MRP and the discount.</li>
          <li>Stock is checked again when you place your order. If an item is no longer available, we tell you.</li>
          <li>
            What happens if a price or description is wrong: <Tbc>error and cancellation wording</Tbc>
          </li>
        </ul>
      </Section>

      <Section id="tm-orders" title="Orders and payment">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            When an order is accepted and when a contract is formed: <Tbc>acceptance wording</Tbc>
          </li>
          <li>You can pay with the methods shown at checkout.</li>
          <li>
            Payment, failed payments and Cash on Delivery conditions: <Tbc>wording</Tbc>
          </li>
        </ul>
      </Section>

      <Section id="tm-delivery" title="Delivery, returns and refunds">
        <p>
          Delivery is described on the{" "}
          <Link href="/shipping" className={link}>
            Shipping
          </Link>{" "}
          page, and returns and refunds on the{" "}
          <Link href="/returns" className={link}>
            Returns & Refunds
          </Link>{" "}
          page. Those pages are part of these terms.
        </p>
      </Section>

      <Section id="tm-coupons" title="Coupons">
        <ul className="list-disc space-y-2 pl-5">
          <li>One coupon code can be used on an order.</li>
          <li>Some codes need a minimum order or only work on one category. The cart tells you if a code can&apos;t be used.</li>
          <li>
            Whether codes can be changed or withdrawn, and whether they can be combined with other offers:{" "}
            <Tbc>coupon terms</Tbc>
          </li>
        </ul>
      </Section>

      <Section id="tm-accounts" title="Accounts and your details">
        <p>
          You can check out as a guest.{DEMO_MODE ? " Sign-in is not switched on yet." : ""} Please give correct
          details, so we can deliver your order. How we handle your information is explained in the{" "}
          <Link href="/privacy" className={link}>
            Privacy Policy
          </Link>
          .
        </p>
      </Section>

      <Section id="tm-sellers" title="Selling on Vinoshadeal">
        <p>
          Sending a seller application does not mean it is accepted. Seller terms, fees and payouts:{" "}
          <Tbc>seller terms</Tbc>
        </p>
      </Section>

      <Section id="tm-use" title="Using the site fairly">
        <p>
          Please do not misuse the site, try to break it, or use it to harm others. What counts as misuse and what
          we may do about it: <Tbc>acceptable use wording</Tbc>
        </p>
      </Section>

      <Section id="tm-legal" title="Legal details">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Ownership of names, logos and content: <Tbc>intellectual property wording</Tbc>
          </li>
          <li>
            Limits on our responsibility: <Tbc>liability wording</Tbc>
          </li>
          <li>
            Which law applies and which courts can hear disputes: <Tbc>governing law and jurisdiction</Tbc>
          </li>
          <li>
            How we tell you when these terms change: <Tbc>wording</Tbc>
          </li>
          <li>
            How to contact us about these terms:{" "}
            <Link href="/contact" className={link}>
              Contact us
            </Link>
          </li>
        </ul>
      </Section>

      <ReviewerNotes
        items={[
          "Check the whole text against the Consumer Protection (E-Commerce) Rules, the Information Technology Act and any rules for the products sold.",
          "Add the legal entity name, registered address and grievance officer details required for an Indian e-commerce site.",
          "Decide the seller terms (fees, payouts, responsibilities) before sellers are accepted.",
          "Replace every 'to be confirmed' with real text.",
        ]}
      />

      <p className="text-sm text-muted">
        Last updated: <Tbc />
      </p>
    </PageShell>
  );
}
