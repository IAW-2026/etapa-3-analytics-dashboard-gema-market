import { Suspense } from "react";
import { TopBar } from "@/components/shell/TopBar";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { DonutChartWidget } from "@/components/charts/DonutChartWidget";
import { LineChartWidget } from "@/components/charts/LineChartWidget";
import { DataTable } from "@/components/ui/DataTable";
import { MetricCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { getShippingStats, getShippingTimeseries } from "@/lib/services/shipping";
import { formatPercent, formatNumber } from "@/lib/aggregate";
import { normalizeDateFrom, normalizeDateTo, defaultDateFrom, defaultDateTo } from "@/lib/dates";

interface PageProps {
  searchParams: Promise<{ date_from?: string; date_to?: string }>;
}

export const metadata = { title: "Logística" };

const STATUS_LABEL: Record<string, string> = {
  waiting_for_courier: "Esperando courier",
  pending_pickup: "Pend. retiro",
  picked_up: "Retirado",
  in_transit: "En tránsito",
  delivered: "Entregado",
  failed: "Fallido",
  cancelled: "Cancelado",
};

export default function LogisticaPage({ searchParams }: PageProps) {
  return (
    <>
      <TopBar title="Logística y operaciones" />
      <Suspense fallback={<LogisticaSkeleton />}>
        <LogisticaContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function LogisticaContent({ searchParams }: PageProps) {
  const { date_from, date_to } = await searchParams;
  const dateFrom = normalizeDateFrom(date_from);
  const dateTo = normalizeDateTo(date_to);
  const tsDateFrom = dateFrom ?? defaultDateFrom(30);
  const tsDateTo = dateTo ?? defaultDateTo();

  const [statsResult, timeseriesResult] = await Promise.allSettled([
    getShippingStats(dateFrom, dateTo),
    getShippingTimeseries("shipments", "day", tsDateFrom, tsDateTo),
  ]);

  const stats = statsResult.status === "fulfilled" ? statsResult.value : null;
  const timeseries = timeseriesResult.status === "fulfilled" ? timeseriesResult.value : null;

  const delivered = stats?.shipments_by_status.delivered ?? 0;
  const avgHours = stats?.average_delivery_hours ?? 0;
  const failureRate = stats?.failure_rate ?? 0;

  const donutData = stats
    ? Object.entries(stats.shipments_by_status)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({ name: STATUS_LABEL[key] ?? key, value }))
    : [];

  const donutTableRows = stats
    ? Object.entries(stats.shipments_by_status).map(([key, value]) => ({
        estado: STATUS_LABEL[key] ?? key,
        cantidad: value,
      }))
    : [];

  const trendData = (timeseries?.series ?? []).map((p) => ({
    name: p.bucket.slice(0, 10),
    value: p.value,
  }));

  return (
    <div className="p-4 lgx:p-6 space-y-6">
      <div className="grid grid-cols-2 lgx:grid-cols-3 gap-3">
        <MetricCard
          label="Envíos entregados"
          value={formatNumber(delivered)}
          subtext={statsResult.status === "rejected" ? "Shipping no disponible" : undefined}
        />
        <MetricCard
          label="Tiempo promedio entrega"
          value={`${avgHours.toFixed(1)} h`}
          subtext={statsResult.status === "rejected" ? "Shipping no disponible" : undefined}
        />
        <MetricCard
          label="Tasa de fallo"
          value={formatPercent(failureRate)}
          deltaPositive={failureRate < 0.05}
          subtext={statsResult.status === "rejected" ? "Shipping no disponible" : undefined}
        />
      </div>

      <div className="grid lgx:grid-cols-2 gap-4">
        <Card>
          {donutData.length > 0 ? (
            <>
              <DonutChartWidget
                data={donutData}
                label="Envíos por estado"
                ariaLabel="Distribución de envíos por estado"
              />
              <details className="mt-2">
                <summary className="text-xs text-ink-3 cursor-pointer select-none">Ver tabla</summary>
                <DataTable
                  columns={[
                    { key: "estado", header: "Estado" },
                    { key: "cantidad", header: "Cantidad" },
                  ]}
                  rows={donutTableRows}
                  getKey={(r) => r.estado}
                  caption="Envíos por estado"
                />
              </details>
            </>
          ) : statsResult.status === "fulfilled" ? (
            <EmptyState />
          ) : (
            <ErrorState source="Shipping" />
          )}
        </Card>

        <Card>
          {trendData.length > 0 ? (
            <>
              <LineChartWidget
                data={trendData}
                label="Tendencia de envíos"
                ariaLabel="Envíos iniciados por día"
              />
              <details className="mt-2">
                <summary className="text-xs text-ink-3 cursor-pointer select-none">Ver tabla</summary>
                <DataTable
                  columns={[
                    { key: "name", header: "Fecha" },
                    { key: "value", header: "Envíos" },
                  ]}
                  rows={trendData}
                  getKey={(r) => r.name}
                  caption="Tendencia diaria de envíos"
                />
              </details>
            </>
          ) : timeseriesResult.status === "fulfilled" ? (
            <EmptyState />
          ) : (
            <ErrorState source="Shipping timeseries" />
          )}
        </Card>
      </div>
    </div>
  );
}

function LogisticaSkeleton() {
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
