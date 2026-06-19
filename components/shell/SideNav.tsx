"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { BarChart2, ShoppingCart, CreditCard, Truck, Package, LayoutDashboard } from "lucide-react";

const links = [
  { href: "/", label: "Resumen", icon: LayoutDashboard },
  { href: "/ventas", label: "Ventas", icon: ShoppingCart },
  { href: "/pagos", label: "Pagos", icon: CreditCard },
  { href: "/logistica", label: "Logística", icon: Truck },
  { href: "/catalogo", label: "Catálogo", icon: Package },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lgx:flex lgx:fixed lgx:left-0 lgx:top-0 lgx:bottom-0 lgx:w-56 lgx:flex-col lgx:bg-paper lgx:border-r lgx:border-line lgx:z-40">
      <div className="flex items-center gap-2 px-4 h-14 border-b border-line">
        <BarChart2 className="w-5 h-5 text-moss" />
        <span className="font-semibold text-ink text-sm leading-tight">
          UniHousing
          <span className="block text-xs font-mono text-ink-3 font-normal">Analytics</span>
        </span>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-0.5" aria-label="Navegación principal">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={twMerge(
                "flex items-center gap-3 px-3 py-2 rounded-r1 text-sm transition-colors",
                active
                  ? "bg-moss/10 text-moss font-medium"
                  : "text-ink-2 hover:bg-bone",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
