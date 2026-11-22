import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import CompareBar from "@/components/layout/CompareBar";
import { CartProvider } from "@/lib/cart-context";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Vinoshadeal: Every deal. Every day.",
    template: "%s | Vinoshadeal",
  },
  description:
    "Shop mobiles, electronics, fashion, home & kitchen, beauty, groceries and more at great prices. Vinoshadeal, a Vinosha Group company.",
};

export const viewport: Viewport = {
  themeColor: "#330066",
};

// Runs before the page paints so dark mode doesn't flash.
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <CartProvider>
          <Header />
          <main className="pb-16 md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <WhatsAppButton />
          <CompareBar />
        </CartProvider>
      </body>
    </html>
  );
}
