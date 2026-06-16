"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const PRESETS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

function toISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function DateRangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const dateFrom = searchParams.get("date_from") ?? "";
  const dateTo = searchParams.get("date_to") ?? "";

  const update = useCallback(
    (from: string, to: string) => {
      const p = new URLSearchParams(searchParams.toString());
      if (from) p.set("date_from", from);
      else p.delete("date_from");
      if (to) p.set("date_to", to);
      else p.delete("date_to");
      router.push(`${pathname}?${p.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const applyPreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    update(toISO(from), toISO(to));
  };

  const clear = () => update("", "");

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {PRESETS.map(({ label, days }) => (
        <button
          key={label}
          onClick={() => applyPreset(days)}
          className="px-2.5 py-1 rounded-r1 text-xs font-mono border border-line bg-paper hover:bg-bone transition-colors text-ink-2"
        >
          {label}
        </button>
      ))}
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => update(e.target.value, dateTo)}
        className="h-8 px-2 rounded-r1 border border-line bg-paper text-xs text-ink-2 font-mono"
        aria-label="Fecha desde"
      />
      <span className="text-ink-3 text-xs">—</span>
      <input
        type="date"
        value={dateTo}
        onChange={(e) => update(dateFrom, e.target.value)}
        className="h-8 px-2 rounded-r1 border border-line bg-paper text-xs text-ink-2 font-mono"
        aria-label="Fecha hasta"
      />
      {(dateFrom || dateTo) && (
        <button
          onClick={clear}
          className="px-2 py-1 rounded-r1 text-xs font-mono text-ink-3 hover:text-danger transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
