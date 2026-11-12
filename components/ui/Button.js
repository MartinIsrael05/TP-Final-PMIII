// Botón base de la app. Server Component: no tiene estado propio, así que se
// puede usar tanto en componentes de servidor como de cliente.
const variantes = {
  primario: "bg-foreground text-background hover:opacity-90",
  secundario:
    "border border-border bg-background text-foreground hover:bg-border/40",
};

export default function Button({
  variante = "primario",
  type = "button",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-50 ${variantes[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
