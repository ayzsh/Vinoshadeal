// Shown while a product page is loading. Matches the shape of the real page.
export default function Loading() {
  return (
    <div role="status" aria-label="Loading product" className="container-page py-4 sm:py-6">
      <div className="skeleton h-4 w-64 max-w-full rounded" />

      <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div>
          <div className="skeleton aspect-square w-full rounded-card" />
          <div className="mt-3 flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 w-16 rounded-field" />
            ))}
          </div>
        </div>

        <div>
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton mt-3 h-8 w-4/5 rounded" />
          <div className="skeleton mt-4 h-5 w-32 rounded" />
          <div className="skeleton mt-5 h-9 w-48 rounded" />
          <div className="skeleton mt-5 h-10 w-full rounded-field" />
          <div className="mt-6 flex gap-3">
            <div className="skeleton h-12 flex-1 rounded-field" />
            <div className="skeleton h-12 flex-1 rounded-field" />
          </div>
          <div className="skeleton mt-6 h-28 w-full rounded-card" />
        </div>
      </div>

      <div className="skeleton mt-10 h-6 w-48 rounded" />
      <div className="skeleton mt-3 h-20 w-full max-w-3xl rounded" />
    </div>
  );
}
