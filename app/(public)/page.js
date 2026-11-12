import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { leerHorario, leerUbicacion } from "@/lib/ubicacion";
import SelectorUbicacion from "@/components/clima/SelectorUbicacion";
import SelectorHorario from "@/components/clima/SelectorHorario";
import ClimaDelDia from "@/components/clima/ClimaDelDia";
import ClimaSkeleton from "@/components/clima/ClimaSkeleton";

export const metadata = {
  // absolute evita que el template del layout agregue " | PILCHA" otra vez
  title: { absolute: "PILCHA | Qué ponerte hoy según el clima" },
};

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const user = await getCurrentUser();

  // Prioridad: la ubicación de la URL; si no hay, la ciudad del perfil.
  const ubicacion = leerUbicacion(params) ?? user?.ciudad ?? null;
  const horarioPerfil = user
    ? { desde: user.horaSalida, hasta: user.horaVuelta }
    : undefined;
  const { desde, hasta } = leerHorario(params, horarioPerfil);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
          ¿Qué me pongo hoy?
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          PILCHA mira el pronóstico entre la hora en que salís y la hora en que
          volvés, y te arma el outfit del día con la ropa de tu propio placard.
        </p>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="titulo-clima">
        <h2 id="titulo-clima" className="text-xl font-bold">
          El clima de tu día
        </h2>

        <SelectorUbicacion ubicacionActual={ubicacion} />

        {ubicacion && (
          <>
            <SelectorHorario desde={desde} hasta={hasta} />
            {/* key: al cambiar la ubicación o el horario se vuelve a mostrar
                el skeleton mientras llega el nuevo pronóstico */}
            <Suspense
              key={`${ubicacion.lat},${ubicacion.lon},${desde},${hasta}`}
              fallback={<ClimaSkeleton />}
            >
              <ClimaDelDia ubicacion={ubicacion} desde={desde} hasta={hasta} />
            </Suspense>
          </>
        )}
      </section>
    </div>
  );
}
