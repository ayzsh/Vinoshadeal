/** One titled block of a static page. Put paragraphs and lists inside. */
export default function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="font-heading text-lg font-bold text-heading">
        {title}
      </h2>
      <div className="mt-2 space-y-3 text-ink">{children}</div>
    </section>
  );
}
