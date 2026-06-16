import { Card } from "./Card";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  subtext?: string;
}

export function MetricCard({ label, value, delta, deltaPositive, subtext }: MetricCardProps) {
  return (
    <Card className="flex flex-col gap-1 min-w-0">
      <span className="text-xs font-mono text-ink-3 uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-semibold text-ink leading-tight truncate">{value}</span>
      {delta && (
        <span
          className={`text-xs font-mono ${deltaPositive ? "text-success" : "text-danger"}`}
        >
          {delta}
        </span>
      )}
      {subtext && <span className="text-xs text-ink-3">{subtext}</span>}
    </Card>
  );
}
