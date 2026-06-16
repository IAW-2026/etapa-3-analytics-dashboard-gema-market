interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title = "Sin datos", description = "No hay información disponible para el rango seleccionado." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
      <span className="text-3xl">📭</span>
      <p className="font-medium text-ink-2">{title}</p>
      <p className="text-sm text-ink-3 max-w-xs">{description}</p>
    </div>
  );
}
