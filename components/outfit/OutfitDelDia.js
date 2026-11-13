// Pide el pronóstico y el placard en el servidor, corre el motor y muestra el
// outfit. Va envuelto en <Suspense> en /hoy, así la página no espera a Open-Meteo.
import Link from "next/link";
import { getPronostico, resumirVentana } from "@/lib/clima";
import { recomendar } from "@/lib/recomendar";
import { listarPrendas } from "@/lib/data/prendas";
import ClimaResumen from "@/components/clima/ClimaResumen";
import OutfitSugerido from "@/components/outfit/OutfitSugerido";
import RecomendacionGenerica from "@/components/outfit/RecomendacionGenerica";

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

  const prendas = await listarPrendas(user.uid);
  const perfil = { sensibilidad: user.sensibilidad, ajusteTermico: user.ajusteTermico };
  // La paleta del día se suma en la fase de paletas.
  const recomendacion = recomendar({ clima, perfil, prendas });

  return (
    <div className="flex flex-col gap-4">
      {prendas.length === 0 ? (
        <>
          <RecomendacionGenerica recomendacion={recomendacion} logueado />
          <p className="rounded-2xl border border-dashed border-border p-5 text-muted">
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
    </div>
  );
}

function Aviso({ children }) {
  return (
    <p role="status" className="rounded-2xl border border-border p-5 text-muted">
      {children}
    </p>
  );
}
