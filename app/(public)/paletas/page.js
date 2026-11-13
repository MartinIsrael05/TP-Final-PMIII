// Listado público de las paletas. Server Component: lee Firestore y dibuja.
import Link from "next/link";
import { listarPaletasOpcional } from "@/lib/data/paletas";
import { nombreArmonia, nombreClima, resumenClima } from "@/lib/paletas";
import PaletaSwatch from "@/components/paletas/PaletaSwatch";

export const metadata = {
  title: "Paletas",
  description:
    "Las paletas de colores de PILCHA: una por cada condición del clima, con la armonía que sigue cada una.",
  alternates: { canonical: "/paletas" },
  openGraph: {
    title: "Paletas | PILCHA",
    description:
      "Una paleta por cada condición del clima, con la armonía de color que sigue cada una.",
    url: "/paletas",
    type: "website",
  },
};

// Las paletas casi no cambian (las edita el admin), así que la página se
// prerenderiza y se revalida una vez por hora.
export const revalidate = 3600;

export default async function PaletasPage() {
  const paletas = await listarPaletasOpcional();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
          Paletas del día
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          Cada condición del clima tiene su paleta. PILCHA la usa para elegir,
          entre las prendas que te sirven, las que mejor combinan con el día y
          entre sí.
        </p>
      </section>

      {paletas.length === 0 ? (
        <p role="status" className="rounded-2xl border border-dashed border-border p-5 text-muted">
          Todavía no hay paletas cargadas. Se cargan con{" "}
          <code className="font-mono text-foreground">npm run seed</code>.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {paletas.map((paleta) => (
            <li key={paleta.id}>
              <Link
                href={`/paletas/${paleta.clima}`}
                className="flex h-full flex-col gap-3 rounded-2xl border border-border p-4 transition hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                <PaletaSwatch colores={paleta.colores} />
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold">{paleta.nombre}</h2>
                  <p className="text-sm font-medium uppercase tracking-wide text-muted">
                    {nombreClima(paleta.clima)} · {nombreArmonia(paleta.armonia)}
                  </p>
                  <p className="text-muted">{resumenClima(paleta.clima)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
