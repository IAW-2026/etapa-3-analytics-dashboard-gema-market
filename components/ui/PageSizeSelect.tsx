"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";

interface PageSizeSelectProps {
  pageSize: number;
}

export function PageSizeSelect({ pageSize }: PageSizeSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page_size", e.target.value);
    p.set("page", "1");
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-xs text-ink-3">
      Por página
      <select
        value={pageSize}
        onChange={onChange}
        className="h-8 px-2 rounded-r1 border border-line bg-paper text-xs text-ink-2 font-mono"
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </label>
  );
}
