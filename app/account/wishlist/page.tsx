import type { Metadata } from "next";
import WishlistView from "@/components/account/WishlistView";

export const metadata: Metadata = {
  title: "My wishlist",
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return <WishlistView />;
}
