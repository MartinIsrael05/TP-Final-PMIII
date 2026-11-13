// Detalle de una paleta. La metadata es dinámica: el título, la descripción
// y la imagen de Open Graph (opengraph-image.js) salen de la paleta.
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPaletaOpcional } from "@/lib/data/paletas";
import {
  CLAVES_CLIMA,
  esClimaValido,
  explicacionArmonia,
  nombreArmonia,
  nombreClima,
  resumenClima,
} from "@/lib/paletas";
import PaletaSwatch from "@/components/paletas/PaletaSwatch";

export const revalidate = 3600;

// Las seis paletas se generan en el build; cualquier otra clave cae en
// notFound().
export function generateStaticParams() {
  return CLAVES_CLIMA.map((clima) => ({ clima }));
}

export async function generateMetadata({ params }) {
  const { clima } = await params;
  if (!esClimaValido(clima)) return {};

  const paleta = await getPaletaOpcional(clima);
  const titulo = paleta ? `${paleta.nombre} · ${nombreClima(clima)}` : nombreClima(clima);
  const descripcion = paleta?.descripcion ?? resumenClima(clima);

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/paletas/${clima}` },
    openGraph: {
      title: `${titulo} | PILCHA`,
      description: descripcion,
      url: `/paletas/${clima}`,
      type: "article",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function PaletaPage({ params }) {
  const { clima } = await params;
  if (!esClimaValido(clima)) notFound();

  const paleta = await getPaletaOpcional(clima);

  return (
    <article className="flex flex-col gap-8">
      <nav aria-label="Volver">
        <Link
          href="/paletas"
          className="text-sm font-medium text-muted underline hover:text-foreground"
        >
          Todas las paletas
        </Link>
      </nav>

      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted">
          {nombreClima(clima)}
        </p>
        <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
          {paleta?.nombre ?? nombreClima(clima)}
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          {paleta?.descripcion ?? resumenClima(clima)}
        </p>
      </header>

      {paleta ? (
        <>
          <PaletaSwatch colores={paleta.colores} tamano="grande" />

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1 rounded-2xl border border-border p-5">
              <dt className="text-sm font-medium uppercase tracking-wide text-muted">
                Armonía
              </dt>
              <dd className="text-xl font-bold">{nombreArmonia(paleta.armonia)}</dd>
              <dd className="text-muted">{explicacionArmonia(paleta.armonia)}</dd>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-border p-5">
              <dt className="text-sm font-medium uppercase tracking-wide text-muted">
                Cuándo aparece
              </dt>
              <dd className="text-muted">{resumenClima(clima)}</dd>
            </div>
          </dl>
        </>
      ) : (
        <p role="status" className="rounded-2xl border border-dashed border-border p-5 text-muted">
          Esta paleta todavía no está cargada. Se carga con{" "}
          <code className="font-mono text-foreground">npm run seed</code>.
        </p>
      )}

      <p className="text-muted">
        <Link href="/hoy" className="font-semibold text-foreground underline">
          Mirá tu outfit de hoy
        </Link>{" "}
        y, si el clima es este, la pantalla se va a teñir con estos colores.
      </p>
    </article>
  );
}
