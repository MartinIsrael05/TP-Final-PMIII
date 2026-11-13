// Outfit armado con prendas del placard. Server Component: solo dibuja el
// resultado de recomendar(). Si una categoría no tiene prenda que sirva,
// muestra el texto genérico de esa categoría.
import Link from "next/link";
import Image from "next/image";
import Alertas from "@/components/clima/Alertas";
import { CATEGORIAS } from "@/lib/prendas";

export default function OutfitSugerido({ recomendacion }) {
  const { tempEfectiva, nivel, outfit, alertas } = recomendacion;
  const faltan = outfit.filter((item) => !item.prenda && !item.opcional);

  return (
    <article className="flex flex-col gap-5 rounded-2xl bg-foreground p-5 text-background sm:p-6">
      <header className="flex flex-col gap-1">
        <p className="text-sm opacity-70">
          Para vos se siente como {Math.round(tempEfectiva)}° · {nivel.nombre}
        </p>
        <h2 className="text-sm font-semibold uppercase tracking-widest opacity-70">
          Tu outfit de hoy
        </h2>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {outfit.map((item) => (
          <li
            key={item.categoria}
            className="flex items-center gap-3 rounded-xl bg-background p-3 text-foreground"
          >
            <Miniatura prenda={item.prenda} />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {CATEGORIAS[item.categoria]}
                {item.opcional && " · opcional"}
              </p>
              {item.prenda ? (
                <Link
                  href={`/placard/${item.prenda.id}`}
                  className="font-semibold hover:underline"
                >
                  {item.prenda.nombre}
                </Link>
              ) : (
                <p className="text-sm text-muted">
                  No tenés nada en tu placard para esto. Buscá {item.texto}.
                </p>
              )}
              {item.nota && <p className="text-sm text-muted">{item.nota}</p>}
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-xl bg-background p-1 text-foreground empty:hidden">
        <Alertas alertas={alertas} />
      </div>

      {faltan.length > 0 && (
        <p className="text-sm opacity-80">
          Te faltan prendas para completar el outfit.{" "}
          <Link href="/placard/nueva" className="font-semibold underline">
            Cargá más ropa
          </Link>
          .
        </p>
      )}
    </article>
  );
}

// Foto de la prenda o, si no tiene, un cuadradito con su color.
function Miniatura({ prenda }) {
  if (!prenda) {
    return (
      <div
        aria-hidden="true"
        className="size-14 shrink-0 rounded-lg border border-dashed border-border"
      />
    );
  }
  return (
    <div
      className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border"
      style={{ backgroundColor: prenda.color.hex }}
      title={prenda.color.nombre}
    >
      {prenda.imagenUrl && (
        <Image src={prenda.imagenUrl} alt="" fill sizes="56px" className="object-cover" />
      )}
    </div>
  );
}
