import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-cream text-center px-4">
      <span className="text-4xl">🗺️</span>
      <h1 className="text-2xl font-semibold text-ink">404</h1>
      <p className="text-sm text-ink-3">La página que buscás no existe.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-moss text-paper rounded-r2 text-sm font-medium hover:bg-olive transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
