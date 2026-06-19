"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const PALETTE = ["#656d4a", "#936639", "#414833", "#a68a64", "#333d29"];

type Format = "number" | "currency";

function makeFmt(format: Format, currency: string) {
  if (format === "currency")
    return (v: number) =>
      new Intl.NumberFormat("es-AR", { style: "currency", currency, maximumFractionDigits: 0 }).format(v);
  return (v: number) => v.toLocaleString("es-AR");
}

interface BarChartWidgetProps {
  data: Array<{ name: string; value: number }>;
  label?: string;
  horizontal?: boolean;
  ariaLabel?: string;
  format?: Format;
  currency?: string;
}

export function BarChartWidget({
  data,
  label,
  horizontal = false,
  ariaLabel,
  format = "number",
  currency = "ARS",
}: BarChartWidgetProps) {
  const fmt = makeFmt(format, currency);

  return (
    <div>
      {label && <p className="text-xs font-mono text-ink-3 uppercase tracking-wide mb-3">{label}</p>}
      <ResponsiveContainer width="100%" height={horizontal ? data.length * 36 + 20 : 220}>
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 4, right: 8, bottom: 4, left: horizontal ? 90 : 0 }}
          aria-label={ariaLabel ?? label}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2dccc" />
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 11, fill: "#6b6e60", fontFamily: "monospace" }} tickFormatter={fmt} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b6e60" }} width={88} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b6e60" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6b6e60", fontFamily: "monospace" }} tickFormatter={fmt} />
            </>
          )}
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
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
