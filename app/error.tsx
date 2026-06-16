"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-cream text-center px-4">
      <span className="text-4xl">💥</span>
      <h1 className="text-xl font-semibold text-ink">Algo salió mal</h1>
      <p className="text-sm text-ink-3 max-w-xs">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-moss text-paper rounded-r2 text-sm font-medium hover:bg-olive transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}
