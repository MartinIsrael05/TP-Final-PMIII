// Helpers de auth que corren en el navegador.
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

// Después de loguearse con Firebase, le pasa el ID token al servidor para que
// cree la cookie de sesión. Si el servidor la rechaza, cerramos también la
// sesión de Firebase para no quedar "medio logueados".
export async function createServerSession(firebaseUser, { nombre } = {}) {
  const idToken = await firebaseUser.getIdToken();

  const respuesta = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, nombre }),
  });

  if (!respuesta.ok) {
    await signOut(auth);
    throw new Error("No pudimos iniciar tu sesión. Probá de nuevo.");
  }
}
