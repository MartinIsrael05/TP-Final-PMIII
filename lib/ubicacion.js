// La ubicación y el horario elegidos viajan en la URL:
//   /?lat=-34.61&lon=-58.38&ciudad=Buenos+Aires&desde=9&hasta=20
// Así la página se puede renderizar en el servidor (con el clima cacheado)
// y el link se puede compartir. Estas funciones leen y validan esos valores.

export const HORARIO_POR_DEFECTO = { desde: 9, hasta: 20 };

// Devuelve { nombre, lat, lon } o null si faltan datos o son inválidos.
export function leerUbicacion(params) {
  const lat = Number(params.lat);
  const lon = Number(params.lon);
  if (params.lat == null || params.lon == null) return null;
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return null;
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) return null;

  const nombre =
    typeof params.ciudad === "string" && params.ciudad.trim()
      ? params.ciudad.trim().slice(0, 80)
      : "Tu ubicación";

  return { nombre, lat, lon };
}

// Devuelve { desde, hasta } con horas válidas (0 a 23 y desde < hasta).
// Si en la URL no hay horario, usa el que viene por defecto (el del perfil).
export function leerHorario(params, porDefecto = HORARIO_POR_DEFECTO) {
  const desde = leerHora(params.desde, porDefecto.desde);
  const hasta = leerHora(params.hasta, porDefecto.hasta);
  if (desde >= hasta) return porDefecto;
  return { desde, hasta };
}

function leerHora(valor, porDefecto) {
  const n = Number(valor);
  if (valor == null || valor === "" || !Number.isInteger(n) || n < 0 || n > 23) {
    return porDefecto;
  }
  return n;
}

// Redondeamos a 2 decimales (~1 km): alcanza para el clima, no expone la
// ubicación exacta en la URL y hace que más pedidos compartan la caché.
export function redondearCoordenada(n) {
  return Math.round(n * 100) / 100;
}
