// Muestra el resumen del clima para la ventana horaria del usuario.
// Server Component: solo recibe datos y los dibuja.
import { describirCodigo, nivelUV } from "@/lib/clima";

export default function ClimaResumen({ clima, actual, desde, hasta }) {
  const { texto, icono } = describirCodigo(clima.codigo, clima.esDeDia);

  return (
    <article className="flex flex-col gap-6 rounded-2xl border border-border p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted">
            Entre las {desde}:00 y las {hasta}:00
          </p>
          <p className="flex items-center gap-2 text-2xl font-semibold">
            <span aria-hidden="true">{icono}</span>
            {texto}
          </p>
        </div>
        {actual && (
          <p className="text-sm text-muted">
            Ahora: <strong className="text-foreground">{Math.round(actual.temperature_2m)}°</strong>
          </p>
        )}
      </header>

      <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
        <div>
          <p className="text-6xl font-black tracking-tight">
            {Math.round(clima.sensacion)}°
          </p>
          <p className="text-sm text-muted">de sensación térmica promedio</p>
        </div>
        <p className="pb-6 text-lg">
          <span className="text-muted">mín</span> {Math.round(clima.tempMin)}°{" "}
          <span className="text-muted">· máx</span> {Math.round(clima.tempMax)}°
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-3 text-center">
        <Dato titulo="Lluvia" valor={`${clima.lluviaProb}%`} detalle="probabilidad máx." />
        <Dato titulo="Viento" valor={`${Math.round(clima.viento)}`} detalle="km/h máx." />
        <Dato titulo="UV" valor={Math.round(clima.uv)} detalle={nivelUV(clima.uv)} />
      </dl>

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted">Hora por hora</h3>
        {/* Scroll horizontal solo dentro de esta tira, no en toda la página */}
        <ol className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {clima.horas.map((h) => (
            <li
              key={h.hora}
              className="flex min-w-14 flex-col items-center gap-1 rounded-xl bg-border/40 px-2 py-2 text-sm"
            >
              <span className="text-xs text-muted">{h.hora}h</span>
              <span aria-hidden="true">{describirCodigo(h.codigo, h.esDeDia).icono}</span>
              <span className="font-semibold">{Math.round(h.temp)}°</span>
              <span className="text-xs text-muted" title="Probabilidad de lluvia">
                {h.lluviaProb}%
              </span>
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}

function Dato({ titulo, valor, detalle }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-border/40 px-2 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{titulo}</dt>
      <dd className="text-2xl font-bold">{valor}</dd>
      <dd className="text-xs text-muted">{detalle}</dd>
    </div>
  );
}
