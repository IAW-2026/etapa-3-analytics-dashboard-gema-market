"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Format = "number" | "currency";

function makeFmt(format: Format, currency: string) {
  if (format === "currency")
    return (v: number) =>
      new Intl.NumberFormat("es-AR", { style: "currency", currency, maximumFractionDigits: 0 }).format(v);
  return (v: number) => v.toLocaleString("es-AR");
}

interface LineChartWidgetProps {
  data: Array<{ name: string; value: number }>;
  label?: string;
  ariaLabel?: string;
  format?: Format;
  currency?: string;
}

export function LineChartWidget({
  data,
  label,
  ariaLabel,
  format = "number",
  currency = "ARS",
}: LineChartWidgetProps) {
  const fmt = makeFmt(format, currency);

  return (
    <div>
      {label && <p className="text-xs font-mono text-ink-3 uppercase tracking-wide mb-3">{label}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
          aria-label={ariaLabel ?? label}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2dccc" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b6e60" }} />
          <YAxis tick={{ fontSize: 11, fill: "#6b6e60", fontFamily: "monospace" }} tickFormatter={fmt} />
          <Tooltip
            contentStyle={{
              background: "#faf8f3",
              border: "1px solid #e2dccc",
              borderRadius: 14,
              boxShadow: "0 4px 12px rgba(40,30,15,0.06)",
              fontSize: 12,
            }}
            formatter={(val) => [fmt(Number(val ?? 0))]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#656d4a"
            strokeWidth={2}
            dot={{ fill: "#656d4a", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
