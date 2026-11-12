import Link from "next/link";

export const metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return (
    <section className="flex flex-col items-start gap-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-widest text-muted">
        Error 404
      </p>
      <h1 className="text-3xl font-bold">Esta página no está en el placard</h1>
      <p className="text-muted">
        Puede que el link esté mal escrito o que lo que buscás ya no exista.
      </p>
      <Link
        href="/"
        className="rounded-full bg-foreground px-5 py-2 font-medium text-background"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
