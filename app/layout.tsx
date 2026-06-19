import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { inter, jetbrainsMono } from "./lib/fonts";

export const metadata: Metadata = {
  title: { default: "UniHousing — Analytics", template: "%s · Analytics" },
  description: "Dashboard de analytics del sistema UniHousing.",
};

export const viewport: Viewport = {
  themeColor: "#faf8f3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} h-full`}>
        <body className="min-h-full bg-cream text-ink font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
