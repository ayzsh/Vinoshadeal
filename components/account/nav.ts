// The sections of the account area. When a section's page is built, flip its `available` to true.
// Sections that are not available yet show as "(soon)" and are not links, so nobody lands on a 404.

import { Heart, LayoutDashboard, MapPin, Package, RotateCcw, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AccountSection {
  href: string;
  /** short name in the menu */
  label: string;
  /** page title (h1) */
  title: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
}

export const ACCOUNT_SECTIONS: AccountSection[] = [
  {
    href: "/account",
    label: "Overview",
    title: "My account",
    description: "",
    icon: LayoutDashboard,
    available: true,
  },
  {
    href: "/account/orders",
    label: "Orders",
    title: "My orders",
    description: "See your orders and their status.",
    icon: Package,
    available: false, // Step F2
  },
  {
    href: "/account/wishlist",
    label: "Wishlist",
    title: "My wishlist",
    description: "Products you have saved with the heart.",
    icon: Heart,
    available: false, // Step F3
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    title: "Saved addresses",
    description: "Manage your delivery addresses.",
    icon: MapPin,
    available: false, // Step F3
  },
  {
    href: "/account/returns",
    label: "Returns",
    title: "Returns",
    description: "Request a return for a delivered order.",
    icon: RotateCcw,
    available: false, // Step F4
  },
  {
    href: "/account/profile",
    label: "Profile",
    title: "My profile",
    description: "Your name, mobile number and email.",
    icon: User,
    available: true,
  },
];

export function isActiveSection(href: string, pathname: string): boolean {
  return href === "/account" ? pathname === "/account" : pathname === href || pathname.startsWith(href + "/");
}
