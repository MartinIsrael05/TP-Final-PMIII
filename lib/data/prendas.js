// Lectura de prendas desde Firestore. Solo servidor.
// Siempre recibe el uid de la sesión (nunca uno que venga del cliente) y
// lee solo bajo users/{uid}/prendas.
import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";

function prendasRef(uid) {
  return getAdminDb().collection("users").doc(uid).collection("prendas");
}

// Convierte el documento a un objeto simple. Los Timestamps de Firestore
// no se pueden pasar a componentes de cliente, así que van como milisegundos.
function aPrenda(doc) {
  const d = doc.data();
  return {
    id: doc.id,
    nombre: d.nombre,
    categoria: d.categoria,
    color: d.color,
    abrigo: d.abrigo,
    impermeable: Boolean(d.impermeable),
    imagenUrl: d.imagenUrl ?? null,
    usos: d.usos ?? 0,
    ultimoUso: d.ultimoUso?.toMillis() ?? null,
    createdAt: d.createdAt?.toMillis() ?? 0,
  };
}

export async function listarPrendas(uid) {
  const snap = await prendasRef(uid).get();
  return snap.docs.map(aPrenda);
}

// Devuelve null si no existe. Como la ruta es users/{uid}/prendas/{id},
// una prenda de otro usuario tampoco se encuentra: ahí la página llama
// a notFound().
export async function getPrenda(uid, id) {
  const doc = await prendasRef(uid).doc(id).get();
  return doc.exists ? aPrenda(doc) : null;
}
