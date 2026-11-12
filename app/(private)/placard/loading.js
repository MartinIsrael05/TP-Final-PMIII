export default function Loading() {
  return (
    <section className="flex flex-col gap-6" aria-busy="true">
      <p className="sr-only">Cargando tu placard…</p>
      <div className="h-9 w-48 animate-pulse rounded bg-border" />
      <div className="h-28 w-full animate-pulse rounded-2xl bg-border" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-border" />
        ))}
      </div>
    </section>
  );
}
