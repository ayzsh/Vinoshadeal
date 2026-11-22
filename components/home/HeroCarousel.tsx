"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    eyebrow: "Mega Mobile Fest",
    title: "Up to 40% off on smartphones",
    text: "Latest 5G phones, power banks and accessories at everyday low prices.",
    cta: "Shop Mobiles",
    href: "/category/mobiles",
    bg: "from-[#330066] via-[#4B1C8C] to-[#7A2DB8]",
    emoji: "📱",
  },
  {
    eyebrow: "Fashion Week",
    title: "New styles from ₹399",
    text: "T-shirts, kurtas, footwear and more for the whole family.",
    cta: "Shop Fashion",
    href: "/category/fashion",
    bg: "from-[#330066] via-[#6A1B9A] to-[#C2185B]",
    emoji: "👗",
  },
  {
    eyebrow: "Home & Kitchen",
    title: "Smart deals for your home",
    text: "Cookware, appliances and essentials, delivered to your door.",
    cta: "Explore Deals",
    href: "/category/home-kitchen",
    bg: "from-[#1F0040] via-[#330066] to-[#5B2A9E]",
    emoji: "🍳",
  },
];

export default function HeroCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  const go = (n: number) => setI((n + slides.length) % slides.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured offers"
      className="container-page pt-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-card shadow-soft">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${i * 100}%)` }}
        >
          {slides.map((s, idx) => (
            <div
              key={s.title}
              aria-hidden={idx !== i}
              className={`relative flex min-h-[220px] w-full shrink-0 items-center justify-between bg-gradient-to-r ${s.bg} px-6 py-8 text-white sm:min-h-[320px] sm:px-12`}
            >
              <div className="max-w-md">
                <p className="inline-block rounded-full bg-brand-red px-3 py-1 text-xs font-bold uppercase tracking-wide">
                  {s.eyebrow}
                </p>
                <h2 className="mt-3 font-heading text-2xl font-bold !text-white sm:text-4xl">{s.title}</h2>
                <p className="mt-2 text-sm text-white/90 sm:text-base">{s.text}</p>
                <Link href={s.href} tabIndex={idx === i ? 0 : -1} className="btn-primary mt-5">
                  {s.cta}
                </Link>
              </div>
              <span className="text-7xl opacity-90 sm:text-[9rem]" aria-hidden="true">
                {s.emoji}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(i - 1)}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-[#330066] shadow-soft hover:bg-white sm:block"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(i + 1)}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-[#330066] shadow-soft hover:bg-white sm:block"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === i}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-white" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
