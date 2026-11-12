// Lista de alertas del día (capas, lluvia, viento, UV) que arma lib/recomendar.js.
const ICONOS = { capas: "🧥", lluvia: "☂️", viento: "💨", uv: "🕶️" };

export default function Alertas({ alertas }) {
  if (!alertas.length) return null;

  return (
    <ul className="flex flex-col gap-2" aria-label="Alertas del día">
      {alertas.map((alerta) => (
        <li
          key={alerta.tipo}
          className="flex items-start gap-3 rounded-xl bg-border/40 px-4 py-3 text-sm"
        >
          <span aria-hidden="true" className="text-lg leading-5">
            {ICONOS[alerta.tipo]}
          </span>
          <span>{alerta.texto}</span>
        </li>
      ))}
    </ul>
  );
}
