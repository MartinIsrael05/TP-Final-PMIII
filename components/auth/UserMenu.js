"use client"; // Lee el usuario del AuthContext y maneja el click de "Salir".

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function UserMenu() {
  const router = useRouter();
  const { user, cargando, logout } = useAuth();

  async function salir() {
    await logout();
    router.push("/");
    // refresh() vuelve a pedir al servidor la página actual sin la cookie.
    router.refresh();
  }

  // Mientras Firebase averigua si hay sesión, dejamos el lugar reservado
  // para que el header no "salte".
  if (cargando) return <div className="h-10 w-32" aria-hidden="true" />;

  if (!user) {
    return (
      <div className="flex items-center gap-4 text-sm font-medium">
        <Link href="/login" className="hover:underline">
          Ingresar
        </Link>
        <Link
          href="/registro"
          className="rounded-full bg-foreground px-4 py-2 text-background hover:opacity-90"
        >
          Crear cuenta
        </Link>
      </div>
    );
  }

  const nombre = user.nombre || user.email;

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link href="/placard" className="font-medium hover:underline">
        Mi placard
      </Link>
      <Link href="/hoy" className="flex items-center gap-2 font-medium hover:underline">
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full bg-foreground text-background"
        >
          {nombre.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline">{nombre}</span>
      </Link>
      <Button variante="secundario" onClick={salir} className="px-4 py-2 text-sm">
        Salir
      </Button>
    </div>
  );
}
