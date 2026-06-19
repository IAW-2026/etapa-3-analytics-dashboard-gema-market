import { SignOutButton } from "@clerk/nextjs";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-cream text-center px-4">
      <span className="text-4xl">🔒</span>
      <h1 className="text-xl font-semibold text-ink">Acceso restringido</h1>
      <p className="text-sm text-ink-3 max-w-sm">
        Solo los usuarios con rol{" "}
        <span className="font-mono text-moss">superadmin</span> pueden acceder a
        este dashboard.
      </p>
      <SignOutButton>
        <button className="mt-2 px-4 py-2 bg-moss text-paper rounded-r2 text-sm font-medium hover:bg-olive transition-colors">
          Cerrar sesión
        </button>
      </SignOutButton>
    </div>
  );
}
