// Layout de todas las rutas privadas. Verifica la sesión en el servidor:
// si la cookie no es válida (vencida, revocada o inventada), redirige a /login.
import { requireUser } from "@/lib/auth/session";

export default async function PrivateLayout({ children }) {
  await requireUser();
  return children;
}
