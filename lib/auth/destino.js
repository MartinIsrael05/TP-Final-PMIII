// A dónde mandar al usuario después del login, a partir del ?next= de la URL.
// Solo aceptamos rutas internas ("/placard"), nunca otra web ("//otro.com"),
// para que nadie pueda usar un link de login de PILCHA para mandar a un
// sitio falso.
export function destinoSeguro(next) {
  if (
    typeof next === "string" &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/\\")
  ) {
    return next;
  }
  return "/hoy";
}
