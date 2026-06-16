interface ErrorStateProps {
  source?: string;
  message?: string;
}

export function ErrorState({ source, message }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
      <span className="text-2xl">⚠️</span>
      <p className="font-medium text-ink-2">
        {source ? `${source} no disponible` : "No disponible"}
      </p>
      {message && <p className="text-xs text-ink-3 max-w-xs">{message}</p>}
    </div>
  );
}
