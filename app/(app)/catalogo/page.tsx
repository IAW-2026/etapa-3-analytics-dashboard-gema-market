import { Suspense } from "react";
import { TopBar } from "@/components/shell/TopBar";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { BarChartWidget } from "@/components/charts/BarChartWidget";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { MetricCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { getSellerStats, getProductos, type Producto } from "@/lib/services/seller";
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

export const metadata = { title: "Catálogo" };

export default function CatalogoPage({ searchParams }: PageProps) {
  return (
    <>
      <TopBar title="Catálogo e inventario" />
      <Suspense fallback={<CatalogoSkeleton />}>
        <CatalogoContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function CatalogoContent({ searchParams }: PageProps) {
  const { date_from, date_to, page: pageParam, page_size: pageSizeParam } = await searchParams;
  const dateFrom = normalizeDateFrom(date_from);
  const dateTo = normalizeDateTo(date_to);
  const { page, pageSize } = parsePageParams({ page: pageParam, page_size: pageSizeParam });

  const [statsResult, productosResult] = await Promise.allSettled([
    getSellerStats(dateFrom, dateTo),
    getProductos(page, pageSize, "stock", "asc"),
  ]);

  const stats = statsResult.status === "fulfilled" ? statsResult.value : null;
  const productos = productosResult.status === "fulfilled" ? productosResult.value : null;

  function buildHref(targetPage: number) {
    const p = new URLSearchParams();
    if (date_from) p.set("date_from", date_from);
    if (date_to) p.set("date_to", date_to);
    p.set("page_size", String(pageSize));
    p.set("page", String(targetPage));
    return `/catalogo?${p.toString()}`;
  }

  const statusBarData = stats
    ? [
        { name: "Activos", value: stats.products_by_status.active },
        { name: "Pausados", value: stats.products_by_status.paused },
        { name: "Ocultos", value: stats.hidden_products },
      ].filter((d) => d.value > 0)
    : [];

  const categoryBarData = (stats?.top_categories ?? []).map((c) => ({
    name: c.name,
    value: c.count,
  }));

  const productColumns: Column<Producto>[] = [
    { key: "title", header: "Producto", render: (r) => <span className="truncate max-w-[180px] block">{r.title}</span> },
    { key: "seller_name", header: "Vendedor" },
    {
      key: "stock",
      header: "Stock",
      render: (r) => (
        <span className={r.stock === 0 ? "text-danger font-medium" : r.stock < 5 ? "text-warn" : ""}>
          {r.stock}
        </span>
      ),
    },
    { key: "price", header: "Precio", render: (r) => formatCurrency(r.price, r.currency) },
    {
      key: "status",
      header: "Estado",
      render: (r) => (
        <Badge variant={r.status === "active" ? "success" : "muted"}>{r.status}</Badge>
      ),
    },
  ];

  return (
    <div className="p-4 lgx:p-6 space-y-6">
      <div className="grid grid-cols-2 lgx:grid-cols-3 gap-3">
        <MetricCard
          label="Productos activos"
          value={formatNumber(stats?.products_by_status.active ?? 0)}
          subtext={statsResult.status === "rejected" ? "Seller no disponible" : undefined}
        />
        <MetricCard
          label="Total productos"
          value={formatNumber(stats?.total_products ?? 0)}
        />
        <MetricCard
          label="Productos ocultos"
          value={formatNumber(stats?.hidden_products ?? 0)}
        />
      </div>

      <div className="grid lgx:grid-cols-2 gap-4">
        <Card>
          {statusBarData.length > 0 ? (
            <>
              <BarChartWidget
                data={statusBarData}
                label="Productos por estado"
                ariaLabel="Distribución de productos por estado de publicación"
              />
              <details className="mt-2">
                <summary className="text-xs text-ink-3 cursor-pointer select-none">Ver tabla</summary>
                <DataTable
                  columns={[
                    { key: "name", header: "Estado" },
                    { key: "value", header: "Cantidad" },
                  ]}
                  rows={statusBarData}
                  getKey={(r) => r.name}
                  caption="Productos por estado"
                />
              </details>
            </>
          ) : statsResult.status === "fulfilled" ? (
            <EmptyState />
          ) : (
            <ErrorState source="Seller" />
          )}
        </Card>

        <Card>
          {categoryBarData.length > 0 ? (
            <>
              <BarChartWidget
                data={categoryBarData}
                label="Productos por categoría"
                horizontal
                ariaLabel="Top categorías por número de productos"
              />
              <details className="mt-2">
                <summary className="text-xs text-ink-3 cursor-pointer select-none">Ver tabla</summary>
                <DataTable
                  columns={[
                    { key: "name", header: "Categoría" },
                    { key: "value", header: "Productos" },
                  ]}
                  rows={categoryBarData}
                  getKey={(r) => r.name}
                  caption="Productos por categoría"
                />
              </details>
            </>
          ) : statsResult.status === "fulfilled" ? (
            <EmptyState />
          ) : (
            <ErrorState source="Seller" />
          )}
        </Card>
      </div>

      {/* Catálogo de productos */}
      <Card>
        <p className="text-xs font-mono text-ink-3 uppercase tracking-wide mb-3">
          Catálogo de productos
        </p>
        {productos ? (
          productos.items.length > 0 ? (
            <>
              <DataTable
                columns={productColumns}
                rows={productos.items}
                getKey={(r) => r.product_id}
                caption="Catálogo de productos"
              />
              <Pagination page={page} pageSize={pageSize} total={productos.total} buildHref={buildHref}>
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

function CatalogoSkeleton() {
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
