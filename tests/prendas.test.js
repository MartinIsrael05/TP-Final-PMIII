// Pruebas de lib/prendas.js. Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { validarPrenda, validarFoto, filtrarPrendas } from "../lib/prendas.js";

const valida = {
  nombre: "  Remera blanca ",
  categoria: "superior",
  colorHex: "#FFFFFF",
  colorNombre: "Blanco",
  abrigo: "1",
  impermeable: false,
};

test("validarPrenda acepta una prenda correcta y la normaliza", () => {
  const { errores, datos } = validarPrenda(valida);
  assert.deepEqual(errores, {});
  assert.deepEqual(datos, {
    nombre: "Remera blanca",
    categoria: "superior",
    color: { hex: "#ffffff", nombre: "Blanco" },
    abrigo: 1,
    impermeable: false,
  });
});

test("validarPrenda marca cada campo inválido", () => {
  const { errores, datos } = validarPrenda({
    nombre: "",
    categoria: "sombrero",
    colorHex: "rojo",
    colorNombre: "",
    abrigo: "9",
  });
  assert.equal(datos, null);
  assert.deepEqual(Object.keys(errores).sort(), [
    "abrigo",
    "categoria",
    "colorHex",
    "colorNombre",
    "nombre",
  ]);
});

test("validarPrenda rechaza abrigo con decimales y nombres muy largos", () => {
  assert.ok(validarPrenda({ ...valida, abrigo: "2.5" }).errores.abrigo);
  assert.ok(validarPrenda({ ...valida, nombre: "a".repeat(61) }).errores.nombre);
});

test("validarFoto: sin foto es válido, con tipo o tamaño malo no", () => {
  assert.equal(validarFoto(null), null);
  assert.equal(validarFoto({ size: 0, type: "" }), null);
  assert.equal(validarFoto({ size: 1000, type: "image/png" }), null);
  assert.ok(validarFoto({ size: 1000, type: "application/pdf" }));
  assert.ok(validarFoto({ size: 5 * 1024 * 1024, type: "image/jpeg" }));
});

const prendas = [
  { nombre: "Remera blanca", categoria: "superior", color: { nombre: "Blanco" }, abrigo: 1, usos: 2, createdAt: 1 },
  { nombre: "Jean azul", categoria: "inferior", color: { nombre: "Azul" }, abrigo: 3, usos: 9, createdAt: 2 },
  { nombre: "Remera azul", categoria: "superior", color: { nombre: "Azul" }, abrigo: 1, usos: 0, createdAt: 3 },
];

test("filtrarPrendas busca por nombre sin importar mayúsculas", () => {
  const r = filtrarPrendas(prendas, { q: "REMERA" });
  assert.deepEqual(r.map((p) => p.nombre), ["Remera azul", "Remera blanca"]);
});

test("filtrarPrendas combina categoría, color y abrigo", () => {
  assert.equal(filtrarPrendas(prendas, { categoria: "superior", color: "Azul" }).length, 1);
  assert.equal(filtrarPrendas(prendas, { abrigo: "1" }).length, 2);
  assert.equal(filtrarPrendas(prendas, { categoria: "calzado" }).length, 0);
});

test("filtrarPrendas ordena por fecha (default) o por uso", () => {
  assert.equal(filtrarPrendas(prendas, {})[0].nombre, "Remera azul");
  assert.equal(filtrarPrendas(prendas, { orden: "usadas" })[0].nombre, "Jean azul");
});
