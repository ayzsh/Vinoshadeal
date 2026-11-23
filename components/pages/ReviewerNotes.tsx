import { CONTENT_IS_DRAFT } from "@/lib/site";

/** A checklist for whoever reviews the page. Shown only while CONTENT_IS_DRAFT is true. */
export default function ReviewerNotes({ items }: { items: string[] }) {
  if (!CONTENT_IS_DRAFT) return null;
  return (
    <aside aria-labelledby="reviewer-notes" className="rounded-card border border-dashed border-line bg-tint p-4">
      <h2 id="reviewer-notes" className="font-heading text-base font-bold text-heading">
        Notes for the reviewer
      </h2>
      <p className="mt-1 text-xs text-muted">Shown only while this page is a draft.</p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </aside>
  );
}
