// Motor de recomendación: traduce el clima en ropa.
// Es una función pura (no usa red ni Firebase): recibe datos y devuelve datos.
// Así se puede probar con casos armados a mano y explicar paso a paso.
//
//   recomendar({ clima, perfil, prendas, paleta }) => {
//     tempEfectiva, nivel, requerimientos, outfit, alertas, textoGenerico
//   }
import { puntajeColores, puntajeContraPaleta } from "./colores.js";

// Si sos friolento, el día "se siente" más frío para vos.
export const OFFSET_SENSIBILIDAD = { friolento: -3, normal: 0, caluroso: 3 };

// Umbrales de las reglas extra.
export const UMBRALES = { amplitud: 8, lluvia: 40, viento: 30, uv: 6 };

// Orden en que se eligen las prendas: primero lo que más se ve, así las
// siguientes se eligen para combinar con eso.
const ORDEN_CATEGORIAS = ["superior", "inferior", "abrigo", "calzado", "accesorio"];

// Qué hace falta en cada nivel. min y max son el rango de "nivel de abrigo"
// (1 a 5) que tiene que tener la prenda. texto es lo que se muestra cuando
// no hay placard o no hay ninguna prenda que sirva.
const NIVELES = [
  {
    clave: "muy-caluroso",
    nombre: "Muy caluroso",
    desde: 27,
    requerimientos: {
      superior: { min: 1, max: 1, texto: "remera liviana o musculosa" },
      inferior: { min: 1, max: 1, texto: "short o pollera" },
      calzado: { min: 1, max: 2, texto: "sandalias o zapatillas livianas" },
    },
  },
  {
    clave: "caluroso",
    nombre: "Caluroso",
    desde: 22,
    requerimientos: {
      superior: { min: 1, max: 1, texto: "remera" },
      inferior: { min: 1, max: 2, texto: "short o pantalón liviano" },
      calzado: { min: 1, max: 2, texto: "zapatillas livianas" },
    },
  },
  {
    clave: "templado",
    nombre: "Templado",
    desde: 17,
    requerimientos: {
      superior: { min: 1, max: 2, texto: "remera o camisa liviana" },
      inferior: { min: 2, max: 4, texto: "pantalón o jean" },
      abrigo: { min: 2, max: 2, opcional: true, texto: "un buzo o campera liviana por si refresca" },
      calzado: { min: 2, max: 5, texto: "zapatillas" },
    },
  },
  {
    clave: "fresco",
    nombre: "Fresco",
    desde: 12,
    requerimientos: {
      superior: { min: 2, max: 3, texto: "remera de manga larga o camisa" },
      inferior: { min: 2, max: 4, texto: "pantalón o jean" },
      abrigo: { min: 2, max: 3, texto: "un buzo o campera liviana" },
      calzado: { min: 2, max: 5, texto: "zapatillas o zapatos cerrados" },
    },
  },
  {
    clave: "frio",
    nombre: "Frío",
    desde: 6,
    requerimientos: {
      superior: { min: 3, max: 3, texto: "un sweater o buzo" },
      inferior: { min: 2, max: 4, texto: "jean o pantalón abrigado" },
      abrigo: { min: 4, max: 4, texto: "una campera abrigada" },
      calzado: { min: 2, max: 5, texto: "zapatillas o botas" },
    },
  },
  {
    clave: "muy-frio",
    nombre: "Muy frío",
    desde: -Infinity,
    requerimientos: {
      superior: { min: 3, max: 4, texto: "una primera capa térmica y un sweater" },
      inferior: { min: 3, max: 5, texto: "pantalón abrigado" },
      abrigo: { min: 5, max: 5, texto: "una campera bien abrigada o un tapado" },
      calzado: { min: 2, max: 5, texto: "botas o calzado cerrado" },
      accesorio: { min: 3, max: 5, texto: "bufanda, gorro y guantes" },
    },
  },
];

export function recomendar({ clima, perfil = null, prendas = [], paleta = null }) {
  const tempEfectiva = calcularTempEfectiva(clima, perfil);
  const nivel = elegirNivel(tempEfectiva);
  const requerimientos = armarRequerimientos(nivel, clima);
  const alertas = armarAlertas(clima);
  const outfit = elegirPrendas(requerimientos, prendas, paleta?.colores ?? []);
  const textoGenerico = armarTextoGenerico(requerimientos, alertas);

  return {
    tempEfectiva,
    nivel: { clave: nivel.clave, nombre: nivel.nombre },
    requerimientos,
    outfit,
    alertas,
    textoGenerico,
  };
}

// ---------------------------------------------------------------------------
// Pasos del motor
// ---------------------------------------------------------------------------

export function calcularTempEfectiva(clima, perfil) {
  const offset = OFFSET_SENSIBILIDAD[perfil?.sensibilidad] ?? 0;
  const ajuste = perfil?.ajusteTermico ?? 0;
  return Math.round((clima.sensacion + offset + ajuste) * 10) / 10;
}

export function elegirNivel(tempEfectiva) {
  // NIVELES está ordenado de más caluroso a más frío: el primero cuyo
  // "desde" alcanzamos es el que corresponde.
  return NIVELES.find((n) => tempEfectiva >= n.desde);
}

// Parte de la tabla del nivel y le aplica las reglas extra del día.
function armarRequerimientos(nivel, clima) {
  const amplitud = clima.tempMax - clima.tempMin;
  const hayAmplitud = amplitud >= UMBRALES.amplitud;
  const hayLluvia = clima.lluviaProb >= UMBRALES.lluvia;

  const requerimientos = ORDEN_CATEGORIAS.filter((cat) => nivel.requerimientos[cat]).map(
    (categoria) => ({
      categoria,
      opcional: false,
      nota: null,
      preferirImpermeable: false,
      ...nivel.requerimientos[categoria],
    })
  );

  const abrigo = requerimientos.find((r) => r.categoria === "abrigo");

  // Mucha diferencia entre la mínima y la máxima: capas, con un abrigo que
  // se pueda sacar. Si el nivel no pedía abrigo, sumamos uno liviano opcional.
  if (hayAmplitud) {
    if (abrigo) {
      abrigo.nota = "para sacártelo al mediodía";
    } else {
      requerimientos.splice(2, 0, {
        categoria: "abrigo",
        min: 1,
        max: 2,
        opcional: true,
        nota: "para la mañana, después te lo sacás",
        preferirImpermeable: false,
        texto: "algo liviano para la mañana",
      });
    }
  }

  // Lluvia: preferimos abrigo y calzado impermeables si el placard tiene.
  if (hayLluvia) {
    for (const r of requerimientos) {
      if (r.categoria === "abrigo" || r.categoria === "calzado") {
        r.preferirImpermeable = true;
      }
    }
  }

  return requerimientos;
}

function armarAlertas(clima) {
  const alertas = [];
  const amplitud = Math.round(clima.tempMax - clima.tempMin);

  if (amplitud >= UMBRALES.amplitud) {
    alertas.push({
      tipo: "capas",
      texto: `Hay ${amplitud}° de diferencia entre la mínima y la máxima: vestite en capas.`,
    });
  }
  if (clima.lluviaProb >= UMBRALES.lluvia) {
    alertas.push({
      tipo: "lluvia",
      texto: `Hay ${clima.lluviaProb}% de probabilidad de lluvia: llevá paraguas.`,
    });
  }
  if (clima.viento >= UMBRALES.viento) {
    alertas.push({
      tipo: "viento",
      texto: `Viento de hasta ${Math.round(clima.viento)} km/h: sumá un rompeviento.`,
    });
  }
  if (clima.uv >= UMBRALES.uv) {
    alertas.push({
      tipo: "uv",
      texto: "Índice UV alto: anteojos de sol, protector y gorra.",
    });
  }
  return alertas;
}

// Para cada requerimiento, elige la prenda del placard que mejor combina.
function elegirPrendas(requerimientos, prendas, coloresPaleta) {
  const elegidas = [];

  return requerimientos.map((req) => {
    let candidatas = prendas.filter(
      (p) => p.categoria === req.categoria && p.abrigo >= req.min && p.abrigo <= req.max
    );

    // Si llueve y hay alguna impermeable que sirva, nos quedamos solo con esas.
    if (req.preferirImpermeable && candidatas.some((p) => p.impermeable)) {
      candidatas = candidatas.filter((p) => p.impermeable);
    }

    const prenda = mejorCandidata(candidatas, elegidas, coloresPaleta);
    if (prenda) elegidas.push(prenda);

    return {
      categoria: req.categoria,
      prenda,
      // Si no hay prenda, la UI muestra el texto genérico de esa categoría.
      texto: req.texto,
      opcional: req.opcional,
      nota: req.nota,
    };
  });
}

// Puntaje de una prenda = cuánto combina con la paleta + cuánto combina, en
// promedio, con las prendas ya elegidas. Gana el mayor; si empatan, la que
// se usó menos veces (para rotar el placard).
function mejorCandidata(candidatas, elegidas, coloresPaleta) {
  let mejor = null;
  let mejorPuntaje = -Infinity;

  for (const prenda of candidatas) {
    const puntaje = puntajePrenda(prenda, elegidas, coloresPaleta);
    const empata = puntaje === mejorPuntaje;
    if (puntaje > mejorPuntaje || (empata && (prenda.usos ?? 0) < (mejor.usos ?? 0))) {
      mejor = prenda;
      mejorPuntaje = puntaje;
    }
  }
  return mejor;
}

export function puntajePrenda(prenda, elegidas, coloresPaleta) {
  const hex = prenda.color.hex;
  const conPaleta = puntajeContraPaleta(hex, coloresPaleta);
  if (!elegidas.length) return conPaleta;

  const conElegidas =
    elegidas.reduce((total, e) => total + puntajeColores(hex, e.color.hex), 0) /
    elegidas.length;
  return conPaleta + conElegidas;
}

// "Remera, short y zapatillas livianas. Sumá también ... Llevá paraguas."
function armarTextoGenerico(requerimientos, alertas) {
  const obligatorios = requerimientos.filter((r) => !r.opcional).map((r) => r.texto);
  const opcionales = requerimientos.filter((r) => r.opcional).map((r) => r.texto);

  let texto = capitalizar(listar(obligatorios)) + ".";
  if (opcionales.length) {
    texto += ` Sumá ${listar(opcionales)}.`;
  }
  if (alertas.some((a) => a.tipo === "lluvia")) texto += " Llevá paraguas.";
  if (alertas.some((a) => a.tipo === "viento")) texto += " Un rompeviento te va a venir bien.";
  if (alertas.some((a) => a.tipo === "uv")) texto += " No te olvides del protector.";
  return texto;
}

// ["a", "b", "c"] => "a, b y c"
function listar(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items.at(-1)}`;
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
