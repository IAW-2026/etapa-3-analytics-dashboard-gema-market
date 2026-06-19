"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const PALETTE = ["#656d4a", "#936639", "#414833", "#a68a64", "#333d29", "#b6ad90", "#9a3a1f", "#b58025"];

interface DonutChartWidgetProps {
  data: Array<{ name: string; value: number }>;
  label?: string;
  ariaLabel?: string;
  valueFormatter?: (v: number) => string;
}

export function DonutChartWidget({
  data,
  label,
  ariaLabel,
  valueFormatter,
}: DonutChartWidgetProps) {
  const fmt = valueFormatter ?? ((v: number) => v.toLocaleString("es-AR"));

  return (
    <div>
      {label && <p className="text-xs font-mono text-ink-3 uppercase tracking-wide mb-3">{label}</p>}
      <ResponsiveContainer width="100%" height={240} aria-label={ariaLabel ?? label}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
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
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: "#6b6e60", paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
