"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { LayoutDashboard, ShoppingCart, CreditCard, Truck, Package } from "lucide-react";

const links = [
  { href: "/", label: "Resumen", icon: LayoutDashboard },
  { href: "/ventas", label: "Ventas", icon: ShoppingCart },
  { href: "/pagos", label: "Pagos", icon: CreditCard },
  { href: "/logistica", label: "Logística", icon: Truck },
  { href: "/catalogo", label: "Catálogo", icon: Package },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex lgx:hidden bg-paper border-t border-line pb-safe-bottom"
      aria-label="Navegación móvil"
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={twMerge(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors",
              active ? "text-moss" : "text-ink-3",
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="leading-none">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
