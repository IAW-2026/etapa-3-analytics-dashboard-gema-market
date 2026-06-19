import { twMerge } from "tailwind-merge";

type Variant = "default" | "success" | "warn" | "danger" | "muted";

const variants: Record<Variant, string> = {
  default: "bg-bone text-ink-2",
  success: "bg-[#e8f0e4] text-success",
  warn: "bg-[#fdf0d5] text-warn",
  danger: "bg-[#f9e8e3] text-danger",
  muted: "bg-cream text-ink-3",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center rounded-r1 px-2 py-0.5 text-xs font-mono",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
