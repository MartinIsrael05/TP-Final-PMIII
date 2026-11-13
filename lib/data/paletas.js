// Lectura de las paletas desde Firestore. Solo servidor.
//
// A diferencia de las prendas, las paletas no son de nadie: son públicas y
// las mismas para todos (las reglas de Firestore dejan leerlas a cualquiera y
// escribirlas solo al admin). Por eso acá no hay uid ni sesión que verificar:
// no se puede llegar a datos de otra persona.
//
// El id del documento es la clave de clima, así getPaleta() es una lectura
// directa por id en lugar de una query.
import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { CLAVES_CLIMA, esClimaValido } from "@/lib/paletas";

function paletasRef() {
  return getAdminDb().collection("paletas");
}

// Objeto simple, sin Timestamps, con valores por defecto por si una paleta
// quedó a medio editar desde el panel de admin.
function aPaleta(doc) {
  const d = doc.data();
  return {
    id: doc.id,
    clima: d.clima ?? doc.id,
    nombre: d.nombre ?? "Paleta sin nombre",
    armonia: d.armonia ?? "neutros-acento",
    colores: Array.isArray(d.colores) ? d.colores : [],
    descripcion: d.descripcion ?? "",
  };
}

// Todas las paletas, ordenadas como en CLAVES_CLIMA y no como las devuelve
// Firestore, para que /paletas las muestre siempre en el mismo orden.
export async function listarPaletas() {
  const snap = await paletasRef().get();
  return snap.docs.map(aPaleta).sort((a, b) => indice(a.clima) - indice(b.clima));
}

// Devuelve null si la clave no es una de las nuestras o si esa paleta
// todavía no está cargada.
export async function getPaleta(clima) {
  if (!esClimaValido(clima)) return null;
  const doc = await paletasRef().doc(clima).get();
  return doc.exists ? aPaleta(doc) : null;
}

// ---------------------------------------------------------------------------
// Versiones que no tiran error
// ---------------------------------------------------------------------------
// Las paletas son lo decorativo de la app: si Firestore no responde, preferimos
// mostrar la página sin paleta antes que una pantalla de error. Además /paletas
// y /paletas/[clima] se prerenderizan en el build, y sin estas versiones el
// build fallaría en una máquina sin credenciales de Firebase.
// El error igual queda en los logs del servidor.

export async function listarPaletasOpcional() {
  try {
    return await listarPaletas();
  } catch (error) {
    console.error("No pudimos leer las paletas:", error);
    return [];
  }
}

export async function getPaletaOpcional(clima) {
  try {
    return await getPaleta(clima);
  } catch (error) {
    console.error(`No pudimos leer la paleta ${clima}:`, error);
    return null;
  }
}

function indice(clima) {
  const i = CLAVES_CLIMA.indexOf(clima);
  // Una paleta con un clima que no conocemos va al final en lugar de romper.
  return i === -1 ? CLAVES_CLIMA.length : i;
}
