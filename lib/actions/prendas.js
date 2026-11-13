"use server";

// Server Actions de las prendas (alta, edición y baja).
// Regla del proyecto: cada action verifica la sesión en el servidor y
// escribe solo bajo users/{uid de la sesión}. El uid nunca viene del cliente.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { put, del } from "@vercel/blob";
import { requireUser } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { validarPrenda, validarFoto } from "@/lib/prendas";

function prendasRef(uid) {
  return getAdminDb().collection("users").doc(uid).collection("prendas");
}

// Saca los valores del FormData con los mismos nombres que usa el formulario.
function leerFormulario(formData) {
  return {
    nombre: formData.get("nombre"),
    categoria: formData.get("categoria"),
    colorHex: formData.get("colorHex"),
    colorNombre: formData.get("colorNombre"),
    abrigo: formData.get("abrigo"),
    impermeable: formData.get("impermeable") === "on",
  };
}

// Sube la foto a Vercel Blob y devuelve la URL pública.
async function subirFoto(uid, foto) {
  const blob = await put(`prendas/${uid}/${foto.name}`, foto, {
    access: "public",
    addRandomSuffix: true, // evita pisar fotos con el mismo nombre
  });
  return blob.url;
}

// Borra una foto vieja. Si falla no frenamos la operación: una foto
// huérfana en Blob molesta menos que perder el guardado de la prenda.
async function borrarFoto(url) {
  if (!url) return;
  try {
    await del(url);
  } catch (error) {
    console.error("No se pudo borrar la foto de Blob:", error);
  }
}

// Valida todo junto (datos + foto). Devuelve { errores, datos, foto }.
function validarTodo(formData) {
  const { errores, datos } = validarPrenda(leerFormulario(formData));
  const foto = formData.get("foto");
  const errorFoto = validarFoto(foto);
  if (errorFoto) errores.foto = errorFoto;
  return { errores, datos, foto: foto && foto.size > 0 ? foto : null };
}

// Estado que devuelven las actions al formulario (useActionState).
function conErrores(errores) {
  return { errores, mensaje: "Revisá los campos marcados." };
}

export async function crearPrenda(_estadoPrevio, formData) {
  const user = await requireUser();

  const { errores, datos, foto } = validarTodo(formData);
  if (Object.keys(errores).length > 0) return conErrores(errores);

  let imagenUrl = null;
  try {
    if (foto) imagenUrl = await subirFoto(user.uid, foto);
    await prendasRef(user.uid).add({
      ...datos,
      imagenUrl,
      usos: 0,
      ultimoUso: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("crearPrenda:", error);
    await borrarFoto(imagenUrl);
    return { errores: {}, mensaje: "No pudimos guardar la prenda. Probá de nuevo." };
  }

  revalidatePath("/placard");
  redirect("/placard"); // fuera del try: redirect funciona lanzando una excepción
}

export async function editarPrenda(id, _estadoPrevio, formData) {
  const user = await requireUser();

  const ref = prendasRef(user.uid).doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    return { errores: {}, mensaje: "Esa prenda ya no existe." };
  }

  const { errores, datos, foto } = validarTodo(formData);
  if (Object.keys(errores).length > 0) return conErrores(errores);

  const fotoAnterior = snap.data().imagenUrl ?? null;
  const quitarFoto = formData.get("quitarFoto") === "on";

  let imagenUrl = fotoAnterior;
  let fotoNueva = null;
  try {
    if (foto) {
      fotoNueva = await subirFoto(user.uid, foto);
      imagenUrl = fotoNueva;
    } else if (quitarFoto) {
      imagenUrl = null;
    }

    await ref.update({
      ...datos,
      imagenUrl,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("editarPrenda:", error);
    await borrarFoto(fotoNueva); // si se llegó a subir, quedó sin usar
    return { errores: {}, mensaje: "No pudimos guardar los cambios. Probá de nuevo." };
  }

  // Recién cuando se guardó, borramos la foto que ya no se usa.
  if (fotoAnterior && fotoAnterior !== imagenUrl) await borrarFoto(fotoAnterior);

  revalidatePath("/placard");
  redirect("/placard");
}

export async function eliminarPrenda(id) {
  const user = await requireUser();

  const ref = prendasRef(user.uid).doc(id);
  const snap = await ref.get();
  if (!snap.exists) redirect("/placard"); // ya no estaba: da lo mismo

  await ref.delete();
  await borrarFoto(snap.data().imagenUrl);

  revalidatePath("/placard");
  redirect("/placard");
}
