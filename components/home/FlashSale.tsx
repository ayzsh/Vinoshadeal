"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

function timeLeftToMidnight() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Flash sale that restarts every day at midnight. */
export default function FlashSale({ products }: { products: Product[] }) {
  const [t, setT] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    setT(timeLeftToMidnight());
    const id = setInterval(() => setT(timeLeftToMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section aria-labelledby="flash-sale" className="container-page pt-10">
      <div className="rounded-card bg-gradient-to-r from-brand-purple to-[#5B2A9E] p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 fill-[#F5A623] text-[#F5A623]" aria-hidden="true" />
            <h2 id="flash-sale" className="section-title !text-white">
              Flash Sale
            </h2>
          </div>
          <div className="flex items-center gap-2 text-white" aria-live="off">
            <span className="text-sm text-white/85">Ends in</span>
            {t ? (
              [
                [t.h, "hrs"],
                [t.m, "min"],
                [t.s, "sec"],
              ].map(([v, label]) => (
                <span
                  key={label as string}
                  className="flex min-w-12 flex-col items-center rounded-lg bg-white px-2 py-1 text-[#330066]"
                >
                  <span className="font-heading text-lg font-bold leading-none">{pad(v as number)}</span>
                  <span className="text-[10px] font-medium uppercase">{label}</span>
                </span>
              ))
            ) : (
              <span className="skeleton h-10 w-44 !bg-white/30" />
            )}
          </div>
        </div>
        <div className="no-scrollbar mt-4 flex gap-4 overflow-x-auto pb-2">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
