// Pruebas de lib/paletas.js y de los datos que carga el seed.
// Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CLIMAS,
  CLAVES_CLIMA,
  ARMONIAS,
  colorAcento,
  esClimaValido,
  nombreClima,
  nombreArmonia,
} from "../lib/paletas.js";
import {
  contraste,
  distanciaTono,
  esNeutro,
  hexAHsl,
  textoSobre,
} from "../lib/colores.js";
import { PALETAS } from "../scripts/paletas.seed.js";

const HEX = /^#[0-9a-f]{6}$/;

test("hay una condición de clima por cada valor que devuelve condicionPaleta", () => {
  assert.deepEqual(CLAVES_CLIMA, [
    "soleado-calido",
    "soleado-templado",
    "nublado",
    "lluvia",
    "frio",
    "noche",
  ]);
  // Todas tienen nombre y resumen para mostrar en /paletas.
  for (const clave of CLAVES_CLIMA) {
    assert.ok(CLIMAS[clave].nombre.length > 0, clave);
    assert.ok(CLIMAS[clave].resumen.length > 0, clave);
  }
});

test("esClimaValido solo acepta nuestras claves", () => {
  assert.equal(esClimaValido("lluvia"), true);
  assert.equal(esClimaValido("verano"), false);
  assert.equal(esClimaValido(""), false);
  assert.equal(esClimaValido(null), false);
  // Que no se cuelen propiedades heredadas de Object.
  assert.equal(esClimaValido("toString"), false);
});

test("los nombres tienen un valor por defecto en lugar de romper", () => {
  assert.equal(nombreClima("lluvia"), "Lluvia");
  assert.equal(nombreClima("inventado"), "Paleta del día");
  assert.equal(nombreArmonia("analoga"), "Análoga");
  assert.equal(nombreArmonia("inventada"), "Libre");
});

test("el seed trae una paleta por condición de clima", () => {
  const climas = PALETAS.map((p) => p.clima);
  assert.equal(PALETAS.length, CLAVES_CLIMA.length);
  assert.deepEqual([...climas].sort(), [...CLAVES_CLIMA].sort());
  assert.equal(new Set(climas).size, PALETAS.length, "hay climas repetidos");
});

test("cada paleta del seed está bien formada", () => {
  for (const paleta of PALETAS) {
    assert.ok(paleta.nombre.length > 0, `${paleta.clima}: falta nombre`);
    assert.ok(paleta.descripcion.length > 0, `${paleta.clima}: falta descripción`);
    assert.ok(
      Object.hasOwn(ARMONIAS, paleta.armonia),
      `${paleta.clima}: armonía desconocida (${paleta.armonia})`
    );
    // La consigna pide entre 4 y 6 colores por paleta.
    assert.ok(
      paleta.colores.length >= 4 && paleta.colores.length <= 6,
      `${paleta.clima}: tiene ${paleta.colores.length} colores`
    );
    for (const color of paleta.colores) {
      assert.match(color, HEX, `${paleta.clima}: ${color} no es hex de 6 dígitos`);
    }
    assert.equal(
      new Set(paleta.colores).size,
      paleta.colores.length,
      `${paleta.clima}: tiene colores repetidos`
    );
  }
});

test("cada paleta cumple la armonía que declara", () => {
  for (const paleta of PALETAS) {
    const vivos = paleta.colores.filter((c) => !esNeutro(c));
    const tonos = vivos.map((c) => hexAHsl(c).h);

    if (paleta.armonia === "analoga") {
      // Todos los colores con tono tienen que ser vecinos entre sí.
      for (const a of tonos) {
        for (const b of tonos) {
          assert.ok(
            distanciaTono(a, b) <= 30,
            `${paleta.clima}: ${a}° y ${b}° están a más de 30°`
          );
        }
      }
    }

    if (paleta.armonia === "complementaria") {
      const hayOpuestos = tonos.some((a) =>
        tonos.some((b) => distanciaTono(a, b) >= 150)
      );
      assert.ok(hayOpuestos, `${paleta.clima}: ningún par de colores es opuesto`);
    }

    if (paleta.armonia === "neutros-acento") {
      const neutros = paleta.colores.filter((c) => esNeutro(c));
      assert.ok(
        neutros.length >= paleta.colores.length / 2,
        `${paleta.clima}: tiene pocos neutros (${neutros.length})`
      );
      assert.ok(vivos.length >= 1, `${paleta.clima}: le falta el color de acento`);
    }
  }
});

test("colorAcento elige el color con el que se tiñe la pantalla", () => {
  // De una paleta de neutros con acento sale el acento.
  assert.equal(colorAcento(["#6b7280", "#9ca3af", "#c08a3e"]), "#c08a3e");
  // Si son todos neutros, el más oscuro.
  assert.equal(colorAcento(["#ffffff", "#eceef1", "#2b2b2b"]), "#2b2b2b");
  assert.equal(colorAcento([]), null);
  assert.equal(colorAcento(), null);
});

test("cada paleta del seed tiene un acento usable", () => {
  for (const paleta of PALETAS) {
    const acento = colorAcento(paleta.colores);
    assert.ok(paleta.colores.includes(acento), `${paleta.clima}: acento ajeno a la paleta`);
    // Todas las del seed tienen al menos un color con tono, así que el acento
    // nunca puede ser un gris.
    assert.equal(esNeutro(acento), false, `${paleta.clima}: el acento es neutro`);
  }
});

test("contraste da los valores conocidos", () => {
  assert.equal(contraste("#ffffff", "#000000"), 21);
  assert.equal(contraste("#ffffff", "#ffffff"), 1);
  // El orden no importa.
  assert.equal(contraste("#171717", "#f6c445"), contraste("#f6c445", "#171717"));
});

test("el texto elegido para cada color del seed se lee (4.5:1 de WCAG)", () => {
  for (const paleta of PALETAS) {
    for (const color of paleta.colores) {
      const texto = textoSobre(color);
      assert.ok(
        contraste(texto, color) >= 4.5,
        `${paleta.clima}: ${color} con texto ${texto} queda en ${contraste(texto, color)}:1`
      );
    }
  }
});
