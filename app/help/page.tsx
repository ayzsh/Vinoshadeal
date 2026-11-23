import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/pages/PageShell";
import { DEMO_MODE, EXPRESS_DELIVERY_FEE } from "@/lib/constants";
import { DELIVERY_FEE, FREE_DELIVERY_MIN } from "@/lib/coupons";
import { RETURN_WINDOW_DAYS } from "@/lib/returns";
import { CONTENT_IS_DRAFT } from "@/lib/site";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Help and FAQ",
  description: "Answers about delivery, payment, returns and your account on Vinoshadeal.",
  robots: { index: !CONTENT_IS_DRAFT, follow: true },
};

interface Faq {
  q: string;
  a: React.ReactNode;
}
interface FaqGroup {
  id: string;
  title: string;
  items: Faq[];
}

const link = "font-semibold text-redtext underline";

// The money amounts and the return window come from the same settings the shop itself uses,
// so this page can never disagree with the cart and checkout.
const GROUPS: FaqGroup[] = [
  {
    id: "orders",
    title: "Orders and delivery",
    items: [
      ...(DEMO_MODE
        ? [
            {
              q: "Can I really buy things right now?",
              a: (
                <>
                  Not yet. Vinoshadeal is in demo mode: the products are samples, orders are practice orders, no
                  payment is taken and nothing is shipped. You can try the whole shopping flow safely.
                </>
              ),
            },
          ]
        : []),
      {
        q: "How much does delivery cost?",
        a: (
          <>
            Standard delivery is free when your items add up to {formatINR(FREE_DELIVERY_MIN)} or more (counted
            before any coupon is taken off). Below that, the delivery charge is {formatINR(DELIVERY_FEE)}.
            Express delivery adds {formatINR(EXPRESS_DELIVERY_FEE)} on top of the standard charge. You always see
            the delivery charge before you place your order. See{" "}
            <Link href="/shipping" className={link}>
              Shipping
            </Link>{" "}
            for the details.
          </>
        ),
      },
      {
        q: "When will my order arrive?",
        a: (
          <>
            You see an estimated arrival window at checkout for the delivery option you choose.
            {DEMO_MODE ? " While the site is in demo mode these dates are samples, not real courier dates." : ""}
          </>
        ),
      },
      {
        q: "Where can I see my orders?",
        a: (
          <>
            Open{" "}
            <Link href="/account/orders" className={link}>
              My orders
            </Link>{" "}
            to see each order, its items and its status.
            {DEMO_MODE ? " For now, orders are saved only on the device where you placed them." : ""}
          </>
        ),
      },
      {
        q: "Can I cancel an order?",
        a: (
          <>
            Yes, while its status is still &quot;Placed&quot;. Open the order in My orders and press Cancel
            order.
          </>
        ),
      },
    ],
  },
  {
    id: "payments",
    title: "Payments and coupons",
    items: [
      {
        q: "How can I pay?",
        a: (
          <>
            At checkout you can choose UPI, credit or debit card, net banking, wallets or Cash on Delivery.
            {DEMO_MODE
              ? " In demo mode no payment is taken, whichever you choose."
              : ""}{" "}
            We never ask for card numbers, UPI IDs or bank logins on our own pages.
          </>
        ),
      },
      {
        q: "How do I use a coupon code?",
        a: (
          <>
            Type the code in the coupon box in your{" "}
            <Link href="/cart" className={link}>
              cart
            </Link>{" "}
            and press Apply. One code can be used at a time. Some codes need a minimum order or only work on one
            category, and the cart tells you if a code can&apos;t be used and why.
          </>
        ),
      },
    ],
  },
  {
    id: "returns",
    title: "Returns and refunds",
    items: [
      {
        q: "What is the return period?",
        a: (
          <>
            You can ask for a return within {RETURN_WINDOW_DAYS} days of delivery. The period counts from the day
            your order was delivered. The full rules are on the{" "}
            <Link href="/returns" className={link}>
              Returns &amp; Refunds
            </Link>{" "}
            page.
          </>
        ),
      },
      {
        q: "How do I return something?",
        a: (
          <>
            Go to{" "}
            <Link href="/account/returns" className={link}>
              Returns
            </Link>{" "}
            in your account, choose the delivered order, pick the items and the reason, and send the request.
            {DEMO_MODE
              ? " In demo mode the request is only saved on your device: no pickup is arranged and no refund is made."
              : ""}
          </>
        ),
      },
    ],
  },
  {
    id: "account",
    title: "Your account",
    items: [
      {
        q: "Do I need an account to order?",
        a: <>No. You can check out as a guest.</>,
      },
      {
        q: "Where are my wishlist and saved addresses?",
        a: (
          <>
            In{" "}
            <Link href="/account" className={link}>
              My account
            </Link>
            : your wishlist, saved addresses, orders and details.
            {DEMO_MODE
              ? " Sign-in is not switched on yet, so they are saved on this device only."
              : ""}
          </>
        ),
      },
    ],
  },
  {
    id: "selling",
    title: "Selling",
    items: [
      {
        q: "Can I sell on Vinoshadeal?",
        a: (
          <>
            You can tell us about yourself and your products on the{" "}
            <Link href="/sell" className={link}>
              Sell on Vinoshadeal
            </Link>{" "}
            page.
            {DEMO_MODE ? " Seller sign-up is not switched on yet, so nothing is sent for now." : ""}
          </>
        ),
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <PageShell title="Help and FAQ" crumb="Help / FAQ" intro="Short answers to the questions we expect most.">
      <nav aria-label="Help topics">
        <ul className="flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <li key={g.id}>
              <a href={`#${g.id}`} className="btn-outline !px-4 !py-1.5 text-sm">
                {g.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {GROUPS.map((g) => (
        <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="scroll-mt-40">
          <h2 id={`${g.id}-title`} className="font-heading text-lg font-bold text-heading">
            {g.title}
          </h2>
          <div className="card mt-3 divide-y divide-line">
            {g.items.map((f) => (
              <details key={f.q} className="p-4">
                <summary className="cursor-pointer font-semibold text-ink">{f.q}</summary>
                <p className="mt-2 text-sm text-ink">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <p className="text-sm text-muted">
        Can&apos;t find your answer? Visit our{" "}
        <Link href="/contact" className={link}>
          Contact page
        </Link>
        .
      </p>
    </PageShell>
  );
}
