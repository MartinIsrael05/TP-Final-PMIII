// Firebase Admin SDK: solo corre en el servidor.
// Tiene permisos totales sobre el proyecto (saltea las reglas de Firestore),
// por eso cada uso tiene que verificar antes la sesión del usuario.
import "server-only";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const VARIABLES = [
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
];

// La app se crea recién la primera vez que alguien la necesita (no al
// importar el archivo). Así, si falta una variable, solo fallan las partes
// que usan Firebase Admin y no todo el sitio.
function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const faltantes = VARIABLES.filter((nombre) => !process.env[nombre]?.trim());
  if (faltantes.length) {
    throw new Error(
      `Faltan variables de entorno de Firebase Admin: ${faltantes.join(", ")}`
    );
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID.trim(),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL.trim(),
      privateKey: leerPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
    }),
  });
}

// La clave se guarda en una sola línea con "\n" escritos como texto.
// - Convertimos esos "\n" en saltos de línea reales.
// - Si se pegó con comillas (Vercel las guarda tal cual), se las sacamos.
function leerPrivateKey(valor) {
  let clave = valor.trim();
  const conComillas =
    (clave.startsWith('"') && clave.endsWith('"')) ||
    (clave.startsWith("'") && clave.endsWith("'"));
  if (conComillas) clave = clave.slice(1, -1);
  return clave.replace(/\\n/g, "\n");
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
