/**
 * Vinoshadeal wordmark. Keeps the Vinosha Group "V" with a dot motif.
 * variant="onDark"  -> for the purple header/footer (white text, lilac dot)
 * variant="onLight" -> for white backgrounds (purple text, purple dot)
 */
export default function Logo({
  variant = "onLight",
  className = "",
}: {
  variant?: "onDark" | "onLight";
  className?: string;
}) {
  const dark = variant === "onDark";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="Vinoshadeal">
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
        {/* red stylised V */}
        <path d="M2 5h10.5L21 30.5 27.5 14H32L22.5 38h-4.8L2 5z" fill="#FF3333" />
        {/* dot */}
        <circle cx="31.5" cy="7" r="4.6" fill={dark ? "#C4A3F5" : "#330066"} />
      </svg>
      <span className="font-heading text-2xl font-bold leading-none tracking-tight">
        <span className={dark ? "text-white" : "text-heading"}>Vinosha</span>
        <span className={dark ? "text-[#FF6B6B]" : "text-redtext"}>deal</span>
      </span>
    </span>
  );
}
