export const metadata = {
  // absolute evita que el template del layout agregue " | PILCHA" otra vez
  title: { absolute: "PILCHA | Qué ponerte hoy según el clima" },
};

export default function HomePage() {
  return (
    <section className="flex flex-col gap-6 py-10">
      <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
        ¿Qué me pongo hoy?
      </h1>
      <p className="max-w-2xl text-lg text-muted">
        PILCHA mira el pronóstico entre la hora en que salís y la hora en que
        volvés, y te arma el outfit del día con la ropa de tu propio placard.
        Además te sugiere una paleta de colores que combina con el día.
      </p>
      <p className="text-sm text-muted">
        Estamos en construcción. Muy pronto vas a poder ver la recomendación
        para tu ubicación acá mismo.
      </p>
    </section>
  );
}
