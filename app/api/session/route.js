// Crea (POST) y borra (DELETE) la cookie de sesión.
//
// Flujo de login:
// 1. El cliente se loguea con Firebase Auth y obtiene un ID token (dura 1 hora).
// 2. Lo manda acá. Lo verificamos con Admin y lo cambiamos por una session
//    cookie de 5 días, httpOnly (JavaScript del navegador no la puede leer).
// 3. Desde ahí el servidor sabe quién es el usuario leyendo esa cookie.
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { SESSION_COOKIE, SESSION_DURACION_MS } from "@/lib/auth/session";

// Firebase recomienda crear la sesión solo si el login fue reciente,
// para que un ID token robado y viejo no sirva para abrir una sesión nueva.
const LOGIN_RECIENTE_SEG = 5 * 60;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const { idToken, nombre } = body ?? {};
  if (typeof idToken !== "string" || !idToken) {
    return Response.json({ error: "Falta el token" }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    return Response.json({ error: "Token inválido" }, { status: 401 });
  }

  const ahoraSeg = Date.now() / 1000;
  if (ahoraSeg - decoded.auth_time > LOGIN_RECIENTE_SEG) {
    return Response.json(
      { error: "Volvé a iniciar sesión" },
      { status: 401 }
    );
  }

  // El uid sale del token verificado, nunca del body.
  await crearUsuarioSiNoExiste(decoded, nombre);

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURACION_MS,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    // En localhost no hay https; en Vercel sí.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURACION_MS / 1000,
  });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}

// La primera vez que alguien entra (registro con email o primer login con
// Google) creamos su documento con los valores por defecto del perfil.
async function crearUsuarioSiNoExiste(decoded, nombreDelForm) {
  const ref = adminDb.collection("users").doc(decoded.uid);
  const snap = await ref.get();
  if (snap.exists) return;

  await ref.set({
    nombre: limpiarNombre(nombreDelForm) || decoded.name || "",
    email: decoded.email ?? "",
    rol: "user",
    ciudad: null,
    horaSalida: 9,
    horaVuelta: 20,
    sensibilidad: "normal",
    ajusteTermico: 0,
    createdAt: FieldValue.serverTimestamp(),
  });
}

function limpiarNombre(valor) {
  if (typeof valor !== "string") return "";
  return valor.trim().slice(0, 60);
}
