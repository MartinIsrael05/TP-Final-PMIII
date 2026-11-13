// Tarjeta de una prenda en el listado. Server Component: solo muestra datos.
import Link from "next/link";
import Image from "next/image";
import { CATEGORIAS, NIVELES_ABRIGO } from "@/lib/prendas";

export default function PrendaCard({ prenda }) {
  return (
    <li>
      <Link
        href={`/placard/${prenda.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border transition hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <div
          className="relative flex aspect-square items-center justify-center"
          style={{ backgroundColor: prenda.color.hex }}
        >
          {prenda.imagenUrl && (
            <Image
              src={prenda.imagenUrl}
              alt={prenda.nombre}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <h2 className="font-semibold leading-tight">{prenda.nombre}</h2>
          <p className="text-sm text-muted">
            {CATEGORIAS[prenda.categoria]} · {prenda.color.nombre}
          </p>
          <p className="text-sm text-muted">
            Abrigo {prenda.abrigo} ({NIVELES_ABRIGO[prenda.abrigo].toLowerCase()})
            {prenda.impermeable && " · Impermeable"}
          </p>
          <p className="mt-auto pt-2 text-xs text-muted">
            {prenda.usos === 0
              ? "Todavía no la usaste"
              : `Usada ${prenda.usos} ${prenda.usos === 1 ? "vez" : "veces"}`}
          </p>
        </div>
      </Link>
    </li>
  );
}
