import { Suspense } from "react";
import { TopBar } from "@/components/shell/TopBar";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { BarChartWidget } from "@/components/charts/BarChartWidget";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { MetricCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { getBuyerStats } from "@/lib/services/buyer";
import { getSellerStats, getVentas, type Venta } from "@/lib/services/seller";
import { formatCurrency, formatNumber } from "@/lib/aggregate";
import { normalizeDateFrom, normalizeDateTo } from "@/lib/dates";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { PageSizeSelect } from "@/components/ui/PageSizeSelect";
import { parsePageParams } from "@/lib/pagination";

interface PageProps {
  searchParams: Promise<{
    date_from?: string;
    date_to?: string;
    page?: string;
    page_size?: string;
  }>;
}

export const metadata = { title: "Ventas" };

export default function VentasPage({ searchParams }: PageProps) {
  return (
    <>
      <TopBar title="Ventas y comercio" />
      <Suspense fallback={<VentasSkeleton />}>
        <VentasContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

const STATUS_VARIANT: Record<string, "success" | "warn" | "danger" | "muted"> = {
  delivered: "success",
  shipping: "warn",
  paid: "muted",
  shipping_failed: "danger",
};

async function VentasContent({ searchParams }: PageProps) {
  const { date_from, date_to, page: pageParam, page_size: pageSizeParam } = await searchParams;
  const dateFrom = normalizeDateFrom(date_from);
  const dateTo = normalizeDateTo(date_to);
  const { page, pageSize } = parsePageParams({ page: pageParam, page_size: pageSizeParam });

  const [buyerResult, sellerResult, ventasResult] = await Promise.allSettled([
    getBuyerStats(dateFrom, dateTo),
    getSellerStats(dateFrom, dateTo),
    getVentas(page, pageSize, dateFrom, dateTo),
  ]);

  function buildHref(targetPage: number) {
    const p = new URLSearchParams();
    if (date_from) p.set("date_from", date_from);
    if (date_to) p.set("date_to", date_to);
    p.set("page_size", String(pageSize));
    p.set("page", String(targetPage));
    return `/ventas?${p.toString()}`;
  }

  const buyer = buyerResult.status === "fulfilled" ? buyerResult.value : null;
  const seller = sellerResult.status === "fulfilled" ? sellerResult.value : null;
  const ventas = ventasResult.status === "fulfilled" ? ventasResult.value : null;

  const ordersStatusData = buyer
    ? Object.entries(buyer.orders_by_status)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    : [];

  const topSellersData = (seller?.top_sellers ?? []).map((s) => ({
    name: s.shop_name,
    value: s.revenue,
  }));

  const ventaColumns: Column<Venta>[] = [
    { key: "created_at", header: "Fecha", render: (r) => r.created_at.slice(0, 10) },
    { key: "buyer_name", header: "Comprador" },
    { key: "amount", header: "Monto", render: (r) => formatCurrency(r.amount) },
    {
      key: "status",
      header: "Estado",
      render: (r) => (
        <Badge variant={STATUS_VARIANT[r.status] ?? "default"}>{r.status}</Badge>
      ),
    },
  ];

  return (
    <div className="p-4 lgx:p-6 space-y-6">
      <div className="grid grid-cols-2 lgx:grid-cols-3 gap-3">
        <MetricCard
          label="Total ventas"
          value={formatNumber(seller?.total_sales ?? 0)}
          subtext={sellerResult.status === "rejected" ? "Seller no disponible" : undefined}
        />
        <MetricCard
          label="Ingresos"
          value={formatCurrency(seller?.total_revenue ?? 0, seller?.currency)}
        />
        <MetricCard
          label="Total órdenes"
          value={formatNumber(buyer?.total_orders ?? 0)}
          subtext={buyerResult.status === "rejected" ? "Buyer no disponible" : undefined}
        />
      </div>

      {/* Embudo de estados */}
      <Card>
        {ordersStatusData.length > 0 ? (
          <>
            <BarChartWidget
              data={ordersStatusData}
              label="Embudo de órdenes por estado"
              horizontal
              ariaLabel="Órdenes agrupadas por estado del embudo de ventas"
            />
            <details className="mt-2">
              <summary className="text-xs text-ink-3 cursor-pointer select-none">Ver tabla</summary>
              <DataTable
                columns={[
                  { key: "name", header: "Estado" },
                  { key: "value", header: "Cantidad" },
                ]}
                rows={ordersStatusData}
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

      {/* Top vendedores */}
      <Card>
        {topSellersData.length > 0 ? (
          <>
            <BarChartWidget
              data={topSellersData}
              label="Ingresos por vendedor"
              ariaLabel="Top vendedores por ingresos"
              format="currency"
              currency={seller?.currency ?? "ARS"}
            />
            <DataTable
              columns={[
                { key: "shop_name", header: "Vendedor" },
                { key: "revenue", header: "Ingresos", render: (r) => formatCurrency(r.revenue, seller?.currency) },
              ]}
              rows={seller?.top_sellers ?? []}
              getKey={(r) => r.seller_id}
              caption="Top vendedores por ingresos"
              className="mt-3"
            />
          </>
        ) : sellerResult.status === "fulfilled" ? (
          <EmptyState />
        ) : (
          <ErrorState source="Seller" />
        )}
      </Card>

      {/* Últimas ventas */}
      <Card>
        <p className="text-xs font-mono text-ink-3 uppercase tracking-wide mb-3">
          Últimas ventas {ventas?.total ? `(${formatNumber(ventas.total)} total)` : ""}
        </p>
        {ventas ? (
          ventas.items.length > 0 ? (
            <>
              <DataTable
                columns={ventaColumns}
                rows={ventas.items}
                getKey={(r) => r.venta_id}
                caption="Últimas ventas"
              />
              <Pagination page={page} pageSize={pageSize} total={ventas.total} buildHref={buildHref}>
                <PageSizeSelect pageSize={pageSize} />
              </Pagination>
            </>
          ) : (
            <EmptyState />
          )
        ) : (
          <ErrorState source="Seller" />
        )}
      </Card>
    </div>
  );
}

function VentasSkeleton() {
  return (
    <div className="p-4 lgx:p-6 space-y-6">
      <div className="grid grid-cols-2 lgx:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => <MetricCardSkeleton key={i} />)}
      </div>
      <ChartSkeleton className="h-72" />
      <ChartSkeleton className="h-72" />
    </div>
  );
}
