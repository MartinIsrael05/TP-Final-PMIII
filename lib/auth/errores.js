// Traduce los códigos de error de Firebase Auth a mensajes para el usuario.
// Devuelve null cuando no hay que mostrar nada (por ejemplo, si el usuario
// cerró a propósito la ventana de Google).
const mensajes = {
  "auth/invalid-credential": "El email o la contraseña no son correctos.",
  "auth/user-not-found": "El email o la contraseña no son correctos.",
  "auth/wrong-password": "El email o la contraseña no son correctos.",
  "auth/invalid-email": "El email no es válido.",
  "auth/email-already-in-use": "Ya existe una cuenta con ese email.",
  "auth/weak-password": "La contraseña tiene que tener al menos 6 caracteres.",
  "auth/too-many-requests":
    "Hiciste demasiados intentos. Esperá un rato y probá de nuevo.",
  "auth/network-request-failed":
    "No hay conexión. Revisá tu internet y probá de nuevo.",
  "auth/popup-blocked":
    "El navegador bloqueó la ventana de Google. Habilitá las ventanas emergentes para este sitio.",
  "auth/account-exists-with-different-credential":
    "Ya tenés una cuenta con ese email. Ingresá con email y contraseña.",
  "auth/unauthorized-domain":
    "Este dominio no está autorizado para iniciar sesión.",
};

const silenciosos = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];

const generico = "Algo salió mal. Probá de nuevo.";

export function mensajeDeError(error) {
  const code = error?.code;
  if (silenciosos.includes(code)) return null;
  if (mensajes[code]) return mensajes[code];
  // Otros errores de Firebase vienen en inglés: mostramos uno genérico.
  if (typeof code === "string" && code.startsWith("auth/")) return generico;
  // Errores nuestros (por ejemplo, de createServerSession) ya están en castellano.
  return error?.message || generico;
}
