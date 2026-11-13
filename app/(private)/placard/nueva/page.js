import { crearPrenda } from "@/lib/actions/prendas";
import PrendaForm from "@/components/placard/PrendaForm";

export const metadata = {
  title: "Nueva prenda",
};

export default function NuevaPrendaPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Nueva prenda</h1>
      <PrendaForm accion={crearPrenda} />
    </section>
  );
}
