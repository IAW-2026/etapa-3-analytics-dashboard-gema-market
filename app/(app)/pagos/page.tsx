import { Suspense } from "react";
import { TopBar } from "@/components/shell/TopBar";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { BarChartWidget } from "@/components/charts/BarChartWidget";
import { LineChartWidget } from "@/components/charts/LineChartWidget";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { MetricCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { getPaymentsStats, getPaymentsTimeseries } from "@/lib/services/payments";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/aggregate";
import { normalizeDateFrom, normalizeDateTo, defaultDateFrom, defaultDateTo } from "@/lib/dates";
import { Badge } from "@/components/ui/Badge";

interface PageProps {
  searchParams: Promise<{ date_from?: string; date_to?: string }>;
}

export const metadata = { title: "Pagos" };

export default function PagosPage({ searchParams }: PageProps) {
  return (
    <>
      <TopBar title="Finanzas y pagos" />
      <Suspense fallback={<PagosSkeleton />}>
        <PagosContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

const STATUS_VARIANT: Record<string, "success" | "warn" | "danger" | "muted"> = {
  approved: "success",
  pending: "warn",
  in_process: "warn",
  rejected: "danger",
  cancelled: "danger",
  refunded: "muted",
  charged_back: "danger",
  in_mediation: "warn",
};

async function PagosContent({ searchParams }: PageProps) {
  const { date_from, date_to } = await searchParams;
  const dateFrom = normalizeDateFrom(date_from);
  const dateTo = normalizeDateTo(date_to);
  const tsDateFrom = dateFrom ?? defaultDateFrom(30);
  const tsDateTo = dateTo ?? defaultDateTo();

  const [statsResult, timeseriesResult] = await Promise.allSettled([
    getPaymentsStats(dateFrom, dateTo),
    getPaymentsTimeseries("total_volume", "day", tsDateFrom, tsDateTo),
  ]);

  const stats = statsResult.status === "fulfilled" ? statsResult.value : null;
  const timeseries = timeseriesResult.status === "fulfilled" ? timeseriesResult.value : null;

  const statusBarData = stats
    ? Object.entries(stats.payments_by_status)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    : [];

  const timeseriesLineData = (timeseries?.series ?? []).map((p) => ({
    name: p.bucket.slice(0, 10),
    value: p.value,
  }));

  const statusRows = Object.entries(stats?.payments_by_status ?? {}).map(([status, count]) => ({
    status,
    count,
  }));

  const statusColumns: Column<{ status: string; count: number }>[] = [
    {
      key: "status",
      header: "Estado",
      render: (r) => (
        <Badge variant={STATUS_VARIANT[r.status] ?? "default"}>{r.status}</Badge>
      ),
    },
    { key: "count", header: "Cantidad", render: (r) => formatNumber(r.count) },
  ];

  return (
    <div className="p-4 lgx:p-6 space-y-6">
      <div className="grid grid-cols-2 lgx:grid-cols-3 gap-3">
        <MetricCard
          label="Volumen total"
          value={formatCurrency(stats?.total_volume ?? 0, stats?.currency)}
          subtext={statsResult.status === "rejected" ? "Payments no disponible" : undefined}
        />
        <MetricCard
          label="Total pagos"
          value={formatNumber(stats?.total_payments ?? 0)}
        />
        <MetricCard
          label="Tasa de aprobación"
          value={formatPercent(stats?.approval_rate ?? 0)}
          deltaPositive={(stats?.approval_rate ?? 0) > 0.8}
        />
      </div>

      <div className="grid lgx:grid-cols-2 gap-4">
        <Card>
          {statusBarData.length > 0 ? (
            <>
              <BarChartWidget
                data={statusBarData}
                label="Pagos por estado"
                ariaLabel="Cantidad de pagos agrupados por estado"
              />
              <details className="mt-2">
                <summary className="text-xs text-ink-3 cursor-pointer select-none">Ver tabla</summary>
                <DataTable
                  columns={statusColumns}
                  rows={statusRows}
                  getKey={(r) => r.status}
                  caption="Pagos por estado"
                />
              </details>
            </>
          ) : statsResult.status === "fulfilled" ? (
            <EmptyState />
          ) : (
            <ErrorState source="Payments" />
          )}
        </Card>

        <Card>
          {timeseriesLineData.length > 0 ? (
            <>
              <LineChartWidget
                data={timeseriesLineData}
                label="Evolución de volumen"
                ariaLabel="Evolución temporal del volumen de pagos"
                format="currency"
                currency={stats?.currency ?? "ARS"}
              />
              <details className="mt-2">
                <summary className="text-xs text-ink-3 cursor-pointer select-none">Ver tabla</summary>
                <DataTable
                  columns={[
                    { key: "name", header: "Fecha" },
                    { key: "value", header: "Volumen", render: (r) => formatCurrency(r.value, stats?.currency) },
                  ]}
                  rows={timeseriesLineData}
                  getKey={(r) => r.name}
                  caption="Evolución del volumen de pagos"
                />
              </details>
            </>
          ) : timeseriesResult.status === "fulfilled" ? (
            <EmptyState />
          ) : (
            <ErrorState source="Payments timeseries" />
          )}
        </Card>
      </div>
    </div>
  );
}

function PagosSkeleton() {
  return (
    <div className="p-4 lgx:p-6 space-y-6">
      <div className="grid grid-cols-2 lgx:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => <MetricCardSkeleton key={i} />)}
      </div>
      <div className="grid lgx:grid-cols-2 gap-4">
        <ChartSkeleton className="h-72" />
        <ChartSkeleton className="h-72" />
      </div>
    </div>
  );
}
