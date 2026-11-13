// Pide el pronóstico, el placard y la paleta en el servidor, corre el motor y
// muestra el outfit. Va envuelto en <Suspense> en /hoy, así la página no espera
// a Open-Meteo.
import Link from "next/link";
import { condicionPaleta, getPronostico, resumirVentana } from "@/lib/clima";
import { recomendar } from "@/lib/recomendar";
import { listarPrendas } from "@/lib/data/prendas";
import { getPaletaOpcional } from "@/lib/data/paletas";
import { nombreClima } from "@/lib/paletas";
import ClimaResumen from "@/components/clima/ClimaResumen";
import OutfitSugerido from "@/components/outfit/OutfitSugerido";
import RecomendacionGenerica from "@/components/outfit/RecomendacionGenerica";
import PaletaSwatch from "@/components/paletas/PaletaSwatch";
import TemaPaleta from "@/components/paletas/TemaPaleta";

export default async function OutfitDelDia({ user, ubicacion, desde, hasta }) {
  let pronostico;
  try {
    pronostico = await getPronostico(ubicacion.lat, ubicacion.lon);
  } catch {
    return (
      <Aviso>
        No pudimos traer el pronóstico en este momento. Probá de nuevo en un
        rato.
      </Aviso>
    );
  }

  const clima = resumirVentana(pronostico, desde, hasta);
  if (!clima) return <Aviso>No hay datos del clima para ese horario.</Aviso>;

  // La paleta sale de la condición del clima (sol, lluvia, noche...). Si
  // todavía no está cargada en Firestore, seguimos sin paleta: el motor la
  // toma como opcional y la pantalla no se tiñe.
  const condicion = condicionPaleta(clima);
  const [prendas, paleta] = await Promise.all([
    listarPrendas(user.uid),
    getPaletaOpcional(condicion),
  ]);

  const perfil = { sensibilidad: user.sensibilidad, ajusteTermico: user.ajusteTermico };
  const recomendacion = recomendar({ clima, perfil, prendas, paleta });

  return (
    <TemaPaleta paleta={paleta}>
      {prendas.length === 0 ? (
        <>
          <RecomendacionGenerica recomendacion={recomendacion} logueado />
          <p className="rounded-2xl border border-dashed border-border bg-background p-5 text-muted">
            Todavía no cargaste ropa.{" "}
            <Link href="/placard/nueva" className="font-semibold text-foreground underline">
              Cargá tu primera prenda
            </Link>{" "}
            y el outfit va a salir de tu placard.
          </p>
        </>
      ) : (
        <OutfitSugerido recomendacion={recomendacion} />
      )}

      <ClimaResumen
        clima={clima}
        actual={pronostico.current}
        desde={desde}
        hasta={hasta}
      />

      {paleta && <PaletaDelDia paleta={paleta} condicion={condicion} />}
    </TemaPaleta>
  );
}

// Qué paleta se usó hoy y por qué, con link a la página pública.
function PaletaDelDia({ paleta, condicion }) {
  return (
    <section
      aria-labelledby="titulo-paleta"
      className="flex flex-col gap-2 rounded-2xl border border-border bg-background p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2
          id="titulo-paleta"
          className="text-sm font-semibold uppercase tracking-wide text-muted"
        >
          Paleta del día
        </h2>
        <p className="text-sm text-muted">{nombreClima(condicion)}</p>
      </div>
      <PaletaSwatch colores={paleta.colores} />
      <p className="text-sm text-muted">
        {paleta.nombre}.{" "}
        <Link
          href={`/paletas/${condicion}`}
          className="font-semibold text-foreground underline"
        >
          Ver la paleta
        </Link>
      </p>
    </section>
  );
}

function Aviso({ children }) {
  return (
    <p role="status" className="rounded-2xl border border-border p-5 text-muted">
      {children}
    </p>
  );
}
