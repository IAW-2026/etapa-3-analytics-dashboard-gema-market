import Link from "next/link";
import { formatNumber } from "@/lib/aggregate";
import { totalPages } from "@/lib/pagination";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  buildHref: (page: number) => string;
  children?: React.ReactNode;
}

export function Pagination({ page, pageSize, total, buildHref, children }: PaginationProps) {
  const pages = totalPages(total, pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-line">
      <p className="text-xs text-ink-3">
        Página {page} de {pages} · {formatNumber(total)} total
      </p>
      <div className="flex items-center gap-3">
        {children}
        <div className="flex items-center gap-2 text-xs font-mono">
          {page > 1 ? (
            <Link href={buildHref(page - 1)} className="text-ink-2 hover:text-ink-1 underline">
              Anterior
            </Link>
          ) : (
            <span className="text-ink-3">Anterior</span>
          )}
          {page < pages ? (
            <Link href={buildHref(page + 1)} className="text-ink-2 hover:text-ink-1 underline">
              Siguiente
            </Link>
          ) : (
            <span className="text-ink-3">Siguiente</span>
          )}
        </div>
      </div>
    </div>
  );
}
