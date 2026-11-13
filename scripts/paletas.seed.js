// Las paletas que carga el seed en la colección "paletas" de Firestore.
//
// El id de cada documento es la clave de clima ("lluvia", "noche", ...), así
// /paletas/[clima] es una lectura directa por id y volver a correr el seed
// actualiza la paleta en lugar de duplicarla. El campo "clima" se guarda
// igual, para poder filtrar por él desde el panel de admin.
//
// armonia dice cómo se relacionan los colores (la cuenta la hace lib/colores.js):
//   analoga          vecinos en el círculo cromático, hasta 30°
//   complementaria   opuestos, entre 150° y 210°
//   neutros-acento   grises y tierras, más un color que resalta
//
// Este archivo es CommonJS porque lo usa scripts/seed.js, que corre con node
// directamente, sin pasar por el bundler de Next.js.

const PALETAS = [
  {
    clima: "soleado-calido",
    nombre: "Mediodía de verano",
    armonia: "analoga",
    descripcion:
      "Amarillos, naranjas y arenas, todos vecinos en el círculo cromático. Un día para ropa clara y liviana.",
    colores: ["#f6c445", "#ef9a3d", "#d9633b", "#f7e6c4", "#8c4a2f"],
  },
  {
    clima: "soleado-templado",
    nombre: "Sol de entretiempo",
    armonia: "complementaria",
    descripcion:
      "Azul cielo contra naranja tostado: colores opuestos que se levantan entre sí sin pelearse.",
    colores: ["#3f8fc4", "#a7d3e8", "#e8995a", "#f2e4cd", "#1f4d68"],
  },
  {
    clima: "nublado",
    nombre: "Cielo cubierto",
    armonia: "neutros-acento",
    descripcion:
      "Grises que combinan con cualquier cosa del placard y un mostaza que evita que el día quede apagado.",
    colores: ["#6b7280", "#9ca3af", "#d6d9de", "#eceef1", "#c08a3e"],
  },
  {
    clima: "lluvia",
    nombre: "Día de lluvia",
    armonia: "analoga",
    descripcion:
      "Azules profundos y celestes, en la misma familia de tono. Van bien con impermeables y botas.",
    colores: ["#2f4858", "#33658a", "#5c8fa8", "#86bbd8", "#cfe0e8"],
  },
  {
    clima: "frio",
    nombre: "Frío seco",
    armonia: "complementaria",
    descripcion:
      "Vino y verde teal, opuestos en el círculo, sobre un crudo y un gris oscuro que hacen de base.",
    colores: ["#7d3c4a", "#b5697a", "#3c7d6f", "#e9e1d6", "#2b2b2b"],
  },
  {
    clima: "noche",
    nombre: "Después del atardecer",
    armonia: "neutros-acento",
    descripcion:
      "Azules muy oscuros y grises, con un ámbar que funciona como única nota de color.",
    colores: ["#141821", "#2d313a", "#5a6070", "#bcc1ca", "#d9a24b"],
  },
];

module.exports = { PALETAS };
