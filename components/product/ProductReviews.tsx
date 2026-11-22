import { Star } from "lucide-react";
import type { Product } from "@/lib/types";

// ---------------------------------------------------------------------------
// SAMPLE ONLY. These are NOT real customer reviews.
// The rating breakdown and the reviews below are generated from the product
// (id, brand, name, rating, reviewCount) so they are the same on every visit,
// with no randomness. Round 2 will replace this with real reviews from the database.
// ---------------------------------------------------------------------------

/** Turns text into a number. Same text always gives the same number. */
function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

/** Made-up split of the ratings into 5, 4, 3, 2, 1 stars. Always adds up to reviewCount. */
function breakdown(product: Product): { star: number; count: number; percent: number }[] {
  const total = Math.max(0, Math.round(product.reviewCount));
  const centre = Math.min(5, product.rating + 0.5);
  const stars = [5, 4, 3, 2, 1];
  const weights = stars.map((s) => Math.exp(-1.3 * Math.abs(s - centre)));
  const sum = weights.reduce((a, b) => a + b, 0);
  const counts = weights.map((w) => Math.floor((w / sum) * total));
  counts[0] += total - counts.reduce((a, b) => a + b, 0); // leftovers go to 5 stars
  return stars.map((star, i) => ({
    star,
    count: counts[i],
    percent: total > 0 ? (counts[i] / total) * 100 : 0,
  }));
}

const POOL: Record<number, { title: string; body: (p: Product) => string }[]> = {
  5: [
    { title: "Worth the price", body: (p) => `Really happy with the ${p.name}. It looks just like the pictures and feels well made for the price.` },
    { title: "Great value", body: (p) => `${p.brand} has done a good job here. Delivery was quick and the packaging was neat.` },
    { title: "Exactly what I wanted", body: () => "Easy to order and it arrived on time. I have already told my family about it." },
  ],
  4: [
    { title: "Good, with small gaps", body: () => "Does what it should. I took one star off because I wish the box had clearer instructions." },
    { title: "Would buy again", body: (p) => `Using it for a few weeks now and no complaints so far. I would buy from ${p.brand} again.` },
    { title: "Solid choice", body: () => "Good quality for the money. A little more detail in the product photos would have helped." },
  ],
  3: [
    { title: "Okay for the price", body: () => "Decent, but nothing special. Fine if you catch it on a deal." },
    { title: "Average", body: () => "It works, though I expected a little more. Delivery was on time." },
    { title: "Fair", body: () => "Does the job. I would check the details carefully before buying." },
  ],
  2: [
    { title: "Not what I hoped", body: () => "It arrived fine, but it did not feel as good as I expected for the price." },
    { title: "Below expectations", body: () => "Not a bad product, but I would look at other options in this range." },
  ],
};

const NAMES = ["Aarav S.", "Priya M.", "Rohit K.", "Sneha P.", "Imran A.", "Kavita R.", "Deepak T.", "Anjali V."];

function starPattern(rating: number): number[] {
  if (rating >= 4.5) return [5, 5, 4, 5, 4];
  if (rating >= 4.0) return [5, 4, 4, 5, 3];
  if (rating >= 3.5) return [4, 3, 4, 5, 3];
  return [3, 2, 4, 3, 3];
}

function sampleReviews(product: Product) {
  const h = hash(product.id);
  const used: Record<number, number> = {};
  return starPattern(product.rating).map((star, i) => {
    const pool = POOL[star];
    const n = used[star] ?? 0;
    used[star] = n + 1;
    const entry = pool[(h + n) % pool.length];
    return {
      id: `${product.id}-${i}`,
      star,
      title: entry.title,
      body: entry.body(product),
      name: NAMES[(h + i * 3) % NAMES.length], // 3 and 8 share no factors, so names never repeat
    };
  });
}

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span role="img" aria-label={`${value} out of 5 stars`} className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={`${size} ${n <= Math.round(value) ? "fill-gold text-gold" : "text-line"}`}
        />
      ))}
    </span>
  );
}

export default function ProductReviews({ product }: { product: Product }) {
  const rows = breakdown(product);
  const reviews = sampleReviews(product);

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="mt-10 scroll-mt-40">
      <h2 id="reviews-title" className="section-title">
        Ratings and reviews
      </h2>

      <p className="mt-3 max-w-3xl rounded-field bg-tint px-4 py-2 text-sm text-muted">
        Sample content: the rating split and the reviews below are made-up examples for testing the page. Real
        customer reviews will come later.
      </p>

      <div className="mt-5 grid max-w-3xl gap-6 sm:grid-cols-[auto_1fr] sm:gap-10">
        <div>
          <p className="text-5xl font-bold text-ink">{product.rating.toFixed(1)}</p>
          <div className="mt-1">
            <Stars value={product.rating} size="h-5 w-5" />
          </div>
          <p className="mt-1 text-sm text-muted">{product.reviewCount.toLocaleString("en-IN")} ratings</p>
        </div>

        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.star} className="flex items-center gap-3 text-sm">
              <span className="w-12 shrink-0 text-ink">{r.star} star</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
                <div className="h-full rounded-full bg-success" style={{ width: `${r.percent}%` }} />
              </div>
              <span className="w-14 shrink-0 text-right text-muted">{r.count.toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-6 max-w-3xl divide-y divide-line border-y border-line">
        {reviews.map((r) => (
          <li key={r.id} className="py-4">
            <div className="flex items-center gap-2">
              <Stars value={r.star} />
              <h3 className="font-sans text-sm font-bold text-ink">{r.title}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink">{r.body}</p>
            <p className="mt-2 text-xs text-muted">{r.name} (sample review)</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
