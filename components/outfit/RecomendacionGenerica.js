// Recomendación en texto para quien no tiene placard cargado (o no está
// logueado). Server Component: recibe el resultado de recomendar() y lo dibuja.
import Link from "next/link";
import Alertas from "@/components/clima/Alertas";

export default function RecomendacionGenerica({ recomendacion, logueado }) {
  const { tempEfectiva, nivel, textoGenerico, alertas } = recomendacion;

  return (
    <article className="flex flex-col gap-5 rounded-2xl bg-foreground p-5 text-background sm:p-6">
      <header className="flex flex-col gap-1">
        <p className="text-sm opacity-70">
          {/* tempEfectiva ya incluye la sensibilidad del perfil */}
          Para vos se siente como {Math.round(tempEfectiva)}° · {nivel.nombre}
        </p>
        <h3 className="text-sm font-semibold uppercase tracking-widest opacity-70">
          Qué ponerte hoy
        </h3>
      </header>

      <p className="text-2xl font-semibold leading-snug sm:text-3xl">{textoGenerico}</p>

      {/* Las alertas van sobre fondo claro para que se lean bien */}
      <div className="rounded-xl bg-background p-1 text-foreground empty:hidden">
        <Alertas alertas={alertas} />
      </div>

      <footer className="text-sm opacity-80">
        {logueado ? (
          <p>Muy pronto vas a poder cargar tu placard y el outfit va a salir de tu propia ropa.</p>
        ) : (
          <p>
            <Link href="/registro" className="font-semibold underline">
              Creá tu cuenta
            </Link>{" "}
            y cargá tu placard: te armamos el outfit con tu propia ropa.
          </p>
        )}
      </footer>
    </article>
  );
}
