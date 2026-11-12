import { requireUser } from "@/lib/auth/session";

export const metadata = {
  title: "Hoy",
};

// Página provisoria: en la fase 6 acá va el outfit del día.
export default async function HoyPage() {
  const user = await requireUser();
  const saludo = user.nombre ? `Hola, ${user.nombre}` : "Hola";

  return (
    <section className="flex flex-col gap-4 py-10">
      <h1 className="text-3xl font-bold">{saludo}</h1>
      <p className="text-muted">
        Ya iniciaste sesión. Muy pronto vas a ver acá el outfit del día armado
        con tu placard.
      </p>
    </section>
  );
}
