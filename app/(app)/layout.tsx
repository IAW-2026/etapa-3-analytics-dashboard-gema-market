import { Suspense } from "react";
import { SideNav } from "@/components/shell/SideNav";
import { BottomNav } from "@/components/shell/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<aside className="hidden lgx:block lgx:fixed lgx:left-0 lgx:top-0 lgx:bottom-0 lgx:w-56 lgx:bg-paper lgx:border-r lgx:border-line" />}>
        <SideNav />
      </Suspense>

      <main className="lgx:ml-56 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lgx:pb-0">
        {children}
      </main>

      <Suspense fallback={<nav className="fixed bottom-0 left-0 right-0 h-14 bg-paper border-t border-line lgx:hidden" />}>
        <BottomNav />
      </Suspense>
    </>
  );
}
