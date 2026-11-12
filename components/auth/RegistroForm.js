"use client"; // Maneja el estado del formulario y llama a Firebase Auth en el navegador.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { createServerSession } from "@/lib/auth/client";
import { mensajeDeError } from "@/lib/auth/errores";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Separador from "@/components/ui/Separador";
import GoogleButton from "@/components/auth/GoogleButton";

function validar({ nombre, email, password, confirmar }) {
  const errores = {};
  if (!nombre) errores.nombre = "Contanos cómo te llamás.";
  else if (nombre.length > 60) errores.nombre = "Usá 60 caracteres como máximo.";
  if (!email) errores.email = "Ingresá tu email.";
  else if (!/^\S+@\S+\.\S+$/.test(email)) errores.email = "El email no es válido.";
  if (password.length < 6) {
    errores.password = "La contraseña tiene que tener al menos 6 caracteres.";
  }
  if (confirmar !== password) errores.confirmar = "Las contraseñas no coinciden.";
  return errores;
}

export default function RegistroForm({ next }) {
  const router = useRouter();
  const { refrescarUsuario } = useAuth();
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const datos = new FormData(event.currentTarget);
    const valores = {
      nombre: String(datos.get("nombre") ?? "").trim(),
      email: String(datos.get("email") ?? "").trim(),
      password: String(datos.get("password") ?? ""),
      confirmar: String(datos.get("confirmar") ?? ""),
    };

    const nuevosErrores = validar(valores);
    setErrores(nuevosErrores);
    setErrorGeneral(null);
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        valores.email,
        valores.password
      );
      // Guardamos el nombre también en Firebase Auth para mostrarlo en el header.
      await updateProfile(cred.user, { displayName: valores.nombre });
      refrescarUsuario();
      // El servidor crea users/{uid} con este nombre y los valores por defecto.
      await createServerSession(cred.user, { nombre: valores.nombre });
      router.replace(next);
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          id="nombre"
          name="nombre"
          label="Nombre"
          autoComplete="given-name"
          maxLength={60}
          error={errores.nombre}
        />
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
          autoComplete="new-password"
          error={errores.password}
        />
        <Input
          id="confirmar"
          name="confirmar"
          type="password"
          label="Repetí la contraseña"
          autoComplete="new-password"
          error={errores.confirmar}
        />

        {errorGeneral && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {errorGeneral}
          </p>
        )}

        <Button type="submit" disabled={enviando} className="w-full">
          {enviando ? "Creando tu cuenta…" : "Crear cuenta"}
        </Button>
      </form>

      <Separador />
      <GoogleButton next={next} />
    </div>
  );
}
