import { Suspense } from "react";
import { DateRangePicker } from "./DateRangePicker";
import { UserButton } from "@clerk/nextjs";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-paper/90 backdrop-blur border-b border-line">
      <h1 className="font-semibold text-ink text-base">{title}</h1>
      <div className="flex items-center gap-3">
        <Suspense fallback={<div className="w-48 h-8 rounded-r1 bg-bone animate-pulse" />}>
          <DateRangePicker />
        </Suspense>
        <UserButton />
      </div>
    </header>
  );
}
