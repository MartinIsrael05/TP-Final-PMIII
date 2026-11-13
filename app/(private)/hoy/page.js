import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";
import { leerHorario, leerUbicacion } from "@/lib/ubicacion";
import SelectorUbicacion from "@/components/clima/SelectorUbicacion";
import SelectorHorario from "@/components/clima/SelectorHorario";
import ClimaSkeleton from "@/components/clima/ClimaSkeleton";
import OutfitDelDia from "@/components/outfit/OutfitDelDia";

export const metadata = {
  title: "Hoy",
};

// Igual que la portada: la ubicación y el horario viajan en la URL. Si no
// hay, se usan la ciudad y el horario del perfil.
export default async function HoyPage({ searchParams }) {
  const user = await requireUser();
  const params = await searchParams;

  const ubicacion = leerUbicacion(params) ?? user.ciudad ?? null;
  const { desde, hasta } = leerHorario(params, {
    desde: user.horaSalida,
    hasta: user.horaVuelta,
  });

  const saludo = user.nombre ? `Hola, ${user.nombre}` : "Hola";

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">{saludo}</h1>
        <p className="text-muted">Esto es lo que te recomendamos ponerte hoy.</p>
      </div>

      <SelectorUbicacion ubicacionActual={ubicacion} />

      {ubicacion && (
        <>
          <SelectorHorario desde={desde} hasta={hasta} />
          {/* key: al cambiar ubicación u horario vuelve el skeleton */}
          <Suspense
            key={`${ubicacion.lat},${ubicacion.lon},${desde},${hasta}`}
            fallback={<ClimaSkeleton />}
          >
            <OutfitDelDia
              user={user}
              ubicacion={ubicacion}
              desde={desde}
              hasta={hasta}
            />
          </Suspense>
        </>
      )}
    </section>
  );
}
