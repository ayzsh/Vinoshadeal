import { Info } from "lucide-react";
import Breadcrumbs from "@/components/listing/Breadcrumbs";
import { CONTENT_IS_DRAFT } from "@/lib/site";

/** Frame for the static pages: breadcrumbs, title, intro, the draft note(s), then the page content. */
export default function PageShell({
  title,
  crumb,
  intro,
  legal = false,
  children,
}: {
  title: string;
  /** short name for the breadcrumb */
  crumb?: string;
  intro?: string;
  /** true for Privacy, Terms and the other policy pages: adds the "not legal advice" note while in draft */
  legal?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-6 pb-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: crumb ?? title }]} />
      <div className="max-w-3xl">
        <h1 className="mt-3 font-heading text-2xl font-bold text-heading sm:text-3xl">{title}</h1>
        {intro && <p className="mt-2 text-base text-muted">{intro}</p>}

        {CONTENT_IS_DRAFT && (
          <div
            role="note"
            className="mt-4 flex items-start gap-2 rounded-field border border-line bg-tint px-4 py-3 text-sm font-semibold text-ink"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              Draft: this page is being reviewed and may change before launch.
              {legal
                ? " It is a working draft, not legal advice, and a lawyer must review it before it is used."
                : ""}
            </p>
          </div>
        )}

        <div className="mt-6 space-y-8">{children}</div>
      </div>
    </div>
  );
}
