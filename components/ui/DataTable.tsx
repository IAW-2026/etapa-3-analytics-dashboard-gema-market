import { twMerge } from "tailwind-merge";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getKey: (row: T) => string;
  caption?: string;
  className?: string;
}

export function DataTable<T>({ columns, rows, getKey, caption, className }: DataTableProps<T>) {
  return (
    <div className={twMerge("overflow-x-auto", className)}>
      <table className="w-full text-sm border-collapse">
        {caption && (
          <caption className="sr-only">{caption}</caption>
        )}
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) => (
              <th
                key={col.key}
                className={twMerge(
                  "text-left py-2 px-3 font-mono text-xs text-ink-3 uppercase tracking-wide whitespace-nowrap",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getKey(row)} className="border-b border-line last:border-0 hover:bg-cream/60 transition-colors">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={twMerge("py-2 px-3 text-ink-2", col.className)}
                >
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-ink-3 text-sm">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
