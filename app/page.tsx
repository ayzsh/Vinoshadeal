import HeroCarousel from "@/components/home/HeroCarousel";
import CategoryStrip from "@/components/home/CategoryStrip";
import FlashSale from "@/components/home/FlashSale";
import ProductRow from "@/components/home/ProductRow";
import TrustStrip from "@/components/home/TrustStrip";
import BrandStrip from "@/components/home/BrandStrip";
import Reviews from "@/components/home/Reviews";
import Newsletter from "@/components/home/Newsletter";
import { getProductsByTag } from "@/lib/data";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <CategoryStrip />
      <FlashSale products={getProductsByTag("flash")} />
      <ProductRow id="deals" title="Deals of the day" products={getProductsByTag("deal")} href="/search?q=deals" />
      <TrustStrip />
      <ProductRow id="trending" title="Trending now" products={getProductsByTag("trending")} href="/search?q=trending" />
      <ProductRow id="new" title="New arrivals" products={getProductsByTag("new")} href="/search?q=new" />
      <BrandStrip />
      <Reviews />
      <Newsletter />
    </>
  );
}
