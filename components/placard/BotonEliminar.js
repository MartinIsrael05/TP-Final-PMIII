"use client"; // Pide confirmación en el navegador y muestra el estado "Eliminando…".

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import { eliminarPrenda } from "@/lib/actions/prendas";

export default function BotonEliminar({ id, nombre }) {
  const [confirmando, setConfirmando] = useState(false);
  const [pendiente, startTransition] = useTransition();

  function eliminar() {
    startTransition(async () => {
      await eliminarPrenda(id);
    });
  }

  if (!confirmando) {
    return (
      <Button variante="secundario" onClick={() => setConfirmando(true)}>
        Eliminar prenda
      </Button>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-label={`Confirmar baja de ${nombre}`}
      className="flex flex-col gap-3 rounded-2xl border border-red-500 p-4"
    >
      <p className="text-sm">
        ¿Seguro que querés eliminar <strong>{nombre}</strong>? No se puede
        deshacer.
      </p>
      <div className="flex gap-3">
        <Button
          onClick={eliminar}
          disabled={pendiente}
          className="bg-red-600! text-white!"
        >
          {pendiente ? "Eliminando…" : "Sí, eliminar"}
        </Button>
        <Button
          variante="secundario"
          onClick={() => setConfirmando(false)}
          disabled={pendiente}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
