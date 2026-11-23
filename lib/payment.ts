// The payment choices shown at checkout. This is ONLY a list to pick from: the site never asks for
// card numbers, UPI IDs or bank logins. Round 2: for the online methods Razorpay opens its own secure window.

import type { PaymentMethod } from "@/lib/types";

export interface PaymentOption {
  id: PaymentMethod;
  label: string;
  /** one short line shown under the name */
  description: string;
  /** true = paid online (needs Razorpay in Round 2) */
  online: boolean;
}

export const PAYMENT_METHODS: PaymentOption[] = [
  { id: "upi", label: "UPI", description: "Pay with any UPI app.", online: true },
  { id: "card", label: "Credit or debit card", description: "Pay with a credit or debit card.", online: true },
  { id: "netbanking", label: "Net banking", description: "Pay through your bank's website.", online: true },
  { id: "wallet", label: "Wallets", description: "Pay with a mobile wallet.", online: true },
  { id: "cod", label: "Cash on Delivery", description: "Pay in cash when your order arrives.", online: false },
];

export function paymentOption(id?: PaymentMethod): PaymentOption | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id);
}
