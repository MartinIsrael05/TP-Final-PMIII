// Pruebas de lib/colores.js. Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hexAHsl,
  esNeutro,
  distanciaTono,
  puntajeColores,
  puntajeContraPaleta,
  PUNTAJE,
} from "../lib/colores.js";

test("hexAHsl convierte colores conocidos", () => {
  assert.deepEqual(hexAHsl("#ff0000"), { h: 0, s: 100, l: 50 });
  assert.deepEqual(hexAHsl("#00ff00"), { h: 120, s: 100, l: 50 });
  assert.deepEqual(hexAHsl("#0000ff"), { h: 240, s: 100, l: 50 });
  assert.deepEqual(hexAHsl("#808080"), { h: 0, s: 0, l: 50 });
  assert.deepEqual(hexAHsl("#fff"), { h: 0, s: 0, l: 100 }); // formato corto
});

test("hexAHsl rechaza colores inválidos", () => {
  assert.throws(() => hexAHsl("rojo"));
  assert.throws(() => hexAHsl("#12345"));
});

test("esNeutro detecta blanco, negro y grises", () => {
  assert.equal(esNeutro("#ffffff"), true);
  assert.equal(esNeutro("#111111"), true);
  assert.equal(esNeutro("#6b7280"), true); // gris
  assert.equal(esNeutro("#bdb7ad"), true); // gris cálido (saturación 11%)
  // Un beige claro tiene más saturación en HSL de lo que parece (18%),
  // así que con la regla actual (< 15%) no cuenta como neutro.
  assert.equal(esNeutro("#d6cfc4"), false);
  assert.equal(esNeutro("#1e40af"), false); // azul
  assert.equal(esNeutro("#dc2626"), false); // rojo
});

test("distanciaTono da la vuelta al círculo", () => {
  assert.equal(distanciaTono(10, 350), 20);
  assert.equal(distanciaTono(0, 180), 180);
  assert.equal(distanciaTono(90, 90), 0);
});

test("puntajeColores sigue las armonías", () => {
  // análogos: azul y celeste
  assert.equal(puntajeColores("#1e40af", "#0ea5e9"), PUNTAJE.alto);
  // complementarios: azul y naranja
  assert.equal(puntajeColores("#1d4ed8", "#ea580c"), PUNTAJE.alto);
  // triádicos: rojo y verde (120°)
  assert.equal(puntajeColores("#ff0000", "#00ff00"), PUNTAJE.medio);
  // sin armonía: rojo y amarillo verdoso (~75°)
  assert.equal(puntajeColores("#ff0000", "#a3e635"), PUNTAJE.bajo);
  // un neutro combina con todo
  assert.equal(puntajeColores("#ffffff", "#ff0000"), PUNTAJE.neutro);
});

test("puntajeContraPaleta toma el mejor color de la paleta", () => {
  const paleta = ["#a3e635", "#ea580c"]; // verde lima y naranja
  assert.equal(puntajeContraPaleta("#1d4ed8", paleta), PUNTAJE.alto); // azul vs naranja
  assert.equal(puntajeContraPaleta("#1d4ed8", []), PUNTAJE.neutro); // sin paleta
});
