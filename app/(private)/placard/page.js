import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listarPrendas } from "@/lib/data/prendas";
import { filtrarPrendas } from "@/lib/prendas";
import FiltrosPlacard from "@/components/placard/FiltrosPlacard";
import PrendaCard from "@/components/placard/PrendaCard";

export const metadata = {
  title: "Mi placard",
};

// En Next.js 16 searchParams es una Promise. Los filtros viven en la URL.
export default async function PlacardPage({ searchParams }) {
  const user = await requireUser();
  const params = await searchParams;

  const prendas = await listarPrendas(user.uid);
  const visibles = filtrarPrendas(prendas, params);
  const colores = [...new Set(prendas.map((p) => p.color.nombre))].sort();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Mi placard</h1>
        <Link
          href="/placard/nueva"
          className="rounded-full bg-foreground px-5 py-2.5 font-medium text-background hover:opacity-90"
        >
          Agregar prenda
        </Link>
      </div>

      {prendas.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border p-8">
          <h2 className="text-xl font-semibold">Tu placard está vacío</h2>
          <p className="text-muted">
            Cargá tus prendas y armamos el outfit del día con lo que tenés.
          </p>
          <Link
            href="/placard/nueva"
            className="rounded-full bg-foreground px-5 py-2.5 font-medium text-background"
          >
            Cargar la primera prenda
          </Link>
        </div>
      ) : (
        <>
          <FiltrosPlacard params={params} colores={colores} />

          <p className="text-sm text-muted" aria-live="polite">
            {visibles.length} de {prendas.length}{" "}
            {prendas.length === 1 ? "prenda" : "prendas"}
          </p>

          {visibles.length === 0 ? (
            <p className="rounded-2xl border border-border p-8 text-muted">
              Ninguna prenda coincide con esos filtros.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {visibles.map((prenda) => (
                <PrendaCard key={prenda.id} prenda={prenda} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
