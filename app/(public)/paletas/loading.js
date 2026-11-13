export default function Loading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-8">
      <p className="sr-only">Cargando las paletas…</p>
      <div className="flex flex-col gap-3">
        <div className="h-12 w-72 max-w-full animate-pulse rounded bg-border" />
        <div className="h-6 w-full max-w-xl animate-pulse rounded bg-border" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-2xl bg-border" />
        ))}
      </div>
    </div>
  );
}
