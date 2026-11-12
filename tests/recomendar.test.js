// Pruebas del motor de recomendación. Correr con: npm test
// Son los casos "a mano" que pide el plan: 25° con sol, 10° con lluvia y
// amplitud térmica alta, más la selección de prendas del placard.
import { test } from "node:test";
import assert from "node:assert/strict";
import { recomendar, calcularTempEfectiva } from "../lib/recomendar.js";

// Clima base: un día tranquilo. Cada prueba pisa lo que necesita.
function clima(datos) {
  return {
    tempMin: 20,
    tempMax: 24,
    sensacion: 22,
    lluviaProb: 0,
    viento: 10,
    uv: 3,
    codigo: 0,
    esDeDia: true,
    ...datos,
  };
}

function prenda(id, categoria, abrigo, hex, extra = {}) {
  return { id, nombre: id, categoria, abrigo, color: { hex }, impermeable: false, usos: 0, ...extra };
}

const categorias = (r) => r.requerimientos.map((x) => x.categoria);
const tipos = (r) => r.alertas.map((a) => a.tipo);

test("25° con sol: caluroso, sin abrigo, alerta de UV", () => {
  const r = recomendar({ clima: clima({ tempMin: 21, tempMax: 27, sensacion: 25, uv: 8 }) });

  assert.equal(r.nivel.clave, "caluroso");
  assert.deepEqual(categorias(r), ["superior", "inferior", "calzado"]);
  assert.deepEqual(tipos(r), ["uv"]);
  assert.equal(
    r.textoGenerico,
    "Remera, short o pantalón liviano y zapatillas livianas. No te olvides del protector."
  );
});

test("10° con lluvia: frío, abrigo e impermeables, alerta de paraguas", () => {
  const r = recomendar({
    clima: clima({ tempMin: 8, tempMax: 12, sensacion: 10, lluviaProb: 80, codigo: 63 }),
  });

  assert.equal(r.nivel.clave, "frio");
  assert.deepEqual(categorias(r), ["superior", "inferior", "abrigo", "calzado"]);
  assert.deepEqual(tipos(r), ["lluvia"]);
  const abrigo = r.requerimientos.find((x) => x.categoria === "abrigo");
  assert.equal(abrigo.preferirImpermeable, true);
  assert.match(r.textoGenerico, /Llevá paraguas\.$/);
});

test("amplitud alta con calor: suma un abrigo liviano opcional y alerta de capas", () => {
  const r = recomendar({ clima: clima({ tempMin: 14, tempMax: 29, sensacion: 23 }) });

  assert.equal(r.nivel.clave, "caluroso");
  assert.deepEqual(categorias(r), ["superior", "inferior", "abrigo", "calzado"]);
  const abrigo = r.requerimientos.find((x) => x.categoria === "abrigo");
  assert.equal(abrigo.opcional, true);
  assert.equal(abrigo.max, 2);
  assert.deepEqual(tipos(r), ["capas"]);
  assert.match(r.alertas[0].texto, /15° de diferencia/);
});

test("amplitud alta con fresco: marca el abrigo para sacárselo", () => {
  const r = recomendar({ clima: clima({ tempMin: 9, tempMax: 19, sensacion: 14 }) });
  const abrigo = r.requerimientos.find((x) => x.categoria === "abrigo");
  assert.equal(r.nivel.clave, "fresco");
  assert.equal(abrigo.nota, "para sacártelo al mediodía");
});

test("viento fuerte suma alerta de rompeviento", () => {
  const r = recomendar({ clima: clima({ viento: 45 }) });
  assert.deepEqual(tipos(r), ["viento"]);
});

test("cada nivel según la temperatura efectiva", () => {
  const casos = [
    [30, "muy-caluroso"],
    [27, "muy-caluroso"],
    [26.9, "caluroso"],
    [22, "caluroso"],
    [19, "templado"],
    [14, "fresco"],
    [8, "frio"],
    [0, "muy-frio"],
  ];
  for (const [sensacion, esperado] of casos) {
    const r = recomendar({ clima: clima({ sensacion }) });
    assert.equal(r.nivel.clave, esperado, `sensación ${sensacion}`);
  }
});

test("muy frío pide accesorios", () => {
  const r = recomendar({ clima: clima({ tempMin: 0, tempMax: 4, sensacion: 1 }) });
  assert.ok(categorias(r).includes("accesorio"));
});

test("temperatura efectiva: sensibilidad y ajuste por feedback", () => {
  const c = clima({ sensacion: 20 });
  assert.equal(calcularTempEfectiva(c, null), 20);
  assert.equal(calcularTempEfectiva(c, { sensibilidad: "friolento", ajusteTermico: 0 }), 17);
  assert.equal(calcularTempEfectiva(c, { sensibilidad: "caluroso", ajusteTermico: -1.5 }), 21.5);

  // Con 18° de sensación alguien "normal" está en templado, pero para
  // alguien friolento se siente como 15° y ya es fresco.
  const r = recomendar({
    clima: clima({ sensacion: 18 }),
    perfil: { sensibilidad: "friolento", ajusteTermico: 0 },
  });
  assert.equal(r.tempEfectiva, 15);
  assert.equal(r.nivel.clave, "fresco");
});

test("sin placard: todas las prendas vienen en null con su texto", () => {
  const r = recomendar({ clima: clima({ sensacion: 25 }) });
  assert.ok(r.outfit.every((x) => x.prenda === null && x.texto));
});

test("elige del placard según nivel de abrigo y color", () => {
  const prendas = [
    prenda("remera-azul", "superior", 1, "#1d4ed8"),
    prenda("remera-verde", "superior", 1, "#a3e635"),
    prenda("sweater", "superior", 3, "#1d4ed8"), // demasiado abrigado para 25°
    prenda("short-naranja", "inferior", 1, "#ea580c"),
    prenda("zapas-blancas", "calzado", 1, "#ffffff"),
  ];
  const paleta = { colores: ["#ea580c", "#f97316"] }; // naranjas

  const r = recomendar({ clima: clima({ sensacion: 25 }), prendas, paleta });
  const ids = r.outfit.map((x) => x.prenda?.id);

  // La azul es complementaria del naranja de la paleta; la verde no.
  assert.deepEqual(ids, ["remera-azul", "short-naranja", "zapas-blancas"]);
});

test("si empatan, elige la menos usada", () => {
  const prendas = [
    prenda("remera-1", "superior", 1, "#ffffff", { usos: 5 }),
    prenda("remera-2", "superior", 1, "#ffffff", { usos: 1 }),
  ];
  const r = recomendar({ clima: clima({ sensacion: 25 }), prendas });
  assert.equal(r.outfit[0].prenda.id, "remera-2");
});

test("con lluvia prefiere el abrigo impermeable", () => {
  const prendas = [
    prenda("campera-lana", "abrigo", 4, "#1d4ed8"),
    prenda("campera-lluvia", "abrigo", 4, "#6b7280", { impermeable: true }),
  ];
  const r = recomendar({ clima: clima({ sensacion: 10, lluviaProb: 70 }), prendas });
  const abrigo = r.outfit.find((x) => x.categoria === "abrigo");
  assert.equal(abrigo.prenda.id, "campera-lluvia");
});

test("si una categoría no tiene candidatas, queda el texto genérico", () => {
  const prendas = [prenda("remera", "superior", 1, "#ffffff")];
  const r = recomendar({ clima: clima({ sensacion: 25 }), prendas });
  const inferior = r.outfit.find((x) => x.categoria === "inferior");
  assert.equal(inferior.prenda, null);
  assert.equal(inferior.texto, "short o pantalón liviano");
});
