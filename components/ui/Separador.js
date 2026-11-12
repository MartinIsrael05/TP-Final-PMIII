// Línea divisoria con un texto en el medio ("o").
export default function Separador({ texto = "o" }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted">
      <span className="h-px flex-1 bg-border" />
      {texto}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
