"use client"; // error.js tiene que ser cliente: recibe retry() para reintentar.

import Button from "@/components/ui/Button";

export default function Error({ retry }) {
  return (
    <section className="flex flex-col items-start gap-4 py-10">
      <h1 className="text-2xl font-bold">No pudimos mostrar las paletas</h1>
      <p className="text-muted">
        Hubo un problema al cargarlas. Probá de nuevo en un rato.
      </p>
      <Button onClick={() => retry()}>Reintentar</Button>
    </section>
  );
}
