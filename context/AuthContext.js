"use client"; // Escucha el estado de Firebase Auth en el navegador (useEffect + useState).

// Usuario activo del lado del cliente. Es SOLO para la interfaz (nombre,
// avatar, botón de salir). Lo que define si alguien puede ver una página o
// guardar datos es la cookie de sesión verificada en el servidor.
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

const AuthContext = createContext(null);

// Guardamos un objeto simple con lo que la UI necesita.
function aUsuarioUI(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    nombre: firebaseUser.displayName ?? "",
    foto: firebaseUser.photoURL ?? null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // onAuthStateChanged devuelve la función para dejar de escuchar,
    // que React llama al desmontar el componente.
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(aUsuarioUI(firebaseUser));
      setCargando(false);
    });
  }, []);

  // Para cuando cambian datos del perfil de Firebase (por ejemplo el nombre
  // al registrarse), que no disparan onAuthStateChanged.
  function refrescarUsuario() {
    setUser(aUsuarioUI(auth.currentUser));
  }

  async function logout() {
    // Primero borramos la cookie del servidor y después cerramos la sesión
    // de Firebase en el navegador.
    await fetch("/api/session", { method: "DELETE" });
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, cargando, logout, refrescarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth tiene que usarse dentro de <AuthProvider>");
  }
  return contexto;
}
