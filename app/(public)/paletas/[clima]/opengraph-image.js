// Imagen de Open Graph de cada paleta: la que se ve cuando alguien comparte
// el link en WhatsApp, Twitter o Slack. Se genera en el servidor con
// next/og, así muestra los colores reales de la paleta.
//
// Acá no hay Tailwind ni variables CSS: next/og entiende un subconjunto de
// CSS en estilos en línea, y todos los contenedores necesitan display flex.
import { ImageResponse } from "next/og";
import { getPaletaOpcional } from "@/lib/data/paletas";
import { nombreArmonia, nombreClima } from "@/lib/paletas";
import { textoSobre } from "@/lib/colores";

export const alt = "Paleta de colores de PILCHA para una condición del clima";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const { clima } = await params;
  const paleta = await getPaletaOpcional(clima);
  const colores = paleta?.colores ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          color: "#171717",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", padding: "64px 64px 0" }}>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 8,
              color: "#6b7280",
            }}
          >
            PILCHA
          </div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, marginTop: 24 }}>
            {paleta?.nombre ?? nombreClima(clima)}
          </div>
          {/* Sin paleta cargada el título ya es el nombre del clima, así que
              no repetimos la misma palabra dos veces. */}
          {paleta && (
            <div style={{ display: "flex", fontSize: 34, color: "#6b7280", marginTop: 12 }}>
              {nombreClima(clima)} · armonía {nombreArmonia(paleta.armonia).toLowerCase()}
            </div>
          )}
        </div>

        <div style={{ display: "flex", width: "100%", height: 240 }}>
          {colores.length > 0 ? (
            colores.map((color) => (
              <div
                key={color}
                style={{
                  display: "flex",
                  flex: 1,
                  alignItems: "flex-end",
                  padding: 20,
                  backgroundColor: color,
                  color: textoSobre(color),
                  fontSize: 24,
                }}
              >
                {color}
              </div>
            ))
          ) : (
            <div
              style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f3f4f6",
                color: "#6b7280",
                fontSize: 28,
              }}
            >
              Paleta sin cargar
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
