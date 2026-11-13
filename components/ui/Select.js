// Desplegable con label y mensaje de error accesibles. Misma interfaz que Input.
export default function Select({
  id,
  label,
  error,
  className = "",
  children,
  ...props
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-foreground aria-invalid:border-red-500"
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
