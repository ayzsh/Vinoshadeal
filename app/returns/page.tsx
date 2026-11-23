import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/pages/PageShell";
import ReviewerNotes from "@/components/pages/ReviewerNotes";
import Section from "@/components/pages/Section";
import Tbc from "@/components/pages/Tbc";
import { DEMO_MODE } from "@/lib/constants";
import { RETURN_WINDOW_DAYS } from "@/lib/returns";
import { CONTENT_IS_DRAFT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "How to return an item and how refunds work on Vinoshadeal.",
  robots: { index: !CONTENT_IS_DRAFT, follow: true },
};

const link = "font-semibold text-redtext underline";

export default function ReturnsPolicyPage() {
  return (
    <PageShell
      title="Returns & Refunds"
      crumb="Returns & Refunds"
      intro="How to return an item, and what happens to your money."
      legal
    >
      {DEMO_MODE && (
        <p className="rounded-field border border-line bg-tint px-4 py-3 text-sm text-ink">
          Demo mode: return requests are only saved on your device. No pickup is arranged and no refund is made.
          This page describes how returns are planned to work.
        </p>
      )}

      <Section id="ret-window" title="Return period">
        <p>
          You can ask for a return within {RETURN_WINDOW_DAYS} days of delivery. The period starts on the day your
          order is delivered and ends at the end of the {RETURN_WINDOW_DAYS}th day after that.
        </p>
      </Section>

      <Section id="ret-how" title="How to return an item">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Open{" "}
            <Link href="/account/returns" className={link}>
              Returns
            </Link>{" "}
            in your account. Only delivered orders can be returned.
          </li>
          <li>Press Request return on the order, choose the items and the reason, and add a note if you like.</li>
          <li>Send the request. Each item can be requested once.</li>
        </ol>
        <p>
          What happens next, including pickup or how you send the item back: <Tbc>return pickup process</Tbc>
        </p>
      </Section>

      <Section id="ret-cancel" title="Cancelling before delivery">
        <p>
          You can cancel an order while its status is still &quot;Placed&quot;. Open the order in{" "}
          <Link href="/account/orders" className={link}>
            My orders
          </Link>{" "}
          and press Cancel order.
        </p>
      </Section>

      <Section id="ret-items" title="Items that can't be returned">
        <p>
          Items and conditions that are not eligible for return: <Tbc>non-returnable items and item condition</Tbc>
        </p>
      </Section>

      <Section id="ret-refund" title="Refunds">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            How the refund is paid (to the original payment method, and for Cash on Delivery orders):{" "}
            <Tbc>refund method</Tbc>
          </li>
          <li>
            How long a refund takes: <Tbc>refund time</Tbc>
          </li>
          <li>
            Who pays for return shipping: <Tbc>return shipping cost</Tbc>
          </li>
          <li>
            Delivery charges on returned orders: <Tbc>delivery charge refund</Tbc>
          </li>
        </ul>
      </Section>

      <ReviewerNotes
        items={[
          "Check the return period and wording against the Consumer Protection (E-Commerce) Rules and any rules for the product categories sold.",
          "Decide which categories are non-returnable (for example hygiene, personal care, perishables, opened items).",
          "Make sure the refund method and time match what the payment partner can really do.",
        ]}
      />

      <p className="text-sm text-muted">
        Last updated: <Tbc />
      </p>
    </PageShell>
  );
}
