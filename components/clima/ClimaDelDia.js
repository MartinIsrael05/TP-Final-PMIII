// Pide el pronóstico en el servidor, arma la recomendación y muestra las dos.
// Va envuelto en <Suspense>, así el resto de la página no espera a Open-Meteo.
import { getPronostico, resumirVentana } from "@/lib/clima";
import { recomendar } from "@/lib/recomendar";
import ClimaResumen from "@/components/clima/ClimaResumen";
import RecomendacionGenerica from "@/components/outfit/RecomendacionGenerica";

export default async function ClimaDelDia({ ubicacion, desde, hasta, perfil, logueado }) {
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
  if (!clima) {
    return <Aviso>No hay datos del clima para ese horario.</Aviso>;
  }

  // Sin placard todavía: el motor devuelve la recomendación genérica.
  const recomendacion = recomendar({ clima, perfil });

  return (
    <div className="flex flex-col gap-4">
      <RecomendacionGenerica recomendacion={recomendacion} logueado={logueado} />
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
