import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { destinoSeguro } from "@/lib/auth/destino";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Ingresar",
  description: "Ingresá a PILCHA para ver el outfit del día con tu placard.",
};

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  const destino = destinoSeguro(next);

  // Si ya tiene una sesión válida, no tiene sentido mostrarle el login.
  const user = await getCurrentUser();
  if (user) redirect(destino);

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-8 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Ingresá a PILCHA</h1>
        <p className="text-muted">Tu placard y el clima te están esperando.</p>
      </div>

      <LoginForm next={destino} />

      <p className="text-center text-sm text-muted">
        ¿No tenés cuenta?{" "}
        <Link
          href={`/registro?next=${encodeURIComponent(destino)}`}
          className="font-medium text-foreground underline"
        >
          Creá una
        </Link>
      </p>
    </section>
  );
}
