export default function Loading() {
  return (
    <section className="flex flex-col gap-4 py-10" aria-busy="true">
      <p className="sr-only">Cargando…</p>
      <div className="h-9 w-56 animate-pulse rounded bg-border" />
      <div className="h-5 w-full max-w-md animate-pulse rounded bg-border" />
    </section>
  );
}
