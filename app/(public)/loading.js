export default function Loading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <p className="sr-only">Cargando…</p>
      <div className="h-12 w-72 max-w-full animate-pulse rounded bg-border" />
      <div className="h-5 w-full max-w-xl animate-pulse rounded bg-border" />
      <div className="h-40 w-full animate-pulse rounded-2xl bg-border" />
    </div>
  );
}
