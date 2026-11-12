import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { destinoSeguro } from "@/lib/auth/destino";
import RegistroForm from "@/components/auth/RegistroForm";

export const metadata = {
  title: "Crear cuenta",
  description:
    "Creá tu cuenta en PILCHA, cargá tu placard y recibí el outfit del día según el clima.",
};

export default async function RegistroPage({ searchParams }) {
  const { next } = await searchParams;
  const destino = destinoSeguro(next);

  const user = await getCurrentUser();
  if (user) redirect(destino);

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-8 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Creá tu cuenta</h1>
        <p className="text-muted">
          Cargá tu ropa una vez y dejá que el clima decida por vos.
        </p>
      </div>

      <RegistroForm next={destino} />

      <p className="text-center text-sm text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(destino)}`}
          className="font-medium text-foreground underline"
        >
          Ingresá
        </Link>
      </p>
    </section>
  );
}
