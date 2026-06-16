import { twMerge } from "tailwind-merge";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={twMerge(
        "bg-paper rounded-r2 shadow-sh-1 border border-line p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
