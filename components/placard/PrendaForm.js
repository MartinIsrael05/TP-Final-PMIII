"use client"; // Usa estado del formulario, useActionState y valida en el navegador antes de enviar.

import { useState, useActionState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import {
  CATEGORIAS,
  NIVELES_ABRIGO,
  MAX_NOMBRE,
  TIPOS_FOTO,
  validarPrenda,
  validarFoto,
} from "@/lib/prendas";

const ESTADO_INICIAL = { errores: {}, mensaje: null };

// `accion` es una Server Action (crearPrenda o editarPrenda ya con el id).
// `prenda` solo viene cuando se edita.
export default function PrendaForm({ accion, prenda = null }) {
  const [estado, formAction, pendiente] = useActionState(accion, ESTADO_INICIAL);
  const [valores, setValores] = useState({
    nombre: prenda?.nombre ?? "",
    categoria: prenda?.categoria ?? "",
    colorHex: prenda?.color.hex ?? "#1e3a5f",
    colorNombre: prenda?.color.nombre ?? "",
    abrigo: String(prenda?.abrigo ?? 2),
    impermeable: prenda?.impermeable ?? false,
  });
  const [erroresLocales, setErroresLocales] = useState({});

  // Los errores del servidor se muestran si el cliente no encontró ninguno.
  const errores = { ...estado.errores, ...erroresLocales };

  function cambiar(campo) {
    return (event) => {
      const { type, checked, value } = event.target;
      setValores((previos) => ({
        ...previos,
        [campo]: type === "checkbox" ? checked : value,
      }));
    };
  }

  // Validación en el cliente: es la misma función que usa el servidor, pero
  // acá solo sirve para avisar rápido. El servidor valida de nuevo igual.
  function handleSubmit(event) {
    const formData = new FormData(event.currentTarget);
    const { errores: nuevos } = validarPrenda(valores);
    const errorFoto = validarFoto(formData.get("foto"));
    if (errorFoto) nuevos.foto = errorFoto;

    setErroresLocales(nuevos);
    if (Object.keys(nuevos).length > 0) event.preventDefault();
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex max-w-xl flex-col gap-5"
    >
      <Input
        id="nombre"
        name="nombre"
        label="Nombre"
        maxLength={MAX_NOMBRE}
        value={valores.nombre}
        onChange={cambiar("nombre")}
        error={errores.nombre}
        placeholder="Ej: Remera lisa de algodón"
      />

      <Select
        id="categoria"
        name="categoria"
        label="Categoría"
        value={valores.categoria}
        onChange={cambiar("categoria")}
        error={errores.categoria}
      >
        <option value="">Elegí una…</option>
        {Object.entries(CATEGORIAS).map(([valor, texto]) => (
          <option key={valor} value={valor}>
            {texto}
          </option>
        ))}
      </Select>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="colorHex" className="text-sm font-medium">
            Color
          </label>
          <input
            id="colorHex"
            name="colorHex"
            type="color"
            value={valores.colorHex}
            onChange={cambiar("colorHex")}
            className="h-11 w-20 cursor-pointer rounded-lg border border-border bg-background p-1"
          />
        </div>
        <Input
          id="colorNombre"
          name="colorNombre"
          label="Nombre del color"
          maxLength={30}
          value={valores.colorNombre}
          onChange={cambiar("colorNombre")}
          error={errores.colorNombre}
          placeholder="Ej: Azul marino"
        />
      </div>
      {errores.colorHex && (
        <p className="-mt-3 text-sm text-red-600 dark:text-red-400">
          {errores.colorHex}
        </p>
      )}

      <Select
        id="abrigo"
        name="abrigo"
        label="Nivel de abrigo"
        value={valores.abrigo}
        onChange={cambiar("abrigo")}
        error={errores.abrigo}
      >
        {Object.entries(NIVELES_ABRIGO).map(([valor, texto]) => (
          <option key={valor} value={valor}>
            {valor} · {texto}
          </option>
        ))}
      </Select>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="impermeable"
          checked={valores.impermeable}
          onChange={cambiar("impermeable")}
          className="size-4"
        />
        Es impermeable
      </label>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="foto" className="text-sm font-medium">
          Foto (opcional)
        </label>
        {prenda?.imagenUrl && (
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="quitarFoto" className="size-4" />
            Quitar la foto actual
          </label>
        )}
        <input
          id="foto"
          name="foto"
          type="file"
          accept={TIPOS_FOTO.join(",")}
          aria-invalid={errores.foto ? true : undefined}
          aria-describedby={errores.foto ? "foto-error" : "foto-ayuda"}
          className="text-sm file:mr-3 file:rounded-full file:border file:border-border file:bg-background file:px-4 file:py-2 file:font-medium"
        />
        <p id="foto-ayuda" className="text-sm text-muted">
          JPG, PNG o WebP, hasta 4 MB.
          {prenda?.imagenUrl && " Si subís una nueva, reemplaza a la actual."}
        </p>
        {errores.foto && (
          <p id="foto-error" className="text-sm text-red-600 dark:text-red-400">
            {errores.foto}
          </p>
        )}
      </div>

      {estado.mensaje && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {estado.mensaje}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pendiente}>
          {pendiente ? "Guardando…" : prenda ? "Guardar cambios" : "Agregar al placard"}
        </Button>
        <Link href="/placard" className="text-sm font-medium hover:underline">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
