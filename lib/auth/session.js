// Verificación real de la sesión. La usan el layout privado y todas las
// Server Actions. proxy.js solo mira que la cookie exista; acá se comprueba
// con Firebase Admin que sea válida, que no venció y que no fue revocada.
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "session";
export const SESSION_DURACION_MS = 5 * 24 * 60 * 60 * 1000; // 5 días

// cache() hace que, dentro de un mismo request, la verificación se haga una
// sola vez aunque la llamen el layout, la página y otros componentes.
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    // El segundo parámetro (true) chequea además si la sesión fue revocada.
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const snap = await adminDb.collection("users").doc(decoded.uid).get();
    const datos = snap.exists ? snap.data() : {};

    // Devolvemos solo campos simples (nada de Timestamps de Firestore) para
    // que se puedan pasar sin problema a componentes de cliente.
    return {
      uid: decoded.uid,
      email: decoded.email ?? datos.email ?? null,
      nombre: datos.nombre ?? decoded.name ?? "",
      rol: datos.rol ?? "user",
      ciudad: datos.ciudad ?? null,
      horaSalida: datos.horaSalida ?? 9,
      horaVuelta: datos.horaVuelta ?? 20,
      sensibilidad: datos.sensibilidad ?? "normal",
      ajusteTermico: datos.ajusteTermico ?? 0,
    };
  } catch {
    // Cookie vencida, revocada o adulterada: es como no tener sesión.
    return null;
  }
});

// Para páginas y Server Actions que exigen estar logueado.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
