// Corre antes de cada pedido a una ruta privada.
// Es un chequeo optimista y rápido: solo mira si existe la cookie de sesión.
// Si no está, manda a /login sin llegar a renderizar nada. La verificación
// real (que la cookie sea válida) la hace getCurrentUser() en el servidor.
import { NextResponse } from "next/server";

export function proxy(request) {
  const tieneSesion = request.cookies.has("session");

  if (!tieneSesion) {
    const loginUrl = new URL("/login", request.url);
    // Guardamos a dónde quería ir para volver después del login.
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/hoy/:path*",
    "/placard/:path*",
    "/historial/:path*",
    "/viajes/:path*",
    "/stats/:path*",
    "/perfil/:path*",
    "/admin/:path*",
  ],
};
