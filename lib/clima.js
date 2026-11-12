// Todo lo relacionado con el clima: pedirle datos a Open-Meteo y resumirlos.
// Open-Meteo es gratis y no pide API key. Estas funciones se pueden usar
// tanto en el servidor como en el navegador.

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const VARIABLES_HORARIAS = [
  "temperature_2m",
  "apparent_temperature",
  "precipitation_probability",
  "wind_speed_10m",
  "uv_index",
  "weather_code",
  "is_day",
].join(",");

const VARIABLES_ACTUALES = [
  "temperature_2m",
  "apparent_temperature",
  "weather_code",
  "is_day",
].join(",");

// ---------------------------------------------------------------------------
// Pedidos a la API
// ---------------------------------------------------------------------------

// Busca ciudades por nombre. Devuelve hasta 5 resultados.
export async function buscarCiudad(nombre) {
  const texto = nombre?.trim();
  if (!texto || texto.length < 2) return [];

  const params = new URLSearchParams({
    name: texto,
    count: "5",
    language: "es",
  });

  // En el servidor, Next.js cachea la respuesta un día (las ciudades no cambian).
  // En el navegador la opción "next" se ignora.
  const res = await fetch(`${GEOCODING_URL}?${params}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("No pudimos buscar la ciudad.");

  const datos = await res.json();
  return (datos.results ?? []).map((r) => ({
    id: r.id,
    nombre: r.name,
    lat: r.latitude,
    lon: r.longitude,
    // "Córdoba, Argentina" para distinguir ciudades con el mismo nombre.
    detalle: [r.admin1, r.country].filter(Boolean).join(", "),
  }));
}

// Pronóstico por hora. timezone=auto hace que las horas vengan en la hora
// local de la ciudad, así "las 9" son las 9 de allá y no las de Argentina.
export async function getPronostico(lat, lon, { dias = 1 } = {}) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: VARIABLES_HORARIAS,
    current: VARIABLES_ACTUALES,
    timezone: "auto",
    forecast_days: String(dias),
  });

  // Cacheamos media hora: el pronóstico no cambia tan seguido.
  const res = await fetch(`${FORECAST_URL}?${params}`, {
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error("No pudimos obtener el pronóstico.");

  return res.json();
}

// ---------------------------------------------------------------------------
// Procesamiento (funciones puras, sin red)
// ---------------------------------------------------------------------------

// Recorta el pronóstico a las horas en que el usuario está afuera y calcula
// el resumen que usa el resto de la app.
// Devuelve null si en esa ventana no hay datos.
export function resumirVentana(pronostico, horaSalida, horaVuelta, { fecha } = {}) {
  const h = pronostico.hourly;
  // Por defecto, el primer día del pronóstico (hoy en la ciudad elegida).
  const dia = fecha ?? h.time[0].slice(0, 10);

  const horas = [];
  h.time.forEach((time, i) => {
    // time viene como "2026-11-12T09:00"
    const hora = Number(time.slice(11, 13));
    if (time.startsWith(dia) && hora >= horaSalida && hora <= horaVuelta) {
      horas.push({
        hora,
        temp: h.temperature_2m[i],
        sensacion: h.apparent_temperature[i],
        lluviaProb: h.precipitation_probability[i] ?? 0,
        viento: h.wind_speed_10m[i],
        uv: h.uv_index[i] ?? 0,
        codigo: h.weather_code[i],
        esDeDia: h.is_day[i] === 1,
      });
    }
  });

  if (horas.length === 0) return null;

  const temps = horas.map((x) => x.temp);
  const horasDeDia = horas.filter((x) => x.esDeDia).length;

  return {
    tempMin: redondear(Math.min(...temps)),
    tempMax: redondear(Math.max(...temps)),
    sensacion: redondear(promedio(horas.map((x) => x.sensacion))),
    lluviaProb: Math.max(...horas.map((x) => x.lluviaProb)),
    viento: redondear(Math.max(...horas.map((x) => x.viento))),
    uv: redondear(Math.max(...horas.map((x) => x.uv))),
    codigo: codigoPredominante(horas.map((x) => x.codigo)),
    // Es "de día" si la mayoría de las horas de la ventana son de día.
    esDeDia: horasDeDia >= horas.length / 2,
    horas,
  };
}

// Elige qué paleta corresponde al clima. Devuelve una de las claves de
// paletas.clima: soleado-calido, soleado-templado, nublado, lluvia, frio, noche.
export function condicionPaleta(clima) {
  if (!clima.esDeDia) return "noche";
  if (esLluvia(clima.codigo) || clima.lluviaProb >= 60) return "lluvia";
  if (esNieve(clima.codigo) || clima.sensacion < 12) return "frio";
  if (clima.codigo <= 1) {
    return clima.sensacion >= 22 ? "soleado-calido" : "soleado-templado";
  }
  return "nublado";
}

// Texto e ícono para cada código del clima (códigos WMO que usa Open-Meteo).
export function describirCodigo(codigo, esDeDia = true) {
  if (codigo === 0) return { texto: "Despejado", icono: esDeDia ? "☀️" : "🌙" };
  if (codigo === 1) return { texto: "Mayormente despejado", icono: esDeDia ? "🌤️" : "🌙" };
  if (codigo === 2) return { texto: "Parcialmente nublado", icono: "⛅" };
  if (codigo === 3) return { texto: "Nublado", icono: "☁️" };
  if (codigo === 45 || codigo === 48) return { texto: "Niebla", icono: "🌫️" };
  if (codigo >= 51 && codigo <= 57) return { texto: "Llovizna", icono: "🌦️" };
  if (codigo >= 61 && codigo <= 67) return { texto: "Lluvia", icono: "🌧️" };
  if (codigo >= 71 && codigo <= 77) return { texto: "Nieve", icono: "❄️" };
  if (codigo >= 80 && codigo <= 82) return { texto: "Chaparrones", icono: "🌦️" };
  if (codigo === 85 || codigo === 86) return { texto: "Nevadas", icono: "🌨️" };
  if (codigo === 95) return { texto: "Tormenta", icono: "⛈️" };
  if (codigo === 96 || codigo === 99) return { texto: "Tormenta con granizo", icono: "⛈️" };
  return { texto: "Sin datos", icono: "🌡️" };
}

// Nivel del índice UV según la escala de la OMS.
export function nivelUV(uv) {
  if (uv < 3) return "bajo";
  if (uv < 6) return "moderado";
  if (uv < 8) return "alto";
  if (uv < 11) return "muy alto";
  return "extremo";
}

export function esLluvia(codigo) {
  return (
    (codigo >= 51 && codigo <= 67) ||
    (codigo >= 80 && codigo <= 82) ||
    codigo >= 95
  );
}

export function esNieve(codigo) {
  return (codigo >= 71 && codigo <= 77) || codigo === 85 || codigo === 86;
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

// El código que más se repite en la ventana. Si hay empate, gana el más
// "fuerte" (los códigos WMO más altos son peores: lluvia, tormenta).
function codigoPredominante(codigos) {
  const cuenta = {};
  for (const c of codigos) cuenta[c] = (cuenta[c] ?? 0) + 1;

  let mejor = codigos[0];
  for (const c of Object.keys(cuenta).map(Number)) {
    if (cuenta[c] > cuenta[mejor] || (cuenta[c] === cuenta[mejor] && c > mejor)) {
      mejor = c;
    }
  }
  return mejor;
}

function promedio(valores) {
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

function redondear(n) {
  return Math.round(n * 10) / 10;
}
