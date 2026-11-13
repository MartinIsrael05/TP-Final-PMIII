// Reglas y textos de las paletas que no dependen de Firestore: cómo se llama
// cada condición del clima, en qué orden se muestran y qué significa cada
// armonía. Funciones puras, así se pueden probar y usar en los dos lados.
//
// Las claves son las que devuelve condicionPaleta() en lib/clima.js, y son
// también el id del documento en Firestore y el segmento de la URL
// (/paletas/lluvia). El orden de este objeto es el orden de /paletas.
//
// Los resúmenes describen la regla real de condicionPaleta(), que se evalúa
// en este orden de prioridad: primero la noche, después la lluvia, el frío y
// recién al final el sol.
//
// El import es relativo (y no "@/lib/colores") porque las pruebas corren con
// node directamente, sin el bundler de Next.js que resuelve el alias.
import { esNeutro, hexAHsl } from "./colores.js";

export const CLIMAS = {
  "soleado-calido": {
    nombre: "Soleado y cálido",
    resumen: "Cielo despejado y 22° o más de sensación térmica.",
  },
  "soleado-templado": {
    nombre: "Soleado y templado",
    resumen: "Cielo despejado, pero por debajo de 22°.",
  },
  nublado: {
    nombre: "Nublado",
    resumen: "Nubes, niebla o cielo cubierto, sin lluvia ni frío.",
  },
  lluvia: {
    nombre: "Lluvia",
    resumen: "Llueve o hay 60% o más de probabilidad en tu ventana horaria.",
  },
  frio: {
    nombre: "Frío",
    resumen: "Nieve, o menos de 12° de sensación térmica.",
  },
  noche: {
    nombre: "De noche",
    resumen: "La mayor parte de tu ventana horaria es de noche.",
  },
};

export const CLAVES_CLIMA = Object.keys(CLIMAS);

export const ARMONIAS = {
  analoga: {
    nombre: "Análoga",
    explicacion: "Colores vecinos en el círculo cromático, hasta 30° de distancia.",
  },
  complementaria: {
    nombre: "Complementaria",
    explicacion: "Colores opuestos, entre 150° y 210° de distancia.",
  },
  "neutros-acento": {
    nombre: "Neutros con acento",
    explicacion: "Grises y tierras que combinan con todo, más un color que resalta.",
  },
};

export function esClimaValido(clave) {
  return typeof clave === "string" && Object.hasOwn(CLIMAS, clave);
}

export function nombreClima(clave) {
  return CLIMAS[clave]?.nombre ?? "Paleta del día";
}

export function resumenClima(clave) {
  return CLIMAS[clave]?.resumen ?? "";
}

export function nombreArmonia(armonia) {
  return ARMONIAS[armonia]?.nombre ?? "Libre";
}

export function explicacionArmonia(armonia) {
  return ARMONIAS[armonia]?.explicacion ?? "";
}

// Con qué color se tiñe la interfaz de /hoy: el más saturado de los que
// tienen tono, porque es el que mejor se nota como acento. Si la paleta es
// toda neutra (grises), usamos el más oscuro.
export function colorAcento(colores = []) {
  if (!colores.length) return null;

  const conTono = colores.filter((c) => !esNeutro(c));
  if (conTono.length) {
    return conTono.reduce((mejor, c) =>
      hexAHsl(c).s > hexAHsl(mejor).s ? c : mejor
    );
  }
  return colores.reduce((mejor, c) => (hexAHsl(c).l < hexAHsl(mejor).l ? c : mejor));
}
