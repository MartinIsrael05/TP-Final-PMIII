"use client"; // error.js tiene que ser cliente: recibe retry() para reintentar.

import Button from "@/components/ui/Button";

export default function Error({ retry }) {
  return (
    <section className="flex flex-col items-start gap-4 py-10">
      <h1 className="text-2xl font-bold">Algo salió mal</h1>
      <p className="text-muted">
        No pudimos cargar esta página. Probá de nuevo en un rato.
      </p>
      {/* retry() vuelve a pedir los datos y renderiza la página otra vez */}
      <Button onClick={() => retry()}>Reintentar</Button>
    </section>
  );
}
