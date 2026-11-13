// Tira de colores de una paleta. Server Component: solo dibuja.
//
// Es una lista de verdad (<ul>) y no un montón de <div> de color: así un
// lector de pantalla puede recorrer los colores. En tamaño "chico" el hex
// queda oculto a la vista pero se sigue leyendo en voz alta.
//
// El color del texto lo elige textoSobre(), que compara el contraste real
// (WCAG) del hex contra el claro y el oscuro de la app.
import { textoSobre } from "@/lib/colores";

export default function PaletaSwatch({ colores, tamano = "chico" }) {
  if (!colores?.length) return null;

  const grande = tamano === "grande";

  return (
    <ul className={`flex overflow-hidden rounded-xl ${grande ? "flex-col sm:flex-row" : ""}`}>
      {colores.map((color) => (
        <li
          key={color}
          className={`flex flex-1 items-end justify-start ${grande ? "h-24 p-3 sm:h-40" : "h-10"}`}
          style={{ backgroundColor: color }}
        >
          <span
            className={grande ? "font-mono text-xs uppercase" : "sr-only"}
            style={grande ? { color: textoSobre(color) } : undefined}
          >
            {color}
          </span>
        </li>
      ))}
    </ul>
  );
}
