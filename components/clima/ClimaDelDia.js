// Pide el pronóstico en el servidor y muestra el resumen.
// Va envuelto en <Suspense>, así el resto de la página no espera a Open-Meteo.
import { getPronostico, resumirVentana } from "@/lib/clima";
import ClimaResumen from "@/components/clima/ClimaResumen";

export default async function ClimaDelDia({ ubicacion, desde, hasta }) {
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

  return (
    <ClimaResumen
      clima={clima}
      actual={pronostico.current}
      desde={desde}
      hasta={hasta}
    />
  );
}

function Aviso({ children }) {
  return (
    <p role="status" className="rounded-2xl border border-border p-5 text-muted">
      {children}
    </p>
  );
}
