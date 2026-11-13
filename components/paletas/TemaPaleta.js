// Tiñe un bloque de la interfaz con la paleta del día.
//
// Las variables CSS se definen acá y no en el layout de /hoy a propósito: la
// paleta depende del pronóstico, que llega dentro de <Suspense>, y el layout
// se renderiza antes de saber qué clima hace.
//
// El tinte se arma con color-mix() entre el acento de la paleta y el fondo de
// la app. Así el bloque cambia de tono según el día, pero el texto sigue
// usando --foreground sobre un fondo casi blanco (o casi negro en modo
// oscuro) y el contraste no depende de qué colores tenga la paleta.
import { colorAcento } from "@/lib/paletas";

export default function TemaPaleta({ paleta, children }) {
  const acento = colorAcento(paleta?.colores) ?? "var(--foreground)";

  const estilo = {
    "--paleta-acento": acento,
    backgroundColor: "color-mix(in srgb, var(--paleta-acento) 8%, var(--background))",
    borderColor: "color-mix(in srgb, var(--paleta-acento) 30%, var(--background))",
  };

  return (
    <div
      style={estilo}
      className="flex flex-col gap-4 rounded-2xl border p-3 sm:p-4"
    >
      {children}
    </div>
  );
}
