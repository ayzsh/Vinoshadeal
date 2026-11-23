/**
 * Marks a fact we do not know yet (a real company name, a time limit, a legal wording...).
 * It is shown on purpose, so nobody mistakes a gap for a decision. Before launch, search the
 * pages for "to be confirmed" and replace each one with the real text.
 */
export default function Tbc({ children }: { children?: React.ReactNode }) {
  return (
    <span className="rounded border border-dashed border-line bg-tint px-1.5 py-0.5 text-sm font-semibold text-ink">
      [to be confirmed{children ? <>: {children}</> : null}]
    </span>
  );
}
