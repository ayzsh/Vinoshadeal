import { Star } from "lucide-react";

// Sample text only. Replace with real customer reviews once you have them.
const reviews = [
  { name: "Sample Customer A", city: "Lucknow", text: "Sample review: quick delivery and the product matched the photos.", rating: 5 },
  { name: "Sample Customer B", city: "Gorakhpur", text: "Sample review: good prices and easy checkout.", rating: 4 },
  { name: "Sample Customer C", city: "Kanpur", text: "Sample review: simple return process and helpful support.", rating: 5 },
];

export default function Reviews() {
  return (
    <section aria-labelledby="reviews" className="container-page pt-10">
      <h2 id="reviews" className="section-title">
        What shoppers say
      </h2>
      <ul className="mt-4 grid gap-4 md:grid-cols-3">
        {reviews.map((r) => (
          <li key={r.name} className="card p-5">
            <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < r.rating ? "fill-gold text-gold" : "text-line"}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="mt-3 text-sm text-ink">{r.text}</p>
            <p className="mt-4 text-sm font-semibold text-heading">{r.name}</p>
            <p className="text-xs text-muted">{r.city}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
