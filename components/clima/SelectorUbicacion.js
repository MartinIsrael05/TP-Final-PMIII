"use client"; // Usa la geolocalización del navegador, localStorage y estado del buscador.

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buscarCiudad } from "@/lib/clima";
import { redondearCoordenada } from "@/lib/ubicacion";
import Button from "@/components/ui/Button";

// Recordamos la última ubicación elegida en este navegador para no tener
// que pedirla cada vez que alguien entra sin estar logueado.
const CLAVE_STORAGE = "pilcha:ubicacion";

export default function SelectorUbicacion({ ubicacionActual }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [localizando, setLocalizando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const temporizador = useRef(null);
  const ultimaBusqueda = useRef(0);

  // Cambia la URL con la nueva ubicación. La página (Server Component) lee
  // la URL y pide el clima en el servidor.
  function irA(ubicacion, { reemplazar = false } = {}) {
    const params = new URLSearchParams(searchParams);
    params.set("lat", redondearCoordenada(ubicacion.lat));
    params.set("lon", redondearCoordenada(ubicacion.lon));
    params.set("ciudad", ubicacion.nombre);

    guardarUbicacion(ubicacion);
    setResultados([]);
    setTexto("");
    setMensaje(null);

    const url = `${pathname}?${params}`;
    if (reemplazar) router.replace(url, { scroll: false });
    else router.push(url, { scroll: false });
  }

  // Si no hay ubicación en la URL, recuperamos la última que se usó.
  useEffect(() => {
    if (ubicacionActual) return;
    const guardada = leerUbicacionGuardada();
    if (!guardada) return;

    const params = new URLSearchParams(searchParams);
    params.set("lat", guardada.lat);
    params.set("lon", guardada.lon);
    params.set("ciudad", guardada.nombre);
    router.replace(`${pathname}?${params}`, { scroll: false });
  }, [ubicacionActual, pathname, router, searchParams]);

  function usarMiUbicacion() {
    if (!("geolocation" in navigator)) {
      setMensaje("Tu navegador no permite compartir la ubicación. Buscá tu ciudad.");
      return;
    }

    setLocalizando(true);
    setMensaje(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocalizando(false);
        irA({
          nombre: "Tu ubicación",
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (error) => {
        setLocalizando(false);
        setMensaje(
          error.code === error.PERMISSION_DENIED
            ? "No nos diste permiso para ver tu ubicación. Buscá tu ciudad acá abajo."
            : "No pudimos encontrar tu ubicación. Buscá tu ciudad acá abajo."
        );
      },
      // Aceptamos una posición de hasta 10 minutos atrás: el clima no cambia por eso.
      { timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );
  }

  // Buscamos mientras escribe, pero esperamos 300 ms desde la última tecla
  // para no hacer un pedido por cada letra (debounce).
  function handleCambioTexto(event) {
    const valor = event.target.value;
    setTexto(valor);
    clearTimeout(temporizador.current);

    if (valor.trim().length < 2) {
      setResultados([]);
      setBuscando(false);
      return;
    }

    setBuscando(true);
    temporizador.current = setTimeout(async () => {
      // Si llega tarde la respuesta de una búsqueda vieja, la ignoramos.
      const numero = ++ultimaBusqueda.current;
      try {
        const encontradas = await buscarCiudad(valor);
        if (numero !== ultimaBusqueda.current) return;
        setResultados(encontradas);
        setMensaje(encontradas.length ? null : "No encontramos ninguna ciudad con ese nombre.");
      } catch {
        if (numero !== ultimaBusqueda.current) return;
        setMensaje("No pudimos buscar la ciudad. Probá de nuevo.");
      } finally {
        if (numero === ultimaBusqueda.current) setBuscando(false);
      }
    }, 300);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {ubicacionActual ? (
            <>
              Mostrando el clima en{" "}
              <strong className="text-foreground">{ubicacionActual.nombre}</strong>
            </>
          ) : (
            "¿Dónde estás hoy?"
          )}
        </p>
        <Button
          variante="secundario"
          onClick={usarMiUbicacion}
          disabled={localizando}
          className="px-4 py-2 text-sm"
        >
          <span aria-hidden="true">📍</span>
          {localizando ? "Buscando…" : "Usar mi ubicación"}
        </Button>
      </div>

      <div className="relative">
        <label htmlFor="buscar-ciudad" className="sr-only">
          Buscar ciudad
        </label>
        <input
          id="buscar-ciudad"
          type="search"
          value={texto}
          onChange={handleCambioTexto}
          placeholder="O buscá una ciudad, por ejemplo Rosario"
          autoComplete="off"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-foreground"
        />

        {resultados.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg">
            {resultados.map((ciudad) => (
              <li key={ciudad.id}>
                <button
                  type="button"
                  onClick={() => irA(ciudad)}
                  className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-border/50 focus-visible:bg-border/50 focus-visible:outline-none"
                >
                  <span className="font-medium">{ciudad.nombre}</span>
                  <span className="text-xs text-muted">{ciudad.detalle}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* aria-live: los lectores de pantalla anuncian estos mensajes */}
      <p aria-live="polite" className="min-h-5 text-sm text-muted">
        {buscando ? "Buscando…" : mensaje}
      </p>
    </div>
  );
}

function guardarUbicacion(ubicacion) {
  try {
    localStorage.setItem(
      CLAVE_STORAGE,
      JSON.stringify({
        nombre: ubicacion.nombre,
        lat: redondearCoordenada(ubicacion.lat),
        lon: redondearCoordenada(ubicacion.lon),
      })
    );
  } catch {
    // Navegación privada o storage bloqueado: no pasa nada, solo no se recuerda.
  }
}

function leerUbicacionGuardada() {
  try {
    const guardada = JSON.parse(localStorage.getItem(CLAVE_STORAGE));
    if (guardada && Number.isFinite(guardada.lat) && Number.isFinite(guardada.lon)) {
      return guardada;
    }
  } catch {
    // JSON roto o storage bloqueado.
  }
  return null;
}
