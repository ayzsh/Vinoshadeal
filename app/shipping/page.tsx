import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/pages/PageShell";
import Section from "@/components/pages/Section";
import Tbc from "@/components/pages/Tbc";
import { DEMO_MODE, EXPRESS_DELIVERY_FEE } from "@/lib/constants";
import { DELIVERY_FEE, FREE_DELIVERY_MIN } from "@/lib/coupons";
import { CONTENT_IS_DRAFT } from "@/lib/site";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping",
  description: "Delivery charges and delivery options on Vinoshadeal.",
  robots: { index: !CONTENT_IS_DRAFT, follow: true },
};

export default function ShippingPage() {
  return (
    <PageShell title="Shipping" intro="What delivery costs and how it works." legal>
      {DEMO_MODE && (
        <p className="rounded-field border border-line bg-tint px-4 py-3 text-sm text-ink">
          Demo mode: orders are practice orders and nothing is shipped. This page describes how delivery is planned
          to work.
        </p>
      )}

      <Section id="ship-charges" title="Delivery charges">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Standard delivery</strong> is free when your items add up to {formatINR(FREE_DELIVERY_MIN)} or
            more. This is counted before any coupon is taken off.
          </li>
          <li>
            Below {formatINR(FREE_DELIVERY_MIN)}, standard delivery costs {formatINR(DELIVERY_FEE)}.
          </li>
          <li>
            <strong>Express delivery</strong> costs {formatINR(EXPRESS_DELIVERY_FEE)} extra, on top of the standard
            charge.
          </li>
        </ul>
        <p>The delivery charge is shown at checkout before you place your order.</p>
      </Section>

      <Section id="ship-times" title="Delivery times">
        <p>
          At checkout you choose Standard or Express and see an estimated arrival window. Delivery times:{" "}
          <Tbc>standard and express delivery times</Tbc>
        </p>
        {DEMO_MODE && (
          <p className="text-sm text-muted">The dates shown at checkout today are samples, not real courier dates.</p>
        )}
        <p>
          On a product page you can enter your pincode to see an estimate for that product.
        </p>
      </Section>

      <Section id="ship-areas" title="Where we deliver">
        <p>
          Delivery areas and pincodes we can serve: <Tbc>delivery areas</Tbc>
        </p>
      </Section>

      <Section id="ship-process" title="Packing, tracking and delivery problems">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Time to pack and hand over an order: <Tbc>processing time</Tbc>
          </li>
          <li>
            You can see the status of your orders in{" "}
            <Link href="/account/orders" className="font-semibold text-redtext underline">
              My orders
            </Link>
            .{DEMO_MODE ? " Real shipment tracking is not switched on yet." : ""}
          </li>
          <li>
            If nobody is available at the address, or the address is wrong: <Tbc>what happens</Tbc>
          </li>
          <li>
            If an order arrives damaged or is the wrong item, see{" "}
            <Link href="/returns" className="font-semibold text-redtext underline">
              Returns & Refunds
            </Link>
            .
          </li>
        </ul>
      </Section>

      <p className="text-sm text-muted">
        Last updated: <Tbc />
      </p>
    </PageShell>
  );
}
