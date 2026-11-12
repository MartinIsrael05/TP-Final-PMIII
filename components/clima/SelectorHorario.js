"use client"; // Cambia la URL cuando el usuario elige otro horario.

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const HORAS = Array.from({ length: 24 }, (_, i) => i);

export default function SelectorHorario({ desde, hasta }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function cambiar(campo, valor) {
    const params = new URLSearchParams(searchParams);
    params.set(campo, valor);
    router.push(`${pathname}?${params}`, { scroll: false });
  }

  const claseSelect =
    "rounded-lg border border-border bg-background px-2 py-1.5 font-medium outline-none focus:border-foreground";

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      <label htmlFor="hora-desde" className="text-muted">
        Salgo a las
      </label>
      <select
        id="hora-desde"
        value={desde}
        onChange={(e) => cambiar("desde", e.target.value)}
        className={claseSelect}
      >
        {/* No se puede salir a la misma hora o después de volver */}
        {HORAS.map((h) => (
          <option key={h} value={h} disabled={h >= hasta}>
            {h}:00
          </option>
        ))}
      </select>

      <label htmlFor="hora-hasta" className="text-muted">
        y vuelvo a las
      </label>
      <select
        id="hora-hasta"
        value={hasta}
        onChange={(e) => cambiar("hasta", e.target.value)}
        className={claseSelect}
      >
        {HORAS.map((h) => (
          <option key={h} value={h} disabled={h <= desde}>
            {h}:00
          </option>
        ))}
      </select>
    </div>
  );
}
