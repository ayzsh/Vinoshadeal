"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2x2, Heart, Home, ShoppingCart, User } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/category/mobiles", label: "Categories", icon: Grid2x2 },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/account", label: "Account", icon: User },
];

/** Mobile-only bottom navigation bar. */
export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface shadow-lift md:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          // /account/wishlist belongs to "Wishlist", so "Account" must not light up there too.
          const active =
            href === "/"
              ? pathname === "/"
              : href === "/account"
                ? pathname.startsWith("/account") && !pathname.startsWith("/account/wishlist")
                : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                  active ? "text-redtext" : "text-muted"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
