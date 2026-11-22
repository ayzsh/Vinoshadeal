/** Placeholder shown while a category or search page loads. */
export default function ListingSkeleton() {
  return (
    <div className="container-page py-6" aria-busy="true" aria-label="Loading products">
      <div className="skeleton h-4 w-48" />
      <div className="skeleton mt-4 h-8 w-64" />
      <div className="mt-6 lg:grid lg:grid-cols-[16rem_1fr] lg:gap-8">
        <div className="card hidden h-96 lg:block" />
        <div>
          <div className="skeleton h-10 w-full" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton aspect-square !rounded-none" />
                <div className="space-y-2 p-3">
                  <div className="skeleton h-3 w-1/3" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
