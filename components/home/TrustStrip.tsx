import { BadgeCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const items = [
  { icon: Truck, title: "Free delivery", text: "On orders above ₹499" },
  { icon: ShieldCheck, title: "Secure payments", text: "UPI, cards, wallets & COD" },
  { icon: RotateCcw, title: "7-day returns", text: "Easy, hassle-free returns" },
  { icon: BadgeCheck, title: "Genuine products", text: "100% authentic items" },
];

export default function TrustStrip() {
  return (
    <section aria-label="Why shop with us" className="container-page pt-10">
      <ul className="grid grid-cols-2 gap-3 rounded-card bg-tint p-4 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-redtext shadow-soft">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">{title}</p>
              <p className="text-xs text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
