// Firebase Admin SDK: solo corre en el servidor.
// Tiene permisos totales sobre el proyecto (saltea las reglas de Firestore),
// por eso cada uso tiene que verificar antes la sesión del usuario.
import "server-only";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function crearApp() {
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // En .env y en Vercel la clave se guarda en una sola línea con "\n"
      // escritos como texto. Acá los convertimos en saltos de línea reales.
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const app = getApps().length ? getApps()[0] : crearApp();

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
