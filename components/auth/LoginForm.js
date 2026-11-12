"use client"; // Maneja el estado del formulario y llama a Firebase Auth en el navegador.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { createServerSession } from "@/lib/auth/client";
import { mensajeDeError } from "@/lib/auth/errores";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Separador from "@/components/ui/Separador";
import GoogleButton from "@/components/auth/GoogleButton";

function validar({ email, password }) {
  const errores = {};
  if (!email) errores.email = "Ingresá tu email.";
  else if (!/^\S+@\S+\.\S+$/.test(email)) errores.email = "El email no es válido.";
  if (!password) errores.password = "Ingresá tu contraseña.";
  return errores;
}

export default function LoginForm({ next }) {
  const router = useRouter();
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const datos = new FormData(event.currentTarget);
    const email = String(datos.get("email") ?? "").trim();
    const password = String(datos.get("password") ?? "");

    const nuevosErrores = validar({ email, password });
    setErrores(nuevosErrores);
    setErrorGeneral(null);
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await createServerSession(cred.user);
      router.replace(next);
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* noValidate: usamos nuestra validación para mostrar los mensajes en castellano */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          error={errores.email}
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Contraseña"
          autoComplete="current-password"
          error={errores.password}
        />

        {errorGeneral && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {errorGeneral}
          </p>
        )}

        <Button type="submit" disabled={enviando} className="w-full">
          {enviando ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>

      <Separador />
      <GoogleButton next={next} />
    </div>
  );
}
