"use client"; // Abre la ventana de Google (API del navegador) y maneja estado.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/client";
import { createServerSession } from "@/lib/auth/client";
import { mensajeDeError } from "@/lib/auth/errores";
import Button from "@/components/ui/Button";

export default function GoogleButton({ next }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  async function handleClick() {
    setError(null);
    setEnviando(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      // Si es la primera vez, el servidor crea users/{uid} con el nombre de Google.
      await createServerSession(cred.user);
      router.replace(next);
    } catch (err) {
      setError(mensajeDeError(err));
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variante="secundario"
        onClick={handleClick}
        disabled={enviando}
        className="w-full"
      >
        <GoogleIcon />
        {enviando ? "Conectando con Google…" : "Continuar con Google"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
