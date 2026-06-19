import { Suspense } from "react";
import { TopBar } from "@/components/shell/TopBar";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { DonutChartWidget } from "@/components/charts/DonutChartWidget";
import { BarChartWidget } from "@/components/charts/BarChartWidget";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { MetricCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { getBuyerStats, getActiveBuyersCount } from "@/lib/services/buyer";
import { getSellerStats } from "@/lib/services/seller";
import { getPaymentsStats } from "@/lib/services/payments";
import { getShippingStats } from "@/lib/services/shipping";
import { buildKPIs, formatCurrency, formatPercent, formatNumber } from "@/lib/aggregate";
import { normalizeDateFrom, normalizeDateTo } from "@/lib/dates";

interface PageProps {
  searchParams: Promise<{ date_from?: string; date_to?: string }>;
}

export default function ResumenPage({ searchParams }: PageProps) {
  return (
    <>
      <TopBar title="Resumen ejecutivo" />
      <Suspense fallback={<ResumenSkeleton />}>
        <ResumenContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ResumenContent({ searchParams }: PageProps) {
  const { date_from, date_to } = await searchParams;
  const dateFrom = normalizeDateFrom(date_from);
  const dateTo = normalizeDateTo(date_to);

  const [buyerResult, sellerResult, paymentsResult, shippingResult, activeUsersResult] =
    await Promise.allSettled([
      getBuyerStats(dateFrom, dateTo),
      getSellerStats(dateFrom, dateTo),
      getPaymentsStats(dateFrom, dateTo),
      getShippingStats(dateFrom, dateTo),
      getActiveBuyersCount(dateFrom, dateTo),
    ]);

  const activeUsers =
    activeUsersResult.status === "fulfilled" ? activeUsersResult.value : 0;

  const kpis = buildKPIs(buyerResult, sellerResult, paymentsResult, shippingResult, activeUsers);
  const seller = sellerResult.status === "fulfilled" ? sellerResult.value : null;

  const ordersDonutData = kpis.ordersSnapshot
    ? Object.entries(kpis.ordersSnapshot)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  const paymentsBarData = kpis.paymentsByStatus
    ? Object.entries(kpis.paymentsByStatus)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  const topSellersRows = seller?.top_sellers.slice(0, 5) ?? [];

  const topSellerColumns: Column<(typeof topSellersRows)[0]>[] = [
    { key: "shop_name", header: "Vendedor" },
    {
      key: "revenue",
      header: "Ingresos",
      render: (r) => formatCurrency(r.revenue, seller?.currency),
    },
  ];

  return (
    <div className="p-4 lgx:p-6 space-y-6">
      {/* KPI cards — 6 del plan + 2 extras */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">Indicadores clave</h2>
        <div className="grid grid-cols-2 lgx:grid-cols-3 gap-3">
          <MetricCard
            label="GMV / Ingresos"
            value={formatCurrency(kpis.gmv, kpis.currency)}
            subtext={paymentsResult.status === "rejected" ? "Payments no disponible" : undefined}
          />
          <MetricCard
            label="Pedidos completados"
            value={formatNumber(kpis.completedOrders)}
            subtext={buyerResult.status === "rejected" ? "Buyer no disponible" : undefined}
          />
          <MetricCard
            label="Usuarios activos"
            value={formatNumber(kpis.activeUsers)}
            subtext={activeUsersResult.status === "rejected" ? "Buyer no disponible" : undefined}
          />
          <MetricCard
            label="Tasa de aprobación"
            value={formatPercent(kpis.approvalRate)}
            subtext={paymentsResult.status === "rejected" ? "Payments no disponible" : undefined}
          />
          <MetricCard
            label="Envíos entregados"
            value={formatNumber(kpis.deliveredShipments)}
            subtext={shippingResult.status === "rejected" ? "Shipping no disponible" : undefined}
          />
          <MetricCard
            label="Ticket promedio"
            value={formatCurrency(kpis.averageTicket, kpis.currency)}
            subtext={buyerResult.status === "rejected" ? "Buyer no disponible" : undefined}
          />
          {/* Extras */}
          <MetricCard
            label="Productos activos"
            value={formatNumber(kpis.activeCatalogProducts)}
            subtext={sellerResult.status === "rejected" ? "Seller no disponible" : undefined}
          />
          <MetricCard
            label="Envíos en tiempo estimado"
            value={formatPercent(kpis.onTimeRate)}
            deltaPositive={kpis.onTimeRate > 0.90}
            subtext={shippingResult.status === "rejected" ? "Shipping no disponible" : undefined}
          />
        </div>
      </section>

      {/* Mini charts */}
      <div className="grid lgx:grid-cols-2 gap-4">
        <Card>
          {ordersDonutData.length > 0 ? (
            <>
              <DonutChartWidget
                data={ordersDonutData}
                label="Órdenes por estado"
                ariaLabel="Distribución de órdenes por estado"
              />
              <details className="mt-2">
                <summary className="text-xs text-ink-3 cursor-pointer select-none">Ver tabla</summary>
                <DataTable
                  columns={[
                    { key: "name", header: "Estado" },
                    { key: "value", header: "Cantidad" },
                  ]}
                  rows={ordersDonutData}
                  getKey={(r) => r.name}
                  caption="Órdenes por estado"
                />
              </details>
            </>
          ) : buyerResult.status === "fulfilled" ? (
            <EmptyState />
          ) : (
            <ErrorState source="Buyer" />
          )}
        </Card>

        <Card>
          {paymentsBarData.length > 0 ? (
            <>
              <BarChartWidget
                data={paymentsBarData}
                label="Pagos por estado"
                ariaLabel="Volumen de pagos por estado"
              />
              <details className="mt-2">
                <summary className="text-xs text-ink-3 cursor-pointer select-none">Ver tabla</summary>
                <DataTable
                  columns={[
                    { key: "name", header: "Estado" },
                    { key: "value", header: "Cantidad" },
                  ]}
                  rows={paymentsBarData}
                  getKey={(r) => r.name}
                  caption="Pagos por estado"
                />
              </details>
            </>
          ) : paymentsResult.status === "fulfilled" ? (
            <EmptyState />
          ) : (
            <ErrorState source="Payments" />
          )}
        </Card>
      </div>

      {/* Top sellers */}
      {topSellersRows.length > 0 && (
        <Card>
          <p className="text-xs font-mono text-ink-3 uppercase tracking-wide mb-3">Top vendedores</p>
          <DataTable
            columns={topSellerColumns}
            rows={topSellersRows}
            getKey={(r) => r.seller_id}
            caption="Top vendedores por ingresos"
          />
        </Card>
      )}
    </div>
  );
}

function ResumenSkeleton() {
  return (
    <div className="p-4 lgx:p-6 space-y-6">
      <div className="grid grid-cols-2 lgx:grid-cols-3 gap-3">
        {Array.from({ length: 8 }).map((_, i) => <MetricCardSkeleton key={i} />)}
      </div>
      <div className="grid lgx:grid-cols-2 gap-4">
        <ChartSkeleton className="h-72" />
        <ChartSkeleton className="h-72" />
      </div>
    </div>
  );
}
