import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/pages/PageShell";
import ReviewerNotes from "@/components/pages/ReviewerNotes";
import Section from "@/components/pages/Section";
import Tbc from "@/components/pages/Tbc";
import { DEMO_MODE } from "@/lib/constants";
import { CONTENT_IS_DRAFT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: !CONTENT_IS_DRAFT, follow: true },
};

const link = "font-semibold text-redtext underline";

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy Policy"
      intro="What information Vinoshadeal keeps about you, why, and what you can do about it."
      legal
    >
      <Section id="pv-who" title="Who we are">
        <p>
          Vinoshadeal is an online store, a Vinosha Group company. The legal name and registered address of the
          company that runs the store: <Tbc>legal entity name and address</Tbc>
        </p>
      </Section>

      <Section id="pv-today" title="What is saved on your device today">
        {DEMO_MODE ? (
          <p>
            Vinoshadeal is in demo mode. There are no accounts and nothing you enter is sent to our servers.
            Everything below is saved only in your own browser, on your own device:
          </p>
        ) : (
          <p>Some things are saved only in your own browser, on your own device:</p>
        )}
        <ul className="list-disc space-y-2 pl-5">
          <li>Your cart, items saved for later, wishlist, compare list and recently viewed products.</li>
          <li>The pincode you pick, and your light or dark theme choice.</li>
          <li>The last delivery address you used at checkout.</li>
          <li>Your saved addresses and your profile (name, mobile number, email), if you add them.</li>
          <li>Your orders and return requests{DEMO_MODE ? " (practice orders)" : ""}.</li>
          <li>Your seller application, if you save one.</li>
        </ul>
        <p>
          This is browser storage, similar to cookies. We use it so the site can remember your choices. We do not
          use it to show advertising.
        </p>
      </Section>

      <Section id="pv-later" title="What we will collect when the store is live">
        <p>
          When real orders and accounts are switched on, we will need to keep details such as your name, mobile
          number, email, delivery addresses and order history, so we can deliver your orders and help you with
          them. Exact list and purposes: <Tbc>final list of data collected and why</Tbc>
        </p>
        <p>
          Online payments will be handled by a payment partner in its own secure window. We will not see or store
          your full card number, UPI ID or bank login. Payment partner:{" "}
          <Tbc>payment partner name and what we receive from it</Tbc>
        </p>
      </Section>

      <Section id="pv-share" title="Who we share it with">
        <p>
          We will share only what is needed with the people who help us deliver your order, such as delivery
          partners and the payment partner: <Tbc>list of partners</Tbc>
        </p>
        <p>
          We do not sell your personal information: <Tbc>confirm this statement</Tbc>
        </p>
      </Section>

      <Section id="pv-choices" title="Your choices">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Change or remove your details in{" "}
            <Link href="/account/profile" className={link}>
              Profile
            </Link>
            , and manage or delete{" "}
            <Link href="/account/addresses" className={link}>
              saved addresses
            </Link>
            .
          </li>
          <li>Clear your browser&apos;s site data to remove everything Vinoshadeal saved on your device.</li>
          <li>
            Once accounts exist: how to see, correct or delete the information we hold about you:{" "}
            <Tbc>how to make a request</Tbc>
          </li>
        </ul>
      </Section>

      <Section id="pv-more" title="Other things this policy will cover">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            How long we keep information: <Tbc>retention periods</Tbc>
          </li>
          <li>
            Children&apos;s information: <Tbc>wording</Tbc>
          </li>
          <li>
            How we protect information: <Tbc>security measures</Tbc>
          </li>
          <li>
            Who to contact with a privacy question or complaint (name and contact details of the grievance
            officer): <Tbc>grievance officer</Tbc>
          </li>
          <li>
            How we tell you when this policy changes: <Tbc>wording</Tbc>
          </li>
        </ul>
      </Section>

      <ReviewerNotes
        items={[
          "Check the whole policy against India's Digital Personal Data Protection Act, the IT Act rules and the e-commerce rules that apply.",
          "The Section 'What is saved on your device today' describes how the site works now. Re-check it whenever a feature is added (for example analytics, which this draft assumes are not used).",
          "Replace every 'to be confirmed' with real text, and name the real payment and delivery partners.",
          "Decide on consent wording and a way to withdraw consent once accounts exist.",
        ]}
      />

      <p className="text-sm text-muted">
        Last updated: <Tbc />
      </p>
    </PageShell>
  );
}
