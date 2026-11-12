// Lugar reservado mientras llega el pronóstico.
export default function ClimaSkeleton() {
  return (
    <div
      aria-busy="true"
      className="flex flex-col gap-6 rounded-2xl border border-border p-5 sm:p-6"
    >
      <p className="sr-only">Cargando el clima…</p>
      <div className="h-7 w-48 animate-pulse rounded bg-border" />
      <div className="h-16 w-32 animate-pulse rounded bg-border" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-20 animate-pulse rounded-xl bg-border" />
        <div className="h-20 animate-pulse rounded-xl bg-border" />
        <div className="h-20 animate-pulse rounded-xl bg-border" />
      </div>
      <div className="h-24 animate-pulse rounded-xl bg-border" />
    </div>
  );
}
