// Filtros, búsqueda y orden del placard. Es un formulario GET común: al
// enviarlo, el navegador va a /placard?q=...&categoria=... y la página (que
// es de servidor) filtra con esos parámetros. No necesita JavaScript ni estado.
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { CATEGORIAS, NIVELES_ABRIGO } from "@/lib/prendas";

export default function FiltrosPlacard({ params, colores }) {
  const hayFiltros = Object.values(params).some(Boolean);

  return (
    <form
      method="GET"
      action="/placard"
      className="grid gap-3 rounded-2xl border border-border p-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <Input
        id="q"
        name="q"
        type="search"
        label="Buscar por nombre"
        defaultValue={params.q ?? ""}
        className="lg:col-span-2"
      />
      <Select
        id="categoria"
        name="categoria"
        label="Categoría"
        defaultValue={params.categoria ?? ""}
      >
        <option value="">Todas</option>
        {Object.entries(CATEGORIAS).map(([valor, texto]) => (
          <option key={valor} value={valor}>
            {texto}
          </option>
        ))}
      </Select>
      <Select id="color" name="color" label="Color" defaultValue={params.color ?? ""}>
        <option value="">Todos</option>
        {colores.map((nombre) => (
          <option key={nombre} value={nombre}>
            {nombre}
          </option>
        ))}
      </Select>
      <Select
        id="abrigo"
        name="abrigo"
        label="Nivel de abrigo"
        defaultValue={params.abrigo ?? ""}
      >
        <option value="">Todos</option>
        {Object.entries(NIVELES_ABRIGO).map(([valor, texto]) => (
          <option key={valor} value={valor}>
            {valor} · {texto}
          </option>
        ))}
      </Select>
      <Select id="orden" name="orden" label="Ordenar por" defaultValue={params.orden ?? ""}>
        <option value="">Más recientes</option>
        <option value="usadas">Más usadas</option>
      </Select>

      <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-4">
        <Button type="submit">Aplicar</Button>
        {hayFiltros && (
          <Link href="/placard" className="py-2.5 text-sm font-medium hover:underline">
            Limpiar filtros
          </Link>
        )}
      </div>
    </form>
  );
}
