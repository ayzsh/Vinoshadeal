"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

type Slide = { src?: string; look: string };

// While a product's images[] is empty we show its emoji in a few different "looks",
// so the thumbnails and zoom can be tested. As soon as you put real image URLs
// in images[], those are used automatically (no code change needed).
function buildSlides(product: Product): Slide[] {
  if (product.images.length > 0) return product.images.map((src) => ({ src, look: "" }));
  return [{ look: "" }, { look: "-rotate-12" }, { look: "scale-125" }, { look: "rotate-12 scale-90" }];
}

function SlideView({
  slide,
  product,
  emojiSize,
  dim,
}: {
  slide: Slide;
  product: Product;
  emojiSize: string;
  dim: boolean;
}) {
  const dimClass = dim ? "opacity-40 grayscale" : "";
  if (slide.src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={slide.src} alt="" draggable={false} className={`h-full w-full object-contain ${dimClass}`} />;
  }
  return (
    <span aria-hidden="true" className={`inline-block select-none ${emojiSize} ${slide.look} ${dimClass}`}>
      {product.emoji}
    </span>
  );
}

export default function ProductGallery({ product }: { product: Product }) {
  const slides = buildSlides(product);
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const dim = product.stock <= 0;

  function select(i: number) {
    setIndex(i);
    setZoomed(false);
  }

  function pointOrigin(e: React.MouseEvent<HTMLButtonElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div>
      {/* Click (or tap) to zoom. Move the mouse / drag a finger to look around. Click again or press Esc to zoom out. */}
      <button
        type="button"
        onClick={(e) => {
          if (e.detail === 0) setOrigin("50% 50%"); // keyboard press: zoom to the middle
          else pointOrigin(e);
          setZoomed((z) => !z);
        }}
        onPointerMove={(e) => {
          if (zoomed) pointOrigin(e);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setZoomed(false);
        }}
        aria-label={`${zoomed ? "Zoom out of" : "Zoom in on"} ${product.name}, image ${index + 1} of ${slides.length}`}
        className={`relative block aspect-square w-full overflow-hidden rounded-card bg-tint ${
          zoomed ? "cursor-zoom-out touch-none" : "cursor-zoom-in"
        }`}
      >
        <div
          style={{ transformOrigin: origin }}
          className={`flex h-full w-full items-center justify-center transition-transform duration-200 ${
            zoomed ? "scale-[2]" : "scale-100"
          }`}
        >
          <SlideView slide={slides[index]} product={product} emojiSize="text-[8rem] sm:text-[10rem]" dim={dim} />
        </div>
      </button>

      {slides.length > 1 && (
        <ul className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {slides.map((slide, i) => (
            <li key={i} className="shrink-0">
              <button
                type="button"
                onClick={() => select(i)}
                aria-label={`Show image ${i + 1} of ${slides.length}`}
                aria-current={i === index}
                className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-field border-2 bg-tint ${
                  i === index ? "border-brand-red" : "border-line hover:border-muted"
                }`}
              >
                <SlideView slide={slide} product={product} emojiSize="text-3xl" dim={dim} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}